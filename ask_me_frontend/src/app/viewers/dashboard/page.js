'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ViewerSidebar from '@/components/ViewerSidebar';
import SplashLoader from '@/components/SplashLoader';
import VipMembershipModal from '@/components/VipMembershipModal';
import { API_ENDPOINTS } from '@/config/api';
import {
    Home,
    Grid,
    Search,
    Users,
    Heart,
    Bell,
    Radio,
    Sparkles,
    MessageSquare,
    ExternalLink,
    Tv,
    Check,
    Menu,
    X,
    Filter,
    ShieldAlert,
    ChevronRight,
    User,
    Globe,
    Info
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

function ViewerDashboardContent() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'home';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [theme, setTheme] = useState('dark');
    const [showSplash, setShowSplash] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Feed Data
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [vipModalCreator, setVipModalCreator] = useState(null);
    const [followedIds, setFollowedIds] = useState(new Set());
    const [vipCreatorIds, setVipCreatorIds] = useState(new Set());
    const [notifications, setNotifications] = useState([]);

    // Sync tab from query param
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Listen to theme changes
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

    // Fetch Public Feed, Following & VIP Memberships
    useEffect(() => {
        fetchFeed();
        fetchFollowing();
        fetchMyVipMemberships();
    }, [selectedCategory, searchQuery]);

    const fetchMyVipMemberships = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('askme_token') : null;
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

    const fetchFeed = async () => {
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
                const fetched = data.data.creators;
                setCreators(fetched);

                // Generate sample notification queue
                const liveItems = fetched.filter(c => c.isLive);
                setNotifications(liveItems.map((item, idx) => ({
                    id: idx + 1,
                    title: `${item.fullName} is Broadcasting Live!`,
                    message: item.session?.title || 'Join live stream Q&A and support creator via instant UPI.',
                    time: 'Just now',
                    avatar: item.avatar,
                    sessionCode: item.session?.sessionCode,
                    isRead: false,
                })));
            }
        } catch (err) {
            console.warn('Viewer feed fetch error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowing = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('askme_token') : null;
            const res = await fetch(API_ENDPOINTS.VIEWERS.FOLLOWING, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const data = await res.json();
            if (res.ok && data.followingIds) {
                setFollowedIds(new Set(data.followingIds.map(String)));
            }
        } catch (err) {
            console.warn('Following list fetch error:', err.message);
        }
    };

    const handleToggleFollow = async (creatorId) => {
        const cidStr = String(creatorId);

        const wasFollowing = followedIds.has(cidStr);

        // Optimistic UI update
        const newFollowed = new Set(followedIds);

        if (wasFollowing) {
            newFollowed.delete(cidStr);
        } else {
            newFollowed.add(cidStr);
        }

        setFollowedIds(newFollowed);

        try {
            const token = localStorage.getItem("askme_token");

            const res = await fetch(API_ENDPOINTS.VIEWERS.FOLLOW, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token
                        ? { Authorization: `Bearer ${token}` }
                        : {}),
                },
                body: JSON.stringify({
                    creatorId: cidStr,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to toggle follow");
            }

            // Sync with backend response
            setFollowedIds((prev) => {
                const updated = new Set(prev);

                if (data.isFollowing) {
                    updated.add(cidStr);
                } else {
                    updated.delete(cidStr);
                }

                return updated;
            });

        } catch (err) {
            console.warn("Follow toggle error:", err.message);

            // Rollback optimistic update
            setFollowedIds((prev) => {
                const rollback = new Set(prev);

                if (wasFollowing) {
                    rollback.add(cidStr);
                } else {
                    rollback.delete(cidStr);
                }

                return rollback;
            });
        }
    };



    // Filter creators for 'following' tab
    const followingCreators = creators.filter(c => followedIds.has(String(c.creatorId)));

    return (
        <div className={`min-h-screen font-sans flex transition-colors duration-200 ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
            }`}>
            {/* 1. DESKTOP SIDEBAR */}
            <div className="hidden md:block sticky top-0 h-screen overflow-y-auto shrink-0 z-30">
                <ViewerSidebar
                    theme={theme}
                    onToggleTheme={(t) => setTheme(t)}
                    activeTab={activeTab}
                    onSelectTab={(tab) => setActiveTab(tab)}
                />
            </div>

            {/* 2. MAIN VIEWER CONTENT CONTAINER */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* MOBILE HEADER BAR WITH SIDEBAR TOGGLE */}
                <header className={`md:hidden sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between shadow-lg ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
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
                            AskMe <span className="text-brand-gradient">VIEWER</span>
                        </span>
                    </div>

                    <Link
                        href="/creators/login"
                        className="px-3 py-1.5 rounded-xl border border-[#00F5D4]/40 text-[#00F5D4] text-xs font-bold"
                    >
                        Creator Login
                    </Link>
                </header>

                {/* MOBILE DRAWER */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md flex">
                        <div className="w-64 max-w-[80vw] h-full">
                            <ViewerSidebar
                                theme={theme}
                                onToggleTheme={(t) => setTheme(t)}
                                activeTab={activeTab}
                                onSelectTab={(tab) => {
                                    setActiveTab(tab);
                                    setMobileMenuOpen(false);
                                }}
                            />
                        </div>
                        <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
                    </div>
                )}

                {/* TOP HEADER TITLE & SEARCH BAR */}
                <div className={`border-b px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md ${theme === 'light' ? 'bg-white/95 border-[#E9ECEF]' : 'bg-[#13131A]/95 border-[#1C1C26]'
                    }`}>
                    <div>
                        <h1 className={`font-heading font-black text-xl mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                            {activeTab === 'home' && 'Live Feed & Broadcast Discovery'}
                            {activeTab === 'live-sessions' && 'Active Live Broadcast Sessions'}
                            {activeTab === 'categories' && 'Category Filter & Channels'}
                            {activeTab === 'search' && 'Search & Discover Creators'}
                            {activeTab === 'creators' && 'Public Creator Directory'}
                            {activeTab === 'following' && 'Followed Creators'}
                            {activeTab === 'notifications' && 'Live Broadcast Notifications'}
                        </h1>
                    </div>

                    {/* Top Search Input */}
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8B8B96]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search creator name, @handle, title..."
                            className={`w-full pl-10 pr-4 py-2 rounded-2xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                }`}
                        />
                    </div>
                </div>

                {/* MAIN BODY VIEW BY TAB */}
                <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

                    {/* TAB 1: HOME / LIVE FEED & LIVE SESSIONS */}
                    {(activeTab === 'home') && (
                        <div className="space-y-6">
                            {/* Category Pill Bar */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                                <span className="text-xs font-bold text-[#8B8B96] shrink-0 flex items-center gap-1">
                                    <Filter className="h-3.5 w-3.5 text-[#00F5D4]" /> Category Filter:
                                </span>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${selectedCategory === cat
                                            ? 'bg-[#00F5D4] text-[#0A0A0F] shadow-sm'
                                            : theme === 'light'
                                                ? 'bg-white text-[#495057] border border-[#DEE2E6] hover:bg-[#F1F3F5]'
                                                : 'bg-[#13131A] text-[#8B8B96] border border-[#1C1C26] hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>



                            {/* Feed Grid (Shows ONLY Followed & Live Creators) */}
                            {loading ? (
                                <div className="p-12 text-center space-y-3">
                                    <Radio className="h-8 w-8 text-[#00F5D4] animate-spin mx-auto" />
                                    <p className="text-xs font-semibold text-[#8B8B96]">Loading Streams...</p>
                                </div>
                            ) : (() => {
                                const feedCreators = creators.filter(c => {
                                    const cid = String(c.creatorId || c.id || '');
                                    const isFollowing = followedIds.has(cid);
                                    return Boolean(c.isLive) || isFollowing;
                                });

                                if (feedCreators.length === 0) {
                                    return (
                                        <div className={`p-12 rounded-3xl border text-center space-y-4 max-w-md mx-auto ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                                            }`}>
                                            <ShieldAlert className="h-10 w-10 text-[#FFD60A] mx-auto" />
                                            <h3 className={`font-heading font-bold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>No Followed or Live Creators</h3>
                                            <p className="text-xs text-[#8B8B96]">There are currently no followed creators or active live streams. Follow creators to see them here!</p>
                                            <button
                                                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                                                className="px-4 py-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] text-xs font-bold"
                                            >
                                                Reset Category Filter
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {feedCreators.map(creator => {
                                            const isFollowing = followedIds.has(String(creator.creatorId || creator.id));

                                            return (
                                                <div
                                                    key={creator.creatorId || creator.id}
                                                    className="p-5 rounded-3xl bg-[#13131A] border border-[#22222E] hover:border-[#FF5722]/50 shadow-2xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                                                >
                                                    <div className="space-y-3.5">
                                                        {/* TOP BAR: LIVE NOW / FOLLOWED CREATOR Badge & Category Tag */}
                                                        <div className="flex items-center justify-between gap-2 pb-1">
                                                            {creator.isLive ? (
                                                                <span className="px-3 py-1 rounded-full bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF3D71] animate-ping"></span>
                                                                    LIVE NOW
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                                                    FOLLOWED CREATOR
                                                                </span>
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
                                                                    onClick={() => handleToggleFollow(creator.creatorId)}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border ${isFollowing
                                                                        ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30'
                                                                        : 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 hover:bg-[#00E676]/20'
                                                                        }`}
                                                                >
                                                                    <Bell className="h-3.5 w-3.5" />
                                                                    {isFollowing ? 'Following' : '+ Follow'}
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

                                                        {/* 2. SESSION TITLE WITH EMOJI */}
                                                        <div className="space-y-1.5">
                                                            {/* <h3 className="font-heading font-black text-base text-white leading-snug flex items-start gap-2">
                                                            <span className="text-lg shrink-0">🎙️</span>
                                                            <span>{creator.session?.title || `${creator.fullName}'s Official Live Q&A Broadcast`}</span>
                                                        </h3> */}

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

                                                        {/* ACTION BUTTON ROW 2: Join VIP Membership / VIP Member Status */}
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
                                );
                            })()}
                        </div>
                    )}

                    {/* TAB 4: CREATOR DIRECTORY */}
                    {activeTab === 'creators' && (
                        <div className="space-y-4">
                            <h2 className={`font-heading font-extrabold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                AskMe Creator Directory ({creators.length})
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {creators.map(creator => (
                                    <div
                                        key={creator.creatorId}
                                        className={`p-5 rounded-3xl border space-y-3 flex items-center justify-between gap-4 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <img src={creator.avatar} alt={creator.fullName} className="h-12 w-12 rounded-2xl object-cover border border-[#00F5D4]/30 shrink-0" />
                                            <div className="overflow-hidden">
                                                <h4 className={`font-heading font-extrabold text-sm truncate ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                                    {creator.fullName}
                                                </h4>
                                                <p className="text-xs text-[#00F5D4] font-mono">{creator.username}</p>
                                                <p className="text-[10px] text-[#8B8B96] truncate">{creator.category || 'Content Creator'}</p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/creator/${creator.cleanUsername}`}
                                            className="px-3.5 py-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] text-xs font-bold shrink-0"
                                        >
                                            Profile →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: FOLLOWING */}
                    {activeTab === 'following' && (
                        <div className="space-y-4">
                            <h2 className={`font-heading font-extrabold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                Followed Creators ({followingCreators.length})
                            </h2>

                            {followingCreators.length === 0 ? (
                                <div className={`p-8 rounded-3xl border text-center space-y-3 max-w-md mx-auto ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                                    }`}>
                                    <Heart className="h-8 w-8 text-[#FF3D71] mx-auto" />
                                    <p className="text-xs text-[#8B8B96]">You are not following any creators yet. Explore the live feed to follow top creators!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {followingCreators.map(creator => (
                                        <div
                                            key={creator.creatorId}
                                            className={`p-5 rounded-3xl border space-y-3 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={creator.avatar} alt={creator.fullName} className="h-10 w-10 rounded-2xl object-cover" />
                                                    <div>
                                                        <h4 className="font-heading font-bold text-sm text-white">{creator.fullName}</h4>
                                                        <p className="text-xs text-[#00F5D4]">{creator.username}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleToggleFollow(creator.creatorId)}
                                                    className="px-3 py-1 rounded-xl bg-[#FF3D71]/10 text-[#FF3D71] text-xs font-bold border border-[#FF3D71]/30"
                                                >
                                                    Unfollow
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 6: NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-4">
                            <h2 className={`font-heading font-extrabold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                Live Broadcast Notifications
                            </h2>

                            <div className="space-y-3">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={n.avatar} alt="Creator" className="h-10 w-10 rounded-2xl object-cover border border-[#00F5D4]" />
                                            <div>
                                                <h4 className="font-heading font-bold text-sm text-white">{n.title}</h4>
                                                <p className="text-xs text-[#8B8B96]">{n.message}</p>
                                            </div>
                                        </div>

                                        {n.sessionCode && (
                                            <Link
                                                href={`/pay/${n.sessionCode}`}
                                                className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-bold shadow-md"
                                            >
                                                Join Stream
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
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
        </div>
    );
}

export default function ViewerDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6 text-xs font-bold">
                Loading Viewer Studio Dashboard...
            </div>
        }>
            <ViewerDashboardContent />
        </Suspense>
    );
}
