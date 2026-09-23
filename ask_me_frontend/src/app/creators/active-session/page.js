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
  QrCode,
  Download
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import BrandedQrCode from '@/components/BrandedQrCode';
import { downloadBrandedQrCard } from '@/utils/downloadBrandedQrCard';

export default function CreatorActiveSessionPage() {
  const { toast } = useToast();
  const [creator, setCreator] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [theme, setTheme] = useState('dark');

  const downloadQrCode = async () => {
    if (!activeSession) return;
    const cName = creator?.fullName || creator?.full_name || creator?.username || activeSession.title || 'Creator';
    const success = await downloadBrandedQrCard({
      qrUrl: activeSession.qrCodeUrl,
      creatorName: cName,
      title: activeSession.title,
      sessionCode: activeSession.sessionCode || 'askme',
      filename: `askme_live_qr_${activeSession.sessionCode || 'code'}.png`,
    });
    if (success) {
      toast.success('Branded Live QR Card downloaded successfully!', 'Downloaded');
    } else {
      toast.error('Failed to download QR Card.', 'Download Error');
    }
  };

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
            qrCodeUrl: active.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=2&data=${encodeURIComponent(active.paymentLink || `${origin}/pay/${active.sessionCode}`)}`,
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

    const startedTime = activeSession.startedAt
      ? new Date(activeSession.startedAt).getTime()
      : (activeSession.createdAt ? new Date(activeSession.createdAt).getTime() : Date.now());
    const qrEndTime = activeSession.qrExpiresAt
      ? new Date(activeSession.qrExpiresAt).getTime()
      : startedTime + 3 * 3600 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = qrEndTime - now;

      if (diff <= 0) {
        setTimeRemaining('QR Expired (Stream Active)');
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
    <>
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`border-b sticky top-0 z-30 shrink-0 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E2E8F0] bg-white/95 backdrop-blur-md text-[#0F172A] shadow-sm' : 'border-[#222236] bg-[#0A0A0F]/95 backdrop-blur-md text-white shadow-sm'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
              <Radio className="h-5 w-5 text-[#EB1000]" /> Active Broadcast Session
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
              Monitor your current live stream session, UPI QR code & OBS overlay URLs.
            </p>
          </div>

        </header>

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 text-[#EB1000] animate-spin" />
              <p className="text-xs text-[#A0A0B2] font-semibold">Loading active live session...</p>
            </div>
          ) : activeSession ? (
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${theme === 'light' ? 'bg-white border-[#E2E8F0] shadow-slate-200/60' : 'bg-[#12121C]/95 backdrop-blur-xl border-[#222236] shadow-black/80'
              }`}>
              {/* Gradient Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EB1000] via-[#FF5500] to-[#EB1000]" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-current/10">
                <div className="flex items-center gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 shrink-0">
                    <Radio className="h-7 w-7 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-[#00E676] animate-pulse" />
                        CURRENTLY BROADCASTING LIVE
                      </span>
                      {timeRemaining && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${timeRemaining.includes('Expired')
                          ? 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/40'
                          : 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/30'
                          }`}>
                          <Clock className="h-3 w-3" /> QR Expiry: {timeRemaining}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-heading font-black text-2xl sm:text-3xl tracking-tight mt-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                      {activeSession.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={handleEndSession}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white font-black text-xs shadow-lg shadow-[#EB1000]/30 hover:opacity-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <StopCircle className="h-4 w-4" /> End Live Session
                </button>
              </div>

              {/* Generated Outputs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* QR & Payment Link Card */}
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'}`}>
                  <BrandedQrCode qrUrl={activeSession.qrCodeUrl} size="md" showBrandHeader={false} />
                  <div className="space-y-2 min-w-0 flex-1 w-full text-center sm:text-left">
                    <span className="text-[10px] font-black text-[#EB1000] uppercase tracking-wider block">Instant UPI Payment Link & QR</span>
                    <p className={`text-xs font-mono truncate px-3 py-2 rounded-xl border ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#12121C] border-[#222236] text-white'}`}>
                      {activeSession.paymentLink}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        onClick={() => copyText(activeSession.paymentLink, 'Payment Link')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white font-black text-xs shadow-md shadow-[#EB1000]/20 hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy Link
                      </button>
                      <button
                        onClick={downloadQrCode}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition flex items-center gap-1.5 cursor-pointer ${theme === 'light' ? 'bg-white text-[#EB1000] border-[#EB1000]/40 hover:bg-[#EB1000]/10' : 'bg-[#12121C] text-[#EB1000] border-[#EB1000]/40 hover:bg-[#EB1000]/20'}`}
                      >
                        <Download className="h-3.5 w-3.5" /> Download QR
                      </button>
                      <a
                        href={activeSession.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${theme === 'light' ? 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]' : 'bg-[#12121C] text-[#A0A0B2] border-[#222236] hover:text-white'}`}
                      >
                        Test Link <ExternalLink className="h-3.5 w-3.5 text-[#EB1000]" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* OBS Overlay Card */}
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'}`}>
                  <div className="h-32 w-32 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 flex flex-col items-center justify-center text-[#EB1000] shrink-0 shadow-sm">
                    <Monitor className="h-8 w-8" />
                    <span className="text-[9px] font-black mt-1.5 uppercase tracking-wider">OBS Source</span>
                  </div>
                  <div className="space-y-2 min-w-0 flex-1 w-full text-center sm:text-left">
                    <span className="text-[10px] font-black text-[#EB1000] uppercase tracking-wider block">OBS Overlay Browser Source URL</span>
                    <p className={`text-xs font-mono truncate px-3 py-2 rounded-xl border ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#12121C] border-[#222236] text-white'}`}>
                      {activeSession.overlayUrl}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        onClick={() => copyText(activeSession.overlayUrl, 'OBS Overlay URL')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white font-black text-xs shadow-md shadow-[#EB1000]/20 hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy Overlay
                      </button>
                      <a
                        href={activeSession.overlayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${theme === 'light' ? 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]' : 'bg-[#12121C] text-[#A0A0B2] border-[#222236] hover:text-white'}`}
                      >
                        Preview <ExternalLink className="h-3.5 w-3.5 text-[#EB1000]" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-12 rounded-3xl border text-center space-y-4 shadow-xl ${theme === 'light' ? 'bg-white border-[#E2E8F0]' : 'bg-[#12121C] border-[#222236]'
              }`}>
              <div className="h-16 w-16 mx-auto rounded-2xl bg-[#EB1000]/10 text-[#EB1000] flex items-center justify-center border border-[#EB1000]/30">
                <Radio className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className={`font-heading font-black text-xl ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                  No Active Broadcast Session
                </h3>
                <p className={`text-xs ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                  You currently have no active live session running. Click below to launch a new broadcast session.
                </p>
              </div>
              <Link
                href="/creators/start-live"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all"
              >
                <Radio className="h-4 w-4" /> Start New Live Broadcast
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
