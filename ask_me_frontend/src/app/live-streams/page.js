'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import CreatorCard from '@/components/CreatorCard';
import VipMembershipModal from '@/components/VipMembershipModal';
import StreamPlayerModal from '@/components/StreamPlayerModal';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { getViewerToken, getCookie, getViewerUser } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';
import {
  Radio,
  Tv,
  Video,
  Users,
  Search,
  RefreshCw,
  Crown,
  MessageSquare,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  Activity,
  Flame,
  Filter,
  Sparkles,
} from 'lucide-react';

export default function PublicLiveStreamsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [creatorsList, setCreatorsList] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('live'); // default to live
  const [followedCreators, setFollowedCreators] = useState({});
  const [vipModalCreator, setVipModalCreator] = useState(null);
  const [streamModalCreator, setStreamModalCreator] = useState(null);
  const [currentLiveIndex, setCurrentLiveIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const categories = [
    'All',
    'Gaming',
    'Education',
    'Technology',
    'Entertainment',
    'Music',
    'Business',
  ];

  // Fetch Public Live Feed & Creators
  const fetchBackendLiveFeed = async () => {
    try {
      setLoading(true);
      const url = API_ENDPOINTS?.VIEWERS?.PUBLIC_LIVE_FEED || 'http://localhost:5000/api/viewers/public/live-feed';
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();

      const rawCreators = data?.data?.creators || data?.creators || data?.data || [];
      if (Array.isArray(rawCreators)) {
        const mappedCreators = rawCreators.map((item, idx) => {
          const cidStr = String(item.creatorId || item.id || idx + 1);
          const cleanUser = item.cleanUsername || (item.username ? String(item.username).replace(/^@+/, '') : `creator_${idx}`);
          const followers = item.followersCount || 0;
          const subsFormatted = followers >= 1000000
            ? `${(followers / 1000000).toFixed(1)}M`
            : (followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : `${followers}`);

          const avatarUrl = item.avatar || item.profile_image || item.session?.thumbnail;
          const bannerUrl = item.session?.thumbnail || item.banner;
          const sessionCode = item.session?.sessionCode;

          return {
            id: cidStr,
            creatorId: item.creatorId || item.id,
            name: item.fullName || item.name || item.username || 'Creator',
            handle: `@${cleanUser}`,
            cleanUsername: cleanUser,
            avatar: avatarUrl ? getMediaUrl(avatarUrl) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            banner: bannerUrl ? getMediaUrl(bannerUrl) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            category: item.category || item.session?.category || 'Technology',
            platform: item.session?.platform?.toLowerCase() || item.platform || 'youtube',
            minFee: item.minFee || item.session?.minDonationAmount || 100,
            subscribers: subsFormatted,
            rating: item.rating || 4.85,
            answeredCount: String(item.answeredCount !== undefined ? item.answeredCount : (item.session?.answeredCount !== undefined ? item.session.answeredCount : 0)),
            bio: item.bio || item.session?.description || 'Ask me anything live on stream or offline.',
            isLive: !!(item.isLive || item.session?.status === 'active'),
            isVip: item.vipMembershipEnabled !== false,
            youtubeUrl: item.youtubeUrl || item.session?.streamUrl || `https://youtube.com/@${cleanUser}`,
            liveStreamUrl: item.streamUrl || item.liveStreamUrl || item.session?.streamUrl || item.session?.stream_url || item.youtubeUrl || item.session?.youtubeUrl || (cleanUser ? `https://youtube.com/@${cleanUser}/live` : 'https://youtube.com'),
            sessionCode: sessionCode,
            streamTitle: item.session?.title || '',
            title: item.session?.title || `${item.fullName || item.username} is Live`,
            watchingCount: (item.session?.watchingCount || Math.floor(Math.random() * 15000 + 3000)).toLocaleString(),
            broadcastingTo: item.session?.platform ? item.session.platform.toUpperCase() : 'YOUTUBE & TWITCH',
            queueCount: item.pendingQueue !== undefined ? item.pendingQueue : (item.session?.pendingQueue !== undefined ? item.session.pendingQueue : 0),
            pendingQueue: item.pendingQueue !== undefined ? item.pendingQueue : (item.session?.pendingQueue !== undefined ? item.session.pendingQueue : 0),
            latency: '0.3s',
          };
        });

        setCreatorsList(mappedCreators);

        // Filter live streams for showcase carousel
        const liveOnly = mappedCreators.filter((c) => c.isLive);
        setLiveStreams(liveOnly.length > 0 ? liveOnly : mappedCreators.slice(0, 3));
      }
    } catch (err) {
      console.warn('Public live feed error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendLiveFeed();
    // const interval = setInterval(fetchBackendLiveFeed, 5000);
    // return () => clearInterval(interval);
  }, []);

  // Fetch Viewer Following List
  useEffect(() => {
    const fetchViewerFollowing = async () => {
      const token = getViewerToken() || getCookie('askme_viewer_token') || (typeof window !== 'undefined' ? localStorage.getItem('askme_viewer_token') : null);
      const user = getViewerUser();
      if (!token) return;

      try {
        const url = `${API_ENDPOINTS?.VIEWERS?.FOLLOWING || 'http://localhost:5000/api/viewers/following'}?userId=${user?.id || ''}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.followingIds && Array.isArray(data.followingIds)) {
            const map = {};
            data.followingIds.forEach((id) => { map[String(id)] = true; });
            setFollowedCreators(map);
          }
        }
      } catch (err) {
        console.warn('Viewer following check error:', err);
      }
    };

    fetchViewerFollowing();
  }, []);

  // Auto Rotate Live Showcase
  useEffect(() => {
    if (!isAutoRotating || liveStreams.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentLiveIndex((prev) => (prev + 1) % liveStreams.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isAutoRotating, liveStreams.length]);

  // Toggle Creator Follow
  const toggleFollow = async (creator) => {
    const creatorId = creator.id || creator.creatorId;
    const token = getViewerToken() || getCookie('askme_viewer_token') || (typeof window !== 'undefined' ? localStorage.getItem('askme_viewer_token') : null);

    if (!token) {
      if (toast?.warning) {
        toast.warning('Please log in as a viewer to follow creators.', 'Authentication Required');
      }
      setTimeout(() => { router.push('/viewers/login'); }, 1200);
      return;
    }

    const currentlyFollowing = !!followedCreators[String(creatorId)];
    setFollowedCreators((prev) => ({
      ...prev,
      [String(creatorId)]: !currentlyFollowing,
    }));

    if (toast?.success) {
      toast.success(
        currentlyFollowing
          ? `Unfollowed ${creator.name}`
          : `You are now following ${creator.name}!`,
        currentlyFollowing ? 'Unfollowed' : 'Following'
      );
    }
  };

  // Handler for joining VIP
  const handleJoinVip = (creator) => {
    const token = getViewerToken() || getCookie('askme_viewer_token');
    if (!token) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'askme_toast_pending',
          JSON.stringify({
            message: 'Please log in as a viewer to join VIP Membership.',
            type: 'warning',
            title: 'Authentication Required',
          })
        );
      }
      if (toast?.warning) {
        toast.warning('Please log in as a viewer to join VIP Membership.', 'Authentication Required');
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('askme_toast', {
            detail: {
              message: 'Please log in as a viewer to join VIP Membership.',
              type: 'warning',
              title: 'Authentication Required',
            },
          })
        );
      }
      router.push('/');
      return;
    }
    setVipModalCreator(creator);
  };

  // Open embedded live stream player modal on Watch Stream click
  const handleWatchStream = (creator) => {
    setStreamModalCreator(creator);
  };

  // Redirect directly to creator payment page on Ask Question click
  const handleAskQuestion = (creator) => {
    const payCode = creator.sessionCode || creator.cleanUsername;
    if (payCode) {
      router.push(`/pay/${payCode}`);
    } else {
      router.push('/');
    }
  };

  // Filtered Creators List
  const filteredCreators = useMemo(() => {
    return creatorsList.filter((creator) => {
      // Category Filter
      if (selectedCategory !== 'All' && creator.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = creator.name.toLowerCase().includes(q);
        const matchesHandle = creator.handle.toLowerCase().includes(q);
        const matchesCategory = creator.category.toLowerCase().includes(q);
        const matchesBio = creator.bio.toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesCategory && !matchesBio) {
          return false;
        }
      }

      // Quick Filter Types
      if (filterType === 'live' && !creator.isLive) return false;
      if (filterType === 'top_rated' && creator.rating < 4.8) return false;
      if (filterType === 'vip' && !creator.isVip) return false;

      return true;
    });
  }, [creatorsList, selectedCategory, searchQuery, filterType]);

  const activeLiveCount = useMemo(() => creatorsList.filter((c) => c.isLive).length, [creatorsList]);
  const currentFeatured = liveStreams[currentLiveIndex] || liveStreams[0];

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col justify-between">
      {/* Global Navigation Bar */}
      <LandingNavbar />

      {/* Main Page Content */}
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 w-full flex-1">

        {/* SEARCH, CATEGORY & QUICK FILTERS SECTION */}
        <section className="space-y-6 text-left">
          {/* Top Search & Category Filter Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-[#7A7A8E] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search live creators by name, handle, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0D0D14] border border-[#222234] text-xs sm:text-sm text-white placeholder-[#7A7A8E] focus:outline-none focus:border-[#EB1000]/60 transition-all shadow-md"
              />
            </div>


          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1A1A28]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${selectedCategory === cat
                  ? 'bg-white text-black font-extrabold border-2 border-[#EB1000] shadow-[0_0_15px_rgba(235,16,0,0.4)]'
                  : 'bg-[#0E0E18] text-[#8E8E9F] border border-[#222234] hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results Count Header */}
          <div className="flex items-center justify-between text-xs text-[#8E8E9F] font-semibold">
            <div>
              Showing <span className="text-white font-bold">{filteredCreators.length}</span> live streams
              {selectedCategory !== 'All' && <span> in <strong className="text-[#EB1000]">{selectedCategory}</strong></span>}
            </div>
            <button
              type="button"
              onClick={fetchBackendLiveFeed}
              className="text-[#8E8E9F] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Feed
            </button>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="rounded-3xl bg-[#0D0D14] border border-[#1E1E2C] p-5 space-y-4 animate-pulse">
                  <div className="h-36 w-full rounded-2xl bg-[#161622]"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-[#1C1C2A]"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 rounded bg-[#1C1C2A]"></div>
                      <div className="h-3 w-1/2 rounded bg-[#161622]"></div>
                    </div>
                  </div>
                  <div className="h-12 w-full rounded-xl bg-[#161622]"></div>
                </div>
              ))}
            </div>
          ) : filteredCreators.length > 0 ? (
            /* Dynamic Creators Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  isFollowing={!!followedCreators[String(creator.id || creator.creatorId)]}
                  onToggleFollow={() => toggleFollow(creator)}
                  onAskQuestion={() => handleAskQuestion(creator)}
                  onSelectCreator={() => handleWatchStream(creator)}
                  onJoinVip={() => handleJoinVip(creator)}
                  profileButtonText="Watch Stream"
                  hideYoutube={true}
                  useLiveQueueMetrics={true}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-3xl bg-[#0D0D14] border border-[#222234] p-12 text-center space-y-4 max-w-lg mx-auto my-12">
              <div className="h-16 w-16 rounded-full bg-[#181824] border border-[#28283C] text-[#8E8E9F] flex items-center justify-center mx-auto text-2xl">
                📡
              </div>
              <h3 className="text-xl font-extrabold text-white">
                No active live streams found
              </h3>
              <p className="text-xs text-[#8E8E9F] leading-relaxed">
                There are currently no broadcasters matching your search query or category filter. Check back shortly as creators go live dynamically.
              </p>

            </div>
          )}
        </section>
      </main>

      {/* Landing Footer */}
      <LandingFooter />

      {/* Dynamic VIP Membership Modal */}
      <VipMembershipModal
        isOpen={!!vipModalCreator}
        onClose={() => setVipModalCreator(null)}
        creator={vipModalCreator}
        onSuccess={() => {
          if (toast?.success) toast.success(`Successfully joined ${vipModalCreator?.name}'s VIP Membership!`, 'VIP Unlocked');
        }}
      />

      {/* Embedded Live Stream Player Modal */}
      <StreamPlayerModal
        isOpen={!!streamModalCreator}
        onClose={() => setStreamModalCreator(null)}
        creator={streamModalCreator}
      />
    </div>
  );
}
