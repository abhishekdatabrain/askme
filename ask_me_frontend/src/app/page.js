'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import CreatorCard from '@/components/CreatorCard';
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
  XCircle,
  AlertCircle,
  Share2,
  Layers,
} from 'lucide-react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Travel');
  const [searchQuery, setSearchQuery] = useState('');
  const [calcAmount, setCalcAmount] = useState(250000); // Default ₹2,50,000
  const [copiedObsUrl, setCopiedObsUrl] = useState(false);
  const [howItWorksTab, setHowItWorksTab] = useState('viewer');
  const [selectedFaqTab, setSelectedFaqTab] = useState('All Questions');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState(['q1', 'q5']);

  // Sample Creators Data for Discovery Grid
  const creators = [
    {
      id: '1',
      name: 'TechBurner Live',
      handle: '@techburner',
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
    {
      id: '2',
      name: 'FinCal Strategy',
      handle: '@fincal_live',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
      category: 'Finance & Stocks',
      platform: 'youtube',
      minFee: 200,
      subscribers: '1.8M',
      rating: 4.95,
      answeredCount: '520',
      bio: 'Personal finance, stock market live technical charts, index options hedging, SIPs, and practical tax saving breakdowns.',
      isLive: true,
      isVip: true,
    },
    {
      id: '3',
      name: 'CodeWithAnish',
      handle: '@anishcodes',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      category: 'Education',
      platform: 'youtube',
      minFee: 150,
      subscribers: '850K',
      rating: 5.0,
      answeredCount: '2,150',
      bio: 'Fullstack web development, React, Next.js, system design mock interviews live, and career guidance.',
      isLive: true,
      isVip: false,
    },
    {
      id: '4',
      name: 'GamerX Xtreme',
      handle: '@gamerx',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      category: 'Gaming',
      platform: 'twitch',
      minFee: 50,
      subscribers: '2.1M',
      rating: 4.7,
      answeredCount: '3,800',
      bio: 'Competitive Valorant & BGMI gameplay. Priority questions get answered live between rounds!',
      isLive: false,
      isVip: true,
    },
    {
      id: '5',
      name: 'Dr. Priya HealthTalk',
      handle: '@drpriya',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
      category: 'Lifestyle',
      platform: 'youtube',
      minFee: 250,
      subscribers: '620K',
      rating: 4.9,
      answeredCount: '650',
      bio: 'Clinical nutritionist & wellness practitioner taking live audience health & diet Q&A.',
      isLive: false,
      isVip: false,
    },
    {
      id: '6',
      name: 'Startup Unfiltered',
      handle: '@startupunfiltered',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      category: 'Technology',
      platform: 'youtube',
      minFee: 500,
      subscribers: '410K',
      rating: 4.9,
      answeredCount: '420',
      bio: 'Venture capital pitching, founder stories, and seed funding consultation.',
      isLive: true,
      isVip: true,
    },
  ];

  const categories = ['All', 'Music', 'Gaming', 'Technology', 'Lifestyle', 'Travel', 'Finance & Stocks', 'Food', 'Education'];

  const filteredCreators = creators.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Dynamic fee calculation for creator earnings estimator
  const askmeFee = calcAmount * 0.15;
  const gatewayFee = calcAmount * 0.02;
  const gstTdsFee = calcAmount * 0.037;
  const netEarnings = calcAmount - askmeFee - gatewayFee - gstTdsFee;
  const netPercentage = ((netEarnings / calcAmount) * 100).toFixed(1);
  const extraVsOthers = Math.round(calcAmount * 0.28);

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
        'If a creator ends their broadcast without answering your queued question, our automated escrow system immediately triggers a 100% full refund back to your original payment method.',
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
        {/* SECTION 1: HERO SECTION & INTERACTIVE SHOWCASE MOCKUP */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-4 pb-12">
          {/* Ambient Glow Effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[550px] bg-gradient-to-tr from-[#EB1000]/25 via-[#EB1000]/5 to-transparent blur-[170px] pointer-events-none rounded-full"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-7">
            {/* Headline with solid red pill badge matching Image 1 */}
            <h1 className="text-4xl sm:text-6xl lg:text-[70px] xl:text-[75px] font-heading font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
              The Creator Discovery &{' '}
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
              <Link
                href="/creators/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-[16px] font-bold shadow-xl shadow-[#EB1000]/35 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
              >
                <span className="text-[#FFD60A]">★</span>
                <span>Become a Creator</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/viewers/login"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#161622] border border-[#27273A] text-white text-[16px] font-semibold hover:bg-[#1E1E2E] hover:border-[#383850] transition-all flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4 text-[#A0A0B5]" />
                <span>Join as a Viewer</span>
              </Link>

              <a
                href="#creators"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#161622] border border-[#27273A] text-white text-[16px] font-semibold hover:bg-[#1E1E2E] hover:border-[#383850] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4 text-[#A0A0B5]" />
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
                      askme.live/sarah-khan
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

                {/* Inner Window Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Live Stream Box */}
                  <div className="lg:col-span-7 space-y-3">
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
                          ❤️ "Play your unreleased track!"
                        </div>
                      </div>

                      {/* Streamer Bar */}
                      <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-[#EB1000] text-white font-bold text-[13px] flex items-center justify-center">
                            SK
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-white flex items-center gap-1">
                              Sarah Khan <span className="text-[#00F5D4] text-[11px]">✔</span>
                            </div>
                            <div className="text-[11px] text-[#A0A0B2]">
                              Acoustic Sessions & Songwriting AMA
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#161622] border border-[#27273A] flex items-center justify-between gap-2 text-[13px]">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <span className="h-2 w-2 rounded-full bg-[#00F5D4]"></span>
                        <span>AskMe Escrow Active: Questions Answered Live (4/6)</span>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-[#EB1000]/15 text-[#EB1000] font-bold border border-[#EB1000]/30 shrink-0">
                        Priority Ask: $10
                      </span>
                    </div>
                  </div>

                  {/* Right: Queue & Spotlight */}
                  <div className="lg:col-span-5 space-y-3.5">
                    <div className="p-4 rounded-2xl bg-[#161622] border border-[#27273A] space-y-3 shadow-lg">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="px-2.5 py-1 rounded-md bg-[#FFD60A]/15 text-[#FFD60A] font-black uppercase tracking-wider border border-[#FFD60A]/30">
                          QUE 1 • CURRENT SPOTLIGHT
                        </span>
                        <span className="text-[#00F5D4] font-bold">🟢 Confirmed</span>
                      </div>

                      <p className="text-[14px] font-semibold text-white leading-relaxed">
                        "What was your production chain for the vocal reverb on track 3? Can you break down the EQ?"
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#222234] text-[12px]">
                        <span className="text-[#8B8B9E]">from @audiogeek • 120s spotlight</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-[#FFD60A]/10 text-[#FFD60A] font-bold border border-[#FFD60A]/20">
                          $50.00 Bounty
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#161622] border border-[#27273A] flex items-center justify-between gap-3 shadow-lg">
                      <div className="space-y-2">
                        <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#EB1000]"></span>
                          Stream QR Overlay Widget
                        </div>
                        <p className="text-[12px] text-[#8B8B9E] leading-tight">
                          Instant zero-friction mobile scan for viewers. Support creators directly without leaving the stream.
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-[#222234] text-white font-medium">0% Apple Tax</span>
                          <span className="px-2 py-0.5 rounded bg-[#222234] text-white font-medium">Instant Payout</span>
                        </div>
                      </div>

                      <div className="h-16 w-16 p-1.5 rounded-xl bg-white shrink-0 flex items-center justify-center shadow-md">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://askme.live"
                          alt="Stream QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#161622] border border-[#27273A] flex items-center justify-between text-[13px]">
                      <span className="text-[#8B8B9E] font-medium text-[12px]">Syncing live queue to:</span>
                      <div className="flex items-center gap-1.5 text-[12px] font-bold">
                        <span className="px-2.5 py-1 rounded-md bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
                          YouTube
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#9146FF]/10 text-[#A970FF] border border-[#9146FF]/20">
                          Twitch
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#53FC18]/10 text-[#53FC18] border border-[#53FC18]/20">
                          Kick
                        </span>
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
                  <span className="text-[13px] text-[#8B8B9E] font-medium block">YouTube, Twitch & Kick</span>
                </div>
              </div>
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
                    <div className="bg-white p-2 rounded-xl flex items-center justify-center h-24 shadow-inner">
                      <QrCode className="w-16 h-16 text-black" />
                    </div>
                    <div className="h-24 rounded-xl bg-[#1A090C] border border-[#EB1000]/60 p-2 flex flex-col items-center justify-center text-center space-y-1">
                      <div className="w-5 h-5 rounded bg-[#EB1000]/20 border border-[#EB1000] flex items-center justify-center text-[#EB1000]">
                        <Smartphone className="h-3 w-3" />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-white uppercase tracking-tight leading-tight">
                        ASKME URL DETECTED
                      </span>
                      <span className="text-[8px] text-[#A0A0B2]">Tap to Ask</span>
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
        {/* SECTION 3: THE SCOOT PHILOSOPHY — DON'T WAIT. SCOOT. */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
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

          {/* 5-Step Process Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Step 01 */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#222234] space-y-2.5 hover:border-[#EB1000]/40 transition-all">
              <span className="font-mono text-[12px] font-extrabold text-[#EB1000] tracking-wider block">
                Step 01
              </span>
              <h4 className="text-[18px] sm:text-[20px] font-heading font-extrabold text-white">ASK</h4>
              <p className="text-[13px] text-[#8E8E9F] leading-snug">Submit question in 3 seconds</p>
            </div>

            {/* Step 02 */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#222234] space-y-2.5 hover:border-[#00F5D4]/40 transition-all">
              <span className="font-mono text-[12px] font-extrabold text-[#00F5D4] tracking-wider block">
                Step 02
              </span>
              <h4 className="text-[18px] sm:text-[20px] font-heading font-extrabold text-white">Sent</h4>
              <p className="text-[13px] text-[#8E8E9F] leading-snug">Safely received by creator</p>
            </div>

            {/* Step 03 */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#222234] space-y-2.5 hover:border-[#FFD60A]/40 transition-all">
              <span className="font-mono text-[12px] font-extrabold text-[#FFD60A] tracking-wider block">
                Step 03
              </span>
              <h4 className="text-[18px] sm:text-[20px] font-heading font-extrabold text-white">Scoot</h4>
              <p className="text-[13px] text-[#8E8E9F] leading-snug">Interface glides away</p>
            </div>

            {/* Step 04 */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#222234] space-y-2.5 hover:border-[#9146FF]/40 transition-all">
              <span className="font-mono text-[12px] font-extrabold text-[#9146FF] tracking-wider block">
                Step 04
              </span>
              <h4 className="text-[18px] sm:text-[20px] font-heading font-extrabold text-white">Keep Watching</h4>
              <p className="text-[13px] text-[#8E8E9F] leading-snug">Live stream remains in focus</p>
            </div>

            {/* Step 05 */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#222234] space-y-2.5 hover:border-[#10B981]/40 transition-all col-span-1 sm:col-span-2 md:col-span-1">
              <span className="font-mono text-[12px] font-extrabold text-[#10B981] tracking-wider block">
                Step 05
              </span>
              <h4 className="text-[18px] sm:text-[20px] font-heading font-extrabold text-white">Answer</h4>
              <p className="text-[13px] text-[#8E8E9F] leading-snug">Notified the instant they speak</p>
            </div>
          </div>

          {/* YOUR QUESTIONS DESERVE AN ANSWER INTERACTIVE FRAME */}
          <div className="space-y-8 pt-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-[11px] sm:text-[12px] font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
                THE SCOOT PHILOSOPHY
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-[50px] xl:text-[56px] font-extrabold text-white tracking-tight leading-[1.15]">
                YOUR QUESTIONS DESERVE<br />
                AN <span className="text-[#EB1000]">ANSWER.</span>
              </h2>
              <p className="text-[15px] sm:text-[17px] text-[#8B8B9E] font-medium">
                When the creator answers, the response comes back to you
              </p>
            </div>

            {/* Main Outer Box Frame */}
            <div className="max-w-4xl mx-auto rounded-3xl bg-[#14141E] border border-[#222234] p-5 sm:p-8 space-y-6 shadow-2xl">
              {/* Top Pill Tabs */}
              <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-[#202030] pb-4 overflow-x-auto">
                <button className="px-5 py-2 rounded-full bg-white text-black font-bold text-xs sm:text-sm shadow-md shrink-0">
                  1. You Asked
                </button>
                <button className="px-4 py-2 rounded-full text-[#8E8E9F] hover:text-white font-medium text-xs sm:text-sm transition-colors shrink-0">
                  2. Creator Answering Live
                </button>
                <button className="px-4 py-2 rounded-full text-[#8E8E9F] hover:text-white font-medium text-xs sm:text-sm transition-colors shrink-0">
                  3. Saved to your hub
                </button>
              </div>

              {/* Center Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0B12] border border-[#202030] space-y-4">
                {/* Header inside center card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#222234] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      You
                    </div>
                    <div>
                      <div className="text-white font-extrabold text-xs sm:text-sm">
                        You asked Tech Burner Live
                      </div>
                      <div className="text-[11px] text-[#7A7A8E]">
                        During Live Stream . Priority Queue
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] sm:text-[12px] text-[#8E8E9F]">
                    #2 in queue
                  </span>
                </div>

                {/* Question Input Box */}
                <div className="p-4 rounded-xl bg-[#181824] border border-[#262638] text-white font-semibold text-xs sm:text-sm">
                  What camera do you use?
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between text-[11px] sm:text-[12px] pt-1">
                  <div className="flex items-center gap-2 text-[#EB1000] font-bold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Creator notified on their OBS monitor</span>
                  </div>
                  <span className="text-[#7A7A8E]">Held safely in queue</span>
                </div>
              </div>

              {/* Bottom 2-Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Traditional Live Chat */}
                <div className="p-5 rounded-2xl bg-[#101018] border border-[#202030] space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Traditional Live Chat
                  </h4>
                  <p className="text-[11px] sm:text-[12px] text-[#7A7A8E] leading-relaxed font-normal">
                    Messages scroll by at 40 lines/ sec 98% of viewers questions get overlooked or completely ignored.
                  </p>
                </div>

                {/* AskMe Dedicated Stream */}
                <div className="p-5 rounded-2xl bg-[#241014] border border-[#EB1000]/40 space-y-2 shadow-lg shadow-[#EB1000]/10">
                  <h4 className="text-xs sm:text-sm font-bold text-[#EB1000]">
                    AskMe Dedicated Stream
                  </h4>
                  <p className="text-[11px] sm:text-[12px] text-[#A0A0B2] leading-relaxed font-normal">
                    Neatly Queued on the creator's OBS dashboard. When they answer, you get pinged instantly.
                  </p>
                </div>
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
                  <div className="text-[11px] text-[#7A7A8E]">Sarah Lin • Live Q&A session</div>
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
                    🔔 TechBurner answered your question!
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
        {/* SECTION 5: REAL-TIME BROADCAST ALERTS — NEVER MISS YOUR CREATOR */}
        {/* ========================================================================= */}
        <section id="live-matrix" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
          </div>

          {/* LARGE FEATURED LIVE STREAM CONTAINER */}
          <div className="max-w-5xl mx-auto rounded-3xl bg-[#14141E] border border-[#222234] p-5 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
            {/* Top Bar inside card */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202030] pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#EB1000] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#EB1000]/40 uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span> LIVE NOW
                </span>
                <span className="text-xs text-[#8E8E9F] bg-[#0E0E16] px-3.5 py-1 rounded-full border border-[#222232] font-medium">
                  Broadcasting to: <span className="text-white font-semibold">YouTube</span> & <span className="text-white font-semibold">Twitch</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white font-bold flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-[#8E8E9F]" /> 14,280 <span className="text-[#8E8E9F] font-normal">watching</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00F5D4]"></span> Ultra-Low Sync 0.4s
                </span>
              </div>
            </div>

            {/* Main Stream Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
              {/* Stream Image Thumbnail */}
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-[#262638] shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Sarah Chen is Live"
                  className="w-full h-52 sm:h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              {/* Stream Details & Action Buttons */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-[#EB1000] uppercase tracking-wider">
                    TECH & AI SYSTEMS <span className="text-[#8E8E9F] font-sans font-normal ml-1">• 420K Subscribers • Priority Queue Active</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white flex items-center gap-2">
                    Sarah Chen is Live
                    <CheckCircle2 className="h-5 w-5 text-[#00F5D4] fill-[#00F5D4]" />
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8E8E9F] font-medium leading-relaxed italic pt-0.5">
                    "AI Coding, Autonomous Agents & Next-Gen Developer Stack Q&A Session"
                  </p>
                </div>

                {/* Metrics line */}
                <div className="flex flex-wrap items-center gap-3 text-xs pt-2 pb-2 border-t border-b border-[#202030] text-[#8E8E9F]">
                  <span className="flex items-center gap-1 text-[#00F5D4] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Questions answered live
                  </span>
                  <span className="text-[#EB1000] font-bold">• 4 in priority queue</span>
                  <span>Avg. Answer Latency: 1m 40s</span>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/viewers/login"
                    className="px-5 py-2.5 rounded-full bg-[#EB1000] text-white text-xs font-bold shadow-lg shadow-[#EB1000]/40 flex items-center gap-1.5 hover:opacity-90 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" /> Join Live Stream
                  </Link>
                  <Link
                    href="/viewers/login"
                    className="px-4 py-2.5 rounded-full bg-[#1F180A] border border-[#FFD60A]/50 text-[#FFD60A] text-xs font-bold flex items-center gap-1.5 hover:bg-[#2A200F] transition-all"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#FFD60A]" /> Ask Priority Question
                    <span className="bg-[#FFD60A] text-black text-[10px] px-1.5 py-0.5 rounded font-black">$10</span>
                  </Link>
                  <button className="px-4 py-2.5 rounded-full bg-[#181826] border border-[#28283C] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#202030] transition-all">
                    <Heart className="h-3.5 w-3.5 text-[#EB1000]" /> Follow
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* GRID OF 3 UPCOMING STREAM CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-5 sm:p-6 rounded-3xl bg-[#14141E] border border-[#222234] flex flex-col justify-between space-y-4 hover:border-[#FFD60A]/40 transition-all shadow-xl"
              >
                <div>
                  {/* Card Header: Timer & Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#20180A] border border-[#FFD60A]/40 text-[#FFD60A] text-[11px] font-mono font-bold flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> STARTING IN 15 MIN
                    </span>
                    <span className="text-[11px] text-[#7A7A8E]">Today, 8:00 PM IST</span>
                  </div>

                  {/* Creator Info Box */}
                  <div className="flex items-center gap-3 mb-3">
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
                  </div>

                  {/* Pre-queue badge box */}
                  <div className="p-2.5 rounded-xl bg-[#1A1408] border border-[#FFD60A]/30 text-[#FFD60A] text-[11px] font-semibold flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 shrink-0" />
                    <span>Pre-queue questions open now (3 in queue)</span>
                  </div>
                </div>

                {/* Footer & Action Button */}
                <div className="space-y-3 pt-2">
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
            ))}
          </div>

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

          {/* ORBITAL NETWORK RADAR GRAPHIC */}
          <div className="relative max-w-3xl mx-auto my-8 h-[360px] sm:h-[460px] flex items-center justify-center overflow-hidden">
            {/* Outer Dashed Orbit Circle */}
            <div className="absolute w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-[#EB1000]/20 border-dashed animate-[spin_60s_linear_infinite]"></div>

            {/* Middle Orbit Circle */}
            <div className="absolute w-[230px] h-[230px] sm:w-[300px] sm:h-[300px] rounded-full border border-[#EB1000]/30 border-dashed animate-[spin_40s_linear_infinite_reverse]"></div>

            {/* Inner Orbit Circle */}
            <div className="absolute w-[130px] h-[130px] sm:w-[180px] sm:h-[180px] rounded-full border border-[#EB1000]/40"></div>

            {/* Radial Dotted Spoke Lines */}
            <div className="absolute w-full h-full flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#EB1000] to-transparent"></div>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#EB1000] to-transparent"></div>
              <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#EB1000] to-transparent rotate-45"></div>
              <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#EB1000] to-transparent -rotate-45"></div>
            </div>

            {/* CENTER CORE: ASKME GLOWING RED NODE */}
            <div className="relative z-20 flex flex-col items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#FF2A1A] to-[#D00C00] text-white flex flex-col items-center justify-center shadow-[0_0_60px_rgba(235,16,0,0.85)] border-2 border-white/30 transition-transform duration-300 hover:scale-110">
                <span className="text-2xl sm:text-3xl font-black leading-none tracking-tighter">a</span>
                <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase mt-0.5">ASKME</span>
              </div>
            </div>

            {/* 1. Twitch (Top-Center) */}
            <div className="absolute top-2 sm:top-5 left-1/2 -translate-x-1/2 z-10">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1028] border-2 border-[#9146FF] shadow-[0_0_25px_rgba(145,70,255,0.7)] flex items-center justify-center text-white transition-all hover:scale-110">
                  <Tv className="h-5 w-5 text-[#9146FF]" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#9146FF] border border-black animate-pulse"></span>
              </div>
            </div>

            {/* 2. YouTube (Top-Right) */}
            <div className="absolute top-12 sm:top-16 right-16 sm:right-28 z-10">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#280F12] border-2 border-[#FF0000] shadow-[0_0_25px_rgba(255,0,0,0.7)] flex items-center justify-center text-white transition-all hover:scale-110">
                  <Video className="h-5 w-5 text-[#FF0000]" />
                </div>
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#FF0000] border border-black animate-pulse"></span>
              </div>
            </div>

            {/* 3. LinkedIn (Right-Middle) */}
            <div className="absolute top-24 sm:top-28 right-2 sm:right-10 z-10">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0B1E2D] border-2 border-[#0A66C2] shadow-[0_0_25px_rgba(10,102,194,0.7)] flex items-center justify-center text-white transition-all hover:scale-110">
                  <span className="font-extrabold text-sm text-[#0A66C2]">in</span>
                </div>
                <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-[#0A66C2] border border-black animate-pulse"></span>
              </div>
            </div>

            {/* 4. Instagram (Left-Middle) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-12 z-10">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#26101E] border-2 border-[#E1306C] shadow-[0_0_25px_rgba(225,48,108,0.7)] flex items-center justify-center text-white transition-all hover:scale-110">
                  <Smartphone className="h-5 w-5 text-[#E1306C]" />
                </div>
                <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-[#E1306C] border border-black animate-pulse"></span>
              </div>
            </div>

            {/* 5. Facebook (Bottom-Left) */}
            <div className="absolute bottom-12 sm:bottom-16 left-12 sm:left-24 z-10">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0C1B2B] border-2 border-[#1877F2] shadow-[0_0_25px_rgba(24,119,242,0.7)] flex items-center justify-center text-white transition-all hover:scale-110">
                  <span className="font-black text-base text-[#1877F2]">f</span>
                </div>
                <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#1877F2] border border-black animate-pulse"></span>
              </div>
            </div>

            {/* 6. TikTok (Bottom-Center) */}
            <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 z-10">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0D2423] border-2 border-[#00F5D4] shadow-[0_0_25px_rgba(0,245,212,0.7)] flex items-center justify-center text-white transition-all hover:scale-110">
                  <Radio className="h-5 w-5 text-[#00F5D4]" />
                </div>
                <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-[#00F5D4] border border-black animate-pulse"></span>
              </div>
            </div>

            {/* 7. X / Twitter (Bottom-Right) */}
            <div className="absolute bottom-12 sm:bottom-16 right-16 sm:right-28 z-10">
              <div className="relative group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#181822] border-2 border-white/50 shadow-[0_0_25px_rgba(255,255,255,0.4)] flex items-center justify-center text-white transition-all hover:scale-110">
                  <span className="font-black text-sm text-white">X</span>
                </div>
                <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-white border border-black animate-pulse"></span>
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
                <span className="h-1.5 w-1.5 rounded-full bg-[#00F5D4]"></span> TikTok
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
                  <div className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
                    <QrCode className="w-32 h-32 text-black" />
                    <span className="text-[9px] font-black font-mono text-[#EB1000] tracking-wider uppercase mt-1">
                      SCAN TO ASK LIVE ➔
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#EB1000] font-bold">
                    askme.live/@samaylive ✓
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
          <div className="relative max-w-sm mx-auto my-6">
            <div className="w-72 sm:w-80 h-auto rounded-[36px] bg-[#0A0A12] border-4 border-[#222234] p-3.5 shadow-2xl relative mx-auto space-y-3">
              {/* Top Notch / Status Bar */}
              <div className="flex items-center justify-between text-[10px] px-2 text-[#8E8E9F]">
                <span className="px-2 py-0.5 rounded-full bg-[#EB1000] text-white text-[9px] font-extrabold flex items-center gap-1 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span> LIVE
                </span>
                <span className="text-white font-extrabold flex items-center gap-1">
                  👁 4.2K
                </span>
                <span className="text-[10px] text-white font-semibold">Kriti Live</span>
              </div>

              {/* Floating badges outside phone */}
              <span className="absolute -left-8 top-12 px-3 py-1 rounded-full bg-[#0D2418] border border-[#10B981]/60 text-[#10B981] text-[10px] font-extrabold shadow-xl z-20">
                ⚡ 0% Apple Fee
              </span>
              <div className="absolute -right-8 top-20 w-11 h-11 rounded-full bg-gradient-to-br from-[#FFD60A] to-[#FF9500] text-black font-black flex items-center justify-center shadow-xl border-2 border-white text-lg z-20">
                ₹
              </div>

              {/* Inner Support Messages */}
              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-xl bg-[#0D2418] border border-[#10B981]/40 text-xs text-white flex items-center justify-between shadow-md">
                  <div>
                    <div className="font-extrabold text-white text-xs">Rahul sent ₹500</div>
                    <div className="text-[10px] text-[#A0D0B0] font-medium">Keep inspiring us! 🔥</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[9px] font-bold">
                    Direct Web
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#281808] border border-[#FF9500]/40 text-xs text-white flex items-center justify-between shadow-md">
                  <div>
                    <div className="font-extrabold text-white text-xs">Sarah sent ₹2,000 SuperAsk</div>
                    <div className="text-[10px] text-[#F0C080] font-medium">Loved the career advice!</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#FF9500]/20 text-[#FF9500] text-[9px] font-bold">
                    Instant UPI
                  </span>
                </div>
              </div>

              {/* Support Button */}
              <button className="w-full py-2 rounded-xl bg-white text-black font-black text-xs shadow-md">
                Support the creator
              </button>
            </div>
          </div>

          {/* BOTTOM 2 WHITE CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto pt-2">
            {/* LEFT WHITE CARD: See What You Could Take Home (Interactive Calculator) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white text-black space-y-6 shadow-2xl border border-gray-200 text-left">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    See What You Could Take Home
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Enter or adjust your estimated audience support amount
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                  Calculator
                </span>
              </div>

              {/* Quick Preset Selector Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[50000, 100000, 250000, 500000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCalcAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all ${calcAmount === amt
                      ? 'bg-[#EB1000] text-white shadow-md shadow-[#EB1000]/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    ₹{(amt / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>

              {/* Range Slider & Amount Display */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Gross Audience Support
                  </span>
                  <span className="text-2xl font-black text-gray-900">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EB1000]"
                />
              </div>

              {/* Fee Breakdown Lines */}
              <div className="space-y-2.5 pt-2 text-xs border-t border-gray-100">
                <div className="flex items-center justify-between text-gray-600 font-medium">
                  <div className="flex items-center gap-2">
                    <span>AskMe Web / QR</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      0% Apple Tax
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-gray-600 font-medium">
                  <span>AskMe Fee (15%)</span>
                  <span className="text-red-500 font-bold">- ₹{Math.round(calcAmount * 0.15).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 font-medium">
                  <span>Gateway Charges (~2%)</span>
                  <span className="text-red-500 font-bold">- ₹{Math.round(calcAmount * 0.02).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 font-medium">
                  <span>GST + TDS (~3.7%)</span>
                  <span className="text-red-500 font-bold">- ₹{Math.round(calcAmount * 0.037).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Result Payout Box */}
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700">
                    Your Estimated Payout <span className="text-[#EB1000] ml-1 font-extrabold">Instant Transfer</span>
                  </span>
                  <div className="text-2xl font-black text-[#EB1000] mt-0.5">
                    ₹{Math.round(calcAmount * 0.793).toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-bold text-red-500 bg-white px-2 py-0.5 rounded-full border border-red-200 ml-1">
                      ~79.3%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT WHITE CARD: Why Creators Keep More with AskMe? (Comparison Table) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white text-black space-y-6 shadow-2xl border border-gray-200 flex flex-col justify-between text-left">
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                      Why Creators Keep More with AskMe?
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Direct comparisons against legacy app store models
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                    Fair Terms
                  </span>
                </div>

                {/* Comparison Table */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-gray-50 p-3 font-mono font-bold text-gray-500 border-b border-gray-200">
                    <div className="col-span-4 uppercase">PLATFORM METRIC</div>
                    <div className="col-span-4 text-center text-[#EB1000] uppercase font-extrabold">
                      ASKME (WEB & QR)
                    </div>
                    <div className="col-span-4 text-right uppercase">OTHER IOS PLATFORMS</div>
                  </div>

                  <div className="grid grid-cols-12 p-3 border-b border-gray-100 items-center font-medium">
                    <div className="col-span-4 text-gray-700 font-bold">Apple Tax</div>
                    <div className="col-span-4 text-center font-extrabold text-[#EB1000] text-sm">
                      0%
                    </div>
                    <div className="col-span-4 text-right text-gray-500">30%</div>
                  </div>

                  <div className="grid grid-cols-12 p-3 border-b border-gray-100 items-center font-medium">
                    <div className="col-span-4 text-gray-700 font-bold">Creator Share</div>
                    <div className="col-span-4 text-center font-extrabold text-[#EB1000] text-sm">
                      Up to 85%
                    </div>
                    <div className="col-span-4 text-right text-gray-500">~35–70%</div>
                  </div>

                  <div className="grid grid-cols-12 p-3 items-center font-medium">
                    <div className="col-span-4 text-gray-700 font-bold">Direct Payments</div>
                    <div className="col-span-4 text-center font-extrabold text-[#EB1000] text-xs">
                      Instant UPI & Cards
                    </div>
                    <div className="col-span-4 text-right text-gray-500">Delayed Hold</div>
                  </div>
                </div>

                {/* Highlight Banner Box */}
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 space-y-1 mt-4">
                  <div className="text-xs font-extrabold text-[#EB1000]">
                    Keep ₹63K – ₹93K more
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    than other iOS platforms on every ₹2.5 Lakhs raised.
                  </div>
                </div>
              </div>

              {/* Big Red Action Button */}
              <Link
                href="/creators/register"
                className="w-full py-4 rounded-2xl bg-[#EB1000] text-white font-black text-sm text-center block shadow-xl shadow-[#EB1000]/30 hover:opacity-95 transition-all mt-2"
              >
                Start Earning Today ➔
                <span className="block text-[10px] font-normal text-white/90 mt-0.5">
                  Direct Web & QR instant automated payouts
                </span>
              </Link>
            </div>
          </div>

          {/* BOTTOM ACTION BUTTONS: GET STARTED & VIEW FULL PAYOUT POLICY */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link
              href="/creators/register"
              className="px-8 py-3.5 rounded-full bg-[#EB1000] text-white text-sm sm:text-base font-extrabold shadow-xl shadow-[#EB1000]/40 flex items-center gap-2 hover:opacity-90 hover:scale-105 transition-all"
            >
              Get Started <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
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
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse"></span> 14 Creators Streaming Now • 4,820 In Queue
                </span>
              </div>

              {/* HEADING */}
              <h2 className="text-3xl sm:text-4xl lg:text-[50px] xl:text-[55px] font-extrabold text-white tracking-tight leading-[1.1]">
                DISCOVER & CONNECT WITH<br />
                <span className="text-[#EB1000]">TOP CREATORS</span>
              </h2>

              {/* SUBTITLE */}
              <p className="text-[15px] sm:text-[17px] text-[#8B8B9E] max-w-2xl font-medium leading-relaxed">
                Scan, tap, or submit priority super-questions directly inside creator studio monitors. Guaranteed on-stream answer or <span className="underline decoration-white/40 text-white font-semibold underline-offset-4">100% automated instant refund</span>
              </p>
            </div>

            {/* SECONDARY FILTER DROPDOWNS ROW (RIGHT ALIGNED) */}
            <div className="flex flex-wrap items-center gap-2.5 pb-1">
              <button className="px-4 py-2 rounded-full bg-[#0F0F18] border border-[#26263A] text-xs text-[#A0A0B5] font-semibold flex items-center gap-2 hover:text-white hover:border-[#383850] transition-colors">
                Fee: All Ranges <ChevronRight className="h-3.5 w-3.5 rotate-90 text-[#7A7A8E]" />
              </button>
              <button className="px-4 py-2 rounded-full bg-[#0F0F18] border border-[#26263A] text-xs text-[#A0A0B5] font-semibold flex items-center gap-2 hover:text-white hover:border-[#383850] transition-colors">
                Platform <ChevronRight className="h-3.5 w-3.5 rotate-90 text-[#7A7A8E]" />
              </button>
              <button className="px-4 py-2 rounded-full bg-[#0F0F18] border border-[#26263A] text-xs text-[#A0A0B5] font-semibold flex items-center gap-2 hover:text-white hover:border-[#383850] transition-colors">
                Fastest Response <ChevronRight className="h-3.5 w-3.5 rotate-90 text-[#7A7A8E]" />
              </button>
            </div>
          </div>

          {/* CATEGORY PILLS ROW WITH MUSIC ICONS & ACTIVE WHITE PILL WITH RED RING */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-2 scrollbar-none relative">
            <div className="flex items-center gap-3 shrink-0">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${isActive
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

          {/* CREATOR CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onAskQuestion={() => (window.location.href = `/viewers/login`)}
                onSelectCreator={() => (window.location.href = `/viewers/login`)}
              />
            ))}
          </div>
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
              <button className="px-5 py-2 rounded-full bg-[#1E1624] border border-white/20 text-white font-extrabold text-xs shadow-lg shadow-purple-950/40">
                All Highlights
              </button>
              <button className="px-5 py-2 rounded-full bg-[#0E0E16] border border-[#222234] text-[#8E8E9F] font-bold text-xs hover:text-white transition-colors">
                Revenue & Payouts
              </button>
              <button className="px-5 py-2 rounded-full bg-[#0E0E16] border border-[#222234] text-[#8E8E9F] font-bold text-xs hover:text-white transition-colors">
                Viewer Experience
              </button>
              <button className="px-5 py-2 rounded-full bg-[#0E0E16] border border-[#222234] text-[#8E8E9F] font-bold text-xs hover:text-white transition-colors">
                Distribution & OBS
              </button>
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
                    {/* ROW 1 */}
                    <tr className="hover:bg-[#12121D]/50 transition-colors">
                      <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">Creator Net Take–Home Share</td>
                      <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#EB1000] font-black text-sm">✓</span>
                          <span>85% Net Take-Home</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>70% (30% Platform Cut)</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>50% (50% Platform Cut)</span>
                        </div>
                      </td>
                    </tr>

                    {/* ROW 2 */}
                    <tr className="hover:bg-[#12121D]/50 transition-colors">
                      <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">Live Stream Viewing Experience</td>
                      <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#EB1000] font-black text-sm shrink-0">✓</span>
                          <span>Zero Stream Interruption <span className="text-[#7A7A8E] font-normal text-[11px]">(Scoot Back)</span></span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Distracting popup overlays</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Intrusive ad pre-rolls</span>
                        </div>
                      </td>
                    </tr>

                    {/* ROW 3 */}
                    <tr className="hover:bg-[#12121D]/50 transition-colors">
                      <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">Question Visibility & Retention</td>
                      <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#EB1000] font-black text-sm shrink-0">✓</span>
                          <span>Persistent Queue with Prioritized Highlights</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Lost in fast-moving chat scroll</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Spammed out by emotes & bots</span>
                        </div>
                      </td>
                    </tr>

                    {/* ROW 4 */}
                    <tr className="hover:bg-[#12121D]/50 transition-colors">
                      <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">Answer Notifications for Viewers</td>
                      <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#EB1000] font-black text-sm shrink-0">✓</span>
                          <span>In-App, Push & WhatsApp Alerts</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>None <span className="text-[10px] block text-[#66667A]">(must watch full stream)</span></span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>None <span className="text-[10px] block text-[#66667A]">(must stay in chat)</span></span>
                        </div>
                      </td>
                    </tr>

                    {/* ROW 5 */}
                    <tr className="hover:bg-[#12121D]/50 transition-colors">
                      <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">Cross-Platform Unification</td>
                      <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#EB1000] font-black text-sm shrink-0">✓</span>
                          <span>1 Universal QR & Link across YT, IG, Twitch, X</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>YouTube streams only</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Twitch streams only</span>
                        </div>
                      </td>
                    </tr>

                    {/* ROW 6 */}
                    <tr className="hover:bg-[#12121D]/50 transition-colors">
                      <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">Payout Settlement Timeline</td>
                      <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#EB1000] font-black text-sm shrink-0">✓</span>
                          <span>Instant / T+3 Direct KYC Bank Deposit</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Net 30–60 Days Monthly Hold</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Net 15–45 Days with $50 Threshold</span>
                        </div>
                      </td>
                    </tr>

                    {/* ROW 7 */}
                    <tr className="hover:bg-[#12121D]/50 transition-colors">
                      <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">Escrow & Refund Protection</td>
                      <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#EB1000] font-black text-sm shrink-0">✓</span>
                          <span>100% Escrow Protection if Unanswered</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>No automatic refund policy</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Non-refundable digital tokens</span>
                        </div>
                      </td>
                    </tr>

                    {/* ROW 8 */}
                    <tr className="hover:bg-[#12121D]/50 transition-colors">
                      <td className="py-4 px-3 sm:px-4 font-bold text-white leading-snug">OBS & VDO Live Broadcast Overlay</td>
                      <td className="py-4 px-3 sm:px-4 font-extrabold text-[#EB1000] bg-[#1C0A0D]/50 border-x border-[#EB1000]/20">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#EB1000] font-black text-sm shrink-0">✓</span>
                          <span>Customizable Real Time OBS Dock</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Distracting popup overlays</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 sm:px-4 text-[#7A7A8E] font-medium">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[#5A5A6E]">✕</span>
                          <span>Spammed by emotes & bots</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                  <span>100% Escrow security & automatic refund if missed</span>
                </div>
              </div>

              {/* Button & Link */}
              <div className="pt-2 space-y-2">
                <Link
                  href="/creators/register"
                  className="w-full py-3.5 rounded-full bg-[#EB1000] text-white text-xs font-extrabold tracking-wider uppercase shadow-xl shadow-[#EB1000]/40 flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.02] transition-all block text-center"
                >
                  LAUNCH CREATOR STUDIO ➔
                </Link>
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
                    className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                      isActive
                        ? 'bg-[#EB1000] text-white shadow-lg shadow-[#EB1000]/30'
                        : 'bg-[#0F0F18] text-[#8E8E9F] border border-[#242436] hover:text-white hover:border-[#383850]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Search Input Box */}
            <div className="relative shrink-0">
              <Search className="h-3.5 w-3.5 text-[#7A7A8E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions, OBS, UPI..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full bg-[#0F0F18] border border-[#242436] text-xs text-white placeholder-[#6E6E82] focus:outline-none focus:border-[#EB1000]/60 w-full sm:w-64 transition-all"
              />
            </div>
          </div>

          {/* FAQ 2-COLUMN ACCORDION GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedFaqs.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  onClick={() => toggleFaq(faq.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isOpen
                      ? 'bg-[#0D0910] border-[#EB1000]/50 shadow-xl shadow-[#EB1000]/10'
                      : 'bg-[#09090F] border-[#1C1C2A] hover:border-[#2C2C3E]'
                  }`}
                >
                  {/* Top Bar: Category Label & Plus/Minus Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider ${
                      isOpen ? 'text-[#EB1000]' : 'text-[#7A7A8E]'
                    }`}>
                      {faq.categoryTag}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-transform ${
                        isOpen
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
        {/* SECTION 12: PURPOSE & VISION — WHY ASKME EXISTS & STORY */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[12px] sm:text-[14px] font-black text-[#EB1000] tracking-widest uppercase">PURPOSE & VISION</span>
            <h2 className="text-3xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-heading font-extrabold text-white tracking-tight leading-[1.15]">
              Why AskMe Exists
            </h2>
            <p className="text-[16px] sm:text-[18px] text-[#8B8B9E] max-w-2xl mx-auto font-medium leading-relaxed">
              Millions of viewers join livestreams hoping to interact with creators. As communities grow, conversations move quickly and important questions easily get buried. AskMe builds direct, organized, and fair interaction infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#222234] space-y-3">
              <span className="text-xs font-bold text-[#EB1000] uppercase">Spotlight</span>
              <h3 className="text-[20px] sm:text-[22px] lg:text-[24px] font-heading font-bold text-white">Creator Discovery</h3>
              <p className="text-[14px] text-[#8B8B9E]">
                Visibility through curated live sessions, trending categories, spotlights, and dedicated creator profiles.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#222234] space-y-3">
              <span className="text-xs font-bold text-[#00F5D4] uppercase">High-intent exposure</span>
              <h3 className="text-[20px] sm:text-[22px] lg:text-[24px] font-heading font-bold text-white">Grow Your Audience</h3>
              <p className="text-[14px] text-[#8B8B9E]">
                Convert first-time visitors into long-term community members and increase subscriber engagement across platforms.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#222234] space-y-3">
              <span className="text-xs font-bold text-[#FFD60A] uppercase">Zero Noise</span>
              <h3 className="text-[20px] sm:text-[22px] lg:text-[24px] font-heading font-bold text-white">Meaningful Communities</h3>
              <p className="text-[14px] text-[#8B8B9E]">
                Organize audience interactions, filter out fast-moving chat spam, and strengthen genuine creator-viewer relationships.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#222234] space-y-3">
              <span className="text-xs font-bold text-[#00E676] uppercase">85% Creator Cut</span>
              <h3 className="text-[20px] sm:text-[22px] lg:text-[24px] font-heading font-bold text-white">Direct Monetization</h3>
              <p className="text-[14px] text-[#8B8B9E]">
                Transparent 15% platform fee with creators retaining 85% of net revenues, backed by secure automated escrow payouts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#222234] space-y-3">
              <span className="text-xs font-bold text-[#9146FF] uppercase">Host Moderation</span>
              <h3 className="text-[20px] sm:text-[22px] lg:text-[24px] font-heading font-bold text-white">Complete Interaction Control</h3>
              <p className="text-[14px] text-[#8B8B9E]">
                Creators preview questions, block abusive words, reject spam, and answer questions verbally live or in the studio dashboard.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#12121C] border border-[#222234] space-y-3">
              <span className="text-xs font-bold text-[#FF3D71] uppercase">Escrow Safe</span>
              <h3 className="text-[20px] sm:text-[22px] lg:text-[24px] font-heading font-bold text-white">Designed for Viewers</h3>
              <p className="text-[14px] text-[#8B8B9E]">
                Guaranteed recognition, queue tracking, priority support, and instant refund protection if a question goes unanswered.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#181826] to-[#12121C] border border-[#222234] text-center space-y-4">
            <span className="text-[12px] sm:text-[14px] font-black text-[#EB1000] tracking-widest uppercase">OUR ORIGIN</span>
            <blockquote className="text-xl sm:text-2xl font-heading font-black text-white italic max-w-3xl mx-auto">
              “What if every genuine question had a fair chance of being seen, and every creator had a better way to manage meaningful audience interactions?”
            </blockquote>
            <p className="text-[12px] text-[#8B8B9E] font-mono uppercase tracking-wider">
              THE CORE QUESTION THAT FOUNDED ASKME
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 12: BOTTOM CTA BANNER */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#EB1000] via-[#CC0E00] to-[#800A00] p-8 md:p-14 text-center space-y-6 overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest block">FOR VIEWERS & CREATORS</span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black text-white leading-tight">
                Where Live-Streams & Real-Time Fans Connect
              </h2>
              <p className="text-[16px] text-white/80 font-medium">
                Discover who's live across every platform, jump into active chats, & ask questions directly or stream to your biggest fans all in one place
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/creators/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#0A0A0F] font-black text-sm hover:bg-[#00F5D4] transition-all shadow-xl"
                >
                  Get Started
                </Link>
                <a
                  href="#creators"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0A0A0F]/60 text-white font-bold text-sm border border-white/20 hover:bg-[#0A0A0F] transition-all"
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
    </div>
  );
}
