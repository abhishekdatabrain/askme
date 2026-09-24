'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import CreatorCard from '@/components/CreatorCard';
import Logo from '../components/Logo';
import VipMembershipModal from '@/components/VipMembershipModal';
import StreamPlayerModal from '@/components/StreamPlayerModal';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { getViewerToken, getCookie, getViewerUser } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';
import AuthModal from '@/components/AuthModal';
import OriginalScannerImage from '@/components/OriginalScannerImage';

import {
  Sparkles,
  Search,
  Zap,
  TrendingUp,
  ShieldCheck,
  Video,
  DollarSign,
  Crown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowRight,
  HelpCircle,
  Clock,
  Award,
  Play,
  Flame,
  QrCode,
  Radio,
  Tv,
  Activity,
  Check,
  ExternalLink,
  Copy,
  Download,
  MessageSquare,
  Bell,
  Smartphone,
  Monitor,
  MessageCircle,
  Heart,
  Star,
  ShoppingBag,
  RefreshCw,
  RotateCcw,
  XCircle,
  AlertCircle,
  Share2,
  Layers,
  Rocket,
  Compass,
  Filter,
  Users,
  Volume2,
  BookmarkCheck,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorPageIndex, setCreatorPageIndex] = useState(0);
  const [vipModalCreator, setVipModalCreator] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState('viewer');
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuthModal = (role = 'viewer', mode = 'login') => {
    setAuthModalRole(role);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    const handleOpenAuthEvent = (e) => {
      const { role = 'viewer', mode = 'login' } = e.detail || {};
      setAuthModalRole(role);
      setAuthModalMode(mode);
      setAuthModalOpen(true);
    };
    window.addEventListener('open_askme_auth_modal', handleOpenAuthEvent);
    return () => {
      window.removeEventListener('open_askme_auth_modal', handleOpenAuthEvent);
    };
  }, []);
  const [selectedComparisonTab, setSelectedComparisonTab] = useState('All Highlights');
  const [scootPhilosophyTab, setScootPhilosophyTab] = useState(1);
  const [activeStepIndex, setActiveStepIndex] = useState(3); // Default Step 04 (KEEP WATCHING) as shown in reference
  const [guaranteedVisibilityTab, setGuaranteedVisibilityTab] = useState(2); // 1: You Asked, 2: Creator Answering Live, 3: Spoken On Air ✓
  const [isAutoPlayingJourney, setIsAutoPlayingJourney] = useState(true);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [mainHeroSlide, setMainHeroSlide] = useState(0);

  // Auto Slider for 5-Step Journey (rotates Step 01 to Step 05 automatically every 4.5s)
  useEffect(() => {
    if (!isAutoPlayingJourney) return;
    const journeyInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(journeyInterval);
  }, [isAutoPlayingJourney]);

  // Reset creator slider page when category or search query changes
  useEffect(() => {
    setCreatorPageIndex(0);
  }, [selectedCategory, searchQuery]);

  // Auto Slider for Main Hero Section (rotates Hero View 1 and View 2 automatically)
  useEffect(() => {
    const mainHeroTimer = setInterval(() => {
      setMainHeroSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(mainHeroTimer);
  }, []);

  const [publicTestimonials, setPublicTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialScrollIndex, setTestimonialScrollIndex] = useState(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);
  const testimonialContainerRef = useRef(null);

  // Fetch Public Testimonials dynamically from Admin API
  useEffect(() => {
    const fetchPublicTestimonials = async () => {
      try {
        const url = API_ENDPOINTS?.TESTIMONIALS?.PUBLIC || 'http://localhost:5000/api/public/creator-testimonials';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setPublicTestimonials(data.data);
          }
        }
      } catch (err) {
        console.warn('Error fetching public creator testimonials:', err);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchPublicTestimonials();
  }, []);

  // Auto-slide testimonials in 1 single row
  useEffect(() => {
    if (isTestimonialHovered || !publicTestimonials || publicTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setTestimonialScrollIndex((prev) => (prev + 1) % publicTestimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isTestimonialHovered, publicTestimonials]);

  useEffect(() => {
    if (!testimonialContainerRef.current || !publicTestimonials || publicTestimonials.length === 0) return;
    const container = testimonialContainerRef.current;
    const cardWidth = 360;
    container.scrollTo({ left: testimonialScrollIndex * cardWidth, behavior: 'smooth' });
  }, [testimonialScrollIndex, publicTestimonials]);

  // Handler for joining VIP Membership with Auth Check
  const handleJoinVip = (creator) => {
    // Check viewer authentication ONLY (do not accept creator askme_token for viewer VIP actions)
    const token = getViewerToken() || getCookie('askme_viewer_token');

    // IF NOT LOGGED IN AS VIEWER -> OPEN POPUP AUTH MODAL ON LANDING PAGE
    if (!token) {
      openAuthModal('viewer', 'login');
      return;
    }

    // IF LOGGED IN AS VIEWER -> OPEN VIP MEMBERSHIP MODAL
    setVipModalCreator(creator);
  };
  const [calcAmount, setCalcAmount] = useState(250000); // Default ₹2,50,000
  const [copiedObsUrl, setCopiedObsUrl] = useState(false);
  const [howItWorksTab, setHowItWorksTab] = useState('viewer');
  const [selectedFaqTab, setSelectedFaqTab] = useState('All Questions');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState(['q1', 'q5']);

  // Dynamic Live Streams Showcase State & Feed
  const initialLiveStreams = [
    {
      id: 'live-1',
      creatorName: 'Riya',
      username: '@riya',
      category: 'TECH & AI SYSTEMS',
      subscribers: '420K',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      title: 'Riya is Live',
      streamTitle: '"AI Coding, Autonomous Agents & Next-Gen Developer Stack Q&A Session"',
      broadcastingTo: 'YouTube & Twitch',
      watchingCount: '14,280',
      latency: '0.4s',
      queueCount: 4,
      minFee: '$10',
      sessionCode: 'prince-live-01',
      isLive: true,
    },

  ];

  const [liveStreams, setLiveStreams] = useState(initialLiveStreams);
  const [currentLiveIndex, setCurrentLiveIndex] = useState(0);
  const [followedCreators, setFollowedCreators] = useState({});
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [streamModalCreator, setStreamModalCreator] = useState(null);

  // Fetch live streams from Backend API dynamically with 4s real-time polling (Server-Side Filtering)
  useEffect(() => {
    let isMounted = true;

    const fetchBackendLiveFeed = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'All') {
          params.append('category', selectedCategory);
        }
        if (searchQuery && searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }

        const baseUrl = API_ENDPOINTS?.VIEWERS?.PUBLIC_LIVE_FEED || 'http://localhost:5000/api/viewers/public/live-feed';
        const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        // Backend returns data.data.creators list
        const rawCreators = data?.data?.creators || data?.creators || data?.data || [];
        if (Array.isArray(rawCreators)) {
          // Filter creators who have an active live stream
          const liveOnly = rawCreators.filter((item) => item.isLive || item.session?.status === 'active');
          if (liveOnly.length > 0) {
            const mappedBackendLive = liveOnly.map((item, idx) => ({
              id: item.session?.id || item.creatorId || `backend-live-${idx}`,
              creatorId: item?.session?.creatorId || item.creatorId || item.id,
              creatorName: item.fullName || item.name || item.username || 'Live Creator',
              username: item.username || `@${item.cleanUsername || 'creator'}`,
              category: (item.session?.category || item.category || 'LIVE BROADCAST').toUpperCase(),
              subscribers: `${item.followersCount || '100K'} Followers`,
              avatar: item.session?.thumbnail || item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
              title: item.session?.title ? `${item.fullName || item.username} - ${item.session.title}` : `${item.fullName || item.username} is Live`,
              streamTitle: item.session?.description ? `"${item.session.description}"` : `"${item.bio || 'Live Q&A & Audience SuperChat Session'}"`,
              broadcastingTo: item.session?.platform || item.platform || 'YouTube & Twitch',
              watchingCount: (item.session?.watchingCount || Math.floor(Math.random() * 20000 + 5000)).toLocaleString(),
              latency: '0.3s',
              queueCount: item.pendingQueue !== undefined ? item.pendingQueue : (item.session?.pendingQueue || 4),
              minFee: `₹${item.minFee || item.session?.minDonationAmount || 100}`,
              sessionCode: item.session?.sessionCode || item.cleanUsername || item.creatorId,
              liveStreamUrl: item.streamUrl || item.liveStreamUrl || item.session?.streamUrl || item.session?.stream_url || item.youtubeUrl || item.session?.youtubeUrl || (item.cleanUsername ? `https://youtube.com/@${item.cleanUsername}/live` : 'https://youtube.com'),
              isLive: true,
            }));

            if (isMounted) {
              setLiveStreams(mappedBackendLive);
            }
          }

          // Map all backend creators dynamically for Section 9 Discovery Grid
          const mappedCreatorsGrid = rawCreators.map((item, idx) => {
            const cidStr = String(item.creatorId || item.id || idx + 1);
            const cleanUser = item.cleanUsername || (item.username ? String(item.username).replace(/^@+/, '') : 'creator');
            const followers = item.followersCount || 0;
            const subsFormatted = followers >= 1000000
              ? `${(followers / 1000000).toFixed(1)}M`
              : (followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : `${followers}`);

            return {
              id: cidStr,
              creatorId: item.creatorId || item.id,
              name: item.fullName || item.name || item.username || 'Creator',
              handle: `@${cleanUser}`,
              cleanUsername: cleanUser,
              avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              banner: item.session?.thumbnail || item.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
              category: item.category || item.session?.category || 'Technology',
              platform: item.session?.platform?.toLowerCase() || item.platform || 'youtube',
              minFee: item.minFee || item.session?.minDonationAmount || 100,
              subscribers: subsFormatted,
              sessionCode: item.session?.sessionCode,
              rating: item.rating,
              answeredCount: String(item.answeredCount || 0),
              bio: item.bio || item.session?.description || 'Tech reviews, startup breakdowns, and live gadget Q&A.',
              isLive: !!(item.isLive || item.session?.status === 'active'),
              isVip: item.vipMembershipEnabled !== false,
            };
          });

          if (isMounted) {
            setCreatorsList(mappedCreatorsGrid);
          }
        }
      } catch (err) {
        console.warn('Live feed fetch error:', err.message);
      }
    };

    fetchBackendLiveFeed();
    const interval = setInterval(fetchBackendLiveFeed, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedCategory, searchQuery]);

  // Auto-rotate live stream showcase card every 6s
  useEffect(() => {
    if (!isAutoRotating || liveStreams.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentLiveIndex((prev) => (prev + 1) % liveStreams.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoRotating, liveStreams.length]);

  const currentStream = liveStreams[currentLiveIndex] || liveStreams[0];

  // Fetch following creators for logged in viewer
  useEffect(() => {
    const fetchViewerFollowing = async () => {
      const token = getViewerToken() || getCookie('askme_viewer_token') || (typeof window !== 'undefined' ? localStorage.getItem('askme_viewer_token') : null);
      const user = getViewerUser();
      if (!token) return;

      try {
        const url = `${API_ENDPOINTS?.VIEWERS?.FOLLOWING || 'http://localhost:5000/api/viewers/following'}?userId=${user?.id || ''}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.followingIds && Array.isArray(data.followingIds)) {
            const map = {};
            data.followingIds.forEach((id) => {
              map[String(id)] = true;
            });
            setFollowedCreators(map);
          }
        }
      } catch (err) {
        console.warn('Error fetching viewer following list:', err);
      }
    };

    fetchViewerFollowing();
  }, []);

  const toggleFollow = async (creatorId, creatorName = 'creator') => {
    if (!creatorId || creatorId === 'undefined' || creatorId === 'null') {
      if (toast?.warning) toast.warning('Invalid creator selected for follow.', 'Notice');
      return;
    }
    const token = getViewerToken() || getCookie('askme_viewer_token') || (typeof window !== 'undefined' ? localStorage.getItem('askme_viewer_token') : null);
    const user = getViewerUser();

    // IF NOT LOGGED IN -> DISPLAY TOAST WARNING & REDIRECT TO LOGIN
    if (!token) {
      if (toast?.warning) {
        toast.warning('Please log in as a viewer to follow creators.', 'Authentication Required');
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('askme_toast', {
            detail: {
              message: 'Please log in as a viewer to follow creators.',
              type: 'warning',
              title: 'Authentication Required',
            },
          })
        );
      }
      setTimeout(() => {
        router.push(`/`);
      }, 1200);
      return;
    }

    const cidStr = String(creatorId);
    const wasFollowing = !!followedCreators[cidStr];

    // Optimistic UI update
    setFollowedCreators((prev) => ({
      ...prev,
      [cidStr]: !wasFollowing,
    }));

    try {
      const followApi = API_ENDPOINTS?.VIEWERS?.FOLLOW || 'http://localhost:5000/api/viewers/follow';
      const res = await fetch(followApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          creatorId: cidStr,
          userId: user?.id || '',
        }),
      });
      const data = await res.json();

      if (res.ok && typeof data.isFollowing === 'boolean') {
        setFollowedCreators((prev) => ({
          ...prev,
          [cidStr]: data.isFollowing,
        }));
        if (data.isFollowing) {
          if (toast?.success) toast.success(`You are now following ${creatorName}!`, 'Following');
        } else {
          if (toast?.info) toast.info(`Unfollowed ${creatorName}.`, 'Unfollowed');
        }
      } else {
        // Handle backend error (e.g. "Creator not found.") via Toast notification
        const errorMsg = data?.message || 'Failed to update follow status.';
        if (toast?.error) {
          toast.error(errorMsg, 'Follow Notice');
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('askme_toast', {
              detail: { message: errorMsg, type: 'error', title: 'Follow Notice' },
            })
          );
        }
        // Revert optimistic UI update
        setFollowedCreators((prev) => ({
          ...prev,
          [cidStr]: wasFollowing,
        }));
      }
    } catch (err) {
      console.warn('Follow API error:', err);
      if (toast?.error) {
        toast.error('Network error updating follow status.', 'Connection Error');
      }
      setFollowedCreators((prev) => ({
        ...prev,
        [cidStr]: wasFollowing,
      }));
    }
  };

  // Sample Creators Data for Discovery Grid
  const initialCreators = [
    {
      id: '1',
      creatorId: '1',
      name: 'Prince Live',
      handle: '@prince_raj',
      cleanUsername: 'prince_raj',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      category: 'Technology',
      platform: 'youtube',
      minFee: 100,
      subscribers: '3.4M',
      rating: 4.9,
      answeredCount: '382',
      bio: 'Tech reviews, startup breakdowns, and live gadget Q&A. Ask me anything about AI, smartphones, or early-stage angel investing!',
      isLive: true,
      isVip: true,
    },
  ];

  const [creatorsList, setCreatorsList] = useState(initialCreators);
  const [categoriesList, setCategoriesList] = useState([
    'All',
  ]);

  useEffect(() => {
    const fetchDynamicCategories = async () => {
      try {
        const url = API_ENDPOINTS?.VIEWERS?.PUBLIC_CATEGORIES || 'http://localhost:5000/api/viewers/public/categories';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            const set = new Set();
            set.add('All');
            data.categories.forEach((cat) => {
              if (cat && cat.trim() && cat !== 'All') set.add(cat.trim());
            });
            // ['Music', 'Gaming', 'Technology', 'Lifestyle', 'Travel', 'Finance & Stocks', 'Food', 'Education'].forEach((c) => set.add(c));
            setCategoriesList(Array.from(set));
          }
        }
      } catch (e) { }
    };
    fetchDynamicCategories();
  }, []);

  const filteredCreators = creatorsList;

  // Slider Pagination Logic (Max 6 Cards per Page)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredCreators.length / itemsPerPage);
  const displayedCreators = filteredCreators.slice(
    creatorPageIndex * itemsPerPage,
    (creatorPageIndex + 1) * itemsPerPage
  );

  // Dynamic fee calculation for creator earnings estimator
  const askmeFee = calcAmount * 0.15;
  const gatewayFee = calcAmount * 0.02;
  const gstTdsFee = calcAmount * 0.037;
  const netEarnings = calcAmount - askmeFee - gatewayFee - gstTdsFee;
  const netPercentage = ((netEarnings / calcAmount) * 100).toFixed(1);
  const extraVsOthers = Math.round(calcAmount * 0.28);

  // Section 10 Comparison Table Filter Data
  const comparisonTabs = ['All Highlights', 'Revenue & Payouts', 'Viewer Experience', 'Distribution & OBS'];

  const comparisonRows = [
    {
      id: 'r1',
      category: 'Revenue & Payouts',
      feature: 'Creator Net Take–Home Share',
      askme: '85% Net Take-Home',
      yt: '70% (30% Platform Cut)',
      twitch: '50% (50% Platform Cut)',
    },
    {
      id: 'r2',
      category: 'Viewer Experience',
      feature: 'Live Stream Viewing Experience',
      askme: 'Zero Stream Interruption (Scoot Back)',
      yt: 'Distracting popup overlays',
      twitch: 'Intrusive ad pre-rolls',
    },
    {
      id: 'r3',
      category: 'Viewer Experience',
      feature: 'Question Visibility & Retention',
      askme: 'Persistent Queue with Prioritized Highlights',
      yt: 'Lost in fast-moving chat scroll',
      twitch: 'Spammed out by emotes & bots',
    },
    {
      id: 'r4',
      category: 'Viewer Experience',
      feature: 'Answer Notifications for Viewers',
      askme: 'In-App, Push & WhatsApp Alerts',
      yt: 'None (must watch full stream)',
      twitch: 'None (must stay in chat)',
    },
    {
      id: 'r5',
      category: 'Distribution & OBS',
      feature: 'Cross-Platform Unification',
      askme: '1 Universal QR & Link across YT, IG, Twitch, X',
      yt: 'YouTube streams only',
      twitch: 'Twitch streams only',
    },
    {
      id: 'r6',
      category: 'Revenue & Payouts',
      feature: 'Payout Settlement Timeline',
      askme: 'Instant / T+3 Direct KYC Bank Deposit',
      yt: 'Net 30–60 Days Monthly Hold',
      twitch: 'Net 15–45 Days with $50 Threshold',
    },
    {
      id: 'r7',
      category: 'Revenue & Payouts',
      askme: '100% Protection if Unanswered',
      yt: 'No automatic refund policy',
      twitch: 'Non-refundable digital tokens',
    },
    {
      id: 'r8',
      category: 'Distribution & OBS',
      feature: 'OBS & VDO Live Broadcast Overlay',
      askme: 'Customizable Real Time OBS Dock',
      yt: 'Distracting popup overlays',
      twitch: 'Spammed by emotes & bots',
    },
  ];

  const filteredComparisonRows = comparisonRows.filter((row) => {
    return selectedComparisonTab === 'All Highlights' || row.category === selectedComparisonTab;
  });

  const copyObsUrl = () => {
    navigator.clipboard.writeText('https://askme.live/overlay/samaylive?key=live_obs_981273');
    setCopiedObsUrl(true);
    setTimeout(() => setCopiedObsUrl(false), 2500);
  };

  const faqData = [
    {
      id: 'q1',
      category: 'For Viewers',
      categoryTag: 'FOR VIEWERS',
      question: 'How does AskMe guarantee my question is seen by the creator?',
      answer:
        'Unlike standard live chats that fly by at hundreds of messages a second, AskMe places your question in a dedicated creator queue. The creator has an interactive OBS/PC dashboard where every paid question stays visible until they explicitly mark it as answered or highlight it on stream.',
      highlights: [
        '100% visible queue guaranteed — never gets buried in chat spam',
        'Real-time status updates: In-Queue, On-Screen Broadcasted, and Answered',
        'Automatic refund protection if your question cannot be reached',
      ],
    },
    {
      id: 'q2',
      category: 'For Viewers',
      categoryTag: 'FOR VIEWERS',
      question: 'What payment options are supported when submitting a question?',
      answer:
        'We support all major payment options including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), Netbanking across 50+ banks, and popular digital wallets.',
    },
    {
      id: 'q3',
      category: 'For Viewers',
      categoryTag: 'FOR VIEWERS',
      question: 'What is "Scoot Mode" and how do I ask without interrupting my stream?',
      answer:
        'Scoot Mode lets you submit questions in seconds via QR code on mobile while keeping the desktop stream playing smoothly without audio delay or page refresh.',
    },
    {
      id: 'q4',
      category: 'For Viewers',
      categoryTag: 'FOR VIEWERS',
      question: 'What happens if the stream ends before my question is answered?',
      answer:
        'If a creator ends their broadcast without answering your queued question, our automated system immediately triggers a 100% full refund back to your original payment method.',
    },
    {
      id: 'q5',
      category: 'For Creators',
      categoryTag: 'FOR CREATORS',
      question: 'How much do creators earn and how does the 0% Apple Tax work?',
      answer:
        'Creators keep an industry-leading 85% of all tips and super-chats. Unlike mobile apps where Apple and Google deduct an exorbitant 30% cut before creators see a single penny, AskMe uses direct web checkout gateways (UPI, cards, netbanking), completely bypassing app-store commissions so more money goes directly to you.',
      highlights: [
        '85% creator payout vs. 50-70% on legacy platforms',
        '0% Apple & Google App Store commission',
        'Transparent ledger with automatic GST and TDS compliance breakdowns',
      ],
    },
    {
      id: 'q6',
      category: 'For Creators',
      categoryTag: 'FOR CREATORS',
      question: 'How do I add the AskMe live question overlay into OBS or Streamlabs?',
      answer:
        'Simply copy your unique OBS Browser Source URL from your AskMe Creator Dashboard, paste it as a Browser Source in OBS/Streamlabs/vMix, and set resolution to 1920x1080. It renders transparently in real time.',
    },
    {
      id: 'q7',
      category: 'For Creators',
      categoryTag: 'FOR CREATORS',
      question: 'How does Gemini AI spam filtering and moderation protect my stream?',
      answer:
        'Our built-in Gemini AI filter automatically scans incoming questions for abusive language, hate speech, spam links, and inappropriate words before they ever appear on your studio monitor or OBS overlay.',
    },
    {
      id: 'q8',
      category: 'For Creators',
      categoryTag: 'FOR CREATORS',
      question: 'When and how are payouts transferred to my bank account?',
      answer:
        'Payouts are processed automatically via automated KYC bank transfers on a rolling T+3 settlement basis directly into your linked Indian bank account or UPI VPA.',
    },
    {
      id: 'q9',
      category: 'OBS & Overlay',
      categoryTag: 'OBS & TECH',
      question: 'Can I use AskMe across YouTube, Twitch, Kick, and Instagram simultaneously?',
      answer:
        'Yes! AskMe provides a single universal link and QR code. Whether your fans watch on YouTube, Twitch, Kick, or Instagram Live, all questions feed into one unified creator dashboard.',
    },
    {
      id: 'q10',
      category: 'Payments & Taxes',
      categoryTag: 'PAYMENTS & PAYOUTS',
      question: 'Are there any setup fees or monthly subscription charges to start as a creator?',
      answer:
        'No! AskMe is ₹0 setup fee and 100% free to join. There are no monthly subscription fees. We only take a transparent 15% platform fee when fans submit paid questions.',
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaqs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExpandAllFaqs = () => {
    setExpandedFaqs(faqData.map((f) => f.id));
  };

  const handleCollapseAllFaqs = () => {
    setExpandedFaqs([]);
  };

  const filteredFaqs = faqData.filter((faq) => {
    const matchesTab = selectedFaqTab === 'All Questions' || faq.category === selectedFaqTab;
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      faq.categoryTag.toLowerCase().includes(faqSearchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F3F3F8] font-sans selection:bg-[#EB1000] selection:text-white">
      {/* Top Floating Pill Header Navbar */}
      <LandingNavbar />

      <main className="pt-24 pb-20 space-y-28">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO SECTION & INTERACTIVE SHOWCASE SLIDER */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-4 pb-12">
          {/* Ambient Glow Effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[550px] bg-gradient-to-tr from-[#EB1000]/25 via-[#EB1000]/5 to-transparent blur-[170px] pointer-events-none rounded-full"></div>

          {/* Hero View Switcher Pills */}
          <div className="flex items-center justify-center gap-2 mb-6 relative z-20">
            <button
              type="button"
              onClick={() => setMainHeroSlide(0)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-300 cursor-pointer ${mainHeroSlide === 0
                ? 'bg-[#EB1000] text-white shadow-lg shadow-[#EB1000]/30 scale-105'
                : 'bg-[#14141F] border border-[#222234] text-[#8E8E9F] hover:text-white hover:border-[#EB1000]/40'
                }`}
            >
              • Platform Overview
            </button>
            <button
              type="button"
              onClick={() => setMainHeroSlide(1)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-300 cursor-pointer ${mainHeroSlide === 1
                ? 'bg-[#EB1000] text-white shadow-lg shadow-[#EB1000]/30 scale-105'
                : 'bg-[#14141F] border border-[#222234] text-[#8E8E9F] hover:text-white hover:border-[#EB1000]/40'
                }`}
            >
              • Live Stream Interaction
            </button>
          </div>

          {/* HORIZONTAL CAROUSEL CONTAINER */}
          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* HORIZONTAL CAROUSEL SLIDER TRACK */}
            <div className="overflow-hidden w-full rounded-3xl">
              <div
                className="flex w-[200%] transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${mainHeroSlide * 50}%)` }}
              >
                {/* HERO SLIDE 0: Centered Discovery Hero */}
                <div className="w-1/2 shrink-0 px-2 sm:px-8 text-center space-y-7">
                  {/* Headline with solid red pill badge */}
                  <h1 className="text-4xl sm:text-6xl lg:text-[70px] xl:text-[75px] font-heading font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
                    The Creator Discovery &amp;{' '}
                    <span className="relative inline-block px-5 sm:px-6 py-1.5 sm:py-2 rounded-2xl text-red-500 font-heading font-black align-middle my-1">
                      Audience Engagement
                    </span>
                    Platform
                  </h1>

                  {/* Subtitle Body Text */}
                  <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#9A9AB0] max-w-3xl mx-auto font-medium leading-relaxed">
                    Connect directly with top creators during live streams and offline. Meaningful questions get a guaranteed place in a dedicated creator queue — never buried in chat noise.
                  </p>

                  {/* 3 CTA Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                    <button
                      type="button"
                      onClick={() => openAuthModal('creator', 'login')}
                      className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-[16px] font-bold shadow-xl shadow-[#EB1000]/35 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span className="text-[#FFD60A]">★</span>
                      <span>Become a Creator</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuthModal('viewer', 'login')}
                      className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#161622] border border-[#27273A] text-white text-[16px] font-semibold hover:bg-[#1E1E2E] hover:border-[#383850] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <User className="h-4 w-4 text-[#A0A0B2]" />
                      <span>Join as a Viewer</span>
                    </button>

                    <a
                      href="/live-streams"
                      className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#161622] border border-[#27273A] text-white text-[16px] font-semibold hover:bg-[#1E1E2E] hover:border-[#383850] transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4 text-[#A0A0B2]" />
                      <span>Explore Live Sessions</span>
                    </a>
                  </div>

                  {/* Showcase Browser Frame */}
                  <div className="pt-8 max-w-6xl mx-auto">
                    <div className="rounded-3xl bg-[#0D0D14] border border-[#222234] shadow-[0_25px_90px_rgba(0,0,0,0.85)] overflow-hidden p-4 sm:p-6 text-left relative">

                      {/* Top Window Bar */}
                      <div className="flex items-center justify-between border-b border-[#1E1E2D] pb-4 mb-4 gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-[#FF5F56]"></span>
                          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]"></span>
                          <span className="h-3 w-3 rounded-full bg-[#27C93F]"></span>
                          <div className="ml-3 px-4 py-1 rounded-md bg-[#161622] border border-[#27273A] text-[13px] font-mono text-[#8B8B9E] hidden sm:inline-block">
                            askme.live
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[13px]">
                          <div className="px-3 py-1 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] font-bold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00F5D4] animate-ping"></span>
                            <span>Ultra low Latency 0.4s</span>
                          </div>
                          <span className="text-[#6B6B7F] font-medium hidden md:inline-block">
                            Stream Sync: <span className="text-white font-semibold">Active</span>
                          </span>
                        </div>
                      </div>

                      {/* Inner Window Box */}
                      <div className="max-w-4xl mx-auto">
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#222234] bg-[#12121B] shadow-inner">
                          <img
                            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80"
                            alt="Live Stream Preview"
                            className="w-full h-full object-cover opacity-80"
                          />

                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-[#EB1000] text-white text-[11px] font-black tracking-wider flex items-center gap-1 shadow-md">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                                LIVE
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                                👁️ 12.4K watching
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-[#FF9500]/20 backdrop-blur-md text-[#FF9500] text-[11px] font-bold border border-[#FF9500]/30">
                              🔥 Trending #1 in Music
                            </span>
                          </div>

                          {/* Chat Overlays */}
                          <div className="absolute bottom-16 right-3 space-y-2 text-[13px]">
                            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#FF4500] text-white font-bold text-[13px] flex items-center gap-1.5 shadow-xl animate-bounce">
                              <span>Liam tipped $25.00</span>
                            </div>
                            <div className="px-3.5 py-2 rounded-2xl bg-[#EB1000]/80 backdrop-blur-md border border-[#FF4D3E]/40 text-white font-medium text-[13px] shadow-xl max-w-xs">
                              ❤️ &quot;Play your unreleased track!&quot;
                            </div>
                          </div>

                          {/* Streamer Bar */}
                          <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div>
                                <div className="text-[13px] font-bold text-white flex items-center gap-1">
                                  AskMe Live <span className="text-[#00F5D4] text-[11px]">✔</span>
                                </div>
                                <div className="text-[11px] text-[#A0A0B2]">
                                  Acoustic Sessions &amp; Songwriting AMA
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 3 HIGHLIGHT PILLS */}
                  <div className="pt-6 max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-[#12121C] border border-[#222232] text-center space-y-1">
                        <span className="text-[13px] font-black text-[#EB1000] uppercase tracking-wider block">100% SEEN</span>
                        <span className="text-[13px] text-[#8B8B9E] font-medium block">Guaranteed creator spotlight queue</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#12121C] border border-[#222232] text-center space-y-1">
                        <span className="text-[13px] font-black text-[#00F5D4] uppercase tracking-wider block">0% DIRECT FEE</span>
                        <span className="text-[13px] text-[#8B8B9E] font-medium block">Web QR payments direct</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#12121C] border border-[#222232] text-center space-y-1">
                        <span className="text-[13px] font-black text-[#FFD60A] uppercase tracking-wider block">STREAM QR WIDGET</span>
                        <span className="text-[13px] text-[#8B8B9E] font-medium block">YouTube, Twitch &amp; Kick</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HERO SLIDE 1: 2-Column Live Showcase Hero */}
                <div className="w-1/2 shrink-0 px-2 sm:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">

                    {/* LEFT COLUMN: HERO HEADLINE & ACTIONS */}
                    <div className="lg:col-span-6 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
                        NEXT-GEN CREATOR &amp; AUDIENCE INTERACTION
                      </div>

                      <h1 className="text-4xl sm:text-6xl lg:text-[62px] xl:text-[68px] font-heading font-black tracking-tight text-white leading-[1.08]">
                        DON&apos;T JUST<br />
                        WATCH.<br />
                        <span className="text-[#EB1000]">ASK.</span>
                      </h1>

                      <div className="space-y-3">
                        <p className="text-[16px] sm:text-[18px] text-white font-bold leading-snug">
                          Your favorite creators are Live. You have questions. Askme connects the two.
                        </p>
                        <p className="text-xs sm:text-sm text-[#8E8E9F] leading-relaxed">
                          Scan a QR. Click a link. Ask your question. Then Scoot back to what you&apos;re watching.
                        </p>
                        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-white font-medium pt-1">
                          <Volume2 className="h-4 w-4 text-[#EB1000] shrink-0 mt-0.5" />
                          <span>The creator reads your question and answers verbally on air. Askme pings you the instant they respond.</span>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D1612] border border-[#10B981]/40 text-[11px] sm:text-xs font-mono font-black tracking-widest uppercase shadow-lg">
                        <span className="text-[#EB1000]">SCAN.</span>
                        <span className="text-white">ASK.</span>
                        <span className="text-[#FF9500]">SCOOT.</span>
                        <span className="text-[#10B981]">GET ANSWERED.</span>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => openAuthModal('viewer', 'login')}
                          className="px-7 py-3.5 rounded-full bg-[#EB1000] hover:bg-[#c90e00] text-white font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-[#EB1000]/30 transition-all hover:scale-105 cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>ASK A CREATOR</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openAuthModal('creator', 'login')}
                          className="px-7 py-3.5 rounded-full bg-white hover:bg-gray-100 text-black font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
                        >
                          <Users className="h-4 w-4" />
                          <span>FOR CREATORS</span>
                        </button>
                      </div>

                      {/* Trust Row */}
                      <div className="flex items-center gap-5 text-xs text-[#8E8E9F] font-semibold pt-1">
                        <span className="flex items-center gap-1.5 text-[#10B981]">
                          <CheckCircle2 className="h-4 w-4" />
                          Zero app install needed
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-[#10B981]">
                          <CheckCircle2 className="h-4 w-4" />
                          Priority queue
                        </span>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: INTERACTIVE VIDEO & FEATURE SLIDER MOCKUP */}
                    <div className="lg:col-span-6 relative">
                      <div className="rounded-3xl bg-[#0D0D14] border border-[#222234] shadow-[0_25px_90px_rgba(0,0,0,0.85)] p-4 sm:p-5 relative overflow-hidden space-y-4">

                        {/* Slider Content Panel */}
                        {heroSlideIndex === 0 && (
                          <div className="relative aspect-video sm:aspect-[16/10] rounded-2xl overflow-hidden border border-[#222234] bg-[#12121B] shadow-inner group">
                            <img
                              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80"
                              alt="Prince Live"
                              className="w-full h-full object-cover opacity-85"
                            />

                            {/* Top Video Overlay Bar */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-[#EB1000] text-white text-[10px] sm:text-[11px] font-black tracking-wider flex items-center gap-1 shadow-md">
                                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                                  LIVE
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold border border-white/10 flex items-center gap-1">
                                  👁️ 14,820
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold border border-white/10 hidden sm:inline-block">
                                  Technology &amp; AI
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
                                  <Volume2 className="h-3.5 w-3.5" />
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 text-[10px] sm:text-[11px] font-mono font-bold border border-emerald-500/40">
                                  1080p60
                                </span>
                              </div>
                            </div>

                            {/* Center Floating Banner */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm p-4 rounded-2xl bg-[#140608]/90 border border-[#EB1000] backdrop-blur-md space-y-2 text-left shadow-2xl">
                              <div className="flex items-center gap-2 text-[#EB1000] font-black text-xs uppercase tracking-wider">
                                <Bell className="h-4 w-4 animate-bounce shrink-0" />
                                <span>ASKME IS READING &amp; ANSWERING YOUR QUESTION ON AIR!</span>
                              </div>
                              <div className="text-white text-xs font-semibold italic">
                                &quot;What camera do you use?&quot;
                              </div>
                            </div>

                            {/* Streamer Info Bar at Bottom */}
                            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                                  alt="Prince Lin"
                                  className="w-8 h-8 rounded-full object-cover border border-[#EB1000]"
                                />
                                <div>
                                  <div className="text-xs font-extrabold text-white flex items-center gap-1">
                                    Askme <span className="text-[#00F5D4] text-[10px]">✔</span>
                                  </div>
                                  <div className="text-[10px] text-[#A0A0B2]">
                                    Streaming on YouTube &amp; Twitch
                                  </div>
                                </div>
                              </div>

                              <Link
                                href="/"
                                className="px-3.5 py-1.5 rounded-full bg-[#200A0C] border border-[#EB1000]/60 text-white hover:bg-[#EB1000] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                              >
                                <MessageCircle className="h-3.5 w-3.5 text-[#EB1000] group-hover:text-white" />
                                <span>Askme</span>
                              </Link>
                            </div>
                          </div>
                        )}

                        {heroSlideIndex === 1 && (
                          <div className="aspect-video sm:aspect-[16/10] rounded-2xl bg-[#09090E] border border-[#EB1000]/60 p-6 flex flex-col justify-between shadow-2xl relative">
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-3 py-1 rounded-md bg-[#FFD60A]/15 text-[#FFD60A] font-mono font-black uppercase tracking-wider border border-[#FFD60A]/30">
                                100% SEEN • GUARANTEED SPOTLIGHT QUEUE
                              </span>
                              <span className="text-[#00F5D4] font-bold">🟢 Confirmed</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-2 text-left">
                              <div className="text-xs text-[#8E8E9F] font-semibold">
                                Live Question Spotlight
                              </div>
                              <p className="text-white font-extrabold text-sm sm:text-base leading-relaxed">
                                &quot;What was your production chain for the vocal reverb on track 3? Can you break down the EQ?&quot;
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#8E8E9F] border-t border-[#1E1E2C] pt-3">
                              <span>from @audiogeek • 120s spotlight</span>
                              <span className="px-3 py-1 rounded-lg bg-[#FFD60A]/10 text-[#FFD60A] font-bold border border-[#FFD60A]/20">
                                $50.00 Bounty
                              </span>
                            </div>
                          </div>
                        )}

                        {heroSlideIndex === 2 && (
                          <div className="aspect-video sm:aspect-[16/10] rounded-2xl bg-[#080B09] border border-[#059669]/60 p-6 flex flex-col justify-between shadow-2xl text-left relative">
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-3 py-1 rounded-md bg-emerald-950/80 text-[#00E599] font-mono font-black uppercase tracking-wider border border-emerald-500/40">
                                0% DIRECT FEE • WEB &amp; QR PAYMENTS
                              </span>
                              <span className="text-white font-bold">Instant UPI &amp; Cards</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-[#131716] border border-[#222E29] space-y-2">
                              <div className="text-xs text-[#00E599] font-bold">Direct Web Payout Engine</div>
                              <p className="text-white font-extrabold text-sm sm:text-base">
                                Keep 85% of audience support with zero Apple 30% tax or app store holds.
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#8E8E9F] border-t border-[#1C2622] pt-3">
                              <span>Direct to Creator Wallet</span>
                              <span className="text-[#00E599] font-bold">Automated Instant Settlement</span>
                            </div>
                          </div>
                        )}

                        {heroSlideIndex === 3 && (
                          <div className="aspect-video sm:aspect-[16/10] rounded-2xl bg-[#0A0A12] border border-[#6366F1]/60 p-6 flex flex-col justify-between shadow-2xl text-left relative">
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-3 py-1 rounded-md bg-indigo-950/80 text-[#A5B4FC] font-mono font-black uppercase tracking-wider border border-indigo-500/40">
                                STREAM QR WIDGET • MULTI-PLATFORM SYNC
                              </span>
                              <span className="text-white font-bold">YouTube, Twitch &amp; Kick</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-[#121220] border border-[#22223D] space-y-2">
                              <div className="text-xs text-[#A5B4FC] font-bold">OBS Studio &amp; Streamlabs Overlay</div>
                              <p className="text-white font-extrabold text-sm sm:text-base">
                                Instant zero-friction QR scan widget overlay on your broadcast stream.
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#8E8E9F] border-t border-[#1E1E34] pt-3">
                              <span>Zero Stream Interruption</span>
                              <span className="text-indigo-400 font-bold">Live Synced Dashboard</span>
                            </div>
                          </div>
                        )}

                        {/* Navigation Footer Bar inside Mockup Box */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#1C1C2A] text-xs">
                          {/* Status indicator */}
                          <div className="flex items-center gap-2 text-[#8E8E9F] font-mono">
                            <span className="h-2 w-2 rounded-full bg-[#EB1000]"></span>
                            <span>{heroSlideIndex + 1}. Notified</span>
                            <Bell className="h-3 w-3 text-[#EB1000]" />
                          </div>

                          {/* Navigation Controls: Arrows + Dots */}
                          <div className="flex items-center gap-3">
                            {/* Dots Pagination */}
                            <div className="flex items-center gap-1.5">
                              {[0, 1, 2, 3].map((idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setHeroSlideIndex(idx)}
                                  className={`h-2 rounded-full transition-all cursor-pointer ${heroSlideIndex === idx
                                    ? 'w-5 bg-[#EB1000]'
                                    : 'w-2 bg-[#28283C] hover:bg-white/40'
                                    }`}
                                />
                              ))}
                            </div>

                            {/* Previous / Next Arrow Buttons */}
                            <div className="flex items-center gap-1 pl-2 border-l border-[#222234]">
                              <button
                                type="button"
                                onClick={() => setHeroSlideIndex((prev) => (prev > 0 ? prev - 1 : 3))}
                                className="w-7 h-7 rounded-full bg-[#181824] hover:bg-[#28283C] text-white flex items-center justify-center border border-[#262638] transition-colors cursor-pointer"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setHeroSlideIndex((prev) => (prev < 3 ? prev + 1 : 0))}
                                className="w-7 h-7 rounded-full bg-[#181824] hover:bg-[#28283C] text-white flex items-center justify-center border border-[#262638] transition-colors cursor-pointer"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Hero Carousel Pagination Dots */}
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => setMainHeroSlide(0)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${mainHeroSlide === 0 ? 'w-8 bg-[#EB1000] shadow-[0_0_12px_rgba(235,16,0,0.8)]' : 'w-2.5 bg-[#26263A] hover:bg-white/50'
                  }`}
                aria-label="Go to Slide 1"
              />
              <button
                type="button"
                onClick={() => setMainHeroSlide(1)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${mainHeroSlide === 1 ? 'w-8 bg-[#EB1000] shadow-[0_0_12px_rgba(235,16,0,0.8)]' : 'w-2.5 bg-[#26263A] hover:bg-white/50'
                  }`}
                aria-label="Go to Slide 2"
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: CORE EXPERIENCE — ASK WITHOUT INTERRUPTING YOUR LIVE */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              CORE EXPERIENCE
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[50px] xl:text-[55px] font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto drop-shadow-[0_0_35px_rgba(235,16,0,0.35)]">
              ASK WITHOUT
              <br />
              INTERRUPTING YOUR
              <br />
              <span className="inline-block bg-[#EB1000] text-white px-6 py-1 mt-2 rounded-sm font-black tracking-tight shadow-[0_0_40px_rgba(235,16,0,0.6)]">
                LIVE.
              </span>
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#8B8B9E] max-w-xl mx-auto font-normal pt-2">
              One question. Zero interruption. Never buried in live chat noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* METHOD 01 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#14141E] border border-[#222234] flex flex-col justify-between hover:border-[#EB1000]/40 transition-all group">
              <div>
                {/* Top Row: White Icon Badge & Method Label */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/40">
                    <QrCode className="h-6 w-6 text-[#EB1000]" />
                  </div>
                  <span className="font-mono text-[11px] sm:text-[12px] font-bold text-[#8E8E9F] uppercase tracking-widest">
                    METHOD 01
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-[20px] sm:text-[22px] font-heading font-extrabold text-white leading-snug mb-2">
                  Scan. Ask. Back to the Live.
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#8E8E9F] leading-relaxed font-normal">
                  Scan the creator's AskMe QR code while watching their stream on any screen.
                </p>
              </div>

              <div>
                {/* Horizontal Divider */}
                <div className="border-b border-[#262638] my-5"></div>

                {/* Inner Preview Box */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B0B12] border border-[#202030] space-y-3">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                      <Video className="h-3.5 w-3.5 text-[#EB1000]" />
                      <span>Live Stream Streamer Cam</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#EB1000] text-white text-[9px] font-extrabold flex items-center gap-1 tracking-wider uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span> LIVE
                    </span>
                  </div>

                  {/* QR & Scanner Box Grid */}
                  <div className="grid grid-cols-2 gap-2.5 items-center">
                    <div className="rounded-xl flex items-center justify-center h-32 overflow-hidden relative group">
                      <OriginalScannerImage className="h-full w-auto object-contain shadow-md rounded-xl" />
                    </div>
                    <div className="h-32 rounded-xl bg-[#1A090C] border border-[#EB1000]/60 p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 shadow-lg">
                      <div className="w-7 h-7 rounded-lg bg-[#EB1000]/20 border border-[#EB1000] flex items-center justify-center text-[#EB1000]">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-tight leading-tight">
                        ASKME URL DETECTED
                      </span>
                      <span className="text-[9px] text-[#A0A0B2]">Tap to Ask</span>
                    </div>
                  </div>
                </div>

                {/* Caption Footer */}
                <span className="text-[11px] sm:text-[12px] text-[#7A7A8E] text-center block mt-3 font-medium">
                  Phone camera scans instantly without app install
                </span>
              </div>
            </div>

            {/* METHOD 02 (Reddish Tint Gradient Background) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#2B1015] via-[#1D1217] to-[#14121A] border border-[#EB1000]/40 flex flex-col justify-between shadow-2xl shadow-[#EB1000]/10 hover:border-[#EB1000]/60 transition-all group">
              <div>
                {/* Top Row: White Icon Badge & Method Label */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/40">
                    <ArrowRight className="h-6 w-6 text-[#EB1000] -rotate-45" />
                  </div>
                  <span className="font-mono text-[11px] sm:text-[12px] font-bold text-[#8E8E9F] uppercase tracking-widest">
                    METHOD 02
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-[20px] sm:text-[22px] font-heading font-extrabold text-white leading-snug mb-2">
                  No QR? Just click.
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#8E8E9F] leading-relaxed font-normal">
                  Click the creator's AskMe link and ask your question instantly.
                </p>
              </div>

              <div>
                {/* Horizontal Divider */}
                <div className="border-b border-[#361E24] my-5"></div>

                {/* Inner Preview Box */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0F0B10] border border-[#301B22] space-y-4">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-white">Stream Description / Pinned Chat</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#8E8E9F]" />
                  </div>

                  {/* URL & Red Action Pill */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] sm:text-[12px] font-mono text-[#8E8E9F] truncate">
                      askme.live/@creator/live
                    </span>
                    <button className="px-3.5 py-1.5 rounded-full bg-[#EB1000] text-white text-[11px] font-bold shadow-lg shadow-[#EB1000]/40 flex items-center gap-1 hover:opacity-90 transition-all shrink-0">
                      Ask Creator <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Caption Footer */}
                <span className="text-[11px] sm:text-[12px] text-[#7A7A8E] text-center block mt-3 font-medium">
                  Works in YouTube pinned chat, Twitch panel, or Instagram bio
                </span>
              </div>
            </div>

            {/* METHOD 03 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#14141E] border border-[#222234] flex flex-col justify-between hover:border-[#EB1000]/40 transition-all group">
              <div>
                {/* Top Row: White Icon Badge & Method Label */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/40">
                    <MessageSquare className="h-6 w-6 text-[#EB1000]" />
                  </div>
                  <span className="font-mono text-[11px] sm:text-[12px] font-bold text-[#8E8E9F] uppercase tracking-widest">
                    METHOD 03
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-[20px] sm:text-[22px] font-heading font-extrabold text-white leading-snug mb-2">
                  Your question. Direct to the creator.
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#8E8E9F] leading-relaxed font-normal">
                  Ask from the QR code, link, or directly inside the AskMe App.
                </p>
              </div>

              <div>
                {/* Horizontal Divider */}
                <div className="border-b border-[#262638] my-5"></div>

                {/* Inner Preview Box */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B0B12] border border-[#202030] space-y-3">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#EB1000]/20 border border-[#EB1000] flex items-center justify-center text-[#EB1000] text-[8px]">⚙</span>
                      <span>Direct Question Composer</span>
                    </div>
                    <span className="text-[10px] text-[#7A7A8E] font-medium">AskMe App</span>
                  </div>

                  {/* Input Field */}
                  <div className="bg-[#05050A] border border-[#222234] rounded-lg px-3 py-2 text-[12px] text-white font-medium">
                    What microphone are you using?
                  </div>

                  {/* Red Glowing Pill Button */}
                  <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#EB1000] to-[#FF2A1A] text-white text-[12px] font-black tracking-wider shadow-[0_0_22px_rgba(235,16,0,0.5)] flex items-center justify-center gap-1.5 hover:opacity-95 transition-all">
                    ASK <ChevronRight className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>

                {/* Caption Footer */}
                <span className="text-[11px] sm:text-[12px] text-[#7A7A8E] text-center block mt-3 font-medium">
                  Never buried in live chat noise
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: THE SCOOT PHILOSOPHY — 5-STEP INTERACTIVE VIDEO JOURNEY */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* THE SCOOT PHILOSOPHY HEADER */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              THE SCOOT PHILOSOPHY
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[55px] xl:text-[60px] font-extrabold text-white tracking-tight leading-[1.15]">
              DON'T WAIT. <span className="text-[#EB1000]">SCOOT.</span>
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#8B8B9E] font-medium max-w-xl mx-auto">
              Ask. Then get back to what you're watching.
            </p>
          </div>

          {/* 5-STEP INTERACTIVE JOURNEY TABS & LIVE VIDEO PLAYER CONTAINER */}
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* 5 Step Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { step: 'Step 01', title: 'ASK', desc: 'Submit question in 3s', color: '#FF3B30' },
                { step: 'Step 02', title: 'SENT ✓', desc: 'Safely received by creator', color: '#00E676' },
                { step: 'Step 03', title: 'SCOOT', desc: 'Interface glides away', color: '#FFD60A' },
                { step: 'Step 04', title: 'KEEP WATCHING', desc: 'Live stream remains in focus', color: '#FF3B30' },
                { step: 'Step 05', title: 'ANSWER', desc: 'Notified the instant they speak', color: '#00F5D4' },
              ].map((item, idx) => {
                const isActive = activeStepIndex === idx;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setIsAutoPlayingJourney(false);
                    }}
                    className={`p-4 rounded-2xl text-left relative transition-all cursor-pointer ${isActive
                      ? 'bg-[#141420] border-2 border-[#FF3B30] shadow-[0_0_20px_rgba(255,59,48,0.4)] z-10'
                      : 'bg-[#0E0E18] border border-[#222234] hover:border-[#383850] opacity-80 hover:opacity-100'
                      }`}
                  >
                    {/* Top Step Number & Active Indicator Dot */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider" style={{ color: item.color }}>
                        {item.step}
                      </span>
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-[#FF3B30] animate-pulse"></span>
                      )}
                    </div>

                    {/* Step Title & Subtitle */}
                    <h4 className="text-base sm:text-lg font-heading font-extrabold text-white tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#8E8E9F] font-medium leading-snug mt-1">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* LIVE STREAM VIDEO & STEP SHOWCASE PREVIEW FRAME */}
            <div className="rounded-[32px] bg-[#0A0A12] border-2 border-[#222236] overflow-hidden relative shadow-2xl space-y-0 group/player">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full min-h-[320px] sm:min-h-[440px] bg-[#05060A] flex items-center justify-center overflow-hidden">
                {/* Streaming Setup Background Image / Video Backdrop */}
                <img
                  src={
                    activeStepIndex === 0
                      ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80'
                      : activeStepIndex === 1
                        ? 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80'
                        : activeStepIndex === 2
                          ? 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1400&q=80'
                          : activeStepIndex === 3
                            ? 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1400&q=80'
                            : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80'
                  }
                  alt="Live Stream Setup"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/player:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12] via-black/40 to-[#0A0A12]/80"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-transparent to-black/80"></div>

                {/* TOP OVERLAY HEADER BAR */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full bg-[#FF3B30] text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-[#FF3B30]/40">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                      <span>LIVE</span>
                    </span>

                    <span className="px-3.5 py-1 rounded-full bg-[#121420]/80 backdrop-blur-md border border-white/10 text-white text-xs font-bold shadow-md">
                      AskMe Live
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs text-[#8E8E9F] font-mono">
                    Step 0{activeStepIndex + 1} / 05
                  </span>
                </div>

                {/* CENTER FLOATING STEP BADGE */}
                <div className="relative z-20 px-4 py-2">
                  <div className="px-5 py-2.5 rounded-full bg-black/80 border border-white/20 backdrop-blur-xl text-white text-xs sm:text-base font-extrabold flex items-center gap-2.5 shadow-2xl shadow-black/80">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#00E676] animate-pulse"></span>
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FF3B30]"></span>
                    </span>
                    <span>
                      {[
                        '⚡ Question Submitted in 3 Seconds',
                        '✓ Safely Received in Creator OBS Dock',
                        '🚀 Interface Glides Away Seamlessly',
                        'Stream Remains Uninterrupted · No App Switching',
                        '🔔 Live Audio Alert: Creator Answered!',
                      ][activeStepIndex]}
                    </span>
                  </div>
                </div>

                {/* BOTTOM OVERLAY CONTROLS BAR */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 text-xs">
                  {/* Left: Auto-playing journey toggle */}
                  <button
                    type="button"
                    onClick={() => setIsAutoPlayingJourney((prev) => !prev)}
                    className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[#8E8E9F] hover:text-white flex items-center gap-2 font-semibold transition-all cursor-pointer"
                  >
                    <span className={`h-2 w-2 rounded-full ${isAutoPlayingJourney ? 'bg-[#FF3B30] animate-pulse' : 'bg-gray-500'}`}></span>
                    <span>{isAutoPlayingJourney ? 'Auto-playing journey' : 'Paused journey'}</span>
                  </button>

                  {/* Right: Replay from Start */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStepIndex(0);
                      setIsAutoPlayingJourney(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[#8E8E9F] hover:text-white flex items-center gap-1.5 font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-white" />
                    <span>Replay from Start</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3.5: GUARANTEED VISIBILITY — YOUR QUESTION DOESN'T DISAPPEAR INTO THE CHAT */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180A0C] border border-[#EB1000]/60 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              GUARANTEED VISIBILITY
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[55px] xl:text-[60px] font-heading font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto uppercase">
              YOUR QUESTION DOESN'T DISAPPEAR INTO THE CHAT.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#9A9AB0] max-w-2xl mx-auto font-medium leading-relaxed">
              The creator reads your question aloud and answers it verbally on their live stream.
            </p>
          </div>

          {/* Main Card Container */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-[#0D0D14] border border-[#222234] p-5 sm:p-8 space-y-6 shadow-[0_20px_70px_rgba(0,0,0,0.7)] text-left">
            {/* Top Interactive Tabs Header */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 border-b border-[#1C1C2A] pb-6 flex-wrap">
              {[
                { id: 1, label: '1. You Asked' },
                { id: 2, label: '2. Creator Answering Live' },
                { id: 3, label: '3. Spoken On Air ✓' },
              ].map((tab) => {
                const isActive = guaranteedVisibilityTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setGuaranteedVisibilityTab(tab.id)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${isActive
                      ? 'bg-white text-black shadow-lg shadow-white/10'
                      : 'bg-transparent text-[#7A7A8E] hover:text-white'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Main Interactive Display Box (Red Border Card) */}
            {guaranteedVisibilityTab === 2 && (
              <div className="rounded-2xl bg-[#0F080A] border-2 border-[#EB1000] p-5 sm:p-6 space-y-5 shadow-[0_0_40px_rgba(235,16,0,0.2)] relative">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="TechBurner Live"
                      className="w-10 h-10 rounded-full object-cover border border-[#EB1000]/60 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-extrabold text-sm sm:text-base">TechBurner Live</span>
                        <span className="h-2.5 w-2.5 rounded-full bg-[#EB1000] animate-pulse"></span>
                      </div>
                      <div className="text-[10px] font-mono font-extrabold text-[#EB1000] uppercase tracking-wider">
                        READING &amp; ANSWERING VERBALLY ON AIR
                      </div>
                    </div>
                  </div>

                  <span className="px-3.5 py-1 rounded-full bg-[#200A0C] border border-[#EB1000]/60 text-[#EB1000] text-[10px] font-mono font-extrabold uppercase tracking-wider shrink-0">
                    LIVE ORAL RESPONSE
                  </span>
                </div>

                {/* Content Box (Black card with inner quote) */}
                <div className="rounded-xl bg-[#070405] border border-[#2B1015] p-4 sm:p-5 space-y-2">
                  <div className="text-xs text-[#8E8E9F] font-medium">
                    Reading aloud on air: <span className="text-white font-bold">&quot;What camera do you use?&quot;</span>
                  </div>
                  <p className="text-white font-extrabold text-sm sm:text-base leading-relaxed tracking-tight">
                    &quot;I&apos;m using the Sony FX3 cinema camera with a 24-70mm GM II lens. It produces amazing skin tones and never overheats during 3-hour live sessions!&quot;
                  </p>
                </div>

                {/* Footer Bar inside main display box */}
                <div className="flex items-center justify-between gap-4 pt-1 text-xs flex-wrap">
                  <div className="flex items-center gap-2 text-[#7A7A8E] font-medium">
                    <Volume2 className="h-4 w-4 text-[#7A7A8E] shrink-0" />
                    <span>Spoken live on air (no typed text replies)</span>
                  </div>
                  <div className="text-[#EB1000] font-extrabold flex items-center gap-1 hover:underline cursor-pointer">
                    <span>Instant notification sent to you</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            )}

            {guaranteedVisibilityTab === 1 && (
              <div className="rounded-2xl bg-[#090912] border border-[#222238] p-5 sm:p-6 space-y-4 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-md bg-[#FFD60A]/15 text-[#FFD60A] font-mono font-bold uppercase tracking-wider border border-[#FFD60A]/30">
                    1. QUESTION SUBMITTED &amp; QUEUED
                  </span>
                  <span className="text-[#00F5D4] font-bold">✓ Confirmed Spot #1</span>
                </div>
                <div className="p-4 rounded-xl bg-[#12121E] border border-[#222236] space-y-2">
                  <div className="text-xs text-[#8E8E9F]">Your Question:</div>
                  <p className="text-white font-extrabold text-base">&quot;What camera do you use?&quot;</p>
                </div>
                <div className="text-xs text-[#8E8E9F] flex items-center justify-between pt-1">
                  <span>Queued on creator&apos;s OBS dashboard</span>
                  <span className="text-[#FFD60A] font-semibold">Creator will read aloud shortly</span>
                </div>
              </div>
            )}

            {guaranteedVisibilityTab === 3 && (
              <div className="rounded-2xl bg-[#08120D] border border-emerald-500/40 p-5 sm:p-6 space-y-4 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-md bg-emerald-950 text-[#00E676] font-mono font-bold uppercase tracking-wider border border-emerald-500/40">
                    3. SPOKEN ON AIR &amp; ARCHIVED
                  </span>
                  <span className="text-[#00E676] font-bold">✓ Completed</span>
                </div>
                <div className="p-4 rounded-xl bg-[#0F1B14] border border-[#1C3527] space-y-2">
                  <div className="text-xs text-[#00E676] font-bold">Audio Clip &amp; Timestamp Saved:</div>
                  <p className="text-white font-extrabold text-sm sm:text-base">
                    &quot;I&apos;m using the Sony FX3 cinema camera with a 24-70mm GM II lens...&quot;
                  </p>
                </div>
                <div className="text-xs text-[#8E8E9F] flex items-center justify-between pt-1">
                  <span>Saved to your activity dashboard</span>
                  <span className="text-[#00E676] font-semibold">Notification sent via App &amp; Web</span>
                </div>
              </div>
            )}

            {/* Bottom Comparison Cards (2 Side-by-Side Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Left Card: Traditional Live Chat */}
              <div className="p-5 rounded-2xl bg-[#14141E] border border-[#222234] space-y-2 text-left">
                <h4 className="text-white font-extrabold text-sm sm:text-base">Traditional Live Chat</h4>
                <p className="text-[#7A7A8E] text-xs sm:text-[13px] leading-relaxed">
                  Messages scroll by at 40 lines/sec. 98% of viewers&apos; questions get overlooked or completely ignored.
                </p>
              </div>

              {/* Right Card: Askme Dedicated Stream */}
              <div className="p-5 rounded-2xl bg-[#1D090C] border border-[#EB1000]/60 space-y-2 text-left">
                <h4 className="text-[#EB1000] font-extrabold text-sm sm:text-base">Askme Dedicated Stream</h4>
                <p className="text-[#A0A0B5] text-xs sm:text-[13px] leading-relaxed">
                  Neatly queued on the creator&apos;s OBS dashboard. When they answer, you get pinged instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: REAL-TIME PING ENGINE — THEY ANSWER. YOU KNOW */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[12px] sm:text-[14px] font-black text-[#EB1000] tracking-widest uppercase">ZERO GUESSWORK • REAL-TIME PING ENGINE</span>
            <h2 className="text-3xl sm:text-5xl lg:text-[55px] xl:text-[60px] font-heading font-extrabold text-white tracking-tight leading-[1.15]">
              THEY ANSWER. <span className="text-[#EB1000]">YOU KNOW</span>
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#8B8B9E] max-w-xl mx-auto font-medium">
              No refreshing. No checking. Just instant alerts when your creator answers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SURFACE 01 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#14141E] border border-[#222234] flex flex-col justify-between space-y-6 hover:border-[#EB1000]/40 transition-all group">
              <div>
                {/* Top Row: Icon Box & Surface Label */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#222234] border border-[#2F2F44] flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-[#EB1000]" />
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-[#181826] border border-[#28283C] text-[11px] font-mono font-bold text-[#8E8E9F] tracking-wider uppercase">
                    SURFACE 01
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-[20px] sm:text-[22px] font-heading font-extrabold text-white tracking-tight mb-2">
                  ASKME APP
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#8E8E9F] leading-relaxed">
                  Native push notifications delivered straight to your lock screen with instant tap-to-clip re watch.
                </p>
              </div>

              {/* Inner Lockscreen Notification Preview */}
              <div className="p-4 rounded-2xl bg-[#09090F] border border-[#1E1E2C] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-[#EB1000] text-white flex items-center justify-center font-black text-[10px]">
                      A
                    </div>
                    <span className="font-extrabold text-white text-xs">AskMe</span>
                  </div>
                  <span className="text-[10px] text-[#7A7A8E]">Just Now</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="font-extrabold text-white text-xs">"Creator answered your question."</div>
                  <div className="text-[11px] text-[#7A7A8E]">Tap to play creator audio response snippet</div>
                </div>
              </div>
            </div>

            {/* SURFACE 02 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#14141E] border border-[#222234] flex flex-col justify-between space-y-6 hover:border-[#00F5D4]/40 transition-all group">
              <div>
                {/* Top Row: Icon Box & Surface Label */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#222234] border border-[#2F2F44] flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-[#00F5D4]" />
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-[#181826] border border-[#28283C] text-[11px] font-mono font-bold text-[#8E8E9F] tracking-wider uppercase">
                    SURFACE 02
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-[20px] sm:text-[22px] font-heading font-extrabold text-white tracking-tight mb-2">
                  WEB & BROWSER
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#8E8E9F] leading-relaxed">
                  Instant browser toast & audio alert right over YouTube, Twitch, or your current desktop tabs.
                </p>
              </div>

              {/* Inner Toast Notification Preview */}
              <div className="p-4 rounded-2xl bg-[#09090F] border border-[#1E1E2C] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#00F5D4] animate-pulse"></span>
                    <span className="font-extrabold text-white text-xs">Chrome / Safari Notification</span>
                  </div>
                  <span className="text-[10px] text-[#7A7A8E]">Just now</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="font-semibold text-white text-xs">"Your question has been answered."</div>
                  <div className="text-[11px] text-[#7A7A8E]">Prince • Live Q&A session</div>
                </div>
              </div>
            </div>

            {/* SURFACE 03 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#14141E] border border-[#222234] flex flex-col justify-between space-y-6 hover:border-[#25D366]/40 transition-all group">
              <div>
                {/* Top Row: Icon Box & Surface Label */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#222234] border border-[#2F2F44] flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-[#181826] border border-[#28283C] text-[11px] font-mono font-bold text-[#8E8E9F] tracking-wider uppercase">
                    SURFACE 03
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-[20px] sm:text-[22px] font-heading font-extrabold text-white tracking-tight mb-2">
                  WHATSAPP
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#8E8E9F] leading-relaxed">
                  Zero app installs required. Get the exact timestamped answer directly on your phone.
                </p>
              </div>

              {/* Inner WhatsApp Preview */}
              <div className="p-4 rounded-2xl bg-[#09090F] border border-[#1E1E2C] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-xs">AskMe Official</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00F5D4] fill-[#00F5D4]" />
                  </div>
                  <span className="text-[10px] text-[#7A7A8E]">14:24</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0D1F17] border border-[#153D2A] space-y-1 mt-1">
                  <div className="text-xs font-extrabold text-[#25D366] flex items-center gap-1.5">
                    🔔 Askme answered your question!
                  </div>
                  <div className="text-[11px] text-[#A0C0AA] leading-snug">
                    "I'm using the Sony FX3 paired with 24-70 GM II..."
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom White Oval Action Button */}
          <div className="flex justify-center pt-4">
            <button className="px-7 py-3 rounded-full bg-white text-black font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-2xl shadow-white/10 hover:bg-gray-100 transition-all">
              <Bell className="h-4 w-4 text-black" />
              See Answer Alert
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: NEVER MISS YOUR CREATOR — FEATURED LIVE STREAM SHOWCASE */}
        {/* ========================================================================= */}
        <section id="live-matrix" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
          {/* HEADER */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              REAL-TIME BROADCAST ALERTS
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[55px] xl:text-[60px] font-extrabold text-white tracking-tight leading-[1.15]">
              NEVER MISS YOUR<br />
              <span className="text-[#EB1000]">CREATOR.</span>
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#8B8B9E] max-w-xl mx-auto font-medium">
              Your favorite creator goes Live. AskMe tells you instantly. Never miss an answer, surprise guest, or priority question queue.
            </p>

            {/* LIVE CREATORS SELECTOR BADGES / CAROUSEL CONTROLS */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-[#7A7A8E] font-mono uppercase font-bold mr-1">
                LIVE NOW ({liveStreams.length}):
              </span>
              {liveStreams.map((stream, idx) => {
                const isActive = idx === currentLiveIndex;
                return (
                  <button
                    key={stream.id || idx}
                    onClick={() => {
                      setCurrentLiveIndex(idx);
                      setIsAutoRotating(false);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${isActive
                      ? 'bg-[#EB1000] text-white shadow-lg shadow-[#EB1000]/40 ring-2 ring-[#EB1000]/50'
                      : 'bg-[#14141E] text-[#9E9EB2] border border-[#242436] hover:text-white hover:border-[#383850]'
                      }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-[#EB1000]'}`}></span>
                    {stream.creatorName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LARGE FEATURED LIVE STREAM CONTAINER */}
          <div
            className="max-w-5xl mx-auto rounded-3xl bg-[#14141E] border border-[#222234] p-5 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden group/card"
            onMouseEnter={() => setIsAutoRotating(false)}
            onMouseLeave={() => setIsAutoRotating(true)}
          >
            {/* Top Bar inside card */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202030] pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#EB1000] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#EB1000]/40 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span> LIVE NOW
                </span>
                <span className="text-xs text-[#8E8E9F] bg-[#0E0E16] px-3.5 py-1 rounded-full border border-[#222232] font-medium">
                  Broadcasting to: <span className="text-white font-semibold">{currentStream.broadcastingTo}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* <span className="text-xs text-white font-bold flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-[#8E8E9F]" /> {currentStream.watchingCount} <span className="text-[#8E8E9F] font-normal">watching</span>
                </span> */}

                {/* Carousel Prev/Next Buttons */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => {
                      setCurrentLiveIndex((prev) => (prev === 0 ? liveStreams.length - 1 : prev - 1));
                      setIsAutoRotating(false);
                    }}
                    aria-label="Previous Live Stream"
                    className="w-7 h-7 rounded-full bg-[#0E0E16] border border-[#26263A] text-white flex items-center justify-center hover:bg-[#EB1000] hover:border-[#EB1000] transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLiveIndex((prev) => (prev + 1) % liveStreams.length);
                      setIsAutoRotating(false);
                    }}
                    aria-label="Next Live Stream"
                    className="w-7 h-7 rounded-full bg-[#0E0E16] border border-[#26263A] text-white flex items-center justify-center hover:bg-[#EB1000] hover:border-[#EB1000] transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Stream Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
              {/* Stream Image Thumbnail */}
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-[#262638] shadow-lg group">
                <img
                  src={currentStream.avatar}
                  alt={currentStream.creatorName}
                  className="w-full h-52 sm:h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
                  <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 font-mono">
                    {currentStream.username}
                  </span>
                  {/* <span className="px-2.5 py-1 rounded-lg bg-[#EB1000]/80 font-bold shadow-md">
                    Min {currentStream.minFee}
                  </span> */}
                </div>
              </div>

              {/* Stream Details & Action Buttons */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono font-bold text-[#EB1000] uppercase tracking-wider flex items-center gap-2">
                    <span>{currentStream.category}</span>
                    <span className="text-[#8E8E9F] font-sans font-normal">• {currentStream.subscribers} • Priority Queue Active</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white flex items-center gap-2">
                    {currentStream.title}
                    <CheckCircle2 className="h-5 w-5 text-[#00F5D4] fill-[#00F5D4]" />
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8E8E9F] font-medium leading-relaxed italic pt-0.5">
                    {currentStream.streamTitle}
                  </p>
                </div>

                {/* Metrics line */}
                <div className="flex flex-wrap items-center gap-3 text-xs pt-2 pb-2 border-t border-b border-[#202030] text-[#8E8E9F]">
                  <span className="flex items-center gap-1 text-[#00F5D4] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Questions answered live
                  </span>
                  <span className="text-[#EB1000] font-bold">• {currentStream.queueCount} in priority queue</span>
                  <span>Avg. Answer Latency: 1m 40s</span>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStreamModalCreator({
                        ...currentStream,
                        name: currentStream.creatorName || currentStream.name || currentStream.username || 'Creator',
                        cleanUsername: currentStream.cleanUsername || String(currentStream.username || '').replace(/^@+/, ''),
                        streamTitle: currentStream.title || currentStream.streamTitle || '',
                      });
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#EB1000] text-white text-xs font-bold shadow-lg shadow-[#EB1000]/40 flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" /> Join Live Stream
                  </button>
                  <Link
                    href={currentStream.sessionCode ? `/pay/${currentStream.sessionCode}` : `/creator/${currentStream.username.replace('@', '')}`}
                    className="px-4 py-2.5 rounded-full bg-[#1F180A] border border-[#FFD60A]/50 text-[#FFD60A] text-xs font-bold flex items-center gap-1.5 hover:bg-[#2A200F] transition-all"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#FFD60A]" /> Ask Priority Question
                  </Link>
                  <button
                    onClick={() => toggleFollow(currentStream.creatorId || currentStream.id, currentStream.creatorName)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${followedCreators[String(currentStream.creatorId || currentStream.id)]
                      ? 'bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981]'
                      : 'bg-[#181826] border border-[#28283C] text-white hover:bg-[#202030]'
                      }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${followedCreators[String(currentStream.creatorId || currentStream.id)] ? 'fill-[#10B981] text-[#10B981]' : 'text-[#EB1000]'}`} />
                    {followedCreators[String(currentStream.creatorId || currentStream.id)] ? 'Following ✓' : 'Follow'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* GRID OF 3 UPCOMING STREAM CARDS */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-5 sm:p-6 rounded-3xl bg-[#14141E] border border-[#222234] flex flex-col justify-between space-y-4 hover:border-[#FFD60A]/40 transition-all shadow-xl"
              >
                <div>
                  {/* Card Header: Timer & Timestamp */}
          {/* <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#20180A] border border-[#FFD60A]/40 text-[#FFD60A] text-[11px] font-mono font-bold flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> STARTING IN 15 MIN
                    </span>
                    <span className="text-[11px] text-[#7A7A8E]">Today, 8:00 PM IST</span>
                  </div> */}

          {/* Creator Info Box */}
          {/* <div className="flex items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="TechBurner Live"
                      className="w-12 h-12 rounded-xl object-cover border border-[#28283C] shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1">
                        TechBurner Live <CheckCircle2 className="h-3.5 w-3.5 text-[#00F5D4] fill-[#00F5D4]" />
                      </h4>
                      <p className="text-[11px] text-[#8E8E9F] font-medium line-clamp-1">
                        "Unboxing Next-Gen Gadgets & Priority Q&A"
                      </p>
                    </div>
                  </div> */}

          {/* Pre-queue badge box */}
          {/* <div className="p-2.5 rounded-xl bg-[#1A1408] border border-[#FFD60A]/30 text-[#FFD60A] text-[11px] font-semibold flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 shrink-0" />
                    <span>Pre-queue questions open now (3 in queue)</span>
                  </div> */}
          {/* </div> */}

          {/* Footer & Action Button */}
          {/* <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7A7A8E]">Notify via:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0D1F17] border border-[#25D366]/40 text-[#25D366] text-[10px] font-bold">
                        • WhatsApp
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#181826] border border-[#28283C] text-[#8E8E9F] text-[10px] font-bold">
                        • Push
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/viewers/login"
                    className="w-full py-2.5 rounded-full bg-[#D4D4E2] hover:bg-white text-black font-extrabold text-xs tracking-wider uppercase text-center block transition-all shadow-md"
                  >
                    live soon
                  </Link>
                </div>
              </div>
            ))} */}
          {/* </div> */}

          {/* BOTTOM ACTION BUTTON: FOLLOW YOUR CREATORS */}
          <div className="flex justify-center pt-6">
            <Link
              href="#creators"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-sm sm:text-base font-extrabold shadow-xl shadow-[#EB1000]/40 flex items-center gap-2 hover:opacity-90 hover:scale-105 transition-all"
            >
              Follow Your creators <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: ONE ASKME. EVERY PLATFORM — ZERO SILOS */}
        {/* ========================================================================= */}
        <section id="for-creators" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* HEADER */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              ONE CORE HUB • ZERO PLATFORM SILOS | 7 SIMULTANEOUS CHANNELS
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[55px] xl:text-[60px] font-extrabold text-white tracking-tight leading-[1.15]">
              ONE ASKME . <span className="text-[#EB1000]">EVERY PLATFORM</span>
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#8B8B9E] max-w-xl mx-auto font-medium">
              Creators stay where they create. AskMe brings their audience closer
            </p>
          </div>

          {/* ORBITAL DYNAMIC ANIMATION SHOWCASE */}
          <div className="relative max-w-4xl mx-auto my-10 h-[460px] sm:h-[580px] flex items-center justify-center overflow-hidden rounded-3xl bg-[#07070F]/60 border border-[#1C1C2A] p-4 group/orbitContainer">

            {/* Ambient Background Radial Glow */}
            <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full bg-[#EB1000]/15 blur-[100px] pointer-events-none"></div>

            {/* Spoke Radial Grid Lines */}
            <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
              <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#EB1000] to-transparent"></div>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#EB1000] to-transparent"></div>
              <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#EB1000] to-transparent rotate-45"></div>
              <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#EB1000] to-transparent -rotate-45"></div>
            </div>

            {/* CENTER CORE: ASKME GLOWING RED NODE */}
            <div className="relative z-30 flex flex-col items-center justify-center">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#FF2A1A] via-[#EB1000] to-[#900600] text-white flex flex-col items-center justify-center shadow-[0_0_70px_rgba(235,16,0,0.9)] border-2 border-white/40 transition-transform duration-300 hover:scale-110 cursor-pointer">
                <Logo size="sm" />
                {/* <span className="text-[10px] sm:text-[12px] font-black tracking-widest uppercase mt-1">ASKME</span> */}
              </div>
            </div>

            {/* ==================== TRACK 1: INNER ORBIT (22s Clockwise) ==================== */}
            <div className="absolute w-[200px] h-[200px] sm:w-[270px] sm:h-[270px] rounded-full border border-[#EB1000]/30 border-dashed animate-[spin_22s_linear_infinite] group-hover/orbitContainer:[animation-play-state:paused] pointer-events-none z-10">
              {/* WhatsApp (Top 0deg) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_22s_linear_infinite_reverse] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="bg-[#12121E]/95 backdrop-blur-md border border-white/20 hover:border-[#25D366] text-white px-3.5 py-1.5 rounded-full font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:scale-110 transition-all cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366] animate-pulse"></span>
                    <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* OBS Studio (Bottom Right 120deg) */}
              <div className="absolute top-[75%] left-[86.6%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_22s_linear_infinite_reverse] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="bg-[#12121E]/95 backdrop-blur-md border border-white/20 hover:border-[#00F5D4] text-white px-3.5 py-1.5 rounded-full font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.8)] hover:scale-110 transition-all cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_#00F5D4] animate-pulse"></span>
                    <Video className="h-3.5 w-3.5 text-[#00F5D4]" />
                    <span>OBS Studio</span>
                  </div>
                </div>
              </div>


            </div>

            {/* ==================== TRACK 2: MIDDLE ORBIT (32s Counter-Clockwise) ==================== */}
            <div className="absolute w-[330px] h-[330px] sm:w-[440px] sm:h-[440px] rounded-full border border-[#EB1000]/25 border-dashed animate-[spin_32s_linear_infinite_reverse] group-hover/orbitContainer:[animation-play-state:paused] pointer-events-none z-20">
              {/* YouTube (Top Right 45deg) - FEATURED HIGHLIGHTED WHITE BADGE */}
              <div className="absolute top-[14.6%] left-[85.4%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_32s_linear_infinite] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 border-2 border-white hover:scale-110 transition-all cursor-pointer">
                    <span className="w-3 h-3 rounded-full bg-[#FF0000] shadow-[0_0_10px_#FF0000] animate-pulse"></span>
                    <Video className="h-4 w-4 text-[#FF0000]" />
                    <span>YouTube</span>
                  </div>
                </div>
              </div>

              {/* Instagram (Top Left 315deg) */}
              <div className="absolute top-[14.6%] left-[14.6%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_32s_linear_infinite] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="bg-[#12121E]/95 backdrop-blur-md border border-white/20 hover:border-[#E1306C] text-white px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_18px_rgba(0,0,0,0.8)] hover:scale-110 transition-all cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E1306C] shadow-[0_0_8px_#E1306C] animate-pulse"></span>
                    <Smartphone className="h-3.5 w-3.5 text-[#E1306C]" />
                    <span>Instagram</span>
                  </div>
                </div>
              </div>

              {/* Twitch (Bottom Left 225deg) */}
              <div className="absolute top-[85.4%] left-[14.6%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_32s_linear_infinite] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="bg-[#12121E]/95 backdrop-blur-md border border-white/20 hover:border-[#9146FF] text-white px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_18px_rgba(0,0,0,0.8)] hover:scale-110 transition-all cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9146FF] shadow-[0_0_8px_#9146FF] animate-pulse"></span>
                    <Tv className="h-3.5 w-3.5 text-[#9146FF]" />
                    <span>Twitch</span>
                  </div>
                </div>
              </div>

              {/* X / Twitter (Bottom Right 135deg) */}
              <div className="absolute top-[85.4%] left-[85.4%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_32s_linear_infinite] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="bg-[#12121E]/95 backdrop-blur-md border border-white/20 hover:border-white text-white px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_18px_rgba(0,0,0,0.8)] hover:scale-110 transition-all cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#FFFFFF] animate-pulse"></span>
                    <span className="font-mono font-black text-xs">X</span>
                    <span>X</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================== TRACK 3: OUTER ORBIT (45s Clockwise) ==================== */}
            <div className="absolute w-[460px] h-[460px] sm:w-[580px] sm:h-[580px] rounded-full border border-[#EB1000]/15 border-dashed animate-[spin_45s_linear_infinite] group-hover/orbitContainer:[animation-play-state:paused] pointer-events-none z-10">
              {/* LinkedIn (Top Center 0deg) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_45s_linear_infinite_reverse] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="bg-[#12121E]/95 backdrop-blur-md border border-white/20 hover:border-[#0A66C2] text-white px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_18px_rgba(0,0,0,0.8)] hover:scale-110 transition-all cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0A66C2] shadow-[0_0_8px_#0A66C2] animate-pulse"></span>
                    <span className="font-black text-xs text-[#0A66C2]">in</span>
                    <span>LinkedIn</span>
                  </div>
                </div>
              </div>

              {/* Facebook (Bottom Right 120deg) */}
              <div className="absolute top-[75%] left-[86.6%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_45s_linear_infinite_reverse] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="bg-[#12121E]/95 backdrop-blur-md border border-white/20 hover:border-[#1877F2] text-white px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_18px_rgba(0,0,0,0.8)] hover:scale-110 transition-all cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] shadow-[0_0_8px_#1877F2] animate-pulse"></span>
                    <span className="font-black text-xs text-[#1877F2]">f</span>
                    <span>Facebook</span>
                  </div>
                </div>
              </div>

              {/* More (Bottom Left 240deg) */}
              <div className="absolute top-[75%] left-[13.4%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="animate-[spin_45s_linear_infinite_reverse] group-hover/orbitContainer:[animation-play-state:paused]">
                  <div className="bg-[#12121E]/95 backdrop-blur-md border border-white/20 hover:border-[#EB1000] text-white px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_18px_rgba(0,0,0,0.8)] hover:scale-110 transition-all cursor-pointer">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EB1000] shadow-[0_0_8px_#EB1000] animate-pulse"></span>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM CONNECTED STREAMS BAR */}
          <div className="pt-6 border-t border-[#1C1C2A] max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-[#7A7A8E] uppercase tracking-wider mr-1">
                CONNECTED STREAMS:
              </span>
              <span className="px-3 py-1 rounded-full bg-[#280F12] border border-[#FF0000]/40 text-[#FF4D4D] text-[11px] sm:text-xs font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF0000]"></span> YouTube
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1A1028] border border-[#9146FF]/40 text-[#A970FF] text-[11px] sm:text-xs font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9146FF]"></span> Twitch
              </span>
              <span className="px-3 py-1 rounded-full bg-[#0D2423] border border-[#00F5D4]/40 text-[#00F5D4] text-[11px] sm:text-xs font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00F5D4]"></span> Kick
              </span>
              <span className="px-3 py-1 rounded-full bg-[#26101E] border border-[#E1306C]/40 text-[#FF65A5] text-[11px] sm:text-xs font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E1306C]"></span> Instagram
              </span>
              <span className="px-3 py-1 rounded-full bg-[#0C1B2B] border border-[#1877F2]/40 text-[#4C9EFF] text-[11px] sm:text-xs font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1877F2]"></span> Facebook
              </span>
              <span className="px-3 py-1 rounded-full bg-[#0B1E2D] border border-[#0A66C2]/40 text-[#38A1FF] text-[11px] sm:text-xs font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0A66C2]"></span> LinkedIn
              </span>
              <span className="px-3 py-1 rounded-full bg-[#181822] border border-white/30 text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white"></span> X (Twitter)
              </span>
            </div>

            <button className="px-4 py-2 rounded-full bg-[#181826] border border-[#28283C] text-white text-xs font-semibold flex items-center gap-2 hover:bg-[#202030] transition-all shadow-md">
              <RefreshCw className="h-3.5 w-3.5 text-[#7A7A8E]" /> Sync All Live Feeds
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: BUILT FOR MODERN CREATORS — OBS STUDIO DOCK MOCKUP */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* HEADER */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              BUILT FOR MODERN CREATORS
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[55px] xl:text-[60px] font-extrabold text-white tracking-tight leading-[1.15]">
              TURN VIEWERS INTO<br />
              <span className="text-[#EB1000]">CONVERSATIONS.</span>
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#8B8B9E] max-w-2xl mx-auto font-medium">
              Your audience has questions. Give them a zero-friction way to ask, supercharge fan loyalty, and turn live streams into instant creator revenue.
            </p>

            {/* CREATOR AVATARS & LAUNCH HUB BUTTON ROW */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0A0A0F]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                  <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0A0A0F]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                  <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0A0A0F]" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                </div>
                <span className="text-xs text-[#8E8E9F] font-medium">
                  <strong className="text-white font-bold">3,400+</strong> creators live now
                </span>
              </div>
              <Link
                href="/creators/register"
                className="px-5 py-2 rounded-full bg-[#14141E] border border-[#2E2E42] text-white text-xs font-bold hover:bg-[#1A1A28] hover:border-[#EB1000]/50 transition-all shadow-md"
              >
                Launch Your Live Hub
              </Link>
            </div>
          </div>

          {/* MAIN PRO OBS STUDIO DOCK WINDOW */}
          <div className="max-w-6xl mx-auto rounded-3xl bg-[#14141F] border border-[#222234] shadow-2xl p-4 sm:p-6 space-y-4 text-left">
            {/* WINDOW TOP HEADER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202030] pb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F56] inline-block"></span>
                  <span className="h-3 w-3 rounded-full bg-[#FFBD2E] inline-block"></span>
                  <span className="h-3 w-3 rounded-full bg-[#27C93F] inline-block"></span>
                </div>
                <span className="font-mono text-[11px] text-[#EB1000] font-bold ml-2">ASKME//OS</span>
                <span className="font-mono text-[11px] text-[#8E8E9F]">
                  › OBS STUDIO DOCK <span className="px-1.5 py-0.5 rounded bg-[#202030] text-[10px] text-white">V3.4.2</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-[#8E8E9F]">Multi-Sync:</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF0000]/20 text-[#FF4D4D] text-[10px] font-bold">• YouTube</span>
                <span className="px-2 py-0.5 rounded-full bg-[#9146FF]/20 text-[#A970FF] text-[10px] font-bold">• Twitch</span>
                <span className="px-2 py-0.5 rounded-full bg-[#00F5D4]/20 text-[#00F5D4] text-[10px] font-bold">• Kick</span>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#EB1000]/20 border border-[#EB1000]/40 text-[#EB1000] text-[10px] font-extrabold flex items-center gap-1 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span> LIVE BROADCAST
              </span>
            </div>

            {/* STATUS SUMMARY BAR */}
            <div className="p-3 rounded-xl bg-[#0B0B12] border border-[#202030] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="px-3 py-1 rounded-lg bg-[#0D2418] border border-[#10B981]/40 text-[#10B981] font-extrabold flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> ₹18,420 <span className="font-normal text-[11px] text-[#80C0A0]">Earned Tonight</span>
                </span>
                <span className="text-[#8E8E9F] font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#9146FF]"></span> <strong className="text-white">72</strong> Incoming Asks
                </span>
                <span className="text-[#8E8E9F] font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#00F5D4]"></span> <strong className="text-white">0ms</strong> WebSocket Latency
                </span>
              </div>

              <span className="text-[11px] text-[#7A7A8E] flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span> OBS Virtual Cam / Dock Ready
              </span>
            </div>

            {/* TWO-COLUMN CONTROL ROOM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
              {/* LEFT COLUMN: PRIORITY STREAM QUEUE */}
              <div className="lg:col-span-7 space-y-3">
                {/* Header & Category Filters */}
                <div className="flex items-center justify-between border-b border-[#202030] pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    Priority Stream Queue
                    <span className="px-2 py-0.5 rounded-full bg-[#FF9500]/20 text-[#FF9500] text-[10px] font-bold border border-[#FF9500]/30">
                      5 Pending
                    </span>
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EB1000] text-white text-[10px] font-bold">All (5)</span>
                    <span className="text-[10px] text-[#7A7A8E] hover:text-white cursor-pointer px-2 py-0.5">⚡ SuperAsk</span>
                    <span className="text-[10px] text-[#7A7A8E] hover:text-white cursor-pointer px-2 py-0.5">Paid</span>
                    <span className="text-[10px] text-[#7A7A8E] hover:text-white cursor-pointer px-2 py-0.5">Free</span>
                  </div>
                </div>

                {/* Question Card 1 (Dev K. - Featured Active) */}
                <div className="p-4 rounded-2xl bg-[#1C1014] border border-[#EB1000]/60 space-y-3 shadow-lg shadow-[#EB1000]/10">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">Dev K.</span>
                      <span className="px-2 py-0.5 rounded bg-[#FFD60A] text-black text-[10px] font-black uppercase">
                        ₹499 SUPERASK
                      </span>
                    </div>
                    <span className="text-[10px] text-[#7A7A8E]">32 upvotes • 2 min ago</span>
                  </div>

                  <p className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                    "Can you explain your 4K video editing colour pipeline in DaVinci Resolve?"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#30161C]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#FF9500] font-semibold">
                      <Activity className="h-3.5 w-3.5" /> Includes 12s voice clip
                    </div>
                    <button className="px-4 py-2 rounded-full bg-[#EB1000] text-white text-xs font-bold shadow-md shadow-[#EB1000]/40 flex items-center gap-1.5 hover:opacity-90 transition-all">
                      <Radio className="h-3.5 w-3.5" /> Answer & Broadcast
                    </button>
                  </div>
                </div>

                {/* Question Card 2 (Alex M.) */}
                <div className="p-3.5 rounded-2xl bg-[#0E0E16] border border-[#202030] flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#7A7A8E] flex items-center gap-2">
                      <strong className="text-white font-bold">Alex M.</strong>
                      <span className="px-1.5 py-0.5 rounded bg-[#FFD60A]/20 text-[#FFD60A] text-[9px] font-bold">₹199 Priority</span>
                      <span>• 18 upvotes</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      "What lens are you using right now for this bokeh blur?"
                    </p>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-[#EB1000] text-white text-xs font-bold hover:opacity-90 transition-all shrink-0">
                    ANSWER
                  </button>
                </div>

                {/* Question Card 3 (Rohan V.) */}
                <div className="p-3.5 rounded-2xl bg-[#0E0E16] border border-[#202030] flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#7A7A8E] flex items-center gap-2">
                      <strong className="text-white font-bold">Rohan V.</strong>
                      <span className="px-1.5 py-0.5 rounded bg-[#FFD60A]/20 text-[#FFD60A] text-[9px] font-bold">₹299 Priority</span>
                      <span>• 14 upvotes</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      "Will you host an offline streamer bootcamp in Bengaluru next month?"
                    </p>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-[#EB1000] text-white text-xs font-bold hover:opacity-90 transition-all shrink-0">
                    ANSWER
                  </button>
                </div>

                {/* Question Card 4 (Priya S.) */}
                <div className="p-3.5 rounded-2xl bg-[#0E0E16] border border-[#202030] flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#7A7A8E] flex items-center gap-2">
                      <strong className="text-white font-bold">Priya S.</strong>
                      <span className="px-1.5 py-0.5 rounded bg-[#202030] text-[#7A7A8E] text-[9px] font-bold">Free Community</span>
                      <span>• 8 upvotes</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      "Where can I find the wallpaper you use on your studio monitors?"
                    </p>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-[#202030] text-[#8E8E9F] text-xs font-bold hover:text-white transition-all shrink-0">
                    Answer
                  </button>
                </div>

                {/* Bottom Tip Line */}
                <div className="text-[10px] text-[#7A7A8E] flex items-center gap-1.5 pt-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                  <span>Hitting 'Answer & Broadcast' triggers an instant WhatsApp audio alert with live timestamp directly to the viewer.</span>
                </div>
              </div>

              {/* RIGHT COLUMN: OBS OVERLAY DOCK & QR CODE */}
              <div className="lg:col-span-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#202030] pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-[#EB1000]" /> OBS OVERLAY DOCK
                  </span>
                  <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse"></span> feed sync active
                  </span>
                </div>

                {/* White QR Code Display Container */}
                <div className="p-5 rounded-2xl bg-[#08080E] border border-[#202030] flex flex-col items-center justify-center space-y-3">
                  <div className="bg-white p-4 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
                    <OriginalScannerImage className="w-44 sm:w-48 h-auto" />
                  </div>
                  <div className="text-[12px] sm:text-[13px] font-mono text-[#EB1000] font-bold tracking-tight">
                    askme.live/@samaylive <span className="text-[#EB1000] font-bold">✓</span>
                  </div>
                  <p className="text-[10px] text-[#7A7A8E] text-center max-w-xs leading-relaxed font-medium">
                    Paste once into OBS Browser Source (1080x1920) or pin in YouTube Live chat.
                  </p>
                </div>

                {/* Copy & Download Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('https://askme.live/@samaylive/overlay');
                      setCopiedObsUrl(true);
                      setTimeout(() => setCopiedObsUrl(false), 2000);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#181826] border border-[#28283C] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#202030] transition-all shadow-md"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#EB1000]" />
                    {copiedObsUrl ? 'Copied OBS URL!' : 'Copy OBS Browser Source URL'}
                  </button>

                  <button className="text-[10px] text-[#8E8E9F] hover:text-white flex items-center justify-center gap-1.5 w-full pt-1 font-semibold transition-colors">
                    <Download className="h-3 w-3 text-[#FFD60A]" /> Download 4K Lower-Third & Banner Pack
                  </button>
                </div>

                {/* Ticker & Metrics Grid */}
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#09090F] border border-[#202030] flex items-center justify-between text-[10px] text-[#7A7A8E]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
                      <span className="text-white font-medium">New ask from @kunal_v (₹99)</span>
                    </div>
                    <span>just now</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-[#8E8E9F]">
                    <div className="p-2 rounded-lg bg-[#0E0E16] border border-[#202030]">
                      <span className="text-white block font-extrabold text-[10px]">100%</span>
                      Audience Kept
                    </div>
                    <div className="p-2 rounded-lg bg-[#0E0E16] border border-[#202030]">
                      <span className="text-[#00F5D4] block font-extrabold text-[10px]">Instant</span>
                      UPI / Stripe
                    </div>
                    <div className="p-2 rounded-lg bg-[#0E0E16] border border-[#202030]">
                      <span className="text-[#EB1000] block font-extrabold text-[10px]">0% Tax</span>
                      Zero App Stores
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: TRANSPARENT CREATOR ECONOMICS & CALCULATOR */}
        {/* ========================================================================= */}
        <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* HEADER */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              TRANSPARENT CREATOR ECONOMICS
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-[55px] xl:text-[60px] font-extrabold text-white tracking-tight leading-[1.15]">
              Keep More of What <span className="text-[#EB1000]">Your</span><br />
              <span className="text-[#EB1000]">Audience</span> Supports.
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#8B8B9E] max-w-2xl mx-auto font-medium">
              With AskMe, creators keep up to 85% of audience support with direct Web & QR payments. No 30% Apple tax, no middlemen.
            </p>

            {/* FEATURE BADGES ROW (3 PILL BADGES) */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <div className="px-4 py-2 rounded-xl bg-[#14141E] border border-[#222234] flex items-center gap-2.5 text-xs text-left shadow-md">
                <div className="w-7 h-7 rounded-lg bg-[#FFD60A]/20 flex items-center justify-center text-[#FFD60A] text-sm font-bold">
                  👑
                </div>
                <div>
                  <strong className="text-white font-extrabold text-xs">
                    85% <span className="text-[10px] text-[#8E8E9F] font-normal">(Up to)</span>
                  </strong>
                  <div className="text-[10px] text-[#8E8E9F]">Creator Share</div>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[#14141E] border border-[#222234] flex items-center gap-2.5 text-xs text-left shadow-md">
                <div className="w-7 h-7 rounded-lg bg-[#00E676]/20 flex items-center justify-center text-[#00E676] text-sm font-bold">
                  ✓
                </div>
                <div>
                  <strong className="text-white font-extrabold text-xs">
                    0% <span className="text-[#00E676]">Apple Tax</span>
                  </strong>
                  <div className="text-[10px] text-[#8E8E9F]">On Web & QR</div>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[#14141E] border border-[#222234] flex items-center gap-2.5 text-xs text-left shadow-md">
                <div className="w-7 h-7 rounded-lg bg-[#FF9500]/20 flex items-center justify-center text-[#FF9500] text-sm font-bold">
                  ⚡
                </div>
                <div>
                  <strong className="text-white font-extrabold text-xs">Direct Payments</strong>
                  <div className="text-[10px] text-[#8E8E9F]">Instant UPI & Cards</div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER SMARTPHONE MOCKUP GRAPHIC */}
          <div className="relative max-w-md mx-auto my-10 px-4">
            {/* FLOATING BADGE (LEFT): ⚡ 0% Apple Fee */}
            <div className="absolute -left-2 sm:-left-6 top-16 z-30 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#00A86B] font-extrabold text-xs border border-[#00A86B]/30 shadow-xl shadow-black/40">
              <span className="text-[#FFB703]">⚡</span>
              <span>0% Apple Fee</span>
            </div>

            {/* FLOATING RUPEE COIN (RIGHT): ₹ */}
            <div className="absolute -right-2 sm:-right-6 top-24 z-30 w-12 h-12 rounded-full bg-gradient-to-b from-[#FFD60A] via-[#FFC107] to-[#FF9800] text-black font-black flex items-center justify-center text-xl border-2 border-white shadow-[0_0_25px_rgba(255,214,10,0.6)]">
              ₹
            </div>

            {/* MAIN SMARTPHONE CONTAINER FRAME */}
            <div className="w-full max-w-[340px] sm:max-w-[370px] rounded-[38px] bg-[#0E101A] border-[3px] border-[#2A2E42] p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative mx-auto space-y-4 overflow-hidden group">

              {/* Inner Radial Glow Backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/15 via-transparent to-transparent pointer-events-none"></div>

              {/* TOP STATUS / HEADER BAR */}
              <div className="relative z-10 flex items-center justify-between text-xs px-1">
                {/* LIVE BADGE */}
                <div className="px-3 py-1 rounded-full bg-[#FF3B30] text-white text-[11px] font-black tracking-wider flex items-center gap-1.5 uppercase shadow-lg shadow-[#FF3B30]/30">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                  <span>LIVE</span>
                </div>

                {/* VIEWER COUNT */}
                <div className="px-3 py-1 rounded-full bg-[#181A26]/80 text-[#8E8E9F] text-xs font-bold flex items-center gap-1.5 border border-white/5 backdrop-blur-md">
                  <span className="text-[#FF3B30]">👁</span>
                  <span className="text-white font-extrabold">4.2K</span>
                </div>

                {/* CREATOR TITLE / CHANNEL */}
                <div className="px-3.5 py-1 rounded-full bg-[#181A26]/90 border border-white/10 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <span className="text-[10px] text-[#8E8E9F]">📡</span>
                  <span>Kriti Live</span>
                </div>
              </div>

              {/* INNER DONATION / SUPPORT MESSAGES LIST */}
              <div className="relative z-10 space-y-3 pt-2">
                {/* 1. GREEN DONATION CARD (Rahul) */}
                <div className="p-3.5 rounded-2xl bg-[#091F17] border border-[#00E676]/40 text-xs text-white flex items-center justify-between shadow-lg shadow-[#00E676]/5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    {/* Rupee Icon Circle */}
                    <div className="w-8 h-8 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 flex items-center justify-center text-[#00E676] font-black text-sm shrink-0">
                      ₹
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-white text-sm tracking-tight">
                        Rahul sent <span className="text-[#00E676] font-black">₹500</span>
                      </div>
                      <div className="text-xs text-[#A0D0B0] font-medium mt-0.5">
                        Keep inspiring us! 🔥
                      </div>
                    </div>
                  </div>
                  {/* Direct Web Tag */}
                  <span className="px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-[10px] font-extrabold tracking-wide shrink-0">
                    Direct Web
                  </span>
                </div>

                {/* 2. AMBER DONATION CARD (Prince) */}
                <div className="p-3.5 rounded-2xl bg-[#23150A] border border-[#FF9500]/40 text-xs text-white flex items-center justify-between shadow-lg shadow-[#FF9500]/5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    {/* Crown Icon Circle */}
                    <div className="w-8 h-8 rounded-full bg-[#FF9500]/20 border border-[#FF9500]/40 flex items-center justify-center text-[#FF9500] font-bold text-sm shrink-0">
                      👑
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-white text-sm tracking-tight">
                        Price sent <span className="text-[#FFB703] font-black">₹2,000 SuperAsk</span>
                      </div>
                      <div className="text-xs text-[#E8C09D] font-medium mt-0.5">
                        Loved the career advice!
                      </div>
                    </div>
                  </div>
                  {/* Instant UPI Tag */}
                  <span className="px-3 py-1 rounded-full bg-[#FF9500]/15 border border-[#FF9500]/30 text-[#FF9500] text-[10px] font-extrabold tracking-wide shrink-0">
                    Instant UPI
                  </span>
                </div>
              </div>

              {/* BOTTOM ACTION BAR (Button + Reaction Icons) */}
              <div className="relative z-10 flex items-center gap-2 pt-2">
                {/* Main Action Button */}
                <button className="flex-1 py-3 px-4 rounded-full bg-white text-black font-black text-xs sm:text-sm hover:bg-gray-100 transition-all shadow-xl text-center active:scale-95 cursor-pointer">
                  Support the creator
                </button>

                {/* Reaction Icon 1: Gold Acorn / Lightning / Clap */}
                <div className="w-10 h-10 rounded-full bg-[#1A1D2B] border border-white/10 flex items-center justify-center text-amber-400 text-sm shrink-0 shadow-md">
                  👏
                </div>

                {/* Reaction Icon 2: Red Heart */}
                <div className="w-10 h-10 rounded-full bg-[#1A1D2B] border border-white/10 flex items-center justify-center text-[#FF3B30] text-sm shrink-0 shadow-md">
                  ❤️
                </div>
              </div>

            </div>
          </div>

          {/* BOTTOM 2 DARK CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto pt-2">
            {/* LEFT DARK CARD: See What You Could Take Home (Interactive Calculator) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#14141E] text-white space-y-6 shadow-2xl border border-[#222234] text-left">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    See What You Could Take Home
                  </h3>
                  <p className="text-xs text-[#8E8E9F] font-medium mt-1">
                    Enter or adjust your estimated audience support amount
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1E1E2C] text-[#8E8E9F] border border-[#2A2A3D] text-xs font-bold">
                  Calculator
                </span>
              </div>

              {/* Quick Preset Selector Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[50000, 100000, 250000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCalcAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${calcAmount === amt
                      ? 'bg-[#EB1000] text-white shadow-md shadow-[#EB1000]/30'
                      : 'bg-[#181824] text-[#8E8E9F] hover:text-white border border-[#262638]'
                      }`}
                  >
                    ₹{(amt / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>

              {/* Range Slider & Amount Display */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8E8E9F] uppercase tracking-wider">
                    Gross Audience Support
                  </span>
                  <span className="text-2xl font-black text-white">
                    ₹{calcAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="1000000"
                  step="10000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-2 bg-[#1E1E2C] rounded-lg appearance-none cursor-pointer accent-[#EB1000]"
                />
              </div>

              {/* Fee Breakdown Lines */}
              <div className="space-y-2.5 pt-2 text-xs border-t border-[#222234]">
                <div className="flex items-center justify-between text-[#8E8E9F] font-medium">
                  <div className="flex items-center gap-2">
                    <span>AskMe Web / QR</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[#00E599] text-[10px] font-bold">
                      0% Apple Tax
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#8E8E9F] font-medium">
                  <span>AskMe Fee (15%)</span>
                  <span className="text-[#EB1000] font-bold">- ₹{Math.round(calcAmount * 0.15).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-[#8E8E9F] font-medium">
                  <span>Gateway Charges (~2%)</span>
                  <span className="text-[#EB1000] font-bold">- ₹{Math.round(calcAmount * 0.02).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-[#8E8E9F] font-medium">
                  <span>GST + TDS (~3.7%)</span>
                  <span className="text-[#EB1000] font-bold">- ₹{Math.round(calcAmount * 0.037).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Result Payout Box */}
              <div className="p-4 rounded-2xl bg-[#1A0A0C] border border-[#EB1000]/40 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-xs font-bold text-[#A0A0B2]">
                    Your Estimated Payout <span className="text-[#EB1000] ml-1 font-extrabold">Instant Transfer</span>
                  </span>
                  <div className="text-2xl font-black text-white mt-0.5">
                    ₹{Math.round(calcAmount * 0.793).toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-bold text-[#EB1000] bg-[#280A0A] px-2 py-0.5 rounded-full border border-[#EB1000]/40 ml-1">
                      ~79.3%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT DARK CARD: Why Creators Keep More with AskMe? (Comparison Table) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#14141E] text-white space-y-6 shadow-2xl border border-[#222234] flex flex-col justify-between text-left">
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">
                      Why Creators Keep More with AskMe?
                    </h3>
                    <p className="text-xs text-[#8E8E9F] font-medium mt-1">
                      Direct comparisons against legacy app store models
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#1E1E2C] text-[#8E8E9F] border border-[#2A2A3D] text-xs font-bold">
                    Fair Terms
                  </span>
                </div>

                {/* Comparison Table */}
                <div className="border border-[#222234] rounded-2xl overflow-hidden text-xs bg-[#0B0B12]">
                  <div className="grid grid-cols-12 bg-[#141420] p-3 font-mono font-bold text-[#8E8E9F] border-b border-[#222234]">
                    <div className="col-span-4 uppercase">PLATFORM METRIC</div>
                    <div className="col-span-4 text-center text-[#EB1000] uppercase font-extrabold">
                      ASKME (WEB & QR)
                    </div>
                    <div className="col-span-4 text-right uppercase">OTHER IOS PLATFORMS</div>
                  </div>

                  <div className="grid grid-cols-12 p-3 border-b border-[#1E1E2C] items-center font-medium">
                    <div className="col-span-4 text-white font-bold">Apple Tax</div>
                    <div className="col-span-4 text-center font-extrabold text-[#EB1000] text-sm">
                      0%
                    </div>
                    <div className="col-span-4 text-right text-[#7A7A8E]">30%</div>
                  </div>

                  <div className="grid grid-cols-12 p-3 border-b border-[#1E1E2C] items-center font-medium">
                    <div className="col-span-4 text-white font-bold">Creator Share</div>
                    <div className="col-span-4 text-center font-extrabold text-[#EB1000] text-sm">
                      Up to 85%
                    </div>
                    <div className="col-span-4 text-right text-[#7A7A8E]">~35–70%</div>
                  </div>

                  <div className="grid grid-cols-12 p-3 items-center font-medium">
                    <div className="col-span-4 text-white font-bold">Direct Payments</div>
                    <div className="col-span-4 text-center font-extrabold text-[#EB1000] text-xs">
                      Instant UPI & Cards
                    </div>
                    <div className="col-span-4 text-right text-[#7A7A8E]">Delayed Hold</div>
                  </div>
                </div>

                {/* Highlight Banner Box */}
                <div className="p-4 rounded-2xl bg-[#1A0A0C] border border-[#EB1000]/40 space-y-1 mt-4">
                  <div className="text-xs font-extrabold text-[#EB1000]">
                    Keep ₹63K – ₹93K more
                  </div>
                  <div className="text-xs text-[#A0A0B2] font-medium">
                    than other iOS platforms on every ₹2.5 Lakhs raised.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION BUTTONS: GET STARTED & VIEW FULL PAYOUT POLICY */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => openAuthModal('creator', 'login')}
              className="px-8 py-3.5 rounded-full bg-[#EB1000] text-white text-sm sm:text-base font-extrabold shadow-xl shadow-[#EB1000]/40 flex items-center gap-2 hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
            >
              Get Started <ArrowRight className="h-4 w-4 stroke-[3]" />
            </button>
            <Link
              href="/admin/kyc/user-agreement"
              className="px-8 py-3.5 rounded-full bg-black/40 border border-white/30 text-white text-sm sm:text-base font-bold flex items-center gap-2 hover:bg-white/10 hover:border-white transition-all shadow-md"
            >
              View Full Payout Policy <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: DISCOVER & CONNECT WITH TOP CREATORS GRID */}
        {/* ========================================================================= */}
        <section id="creators" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          {/* TOP BADGES & HEADER ROW WITH RIGHT-ALIGNED FILTER DROPDOWNS */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              {/* TOP BADGES */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
                  LIVE & UPCOMING CREATORS
                </div>
                <span className="px-3.5 py-1 rounded-full bg-[#0D2418] border border-[#10B981]/40 text-[#10B981] text-[11px] sm:text-[12px] font-mono font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse"></span> {creatorsList.filter(c => c.isLive).length} Creators Streaming Now • {creatorsList.length} Registered Creators
                </span>
              </div>

              {/* HEADING */}
              <h2 className="text-3xl sm:text-4xl lg:text-[50px] xl:text-[55px] font-extrabold text-white tracking-tight leading-[1.1]">
                DISCOVER & CONNECT WITH<br />
                <span className="text-[#EB1000]">TOP CREATORS</span>
              </h2>

              {/* SUBTITLE */}
              <p className="text-[15px] sm:text-[17px] text-[#8B8B9E] max-w-2xl font-medium leading-relaxed">
                Scan, tap, or submit priority super-questions directly inside creator studio monitors.
              </p>
            </div>

            {/* SECONDARY FILTER DROPDOWNS ROW (RIGHT ALIGNED) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Box Input for Creator Name and Category */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A7A8E]" />
                <input
                  type="text"
                  placeholder="Search creator name or category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCreatorPageIndex(0);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-full bg-[#0F0F18] border border-[#26263A] text-xs text-white placeholder-[#7A7A8E] focus:outline-none focus:border-[#EB1000] transition-all shadow-md"
                />
              </div>

              <Link
                href="/discover-creators"
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#EB1000] text-white text-xs font-bold shadow-lg shadow-[#EB1000]/30 hover:bg-[#CC0E00] transition-all shrink-0 cursor-pointer"
              >
                View All Creators <ArrowRight className="h-3.5 w-3.5 text-white" />
              </Link>
            </div>
          </div>

          {/* CATEGORY PILLS ROW WITH MUSIC ICONS & ACTIVE WHITE PILL WITH RED RING */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-2 scrollbar-none relative">
            <div className="flex items-center gap-3 shrink-0">
              {categoriesList.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCreatorPageIndex(0);
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${isActive
                      ? 'bg-white text-black border-2 border-white ring-2 ring-[#EB1000] shadow-[0_0_20px_rgba(235,16,0,0.5)] font-extrabold'
                      : 'bg-[#0F0F18] text-[#9E9EB2] border border-[#242436] hover:text-white hover:border-[#383850]'
                      }`}
                  >
                    {cat !== 'All' && <span className="text-[11px]">🎵</span>}
                    {cat}
                  </button>
                );
              })}
            </div>
            <button className="w-9 h-9 rounded-full bg-[#0F0F18] border border-[#26263A] text-white flex items-center justify-center shrink-0 hover:bg-[#181826] transition-colors ml-auto">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* CREATOR CARDS GRID (MAX 6 CARDS PER SLIDE) */}
          {displayedCreators.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {displayedCreators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    isFollowing={!!followedCreators[String(creator.creatorId || creator.id)]}
                    onToggleFollow={() => toggleFollow(creator.creatorId || creator.id, creator.name)}
                    onOpenYoutube={() => {
                      const ytUrl = creator.youtubeUrl || (creator.cleanUsername ? `https://youtube.com/@${creator.cleanUsername}` : 'https://youtube.com');
                      window.open(ytUrl, '_blank', 'noopener,noreferrer');
                    }}
                    onJoinVip={(c) => handleJoinVip(creator)}
                    onAskQuestion={() => {
                      const payCode = creator.sessionCode || creator.cleanUsername || (creator.handle ? creator.handle.replace(/^@+/, '') : '');
                      if (payCode) {
                        router.push(`/pay/${payCode}`);
                      } else {
                        router.push('/');
                      }
                    }}
                    onSelectCreator={() => {
                      const handleClean = (creator.cleanUsername || creator.handle || '').replace(/^@+/, '');
                      if (handleClean) {
                        router.push(`/creator/${handleClean}`);
                      } else {
                        router.push('/');
                      }
                    }}
                  />
                ))}
              </div>

              {/* SLIDER / CAROUSEL CONTROLS FOR 6 CARDS PER PAGE */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1C1C2A]/60">
                  <div className="text-xs text-[#8E8E9F] font-semibold font-mono">
                    Showing <span className="text-white font-bold">{creatorPageIndex * itemsPerPage + 1}</span>–<span className="text-white font-bold">{Math.min((creatorPageIndex + 1) * itemsPerPage, filteredCreators.length)}</span> of <span className="text-[#EB1000] font-bold">{filteredCreators.length}</span> Creators
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCreatorPageIndex((prev) => Math.max(0, prev - 1))}
                      disabled={creatorPageIndex === 0}
                      className="w-10 h-10 rounded-full bg-[#0F0F18] border border-[#26263A] text-white flex items-center justify-center hover:bg-[#181826] hover:border-[#EB1000]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Page indicator pills */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCreatorPageIndex(i)}
                          className={`h-2.5 rounded-full transition-all cursor-pointer ${creatorPageIndex === i ? 'w-8 bg-[#EB1000] shadow-[0_0_10px_rgba(235,16,0,0.6)]' : 'w-2.5 bg-[#26263A] hover:bg-[#383850]'
                            }`}
                          title={`Page ${i + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setCreatorPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={creatorPageIndex >= totalPages - 1}
                      className="w-10 h-10 rounded-full bg-[#0F0F18] border border-[#26263A] text-white flex items-center justify-center hover:bg-[#181826] hover:border-[#EB1000]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center rounded-3xl bg-[#0D0D14] border border-[#1E1E2C] space-y-3">
              <p className="text-[#8E8E9F] text-base font-semibold">No creators found matching category "{selectedCategory}"</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="px-5 py-2 rounded-full bg-[#EB1000] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
              >
                View All Creators
              </button>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10: PLATFORM & ECONOMICS FEATURE MATRIX TABLE */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* HEADER AREA */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              <span className="text-[11px]">⇕</span> PLATFORM & ECONOMICS COMPARISON
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-heading font-extrabold text-white tracking-tight leading-[1.15]">
              Why Creators & Audiences<br />
              Switch to <span className="text-[#EB1000] relative inline-block">Askme<span className="absolute -inset-1 bg-[#EB1000]/30 blur-xl -z-10 rounded-full"></span></span>
            </h2>

            <p className="text-[15px] sm:text-[17px] text-[#8B8B9E] max-w-2xl mx-auto font-medium leading-relaxed">
              Compare how Askme protects creator earnings with an <span className="text-white font-bold">85% net take-home</span> and gives fans a zero–interruption live stream experience.
            </p>

            {/* FILTER PILLS ROW */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {comparisonTabs.map((tab) => {
                const isActive = selectedComparisonTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedComparisonTab(tab)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${isActive
                      ? 'bg-white text-black border-2 border-white ring-2 ring-[#EB1000] shadow-[0_0_20px_rgba(235,16,0,0.5)] font-extrabold scale-105'
                      : 'bg-[#0E0E16] border border-[#222234] text-[#8E8E9F] hover:text-white hover:border-[#383850]'
                      }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TWO-COLUMN GRID: COMPARISON TABLE + FEATURED 85% CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            {/* LEFT COLUMN: COMPARISON TABLE */}
            <div className="lg:col-span-8 rounded-3xl bg-[#08080E] border border-[#1C1C2A] p-4 sm:p-6 shadow-2xl overflow-hidden relative text-left">
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#EB1000]/10 blur-[100px] pointer-events-none rounded-full"></div>

              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left border-collapse text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#202032] text-[#8E8E9F] pb-3">
                      <th className="py-3 px-3 sm:px-4 font-bold uppercase tracking-wider text-[11px] w-[32%]">FEATURE & CAPABILITY</th>
                      <th className="py-3 px-3 sm:px-4 font-bold text-[#EB1000] text-xs uppercase w-[30%]">
                        <div className="flex items-center gap-1.5">
                          <span>ASKME</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#EB1000] text-white text-[9px] font-black uppercase tracking-wider">CREATOR-FIRST</span>
                        </div>
                      </th>
                      <th className="py-3 px-3 sm:px-4 font-bold uppercase text-[11px] text-[#7A7A8E] w-[19%]">YOUTUBE SUPER CHAT</th>
                      <th className="py-3 px-3 sm:px-4 font-bold uppercase text-[11px] text-[#7A7A8E] w-[19%]">TWITCH BITS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181826] text-xs">
                    {filteredComparisonRows.map((row) => (
                      <tr key={row.id} className="hover:bg-[#12121D]/50 transition-colors">
                        <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">{row.feature}</td>
                        <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                          <div className="flex items-start gap-1.5">
                            <span className="text-[#EB1000] font-black text-sm shrink-0">✓</span>
                            <span>{row.askme}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                          <div className="flex items-start gap-1.5">
                            <span className="text-[#5A5A6E] shrink-0">✕</span>
                            <span>{row.yt}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                          <div className="flex items-start gap-1.5">
                            <span className="text-[#5A5A6E] shrink-0">✕</span>
                            <span>{row.twitch}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TAB SUBTEXT BADGE BANNER (PLACED UNDER DYNAMIC CONTENT) */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#0D0D16] border border-[#1F1F30] text-xs text-[#9E9EB2] mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                  </div>
                  <span className="font-medium text-white/90">
                    {selectedComparisonTab === 'All Highlights' && 'Transparent fee architecture with automated GST & TDS compliance.'}
                    {selectedComparisonTab === 'Revenue & Payouts' && '85% net creator take-home share with instant T+3 direct bank payouts.'}
                    {selectedComparisonTab === 'Viewer Experience' && 'Zero stream interruption with automated WhatsApp & push notifications when answered.'}
                    {selectedComparisonTab === 'Distribution & OBS' && '1 Universal QR & Link supporting YouTube, Twitch, Kick and Instagram Live.'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#7A7A8E] shrink-0">Updated for 2026</span>
              </div>
            </div>

            {/* RIGHT COLUMN: FEATURED 85% KEEP CARD */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-[#09080E] border border-[#EB1000]/50 shadow-[0_0_50px_rgba(235,16,0,0.18)] space-y-6 text-left relative overflow-hidden group hover:border-[#EB1000] transition-all">
              {/* Top Badge & Verified status */}
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 rounded-full bg-[#EB1000] text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-[#EB1000]/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                  ✓ CREATOR-FIRST STANDARD
                </div>
                <span className="text-[11px] text-[#7A7A8E] font-medium">Verified</span>
              </div>

              {/* Platform Logo & Identity */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EB1000] to-[#FF4D4D] text-white font-black flex items-center justify-center text-base shadow-md shadow-[#EB1000]/30 shrink-0">
                  A
                </div>
                <div>
                  <div className="font-extrabold text-white text-base">Askme</div>
                  <div className="text-[11px] text-[#7A7A8E] font-medium">Live Q&A Infrastructure</div>
                </div>
              </div>

              <div className="border-t border-[#1F1C2B]"></div>

              {/* Hero 85% KEEP Display */}
              <div className="space-y-2">
                <div className="text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                  85% <span className="text-[#EB1000] text-3xl font-black tracking-widest uppercase">KEEP</span>
                </div>
                <p className="text-xs text-[#8E8E9F] font-medium leading-relaxed">
                  Creators keep 85% net revenue on every paid question, sponsorship, and subscription.
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-3 pt-1 text-xs">
                <div className="flex items-start gap-2.5 text-[#C8C8DC] font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#EB1000]/20 text-[#EB1000] flex items-center justify-center text-[10px] shrink-0 font-black border border-[#EB1000]/30 mt-0.5">
                    ✓
                  </div>
                  <span>Instant scoot back to your favorite live stream</span>
                </div>
                <div className="flex items-start gap-2.5 text-[#C8C8DC] font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#EB1000]/20 text-[#EB1000] flex items-center justify-center text-[10px] shrink-0 font-black border border-[#EB1000]/30 mt-0.5">
                    ✓
                  </div>
                  <span><strong className="text-white">WhatsApp, In-App & Push notifications</strong> on answer</span>
                </div>
                <div className="flex items-start gap-2.5 text-[#C8C8DC] font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#EB1000]/20 text-[#EB1000] flex items-center justify-center text-[10px] shrink-0 font-black border border-[#EB1000]/30 mt-0.5">
                    ✓
                  </div>
                  <span>Universal QR code across all streaming channels</span>
                </div>
                <div className="flex items-start gap-2.5 text-[#C8C8DC] font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#EB1000]/20 text-[#EB1000] flex items-center justify-center text-[10px] shrink-0 font-black border border-[#EB1000]/30 mt-0.5">
                    ✓
                  </div>
                  <span>100% security & automatic refund if missed</span>
                </div>
              </div>

              {/* Button & Link */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('creator', 'login')}
                  className="w-full py-3.5 rounded-full bg-[#EB1000] text-white text-xs font-extrabold tracking-wider uppercase shadow-xl shadow-[#EB1000]/40 flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.02] transition-all text-center cursor-pointer"
                >
                  LAUNCH CREATOR STUDIO ➔
                </button>
                <a
                  href="#calculator"
                  className="block text-center text-[11px] text-[#7A7A8E] hover:text-white transition-colors font-medium"
                >
                  Calculate your projected earnings ↗
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* THE STORY BEHIND ASKME (OUR ORIGIN SECTION) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          {/* SINGLE MASTER CARD FOR STORY BEHIND ASKME */}
          <div className="p-6 sm:p-10 lg:p-12 rounded-2xl bg-[#09090F] border border-[#EB1000]/40 shadow-[0_0_40px_rgba(235,16,0,0.12)] relative overflow-hidden space-y-8 text-center group">
            {/* Background subtle glow effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#EB1000]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            {/* Header inside Card */}
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
                OUR ORIGIN
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-[50px] font-heading font-extrabold text-white tracking-tight leading-tight">
                The Story Behind <span className="text-[#EB1000] relative inline-block">AskMe<span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#EB1000] to-transparent"></span></span>
              </h2>

              <p className="text-[15px] sm:text-[17px] text-[#8B8B9E] max-w-xl mx-auto font-medium">
                Born from a daily problem seen across live streaming platforms.
              </p>

              {/* 3 Bullet Pills Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-[#A0A0B5] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span> Zero Stream Interruption
                </span>
                <span className="text-[#333348]">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000]"></span> Over $4.2M Distributed to Creators
                </span>
                <span className="text-[#333348]">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A855F7]"></span> Compatible with Twitch, YouTube & Kick
                </span>
              </div>
            </div>

            {/* Narrative Content inside Card */}
            <div className="max-w-4xl mx-auto space-y-6 text-left text-xs sm:text-sm text-[#9E9EB2] leading-relaxed font-normal relative z-10">
              <p>
                <strong className="text-white font-bold">AskMe</strong> was born from a problem we saw every day across live streaming platforms. Millions of people join live streams to learn, interact, seek advice, and connect with their favorite creators. They spend hours watching content, supporting creators, and participating in communities. Yet when they finally want to ask an important question, the experience is often disappointing.
              </p>

              <p>
                Live chats move at incredible speed. Thousands of messages compete for a creator’s attention, causing meaningful questions to disappear within seconds. A viewer may wait an entire stream only to realize their question was never seen.
              </p>

              {/* HIGHLIGHTED CALLOUT QUOTE INSIDE CARD */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0F0E17] border border-[#EB1000]/30 border-l-4 border-l-[#EB1000] space-y-3 relative shadow-2xl my-6">
                <span className="text-[#EB1000]/20 font-serif text-5xl font-black absolute top-3 right-6 pointer-events-none select-none">“</span>
                <blockquote className="text-base sm:text-xl font-heading font-extrabold text-white italic leading-snug pr-6">
                  “What if every genuine question had a fair chance of being seen, and every creator had a better way to manage meaningful audience interactions?”
                </blockquote>
                <div className="text-[11px] font-mono font-bold text-[#EB1000] tracking-widest uppercase flex items-center gap-2 pt-2 border-t border-[#221622]">
                  — THE CORE QUESTION THAT FOUNDED ASKME
                </div>
              </div>

              <p>
                <strong className="text-white font-bold">For creators</strong>, the challenge is equally difficult. They genuinely want to interact with their audience, but they are forced to choose between keeping up with the live chat and focusing on creating engaging content. Reading every message is simply impossible.
              </p>

              <p>
                Beyond the limitations of fast moving chats, creators also face another challenge. Every streaming platform operates under its own policies, moderation systems, and community guidelines. While these rules are important for maintaining healthy communities, they can also make creators feel restricted in how freely they communicate with their audience.
              </p>

              {/* Bottom Companion Platform Box & 3 Pillar Grid */}
              <div className="space-y-5 pt-2">
                {/* Top Companion Platform Explanation */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#12121A] border border-[#1C1C2A] text-xs sm:text-sm text-[#A0A0B5] font-normal leading-relaxed shadow-lg">
                  <p>
                    <strong className="font-bold text-white">AskMe is not another streaming platform.</strong> It is a companion platform designed to work alongside existing live streaming services. Creators simply share their unique AskMe link or display their personal QR code during a live stream. Viewers can instantly submit paid questions through AskMe, where every question is securely organized in a dedicated dashboard instead of disappearing in a crowded live chat.
                  </p>
                </div>

                {/* 3 Pillar Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {/* Pillar 1: For Creators */}
                  <div className="p-5 rounded-2xl bg-[#12121A] border border-[#EB1000]/40 flex flex-col justify-between space-y-4 hover:border-[#EB1000] transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#181824] border border-[#2B2B3D] text-[#D0D0E0] text-[10px] font-bold font-mono tracking-wider uppercase">
                          85% TAKE-HOME
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white tracking-tight">For Creators</h3>
                        <p className="text-xs text-[#9E9EB2] font-normal leading-relaxed">
                          Sustainable monetization keeping 85% revenue instead of losing half.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1C1C2A] flex items-center gap-2 text-[11px] text-[#8E8E9F] font-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] shrink-0"></span>
                      <span>Direct Stripe payouts</span>
                    </div>
                  </div>

                  {/* Pillar 2: For Viewers */}
                  <div className="p-5 rounded-2xl bg-[#12121A] border border-[#EB1000]/40 flex flex-col justify-between space-y-4 hover:border-[#EB1000] transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0">
                          <Heart className="h-4 w-4" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#181824] border border-[#2B2B3D] text-[#D0D0E0] text-[10px] font-bold font-mono tracking-wider uppercase">
                          100%
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white tracking-tight">For Viewers</h3>
                        <p className="text-xs text-[#9E9EB2] font-normal leading-relaxed">
                          A genuine opportunity to be heard when supporting admired creators.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1C1C2A] flex items-center gap-2 text-[11px] text-[#8E8E9F] font-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0"></span>
                      <span>Auto-refund if unanswered</span>
                    </div>
                  </div>

                  {/* Pillar 3: For Communities */}
                  <div className="p-5 rounded-2xl bg-[#12121A] border border-[#EB1000]/40 flex flex-col justify-between space-y-4 hover:border-[#EB1000] transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#181824] border border-[#2B2B3D] text-[#D0D0E0] text-[10px] font-bold font-mono tracking-wider uppercase">
                          ZERO SPAM
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white tracking-tight">For Communities</h3>
                        <p className="text-xs text-[#9E9EB2] font-normal leading-relaxed">
                          Intentional, organized, and respectful interactions over chat noise.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1C1C2A] flex items-center gap-2 text-[11px] text-[#8E8E9F] font-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6366F1] shrink-0"></span>
                      <span>Curated audience queue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ========================================================================= */}
        {/* SECTION 11: FREQUENTLY ASKED QUESTIONS (EVERYTHING YOU NEED TO KNOW) */}
        {/* ========================================================================= */}
        <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          {/* TOP HEADER & CONTROLS */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
                <HelpCircle className="h-3.5 w-3.5" /> FREQUENTLY ASKED QUESTIONS
              </div>
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
                Everything You Need to Know
              </h2>
              <p className="text-[14px] sm:text-[16px] text-[#8B8B9E] max-w-xl font-medium">
                Clear answers for creators streaming live and viewers asking priority questions.
              </p>
            </div>

            {/* EXPAND ALL / COLLAPSE ALL BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExpandAllFaqs}
                className="px-3.5 py-1.5 rounded-full bg-[#0F0F18] border border-[#26263A] text-xs text-[#8E8E9F] font-semibold hover:text-white hover:border-[#383850] transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAllFaqs}
                className="px-3.5 py-1.5 rounded-full bg-[#0F0F18] border border-[#26263A] text-xs text-[#8E8E9F] font-semibold hover:text-white hover:border-[#383850] transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* FILTER PILLS & SEARCH BAR ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['All Questions', 'For Viewers', 'For Creators', 'Payments & Taxes', 'OBS & Overlay'].map((tab) => {
                const isActive = selectedFaqTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedFaqTab(tab)}
                    className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${isActive
                      ? 'bg-white text-black font-extrabold border-2 border-[#EB1000] shadow-[0_0_15px_rgba(235,16,0,0.4)]'
                      : 'bg-[#0F0F18] text-[#8E8E9F] border border-[#242436] hover:text-white hover:border-[#383850]'
                      }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Search Input Box */}
            {/* <div className="relative shrink-0">
              <Search className="h-3.5 w-3.5 text-[#7A7A8E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions, OBS, UPI..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full bg-[#0F0F18] border border-[#242436] text-xs text-white placeholder-[#6E6E82] focus:outline-none focus:border-[#EB1000]/60 w-full sm:w-64 transition-all"
              />
            </div> */}
          </div>

          {/* FAQ 2-COLUMN ACCORDION GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedFaqs.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  onClick={() => toggleFaq(faq.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${isOpen
                    ? 'bg-[#0D0910] border-[#EB1000]/50 shadow-xl shadow-[#EB1000]/10'
                    : 'bg-[#09090F] border-[#1C1C2A] hover:border-[#2C2C3E]'
                    }`}
                >
                  {/* Top Bar: Category Label & Plus/Minus Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider ${isOpen ? 'text-[#EB1000]' : 'text-[#7A7A8E]'
                      }`}>
                      {faq.categoryTag}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-transform ${isOpen
                        ? 'bg-[#EB1000] text-white'
                        : 'bg-[#181826] text-[#7A7A8E]'
                        }`}
                    >
                      {isOpen ? '−' : '+'}
                    </div>
                  </div>

                  {/* Question Title */}
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    {faq.question}
                  </h3>

                  {/* Expanded Content */}
                  {isOpen && (
                    <div className="space-y-3 pt-1 text-xs text-[#9E9EB2] leading-relaxed border-t border-[#1F1826]/80">
                      <p className="pt-2">{faq.answer}</p>

                      {/* Highlight Box if present */}
                      {faq.highlights && (
                        <div className="p-3.5 rounded-xl bg-[#180A0C] border border-[#EB1000]/30 space-y-1.5 mt-2 text-[11px]">
                          <div className="font-extrabold text-[#EB1000] tracking-wider uppercase text-[10px]">
                            KEY HIGHLIGHTS:
                          </div>
                          {faq.highlights.map((h, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[#D0D0E0] font-medium">
                              <span className="text-[#EB1000] font-black">•</span>
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM SUPPORT BANNER CARD */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#12090B] border border-[#EB1000]/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 shadow-xl">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#240D12] border border-[#EB1000]/40 text-[#EB1000] flex items-center justify-center shrink-0 shadow-md">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Still have a question about streaming with AskMe?
                </h4>
                <p className="text-xs text-[#8E8E9F] font-medium">
                  Our live creator onboarding team is available 24/7 to help set up your OBS overlay and banking.
                </p>
              </div>
            </div>

            <Link
              href="/creators/login"
              className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-xs transition-colors shrink-0 shadow-lg block text-center"
            >
              Contact Support
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 12: CREATOR SUCCESS STORIES — LOVED BY TOP LIVE STREAMERS */}
        {/* ========================================================================= */}
        <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          {/* HEADER AREA */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              <Rocket className="h-3.5 w-3.5" /> CREATOR SUCCESS STORIES
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-heading font-extrabold text-white tracking-tight leading-tight">
              Loved by Top Live Streamers
            </h2>

            <p className="text-[15px] sm:text-[17px] text-[#8B8B9E] max-w-2xl mx-auto font-medium leading-relaxed">
              See how verified creators across tech, finance, gaming, and education use AskMe to monetize audience engagement with 100% seen questions and 0% Apple Tax.
            </p>
          </div>

          {/* MAIN CONTAINER FRAME WITH 4 TESTIMONIAL CARDS & 4-STAT METRIC FOOTER BAR */}
          <div className="rounded-3xl bg-[#09090F] border border-[#1C1C2A] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#EB1000]/10 blur-[130px] pointer-events-none rounded-full"></div>

            {/* DYNAMIC TESTIMONIAL CARDS SINGLE-ROW SLIDER */}
            {publicTestimonials && publicTestimonials.length > 0 ? (
              <div className="space-y-4 relative z-10 ">
                {/* Slider Header Controls Bar */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#EB1000] uppercase tracking-wider">
                      STORIES ({publicTestimonials.length})
                    </span>
                    <span className="text-[11px] text-[#7A7A8E] font-medium hidden sm:inline">
                      · Swipe or use controls to browse
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Slide Dots / Indicators */}
                    <div className="hidden sm:flex items-center gap-1.5 mr-2">
                      {publicTestimonials.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTestimonialScrollIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === testimonialScrollIndex
                            ? 'w-6 bg-[#EB1000]'
                            : 'w-1.5 bg-[#252538] hover:bg-[#8B8B96]'
                            }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Prev / Next Slider Arrows */}
                    <button
                      type="button"
                      onClick={() =>
                        setTestimonialScrollIndex((prev) =>
                          prev === 0 ? publicTestimonials.length - 1 : prev - 1
                        )
                      }
                      className="w-8 h-8 rounded-full bg-[#14141F] border border-[#26263A] text-white flex items-center justify-center hover:bg-[#EB1000] hover:border-[#EB1000] transition-colors cursor-pointer"
                      title="Previous testimonial"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTestimonialScrollIndex((prev) => (prev + 1) % publicTestimonials.length)
                      }
                      className="w-8 h-8 rounded-full bg-[#14141F] border border-[#26263A] text-white flex items-center justify-center hover:bg-[#EB1000] hover:border-[#EB1000] transition-colors cursor-pointer"
                      title="Next testimonial"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Single Row Horizontal Scroll Slider */}
                <div
                  ref={testimonialContainerRef}
                  onMouseEnter={() => setIsTestimonialHovered(true)}
                  onMouseLeave={() => setIsTestimonialHovered(false)}
                  className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-3 pt-1"
                >
                  {publicTestimonials.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="w-[290px] sm:w-[350px] md:w-[380px] shrink-0 snap-start p-5 sm:p-6 rounded-2xl bg-[#12121C] border border-[#202032] flex flex-col justify-between space-y-4 hover:border-[#EB1000]/60 transition-all text-left group shadow-xl"
                    >
                      <div className="space-y-3">
                        {/* Quote Icon & Category */}
                        <div className="flex items-center justify-between">
                          <span className="text-[#EB1000] font-serif font-black text-2xl leading-none opacity-80">“</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#1C1C2A] text-[#8E8E9F] text-[10px] font-mono font-bold">
                            {item.category || 'Creator'}
                          </span>
                        </div>

                        {/* Quote Text */}
                        <p className="text-xs sm:text-sm text-[#A0A0B5] italic leading-relaxed font-normal line-clamp-5">
                          &quot;{item.testimonial}&quot;
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        {/* Metric Box */}
                        <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-[#1A1A28] flex items-center justify-between text-[11px]">
                          <span className="text-[#7A7A8E] font-medium">{item.metricLabel}</span>
                          <span className="text-[#EB1000] font-extrabold font-mono">{item.metricValue}</span>
                        </div>

                        {/* Creator Info */}
                        <div className="flex items-center gap-2.5 pt-1">
                          <img
                            src={item.profileImage ? getMediaUrl(item.profileImage) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={item.creatorName}
                            className="w-10 h-10 rounded-full object-cover border border-[#EB1000]/50 shrink-0 bg-[#0A0A0F]"
                          />
                          <div className="overflow-hidden min-w-0">
                            <div className="font-extrabold text-white text-xs flex items-center gap-1 truncate">
                              {item.creatorName} {item.verified && <span className="text-[#10B981]">✓</span>}
                            </div>
                            <div className="text-[10px] text-[#7A7A8E] truncate">
                              {item.username} {item.followers ? `· ${item.followers}` : ''}
                            </div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#241014] text-[#FF4D4D] text-[9px] font-bold truncate max-w-full">
                              {item.creatorType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !testimonialsLoading && (
              <div className="p-8 text-center text-[#8B8B9E] text-xs font-mono border border-dashed border-[#202032] rounded-2xl">
                No active creator testimonials to display at the moment.
              </div>
            )}

            {/* BOTTOM 4-STAT METRICS FOOTER BAR */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0B12] border border-[#1C1C2A] grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-[#1C1C2A] relative z-10">
              <div className="pt-2 md:pt-0">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">85%</div>
                <div className="text-[10px] font-mono text-[#7A7A8E] font-bold uppercase tracking-wider mt-1">
                  CREATOR PAYOUT SHARE
                </div>
              </div>

              <div className="pt-2 md:pt-0">
                <div className="text-2xl sm:text-3xl font-black text-[#EB1000] tracking-tight">0%</div>
                <div className="text-[10px] font-mono text-[#7A7A8E] font-bold uppercase tracking-wider mt-1">
                  APPLE & GOOGLE TAX
                </div>
              </div>

              <div className="pt-2 md:pt-0">
                <div className="text-2xl sm:text-3xl font-black text-[#10B981] tracking-tight">100%</div>
                <div className="text-[10px] font-mono text-[#7A7A8E] font-bold uppercase tracking-wider mt-1">
                  GUARANTEED SEEN QUEUE
                </div>
              </div>

              <div className="pt-2 md:pt-0">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">T+3</div>
                <div className="text-[10px] font-mono text-[#7A7A8E] font-bold uppercase tracking-wider mt-1">
                  INSTANT BANK DEPOSITS
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 13: PURPOSE & VISION — WHY ASKME EXISTS */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* HEADER AREA */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
              PURPOSE & VISION
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-heading font-extrabold text-white tracking-tight leading-[1.15]">
              Why <span className="text-[#EB1000] relative inline-block">AskMe<span className="absolute -inset-1 bg-[#EB1000]/30 blur-xl -z-10 rounded-full"></span></span> Exists
            </h2>

            <p className="text-[15px] sm:text-[17px] text-[#8B8B9E] max-w-2xl mx-auto font-medium leading-relaxed">
              Millions of viewers join livestreams hoping to interact with creators. As communities grow, conversations move quickly and important questions easily get buried. AskMe builds direct, organized, and fair interaction infrastructure.
            </p>
          </div>

          {/* 6-CARD GRID MATCHING USER SCREENSHOT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* CARD 1: Creator Discovery */}
            <div className="p-6 rounded-3xl bg-[#09090F] border border-[#1C1C2A] flex flex-col justify-between space-y-4 hover:border-[#EB1000]/40 transition-all shadow-xl group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0 group-hover:bg-[#EB1000] group-hover:text-white transition-all shadow-md">
                    <Compass className="h-5 w-5" />
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#14141E] border border-[#26263A] text-[#8E8E9F] text-[10px] font-semibold uppercase">
                    Spotlight
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  Creator Discovery
                </h3>
                <p className="text-xs text-[#8E8E9F] font-medium leading-relaxed">
                  Visibility through curated live sessions, trending categories, spotlights, and dedicated creator profiles.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C2A] flex items-center gap-1.5 text-[11px] text-[#10B981] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
                <span>High-intent exposure</span>
              </div>
            </div>

            {/* CARD 2: Grow Your Audience */}
            <div className="p-6 rounded-3xl bg-[#09090F] border border-[#1C1C2A] flex flex-col justify-between space-y-4 hover:border-[#EB1000]/40 transition-all shadow-xl group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0 group-hover:bg-[#EB1000] group-hover:text-white transition-all shadow-md">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#14141E] border border-[#26263A] text-[#8E8E9F] text-[10px] font-semibold">
                    +3.4x Retention
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  Grow Your Audience
                </h3>
                <p className="text-xs text-[#8E8E9F] font-medium leading-relaxed">
                  Convert first-time visitors into long-term community members and increase subscriber engagement across platforms.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C2A] flex items-center gap-1.5 text-[11px] text-[#A855F7] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A855F7]"></span>
                <span>Omnichannel funnel</span>
              </div>
            </div>

            {/* CARD 3: Meaningful Communities */}
            <div className="p-6 rounded-3xl bg-[#09090F] border border-[#1C1C2A] flex flex-col justify-between space-y-4 hover:border-[#EB1000]/40 transition-all shadow-xl group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0 group-hover:bg-[#EB1000] group-hover:text-white transition-all shadow-md">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#14141E] border border-[#26263A] text-[#8E8E9F] text-[10px] font-semibold">
                    Zero Noise
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  Meaningful Communities
                </h3>
                <p className="text-xs text-[#8E8E9F] font-medium leading-relaxed">
                  Organize audience interactions, filter out fast-moving chat spam, and strengthen genuine creator-viewer relationships.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C2A] flex items-center gap-1.5 text-[11px] text-[#EC4899] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EC4899]"></span>
                <span>Genuine connection</span>
              </div>
            </div>

            {/* CARD 4: Direct Monetization */}
            <div className="p-6 rounded-3xl bg-[#09090F] border border-[#1C1C2A] flex flex-col justify-between space-y-4 hover:border-[#EB1000]/40 transition-all shadow-xl group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0 group-hover:bg-[#EB1000] group-hover:text-white transition-all shadow-md">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#241014] border border-[#EB1000]/40 text-[#EB1000] text-[10px] font-bold">
                    85% Creator Cut
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  Direct Monetization
                </h3>
                <p className="text-xs text-[#8E8E9F] font-medium leading-relaxed">
                  Transparent 15% platform fee with creators retaining 85% of net revenues, backed by secure automated payouts.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C2A] flex items-center gap-1.5 text-[11px] text-[#10B981] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
                <span>Automated payouts</span>
              </div>
            </div>

            {/* CARD 5: Complete Interaction Control */}
            <div className="p-6 rounded-3xl bg-[#09090F] border border-[#1C1C2A] flex flex-col justify-between space-y-4 hover:border-[#EB1000]/40 transition-all shadow-xl group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0 group-hover:bg-[#EB1000] group-hover:text-white transition-all shadow-md">
                    <Filter className="h-5 w-5" />
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#14141E] border border-[#26263A] text-[#8E8E9F] text-[10px] font-semibold">
                    Host Moderation
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  Complete Interaction Control
                </h3>
                <p className="text-xs text-[#8E8E9F] font-medium leading-relaxed">
                  Creators preview questions, block abusive words, reject spam, and answer questions verbally live or in the studio dashboard.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C2A] flex items-center gap-1.5 text-[11px] text-[#F59E0B] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]"></span>
                <span>Real-time keyword filter</span>
              </div>
            </div>

            {/* CARD 6: Designed for Viewers */}
            <div className="p-6 rounded-3xl bg-[#09090F] border border-[#1C1C2A] flex flex-col justify-between space-y-4 hover:border-[#EB1000]/40 transition-all shadow-xl group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#200E12] border border-[#EB1000]/30 text-[#EB1000] flex items-center justify-center shrink-0 group-hover:bg-[#EB1000] group-hover:text-white transition-all shadow-md">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#14141E] border border-[#26263A] text-[#8E8E9F] text-[10px] font-semibold">
                    Safe
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  Designed for Viewers
                </h3>
                <p className="text-xs text-[#8E8E9F] font-medium leading-relaxed">
                  Guaranteed recognition, queue tracking, priority support, and instant refund protection if a question goes unanswered.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C1C2A] flex items-center gap-1.5 text-[11px] text-[#06B6D4] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]"></span>
                <span>Instant auto-refunds</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 12: BOTTOM CTA BANNER WITH CREATOR MOSAIC BACKGROUND */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full rounded-3xl bg-[#07070D] border border-[#1A1A28] py-16 sm:py-24 px-6 sm:px-10 overflow-hidden shadow-2xl">
            {/* BACKGROUND CREATOR PHOTO MOSAIC GRID */}
            <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 p-4 opacity-70 select-none pointer-events-none overflow-hidden">
              {/* Column 1 */}
              <div className="space-y-3 sm:space-y-4 -mt-10">
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]"></div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]/60"></div>
              </div>

              {/* Column 2 */}
              <div className="space-y-3 sm:space-y-4 mt-6">
                <div className="h-28 sm:h-36 rounded-2xl bg-[#12121D]/80"></div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]"></div>
              </div>

              {/* Column 3 */}
              <div className="space-y-3 sm:space-y-4 -mt-6">
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]"></div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]/80"></div>
              </div>

              {/* Column 4 */}
              <div className="space-y-3 sm:space-y-4 mt-4">
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]"></div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]/60"></div>
              </div>

              {/* Column 5 */}
              <div className="space-y-3 sm:space-y-4 -mt-12 hidden sm:block">
                <div className="h-28 sm:h-36 rounded-2xl bg-[#12121D]/90"></div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]"></div>
              </div>

              {/* Column 6 */}
              <div className="space-y-3 sm:space-y-4 mt-8 hidden sm:block">
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]"></div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Column 7 */}
              <div className="space-y-3 sm:space-y-4 -mt-8 hidden lg:block">
                <div className="h-32 sm:h-40 rounded-2xl bg-[#12121D]"></div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Column 8 */}
              <div className="space-y-3 sm:space-y-4 mt-5 hidden lg:block">
                <div className="h-28 sm:h-36 rounded-2xl bg-[#12121D]"></div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* DARK GRADIENT & RADIAL OVERLAYS */}
            <div className="absolute inset-0 bg-[#07070C]/80 backdrop-blur-[1px] z-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,7,12,0.85)_0%,rgba(7,7,12,0.65)_50%,rgba(7,7,12,0.95)_100%)] z-10 pointer-events-none"></div>

            {/* CENTER CONTENT */}
            <div className="relative z-20 max-w-3xl mx-auto text-center space-y-6">
              <span className="text-xs font-bold text-[#A0A0B5] uppercase tracking-widest block">
                FOR VIEWERS & CREATORS
              </span>

              <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-heading font-extrabold text-white leading-[1.15] tracking-tight">
                Where Live- Streams &<br />
                <span className="text-[#EB1000]">Real -Time Fans Connect</span>
              </h2>

              <p className="text-sm sm:text-base text-[#9E9EB2] font-normal max-w-2xl mx-auto leading-relaxed">
                Discover who's live across every platform, jump into active chats, & ask questions directly or stream to your biggest fans all in one place
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => openAuthModal('creator', 'login')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#0A0A0F] font-black text-sm hover:bg-[#EB1000] hover:text-white transition-all shadow-xl cursor-pointer"
                >
                  Get Started
                </button>
                <a
                  href="#creators"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#18080A]/80 border border-[#EB1000]/60 text-white font-bold text-sm hover:bg-[#EB1000]/20 transition-all shadow-md"
                >
                  Explore Creators
                </a>
              </div>
            </div>
          </div>
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

      {/* Dynamic Popup Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalRole}
        initialMode={authModalMode}
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
