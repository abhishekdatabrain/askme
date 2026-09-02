'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken, getAdminUser, clearAdminSession } from '@/utils/cookies';
import AdminSidebar from '@/components/AdminSidebar';
import HeroStreamMarquee from '@/components/HeroStreamMarquee';
import StatCard from '@/components/StatCard';
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
import AdminNotifications from '@/components/AdminNotifications';
import UserAgreement from '@/components/UserAgreement';

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
    const [activeSubTab, setActiveSubTab] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCreatorForAsk, setSelectedCreatorForAsk] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [questionText, setQuestionText] = useState('');
    const [questionSubmitted, setQuestionSubmitted] = useState(false);

    const [dashboardStats, setDashboardStats] = useState({
        totalCreators: 0,
        registeredThisWeek: 0,
        activeStreamers: 0,
        totalDonations: 0,
        totalRevenue: 0,
        pendingWithdrawals: 0,
        pendingWithdrawalsAmount: 0,
        pendingKyc: 0,
        commissionRate: 15
    });

    // Dark / Light Theme Toggle State
    const [theme, setTheme] = useState('dark');

    React.useEffect(() => {
        const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_admin_theme') || 'dark') : 'dark';
        setTheme(savedTheme);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('askme_admin_theme', nextTheme);
        }
    };

    React.useEffect(() => {
        const token = getAdminToken();
        const userObj = getAdminUser();
        const userRole = (userObj?.role || '').toLowerCase();

        if (!token || !userObj) {
            setIsLoggedIn(false);
            setIsCheckingAuth(false);
            window.location.href = '/admin/login';
            return;
        }

        if (userRole !== 'admin') {
            setIsLoggedIn(false);
            setIsCheckingAuth(false);
            window.location.href = '/admin/login';
            return;
        }

        setIsLoggedIn(true);
        setIsCheckingAuth(false);
        setShowAuthModal(false);
    }, [router]);

    React.useEffect(() => {
        if (!isLoggedIn) return;

        const fetchDashboardStats = async () => {
            try {
                const token = getAdminToken();
                if (!token) return;

                const res = await fetch(API_ENDPOINTS.ADMIN.DASHBOARD, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.status === 'success' && data.data) {
                    const d = data.data;
                    setDashboardStats({
                        totalCreators: Number(d.totalCreators || 0),
                        registeredThisWeek: Number(d.registeredThisWeek || 0),
                        activeStreamers: Number(d.activeStreamers || 0),
                        totalDonations: Number(d.totalDonations || 0),
                        totalRevenue: Number(d.totalRevenue || 0),
                        pendingWithdrawals: Number(d.pendingWithdrawals || 0),
                        pendingWithdrawalsAmount: Number(d.pendingWithdrawalsAmount || 0),
                        pendingKyc: Number(d.pendingKyc || 0),
                        commissionRate: Number(d.commissionRate || 15)
                    });
                }
            } catch (err) {
                console.warn('API fetch dashboard stats warning:', err.message);
            }
        };
        fetchDashboardStats();
    }, [isLoggedIn]);

    const handleLogout = () => {
        clearAdminSession();
        setIsLoggedIn(false);
        window.location.href = '/admin/login';
    };

    // Mock Creators Database matching PDF design references
    const creators = [
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

    if (isCheckingAuth || !isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-2xl animate-pulse glow-teal">
                    a
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#8B8B96]">
                    <ShieldCheck className="h-4 w-4 text-[#00F5D4] animate-spin" />
                    <span>Verifying Admin Control Room Access...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors ${theme === 'light'
            ? 'bg-[#F8F9FA] text-[#212529]'
            : 'bg-[#0A0A0F] text-[#F5F5F7]'
            }`}>
            {/* Top Navbar with Theme Toggle */}
            <AdminNavbar
                activeView={activeTab}
                setActiveView={setActiveTab}
                onOpenAuthModal={() => setShowAuthModal(true)}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                theme={theme}
                onToggleTheme={toggleTheme}
            />

            {/* Main Workspace Layout */}
            <div className="flex flex-1">
                {/* Left Control Room Sidebar */}
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    activeSubTab={activeSubTab}
                    setActiveSubTab={setActiveSubTab}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                />

                {/* Center Main Content Workspace */}
                <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
                    {/* Conditional View Rendering based on Platform Owner Tab selection */}
                    {(activeTab === 'creators' || activeTab === 'creators_mgmt') && <CreatorManagement activeSubTab={activeSubTab} />}
                    {activeTab === 'kyc' && activeSubTab === 'user_agreement' && <UserAgreement activeSubTab={activeSubTab} />}
                    {activeTab === 'kyc' && activeSubTab !== 'user_agreement' && <KycApprovalQueue activeSubTab={activeSubTab} />}
                    {activeTab === 'user_agreement' && <UserAgreement activeSubTab={activeSubTab} />}
                    {activeTab === 'livesessions' && <LiveSessionManagement activeSubTab={activeSubTab} />}
                    {activeTab === 'payments' && <PaymentManagement activeSubTab={activeSubTab} />}
                    {activeTab === 'wallets' && <WalletManagement activeSubTab={activeSubTab} />}
                    {activeTab === 'withdrawals' && <WithdrawalsManager activeSubTab={activeSubTab} />}
                    {activeTab === 'commissions' && <CommissionSettings activeSubTab={activeSubTab} />}
                    {activeTab === 'reports' && <ReportsAnalytics activeSubTab={activeSubTab} />}
                    {activeTab === 'notifications' && <AdminNotifications activeSubTab={activeSubTab} />}
                    {activeTab === 'settings' && <PlatformOperations activeSubTab={activeSubTab} />}

                    {activeTab === 'overview' && (
                        <>
                            {/* SECTION 14: Admin Dashboard Overview Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C1C26] pb-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight">
                                            Dashboard <span className="text-brand-gradient">Overview</span>
                                        </h1>
                                        <span className="px-3 py-1 rounded-full bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-xs font-bold animate-live-pulse hidden sm:inline-flex">
                                            {dashboardStats.activeStreamers} STREAMERS LIVE NOW
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm text-[#8B8B96] mt-1 max-w-2xl leading-relaxed">
                                        Real-time platform statistics, creator activity, total revenue share ({dashboardStats.commissionRate}% platform cut / {100 - dashboardStats.commissionRate}% creator net), pending withdrawals, and KYC verification queues.
                                    </p>
                                </div>
                            </div>

                            {/* SECTION 14: Admin Dashboard Overview 6 Key Statistics Cards */}
                            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatCard
                                    title="Total Creators"
                                    value={dashboardStats.totalCreators.toLocaleString()}
                                    change={`+${dashboardStats.registeredThisWeek} Registered This Week`}
                                    subtitle="Active Verified Profiles"
                                    icon={Users}
                                    accent="teal"
                                />
                                <StatCard
                                    title="Active Streamers"
                                    value={`${dashboardStats.activeStreamers} Live`}
                                    change={dashboardStats.activeStreamers > 0 ? `${dashboardStats.activeStreamers} Active Streams` : 'Live Streamers'}
                                    subtitle="YouTube, Twitch, Kick, X"
                                    icon={Radio}
                                    accent="pink"
                                />
                                <StatCard
                                    title="Total Donations"
                                    value={`₹${dashboardStats.totalDonations.toLocaleString()}`}
                                    change="Gross Interaction Volume"
                                    subtitle="Gross Viewer Interaction Volume"
                                    icon={DollarSign}
                                    accent="yellow"
                                />
                                <StatCard
                                    title="Total Platform Revenue"
                                    value={`₹${dashboardStats.totalRevenue.toLocaleString()}`}
                                    change={`${dashboardStats.commissionRate}% Net Commission`}
                                    subtitle="Platform Operational Margin"
                                    icon={Sparkles}
                                    accent="violet"
                                />
                                <StatCard
                                    title="Pending Withdrawals"
                                    value={`${dashboardStats.pendingWithdrawals} Requests`}
                                    change={`₹${dashboardStats.pendingWithdrawalsAmount.toLocaleString()} Queued`}
                                    subtitle="85% Net Payout Queue"
                                    icon={DollarSign}
                                    accent="yellow"
                                />
                                <StatCard
                                    title="Pending KYC"
                                    value={`${dashboardStats.pendingKyc} Applications`}
                                    change="Identity Verification Queue"
                                    subtitle="Awaiting Admin Review"
                                    icon={CheckCircle2}
                                    accent="teal"
                                />
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
