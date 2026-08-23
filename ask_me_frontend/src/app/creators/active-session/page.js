'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import {
  Radio,
  Copy,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Clock,
  StopCircle,
  MessageSquare,
  Sparkles,
  QrCode
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function CreatorActiveSessionPage() {
  const { toast } = useToast();
  const [creator, setCreator] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [theme, setTheme] = useState('dark');

  // Theme Sync
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_creator_theme', nextTheme);
      window.dispatchEvent(new Event('creator-theme-changed'));
    }
  };

  const fetchActiveSession = async (uId, token) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${uId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.sessions) {
        const active = data.data.sessions.find(s => s.status === 'active');
        if (active) {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          setActiveSession({
            ...active,
            paymentLink: active.paymentLink || `${origin}/pay/${active.sessionCode}?creatorId=${uId}&sessionId=${active.id}`,
            qrCodeUrl: active.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(active.paymentLink || `${origin}/pay/${active.sessionCode}`)}`,
            overlayUrl: active.overlayUrl || `${origin}/overlay/${creator?.username || uId}?sessionCode=${active.sessionCode}`,
          });
        } else {
          setActiveSession(null);
        }
      }
    } catch (err) { }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }
    setCreator(u);
    fetchActiveSession(u.id, token);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!activeSession) {
      setTimeRemaining('');
      return;
    }

    const durationMs = (Number(activeSession.durationHours) || 2) * 3600 * 1000;
    const endTime = activeSession.endsAt
      ? new Date(activeSession.endsAt).getTime()
      : new Date(activeSession.startedAt || activeSession.createdAt || Date.now()).getTime() + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeRemaining('00h 00m 00s (Expired)');
        handleEndSession();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [activeSession]);

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      const token = getCreatorToken();
      await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}/${activeSession.id}/close`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSession(null);
      toast.info('Live Broadcast Session ended.', 'Session Ended');
    } catch (err) {
      setActiveSession(null);
    }
  };

  const copyText = (text, title = 'Copied!') => {
    navigator.clipboard.writeText(text);
    toast.success(`${title} copied to clipboard!`, 'Copied!');
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#F5F5F7]'
    }`}>
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${
          theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
        }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
              <Radio className="h-5 w-5 text-[#00F5D4]" /> Active Broadcast Session
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
              Monitor your current live stream session, UPI QR code & OBS overlay URLs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2FFF]" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <CreatorNotificationDropdown theme={theme} />
          </div>
        </header>

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 text-[#00F5D4] animate-spin" />
              <p className="text-xs text-[#8B8B96]">Loading active live session...</p>
            </div>
          ) : activeSession ? (
            <div className={`p-6 rounded-3xl border space-y-6 shadow-2xl glow-teal animate-fade-in ${
              theme === 'light' ? 'bg-white border-[#00F5D4]/60' : 'bg-[#13131A] border-[#00F5D4]/40'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-[#1C1C26]">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 animate-pulse">
                    <Radio className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                        ● CURRENTLY BROADCASTING LIVE
                      </span>
                      {timeRemaining && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] text-[10px] font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3 animate-spin" /> Timer: {timeRemaining}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-heading font-black text-2xl mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                      {activeSession.title}
                    </h3>
                  </div>
                </div>

                <button onClick={handleEndSession} className="px-5 py-2.5 rounded-xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 hover:bg-[#FF3D71]/20 font-bold text-xs flex items-center gap-1.5 shrink-0 transition">
                  <StopCircle className="h-4 w-4" /> End Live Session
                </button>
              </div>

              {/* Generated Outputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR & Payment Link */}
                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                  <img src={activeSession.qrCodeUrl} alt="QR Code" className="h-28 w-28 rounded-xl bg-white p-1 shrink-0 border border-[#00F5D4]/40 shadow-md" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#00F5D4] uppercase tracking-wider">Instant UPI Payment Link & QR</span>
                    <p className="text-xs font-mono truncate">{activeSession.paymentLink}</p>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => copyText(activeSession.paymentLink, 'Payment Link')} className="px-3.5 py-1.5 rounded-lg bg-[#00F5D4] text-[#0A0A0F] font-bold text-[11px] shadow-sm hover:scale-105 transition">
                        <Copy className="h-3.5 w-3.5 inline mr-1" /> Copy Link
                      </button>
                      <a href={activeSession.paymentLink} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 rounded-lg bg-[#1C1C26] text-white text-[11px] border border-[#252533] hover:border-[#00F5D4] transition">
                        Test Link <ExternalLink className="h-3.5 w-3.5 inline text-[#00F5D4]" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* OBS Overlay */}
                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                  <div className="h-28 w-28 rounded-xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 flex flex-col items-center justify-center text-[#7B2FFF] shrink-0">
                    <Monitor className="h-8 w-8" />
                    <span className="text-[9px] font-black mt-1 uppercase">OBS Source</span>
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#7B2FFF] uppercase tracking-wider">OBS Overlay Browser Source URL</span>
                    <p className="text-xs font-mono truncate text-[#7B2FFF]">{activeSession.overlayUrl}</p>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => copyText(activeSession.overlayUrl, 'OBS Overlay URL')} className="px-3.5 py-1.5 rounded-lg bg-[#7B2FFF] text-white font-bold text-[11px] shadow-sm hover:scale-105 transition">
                        <Copy className="h-3.5 w-3.5 inline mr-1" /> Copy Overlay
                      </button>
                      <a href={activeSession.overlayUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 rounded-lg bg-[#1C1C26] text-white text-[11px] border border-[#252533] hover:border-[#7B2FFF] transition">
                        Preview <ExternalLink className="h-3.5 w-3.5 inline text-[#7B2FFF]" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-12 rounded-3xl border text-center space-y-4 shadow-xl ${
              theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
              <div className="h-16 w-16 mx-auto rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] flex items-center justify-center border border-[#00F5D4]/30">
                <Radio className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className={`font-heading font-black text-xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                  No Active Broadcast Session
                </h3>
                <p className="text-xs text-[#8B8B96]">
                  You currently have no active live session running. Click below to launch a new broadcast session.
                </p>
              </div>
              <Link
                href="/creators/start-live"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-lg glow-teal hover:scale-105 transition"
              >
                <Radio className="h-4 w-4" /> Start New Live Broadcast
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
