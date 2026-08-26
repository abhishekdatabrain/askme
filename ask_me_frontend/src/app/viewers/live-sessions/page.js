'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import ViewerSidebar from '@/components/ViewerSidebar';
import SplashLoader from '@/components/SplashLoader';
import { API_ENDPOINTS } from '@/config/api';
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
  Bell
} from 'lucide-react';

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
  }, [selectedCategory, searchQuery]);

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
      const res = await fetch(API_ENDPOINTS.VIEWERS.FOLLOWING);
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
    const newFollowed = new Set(followedIds);
    if (newFollowed.has(cidStr)) {
      newFollowed.delete(cidStr);
    } else {
      newFollowed.add(cidStr);
    }
    setFollowedIds(newFollowed);

    try {
      await fetch(API_ENDPOINTS.VIEWERS.FOLLOW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: cidStr }),
      });
    } catch (err) {
      console.warn('Follow API error:', err.message);
    }
  };



  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
    }`}>
      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto shrink-0 z-30">
        <ViewerSidebar
          theme={theme}
          onToggleTheme={(t) => setTheme(t)}
          activeTab="live-sessions"
        />
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* MOBILE HEADER */}
        <header className={`md:hidden sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between shadow-lg ${
          theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-[#00F5D4]" /> : <Menu className="h-5 w-5 text-[#00F5D4]" />}
            </button>
            <div className="h-8 w-8 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-lg">
              a
            </div>
            <span className="font-heading font-black text-sm text-white">
              AskMe <span className="text-brand-gradient">LIVE</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF3D71] text-white text-[10px] font-black uppercase">
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
        <div className={`border-b px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md ${
          theme === 'light' ? 'bg-white/95 border-[#E9ECEF]' : 'bg-[#13131A]/95 border-[#1C1C26]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 animate-pulse shrink-0">
              <Tv className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF3D71] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span> ACTIVE BROADCASTS
                </span>
                <span className="text-xs font-bold text-[#8B8B96]">
                  {liveCreators.length} Streamers Live Now
                </span>
              </div>
              <h1 className={`font-heading font-black text-xl mt-0.5 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                Live Broadcast Sessions
              </h1>
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
              className={`w-full pl-10 pr-4 py-2 rounded-2xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
              }`}
            />
          </div>
        </div>

        {/* MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* Category Pill Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-[#8B8B96] shrink-0 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-[#00F5D4]" /> Category:
            </span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-[#FF3D71] text-white shadow-sm'
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
            <div className={`p-12 rounded-3xl border text-center space-y-4 max-w-md mx-auto shadow-2xl ${
              theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
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
                  className="px-4 py-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] text-xs font-bold shadow-md"
                >
                  Reset Category Filter
                </button>
                <Link
                  href="/viewers/dashboard?tab=creators"
                  className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold border border-[#1C1C26]"
                >
                  Explore Creator Directory →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveCreators.map(creator => {
                    const isFollowing = followedIds.has(String(creator.creatorId));

                    return (
                      <div
                        key={creator.creatorId}
                        className="p-5 rounded-3xl bg-[#13131A] border border-[#22222E] hover:border-[#FF5722]/50 shadow-2xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          {/* 1. TOP CREATOR HEADER ROW */}
                          <div className="flex items-center justify-between gap-3 border-b border-[#22222E] pb-3.5">
                            {/* Avatar & Name Info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={creator.avatar}
                                  alt={creator.fullName}
                                  className="h-12 w-12 rounded-2xl object-cover border border-[#2A2A3A]"
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

                            {/* Follow & LIVE Badges */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleToggleFollow(creator.creatorId)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border ${
                                  isFollowing
                                    ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30'
                                    : 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 hover:bg-[#00E676]/20'
                                }`}
                              >
                                <Bell className="h-3.5 w-3.5" />
                                {isFollowing ? 'Following' : '+ Follow'}
                              </button>

                              <span className="px-3 py-1 rounded-full bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#FF3D71] animate-ping"></span>
                                LIVE ASKME
                              </span>
                            </div>
                          </div>

                          {/* 2. SESSION TITLE WITH EMOJI */}
                          <div className="space-y-1.5">
                            <h3 className="font-heading font-black text-base text-white leading-snug flex items-start gap-2">
                              <span className="text-lg shrink-0">🎙️</span>
                              <span>{creator.session?.title || `${creator.fullName}'s Official Live Q&A Broadcast`}</span>
                            </h3>

                            {/* STREAM DESCRIPTION */}
                            <p className="text-xs text-[#8B8B96] line-clamp-2 leading-relaxed">
                              {creator.session?.description || creator.bio || 'Pro Esports player streaming & answering live questions. Ask about settings, sensitivity & pro tips!'}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="border-b border-[#22222E] pt-1"></div>

                          {/* STATS ROW (3 Columns: Subs | Star Rating | Answered) */}
                          <div className="flex items-center justify-between text-xs text-[#8B8B96] pt-1">
                            <span className="flex items-center gap-1 font-bold text-white">
                              <Users className="h-3.5 w-3.5 text-[#FF5722]" />
                              {creator.followersCount >= 1000000 
                                ? `${(creator.followersCount / 1000000).toFixed(1)}M` 
                                : `${(creator.followersCount / 1000).toFixed(0)}K`} Subs
                            </span>

                            <span className="flex items-center gap-1 font-bold text-white">
                              <span className="text-[#FFD60A]">★</span>
                              4.85
                            </span>

                            <span className="font-bold text-white">
                              440 Answered
                            </span>
                          </div>
                        </div>

                        {/* 3. ACTION BUTTONS ROW 1 (Profile & Ask Question) */}
                        <div className="space-y-2.5 pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <Link
                              href={`/creator/${creator.cleanUsername}`}
                              className="py-3 px-4 rounded-full bg-[#202026] hover:bg-[#2A2A33] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5"
                            >
                              Profile ↗
                            </Link>

                            {creator.session?.sessionCode ? (
                              <Link
                                href={`/pay/${creator.session.sessionCode}`}
                                className="py-3 px-4 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#E64A19] hover:to-[#FF5722] text-white font-black text-xs shadow-xl glow-pay transition flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="h-4 w-4" /> Ask Question
                              </Link>
                            ) : (
                              <Link
                                href={`/creator/${creator.cleanUsername}`}
                                className="py-3 px-4 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white font-black text-xs shadow-xl flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="h-4 w-4" /> Ask Question
                              </Link>
                            )}
                          </div>

                          {/* ACTION BUTTON ROW 2: Join VIP Membership */}
                          <Link
                            href={`/creator/${creator.cleanUsername}`}
                            className="w-full py-3 px-4 rounded-full bg-[#1C1805] hover:bg-[#262007] border border-[#B38F00] text-[#FFD60A] font-black text-xs transition flex items-center justify-center gap-2 shadow-md"
                          >
                            <span className="text-sm">💎</span> Join VIP Membership
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
          )}
        </main>
      </div>
    </div>
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
