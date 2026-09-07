'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { getViewerToken, getViewerUser } from '@/utils/cookies';
import { API_ENDPOINTS } from '@/config/api';
import {
  History,
  RefreshCw,
  Sun,
  Moon,
  Search,
  MessageSquare,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';

export default function ViewerPastStreamsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [theme, setTheme] = useState('dark');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const searchDebounceRef = useRef(null);
  const topListRef = useRef(null);

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

  const fetchPastStreams = useCallback(async (targetPage = currentPage, searchVal = activeSearch) => {
    try {
      setIsLoading(true);
      const u = getViewerUser();
      const token = getViewerToken();

      const url = new URL(API_ENDPOINTS.VIEWERS.PUBLIC_PAST_STREAMS);
      if (u?.id) url.searchParams.set('userId', u.id);
      if (u?.email) url.searchParams.set('email', u.email);
      if (searchVal && searchVal.trim()) url.searchParams.set('search', searchVal.trim());
      url.searchParams.set('page', targetPage.toString());
      url.searchParams.set('limit', limit.toString());

      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();

      if (res.ok && data.status === 'success' && data.data) {
        const fetchedSessions = data.data.sessions || [];
        setSessions(fetchedSessions);

        if (data.data.pagination) {
          setPagination(data.data.pagination);
        } else {
          const totalCount = data.data.totalSessions || fetchedSessions.length;
          const totalPages = Math.ceil(totalCount / limit) || 1;
          setPagination({
            page: targetPage,
            limit,
            total: totalCount,
            totalPages,
            hasNextPage: targetPage < totalPages,
            hasPrevPage: targetPage > 1,
          });
        }
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.warn('Fetch past streams error:', err.message);
      toast?.error?.('Unable to load past broadcast sessions');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeSearch, limit, toast]);

  // Initial and reactive load when activeSearch or page changes
  useEffect(() => {
    fetchPastStreams(currentPage, activeSearch);
  }, [currentPage, activeSearch, fetchPastStreams]);

  // Handle Search Input Change with Debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setActiveSearch(val);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setActiveSearch(searchQuery);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      topListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper for rendering pagination page numbers
  const renderPageNumbers = () => {
    const totalPages = pagination.totalPages || 1;
    const current = pagination.page || currentPage;
    const pages = [];

    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(totalPages, current + 2);

    if (current <= 3) {
      endPage = Math.min(totalPages, 5);
    }
    if (current >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total || sessions.length);

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto" ref={topListRef}>
        {/* HEADER */}
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${
          theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
        }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
              <History className="h-5 w-5 text-[#00F5D4]" /> Watched Past Streams ({pagination.total ?? sessions.length})
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
              Past broadcast streams and live Q&A sessions where you asked questions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchPastStreams(currentPage, activeSearch)}
              disabled={isLoading}
              title="Refresh past streams"
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
                theme === 'light'
                  ? 'border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#495057]'
                  : 'border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#00F5D4]' : ''}`} />
            </button>

            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                theme === 'light' ? 'border-[#E9ECEF] bg-white text-[#1A1D20]' : 'border-[#1C1C26] bg-[#13131A] text-white'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2FFF]" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* SEARCH BAR */}
          <div className={`p-4 rounded-3xl border space-y-4 shadow-xl transition ${
            theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
          }`}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B96]" />
              <input
                type="text"
                placeholder="Search past streams by title or creator..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs font-medium border outline-none transition ${
                  theme === 'light'
                    ? 'bg-[#F8F9FA] border-[#E9ECEF] text-[#1A1D20] focus:border-[#00F5D4] focus:ring-1 focus:ring-[#00F5D4]'
                    : 'bg-[#0A0A0F] border-[#1C1C26] text-white focus:border-[#00F5D4] focus:ring-1 focus:ring-[#00F5D4]'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B8B96] hover:text-white transition p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* PAST STREAMS SINGLE ROW LIST */}
          {isLoading ? (
            <div className="p-16 text-center text-xs text-[#8B8B96] space-y-3">
              <RefreshCw className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto text-[#00F5D4]" />
              <p className="font-medium">Searching and loading past broadcast streams...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className={`p-16 rounded-3xl border text-center space-y-3 ${
              theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
              <History className="h-12 w-12 mx-auto text-[#8B8B96] opacity-40" />
              <h3 className={`font-bold text-base ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                {activeSearch ? 'No Matching Past Streams Found' : 'No Watched Past Streams Found'}
              </h3>
              <p className={`text-xs max-w-md mx-auto ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                {activeSearch
                  ? `No past broadcasts match your search "${activeSearch}". Try another keyword.`
                  : "You haven't participated or asked questions in any live broadcast sessions yet."}
              </p>

              {activeSearch ? (
                <button
                  onClick={clearSearch}
                  className="inline-block px-5 py-2.5 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 font-bold text-xs hover:bg-[#00F5D4]/20 transition"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  href="/viewers/live-sessions"
                  className="inline-block px-5 py-2.5 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:scale-105 transition"
                >
                  Browse Live Sessions →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md transition hover:border-[#00F5D4]/40 hover:shadow-lg ${
                      theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                    }`}
                  >
                    {/* Left side: Avatar + Creator + Title + Badges */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={s.creator?.avatar || s.thumbnailUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={s.creator?.fullName || 'Creator'}
                        className="h-12 w-12 rounded-full border-2 border-[#00F5D4]/40 object-cover shrink-0"
                      />

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-bold text-sm truncate ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                            {s.creator?.fullName || 'Creator'}
                          </h4>
                          {s.creator?.username && (
                            <span className={`text-[11px] font-mono ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                              {s.creator.username}
                            </span>
                          )}
                          {s.category && (
                            <span className="px-2 py-0.5 rounded-md bg-[#00F5D4]/10 text-[#00F5D4] text-[10px] font-bold border border-[#00F5D4]/20">
                              {s.category}
                            </span>
                          )}
                        </div>

                        <h3 className={`font-heading font-black text-sm truncate ${
                          theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                        }`}>
                          {s.title}
                        </h3>

                        <div className="flex items-center gap-2 text-[11px] text-[#8B8B96] flex-wrap pt-0.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FF5500]/10 text-[#FF5500] font-bold border border-[#FF5500]/30 flex items-center gap-1 text-[11px]">
                            <MessageSquare className="h-3 w-3" /> You asked {s.viewerQuestionsCount || 1} Question{s.viewerQuestionsCount === 1 ? '' : 's'}
                          </span>

                          <span className="px-2 py-0.5 rounded-full bg-black/60 text-[#8B8B96] text-[10px] font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> ENDED BROADCAST
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: View Questions Button */}
                    <div className="shrink-0 flex items-center gap-3 justify-end">
                      <Link
                        href={`/viewers/past-streams/${s.id}`}
                        className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:scale-105 transition flex items-center gap-1.5 whitespace-nowrap"
                      >
                        View Questions <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION BAR */}
              {sessions.length > 0 && (
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition ${
                  theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                  {/* Stats */}
                  <p className={`text-xs font-medium ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                    Showing <span className="font-bold text-[#00F5D4]">{startRecord}</span> to{' '}
                    <span className="font-bold text-[#00F5D4]">{endRecord}</span> of{' '}
                    <span className="font-bold text-[#00F5D4]">{pagination.total}</span> past streams
                  </p>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPrevPage || currentPage === 1 || isLoading}
                      title="First Page"
                      className={`p-2 rounded-xl border text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed ${
                        theme === 'light'
                          ? 'border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#495057]'
                          : 'border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white'
                      }`}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || currentPage === 1 || isLoading}
                      title="Previous Page"
                      className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed ${
                        theme === 'light'
                          ? 'border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#495057]'
                          : 'border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden md:inline pr-1">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    {renderPageNumbers().map((pageNo) => {
                      const isCurrent = pageNo === (pagination.page || currentPage);
                      return (
                        <button
                          key={pageNo}
                          onClick={() => handlePageChange(pageNo)}
                          disabled={isLoading}
                          className={`h-8 min-w-[32px] px-2.5 rounded-xl text-xs font-black transition ${
                            isCurrent
                              ? 'bg-brand-gradient text-[#0A0A0F] shadow-sm glow-teal font-black scale-105'
                              : theme === 'light'
                                ? 'bg-[#F8F9FA] border border-[#E9ECEF] text-[#495057] hover:bg-[#E9ECEF]'
                                : 'bg-[#0A0A0F] border border-[#1C1C26] text-[#8B8B96] hover:text-white hover:bg-[#1C1C26]'
                          }`}
                        >
                          {pageNo}
                        </button>
                      );
                    })}

                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage || currentPage >= pagination.totalPages || isLoading}
                      title="Next Page"
                      className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed ${
                        theme === 'light'
                          ? 'border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#495057]'
                          : 'border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white'
                      }`}
                    >
                      <span className="hidden md:inline pl-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNextPage || currentPage >= pagination.totalPages || isLoading}
                      title="Last Page"
                      className={`p-2 rounded-xl border text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed ${
                        theme === 'light'
                          ? 'border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#495057]'
                          : 'border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white'
                      }`}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
