'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ViewerSidebar from '@/components/ViewerSidebar';
import { getViewerToken, getViewerUser } from '@/utils/cookies';
import { API_ENDPOINTS } from '@/config/api';
import {
  MessageSquare,
  RefreshCw,
  Sun,
  Moon,
  ArrowLeft,
  Clock,
  Tv,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Radio
} from 'lucide-react';

export default function ViewerSessionQuestionsPage() {
  const params = useParams();
  const sessionId = params?.sessionId;

  const [questions, setQuestions] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Theme Sync
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_viewer_theme', nextTheme);
      window.dispatchEvent(new Event('viewer-theme-changed'));
    }
  };

  const fetchSessionQuestions = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const u = getViewerUser();
      const token = getViewerToken();

      const url = `${API_ENDPOINTS.VIEWERS.MY_QUESTIONS}?sessionId=${sessionId}&userId=${u?.id || ''}&email=${encodeURIComponent(u?.email || '')}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.questions) {
        setQuestions(data.data.questions);
        if (data.data.questions.length > 0) {
          setSessionInfo({
            creatorName: data.data.questions[0].creatorName,
            creatorAvatar: data.data.questions[0].creatorAvatar,
            sessionTitle: data.data.questions[0].sessionTitle,
            sessionCode: data.data.questions[0].sessionCode,
          });
        }
      }
    } catch (err) {
      console.warn('Fetch session questions error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionQuestions();
  }, [sessionId]);

  const formatAskedAt = (paidAt) => {
    if (!paidAt) return '';
    const d = new Date(paidAt);
    if (isNaN(d.getTime())) return '';
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `Asked on ${dateStr} at ${timeStr}`;
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#F5F5F7]'
      }`}>
      <ViewerSidebar theme={theme} onToggleTheme={toggleTheme} currentTab="past-streams" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER */}
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div className="flex items-center gap-4">
            <Link
              href="/viewers/past-streams"
              className="p-2 rounded-xl border border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Past Streams
            </Link>
            <div>
              <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                <MessageSquare className="h-5 w-5 text-[#00F5D4]" /> Session Questions History ({questions.length})
              </h1>
              <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                Questions submitted by you during this broadcast session.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2FFF]" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          {sessionInfo && (
            <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
              }`}>
              <div className="flex items-center gap-3.5">
                <img
                  src={sessionInfo.creatorAvatar}
                  alt={sessionInfo.creatorName}
                  className="h-12 w-12 rounded-full border-2 border-[#00F5D4]/40 object-cover shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {sessionInfo.creatorName}
                  </h3>
                  <p className="text-xs text-[#8B8B96] flex items-center gap-1 mt-0.5">
                    <Tv className="h-3.5 w-3.5 text-[#00F5D4]" /> {sessionInfo.sessionTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 text-[#8B8B96] text-[10px] font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> ENDED SESSION
                </span>
              </div>
            </div>
          )}

          {/* QUESTIONS LIST */}
          <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
            <h3 className={`font-heading font-extrabold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
              <Radio className="h-5 w-5 text-[#FF5500]" />
              Questions Asked in This Session
            </h3>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                <RefreshCw className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto text-[#00F5D4]" />
                <p>Loading session questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className={`p-12 rounded-2xl border text-center space-y-3 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                }`}>
                <HelpCircle className="h-10 w-10 mx-auto text-[#8B8B96] opacity-40" />
                <h4 className="font-bold text-white text-sm">No Questions Found for This Session</h4>
                <p className="text-xs text-[#8B8B96] max-w-md mx-auto">
                  You haven't submitted any questions during this broadcast session.
                </p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className={`p-5 rounded-2xl border space-y-3 shadow-md transition ${q.isVip
                      ? 'bg-[#1C1805] border-2 border-[#FFD60A]/80 shadow-xl glow-gold'
                      : theme === 'light'
                        ? 'bg-[#F8F9FA] border-[#E9ECEF]'
                        : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}
                >
                  <div className="flex items-center justify-between gap-3 border-b pb-3 border-[#1C1C26]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">Question #{idx + 1}</span>
                      {q.isVip && (
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#FF9500] text-[#0A0A0F] text-[10px] font-black uppercase flex items-center gap-1 shadow-md">
                          ⚡ VIP PRIORITY
                        </span>
                      )}
                    </div>

                    <span className="font-heading font-black text-base text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-xl border border-[#00E676]/30">
                      ₹{q.amount?.toFixed(2) || q.amount}
                    </span>
                  </div>

                  {q.message && (
                    <div className="pt-1">
                      <span className="text-xs font-extrabold text-[#8B8B96] block mb-1">
                        Submitted Question / Message:
                      </span>
                      <p className={`p-3 rounded-2xl text-xs italic border font-medium ${q.isVip
                          ? 'bg-[#0A0A0F] text-[#FFD60A] border-[#FFD60A]/40'
                          : theme === 'light'
                            ? 'bg-white border-[#E9ECEF] text-[#00B49F]'
                            : 'bg-[#13131A] text-[#00F5D4] border-[#1C1C26]'
                        }`}>
                        "{q.isVip ? '⚡ VIP FAST-TRACK: ' : ''}{q.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-xs text-[#8B8B96] font-medium flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#00F5D4]" />
                      {formatAskedAt(q.paidAt)}
                    </span>

                    <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${q.status === 'read'
                        ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                        : q.status === 'cancelled'
                          ? 'bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30'
                          : 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30'
                      }`}>
                      {q.status === 'read' ? '✓ Answered' : (q.status === 'cancelled' ? '✕ Cancelled' : '● unread')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
