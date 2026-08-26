'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser, setCookie } from '@/utils/cookies';
import { getSocket } from '@/config/socket';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  DollarSign,
  Video,
  Copy,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  QrCode,
  ArrowLeft,
  ExternalLink,
  Layers,
  Wallet,
  Check,
  XCircle,
  Radio,
  PlusCircle,
  Upload,
  Image as ImageIcon,
  PlayCircle,
  StopCircle,
  Share2,
  RefreshCw,
  Sun,
  Moon,
  Bell,
  LayoutDashboard,
  History,
  BarChart3,
  Settings,
  Target,
  Monitor,
  ArrowRight,
  User,
  Building2,
  Globe,
  Save
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

function CreatorDashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [creator, setCreator] = useState(null);
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const [copiedPayLink, setCopiedPayLink] = useState(false);
  const [kycStatus, setKycStatus] = useState('pending');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Dashboard Section Tab State
  // Section Structure: Overview | Start Live | Active Session | Session History | Analytics | Profile Settings
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const tabFromUrl = searchParams?.get('tab');
    if (tabFromUrl && ['overview', 'start-live', 'active-session', 'session-history', 'analytics', 'profile-settings'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tabKey) => {
    setActiveTab(tabKey);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabKey);
    window.history.pushState({}, '', url.toString());
  };

  // Theme State
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
      setTheme(savedTheme);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('creator-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('creator-theme-changed', handleThemeChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_creator_theme', nextTheme);
      window.dispatchEvent(new Event('creator-theme-changed'));
    }
  };

  // Sessions & Metrics State
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Wallet Metrics
  const [walletMetrics, setWalletMetrics] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    questionsAnsweredCount: 0,
    pendingAmount: 0,
    withdrawnAmount: 0,
  });

  // Profile Form State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    bio: '',
    profileImage: '',
    country: 'India',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    youtubeUrl: '',
    twitchUrl: '',
  });

  // 4-Step Live Session Creation Form Wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [createdSessionOutput, setCreatedSessionOutput] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    title: 'Gaming & Q&A Live Session',
    category: 'Gaming & Esports',
    streamingPlatform: 'YouTube Live',
    streamUrl: '',
    durationHours: 2,
    goalAmount: 5000,
    minDonation: 10,
    description: 'Ask questions & support live on OBS stream during our broadcast!',
  });

  // Countdown Effect for Active Live Session Auto-Close
  useEffect(() => {
    if (!activeSession) {
      setTimeRemaining('');
      return;
    }

    const durationMs = (Number(activeSession.durationHours) || 2) * 3600 * 1000;
    const startTime = activeSession.endsAt
      ? new Date(activeSession.endsAt).getTime() - durationMs
      : new Date(activeSession.startedAt || activeSession.createdAt || Date.now()).getTime();
    const endTime = activeSession.endsAt
      ? new Date(activeSession.endsAt).getTime()
      : startTime + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeRemaining('00h 00m 00s (Expired)');
        handleEndSession();
        toast.info('Live session automatically ended as duration time expired.', 'Session Auto-Closed');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
        );
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [activeSession]);

  // Initial Data Fetch
  useEffect(() => {
    const token = getCreatorToken();
    const u = getCreatorUser();

    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }

    setCreator(u);
    const initialStatus = String(u.kycStatus || 'pending').toLowerCase();
    setKycStatus(initialStatus === 'approved' || initialStatus === 'verified' ? 'approved' : initialStatus === 'rejected' ? 'rejected' : 'pending');

    const fetchData = async () => {
      try {
        const creatorId = u.id;

        // Fetch KYC Status
        const resStatus = await fetch(`${API_ENDPOINTS.CREATORS.KYC_STATUS}?creatorId=${creatorId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const dataStatus = await resStatus.json();
        if (dataStatus.status === 'success' && dataStatus.data?.kycStatus) {
          const raw = String(dataStatus.data.kycStatus).toLowerCase();
          const statusVal = raw === 'approved' || raw === 'verified' ? 'approved' : raw === 'rejected' || raw === 'action_required' ? 'rejected' : 'pending';
          setKycStatus(statusVal);
        }

        // Fetch Wallet Details
        try {
          const resWallet = await fetch(`${API_ENDPOINTS.CREATORS.WALLET_DETAILS}?creatorId=${creatorId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const dataWallet = await resWallet.json();
          if (resWallet.ok && dataWallet.status === 'success' && dataWallet.data) {
            const w = dataWallet.data.wallet || {};
            const txs = dataWallet.data.transactions || [];
            const successfulCount = txs.filter(t => t.payment_status === 'Successful' || t.payment_status === 'success').length;
            setWalletMetrics({
              totalEarnings: parseFloat(w.totalEarnings || 0),
              availableBalance: parseFloat(w.availableBalance || 0),
              questionsAnsweredCount: successfulCount || (parseFloat(w.totalEarnings || 0) > 0 ? Math.max(1, Math.round(parseFloat(w.totalEarnings || 0) / 100)) : 0),
              pendingAmount: parseFloat(w.pendingAmount || 0),
              withdrawnAmount: parseFloat(w.withdrawnAmount || 0),
            });
          }
        } catch (wErr) { }

        // Fetch Creator Profile for Settings Tab
        try {
          const resProf = await fetch(API_ENDPOINTS.CREATORS.PROFILE, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const dataProf = await resProf.json();
          if (resProf.ok && dataProf.status === 'success' && dataProf.data) {
            const cInfo = dataProf.data.creator || {};
            const pInfo = dataProf.data.profile || {};
            const bInfo = dataProf.data.bankAccount || {};
            const sLinks = dataProf.data.socialLinks || [];

            setProfileForm({
              fullName: cInfo.full_name || u.fullName || '',
              username: cInfo.username || u.username || '',
              bio: pInfo.bio || '',
              profileImage: cInfo.profile_image || u.profileImage || '',
              country: pInfo.country || 'India',
              accountHolderName: bInfo.account_holder_name || '',
              bankName: bInfo.bank_name || '',
              accountNumber: bInfo.account_number || '',
              ifscCode: bInfo.ifsc_code || '',
              upiId: bInfo.upi_id || '',
              youtubeUrl: sLinks.find(s => s.platform?.toLowerCase() === 'youtube')?.profile_url || '',
              twitchUrl: sLinks.find(s => s.platform?.toLowerCase() === 'twitch')?.profile_url || '',
            });
          }
        } catch (pErr) { }

        // Fetch Live Sessions
        const resSessions = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${creatorId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const dataSessions = await resSessions.json();
        if (dataSessions.status === 'success' && dataSessions.data?.sessions) {
          const allSess = dataSessions.data.sessions;
          setSessions(allSess);

          const active = allSess.find(s => s.status === 'active');
          if (active) {
            setActiveSession({
              ...active,
              paymentLink: active.paymentLink || `${window.location.origin}/pay/${active.sessionCode}?creatorId=${creatorId}&sessionId=${active.id}`,
              qrCodeUrl: active.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(active.paymentLink || `${window.location.origin}/pay/${active.sessionCode}`)}`,
              overlayUrl: active.overlayUrl || `${window.location.origin}/overlay/${u?.username || creatorId}?sessionCode=${active.sessionCode}`,
            });
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch data notice:', err.message);
      } finally {
        setIsAuthChecking(false);
      }
    };

    fetchData();

    // Socket.IO Real-time donation metrics updates
    const socket = getSocket();
    if (socket) {
      const handleNewDonationAlert = (data) => {
        if (data && data.amount) {
          const amount = parseFloat(data.amount);
          const netShare = amount * 0.85;
          setWalletMetrics(prev => ({
            ...prev,
            totalEarnings: prev.totalEarnings + netShare,
            availableBalance: prev.availableBalance + netShare,
            questionsAnsweredCount: prev.questionsAnsweredCount + 1,
          }));
        }
      };

      socket.on(`creator_notification_${u.id}`, handleNewDonationAlert);
      socket.on('new_donation_alert', handleNewDonationAlert);

      return () => {
        socket.off(`creator_notification_${u.id}`, handleNewDonationAlert);
        socket.off('new_donation_alert', handleNewDonationAlert);
      };
    }
  }, []);

  // Submit Live Session Creation Wizard
  const handleCreateSessionSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSubmittingSession(true);
      const token = getCreatorToken();
      const creatorId = creator?.id || 1;

      const payload = {
        creatorId,
        title: sessionForm.title || `Live Stream #${sessions.length + 1}`,
        category: sessionForm.category,
        description: sessionForm.description,
        streamingPlatform: sessionForm.streamingPlatform,
        streamUrl: sessionForm.streamUrl,
        durationHours: Number(sessionForm.durationHours) || 2,
        goalAmount: Number(sessionForm.goalAmount) || 5000,
        minDonation: Number(sessionForm.minDonation) || 10,
      };

      const res = await fetch(API_ENDPOINTS.CREATORS.LIVE_SESSIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data) {
        const sessData = data.data;
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const pLink = sessData.paymentLink || `${origin}/pay/${sessData.session.sessionCode}?creatorId=${creatorId}&sessionId=${sessData.session.id}`;
        const qrUrl = sessData.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pLink)}`;
        const oUrl = sessData.overlayUrl || `${origin}/overlay/${creator?.username || creatorId}?sessionCode=${sessData.session.sessionCode}`;

        const updatedSession = {
          ...sessData.session,
          paymentLink: pLink,
          qrCodeUrl: qrUrl,
          overlayUrl: oUrl,
        };

        setActiveSession(updatedSession);
        setCreatedSessionOutput(updatedSession);
        setSessions(prev => [updatedSession, ...prev.map(s => ({ ...s, status: 'closed' }))]);
        toast.success('Live donation session started! Unique QR Code and Overlay URL generated.', 'Session Launched!');
        setWizardStep(3);
      } else {
        toast.error(data.message || 'Failed to start live session', 'Error');
      }
    } catch (err) {
      toast.error('Network error starting live session', 'Error');
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      const token = getCreatorToken();
      await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}/${activeSession.id}/close`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setSessions(prev => prev.map(s => String(s.id) === String(activeSession.id) ? { ...s, status: 'closed' } : s));
      setActiveSession(null);
      toast.info('Live broadcast session closed successfully.', 'Session Ended');
    } catch (err) {
      setActiveSession(null);
      toast.info('Live broadcast session closed.', 'Session Ended');
    }
  };

  // Re-start closed session
  const handleReStartSession = async (targetSessionId) => {
    try {
      const token = getCreatorToken();
      const res = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}/${targetSessionId}/start`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const returnedSession = data.data?.session;
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const pLink = data.data?.paymentLink || `${origin}/pay/${returnedSession?.sessionCode}?creatorId=${creator?.id}&sessionId=${returnedSession?.id}`;
        const qrUrl = data.data?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pLink)}`;
        const oUrl = data.data?.overlayUrl || `${origin}/overlay/${creator?.username || creator?.id}?sessionCode=${returnedSession?.sessionCode}`;

        const activeObj = {
          ...returnedSession,
          status: 'active',
          paymentLink: pLink,
          qrCodeUrl: qrUrl,
          overlayUrl: oUrl,
        };
        setActiveSession(activeObj);
        setSessions(prev => prev.map(s => String(s.id) === String(targetSessionId) ? activeObj : { ...s, status: 'closed' }));
        toast.success(`Live session "${returnedSession?.title}" is NOW LIVE!`, 'Stream Live!');
        switchTab('active-session');
      }
    } catch (err) {
      toast.error('Failed to launch live session.', 'Error');
    }
  };

  // Handle Save Profile Settings
  const handleSaveProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const token = getCreatorToken();
      const payload = {
        creatorId: creator?.id || 1,
        fullName: profileForm.fullName,
        bio: profileForm.bio,
        country: profileForm.country,
        profileImage: profileForm.profileImage,
        socialLinks: [
          { platform: 'youtube', profile_url: profileForm.youtubeUrl },
          { platform: 'twitch', profile_url: profileForm.twitchUrl },
        ],
        paymentInfo: {
          accountHolderName: profileForm.accountHolderName,
          bankName: profileForm.bankName,
          accountNumber: profileForm.accountNumber,
          ifscCode: profileForm.ifscCode,
          upiId: profileForm.upiId,
        }
      };

      const res = await fetch(API_ENDPOINTS.CREATORS.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        toast.success('Creator Profile & Bank details saved successfully!', 'Saved!');
      } else {
        toast.error(data?.message || 'Failed to save profile', 'Error');
      }
    } catch (err) {
      toast.error('Network error saving profile', 'Error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const copyText = (text, title = 'Copied!') => {
    navigator.clipboard.writeText(text);
    toast.success(`${title} copied to clipboard!`, 'Copied!');
  };

  const copyOverlayUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopiedOverlay(true);
    toast.success('OBS Overlay URL copied to clipboard!', 'Copied!');
    setTimeout(() => setCopiedOverlay(false), 2500);
  };

  const copyPaymentLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedPayLink(true);
    toast.success('Unique Payment Link copied to clipboard!', 'Copied!');
    setTimeout(() => setCopiedPayLink(false), 2500);
  };

  if (isAuthChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20]' : 'bg-[#0A0A0F] text-white'
        }`}>
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold tracking-wider uppercase text-[#00F5D4]">Loading Creator Control Room...</p>
        </div>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const overlayUrl = activeSession?.overlayUrl || `${origin}/overlay/${creator?.username?.replace('@', '') || creator?.id || 'creator'}`;

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
      }`}>
      {/* 1. Creator Sidebar */}
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />

      {/* 2. Main Studio Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors duration-200 ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
              Creator Control Room
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>
              Live Broadcast Overlays, Paid Q&As, Session History & Profile Control
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${theme === 'light'
                ? 'bg-[#F1F3F5] text-[#212529] border-[#E9ECEF] hover:bg-[#E9ECEF]'
                : 'bg-[#1C1C26] text-white border-[#1C1C26] hover:border-[#00F5D4]/40'
                }`}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-[#FFD60A]" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#7B2FFF]" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <Link
              href="/creators/kyc"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${kycStatus === 'approved' || kycStatus === 'verified'
                ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 hover:bg-[#00E676]/20'
                : kycStatus === 'rejected'
                  ? 'bg-[#FF3D71]/10 text-[#FF3D71] border-[#FF3D71]/30 hover:bg-[#FF3D71]/20'
                  : 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/30 hover:bg-[#FFD60A]/20'
                }`}
            >
              <ShieldCheck className="h-4 w-4" /> KYC: <span className="capitalize">{kycStatus === 'approved' || kycStatus === 'verified' ? 'Approved' : kycStatus === 'rejected' ? 'Rejected' : 'Pending'}</span>
            </Link>

            <CreatorNotificationDropdown theme={theme} />
          </div>
        </header>



        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Active Session Callout Banner with QR & OBS Overlay Grid if Live */}
              {activeSession && (
                <div className={`p-6 rounded-3xl border-2 shadow-2xl space-y-6 glow-teal transition-colors ${theme === 'light' ? 'bg-white border-[#00F5D4]/60' : 'bg-[#13131A] border-[#00F5D4]/40'
                  }`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 border-[#1C1C26]">
                    <div className="flex items-center gap-3">
                      <div className="p-3.5 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 animate-pulse">
                        <Radio className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                            ● BROADCAST LIVE ACTIVE
                          </span>
                          {timeRemaining && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] text-[10px] font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3 animate-spin" /> Timer: {timeRemaining}
                            </span>
                          )}
                        </div>
                        <h3 className={`font-heading font-black text-2xl mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                          {activeSession.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href="/creators/active-session" className="px-4 py-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] font-bold text-xs shadow-md hover:scale-105 transition">
                        Manage Session
                      </Link>
                      <button onClick={handleEndSession} className="px-4 py-2 rounded-xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 font-bold text-xs hover:bg-[#FF3D71]/20 transition">
                        End Session
                      </button>
                    </div>
                  </div>

                  {/* Generated QR Code & OBS Overlay Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* QR & Payment Link */}
                    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                      <img src={activeSession.qrCodeUrl} alt="QR Code" className="h-24 w-24 rounded-xl bg-white p-1 shrink-0 border border-[#00F5D4]/40 shadow-md" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#00F5D4] uppercase">Instant UPI Payment Link & QR</span>
                        <p className="text-xs font-mono truncate">{activeSession.paymentLink}</p>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => copyPaymentLink(activeSession.paymentLink)} className="px-3 py-1.5 rounded-lg bg-[#00F5D4] text-[#0A0A0F] font-bold text-[11px] shadow-sm hover:scale-105 transition">
                            <Copy className="h-3.5 w-3.5 inline mr-1" /> Copy Link
                          </button>
                          <a href={activeSession.paymentLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-[#1C1C26] text-white text-[11px] border border-[#252533]">
                            Test Link <ExternalLink className="h-3.5 w-3.5 inline text-[#00F5D4]" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* OBS Overlay Source */}
                    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                      <div className="h-24 w-24 rounded-xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 flex flex-col items-center justify-center text-[#7B2FFF] shrink-0">
                        <Monitor className="h-7 w-7" />
                        <span className="text-[9px] font-black mt-1 uppercase">OBS SOURCE</span>
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#7B2FFF] uppercase">OBS Overlay Browser Source URL</span>
                        <p className="text-xs font-mono truncate text-[#7B2FFF]">{activeSession.overlayUrl}</p>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => copyOverlayUrl(activeSession.overlayUrl)} className="px-3 py-1.5 rounded-lg bg-[#7B2FFF] text-white font-bold text-[11px] shadow-sm hover:scale-105 transition">
                            <Copy className="h-3.5 w-3.5 inline mr-1" /> Copy Overlay
                          </button>
                          <a href={activeSession.overlayUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-[#1C1C26] text-white text-[11px] border border-[#252533]">
                            Preview <ExternalLink className="h-3.5 w-3.5 inline text-[#7B2FFF]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Welcome Banner */}
              <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-bold uppercase tracking-wider">
                      CREATOR CONTROL ROOM
                    </span>
                  </div>
                  <h2 className={`font-heading font-black text-2xl md:text-3xl tracking-tight mt-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    Welcome, <span className="text-brand-gradient">{creator?.fullName || 'Creator Host'}</span>
                  </h2>
                  <p className={`text-xs md:text-sm mt-1 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                    85% net revenue share enabled. Embed your stream overlay for paid viewer questions & instant UPI settlements.
                  </p>
                </div>

                <Link
                  href="/creators/start-live"
                  className="px-5 py-3 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-lg glow-teal hover:scale-105 transition-all flex items-center gap-2 shrink-0"
                >
                  <Radio className="h-5 w-5 stroke-[2.5]" /> Launch New Live Session
                </Link>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border space-y-2 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                  <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-[#00F5D4]" /> Total Net Earnings
                  </span>
                  <div className={`font-heading font-extrabold text-2xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    ₹{walletMetrics.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-[#00E676] font-semibold">85% Revenue Share active</span>
                </div>

                <div className={`p-5 rounded-2xl border space-y-2 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                  <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-[#FF3D71]" /> Questions Answered
                  </span>
                  <div className="font-heading font-extrabold text-2xl text-[#00F5D4]">{walletMetrics.questionsAnsweredCount} Paid Qs</div>
                  <span className="text-[11px] text-[#8B8B96]">Min Fee: ₹10</span>
                </div>

                <div className={`p-5 rounded-2xl border space-y-2 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                  <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-[#FFD60A]" /> Available Balance
                  </span>
                  <div className={`font-heading font-extrabold text-2xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    ₹{walletMetrics.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-[#8B8B96]">Min Withdrawal: ₹500</span>
                </div>

                <div className={`p-5 rounded-2xl border space-y-2 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                  <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#00F5D4]" /> KYC Verification
                  </span>
                  <div className="font-heading font-extrabold text-xl capitalize flex items-center gap-1.5">
                    {kycStatus === 'approved' && <span className="text-[#00E676] flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Approved</span>}
                    {kycStatus === 'rejected' && <span className="text-[#FF3D71] flex items-center gap-1"><XCircle className="h-4 w-4" /> Rejected</span>}
                    {(kycStatus === 'pending' || (kycStatus !== 'approved' && kycStatus !== 'rejected')) && (
                      <span className="text-[#FFD60A] flex items-center gap-1"><Clock className="h-4 w-4 animate-spin" /> Pending</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#8B8B96]">Payouts unlocked</span>
                </div>
              </div>

              {/* OBS Overlay Card */}
              <div className={`p-6 rounded-3xl border space-y-5 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 border-[#1C1C26]">
                  <div>
                    <h3 className={`font-heading font-black text-lg flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                      <Video className="h-5 w-5 text-[#00F5D4]" /> Live Stream OBS Overlay Widget
                    </h3>
                    <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                      Continuously displays QR code and real-time donation alerts on OBS Studio, Streamlabs, & vMix.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={copyOverlayUrl} className="px-4 py-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] text-xs font-bold shadow-md">
                      {copiedOverlay ? 'Copied Overlay URL!' : 'Copy OBS Browser Source URL'}
                    </button>
                    <a href={overlayUrl} target="_blank" rel="noopener noreferrer" className={`px-4 py-2 rounded-xl text-xs font-bold ${theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20]' : 'bg-[#1C1C26] text-white'}`}>
                      Test Overlay <ExternalLink className="h-3.5 w-3.5 text-[#00F5D4] inline ml-1" />
                    </a>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 font-mono text-xs ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                  <span className="text-[#00F5D4] truncate font-bold">{overlayUrl}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: START LIVE (4-Step Live Session Creation Wizard) */}
          {activeTab === 'start-live' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className={`p-6 rounded-3xl border shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                <div className="border-b pb-4 mb-6">
                  <h3 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    <Radio className="h-6 w-6 text-[#00F5D4]" /> Launch New Live Donation Session
                  </h3>
                  <p className="text-xs text-[#8B8B96] mt-1">Follow the 4-step workflow: Live Session → Donation Settings → Generate QR → Generate Overlay</p>
                </div>

                {/* Steps Visual Indicator */}
                <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs font-bold">
                  <div className={`p-2.5 rounded-xl border ${wizardStep === 1 ? 'bg-[#00F5D4] text-[#0A0A0F] border-[#00F5D4] font-black' : wizardStep > 1 ? 'border-[#00F5D4] text-[#00F5D4]' : 'border-[#1C1C26] text-[#8B8B96]'}`}>
                    1. Session Info
                  </div>
                  <div className={`p-2.5 rounded-xl border ${wizardStep === 2 ? 'bg-[#7B2FFF] text-white border-[#7B2FFF] font-black' : wizardStep > 2 ? 'border-[#7B2FFF] text-[#7B2FFF]' : 'border-[#1C1C26] text-[#8B8B96]'}`}>
                    2. Donation Settings
                  </div>
                  <div className={`p-2.5 rounded-xl border ${wizardStep === 3 ? 'bg-[#FFD60A] text-[#0A0A0F] border-[#FFD60A] font-black' : wizardStep > 3 ? 'border-[#FFD60A] text-[#FFD60A]' : 'border-[#1C1C26] text-[#8B8B96]'}`}>
                    3. Generate QR
                  </div>
                  <div className={`p-2.5 rounded-xl border ${wizardStep === 4 ? 'bg-[#00E676] text-[#0A0A0F] border-[#00E676] font-black' : 'border-[#1C1C26] text-[#8B8B96]'}`}>
                    4. Generate Overlay
                  </div>
                </div>

                {/* Step 1 Form */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Broadcast Title *</label>
                      <input
                        type="text"
                        value={sessionForm.title}
                        onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. BGMI Live Stream #5 - Paid Q&A & Support"
                        className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Category</label>
                        <select
                          value={sessionForm.category}
                          onChange={(e) => setSessionForm(prev => ({ ...prev, category: e.target.value }))}
                          className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                        >
                          <option value="Gaming & Esports">Gaming & Esports</option>
                          <option value="Tech & Coding">Tech & Coding</option>
                          <option value="Music & Art">Music & Art</option>
                          <option value="Just Chatting / Podcast">Just Chatting / Podcast</option>
                          <option value="Education / Q&A">Education / Q&A</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Streaming Platform</label>
                        <select
                          value={sessionForm.streamingPlatform}
                          onChange={(e) => setSessionForm(prev => ({ ...prev, streamingPlatform: e.target.value }))}
                          className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                        >
                          <option value="YouTube Live">YouTube Live</option>
                          <option value="Twitch">Twitch</option>
                          <option value="Kick">Kick Broadcast</option>
                          <option value="OBS Studio">OBS Studio / Custom RTMP</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Stream URL</label>
                        <input
                          type="url"
                          value={sessionForm.streamUrl}
                          onChange={(e) => setSessionForm(prev => ({ ...prev, streamUrl: e.target.value }))}
                          placeholder="https://youtube.com/live/your-broadcast-id"
                          className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Duration Limit (Hours)</label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={sessionForm.durationHours}
                          onChange={(e) => setSessionForm(prev => ({ ...prev, durationHours: e.target.value }))}
                          className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button onClick={() => setWizardStep(2)} disabled={!sessionForm.title.trim()} className="px-6 py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs flex items-center gap-1.5 shadow-md">
                        Next: Donation Settings <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 Form */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Target Goal Amount (₹)</label>
                        <input
                          type="number"
                          min={100}
                          value={sessionForm.goalAmount}
                          onChange={(e) => setSessionForm(prev => ({ ...prev, goalAmount: e.target.value }))}
                          placeholder="5000"
                          className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Minimum Donation Allowed (₹)</label>
                        <input
                          type="number"
                          min={1}
                          value={sessionForm.minDonation}
                          onChange={(e) => setSessionForm(prev => ({ ...prev, minDonation: e.target.value }))}
                          placeholder="10"
                          className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Viewer Prompt / Description</label>
                      <textarea
                        rows={3}
                        value={sessionForm.description}
                        onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
                        className={`w-full rounded-xl border p-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button onClick={() => setWizardStep(1)} className="px-4 py-2.5 rounded-xl border text-xs font-bold text-[#8B8B96]">
                        Back to Step 1
                      </button>
                      <button onClick={handleCreateSessionSubmit} disabled={isSubmittingSession} className="px-6 py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs flex items-center gap-2 shadow-md glow-teal">
                        {isSubmittingSession ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Launch Session & Generate Output
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: QR Code */}
                {wizardStep === 3 && createdSessionOutput && (
                  <div className="space-y-4 text-center">
                    <div className="p-4 rounded-2xl bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Step 3: Unique Instant UPI QR Code Generated!
                    </div>

                    <div className="p-6 rounded-3xl bg-white text-[#0A0A0F] inline-block shadow-2xl border-2 border-[#00F5D4]">
                      <img src={createdSessionOutput.qrCodeUrl} alt="Generated QR" className="h-48 w-48 mx-auto rounded-xl" />
                      <p className="text-xs font-black mt-2 font-mono">{createdSessionOutput.paymentLink}</p>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => copyText(createdSessionOutput.paymentLink, 'Payment Link')} className="px-4 py-2.5 rounded-xl bg-[#00F5D4] text-[#0A0A0F] font-bold text-xs">
                        <Copy className="h-4 w-4 inline mr-1" /> Copy Payment Link
                      </button>
                      <button onClick={() => setWizardStep(4)} className="px-6 py-2.5 rounded-xl bg-[#7B2FFF] text-white font-bold text-xs">
                        Next: Generate OBS Overlay <ArrowRight className="h-4 w-4 inline ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: OBS Overlay */}
                {wizardStep === 4 && createdSessionOutput && (
                  <div className="space-y-4 text-center">
                    <div className="p-4 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Step 4: Unique OBS Overlay Generated!
                    </div>

                    <div className={`p-4 rounded-2xl border text-left font-mono text-xs ${theme === 'light' ? 'bg-[#F8F9FA]' : 'bg-[#0A0A0F]'}`}>
                      <span className="text-[10px] text-[#7B2FFF] uppercase font-bold block">OBS Browser Source URL</span>
                      <p className="text-[#00F5D4] font-bold break-all">{createdSessionOutput.overlayUrl}</p>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => copyText(createdSessionOutput.overlayUrl, 'OBS Overlay URL')} className="px-5 py-2.5 rounded-xl bg-[#7B2FFF] text-white font-bold text-xs">
                        <Copy className="h-4 w-4 inline mr-1" /> Copy Overlay URL
                      </button>
                      <a href={createdSessionOutput.overlayUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl bg-[#00F5D4] text-[#0A0A0F] font-bold text-xs">
                        Preview Overlay Widget <ExternalLink className="h-4 w-4 inline ml-1" />
                      </a>
                    </div>

                    <div className="pt-4">
                      <button onClick={() => switchTab('active-session')} className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md">
                        Go to Active Session Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE SESSION */}
          {activeTab === 'active-session' && (
            <div className="space-y-6 animate-fade-in">
              {activeSession ? (
                <div className={`p-6 rounded-3xl border space-y-6 shadow-2xl glow-teal ${theme === 'light' ? 'bg-white border-[#00F5D4]/60' : 'bg-[#13131A] border-[#00F5D4]/40'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-[#1C1C26]">
                    <div className="flex items-center gap-3">
                      <div className="p-3.5 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 animate-pulse">
                        <Radio className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                            ● BROADCAST LIVE ACTIVE
                          </span>
                          {timeRemaining && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] text-[10px] font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3 animate-spin" /> Timer: {timeRemaining}
                            </span>
                          )}
                        </div>
                        <h3 className={`font-heading font-black text-2xl mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                          {activeSession.title}
                        </h3>
                        <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                          {activeSession.description}
                        </p>
                      </div>
                    </div>

                    <button onClick={handleEndSession} className="px-5 py-2.5 rounded-xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 hover:bg-[#FF3D71]/20 font-bold text-xs flex items-center gap-1.5 shrink-0">
                      <StopCircle className="h-4 w-4" /> End Live Session
                    </button>
                  </div>

                  {/* Active Outputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* QR & Payment Link */}
                    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                      <img src={activeSession.qrCodeUrl} alt="QR Code" className="h-20 w-20 rounded-xl bg-white p-1 shrink-0 border border-[#00F5D4]/40" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#00F5D4] uppercase">Viewer Payment Link & QR</span>
                        <p className="text-xs font-mono truncate">{activeSession.paymentLink}</p>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => copyText(activeSession.paymentLink, 'Payment Link')} className="px-2.5 py-1 rounded-lg bg-[#00F5D4] text-[#0A0A0F] font-bold text-[11px]">
                            <Copy className="h-3 w-3 inline mr-1" /> Copy Link
                          </button>
                          <a href={activeSession.paymentLink} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-[#1C1C26] text-white text-[11px]">
                            Test Link <ExternalLink className="h-3 w-3 inline text-[#00F5D4]" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* OBS Overlay */}
                    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                      <div className="h-20 w-20 rounded-xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 flex flex-col items-center justify-center text-[#7B2FFF] shrink-0">
                        <Monitor className="h-7 w-7" />
                        <span className="text-[8px] font-black mt-1">OBS SOURCE</span>
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#7B2FFF] uppercase">OBS Overlay URL</span>
                        <p className="text-xs font-mono truncate text-[#7B2FFF]">{activeSession.overlayUrl || overlayUrl}</p>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => copyText(activeSession.overlayUrl || overlayUrl, 'OBS Overlay URL')} className="px-2.5 py-1 rounded-lg bg-[#7B2FFF] text-white font-bold text-[11px]">
                            <Copy className="h-3 w-3 inline mr-1" /> Copy Overlay
                          </button>
                          <a href={activeSession.overlayUrl || overlayUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-[#1C1C26] text-white text-[11px]">
                            Test Overlay <ExternalLink className="h-3 w-3 inline text-[#7B2FFF]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-12 rounded-3xl border text-center space-y-4 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                  <Radio className="h-12 w-12 text-[#8B8B96] mx-auto stroke-1" />
                  <h4 className={`font-bold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>No Active Broadcast Session</h4>
                  <p className="text-xs text-[#8B8B96] max-w-md mx-auto">Launch a new session to generate unique payment links, QR codes, and OBS stream overlays.</p>
                  <button onClick={() => switchTab('start-live')} className="px-6 py-3 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal">
                    + Launch Live Session Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SESSION HISTORY */}
          {activeTab === 'session-history' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className={`font-heading font-bold text-lg flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                <History className="h-5 w-5 text-[#00F5D4]" /> All Created Live Donation Sessions ({sessions.length})
              </h3>

              {sessions.length === 0 ? (
                <div className={`p-12 rounded-3xl border text-center text-xs text-[#8B8B96] ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                  No session history found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sessions.map(s => (
                    <div key={s.id} className={`p-5 rounded-3xl border space-y-4 shadow-xl ${s.status === 'active' ? 'border-[#00F5D4]/60 glow-teal' : ''} ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-[#1C1C26]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${s.status === 'active' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-[#1C1C26] text-[#8B8B96]'}`}>
                              {s.status === 'active' ? '● LIVE ACTIVE' : 'CLOSED'}
                            </span>
                            <span className="text-xs text-[#8B8B96]">[{s.category || 'General'}]</span>
                          </div>
                          <h4 className={`font-heading font-bold text-base mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>{s.title}</h4>
                        </div>

                        {s.status !== 'active' && (
                          <button onClick={() => handleReStartSession(s.id)} className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md">
                            Re-launch Session
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] truncate">
                          <span className="text-[10px] text-[#8B8B96] block font-sans">Payment URL:</span>
                          {s.paymentLink}
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] truncate">
                          <span className="text-[10px] text-[#7B2FFF] block font-sans">OBS Overlay URL:</span>
                          {s.overlayUrl || `${origin}/overlay/${creator?.username || creator?.id}?sessionCode=${s.sessionCode}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-6 rounded-3xl border space-y-4 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                <h3 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                  <BarChart3 className="h-6 w-6 text-[#00F5D4]" /> Creator Revenue & Donation Analytics
                </h3>
                <p className="text-xs text-[#8B8B96]">Track revenue performance, answered viewer Q&As, and settlement payouts.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                    <span className="text-xs text-[#8B8B96] block">Gross Volume</span>
                    <span className="text-2xl font-black text-white">₹{(walletMetrics.totalEarnings / 0.85 || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                    <span className="text-xs text-[#8B8B96] block">Platform Fee (15%)</span>
                    <span className="text-2xl font-black text-[#FF3D71]">₹{(walletMetrics.totalEarnings / 0.85 * 0.15 || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                    <span className="text-xs text-[#8B8B96] block">Creator Net Earnings (85%)</span>
                    <span className="text-2xl font-black text-[#00E676]">₹{walletMetrics.totalEarnings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE SETTINGS */}
          {activeTab === 'profile-settings' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <form onSubmit={handleSaveProfileSubmit} className={`p-6 rounded-3xl border space-y-6 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                <div className="border-b pb-4">
                  <h3 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    <Settings className="h-6 w-6 text-[#00F5D4]" /> Creator Profile & Bank Settings
                  </h3>
                  <p className="text-xs text-[#8B8B96]">Update bio, display details, social handles, and payout bank account information.</p>
                </div>

                {/* Profile Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00F5D4]">1. Public Creator Profile</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Username Handle</label>
                      <input
                        type="text"
                        value={profileForm.username}
                        disabled
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs opacity-70 ${theme === 'light' ? 'bg-[#E9ECEF] border-[#DEE2E6]' : 'bg-[#1C1C26] border-[#252533]'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Creator Bio</label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      className={`w-full rounded-xl border p-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                    />
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-4 border-t pt-4 border-[#1C1C26]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFD60A]">2. Settlement Bank & UPI Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Account Holder Name</label>
                      <input
                        type="text"
                        value={profileForm.accountHolderName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Bank Name</label>
                      <input
                        type="text"
                        value={profileForm.bankName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, bankName: e.target.value }))}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">Account Number</label>
                      <input
                        type="text"
                        value={profileForm.accountNumber}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">IFSC Code</label>
                      <input
                        type="text"
                        value={profileForm.ifscCode}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, ifscCode: e.target.value }))}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">UPI ID</label>
                      <input
                        type="text"
                        value={profileForm.upiId}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, upiId: e.target.value }))}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isSavingProfile} className="px-6 py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs flex items-center gap-2 shadow-md glow-teal">
                    {isSavingProfile ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Profile & Bank Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CreatorDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">Loading Dashboard...</div>}>
      <CreatorDashboardContent />
    </Suspense>
  );
}
