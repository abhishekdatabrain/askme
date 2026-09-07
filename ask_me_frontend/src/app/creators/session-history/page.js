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
  PlayCircle,
  MessageSquare,
  ArrowRight,
  X,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  RotateCcw
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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Session Questions Modal State
  const [selectedSessionModal, setSelectedSessionModal] = useState(null);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

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

  const fetchSessionHistory = async (uId, token, targetPage = 1, search = searchQuery, start = startDate, end = endDate) => {
    try {
      setIsLoading(true);
      let url = `${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${uId}&page=${targetPage}&limit=10`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (start) {
        url += `&startDate=${encodeURIComponent(start)}`;
      }
      if (end) {
        url += `&endDate=${encodeURIComponent(end)}`;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.sessions) {
        setSessions(data.data.sessions);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
          setPage(data.data.pagination.page);
        }
      } else {
        setSessions([]);
        setPagination(null);
      }
    } catch (err) {
      setSessions([]);
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
    fetchSessionHistory(u.id, token, 1, '', '', '');
  }, []);

  const handlePageChange = (newPage) => {
    if (!creator || !pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const token = getCreatorToken();
    fetchSessionHistory(creator.id, token, newPage, searchQuery, startDate, endDate);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!creator) return;
    const token = getCreatorToken();
    fetchSessionHistory(creator.id, token, 1, searchQuery, startDate, endDate);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    if (creator) {
      const token = getCreatorToken();
      fetchSessionHistory(creator.id, token, 1, '', '', '');
    }
  };

  const isFiltered = searchQuery.trim() !== '' || startDate !== '' || endDate !== '';

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
              <History className="h-5 w-5 text-[#00F5D4]" /> Session History
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
              View past live broadcast sessions and duration records.
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
          <div className={`p-6 rounded-3xl border space-y-5 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
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
                    placeholder="Search by title, category, code..."
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
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                      }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-3 rounded-xl shrink-0 ${s.status === 'active'
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
                            <Clock className="h-3 w-3" /> {new Date(s.createdAt || s.startedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                      {/* VIEW QUESTIONS DEDICATED PAGE LINK */}
                      <Link
                        href={`/creators/session-history/${s.id}`}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 glow-purple ${theme === 'light'
                            ? 'bg-[#7B2FFF]/10 border-[#7B2FFF]/30 text-[#7B2FFF] hover:bg-[#7B2FFF]/20'
                            : 'bg-[#1C1A2E] border-[#7B2FFF]/40 text-[#00F5D4] hover:bg-[#2A244D]'
                          }`}
                      >
                        <span className="font-extrabold flex items-center gap-1">
                          View <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-[11px] text-[#8B8B96] font-mono">
                          ({s.questionCount || s.totalDonations || 0} Questions)
                        </span>
                      </Link>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.status === 'active'
                          ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                          : 'bg-[#1C1C26] text-[#8B8B96]'
                        }`}>
                        {s.status || 'closed'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* PAGINATION CONTROLS */}
                {pagination && (
                  <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                    }`}>
                    <div className="text-xs text-[#8B8B96]">
                      Showing Page <span className="font-bold text-[#00F5D4]">{pagination.page}</span> of{' '}
                      <span className="font-bold">{pagination.totalPages}</span> ({pagination.totalCount} total sessions)
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${pagination.hasPrevPage
                            ? theme === 'light'
                              ? 'bg-white border-[#E9ECEF] text-[#1A1D20] hover:bg-[#F8F9FA]'
                              : 'bg-[#0A0A0F] border-[#1C1C26] text-white hover:border-[#00F5D4]/50'
                            : 'opacity-40 cursor-not-allowed border-transparent text-[#8B8B96]'
                          }`}
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition ${pageNum === pagination.page
                                ? 'bg-brand-gradient text-[#0A0A0F] shadow-md glow-teal'
                                : theme === 'light'
                                  ? 'bg-white border border-[#E9ECEF] text-[#6C757D] hover:bg-[#F8F9FA]'
                                  : 'bg-[#0A0A0F] border border-[#1C1C26] text-[#8B8B96] hover:text-white'
                              }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${pagination.hasNextPage
                            ? theme === 'light'
                              ? 'bg-white border-[#E9ECEF] text-[#1A1D20] hover:bg-[#F8F9FA]'
                              : 'bg-[#0A0A0F] border-[#1C1C26] text-white hover:border-[#00F5D4]/50'
                            : 'opacity-40 cursor-not-allowed border-transparent text-[#8B8B96]'
                          }`}
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[#8B8B96] space-y-3">
                <History className="h-10 w-10 mx-auto text-[#8B8B96] opacity-50" />
                <p className="font-semibold text-sm">
                  {isFiltered ? 'No broadcast sessions found matching your search and date criteria.' : 'No past broadcast sessions recorded yet.'}
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
            )}
          </div>
        </main>
      </div>
    </>
  );
}


