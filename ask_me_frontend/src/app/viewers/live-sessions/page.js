'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import ViewerSidebar from '@/components/ViewerSidebar';
import SplashLoader from '@/components/SplashLoader';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import {
  Tv,
  Radio,
  Search,
  Users,
  Heart,
  MessageSquare,
  ExternalLink,
  Check,
  Menu,
  X,
  Filter,
  ShieldAlert,
  Sparkles,
  Info,
  Bell,
  Tag,
  Clock,
  Flame
} from 'lucide-react';
import VipMembershipModal from '@/components/VipMembershipModal';
import StreamPlayerModal from '@/components/StreamPlayerModal';
import { getViewerToken, getCookie, getViewerUser } from '@/utils/cookies';

const CATEGORIES = [
  'All',
  'Gaming',
  'News',
  'Tech',
  'Education',
  'Comedy',
  'Music',
  'Business',
  'Fitness',
  'Entertainment'
];

function LiveSessionsContent() {
  const [theme, setTheme] = useState('dark');
  const [showSplash, setShowSplash] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [liveCreators, setLiveCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [followedIds, setFollowedIds] = useState(new Set());
  const [vipModalCreator, setVipModalCreator] = useState(null);
  const [streamModalCreator, setStreamModalCreator] = useState(null);
  const [vipCreatorIds, setVipCreatorIds] = useState(new Set());

  // Theme listener
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

  // Fetch Public Live Feed & Filter for ONLY Active Live Creators
  useEffect(() => {
    fetchLiveSessions();
    fetchFollowing();
    fetchMyVipMemberships();
  }, [selectedCategory, searchQuery]);

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

  // Trigger Google YouTube Subscribe button rendering when liveCreators list loads
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
  }, [liveCreators, loading]);

  const fetchLiveSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`${API_ENDPOINTS.VIEWERS.PUBLIC_LIVE_FEED}?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.status === 'success' && data.data?.creators) {
        // Filter creators currently live
        const activeLive = data.data.creators.filter(c => c.isLive);
        setLiveCreators(activeLive);
      }
    } catch (err) {
      console.warn('Live sessions fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = getViewerToken() || getCookie('askme_viewer_token') || getCookie('askme_token') || (typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_token') || localStorage.getItem('askme_token')) : null);
      const u = getViewerUser();
      const res = await fetch(`${API_ENDPOINTS.VIEWERS.FOLLOWING}?userId=${u?.id || ''}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.followingIds) {
        setFollowedIds(new Set(data.followingIds.map(String)));
      }
    } catch (err) {
      console.warn('Following fetch error:', err.message);
    }
  };

  const handleToggleFollow = async (creatorId) => {
    const cidStr = String(creatorId);
    const token = getViewerToken() || getCookie('askme_viewer_token') || getCookie('askme_token') || (typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_token') || localStorage.getItem('askme_token')) : null);
    const u = getViewerUser();
    const wasFollowing = followedIds.has(cidStr);

    setFollowedIds((prev) => {
      const updated = new Set(prev);
      if (wasFollowing) {
        updated.delete(cidStr);
      } else {
        updated.add(cidStr);
      }
      return updated;
    });

    try {
      const res = await fetch(API_ENDPOINTS.VIEWERS.FOLLOW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          creatorId: cidStr,
          userId: u?.id || '',
        }),
      });
      const data = await res.json();
      if (res.ok && typeof data.isFollowing === 'boolean') {
        setFollowedIds((prev) => {
          const updated = new Set(prev);
          if (data.isFollowing) updated.add(cidStr);
          else updated.delete(cidStr);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Follow API error:', err.message);
    }
  };

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



  return (
    <>
      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE HEADER */}
        <header className={`md:hidden sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between shadow-lg ${theme === 'light' ? 'bg-white border-[#E2E8F0]' : 'bg-[#0A0A0F] border-[#1F1F30]'
          }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border ${theme === 'light' ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#14141F] border-[#1F1F30] text-white'}`}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-[#EB1000]" /> : <Menu className="h-5 w-5 text-[#EB1000]" />}
            </button>
            <div className="h-8 w-8 rounded-xl bg-[#EB1000] flex items-center justify-center text-white font-black text-lg shadow-sm">
              a
            </div>
            <span className="font-heading font-black text-sm text-white">
              AskMe <span className="text-[#EB1000]">LIVE</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EB1000] text-white text-[10px] font-black uppercase shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
            {liveCreators.length} LIVE
          </div>
        </header>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md flex">
            <div className="w-64 max-w-[80vw] h-full">
              <ViewerSidebar
                theme={theme}
                onToggleTheme={(t) => setTheme(t)}
                activeTab="live-sessions"
              />
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* TOP HEADER TITLE & LIVE STATS */}
        <header className={`border-b px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shrink-0 backdrop-blur-md shadow-sm transition-colors ${theme === 'light' ? 'bg-white/95 border-[#E2E8F0]' : 'bg-[#0A0A0F]/95 border-[#1F1F30]'
          }`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 shrink-0">
              <Tv className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#EB1000] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span> ACTIVE BROADCASTS
                </span>
                <span className="text-xs font-bold text-[#8B8B96]">
                  {liveCreators.length} Streamer{liveCreators.length === 1 ? '' : 's'} Live Now
                </span>
              </div>
            </div>
          </div>

          {/* Search Input for Live Sessions */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8B8B96]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active live streams..."
              className={`w-full pl-10 pr-4 py-2 rounded-2xl border text-xs focus:outline-none focus:border-[#EB1000] transition ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#0D0D14] border-[#1F1F30] text-white'
                }`}
            />
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* Category Pill Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-[#8B8B96] shrink-0 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-[#EB1000]" /> Category:
            </span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${selectedCategory === cat
                  ? 'bg-white text-black font-extrabold border-2 border-[#EB1000] shadow-[0_0_15px_rgba(235,16,0,0.4)]'
                  : theme === 'light'
                    ? 'bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F1F3F5]'
                    : 'bg-[#13131A] text-[#8B8B96] border border-[#1C1C26] hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Live Sessions Grid */}
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <Radio className="h-8 w-8 text-[#FF3D71] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#8B8B96]">Fetching Currently Live Creators...</p>
            </div>
          ) : liveCreators.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center space-y-4 max-w-md mx-auto shadow-2xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
              }`}>
              <ShieldAlert className="h-10 w-10 text-[#FFD60A] mx-auto" />
              <h3 className={`font-heading font-bold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                No Active Live Sessions Right Now
              </h3>
              <p className="text-xs text-[#8B8B96]">
                None of the creators match your category filter or search query. Check back soon or explore the full creator profile directory!
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="px-4 py-2 rounded-xl bg-[#EB1000] text-white text-xs font-bold shadow-md"
                >
                  Reset Category Filter
                </button>
                {/* <Link
                  href="/viewers/dashboard?tab=creators"
                  className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold border border-[#1C1C26]"
                >
                  Explore Creator Directory →
                </Link> */}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveCreators.map(creator => {
                const isFollowing = followedIds.has(String(creator.creatorId));

                return (
                  <div
                    key={creator.creatorId}
                    className={`p-5 rounded-3xl border shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group ${theme === 'light'
                        ? 'bg-white border-[#E9ECEF] hover:border-[#EB1000]/60'
                        : 'bg-gradient-to-b from-[#181824] to-[#111118] border-[#2A2A3C] hover:border-[#EB1000]/60 shadow-2xl'
                      }`}
                  >
                    <div className="space-y-4">
                      {/* 1. TOP BADGES ROW */}
                      <div className={`flex items-center justify-between gap-2 border-b pb-3 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#222230]'
                        }`}>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-[11px] font-bold">
                          <Tag className="h-3 w-3 shrink-0 text-[#EB1000]" />
                          <span>{creator.category || 'Live Session'}</span>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-ping"></span>
                          LIVE ASKME
                        </span>
                      </div>

                      {/* 2. CREATOR PROFILE ROW */}
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          href={`/creator/${creator.cleanUsername}`}
                          className="flex items-center gap-3.5 min-w-0 group/creator cursor-pointer"
                          title={`View ${creator.fullName}'s Profile`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={getMediaUrl(creator.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                              alt={creator.fullName || creator.cleanUsername}
                              className="h-13 w-13 rounded-full object-cover border-2 border-[#EB1000] p-0.5 group-hover/creator:border-[#FF5722] transition shadow-md"
                            />
                            <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#EB1000] text-white text-[10px] font-black flex items-center justify-center border-2 ${theme === 'light' ? 'border-white' : 'border-[#13131A]'
                              }`} title="Verified Creator">
                              ✓
                            </span>
                          </div>

                          <div className="min-w-0">
                            <h3 className={`font-heading font-black text-lg truncate leading-tight group-hover/creator:text-[#EB1000] transition ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                              }`}>
                              {creator.fullName || creator.cleanUsername || 'Creator'}
                            </h3>
                            <p className={`text-xs font-semibold font-mono truncate mt-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#A0A0B0]'
                              }`}>
                              {creator.username || `@${creator.cleanUsername}`}
                            </p>
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleToggleFollow(creator.creatorId)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 border shrink-0 ${isFollowing
                            ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30'
                            : theme === 'light'
                              ? 'bg-gray-100 text-[#495057] border-[#DEE2E6] hover:bg-[#EB1000]/10 hover:text-[#EB1000]'
                              : 'bg-white/5 text-white/90 border-white/10 hover:bg-[#EB1000]/20 hover:text-[#EB1000]'
                            }`}
                        >
                          <Bell className="h-3.5 w-3.5" />
                          {isFollowing ? 'Following' : '+ Follow'}
                        </button>
                      </div>

                      {/* 3. STREAM SESSION TITLE & DESCRIPTION */}
                      <div className="space-y-1.5">
                        <h4 className={`font-heading font-bold text-base leading-snug line-clamp-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                          }`}>
                          {creator.session?.title || `${creator.fullName}'s Official Live Broadcast`}
                        </h4>

                        <p className={`text-xs line-clamp-2 leading-relaxed ${theme === 'light' ? 'text-[#495057]' : 'text-[#9090A2]'
                          }`}>
                          {creator.session?.description || creator.bio || 'Streaming live and taking viewer questions! Support directly via AskMe instant UPI.'}
                        </p>
                      </div>

                      {/* DYNAMIC STATS BAR */}
                      {(() => {
                        const followersFormatted =
                          (creator.followersCount || 0) >= 1000000
                            ? `${((creator.followersCount || 0) / 1000000).toFixed(1)}M`
                            : (creator.followersCount || 0) >= 1000
                              ? `${((creator.followersCount || 0) / 1000).toFixed(1)}K`
                              : (creator.followersCount || 0);

                        const queueCount =
                          creator.session?.pendingQueue !== undefined
                            ? creator.session.pendingQueue
                            : creator.pendingQueue !== undefined
                              ? creator.pendingQueue
                              : creator.queueCount !== undefined
                                ? creator.queueCount
                                : 0;

                        const answeredCount =
                          creator.answeredCount !== undefined
                            ? creator.answeredCount
                            : creator.session?.answeredCount !== undefined
                              ? creator.session.answeredCount
                              : 0;

                        return (
                          <div className={`flex items-center justify-between py-2 px-3 rounded-2xl border text-[11px] my-1 gap-1 ${theme === 'light'
                              ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]'
                              : 'bg-white/5 border-white/10 text-white'
                            }`}>
                            {/* Followers Stat */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`font-medium hidden sm:inline text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#A0A0B0]'}`}>Followers:</span>
                              <span className={`font-medium sm:hidden text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#A0A0B0]'}`}>Subs:</span>
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 font-black text-xs shrink-0 truncate">
                                {followersFormatted}
                              </span>
                            </div>


                            {/* Queue Stat */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`font-medium text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#A0A0B0]'}`}>Queue:</span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 font-black text-xs shrink-0 truncate">
                                {queueCount}
                              </span>
                            </div>


                            {/* Answered Stat */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`font-medium text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#A0A0B0]'}`}>Answered:</span>
                              <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 font-black text-xs shrink-0 truncate">
                                {answeredCount}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* 4. ACTION BUTTONS ROW */}
                    <div className="space-y-2.5 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        {/* Watch Now Button */}
                        {(() => {
                          const watchUrl =
                            creator.session?.streamUrl ||
                            creator.session?.stream_url ||
                            creator.streamUrl ||
                            (Array.isArray(creator.socialLinks) && creator.socialLinks.find(s => String(s.platform || s.url).toLowerCase().includes('youtube'))?.url) ||
                            (Array.isArray(creator.socialLinks) && creator.socialLinks[0]?.url) ||
                            `https://youtube.com/@${creator.cleanUsername || creator.username || ''}`;

                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setStreamModalCreator({
                                  ...creator,
                                  name: creator.fullName || creator.name || creator.cleanUsername || 'Creator',
                                  avatar: getMediaUrl(creator.avatar) || creator.avatar,
                                  streamTitle: creator.session?.title || creator.title || `${creator.fullName || creator.cleanUsername}'s Live Broadcast`,
                                  liveStreamUrl: watchUrl,
                                  sessionCode: creator.session?.sessionCode || creator.cleanUsername,
                                  cleanUsername: creator.cleanUsername || (creator.username ? String(creator.username).replace(/^@+/, '') : ''),
                                });
                              }}
                              className="flex-1 py-2.5 px-4 rounded-full bg-[#EB1000] hover:bg-[#CC0E00] text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 text-center truncate cursor-pointer active:scale-95"
                            >
                              <Tv className="h-4 w-4 shrink-0" /> Watch Now
                            </button>
                          );
                        })()}

                        {creator.session?.sessionCode ? (
                          <Link
                            href={`/pay/${creator.session.sessionCode}`}
                            className="flex-1 py-2.5 px-4 rounded-full bg-[#EB1000] hover:bg-[#CC0E00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 transition flex items-center justify-center gap-2 text-center truncate"
                          >
                            <MessageSquare className="h-4 w-4 shrink-0" /> Ask Question
                          </Link>
                        ) : (
                          <Link
                            href={`/creator/${creator.cleanUsername}`}
                            className="flex-1 py-2.5 px-4 rounded-full bg-[#EB1000] hover:bg-[#CC0E00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 transition flex items-center justify-center gap-2 text-center truncate"
                          >
                            <MessageSquare className="h-4 w-4 shrink-0" /> Ask Question
                          </Link>
                        )}
                      </div>

                      {/* VIP Membership Button */}
                      {(() => {
                        const cid = String(creator.creatorId || creator.id || '');
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
                            type="button"
                            onClick={() => setVipModalCreator(creator)}
                            className={`w-full py-3 px-4 rounded-full border font-black text-xs transition flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] ${theme === 'light'
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
          )}
        </main>
      </div>

      <VipMembershipModal
        isOpen={!!vipModalCreator}
        onClose={() => setVipModalCreator(null)}
        creator={vipModalCreator}
        onSuccess={() => fetchMyVipMemberships()}
      />

      <StreamPlayerModal
        isOpen={!!streamModalCreator}
        onClose={() => setStreamModalCreator(null)}
        creator={streamModalCreator}
      />
    </>
  );
}

export default function LiveSessionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6 text-xs font-bold">
        Loading Live Broadcast Sessions...
      </div>
    }>
      <LiveSessionsContent />
    </Suspense>
  );
}
