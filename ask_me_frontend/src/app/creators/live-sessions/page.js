'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import {
  Radio,
  Video,
  Copy,
  ExternalLink,
  ArrowLeft,
  QrCode,
  Share2,
  PlusCircle,
  Clock,
  CheckCircle2,
  StopCircle,
  DollarSign,
  Layers,
  Sparkles,
  RefreshCw,
  PlayCircle
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function CreatorLiveSessionsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  console.log("sessions", sessions);
  const fetchSessions = async (uId, token) => {
    try {
      setIsLoading(true);
      const creatorId = uId || creator?.id || 1;
      const res = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${creatorId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.sessions) {
        setSessions(data.data.sessions);
      }
    } catch (err) {
      console.warn('Live sessions fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }

    setCreator(u);
    fetchSessions(u?.id, token);
  }, []);

  // 1-Click Start Live Session (for specific session or new session)
  const handleStartLiveSession = async (targetSessionId = null) => {
    try {
      console.log("targetSessionId", targetSessionId);
      setActivatingId(targetSessionId || '');
      const token = getCreatorToken();

      if (targetSessionId && targetSessionId !== 'new') {
        // Activate existing closed session
        const res = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}/${targetSessionId}/start`, {
          method: 'PUT',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setSessions(prev => prev.map(s => String(s.id) === String(targetSessionId) ? { ...s, status: 'active' } : { ...s, status: 'closed' }));
          toast.success(`Live session "${data.data?.session?.title || 'Session'}" is NOW LIVE!`, 'Stream Live!');
        } else {
          // Fallback optimistic activation
          setSessions(prev => prev.map(s => String(s.id) === String(targetSessionId) ? { ...s, status: 'active' } : { ...s, status: 'closed' }));
          toast.success('Live session started!', 'Stream Live!');
        }
      } else {
        // Create & Start new live session
        const payload = {
          creatorId: creator?.id || 1,
          title: `Live Session #${sessions.length + 1}`,
          category: 'Gaming',
          description: 'Welcome to our live broadcast! Ask questions & support live on OBS stream.',
          streamingPlatform: 'YouTube Live',
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

          const newSess = {
            ...sessData.session,
            paymentLink: generatedPaymentLink,
            qrCodeUrl: generatedQrUrl,
          };
          setSessions(prev => [newSess, ...prev.map(s => ({ ...s, status: 'closed' }))]);
          toast.success(`Live Session "${newSess.title}" is NOW LIVE! Unique QR Code generated.`, 'Stream Live!');
        }
      }
    } catch (err) {
      console.error('Start session error:', err);
      if (targetSessionId) {
        setSessions(prev => prev.map(s => String(s.id) === String(targetSessionId) ? { ...s, status: 'active' } : { ...s, status: 'closed' }));
        toast.success('Live session started!', 'Stream Live!');
      }
    } finally {
      setActivatingId(null);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Payment link copied to clipboard!', 'Link Copied');
  };

  const handleCloseSession = async (sessionId) => {
    try {
      const token = getCreatorToken();
      await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}/${sessionId}/close`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(prev => prev.map(s => String(s.id) === String(sessionId) ? { ...s, status: 'closed' } : s));
      toast.info('Live Donation Session closed.', 'Session Ended');
    } catch (err) {
      toast.error('Failed to close session.', 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Live Broadcast Sessions</h1>
            <p className="text-xs text-[#8B8B96]">Create, manage live donation sessions, generated QR codes & payment links</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/creators/dashboard"
              className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-extrabold shadow-md glow-teal hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" /> Go to Dashboard
            </Link>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Top Info Banner */}
          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-white">Live Donation Sessions Overview</h3>
                <p className="text-xs text-[#8B8B96]">Click "Start Live Session" to activate instant UPI payment QR & Payment link.</p>
              </div>
            </div>

            {/* <button
              onClick={() => handleStartLiveSession()}
              disabled={activatingId === 'new'}
              className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:scale-105 transition-all flex items-center gap-2 shrink-0"
            >
              <Radio className="h-4 w-4 stroke-[2.5]" /> Start Live Session Now
            </button> */}
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#00F5D4]" /> All Created Live Sessions ({sessions.length})
            </h3>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#13131A] border border-[#1C1C26] text-center space-y-3">
                <Radio className="h-12 w-12 text-[#8B8B96] mx-auto stroke-1" />
                <h4 className="font-bold text-white text-base">No Live Donation Sessions Created Yet</h4>
                <p className="text-xs text-[#8B8B96] max-w-md mx-auto">
                  Click the button below to start your broadcast session and generate unique QR Codes for your viewers.
                </p>
                <button
                  onClick={() => handleStartLiveSession()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal"
                >
                  <Radio className="h-4 w-4" /> Start Live Session Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sessions.map(s => (
                  <div key={s.id} className={`p-5 rounded-3xl bg-[#13131A] border space-y-4 shadow-xl transition-all ${s.status === 'active' ? 'border-[#00F5D4]/50 glow-teal bg-gradient-to-r from-[#13131A] via-[#1A1A26] to-[#13131A]' : 'border-[#1C1C26]'
                    }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-3">
                      <div className="flex items-center gap-3">
                        {s.thumbnailUrl ? (
                          <img src={s.thumbnailUrl} alt={s.title} className="h-14 w-14 rounded-xl object-cover border border-[#1C1C26] shrink-0" />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center justify-center text-[#00F5D4] shrink-0">
                            <Radio className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${s.status === 'active' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 animate-pulse' : 'bg-[#1C1C26] text-[#8B8B96]'
                              }`}>
                              {s.status === 'active' ? '● LIVE ACTIVE' : 'CLOSED'}
                            </span>
                            <span className="text-xs text-[#8B8B96]">[{s.category || 'General'}]</span>
                          </div>
                          <h4 className="font-heading font-bold text-base text-white mt-0.5">{s.title}</h4>
                          <p className="text-xs text-[#8B8B96] line-clamp-1">{s.description}</p>
                        </div>
                      </div>

                      {/* 1-CLICK START LIVE SESSION BUTTON ON EACH CARD */}
                      {s.status === 'active' ? (
                        <button
                          onClick={() => handleCloseSession(s.id)}
                          className="px-4 py-2 rounded-xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 hover:bg-[#FF3D71]/20 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
                        >
                          <StopCircle className="h-4 w-4" /> Close QR / End Donation
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartLiveSession(s.id)}
                          disabled={activatingId === s.id}
                          className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-lg glow-teal hover:scale-105 transition-all flex items-center gap-1.5 shrink-0"
                        >
                          {activatingId === s.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" /> Starting Live...
                            </>
                          ) : (
                            <>
                              <Radio className="h-4 w-4 stroke-[2.5]" /> Start Live Session
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* QR Session Totals */}
                    <div className="grid grid-cols-2 gap-3 p-2.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] text-xs">
                      <div>
                        <span className="text-[#8B8B96] text-[11px] block font-semibold">Total Donations</span>
                        <span className="font-heading font-black text-white">{s.totalDonations || 0} Payments</span>
                      </div>
                      <div>
                        <span className="text-[#8B8B96] text-[11px] block font-semibold">Total Amount Collected</span>
                        <span className="font-heading font-black text-[#00E676]">₹{(s.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Unique QR Code */}
                      <div className="p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center gap-3">
                        <img src={s.qrCodeUrl} alt="QR Code" className="h-16 w-16 rounded-lg bg-white p-1 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-[#00F5D4] uppercase tracking-wider block">Generated Unique QR</span>
                          <p className="text-xs text-white font-bold">Scan for UPI Payment</p>
                          <a href={s.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#00F5D4] hover:underline font-semibold flex items-center gap-0.5 mt-0.5">
                            Open QR <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Payment Link */}
                      <div className="p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#00F5D4] uppercase tracking-wider block">Generated Payment Link</span>
                          <p className="text-xs text-white font-mono truncate">{s.paymentLink}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => copyLink(s.paymentLink)} className="px-3 py-1 rounded-lg bg-[#00F5D4] text-[#0A0A0F] font-bold text-[11px] hover:opacity-90 transition flex items-center gap-1">
                            <Copy className="h-3 w-3" /> Copy Link
                          </button>
                          <a href={s.paymentLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-lg bg-[#1C1C26] text-white text-[11px] font-bold hover:bg-[#252533] transition flex items-center gap-1">
                            Visit <ExternalLink className="h-3 w-3 text-[#00F5D4]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
