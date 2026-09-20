'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VipMembershipModal from '@/components/VipMembershipModal';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
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
  X,
  Tv
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
      window.location.href = '/';
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

  // Helper to safely extract YouTube Channel Info (channelId or channel handle)
  const getYoutubeWidgetInfo = (creator) => {
    if (!creator) return null;

    const platform = String(
      creator.platform ||
      creator.channel_platform ||
      creator.primaryPlatform ||
      creator.session?.platform ||
      ''
    ).toLowerCase();

    // 1. Direct Channel ID on creator object
    const directChannelId =
      creator.youtubeChannelId ||
      creator.channelId ||
      creator.youtube_channel_id ||
      creator.channel_id;

    if (directChannelId && /^UC[\w-]{20,}$/i.test(String(directChannelId).trim())) {
      return { channelId: String(directChannelId).trim() };
    }

    // 2. Direct channel / handle on creator object
    const directChannel =
      creator.youtubeChannel ||
      creator.channel ||
      creator.youtube_channel ||
      creator.youtubeHandle;

    if (directChannel && typeof directChannel === 'string') {
      let value = directChannel.trim();
      if (/^UC[\w-]{20,}$/i.test(value)) {
        return { channelId: value };
      }
      value = value.replace(/^@/, '');
      if (value && !value.includes('/') && !value.includes('.')) {
        return { channel: value };
      }
    }

    // Collect URLs to search
    let urlStr =
      creator.profile_url ||
      creator.profileUrl ||
      creator.youtube_url ||
      creator.youtubeUrl ||
      creator.channelUrl ||
      creator.streamUrl ||
      creator.session?.streamUrl ||
      creator.session?.stream_url ||
      '';

    if (Array.isArray(creator.socialLinks)) {
      const ytSocial = creator.socialLinks.find((s) => {
        const p = String(s.platform || '').toLowerCase();
        const u = String(s.url || s.profile_url || s.profileUrl || '').toLowerCase();
        return p.includes('youtube') || u.includes('youtube.com') || u.includes('youtu.be');
      });
      if (ytSocial) {
        urlStr = ytSocial.profile_url || ytSocial.profileUrl || ytSocial.url || urlStr;
      }
    }

    // 3. Extract Channel ID from URL
    if (urlStr) {
      const channelIdMatch = String(urlStr).match(/youtube\.com\/channel\/(UC[\w-]{20,})/i);
      if (channelIdMatch) {
        return { channelId: channelIdMatch[1] };
      }
      // 4. Extract @handle from URL
      const handleMatch = String(urlStr).match(/youtube\.com\/@([^/?#]+)/i);
      if (handleMatch) {
        return { channel: handleMatch[1].replace(/^@/, '') };
      }
      // 5. /c/ or /user/ URL
      const legacyMatch = String(urlStr).match(/youtube\.com\/(?:c|user)\/([^/?#]+)/i);
      if (legacyMatch) {
        return { channel: legacyMatch[1] };
      }
    }

    // 6. Check if creator is explicitly on a non-YouTube platform without any YouTube links/info
    const lowerUrl = String(urlStr).toLowerCase();
    const hasYtLink = lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
    const nonYtPlatforms = ['twitch', 'instagram', 'kick', 'tiktok', 'facebook', 'twitter'];
    if (platform && nonYtPlatforms.some(p => platform.includes(p)) && !hasYtLink) {
      return null;
    }

    // 7. Fallback to creator username or handle
    const handle = creator.cleanUsername || creator.username || creator.handle;
    if (handle) {
      const cleanHandle = String(handle).trim().replace(/^@+/, '');
      if (cleanHandle) {
        return { channel: cleanHandle };
      }
    }

    return null;
  };

  // Trigger Google YouTube Subscribe button rendering when creators list loads
  useEffect(() => {
    const renderYtWidgets = () => {
      if (typeof window !== 'undefined' && window.gapi && window.gapi.ytsubscribe) {
        try {
          window.gapi.ytsubscribe.go();
        } catch (err) {
          console.warn('gapi render error:', err);
        }
      }
    };

    renderYtWidgets();
    const timer1 = setTimeout(renderYtWidgets, 300);
    const timer2 = setTimeout(renderYtWidgets, 1000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [creators, loading]);

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

  const [theme, setTheme] = useState('dark');

  // Theme Sync
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
    setTheme(saved);

    const handleThemeChange = () => {
      const updated = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
      setTheme(updated);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('viewer-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('viewer-theme-changed', handleThemeChange);
      }
    };
  }, []);

  return (
    <>
      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0" ref={topListRef}>
        {/* HEADER */}
        <header className={`sticky top-0 z-30 shrink-0 backdrop-blur-md border-b px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm transition-colors ${
          theme === 'light' ? 'bg-white/95 border-[#E2E8F0]' : 'bg-[#0A0A0F]/95 border-[#1F1F30]'
        }`}>
          <Link href="/viewers/dashboard" className={`inline-flex items-center gap-2 text-xs font-bold transition ${
            theme === 'light' ? 'text-[#64748B] hover:text-[#EB1000]' : 'text-[#94A3B8] hover:text-[#EB1000]'
          }`}>
            <ArrowLeft className="h-4 w-4 text-[#EB1000]" /> Back to Public Live Feed
          </Link>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
            theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
          }`}>
            <div>
              <h2 className={`font-heading font-black text-2xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                Followed Creators ({pagination.total ?? creators.length})
              </h2>
              <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
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
                className={`w-full pl-10 pr-10 py-2 rounded-2xl text-xs font-medium border outline-none transition ${
                  theme === 'light'
                    ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] focus:border-[#EB1000]'
                    : 'bg-[#0A0A0F] border-[#1C1C26] text-white focus:border-[#00F5D4]'
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

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-3 min-h-[40vh]">
              <RefreshCw className="h-8 w-8 border-2 border-[#EB1000] border-t-transparent rounded-full animate-spin text-[#EB1000]" />
              <p className={`text-xs font-semibold ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>Loading Followed Creators...</p>
            </div>
          ) : creators.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center space-y-4 max-w-md mx-auto ${
              theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
              <Heart className="h-10 w-10 text-[#8B8B96] mx-auto" />
              <h3 className={`font-heading font-bold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                {activeSearch ? 'No Matching Creators Found' : 'No Followed Creators Yet'}
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                {activeSearch
                  ? `No followed creators match "${activeSearch}".`
                  : 'Browse the public live feed and click + Follow on creators to add them to your following list!'}
              </p>
              {activeSearch ? (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2.5 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 text-xs font-bold shadow-md inline-block"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  href="/viewers/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-[#EB1000] text-white text-xs font-bold shadow-md inline-block"
                >
                  Explore Live Feed
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {creators.map(creator => {
                  const isFollowing = followedIds.has(String(creator.creatorId || creator.id));

                  return (
                    <div
                      key={creator.creatorId || creator.id}
                      className={`p-5 rounded-3xl border shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between ${
                        theme === 'light'
                          ? 'bg-white border-[#E9ECEF] hover:border-[#EB1000]/50'
                          : 'bg-[#13131A] border-[#22222E] hover:border-[#EB1000]/50 shadow-2xl'
                      }`}
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
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                            theme === 'light' ? 'bg-[#F1F3F5] text-[#495057] border-[#DEE2E6]' : 'bg-[#1C1C26] text-[#8B8B96] border-[#2A2A3A]'
                          }`}>
                            {creator.category || creator.session?.category || 'General Q&A'}
                          </span>
                        </div>

                        <div className={`flex items-center justify-between gap-3 border-b pb-3.5 ${
                          theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#22222E]'
                        }`}>
                          {/* Avatar & Name Info */}
                          <Link
                            href={`/creator/${creator.cleanUsername}`}
                            className="flex items-center gap-3 min-w-0 group hover:opacity-90 transition cursor-pointer"
                            title={`View ${creator.fullName}'s Profile`}
                          >
                            <div className="relative shrink-0">
                              <img
                                src={getMediaUrl(creator.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                                alt={creator.fullName}
                                className={`h-12 w-12 rounded-full object-cover border transition ${
                                  theme === 'light' ? 'border-[#DEE2E6] group-hover:border-[#EB1000]' : 'border-[#2A2A3A] group-hover:border-[#00F5D4]'
                                }`}
                              />
                              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#EB1000] text-white text-[9px] font-bold flex items-center justify-center border ${
                                theme === 'light' ? 'border-white' : 'border-[#13131A]'
                              }`} title="Verified Creator">
                                ✓
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h4 className={`font-heading font-black text-base truncate leading-tight transition ${
                                theme === 'light' ? 'text-[#1A1D20] group-hover:text-[#EB1000]' : 'text-white group-hover:text-[#00F5D4]'
                              }`}>
                                {creator.fullName}
                              </h4>
                              <p className={`text-xs font-mono truncate mt-0.5 ${
                                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                              }`}>
                                {creator.username}
                              </p>
                            </div>
                          </Link>

                          {/* Following Button */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleFollow(creator.creatorId || creator.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 hover:bg-[#FF3D71]/10 hover:text-[#FF3D71]"
                            >
                              <Bell className="h-3.5 w-3.5" />
                              Following
                            </button>
                          </div>
                        </div>

                        {/* STREAM DESCRIPTION */}
                        <p className={`text-xs line-clamp-2 leading-relaxed ${
                          theme === 'light' ? 'text-[#495057]' : 'text-[#8B8B96]'
                        }`}>
                          {creator.session?.description || creator.bio || 'Pro Esports player streaming & answering live questions. Ask about settings, sensitivity & pro tips!'}
                        </p>

                        {/* Divider */}
                        <div className={`border-b pt-1 ${
                          theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#22222E]'
                        }`}></div>

                        {/* STATS ROW (Followers Count) */}
                        <div className={`flex items-center text-xs pt-1 ${
                          theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                        }`}>
                          <span className={`flex items-center gap-1 font-bold ${
                            theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                          }`}>
                            <Users className="h-3.5 w-3.5 text-[#EB1000]" />
                            {(creator.followersCount || 0) >= 1000000
                              ? `${((creator.followersCount || 0) / 1000000).toFixed(1)}M`
                              : (creator.followersCount || 0) >= 1000
                                ? `${((creator.followersCount || 0) / 1000).toFixed(1)}K`
                                : (creator.followersCount || 0)} Followers
                          </span>
                        </div>
                      </div>

                      {/* ACTION BUTTONS ROW (Ask Question) */}
                      <div className="space-y-2.5 pt-4">
                        <div className="flex items-center w-full">
                          {creator.session?.sessionCode ? (
                            <Link
                              href={`/pay/${creator.session.sessionCode}`}
                              className="w-full py-2.5 px-4 rounded-full bg-[#EB1000] hover:bg-[#CC0E00] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-[#EB1000]/30 text-center truncate"
                            >
                              <MessageSquare className="h-4 w-4 shrink-0 fill-white" /> Ask Question
                            </Link>
                          ) : (
                            <Link
                              href={`/creator/${creator.cleanUsername}`}
                              className="w-full py-2.5 px-4 rounded-full bg-[#EB1000] hover:bg-[#CC0E00] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-[#EB1000]/30 text-center truncate"
                            >
                              <MessageSquare className="h-4 w-4 shrink-0 fill-white" /> Ask Question
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
                              className={`w-full py-3 px-4 rounded-full border font-black text-xs transition flex items-center justify-center gap-2 shadow-md ${
                                theme === 'light'
                                  ? 'bg-[#FFFBEB] hover:bg-[#FEF3C7] border-[#F59E0B] text-[#B45309]'
                                  : 'bg-[#1C1805] hover:bg-[#262007] border-[#B38F00] text-[#FFD60A]'
                              }`}
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
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition shadow-xl ${
                  theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
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
                          className={`h-8 min-w-[32px] px-2.5 rounded-xl text-xs font-black transition ${isCurrent
                            ? 'bg-[#EB1000] text-white shadow-sm font-black scale-105'
                            : 'bg-[#0D0D14] border border-[#1F1F30] text-[#94A3B8] hover:text-white hover:bg-[#1C1C28]'
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
