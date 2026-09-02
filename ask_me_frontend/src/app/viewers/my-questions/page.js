'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ViewerSidebar from '@/components/ViewerSidebar';
import { useToast } from '@/context/ToastContext';
import { getViewerToken, getViewerUser } from '@/utils/cookies';
import { API_ENDPOINTS } from '@/config/api';
import {
  MessageSquare,
  RefreshCw,
  Sun,
  Moon,
  Heart,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Radio,
  Tv,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function ViewerMyQuestionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [viewer, setViewer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Auth Guard Check
  useEffect(() => {
    const token = getViewerToken();
    const u = getViewerUser();
    if (!token && !u) {
      router.replace('/viewers/login');
    }
  }, [router]);

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

  const fetchViewerQuestions = async (uId, email, token) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_ENDPOINTS.VIEWERS.MY_QUESTIONS}?userId=${uId || ''}&email=${encodeURIComponent(email || '')}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.questions) {
        setQuestions(data.data.questions);
      }
    } catch (err) {
      console.warn('Fetch viewer questions error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getViewerToken();
    const u = getViewerUser();
    if (u) {
      setViewer(u);
    }
    fetchViewerQuestions(u?.id, u?.email, token);
  }, []);

  const totalSpent = questions.reduce((acc, q) => acc + (parseFloat(q.amount) || 0), 0);
  const answeredCount = questions.filter(q => q.status === 'read').length;

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER */}
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
              <MessageSquare className="h-5 w-5 text-[#FF5500]" /> My Asked Questions ({questions.length})
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
              Track all your live questions, super-chats, and broadcast answer status.
            </p>
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
          {/* QUESTIONS LIST CONTAINER */}
          <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>

            {/* QUESTIONS LIST */}
            <div className="pt-2 space-y-4">
              <h3 className={`font-heading font-extrabold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                <Radio className="h-5 w-5 text-[#FF5500]" />
                Live Broadcast Question History
              </h3>

              {isLoading ? (
                <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                  <RefreshCw className="h-8 w-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin mx-auto text-[#FF5500]" />
                  <p>Loading your questions history...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className={`p-12 rounded-2xl border text-center space-y-3 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}>
                  <MessageSquare className="h-10 w-10 mx-auto text-[#8B8B96] opacity-40" />
                  <h4 className="font-bold text-white text-sm">No Questions Asked Yet</h4>
                  <p className="text-xs text-[#8B8B96] max-w-md mx-auto">
                    Join any creator's live broadcast session to ask questions, send super-chats, and get highlighted!
                  </p>
                  <Link
                    href="/viewers/live-sessions"
                    className="inline-block px-5 py-2.5 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:scale-105 transition"
                  >
                    Browse Live Sessions →
                  </Link>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-[#1C1C26]">
                      <div className="flex items-center gap-3">
                        <img
                          src={q.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={q.creatorName}
                          className="h-10 w-10 rounded-full border border-[#00F5D4]/40 object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                            {q.creatorName}
                          </h4>
                          <p className="text-xs text-[#8B8B96] flex items-center gap-1">
                            <Tv className="h-3 w-3 text-[#00F5D4]" /> {q.sessionTitle}
                          </p>
                        </div>

                        {q.isVip && (
                          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#FF9500] text-[#0A0A0F] text-[10px] font-black uppercase flex items-center gap-1 shadow-md ml-2">
                            ⚡ VIP PRIORITY
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-heading font-black text-base text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-xl border border-[#00E676]/30">
                          ₹{q.amount?.toFixed(2) || q.amount}
                        </span>
                      </div>
                    </div>

                    {q.message && (
                      <div className="pt-1">
                        <span className="text-xs font-extrabold text-[#8B8B96] block mb-1">
                          My Submitted Question:
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
                        {q.paidAt && !isNaN(new Date(q.paidAt).getTime())
                          ? `Asked on ${new Date(q.paidAt).getMonth() + 1}/${new Date(q.paidAt).getDate()}/${new Date(q.paidAt).getFullYear()} at ${new Date(q.paidAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                          : ''}
                      </span>
                      <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${q.status === 'read'
                        ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                        : q.status === 'cancelled'
                          ? 'bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30'
                          : 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30'
                        }`}>
                        {q.status === 'read' ? '✓ Answered on Broadcast' : (q.status === 'cancelled' ? '✕ Cancelled' : '● In Creator Queue')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
