'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import HeroStreamMarquee from '@/components/HeroStreamMarquee';
import StatCard from '@/components/StatCard';
import CreatorCard from '@/components/CreatorCard';
import ModerationQueue from '@/components/ModerationQueue';
import AskMePayTable from '@/components/AskMePayTable';
import LiveBadge from '@/components/LiveBadge';
import PlatformIcon from '@/components/PlatformIcon';
import AskMePayBadge from '@/components/AskMePayBadge';
import KycApprovalQueue from '@/components/KycApprovalQueue';
import WithdrawalsManager from '@/components/WithdrawalsManager';
import CommissionSettings from '@/components/CommissionSettings';
import PlatformOperations from '@/components/PlatformOperations';
import CreatorRegisterForm from '@/components/CreatorRegisterForm';
import CreatorManagement from '@/components/CreatorManagement';
import LiveSessionManagement from '@/components/LiveSessionManagement';
import PaymentManagement from '@/components/PaymentManagement';
import WalletManagement from '@/components/WalletManagement';
import ReportsAnalytics from '@/components/ReportsAnalytics';

import {
  Radio,
  Users,
  DollarSign,
  ShieldCheck,
  Tv,
  Sparkles,
  Zap,
  MessageSquare,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  Plus,
  X,
  Send,
  Sliders,
  Shield
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCreatorForAsk, setSelectedCreatorForAsk] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('askme_token');
    if (token && token !== 'undefined' && token !== 'null') {
      setIsLoggedIn(true);
      setShowAuthModal(false);
    } else {
      setIsLoggedIn(false);
      setShowAuthModal(false);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('askme_token');
    localStorage.removeItem('askme_user');
    setIsLoggedIn(false);
    router.push('/login');
  };

  // Mock Creators Database matching PDF design references
  const creators = [
    {
      id: 'c1',
      name: 'TechBurner Live',
      handle: '@techburner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      category: 'Technology',
      platform: 'youtube',
      minFee: '₹100',
      subscribers: '3.4M',
      rating: '4.9',
      answeredCount: '382',
      bio: 'Tech reviews, startup breakdowns, and live gadget Q&A. Ask me anything about AI, phones, or coding!',
      isLive: true,
      isVip: true,
    },
    {
      id: 'c2',
      name: 'FinCal Strategy',
      handle: '@fincal_live',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      category: 'Finance',
      platform: 'youtube',
      minFee: '₹200',
      subscribers: '1.8M',
      rating: '4.95',
      answeredCount: '520',
      bio: 'Personal finance, stock market analysis, SIPs, and tax saving advice.',
      isLive: true,
      isVip: true,
    },
    {
      id: 'c3',
      name: 'CodeWithAnish',
      handle: '@codewithanish',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      category: 'Education',
      platform: 'youtube',
      minFee: '₹150',
      subscribers: '850K',
      rating: '4.88',
      answeredCount: '210',
      bio: 'Senior Software Engineer answering career advice, System Design, and React/Node interview questions.',
      isLive: true,
      isVip: false,
    },
    {
      id: 'c4',
      name: 'GamerX Xtreme',
      handle: '@gamerx_live',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      category: 'Gaming',
      platform: 'twitch',
      minFee: '₹50',
      subscribers: '2.1M',
      rating: '4.85',
      answeredCount: '440',
      bio: 'Pro Esports player streaming GTA V, Valorant & BGMI. Ask about settings, sensitivity & pro tips!',
      isLive: true,
      isVip: true,
    },
    {
      id: 'c5',
      name: 'Dr. Priya HealthTalk',
      handle: '@dr_priya_health',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
      category: 'Health & Fitness',
      platform: 'youtube',
      minFee: '₹250',
      subscribers: '620K',
      rating: '4.97',
      answeredCount: '180',
      bio: 'Clinical Nutritionist & Fitness Coach. Ask about fat loss, muscle gain, meal plans, and longevity.',
      isLive: false,
      isVip: true,
    },
    {
      id: 'c6',
      name: 'Startup Unfiltered',
      handle: '@startup_unfiltered',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      category: 'Business',
      platform: 'youtube',
      minFee: '₹500',
      subscribers: '410K',
      rating: '4.92',
      answeredCount: '60',
      bio: 'Angel investor & 2x founder answering fundraising, pitch deck, and scaling questions.',
      isLive: false,
      isVip: true,
    },
    {
      id: 'c7',
      name: 'Ajeet Bharti',
      handle: '@AjeetBharti',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      banner: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
      category: 'Podcasts',
      platform: 'youtube',
      minFee: '₹150',
      subscribers: '1.25M',
      rating: '4.98',
      answeredCount: '620',
      bio: 'Journalist, author & socio-political commentator. Live analysis on political discourse & media critique.',
      isLive: true,
      isVip: true,
    },
  ];

  const categories = ['All', 'Following', 'Technology', 'Gaming', 'Education', 'Finance', 'Business', 'Health & Fitness', 'Podcasts'];

  const filteredCreators = selectedCategory === 'All'
    ? creators
    : selectedCategory === 'Following'
      ? creators.filter(c => c.isVip)
      : creators.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleSendQuestion = (e) => {
    e.preventDefault();
    setQuestionSubmitted(true);
    setTimeout(() => {
      setQuestionSubmitted(false);
      setSelectedCreatorForAsk(null);
      setQuestionText('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col font-sans">
      {/* Top Navbar */}
      <AdminNavbar
        activeView={activeTab}
        setActiveView={setActiveTab}
        onOpenAuthModal={() => setShowAuthModal(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1">
        {/* Left Control Room Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Center Main Content Workspace */}
        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Conditional View Rendering based on Platform Owner Tab selection */}
          {activeTab === 'creators_mgmt' && <CreatorManagement />}
          {activeTab === 'kyc' && <KycApprovalQueue />}
          {activeTab === 'livesessions' && <LiveSessionManagement />}
          {activeTab === 'payments' && <PaymentManagement />}
          {activeTab === 'wallets' && <WalletManagement />}
          {activeTab === 'withdrawals' && <WithdrawalsManager />}
          {activeTab === 'commissions' && <CommissionSettings />}
          {activeTab === 'reports' && <ReportsAnalytics />}

          {activeTab === 'overview' && (
            <>
              {/* Hero Stream Marquee Section */}
              <section>
                <HeroStreamMarquee />
              </section>

              {/* SECTION 14: Admin Dashboard Overview Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C1C26] pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight">
                      Dashboard <span className="text-brand-gradient">Overview</span>
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-xs font-bold animate-live-pulse hidden sm:inline-flex">
                      142 STREAMERS LIVE NOW
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-[#8B8B96] mt-1 max-w-2xl leading-relaxed">
                    Real-time platform statistics, creator activity, total revenue share (15% platform cut / 85% creator net), pending withdrawals, and KYC verification queues.
                  </p>
                </div>

                {/* <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-bold shadow-md glow-teal hover:opacity-95 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" /> Become a Creator (Register)
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 transition-colors border border-[#1C1C26]"
                  >
                    Creator Sign In
                  </Link>
                </div> */}
              </div>

              {/* SECTION 14: Admin Dashboard Overview 6 Key Statistics Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Total Creators"
                  value="1,482"
                  change="+34 Registered This Week"
                  subtitle="Active Verified Profiles"
                  icon={Users}
                  accent="teal"
                />
                <StatCard
                  title="Active Streamers"
                  value="142 Live"
                  change="+12 from 1h ago"
                  subtitle="YouTube, Twitch, Kick, X"
                  icon={Radio}
                  accent="pink"
                />
                <StatCard
                  title="Total Donations"
                  value="₹24,89,500"
                  change="+18.4% Volume"
                  subtitle="Gross Viewer Interaction Volume"
                  icon={DollarSign}
                  accent="yellow"
                />
                <StatCard
                  title="Total Platform Revenue"
                  value="₹3,73,425"
                  change="15% Net Commission"
                  subtitle="Platform Operational Margin"
                  icon={Sparkles}
                  accent="violet"
                />
                <StatCard
                  title="Pending Withdrawals"
                  value="18 Requests"
                  change="₹4,12,000 Queued"
                  subtitle="85% Net Payout Queue"
                  icon={DollarSign}
                  accent="yellow"
                />
                <StatCard
                  title="Pending KYC"
                  value="24 Creators"
                  change="Identity Verification"
                  subtitle="Awaiting Admin Review"
                  icon={CheckCircle2}
                  accent="teal"
                />
              </section>

              {/* AskMail & Brand Deals Banner Box (PDF Page 1 Reference) */}
              <section className="rounded-3xl bg-gradient-to-r from-[#1C1C26] via-[#13131A] to-[#1C1C26] border border-[#7B2FFF]/30 p-6 relative overflow-hidden shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#7B2FFF]/20 border border-[#7B2FFF]/40 text-[#7B2FFF] shadow-lg">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold tracking-widest text-[#00F5D4] uppercase bg-[#00F5D4]/10 px-2 py-0.5 rounded-md">
                          OFFLINE PAID MAIL & BRAND DEALS
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-lg md:text-xl text-white mt-1">
                        Want to talk more to your favourite creator? Send them an askMail!
                      </h3>
                      <p className="text-xs text-[#8B8B96] mt-1 max-w-xl">
                        Send guaranteed paid offline messages, business inquiries, brand proposals, or consultations directly to their inbox with wallet hold protection.
                      </p>
                    </div>
                  </div>

                  <button className="px-6 py-3 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-bold text-sm shadow-xl glow-teal hover:scale-105 transition-transform flex items-center gap-2 shrink-0">
                    <Send className="h-4 w-4" /> Send askMail Now
                  </button>
                </div>
              </section>

              {/* Creator Discovery Platform Header & Category Pills (PDF Page 1 & 2) */}
              <section className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-white">Creator Discovery Platform</h2>
                    <p className="text-xs text-[#8B8B96]">
                      Discover creators across categories, join live AskMe sessions, and support with paid questions.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13131A] border border-[#1C1C26] text-xs">
                    <span className="text-[#FFD60A] font-bold">{filteredCreators.length} Creators Found</span>
                  </div>
                </div>

                {/* Category Filter Horizontal Scroll */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                        ? 'bg-brand-gradient text-[#0A0A0F] font-bold shadow-md'
                        : 'bg-[#13131A] text-[#8B8B96] hover:text-white border border-[#1C1C26]'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Creator Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCreators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      onAskQuestion={(c) => setSelectedCreatorForAsk(c)}
                      onSelectCreator={(c) => setSelectedCreatorForAsk(c)}
                    />
                  ))}
                </div>
              </section>

              {/* AskMe Pay Ledger & Smart Moderation Sections */}
              <section className="space-y-8">
                <AskMePayTable />
                <ModerationQueue />
              </section>

              {/* Why AskMe Exists Section (PDF Page 2 Reference) */}
              <section className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 lg:p-8 space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-[#00F5D4] uppercase bg-[#00F5D4]/10 px-3 py-1 rounded-full">
                    PURPOSE & VISION
                  </span>
                  <h2 className="font-heading font-black text-2xl lg:text-3xl text-white">Why AskMe Exists</h2>
                  <p className="text-xs text-[#8B8B96] leading-relaxed">
                    Every day, millions of viewers join livestreams hoping to interact with their favorite creators. As communities grow, meaningful interactions often become difficult because conversations move quickly and important messages can easily be overlooked.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2">
                    <div className="p-2 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] w-fit">
                      <Radio className="h-5 w-5" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-white">Creator Discovery</h4>
                    <p className="text-xs text-[#8B8B96] leading-relaxed">
                      Visibility through featured creators, live sessions, trending sections, and category spotlights.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2">
                    <div className="p-2 rounded-xl bg-[#FFD60A]/10 text-[#FFD60A] w-fit">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-white">Unlock Earning Opportunities</h4>
                    <p className="text-xs text-[#8B8B96] leading-relaxed">
                      Sustainable monetization opportunities while growing audience with transparent 15% platform fees.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2">
                    <div className="p-2 rounded-xl bg-[#7B2FFF]/10 text-[#7B2FFF] w-fit">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-white">Build Meaningful Communities</h4>
                    <p className="text-xs text-[#8B8B96] leading-relaxed">
                      Organize audience interactions, filter out fast-moving chat spam, and strengthen creator-viewer relationships.
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer Section (PDF Page 3 Reference) */}
              <footer className="border-t border-[#1C1C26] pt-8 pb-12 text-xs text-[#8B8B96] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-bold text-sm">
                        a
                      </div>
                      <span className="font-heading font-bold text-base text-white">AskMe</span>
                    </div>
                    <p className="text-xs text-[#8B8B96] leading-relaxed">
                      The Creator Discovery & Audience Engagement Platform. Sustainable Q&A infrastructure for creators across live streams, digital content, and asynchronous communication.
                    </p>
                    <div className="p-2 rounded-lg bg-[#13131A] border border-[#1C1C26] text-[10px]">
                      <span className="font-bold text-white block">Futurepast ventures LLP</span>
                      <span>Lake View City, Lohegaon, Pune 411047, MH, India</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Explore Categories</h5>
                    <ul className="space-y-2 text-xs">
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Technology & AI</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Finance & Stocks</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Software Engineering</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Gaming & Esports</a></li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Creator Services</h5>
                    <ul className="space-y-2 text-xs">
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Keep 85% Net Revenue Share</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">OBS Live Stream Overlay</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Instant KYC Payout Settlement</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Escrow Payment Protection</a></li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Legal & Policies</h5>
                    <ul className="space-y-2 text-xs">
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Terms of Service</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Privacy Policy (DPDP Act)</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Payment & Refund Policy</a></li>
                      <li><a href="#" className="hover:text-[#00F5D4] transition-colors">Community Rules</a></li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1C1C26] pt-6 text-[11px]">
                  <span>© 2026 AskMe (Futurepast ventures LLP). All rights reserved.</span>
                  <div className="flex items-center gap-2 text-[#00F5D4]">
                    <Lock className="h-3 w-3" />
                    <span>AskMe Staff Operations Portal (Bot Active)</span>
                  </div>
                </div>
              </footer>
            </>
          )}
        </main>
      </div>

      {/* Interactive Modal for Ask Question / Monetized Interaction */}
      {selectedCreatorForAsk && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedCreatorForAsk(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#1C1C26] text-[#8B8B96] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src={selectedCreatorForAsk.avatar}
                alt={selectedCreatorForAsk.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-[#00F5D4]"
              />
              <div>
                <h3 className="font-heading font-bold text-base text-white">{selectedCreatorForAsk.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8B8B96]">{selectedCreatorForAsk.handle}</span>
                  <AskMePayBadge amount={selectedCreatorForAsk.minFee} />
                </div>
              </div>
            </div>

            {questionSubmitted ? (
              <div className="p-6 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-[#00E676] mx-auto" />
                <h4 className="font-heading font-bold text-lg text-white">Question Submitted to Queue!</h4>
                <p className="text-xs text-[#8B8B96]">
                  Your question has been sent to Smart Moderation and will appear on {selectedCreatorForAsk.name}'s live dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8B8B96] mb-1.5">
                    Your Question for {selectedCreatorForAsk.name}
                  </label>
                  <textarea
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    placeholder="Type your question here... Guaranteed fair opportunity to be heard!"
                    className="w-full rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] p-3 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none focus:ring-1 focus:ring-[#00F5D4]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[#8B8B96]">AskMe Pay Fee:</span>
                  <span className="font-extrabold text-[#FFD60A] text-sm">{selectedCreatorForAsk.minFee}</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-bold text-sm shadow-xl glow-teal hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" /> Submit Guaranteed AskQuestion
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Creator Registration & Login Modal Flow */}
      {showAuthModal && (
        <CreatorRegisterForm
          onClose={() => setShowAuthModal(false)}
          onComplete={() => {
            setIsLoggedIn(true);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
