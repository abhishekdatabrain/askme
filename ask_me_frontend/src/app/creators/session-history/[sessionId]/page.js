'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  MessageSquare,
  Heart,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Search,
  Calendar,
  RotateCcw,
  X
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function DedicatedSessionQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params?.sessionId;

  const [creator, setCreator] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Theme Sync
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
      setTheme(savedTheme);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('creator-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('creator-theme-changed', handleThemeChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_creator_theme', nextTheme);
      window.dispatchEvent(new Event('creator-theme-changed'));
    }
  };

  const fetchSessionAndQuestions = async (uId, token, search = searchQuery, start = startDate, end = endDate) => {
    try {
      setIsLoading(true);

      // 1. Fetch Session Info
      if (!sessionInfo) {
        const sessRes = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${uId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const sessData = await sessRes.json();
        if (sessRes.ok && sessData.status === 'success' && sessData.data?.sessions) {
          const found = sessData.data.sessions.find(s => String(s.id) === String(sessionId));
          if (found) {
            setSessionInfo(found);
          }
        }
      }

      // 2. Fetch Session Questions from Backend API with filter query params
      let qUrl = `${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}/${sessionId}/questions?page=1&limit=100`;
      if (search && search.trim()) {
        qUrl += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (start) {
        qUrl += `&startDate=${encodeURIComponent(start)}`;
      }
      if (end) {
        qUrl += `&endDate=${encodeURIComponent(end)}`;
      }

      const qRes = await fetch(qUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const qData = await qRes.json();
      if (qRes.ok && qData.status === 'success' && qData.data?.questions) {
        setQuestions(qData.data.questions);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.warn('Session questions fetch error:', err.message);
      setQuestions([]);
    } finally {
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
    if (sessionId) {
      fetchSessionAndQuestions(u.id, token, '', '', '');
    }
  }, [sessionId]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!creator) return;
    const token = getCreatorToken();
    fetchSessionAndQuestions(creator.id, token, searchQuery, startDate, endDate);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    if (creator) {
      const token = getCreatorToken();
      fetchSessionAndQuestions(creator.id, token, '', '', '');
    }
  };

  const isFiltered = searchQuery.trim() !== '' || startDate !== '' || endDate !== '';
  const totalAmount = questions.reduce((acc, q) => acc + (parseFloat(q.amount) || 0), 0);
  const vipCount = questions.filter(q => q.isVip).length;

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER */}
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div className="flex items-center gap-3">
            <Link
              href="/creators/session-history"
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold ${theme === 'light'
                ? 'bg-[#F1F3F5] border-[#E9ECEF] text-[#1A1D20] hover:bg-[#E9ECEF]'
                : 'bg-[#13131A] border-[#1C1C26] text-white hover:border-[#00F5D4]/40'
                }`}
            >
              <ArrowLeft className="h-4 w-4 text-[#00F5D4]" />
              <span>Back to Session History</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2FFF]" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <CreatorNotificationDropdown theme={theme} />
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">

          {/* SESSION DETAILS BANNER */}
          <div className={`p-6 rounded-3xl border space-y-5 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-[#1C1C26]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-[10px] font-black uppercase">
                    SESSION QUESTIONS RECORD
                  </span>
                </div>
                <h2 className={`font-heading font-black text-xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                  {sessionInfo?.title || `Session #${sessionId} Questions`}
                </h2>
                <p className="text-xs text-[#8B8B96] flex items-center gap-2">
                  <strong className="text-[#00F5D4]">{sessionInfo?.category || 'General'}</strong>
                  <span>•</span>
                  <span>Platform: {sessionInfo?.streamingPlatform || 'YouTube Live'}</span>
                </p>
              </div>

              {/* STATS SUMMARY BAR */}
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border text-center ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}>
                  <span className="text-[10px] font-black text-[#8B8B96] uppercase tracking-wider block">Questions</span>
                  <span className="font-heading font-black text-base text-[#00F5D4]">{questions.length}</span>
                </div>

                <div className={`p-3 rounded-2xl border text-center ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}>
                  <span className="text-[10px] font-black text-[#8B8B96] uppercase tracking-wider block">Raised</span>
                  <span className="font-heading font-black text-base text-[#00E676]">₹{totalAmount.toFixed(2)}</span>
                </div>

                {vipCount > 0 && (
                  <div className="p-3 rounded-2xl bg-[#1C1805] border border-[#FFD60A]/50 text-center">
                    <span className="text-[10px] font-black text-[#FFD60A] uppercase tracking-wider block">VIP</span>
                    <span className="font-heading font-black text-base text-[#FFD60A]">{vipCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SEARCH & DATE FILTERS BAR */}
            <div className={`p-4 rounded-2xl border ${
              theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
            }`}>
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by viewer name or question message..."
                    className={`w-full pl-10 pr-9 py-2 rounded-xl text-xs border transition focus:outline-none focus:border-[#00F5D4] ${
                      theme === 'light'
                        ? 'bg-white border-[#DEE2E6] text-[#1A1D20] placeholder-[#959EAD]'
                        : 'bg-[#13131A] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B96] hover:text-white p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Date Inputs */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#8B8B96] flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#00F5D4]" /> From:
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-[#00F5D4] ${
                        theme === 'light'
                          ? 'bg-white border-[#DEE2E6] text-[#1A1D20]'
                          : 'bg-[#13131A] border-[#1C1C26] text-white'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#8B8B96]">To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-[#00F5D4] ${
                        theme === 'light'
                          ? 'bg-white border-[#DEE2E6] text-[#1A1D20]'
                          : 'bg-[#13131A] border-[#1C1C26] text-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Search Button & Reset */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:scale-105 transition flex items-center gap-1.5"
                  >
                    <Search className="h-3.5 w-3.5" /> Search
                  </button>

                  {isFiltered && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-[#FF5252] bg-[#FF5252]/10 border border-[#FF5252]/20 hover:bg-[#FF5252]/20 transition flex items-center gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* QUESTIONS LIST */}
            <div className="pt-2 space-y-4">
              <h3 className={`font-heading font-extrabold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                <MessageSquare className="h-5 w-5 text-[#00F5D4]" />
                Viewer Questions ({questions.length})
              </h3>

              {isLoading ? (
                <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                  <RefreshCw className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto text-[#00F5D4]" />
                  <p>Loading session questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className={`p-12 rounded-2xl border text-center space-y-3 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}>
                  <MessageSquare className="h-10 w-10 mx-auto text-[#8B8B96] opacity-40" />
                  <h4 className="font-bold text-white text-sm">
                    {isFiltered ? 'No Questions Match Filters' : 'No Questions Recorded'}
                  </h4>
                  <p className="text-xs text-[#8B8B96]">
                    {isFiltered ? 'Try clearing your search query or date range.' : 'No viewer questions were recorded for this session.'}
                  </p>
                  {isFiltered && (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] font-bold text-xs hover:bg-[#00F5D4]/20 transition inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-2xl border space-y-3 shadow-md ${q.isVip
                      ? 'bg-[#1C1805] border-2 border-[#FFD60A]/80 shadow-xl glow-gold'
                      : theme === 'light'
                        ? 'bg-[#F8F9FA] border-[#E9ECEF]'
                        : 'bg-[#0A0A0F] border-[#1C1C26]'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-[#1C1C26]">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="p-2 rounded-xl bg-[#00E676]/10 text-[#00E676]">
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">
                            <strong className="text-[#00F5D4]">{q.viewerName}</strong>
                          </h4>
                        </div>

                        {q.isVip && (
                          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD60A] to-[#FF9500] text-[#0A0A0F] text-[10px] font-black uppercase flex items-center gap-1 shadow-md">
                            ⚡ VIP PRIORITY
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-heading font-black text-base text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-xl border border-[#00E676]/30">
                          ₹{parseFloat(q.amount || 0).toFixed(2)}
                        </span>
                        <span className="text-xs font-mono text-[#8B8B96]">
                          {q.paidAt && !isNaN(new Date(q.paidAt).getTime())
                            ? new Date(q.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                            : ''}
                        </span>
                      </div>
                    </div>

                    {q.message && (
                      <div className="pt-1">
                        <span className="text-xs font-extrabold text-[#8B8B96] block mb-1">
                          Viewer Question / Message:
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
                      <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${q.status === 'read'
                        ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                        : q.status === 'cancelled'
                          ? 'bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30'
                          : 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30'
                        }`}>
                        {q.status === 'read' ? '✓ Accepted & Answered' : (q.status === 'cancelled' ? '✕ Cancelled' : '● Pending Queue')}
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

