'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import {
  History,
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sun,
  Moon,
  RotateCcw,
  PlayCircle
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function CreatorSessionHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [creator, setCreator] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [relaunchingId, setRelaunchingId] = useState(null);
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

  const fetchSessionHistory = async (uId, token) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${uId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.sessions) {
        setSessions(data.data.sessions);
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
    fetchSessionHistory(u.id, token);
  }, []);

  const handleRelaunchSession = async (sess) => {
    try {
      setRelaunchingId(sess.id);
      const token = getCreatorToken();

      const res = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}/${sess.id}/start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        toast.success(`Session "${sess.title}" restarted! Redirecting to Active Session...`, 'Session Restarted');
        router.push('/creators/active-session');
      } else {
        toast.error(data?.message || 'Failed to restart live session', 'Error');
      }
    } catch (err) {
      toast.error('Network error restarting live session.', 'Error');
    } finally {
      setRelaunchingId(null);
    }
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
              <History className="h-5 w-5 text-[#00F5D4]" /> Session History
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
              View past live broadcast sessions and relaunch them with 1-click.
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
          <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
            theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-[#1C1C26]">
              <div>
                <h3 className={`font-heading font-black text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                  Past Live Broadcast Sessions
                </h3>
                <p className="text-xs text-[#8B8B96]">History of launched sessions and duration records.</p>
              </div>
              <Link
                href="/creators/start-live"
                className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:scale-105 transition"
              >
                + Start Live Broadcast
              </Link>
            </div>

            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-8 w-8 text-[#00F5D4] animate-spin" />
                <p className="text-xs text-[#8B8B96]">Loading session history...</p>
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                      theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-3 rounded-xl shrink-0 ${
                        s.status === 'active'
                          ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                          : 'bg-[#1C1C26] text-[#8B8B96]'
                      }`}>
                        <Radio className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-bold text-sm truncate ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                          {s.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-[#8B8B96] mt-0.5 flex-wrap">
                          <span className="font-semibold text-[#00F5D4]">{s.category || 'General'}</span>
                          <span>•</span>
                          <span>{s.streamingPlatform || 'YouTube Live'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        s.status === 'active'
                          ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                          : 'bg-[#1C1C26] text-[#8B8B96]'
                      }`}>
                        {s.status || 'closed'}
                      </span>

                      <button
                        onClick={() => handleRelaunchSession(s)}
                        disabled={relaunchingId === s.id}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:scale-105 transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {relaunchingId === s.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        Relaunch Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                <History className="h-10 w-10 mx-auto text-[#8B8B96] opacity-50" />
                <p>No past broadcast sessions recorded yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
