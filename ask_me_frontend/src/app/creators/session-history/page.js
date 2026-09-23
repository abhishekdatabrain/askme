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
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`border-b sticky top-0 z-30 shrink-0 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E2E8F0] bg-white/95 backdrop-blur-md text-[#0F172A] shadow-sm' : 'border-[#222236] bg-[#0A0A0F]/95 backdrop-blur-md text-white shadow-sm'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
              <History className="h-5 w-5 text-[#EB1000]" /> Session History
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
              View past live broadcast sessions and duration records.
            </p>
          </div>

        </header>

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${theme === 'light' ? 'bg-white border-[#E2E8F0] shadow-slate-200/60' : 'bg-[#12121C]/95 backdrop-blur-xl border-[#222236] shadow-black/80'
            }`}>
            {/* Gradient Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EB1000] via-[#FF5500] to-[#EB1000]" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-current/10">
              <div>
                <h3 className={`font-heading font-black text-xl sm:text-2xl tracking-tight ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                  Past Live Broadcast Sessions
                </h3>
                <p className={`text-xs mt-1 font-medium ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                  History of launched sessions and duration records.
                </p>
              </div>
              <Link
                href="/creators/start-live"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                + Start Live Broadcast
              </Link>
            </div>

            {/* SEARCH & DATE FILTERS BAR */}
            <div className={`p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'
              }`}>
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${theme === 'light' ? 'text-[#64748B]' : 'text-[#EB1000]'
                    }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, category, code..."
                    className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs border outline-none font-medium transition-all duration-200 ${theme === 'light'
                      ? 'bg-white border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                      : 'bg-[#12121C] border-[#222236] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                      }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0B2] hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Date Inputs */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                      <Calendar className="h-3.5 w-3.5 text-[#EB1000]" /> From:
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs border outline-none font-medium transition-all duration-200 ${theme === 'light'
                        ? 'bg-white border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000]'
                        : 'bg-[#12121C] border-[#222236] text-white focus:border-[#EB1000]'
                        }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`px-3 py-2 rounded-xl text-xs border outline-none font-medium transition-all duration-200 ${theme === 'light'
                        ? 'bg-white border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000]'
                        : 'bg-[#12121C] border-[#222236] text-white focus:border-[#EB1000]'
                        }`}
                    />
                  </div>
                </div>

                {/* Search Button & Reset */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white font-black text-xs shadow-md shadow-[#EB1000]/20 hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5" /> Search
                  </button>

                  {isFiltered && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-black text-[#FF3D71] bg-[#FF3D71]/10 border border-[#FF3D71]/30 hover:bg-[#FF3D71]/20 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-8 w-8 text-[#EB1000] animate-spin" />
                <p className="text-xs text-[#A0A0B2] font-semibold">Loading session history...</p>
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'
                      }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`p-3 rounded-xl shrink-0 ${s.status === 'active'
                        ? 'bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/40 shadow-sm'
                        : 'bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/20'
                        }`}>
                        <Radio className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-extrabold text-sm truncate ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                          {s.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-[#A0A0B2] mt-1 flex-wrap">
                          <span className="font-extrabold text-[#EB1000]">{s.category || 'General'}</span>
                          <span>•</span>
                          <span>{s.streamingPlatform || 'YouTube Live'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" /> {new Date(s.createdAt || s.startedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                      {/* VIEW QUESTIONS DEDICATED PAGE LINK */}
                      <Link
                        href={`/creators/session-history/${s.id}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white font-black text-xs shadow-md shadow-[#EB1000]/20 hover:scale-[1.02] transition-all flex items-center gap-1.5"
                      >
                        <span className="flex items-center gap-1">
                          View <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-[11px] text-white/80 font-mono">
                          ({s.questionCount || s.totalDonations || 0})
                        </span>
                      </Link>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.status === 'active'
                        ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                        : theme === 'light' ? 'bg-[#E2E8F0] text-[#64748B]' : 'bg-[#12121C] text-[#A0A0B2] border border-[#222236]'
                        }`}>
                        {s.status || 'closed'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* PAGINATION CONTROLS */}
                {pagination && (
                  <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'light' ? 'border-[#E2E8F0]' : 'border-current/10'
                    }`}>
                    <div className="text-xs text-[#A0A0B2]">
                      Showing Page <span className="font-extrabold text-[#EB1000]">{pagination.page}</span> of{' '}
                      <span className="font-bold">{pagination.totalPages}</span> ({pagination.totalCount} total sessions)
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${pagination.hasPrevPage
                          ? theme === 'light'
                            ? 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
                            : 'bg-[#181826] border-[#2A2A3E] text-white hover:border-[#EB1000]'
                          : 'opacity-40 cursor-not-allowed border-transparent text-[#A0A0B2]'
                          }`}
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer ${pageNum === pagination.page
                              ? 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white shadow-md shadow-[#EB1000]/30'
                              : theme === 'light'
                                ? 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                                : 'bg-[#181826] border border-[#2A2A3E] text-[#A0A0B2] hover:text-white'
                              }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${pagination.hasNextPage
                          ? theme === 'light'
                            ? 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
                            : 'bg-[#181826] border-[#2A2A3E] text-white hover:border-[#EB1000]'
                          : 'opacity-40 cursor-not-allowed border-transparent text-[#A0A0B2]'
                          }`}
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[#A0A0B2] space-y-3">
                <History className="h-10 w-10 mx-auto text-[#EB1000] opacity-50" />
                <p className="font-extrabold text-sm">
                  {isFiltered ? 'No broadcast sessions found matching your search and date criteria.' : 'No past broadcast sessions recorded yet.'}
                </p>
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] font-black text-xs hover:bg-[#EB1000]/20 transition inline-flex items-center gap-1.5 cursor-pointer"
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


