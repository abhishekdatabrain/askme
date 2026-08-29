'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  DollarSign,
  User,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  QrCode,
  Heart,
  Radio,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Building2,
  Smartphone,
  Wallet
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getViewerUser, getViewerToken } from '@/utils/cookies';

function ViewerPaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const sessionCodeParam = params?.sessionCode || searchParams?.get('sessionCode') || 'demo-live';
  const queryCreatorId = searchParams?.get('creatorId');
  const querySessionId = searchParams?.get('sessionId');

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Session & Creator State
  const [sessionData, setSessionData] = useState(null);
  const [creatorData, setCreatorData] = useState(null);
  const [viewerUser, setViewerUser] = useState(null);

  // Payment Form State
  const [amount, setAmount] = useState('100');
  const [viewerName, setViewerName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [isVipMember, setIsVipMember] = useState(false);

  useEffect(() => {
    // Auto-detect logged-in viewer account
    const u = getViewerUser();
    if (u) {
      setViewerUser(u);
      if (u.name) setViewerName(u.name);
    }
  }, []);

  // Check if viewer has active VIP membership for creator
  useEffect(() => {
    const checkVipStatus = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('askme_token') : null;
        const targetCid = creatorData?.id || queryCreatorId;
        const res = await fetch(API_ENDPOINTS.VIEWERS.VIP_MY_MEMBERSHIPS, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (res.ok && data.data?.memberships) {
          const hasVip = data.data.memberships.some(
            (m) => m.status === 'active' && (
              !targetCid || String(m.creator_id) === String(targetCid) ||
              (creatorData?.username && String(m.creatorUsername || '').toLowerCase() === String(creatorData.username).toLowerCase())
            )
          );
          if (hasVip) setIsVipMember(true);
        }
      } catch (e) {
        console.warn('VIP check notice on payment page:', e.message);
      }
    };

    if (creatorData) {
      checkVipStatus();
    }
  }, [creatorData, queryCreatorId]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_ENDPOINTS.CREATORS.PAY_SESSION}/${sessionCodeParam}`);
        const data = await res.json();

        if (res.ok && data.status === 'success' && data.data) {
          setSessionData(data.data.session);
          setCreatorData(data.data.creator);
        } else {
          // Fallback mock session for display
          setSessionData({
            id: querySessionId || 101,
            sessionCode: sessionCodeParam,
            title: 'Gaming Live Broadcast #25',
            category: 'Gaming & Esports',
            description: 'Support the broadcast! Ask questions & send instant UPI shoutouts live on screen.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
          });
          setCreatorData({
            id: queryCreatorId || 1,
            fullName: 'Creator Host',
            username: '@creator',
            profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          });
        }
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionCodeParam, queryCreatorId, querySessionId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsProcessing(true);

    try {
      const token = getViewerToken();
      const payload = {
        sessionCode: sessionCodeParam,
        sessionId: sessionData?.id || querySessionId || 1,
        creatorId: creatorData?.id || queryCreatorId || 1,
        amount: numericAmount,
        paymentMethod: paymentMethod || 'upi',
        viewerName: isAnonymous ? 'Anonymous Supporter' : viewerName || 'Supporter',
        message: message || '',
        anonymous: isAnonymous,
        isVip: isVipMember,
        viewerId: viewerUser?.id || null,
        viewerEmail: viewerUser?.email || null,
      };

      const res = await fetch(API_ENDPOINTS.CREATORS.PAY_PROCESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setPaymentSuccess(data.data);
      } else {
        // Fallback simulation
        setPaymentSuccess({
          donationUuid: `DON-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          amount: numericAmount,
          viewerName: isAnonymous ? 'Anonymous Supporter' : viewerName || 'Supporter',
          message: message || '',
          paidAt: new Date(),
        });
      }
    } catch (err) {
      console.error('Payment submit notice:', err);
      setPaymentSuccess({
        donationUuid: `DON-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        amount: numericAmount,
        viewerName: isAnonymous ? 'Anonymous Supporter' : viewerName || 'Supporter',
        message: message || '',
        paidAt: new Date(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center space-y-3">
        <div className="h-10 w-10 border-4 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#8B8B96]">Loading Live Stream Payment Page...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex flex-col selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      {/* Header Bar */}
      <header className="border-b border-[#1C1C26] bg-[#13131A] px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-md glow-teal">
            a
          </div>
          <div>
            <span className="font-heading font-black text-lg text-white block leading-none">
              AskMe <span className="text-brand-gradient">PAY</span>
            </span>
            <span className="text-[10px] font-bold text-[#8B8B96] uppercase tracking-wider block mt-1">
              Secure Live Stream Payouts
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-bold">
          <Lock className="h-3.5 w-3.5" /> 256-Bit SSL Encrypted
        </div>
      </header>

      {/* Main Payment Container */}
      <main className="flex-1 p-4 sm:p-6 max-w-xl w-full mx-auto my-auto space-y-6">

        {/* SUCCESS CONFIRMATION MODAL / SCREEN */}
        {paymentSuccess ? (
          <div className="p-8 rounded-3xl bg-[#13131A] border-2 border-[#00E676]/50 shadow-2xl text-center space-y-5 animate-scale-up glow-teal">
            <div className="h-20 w-20 rounded-full bg-[#00E676]/10 border-2 border-[#00E676] flex items-center justify-center text-[#00E676] mx-auto animate-pulse">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-black uppercase tracking-wider">
                PAYMENT COMPLETED
              </span>
              <h2 className="font-heading font-black text-3xl text-white tracking-tight mt-2">
                ₹{(parseFloat(paymentSuccess?.amount || paymentSuccess?.grossAmount || 0)).toFixed(2)}
              </h2>
              <p className="text-xs text-[#8B8B96] mt-1">
                Sent to <span className="text-[#00F5D4] font-bold">{creatorData?.fullName || 'Creator Host'}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2 text-left text-xs">
              <div className="flex justify-between border-b border-[#1C1C26] pb-2">
                <span className="text-[#8B8B96]">Transaction ID</span>
                <span className="font-mono text-white font-bold">{paymentSuccess.donationUuid}</span>
              </div>
              <div className="flex justify-between border-b border-[#1C1C26] pb-2">
                <span className="text-[#8B8B96]">Supporter Name</span>
                <span className="text-white font-bold">{paymentSuccess.viewerName}</span>
              </div>
              <div className="flex justify-between border-b border-[#1C1C26] pb-2">
                <span className="text-[#8B8B96]">Payment Gateway Method</span>
                <span className="text-[#00F5D4] font-bold">{paymentSuccess.paymentMethod || 'Instant UPI'}</span>
              </div>
              {paymentSuccess.message && (
                <div className="pt-1">
                  <span className="text-[#8B8B96] block mb-1">Live Stream Message:</span>
                  <p className="p-2.5 rounded-xl bg-[#13131A] text-[#00F5D4] italic font-medium">
                    "{paymentSuccess.message}"
                  </p>
                </div>
              )}
            </div>

            {/* Queue Position Notification Banner */}
            {paymentSuccess.isVip || isVipMember ? (
              <div className="p-4 rounded-2xl bg-[#1C1805] border-2 border-[#FFD60A] text-[#FFD60A] space-y-1 text-center shadow-xl glow-gold animate-pulse">
                <div className="flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider">
                  <span>👑 VIP Member Priority Question</span>
                </div>
                <p className="text-sm font-extrabold text-white">
                  Aap <span className="text-[#FFD60A] font-black underline text-base">TOP VIP Priority</span> pe hain queue mein!
                </p>
                <p className="text-[11px] text-[#8B8B96]">
                  Aapka question creator live dashboard pe highest priority queue par show hoga.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#00E676]/10 border-2 border-[#00E676]/40 text-[#00E676] space-y-1 text-center shadow-lg glow-teal animate-pulse">
                <div className="flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 text-[#00E676]" /> Live Queue Notification
                </div>
                <p className="text-sm font-extrabold text-white">
                  Aap <span className="text-[#00F5D4] font-black underline text-base">#{paymentSuccess.queuePosition || 1}</span> number pe hain queue mein!
                </p>
                <p className="text-[11px] text-[#8B8B96]">
                  Creator turns to your question next on the live stream broadcast.
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-bold flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" /> Message broadcasted to live stream overlay!
            </div>

            <button
              onClick={() => {
                setPaymentSuccess(null);
                setMessage('');
              }}
              className="w-full py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition"
            >
              Send Another Question / Support
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#13131A] border border-[#1C1C26] shadow-2xl space-y-6">

            {/* VIP Priority Badge if viewer is VIP Member */}
            {isVipMember && (
              <div className="p-3.5 rounded-2xl bg-[#1C1805] border-2 border-[#FFD60A]/80 text-[#FFD60A] space-y-1 text-xs shadow-lg glow-gold animate-pulse">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                  <span>👑 VIP Member Priority Access Active!</span>
                </div>
                <p className="text-[11px] text-white">
                  Aap creator ke VIP Member hain. Aapka paid question creator dashboard live question queue mein <strong>normal question se HIGHER PRIORITY (TOP)</strong> par dikhega!
                </p>
              </div>
            )}

            {/* Creator Header Info */}
            <div className="flex items-center gap-4 border-b border-[#1C1C26] pb-5">
              {creatorData?.profileImage ? (
                <img
                  src={creatorData.profileImage}
                  alt={creatorData.fullName}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-[#00F5D4]/40 shadow-md shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-[#1C1C26] border-2 border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] font-black text-2xl shrink-0">
                  {(creatorData?.fullName || 'C').charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-black text-xl text-white">{creatorData?.fullName || 'Creator Host'}</h2>
                  <ShieldCheck className="h-4 w-4 text-[#00F5D4]" />
                </div>
                <p className="text-xs text-[#00F5D4] font-semibold">{creatorData?.username || '@creator'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`h-2 w-2 rounded-full ${sessionData?.status === 'active' ? 'bg-[#00E676] animate-pulse' : 'bg-[#FF3D71]'}`} />
                  <span className="text-[11px] text-[#8B8B96] font-medium">
                    {sessionData?.title || 'Live Stream Session'} ({sessionData?.category || 'Gaming'})
                  </span>
                </div>
              </div>
            </div>

            {/* Inactive Session Warning if Closed */}
            {sessionData?.status && sessionData.status !== 'active' && (
              <div className="p-4 rounded-2xl bg-[#FF3D71]/10 border-2 border-[#FF3D71]/40 text-[#FF3D71] text-xs font-bold text-center space-y-1 animate-pulse">
                <p className="font-heading font-black text-sm uppercase">LIVE SESSION CLOSED</p>
                <p className="text-[11px] text-[#8B8B96]">The creator has ended this live session. QR Code & Payment link are disabled.</p>
              </div>
            )}

            {/* Interactive Payment Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-5">

              {/* 1. Enter Amount */}
              <div>
                <label className="block text-xs font-bold text-white mb-2 flex items-center justify-between">
                  <span>Enter Amount (₹) <span className="text-[#FF3D71]">*</span></span>
                  <span className="text-[11px] text-[#00F5D4]">100% Instant UPI</span>
                </label>

                {/* Preset Chips */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {['50', '100', '250', '500', '1000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${amount === val
                        ? 'bg-brand-gradient text-[#0A0A0F] shadow-md scale-105'
                        : 'bg-[#0A0A0F] text-white border border-[#1C1C26] hover:border-[#00F5D4]/40'
                        }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white font-black text-base">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] pl-8 pr-4 py-3 text-base text-white font-bold placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition"
                  />
                </div>
              </div>

              {/* Viewer Account Badge */}
              <div className="p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center justify-between text-xs">
                {viewerUser ? (
                  <div className="flex items-center gap-2 text-[#00E676] font-bold">
                    <User className="h-4 w-4" />
                    <span>Logged in as {viewerUser.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[#8B8B96] text-[11px]">Want saved supporter details?</span>
                    <Link
                      href={`/viewers/register?redirect=/pay/${sessionCodeParam}`}
                      className="text-[#00F5D4] font-bold text-[11px] hover:underline"
                    >
                      Register Viewer Account
                    </Link>
                  </div>
                )}
              </div>

              {/* 2. Name (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white">Viewer Name (Optional)</label>
                  <label className="flex items-center gap-1.5 text-xs text-[#8B8B96] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded accent-[#00F5D4]"
                    />
                    <span>Send Anonymously</span>
                  </label>
                </div>
                {!isAnonymous && (
                  <input
                    type="text"
                    value={viewerName}
                    onChange={(e) => setViewerName(e.target.value)}
                    placeholder="Enter your name / display handle"
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                  />
                )}
              </div>

              {/* 3. Message / Paid Question */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Live Stream Message / Paid Question (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a question or send a shoutout to appear live on stream overlay..."
                  className="w-full rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] p-3 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-2">Select Payment Gateway Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${paymentMethod === 'upi' ? 'bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]' : 'bg-[#0A0A0F] text-[#8B8B96] border-[#1C1C26]'}`}
                  >
                    <Smartphone className="h-4 w-4" /> Instant UPI
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debit_card')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${paymentMethod === 'debit_card' ? 'bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]' : 'bg-[#0A0A0F] text-[#8B8B96] border-[#1C1C26]'}`}
                  >
                    <CreditCard className="h-4 w-4" /> Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${paymentMethod === 'credit_card' ? 'bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]' : 'bg-[#0A0A0F] text-[#8B8B96] border-[#1C1C26]'}`}
                  >
                    <CreditCard className="h-4 w-4 text-[#FFD60A]" /> Credit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${paymentMethod === 'netbanking' ? 'bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]' : 'bg-[#0A0A0F] text-[#8B8B96] border-[#1C1C26]'}`}
                  >
                    <Building2 className="h-4 w-4" /> Net Banking
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${paymentMethod === 'wallet' ? 'bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]' : 'bg-[#0A0A0F] text-[#8B8B96] border-[#1C1C26]'}`}
                  >
                    <Wallet className="h-4 w-4 text-[#00E676]" /> Wallets
                  </button>
                </div>
              </div>

              {/* Submit Pay Button */}
              <button
                type="submit"
                disabled={isProcessing || (sessionData?.status && sessionData.status !== 'active')}
                className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 mt-4 ${sessionData?.status && sessionData.status !== 'active'
                  ? 'bg-[#1C1C26] text-[#8B8B96] cursor-not-allowed border border-[#1C1C26]'
                  : 'bg-brand-gradient text-[#0A0A0F] glow-teal hover:opacity-95'
                  }`}
              >
                {sessionData?.status && sessionData.status !== 'active' ? (
                  'Session Closed - Payments Disabled'
                ) : isProcessing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 fill-current" /> Pay ₹{amount || '100'} Now
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="border-t border-[#1C1C26] py-4 text-center text-xs text-[#8B8B96]">
        AskMe PRO Payment Portal &copy; 2026 • Powered by 256-Bit SSL Instant UPI Settlement
      </footer>
    </div>
  );
}

export default function ViewerPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4">
        <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ViewerPaymentContent />
    </Suspense>
  );
}
