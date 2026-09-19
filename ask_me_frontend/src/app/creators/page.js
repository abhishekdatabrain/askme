'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import CreatorCard from '@/components/CreatorCard';
import VipMembershipModal from '@/components/VipMembershipModal';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { getViewerToken, getCookie, getViewerUser } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';
import {
  Search,
  Sparkles,
  Filter,
  Users,
  Video,
  Star,
  Crown,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'All',
  'Gaming',
  'Technology',
  'Crypto & Web3',
  'Business',
  'Music',
  'Lifestyle',
];

export default function AllCreatorsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State Management - Fully Dynamic with Server-Side Search & 9 Items Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'live' | 'top_rated' | 'vip'

  const [creatorsList, setCreatorsList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCreators, setTotalCreators] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [followedCreators, setFollowedCreators] = useState({});
  const [vipModalCreator, setVipModalCreator] = useState(null);
  const [askModalCreator, setAskModalCreator] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [questionAmount, setQuestionAmount] = useState(100);

  // Debounce search query input to trigger server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch backend creators dynamically with server-side search & pagination
  const fetchBackendCreators = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const baseUrl = API_ENDPOINTS?.VIEWERS?.PUBLIC_LIVE_FEED || 'http://localhost:5000/api/viewers/public/live-feed';
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', 9);

      if (debouncedSearch && debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`${baseUrl}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      const rawCreators = data?.data?.creators || data?.creators || data?.data || [];
      const serverHasMore = !!(data?.hasMore ?? data?.data?.hasMore);
      const serverTotal = data?.total || data?.data?.totalCreators || rawCreators.length;

      if (Array.isArray(rawCreators)) {
        const mappedCreators = rawCreators.map((item, idx) => {
          const cidStr = String(item.creatorId || item.id || idx + 1);
          const cleanUser = item.cleanUsername || (item.username ? String(item.username).replace(/^@+/, '') : `creator_${idx}`);
          const followers = item.followersCount || 0;
          const subsFormatted = followers >= 1000000
            ? `${(followers / 1000000).toFixed(1)}M`
            : (followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : `${followers}`);

          // Resolve avatar and thumbnail images dynamically using getMediaUrl
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
            answeredCount: String(item.answeredCount || 0),
            bio: item.bio || item.session?.description || 'Ask me anything live on stream or offline.',
            isLive: !!(item.isLive || item.session?.status === 'active'),
            isVip: item.vipMembershipEnabled !== false,
            youtubeUrl: item.youtubeUrl || `https://youtube.com/@${cleanUser}`,
            sessionCode: sessionCode
          };
        });

        if (append) {
          setCreatorsList((prev) => {
            const existingIds = new Set(prev.map((c) => String(c.id)));
            const uniqueNew = mappedCreators.filter((c) => !existingIds.has(String(c.id)));
            return [...prev, ...uniqueNew];
          });
        } else {
          setCreatorsList(mappedCreators);
        }

        setHasMore(serverHasMore);
        setTotalCreators(serverTotal);
        setFetchError(null);
      }
    } catch (err) {
      console.warn('Backend creators fetch error:', err.message);
      setFetchError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Re-fetch on category or debounced search change
  useEffect(() => {
    setPage(1);
    fetchBackendCreators(1, false);
  }, [debouncedSearch, selectedCategory]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBackendCreators(nextPage, true);
  };

  // Fetch following state for viewer
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

  // Toggle Creator Follow
  const toggleFollow = async (creator) => {
    const creatorId = creator.id || creator.creatorId;
    const token = getViewerToken() || getCookie('askme_viewer_token') || (typeof window !== 'undefined' ? localStorage.getItem('askme_viewer_token') : null);

    if (!token) {
      if (toast?.warning) {
        toast.warning('Please log in as a viewer to follow creators.', 'Authentication Required');
      }
      setTimeout(() => { router.push('/'); }, 1200);
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
      if (toast?.warning) {
        toast.warning('Please log in as a viewer to join VIP Membership.', 'Authentication Required');
      }
      setTimeout(() => { router.push('/viewers/login'); }, 1200);
      return;
    }
    setVipModalCreator(creator);
  };

  // Redirect directly to creator payment / superchat page on Ask Question click
  const handleAskQuestion = (creator) => {
    console.log(creator);
    const payCode = creator.sessionCode;
    router.push(`/pay/${payCode}`);
  };

  // Submit Ask Question
  const handleSendQuestion = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const token = getViewerToken() || getCookie('askme_viewer_token');
    if (!token) {
      if (toast?.warning) {
        toast.warning('Please log in as a viewer to ask a question.', 'Authentication Required');
      }
      setTimeout(() => { router.push('/viewers/login'); }, 1200);
      return;
    }

    if (toast?.success) {
      toast.success(`Question submitted to ${askModalCreator?.name}!`, 'Question Sent');
    }
    setAskModalCreator(null);
    setQuestionText('');
  };

  // Filtered & Sorted Creators List
  const filteredCreators = useMemo(() => {
    return creatorsList.filter((creator) => {
      // Quick Filter Types
      if (filterType === 'live' && !creator.isLive) return false;
      if (filterType === 'top_rated' && creator.rating < 4.8) return false;
      if (filterType === 'vip' && !creator.isVip) return false;
      return true;
    });
  }, [creatorsList, filterType]);

  const liveCount = useMemo(() => creatorsList.filter((c) => c.isLive).length, [creatorsList]);

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col justify-between">
      {/* 1. Global Navigation Bar */}
      <LandingNavbar />

      {/* 2. Main Page Content */}
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 w-full flex-1">

        {/* SEARCH & FILTERS CONTROLS BAR */}
        <section className="space-y-5">
          {/* Top Search Input & Sort Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search creator by name, @handle, topic or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-11 pr-10 rounded-2xl bg-[#0D0D14] border border-[#222234] text-sm text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000] transition-all shadow-inner"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A7A8E]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7A7A8E] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort & Status Quick Filter Row */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Quick Filter Buttons */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-[#0D0D14] border border-[#222234] text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'all'
                    ? 'bg-[#EB1000] text-white shadow-md'
                    : 'text-[#8E8E9F] hover:text-white'
                    }`}
                >
                  All ({totalCreators || creatorsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('live')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${filterType === 'live'
                    ? 'bg-[#EB1000] text-white shadow-md'
                    : 'text-[#8E8E9F] hover:text-white'
                    }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00E599] animate-pulse"></span>
                  Live ({liveCount})
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORY_OPTIONS.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${isActive
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'bg-[#0D0D14] border border-[#222234] text-[#8E8E9F] hover:text-white hover:border-[#383850]'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* CREATORS GRID SECTION */}
        <section className="space-y-6 text-left">
          {/* Results Count Header */}
          <div className="flex items-center justify-between text-xs text-[#8E8E9F] font-semibold">
            <div>
              Showing <span className="text-white font-bold">{filteredCreators.length}</span> of <span className="text-white font-bold">{totalCreators || filteredCreators.length}</span> creators
              {selectedCategory !== 'All' && <span> in <strong className="text-[#EB1000]">{selectedCategory}</strong></span>}
            </div>
            <button
              type="button"
              onClick={() => fetchBackendCreators(1, false)}
              className="text-[#8E8E9F] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Database
            </button>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
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
            <>
              {/* Dynamic Creators Grid (9 Items per page) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    isFollowing={!!followedCreators[String(creator.id || creator.creatorId)]}
                    onToggleFollow={() => toggleFollow(creator)}
                    onAskQuestion={() => handleAskQuestion(creator)}
                    onSelectCreator={() => router.push(`/creator/${creator.cleanUsername}`)}
                    onJoinVip={() => handleJoinVip(creator)}
                  />
                ))}
              </div>

              {/* LOAD MORE BUTTON */}
              {hasMore && (
                <div className="pt-8 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-full bg-[#161622] hover:bg-[#1E1E2E] border border-[#2A2A3E] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:border-[#EB1000]/60 hover:shadow-[#EB1000]/20 flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-[#EB1000]" />
                        <span>Loading More...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Creators</span>
                        <ArrowRight className="h-4 w-4 text-[#EB1000] rotate-90" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="rounded-3xl bg-[#0D0D14] border border-[#222234] p-12 text-center space-y-4 max-w-lg mx-auto my-12">
              <div className="h-16 w-16 rounded-full bg-[#181824] border border-[#28283C] text-[#8E8E9F] flex items-center justify-center mx-auto text-2xl">
                👤
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {creatorsList.length === 0 ? 'No creators registered yet' : 'No creators found'}
              </h3>
              <p className="text-xs text-[#8E8E9F] leading-relaxed">
                {creatorsList.length === 0
                  ? 'There are currently no registered creators in the backend database. New creators will appear here as soon as they register.'
                  : `No creators matched your search query "${searchQuery}" or category filter.`}
              </p>
              {creatorsList.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setFilterType('all');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#EB1000] text-white text-xs font-bold hover:bg-[#CC0E00] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              ) : (
                <Link
                  href="/creators/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EB1000] text-white text-xs font-bold hover:bg-[#CC0E00] transition-colors cursor-pointer"
                >
                  <span>Become the First Creator</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </section>
      </main>

      {/* 3. VIP Membership Modal */}
      {vipModalCreator && (
        <VipMembershipModal
          isOpen={!!vipModalCreator}
          onClose={() => setVipModalCreator(null)}
          creator={vipModalCreator}
        />
      )}

      {/* 4. Quick Ask Question Modal Overlay */}
      {askModalCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#0D0D14] border border-[#222234] p-6 shadow-2xl space-y-5 text-left relative animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E1E2C] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={askModalCreator.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border border-[#EB1000]"
                />
                <div>
                  <h3 className="font-heading font-extrabold text-white text-base">
                    Ask {askModalCreator.name}
                  </h3>
                  <span className="text-xs text-[#8E8E9F]">{askModalCreator.handle}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAskModalCreator(null)}
                className="h-8 w-8 rounded-full bg-[#181824] border border-[#262638] text-[#8E8E9F] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Question Form */}
            <form onSubmit={handleSendQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A0A0B2] mb-1.5">
                  Your Question / SuperChat Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={`Type your question for ${askModalCreator.name}... They will answer verbally on air.`}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#14141E] border border-[#222234] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#EB1000] transition-all"
                />
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-bold text-[#A0A0B2] mb-1.5">
                  Support Amount (Min ₹{askModalCreator.minFee})
                </label>
                <div className="flex items-center gap-2">
                  {[askModalCreator.minFee || 100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setQuestionAmount(amt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${questionAmount === amt
                        ? 'bg-[#EB1000] text-white shadow-md'
                        : 'bg-[#14141E] border border-[#222234] text-[#8E8E9F] hover:text-white'
                        }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-[#180A0C] border border-[#EB1000]/30 text-[11px] text-[#EB1000] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>100% Protection: Full refund if creator misses your question.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAskModalCreator(null)}
                  className="w-1/2 py-3 rounded-full bg-[#161622] border border-[#262638] text-white text-xs font-bold hover:bg-[#202030] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-full bg-[#EB1000] text-white text-xs font-extrabold shadow-lg shadow-[#EB1000]/30 hover:bg-[#CC0E00] transition-all cursor-pointer"
                >
                  Submit Question (₹{questionAmount})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Global Landing Footer */}
      <LandingFooter />
    </div>
  );
}
