'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VipMembershipModal from '@/components/VipMembershipModal';
import { API_ENDPOINTS } from '@/config/api';
import { getViewerToken, getViewerUser, getCookie } from '@/utils/cookies';
import {
  Heart,
  Users,
  MessageSquare,
  ArrowLeft,
  Bell,
  ArrowUpRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X
} from 'lucide-react';

export default function ViewerFollowingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());
  const [vipModalCreator, setVipModalCreator] = useState(null);
  const [vipCreatorIds, setVipCreatorIds] = useState(new Set());

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const searchDebounceRef = useRef(null);
  const topListRef = useRef(null);

  // Auth Protection Guard
  useEffect(() => {
    const token = getViewerToken() || getCookie('askme_viewer_token') || (typeof window !== 'undefined' ? localStorage.getItem('askme_viewer_token') : null);
    const user = getViewerUser();
    if (!token || !user) {
      window.location.href = '/viewers/login';
    }
  }, [router]);

  const fetchMyVipMemberships = async () => {
    try {
      const token = getViewerToken() || getCookie('askme_viewer_token') || getCookie('askme_token');
      const res = await fetch(API_ENDPOINTS.VIEWERS.VIP_MY_MEMBERSHIPS, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.data?.memberships) {
        const ids = new Set();
        data.data.memberships.forEach(m => {
          if (m.status === 'active') {
            if (m.creator_id) ids.add(String(m.creator_id));
            if (m.creatorUsername) ids.add(String(m.creatorUsername).toLowerCase().replace(/^@+/, ''));
          }
        });
        setVipCreatorIds(ids);
      }
    } catch (err) {
      console.warn('VIP memberships fetch error:', err.message);
    }
  };

  const fetchData = useCallback(async (targetPage = currentPage, searchVal = activeSearch) => {
    try {
      setLoading(true);
      const token = getViewerToken() || getCookie('askme_viewer_token') || getCookie('askme_token');

      const url = new URL(API_ENDPOINTS.VIEWERS.FOLLOWING);
      url.searchParams.set('page', targetPage.toString());
      url.searchParams.set('limit', limit.toString());
      if (searchVal && searchVal.trim()) {
        url.searchParams.set('search', searchVal.trim());
      }

      const resFollowing = await fetch(url.toString(), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const dataFollowing = await resFollowing.json();

      let fSet = new Set();
      if (resFollowing.ok) {
        if (dataFollowing.followingIds) {
          fSet = new Set(dataFollowing.followingIds.map(String));
          setFollowedIds(fSet);
        }

        if (dataFollowing.data?.creators) {
          setCreators(dataFollowing.data.creators);
          if (dataFollowing.data.pagination) {
            setPagination(dataFollowing.data.pagination);
          } else {
            const totalCount = dataFollowing.data.total || dataFollowing.data.creators.length;
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
          // Fallback legacy behavior if data.creators is not present
          const resFeed = await fetch(API_ENDPOINTS.VIEWERS.PUBLIC_LIVE_FEED);
          const dataFeed = await resFeed.json();
          if (resFeed.ok && dataFeed.data?.creators) {
            const filtered = dataFeed.data.creators.filter(c => fSet.has(String(c.creatorId)));
            setCreators(filtered);
            setPagination({
              page: 1,
              limit,
              total: filtered.length,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Following page fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeSearch, limit]);

  useEffect(() => {
    fetchData(currentPage, activeSearch);
    fetchMyVipMemberships();
  }, [currentPage, activeSearch, fetchData]);

  // Search input handler with debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setActiveSearch(val);
      setCurrentPage(1);
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

  const handleToggleFollow = async (creatorId) => {
    const cidStr = String(creatorId);
    const newFollowed = new Set(followedIds);
    if (newFollowed.has(cidStr)) {
      newFollowed.delete(cidStr);
    } else {
      newFollowed.add(cidStr);
    }
    setFollowedIds(newFollowed);
    setCreators(prev => prev.filter(c => newFollowed.has(String(c.creatorId || c.id))));

    try {
      const token = getViewerToken() || getCookie('askme_viewer_token') || getCookie('askme_token');
      await fetch(API_ENDPOINTS.VIEWERS.FOLLOW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ creatorId: cidStr }),
      });

      // Refetch page data to maintain accurate pagination count
      fetchData(currentPage, activeSearch);
    } catch (err) {
      console.warn('Follow API error:', err.message);
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
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total || creators.length);

  return (
    <>
      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen" ref={topListRef}>
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-[#13131A]/95 backdrop-blur-md border-b border-[#1C1C26] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#8B8B96] hover:text-[#00F5D4] transition">
            <ArrowLeft className="h-4 w-4" /> Back to Public Live Feed
          </Link>

          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#FF3D71]" />
            <h1 className="font-heading font-black text-sm text-white">
              Followed Creators
            </h1>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
            <div>
              <h2 className="font-heading font-black text-2xl text-white">
                Followed Creators ({pagination.total ?? creators.length})
              </h2>
              <p className="text-xs text-[#8B8B96] mt-0.5">
                Live broadcast notifications and quick support links for your favorite creators.
              </p>
            </div>

            {/* SEARCH INPUT */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B96]" />
              <input
                type="text"
                placeholder="Search followed creators..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 rounded-2xl text-xs font-medium border outline-none transition bg-[#0A0A0F] border-[#1C1C26] text-white focus:border-[#00F5D4] focus:ring-1 focus:ring-[#00F5D4]"
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

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-3 min-h-[40vh]">
              <RefreshCw className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin text-[#00F5D4]" />
              <p className="text-xs font-semibold text-[#8B8B96]">Loading Followed Creators...</p>
            </div>
          ) : creators.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#13131A] border border-[#1C1C26] text-center space-y-4 max-w-md mx-auto">
              <Heart className="h-10 w-10 text-[#8B8B96] mx-auto" />
              <h3 className="font-heading font-bold text-lg text-white">
                {activeSearch ? 'No Matching Creators Found' : 'No Followed Creators Yet'}
              </h3>
              <p className="text-xs text-[#8B8B96]">
                {activeSearch
                  ? `No followed creators match "${activeSearch}".`
                  : 'Browse the public live feed and click + Follow on creators to add them to your following list!'}
              </p>
              {activeSearch ? (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2.5 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-xs font-bold shadow-md inline-block"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  href="/viewers/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-[#00F5D4] text-[#0A0A0F] text-xs font-bold shadow-md inline-block"
                >
                  Explore Live Feed
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creators.map(creator => {
                  const isFollowing = followedIds.has(String(creator.creatorId || creator.id));

                  return (
                    <div
                      key={creator.creatorId || creator.id}
                      className="p-5 rounded-3xl bg-[#13131A] border border-[#22222E] hover:border-[#FF5722]/50 shadow-2xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        {/* TOP BAR: LIVE NOW Above Profile & Category Tag on Top Right */}
                        <div className="flex items-center justify-between gap-2 pb-1">
                          {creator.isLive ? (
                            <span className="px-3 py-1 rounded-full bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3D71] animate-ping"></span>
                              LIVE NOW
                            </span>
                          ) : (
                            <div></div>
                          )}

                          {/* Category Tag Pill on Top Right */}
                          <span className="px-3 py-1 rounded-full bg-[#1C1C26] text-[#8B8B96] text-xs font-bold border border-[#2A2A3A] shrink-0">
                            {creator.category || creator.session?.category || 'General Q&A'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-b border-[#22222E] pb-3.5">
                          {/* Avatar & Name Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={creator.avatar}
                                alt={creator.fullName}
                                className="h-12 w-12 rounded-full object-cover border border-[#2A2A3A]"
                              />
                              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#FF5722] text-white text-[9px] font-bold flex items-center justify-center border border-[#13131A]" title="Verified Creator">
                                ✓
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-heading font-black text-base text-white truncate leading-tight">
                                {creator.fullName}
                              </h4>
                              <p className="text-xs text-[#8B8B96] font-mono truncate mt-0.5">
                                {creator.username}
                              </p>
                            </div>
                          </div>

                          {/* Follow & Clickable Social Stream Icon */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleFollow(creator.creatorId || creator.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 hover:bg-[#FF3D71]/10 hover:text-[#FF3D71]"
                            >
                              <Bell className="h-3.5 w-3.5" />
                              Following
                            </button>

                            {/* Clickable Social Stream Platform Icon */}
                            <a
                              href={creator.session?.streamUrl || creator.socialLinks?.[0]?.url || 'https://youtube.com'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-7 w-7 rounded-full bg-[#FF0000] text-white font-bold text-xs flex items-center justify-center shrink-0 hover:scale-110 transition shadow-md"
                              title={`Watch ${creator.session?.platform || 'YouTube'} Live Stream`}
                            >
                              ▶
                            </a>
                          </div>
                        </div>

                        {/* STREAM DESCRIPTION */}
                        <p className="text-xs text-[#8B8B96] line-clamp-2 leading-relaxed">
                          {creator.session?.description || creator.bio || 'Pro Esports player streaming & answering live questions. Ask about settings, sensitivity & pro tips!'}
                        </p>

                        {/* Divider */}
                        <div className="border-b border-[#22222E] pt-1"></div>

                        {/* STATS ROW (Dynamic Followers & Answered Count) */}
                        <div className="flex items-center justify-between text-xs text-[#8B8B96] pt-1">
                          <span className="flex items-center gap-1 font-bold text-white">
                            <Users className="h-3.5 w-3.5 text-[#FF5722]" />
                            {(creator.followersCount || 0) >= 1000000
                              ? `${((creator.followersCount || 0) / 1000000).toFixed(1)}M`
                              : (creator.followersCount || 0) >= 1000
                              ? `${((creator.followersCount || 0) / 1000).toFixed(1)}K`
                              : (creator.followersCount || 0)} Followers
                          </span>

                          <span className="font-bold text-white">
                            {creator.answeredCount !== undefined ? creator.answeredCount : 0} Answered
                          </span>
                        </div>
                      </div>

                      {/* ACTION BUTTONS ROW */}
                      <div className="space-y-2.5 pt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            href={`/creator/${creator.cleanUsername}`}
                            className="py-3 px-4 rounded-full bg-[#202026] hover:bg-[#2A2A33] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5"
                          >
                            Profile <ArrowUpRight className="h-4 w-4 text-white" />
                          </Link>

                          {creator.session?.sessionCode ? (
                            <Link
                              href={`/pay/${creator.session.sessionCode}`}
                              className="py-3 px-4 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#FF7043] hover:to-[#FF8A65] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-xl glow-pay"
                            >
                              <MessageSquare className="h-4 w-4 fill-white" /> Ask Question
                            </Link>
                          ) : (
                            <Link
                              href={`/creator/${creator.cleanUsername}`}
                              className="py-3 px-4 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#FF7043] hover:to-[#FF8A65] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-xl glow-pay"
                            >
                              <MessageSquare className="h-4 w-4 fill-white" /> Ask Question
                            </Link>
                          )}
                        </div>

                        {(() => {
                          const cid = String(creator.id || creator.creatorId || '');
                          const cuser = String(creator.username || creator.cleanUsername || '').toLowerCase().replace(/^@+/, '');
                          const isVip = vipCreatorIds.has(cid) || (cuser && vipCreatorIds.has(cuser));

                          if (isVip) {
                            return (
                              <div className="w-full py-3 px-4 rounded-full bg-[#00E676]/10 border border-[#00E676]/40 text-[#00E676] font-black text-xs flex items-center justify-center gap-2 shadow-md">
                                <span className="text-sm">💎</span> VIP Member ✓
                              </div>
                            );
                          }

                          return (
                            <button
                              onClick={() => setVipModalCreator(creator)}
                              className="w-full py-3 px-4 rounded-full bg-[#1C1805] hover:bg-[#262007] border border-[#B38F00] text-[#FFD60A] font-black text-xs transition flex items-center justify-center gap-2 shadow-md"
                            >
                              <span className="text-sm">💎</span> Join VIP Membership
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION BAR */}
              {creators.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#13131A] border border-[#1C1C26] flex flex-col sm:flex-row items-center justify-between gap-4 transition shadow-xl">
                  {/* Stats */}
                  <p className="text-xs font-medium text-[#8B8B96]">
                    Showing <span className="font-bold text-[#00F5D4]">{startRecord}</span> to{' '}
                    <span className="font-bold text-[#00F5D4]">{endRecord}</span> of{' '}
                    <span className="font-bold text-[#00F5D4]">{pagination.total}</span> followed creators
                  </p>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPrevPage || currentPage === 1 || loading}
                      title="First Page"
                      className="p-2 rounded-xl border border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || currentPage === 1 || loading}
                      title="Previous Page"
                      className="p-2 rounded-xl border border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
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
                          disabled={loading}
                          className={`h-8 min-w-[32px] px-2.5 rounded-xl text-xs font-black transition ${
                            isCurrent
                              ? 'bg-brand-gradient text-[#0A0A0F] shadow-sm glow-teal font-black scale-105'
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
                      disabled={!pagination.hasNextPage || currentPage >= pagination.totalPages || loading}
                      title="Next Page"
                      className="p-2 rounded-xl border border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="hidden md:inline pl-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNextPage || currentPage >= pagination.totalPages || loading}
                      title="Last Page"
                      className="p-2 rounded-xl border border-[#1C1C26] hover:bg-[#1C1C26] text-[#8B8B96] hover:text-white text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
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

      <VipMembershipModal
        isOpen={!!vipModalCreator}
        onClose={() => setVipModalCreator(null)}
        creator={vipModalCreator}
        onSuccess={() => fetchMyVipMemberships()}
      />
    </>
  );
}
