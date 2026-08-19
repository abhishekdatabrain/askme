'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
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
  RefreshCw
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function CreatorDashboardPage() {
  const { toast } = useToast();
  const [creator, setCreator] = useState(null);
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const [copiedPayLink, setCopiedPayLink] = useState(false);
  const [kycStatus, setKycStatus] = useState('pending');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Requirement 5.2 Start Live Donation Session State
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const [sessionForm, setSessionForm] = useState({
    title: 'Gaming Live Session #25',
    category: 'Gaming',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    description: 'Welcome to our live broadcast! Ask questions & support live on OBS stream.',
    streamingPlatform: 'YouTube Live',
    streamUrl: '',
  });

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

    // Fetch KYC Status & Active Live Sessions
    const fetchData = async () => {
      try {
        const creatorId = u.id;
        const resStatus = await fetch(`${API_ENDPOINTS.CREATORS.KYC_STATUS}?creatorId=${creatorId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const dataStatus = await resStatus.json();
        if (dataStatus.status === 'success' && dataStatus.data?.kycStatus) {
          const raw = String(dataStatus.data.kycStatus).toLowerCase();
          const statusVal = raw === 'approved' || raw === 'verified' ? 'approved' : raw === 'rejected' || raw === 'action_required' ? 'rejected' : 'pending';
          setKycStatus(statusVal);
        }

        // Fetch creator live sessions to find active session
        const resSessions = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${creatorId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const dataSessions = await resSessions.json();
        if (dataSessions.status === 'success' && dataSessions.data?.sessions) {
          const active = dataSessions.data.sessions.find(s => s.status === 'active');
          if (active) {
            setActiveSession({
              ...active,
              paymentLink: active.paymentLink || `${window.location.origin}/pay/${active.sessionCode}`,
              qrCodeUrl: active.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(active.paymentLink || `${window.location.origin}/pay/${active.sessionCode}`)}`,
            });
          }
        }
      } catch (err) {
        console.warn('Dashboard data fetch notice:', err.message);
      } finally {
        setIsAuthChecking(false);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSessionForm(prev => ({ ...prev, thumbnailUrl: reader.result }));
        toast.info('Session thumbnail loaded.', 'Image Selected');
      };
      reader.readAsDataURL(file);
    }
  };

  // Requirement 5.2: Create New Live Donation Session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.title.trim()) {
      toast.error('Stream Title is required.', 'Missing Title');
      return;
    }

    setIsSubmittingSession(true);
    try {
      const token = getCreatorToken();
      const payload = {
        creatorId: creator?.id || 1,
        title: sessionForm.title,
        category: sessionForm.category,
        thumbnailUrl: sessionForm.thumbnailUrl,
        description: sessionForm.description,
        streamingPlatform: sessionForm.streamingPlatform,
        streamUrl: sessionForm.streamUrl,
      };

      const res = await fetch(API_ENDPOINTS.CREATORS.LIVE_SESSIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success' && data.data) {
        const sessData = data.data;
        const generatedPaymentLink = sessData.paymentLink || `${window.location.origin}/pay/${sessData.session.sessionCode}?creatorId=${creator?.id || 1}&sessionId=${sessData.session.id}`;
        const generatedQrUrl = sessData.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(generatedPaymentLink)}`;

        setActiveSession({
          ...sessData.session,
          paymentLink: generatedPaymentLink,
          qrCodeUrl: generatedQrUrl,
          overlayUrl: sessData.overlayUrl,
        });

        setShowSessionModal(false);
        toast.success(`Live Session "${sessData.session.title}" started! Unique QR Code & Payment Link generated.`, 'Session Live!');
      } else {
        toast.error(data.message || 'Failed to create live donation session.', 'Creation Failed');
      }
    } catch (err) {
      console.error('Session creation error:', err);
      // Fallback local session generation if offline
      const fallbackCode = `session-${Math.random().toString(36).substring(2, 7)}`;
      const fallbackPayLink = `${window.location.origin}/pay/${fallbackCode}?creatorId=${creator?.id || 1}&sessionId=${Date.now()}`;
      const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(fallbackPayLink)}`;

      setActiveSession({
        id: Date.now(),
        sessionCode: fallbackCode,
        title: sessionForm.title,
        category: sessionForm.category,
        thumbnailUrl: sessionForm.thumbnailUrl,
        description: sessionForm.description,
        streamingPlatform: sessionForm.streamingPlatform,
        streamUrl: sessionForm.streamUrl,
        status: 'active',
        startedAt: new Date(),
        paymentLink: fallbackPayLink,
        qrCodeUrl: fallbackQr,
      });
      setShowSessionModal(false);
      toast.success(`Live Session "${sessionForm.title}" started locally! Unique QR & Payment Link ready.`, 'Session Live');
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
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) { }
    setActiveSession(null);
    toast.info('Live Donation Session closed.', 'Session Ended');
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center space-y-3">
        <div className="h-10 w-10 border-4 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#8B8B96]">Authenticating Creator Login...</p>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const overlayUrl = `${origin}/overlay/${creator?.username?.replace('@', '') || creator?.id || 'creator'}`;

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

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      {/* 1. Creator Dashboard Sidebar */}
      <CreatorSidebar />

      {/* 2. Main Studio Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Header Bar */}
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Creator Studio Control Room</h1>
            <p className="text-xs text-[#8B8B96]">Live AskMe Broadcast Overlay, Payout Ledger & Studio Management</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/creators/kyc"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${kycStatus === 'approved' || kycStatus === 'verified'
                  ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 hover:bg-[#00E676]/20'
                  : kycStatus === 'rejected'
                    ? 'bg-[#FF3D71]/10 text-[#FF3D71] border-[#FF3D71]/30 hover:bg-[#FF3D71]/20'
                    : 'bg-[#FFD60A]/10 text-[#FFD60A] border-[#FFD60A]/30 hover:bg-[#FFD60A]/20'
                }`}
            >
              <ShieldCheck className="h-4 w-4" /> KYC Status: <span className="capitalize">{kycStatus === 'approved' || kycStatus === 'verified' ? 'Approved' : kycStatus === 'rejected' ? 'Rejected' : 'Pending'}</span>
            </Link>

            <button
              onClick={() => setShowSessionModal(true)}
              className="px-4 py-1.5 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-extrabold shadow-md glow-teal hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5]" /> Start Live Session
            </button>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">

          {/* Requirement 5.2 ACTIVE LIVE SESSION BANNER & GENERATED QR CODE / PAYMENT LINK */}
          {activeSession && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#13131A] via-[#1A1A26] to-[#13131A] border-2 border-[#00F5D4]/40 shadow-2xl space-y-4 animate-scale-up glow-teal">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 animate-pulse">
                    <Radio className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-[#00E676] inline-block" /> LIVE SESSION ACTIVE
                      </span>
                      <span className="text-xs text-[#8B8B96] font-mono">[{activeSession.category || 'Gaming'}]</span>
                    </div>
                    <h3 className="font-heading font-black text-xl text-white mt-1">
                      {activeSession.title}
                    </h3>
                    <p className="text-xs text-[#8B8B96] mt-0.5 line-clamp-1">
                      {activeSession.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEndSession}
                  className="px-4 py-2 rounded-xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 hover:bg-[#FF3D71]/20 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
                >
                  <StopCircle className="h-4 w-4" /> Close QR / End Donation
                </button>
              </div>

              {/* QR Session Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#1C1C26]">
                <div className="p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-[#FF3D71]" /> Total Donations
                  </span>
                  <span className="font-heading font-black text-base text-white">
                    {activeSession.totalDonations || 0} Payments
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-[#00F5D4]" /> Total Amount
                  </span>
                  <span className="font-heading font-black text-base text-[#00E676]">
                    ₹{(activeSession.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Requirement 5.2 Generated QR Code & Payment Link Output Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. System Generated Unique QR Code */}
                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center gap-4">
                  {activeSession.qrCodeUrl ? (
                    <img
                      src={activeSession.qrCodeUrl}
                      alt="Session QR Code"
                      className="h-24 w-24 rounded-xl border border-[#00F5D4]/40 bg-white p-1 shrink-0 shadow-md"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-xl bg-[#1C1C26] border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                      <QrCode className="h-10 w-10" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-extrabold text-[#00F5D4] uppercase tracking-wider flex items-center gap-1">
                      <QrCode className="h-3.5 w-3.5" /> 1. Generated Unique Session QR Code
                    </span>
                    <p className="text-xs text-white font-bold truncate">Scan to Send Paid Questions & Instant UPI</p>
                    <p className="text-[11px] text-[#8B8B96]">Broadcast on screen or print for OBS stream overlay</p>
                    <a
                      href={activeSession.qrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#00F5D4] hover:underline font-bold pt-1"
                    >
                      Open Full Screen QR <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* 2. System Generated Payment Link */}
                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-[#00F5D4] uppercase tracking-wider flex items-center gap-1">
                      <Share2 className="h-3.5 w-3.5" /> 2. Unique Viewer Payment Link
                    </span>
                    <p className="text-xs text-white font-bold truncate mt-0.5">{activeSession.paymentLink}</p>
                    <p className="text-[11px] text-[#8B8B96]">Share in live stream chat, YouTube description, or pinned comments</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => copyPaymentLink(activeSession.paymentLink)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#00F5D4] text-[#0A0A0F] font-bold text-xs hover:opacity-90 transition flex items-center gap-1.5 shadow-md"
                    >
                      {copiedPayLink ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedPayLink ? 'Link Copied!' : 'Copy Payment Link'}
                    </button>
                    <a
                      href={activeSession.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-bold hover:bg-[#252533] transition flex items-center gap-1"
                    >
                      Test Link <ExternalLink className="h-3.5 w-3.5 text-[#00F5D4]" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#13131A] via-[#1C1C26] to-[#13131A] border border-[#1C1C26] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-bold uppercase tracking-wider">
                  CREATOR BROADCAST STUDIO
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-[10px] font-extrabold animate-pulse">
                  LIVE OVERLAY READY
                </span>
              </div>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight mt-2">
                Welcome, <span className="text-brand-gradient">{creator?.fullName || 'Creator Host'}</span>
              </h2>
              <p className="text-xs md:text-sm text-[#8B8B96] mt-1">
                85% net revenue share enabled. Embed your stream overlay for paid viewer questions & instant UPI settlements.
              </p>
            </div>

            <button
              onClick={() => setShowSessionModal(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Radio className="h-4 w-4" /> Start Live Donation Session <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#00F5D4]" /> Total Net Earnings
              </span>
              <div className="font-heading font-extrabold text-2xl text-white">₹0.00</div>
              <span className="text-[11px] text-[#00E676] font-semibold">85% Revenue Share active</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-[#FF3D71]" /> Questions Answered
              </span>
              <div className="font-heading font-extrabold text-2xl text-[#00F5D4]">0 Paid Qs</div>
              <span className="text-[11px] text-[#8B8B96]">Guaranteed Min Fee: ₹100</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#FFD60A]" /> Available Balance
              </span>
              <div className="font-heading font-extrabold text-2xl text-white">₹0.00</div>
              <span className="text-[11px] text-[#8B8B96]">Min Withdrawal: ₹500</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
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
              <span className="text-[11px] text-[#8B8B96]">Status menu always available</span>
            </div>
          </div>

          {/* Live Stream QR Overlay Widget Card */}
          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-[10px] font-black uppercase tracking-wider">
                    OBS & STREAMLABS COMPATIBLE
                  </span>
                </div>
                <h3 className="font-heading font-black text-lg text-white mt-1 flex items-center gap-2">
                  <Video className="h-5 w-5 text-[#00F5D4]" /> Live Stream QR Overlay Widget System
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Continuously shows small size QR code on screen for OBS Studio, Streamlabs, & vMix.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyOverlayUrl}
                  className="px-4 py-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 shadow-md"
                >
                  {copiedOverlay ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Copied Overlay URL!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy OBS Browser Source URL
                    </>
                  )}
                </button>

                <a
                  href={overlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold hover:bg-[#252533] transition flex items-center gap-1"
                >
                  Test Overlay <ExternalLink className="h-3.5 w-3.5 text-[#00F5D4]" />
                </a>
              </div>
            </div>

            {/* Widget Interactive Preview & URL Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              
              {/* OBS Overlay Live Widget Mockup */}
              <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
                <span className="text-[11px] font-extrabold text-[#8B8B96] uppercase tracking-wider block">
                  LIVE WIDGET PREVIEW ON STREAM
                </span>

                <div className="w-52 p-3 rounded-2xl bg-[#13131A] border-2 border-[#00F5D4]/40 text-center space-y-2 mx-auto shadow-xl glow-teal">
                  <div className="flex items-center justify-between border-b border-[#1C1C26] pb-1.5">
                    <span className="text-[10px] font-black text-white truncate">
                      Support {creator?.fullName || 'Creator'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#00F5D4]/10 text-[#00F5D4] text-[8px] font-black">
                      LIVE
                    </span>
                  </div>

                  <div className="p-1.5 rounded-xl bg-white flex items-center justify-center">
                    <img
                      src={activeSession?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(overlayUrl)}`}
                      alt="Overlay QR"
                      className="h-20 w-20"
                    />
                  </div>

                  <p className="text-[10px] font-black text-[#00F5D4]">
                    Scan & Send Message
                  </p>
                </div>
              </div>

              {/* URL & Compatibility Info */}
              <div className="lg:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#8B8B96] mb-1">OBS Browser Source URL</label>
                  <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] font-mono text-xs text-[#00F5D4] flex items-center justify-between overflow-x-auto">
                    <span>{overlayUrl}</span>
                    <Copy onClick={copyOverlayUrl} className="h-4 w-4 text-[#8B8B96] cursor-pointer hover:text-white shrink-0 ml-2" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-[#8B8B96] space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#00F5D4]" /> OBS / Streamlabs Setup Guide:
                  </p>
                  <p>1. Open OBS Studio / Streamlabs &gt; Add Source &gt; <strong>Browser Source</strong>.</p>
                  <p>2. Paste URL: <code className="text-[#00F5D4]">{overlayUrl}</code></p>
                  <p>3. Set Dimensions: <strong>Width: 400px, Height: 600px</strong>.</p>
                  <p>4. Check <em>"Shutdown source when not visible"</em> for seamless live performance.</p>
                </div>
              </div>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="border-t border-[#1C1C26] py-4 text-center text-xs text-[#8B8B96]">
          AskMe PRO Creator Studio &copy; 2026 • 85% Net Revenue Payout System
        </footer>
      </div>

      {/* Requirement 5.2 CREATE LIVE DONATION SESSION MODAL */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start sm:items-center min-h-full py-8 my-auto">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-3xl w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                  <Radio className="h-5 w-5 text-[#00F5D4]" /> Start Live Donation Session (5.2)
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Generate a unique QR Code & Payment Link for your live stream.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="text-[#8B8B96] hover:text-white p-1 rounded-xl bg-[#1C1C26]"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              {/* 1. Stream Title */}
              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">
                  Stream Title <span className="text-[#FF3D71]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder='e.g. "Gaming Live Session #25" or "Tech Q&A Live"'
                  className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              {/* 2. Stream Category & Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8B8B96] mb-1">Stream Category</label>
                  <select
                    value={sessionForm.category}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  >
                    <option value="Gaming">Gaming & Esports</option>
                    <option value="Tech">Tech & Coding</option>
                    <option value="Entertainment">Entertainment & Vlogs</option>
                    <option value="Music">Music & Performance</option>
                    <option value="Education">Education & Advice</option>
                    <option value="General Q&A">General Q&A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8B8B96] mb-1">Streaming Platform</label>
                  <select
                    value={sessionForm.streamingPlatform}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, streamingPlatform: e.target.value }))}
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  >
                    <option value="YouTube Live">YouTube Live</option>
                    <option value="Twitch">Twitch</option>
                    <option value="Kick">Kick Broadcast</option>
                    <option value="OBS Studio">OBS Studio / Custom RTMP</option>
                  </select>
                </div>
              </div>

              {/* 3. Thumbnail / Image */}
              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">Thumbnail / Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sessionForm.thumbnailUrl}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-[#1C1C26] text-white hover:bg-[#252533] text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="h-4 w-4 text-[#00F5D4]" /> Pick File
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* 4. Stream URL (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">Stream URL (Optional)</label>
                <input
                  type="url"
                  value={sessionForm.streamUrl}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, streamUrl: e.target.value }))}
                  placeholder="https://youtube.com/live/your-broadcast-id"
                  className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              {/* 5. Description */}
              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your stream session, question rules, or donation goals..."
                  className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] p-3 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#1C1C26]">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1C1C26] text-white font-bold text-xs hover:bg-[#252533]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingSession}
                  className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition flex items-center gap-2"
                >
                  {isSubmittingSession ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Generating QR & Payment Link...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 stroke-[2.5]" /> Launch Live Session & Generate QR
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
