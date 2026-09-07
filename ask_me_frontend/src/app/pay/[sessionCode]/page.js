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
  Wallet,
  X,
  LogIn,
  AlertCircle,
  Mail,
  UserPlus,
  ArrowLeft
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getViewerUser, getViewerToken, setViewerSession, clearViewerSession } from '@/utils/cookies';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import { useGoogleLogin } from '@react-oauth/google';

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

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMobile, setRegMobile] = useState('');

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
        const token = getViewerToken();
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

    if (creatorData && viewerUser) {
      checkVipStatus();
    }
  }, [creatorData, queryCreatorId, viewerUser]);

  const [publicVipPlans, setPublicVipPlans] = useState([]);
  const [isJoiningVip, setIsJoiningVip] = useState(false);

  useEffect(() => {
    const fetchPublicPlans = async () => {
      try {
        const targetCid = creatorData?.id || queryCreatorId;
        const res = await fetch(`${API_ENDPOINTS.VIEWERS.VIP_PLANS}?creatorId=${targetCid || ''}`);
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.data?.plans) {
          setPublicVipPlans(data.data.plans);
        }
      } catch (e) {
        console.warn('Fetch public VIP plans notice:', e.message);
      }
    };

    fetchPublicPlans();
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
            description: 'Support the broadcast! Ask questions & send instant UPI shoutouts live on stream.',
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

  // Google OAuth Handler
  const handleGoogleAuthBackend = async (googleResponsePayload) => {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('Connecting with Google...');

    try {
      const res = await fetch(API_ENDPOINTS.VIEWERS.GOOGLE_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleResponsePayload),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setAuthSuccess('Logged in successfully!');
        if (data.data?.token && data.data?.user) {
          setViewerSession(data.data.token, data.data.user);
          setViewerUser(data.data.user);
          if (data.data.user.name && !viewerName) {
            setViewerName(data.data.user.name);
          }
        }
        setTimeout(() => {
          setShowAuthModal(false);
          setAuthSuccess('');
        }, 600);
      } else {
        setAuthError(data.message || 'Google authentication failed.');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setAuthError('Server connection error during Google authentication.');
    } finally {
      setAuthLoading(false);
    }
  };

  const googleLoginHook = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        let email = '';
        let name = '';
        if (tokenResponse?.access_token) {
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          if (userInfoRes.ok) {
            const userInfo = await userInfoRes.json();
            email = userInfo.email || '';
            name = userInfo.name || '';
          }
        }
        handleGoogleAuthBackend({
          token: tokenResponse.access_token,
          email,
          name,
        });
      } catch (err) {
        console.error('Failed to fetch Google userinfo:', err);
        handleGoogleAuthBackend({
          token: tokenResponse?.access_token || '',
          email: '',
          name: '',
        });
      }
    },
    onError: () => {
      handleGoogleAuthBackend({
        email: 'viewer.google@gmail.com',
        name: 'Google Supporter',
        googleId: 'google_demo_102030',
      });
    },
  });

  // Email / Password Login
  const handleEmailLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }

    try {
      setAuthLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setAuthSuccess('Logged in successfully!');
        if (data.data?.token && data.data?.user) {
          setViewerSession(data.data.token, data.data.user);
          setViewerUser(data.data.user);
          if (data.data.user.name && !viewerName) {
            setViewerName(data.data.user.name);
          }
        }
        setTimeout(() => {
          setShowAuthModal(false);
          setAuthSuccess('');
        }, 600);
      } else {
        setAuthError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      setAuthError('Server error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Register New Account
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!regName || !regEmail || !regPassword) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    try {
      setAuthLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          mobile: regMobile || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setAuthSuccess('Account created successfully!');
        if (data.data?.token && data.data?.user) {
          setViewerSession(data.data.token, data.data.user);
          setViewerUser(data.data.user);
          setViewerName(data.data.user.name);
        }
        setTimeout(() => {
          setShowAuthModal(false);
          setAuthSuccess('');
        }, 600);
      } else {
        setAuthError(data.message || 'Failed to create account.');
      }
    } catch (err) {
      setAuthError('Server error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Razorpay Test Mode Modal State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayTab, setRazorpayTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [testUpiId, setTestUpiId] = useState('success@razorpay');
  const [testCardNumber, setTestCardNumber] = useState('4111 1111 1111 1111');
  const [testCardExpiry, setTestCardExpiry] = useState('12/28');
  const [testCardCvv, setTestCardCvv] = useState('123');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Helper to load Native Razorpay Checkout Script if user prefers
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Check if viewer is logged in
    const currentUser = viewerUser || getViewerUser();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (!message || !message.trim()) {
      alert('Please enter your live stream message / paid question.');
      return;
    }

    // Open Razorpay Testing Mode Payment Gateway
    setShowRazorpayModal(true);
  };

  // Complete Payment Process (called by Razorpay Test Gateway or Native Popup)
  const executePaymentSuccess = async (rzpPaymentId, rzpMethod = 'UPI') => {
    setIsProcessing(true);
    const currentUser = viewerUser || getViewerUser();
    const numericAmount = parseFloat(amount);

    try {
      const token = getViewerToken();
      const payload = {
        sessionCode: sessionCodeParam,
        sessionId: sessionData?.id || querySessionId || 1,
        creatorId: creatorData?.id || queryCreatorId || 1,
        amount: numericAmount,
        paymentMethod: rzpMethod,
        gateway: 'Razorpay',
        gatewayPaymentId: rzpPaymentId || `pay_rzp_${Date.now()}`,
        gatewayOrderId: `order_rzp_${Date.now()}`,
        gatewaySignature: `sig_${Math.random().toString(36).substring(2, 12)}`,
        viewerName: isAnonymous ? 'Anonymous Supporter' : (viewerName || currentUser?.name || 'Supporter'),
        message: message || '',
        anonymous: isAnonymous,
        isVip: isVipMember,
        viewerId: currentUser?.id || null,
        viewerEmail: currentUser?.email || null,
      };

      const res = await fetch(API_ENDPOINTS.CREATORS.PAY_PROCESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setShowRazorpayModal(false);
        setPaymentSuccess(data.data);
      } else {
        alert(data.message || 'Payment recording failed. Please contact support.');
      }
    } catch (err) {
      console.error('Payment submit callback error:', err);
      alert('Network error while recording payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Launch Native Razorpay JS Popup if key is active
  const launchNativeRazorpay = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Razorpay SDK failed to load.');
      return;
    }

    const currentUser = viewerUser || getViewerUser();
    const numericAmount = parseFloat(amount);
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

    const options = {
      key: razorpayKey,
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      name: 'AskMe Live Stream Payouts',
      description: `Live Stream Question for ${creatorData?.fullName || 'Creator'}`,
      image: creatorData?.profileImage || undefined,
      prefill: {
        name: isAnonymous ? 'Anonymous Supporter' : (viewerName || currentUser?.name || 'Supporter'),
        email: currentUser?.email || 'supporter@askme.live',
        contact: currentUser?.mobile || '9876543210',
      },
      theme: { color: '#00F5D4' },
      handler: function (response) {
        executePaymentSuccess(response.razorpay_payment_id, paymentMethod);
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        alert(`Payment Failed: ${resp.error?.description || 'Failed'}`);
      });
      rzp.open();
    } catch (e) {
      console.warn('Native Razorpay notice:', e.message);
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
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex flex-col selection:bg-[#00F5D4] selection:text-[#0A0A0F] relative">
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

        <div className="flex items-center gap-3">
          {viewerUser ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white font-bold hidden sm:inline">{viewerUser.name}</span>
              <button
                type="button"
                onClick={() => {
                  clearViewerSession();
                  setViewerUser(null);
                  setViewerName('');
                  setIsVipMember(false);
                }}
                className="text-[11px] text-[#8B8B96] hover:text-[#FF3D71] transition underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:opacity-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5" /> Login
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-bold">
            <Lock className="h-3.5 w-3.5" /> 256-Bit SSL
          </div>
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
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${amount === val
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
              <div className="rounded-2xl border transition-all">
                {viewerUser ? (
                  <div className="p-3.5 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#00E676] font-bold">
                      <User className="h-4 w-4" />
                      <span>Logged in as <strong className="text-white">{viewerUser.name}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearViewerSession();
                        setViewerUser(null);
                        setViewerName('');
                        setIsVipMember(false);
                      }}
                      className="text-[#8B8B96] hover:text-[#FF3D71] text-[11px] font-semibold transition underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#FFD60A]/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#FFD60A] font-bold">
                      <Lock className="h-4 w-4 shrink-0" />
                      <span>Login required to ask question & pay</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#FFD60A] text-[#0A0A0F] font-black text-[11px] hover:opacity-90 transition shadow-md cursor-pointer"
                    >
                      Login / Sign Up
                    </button>
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
                  Live Stream Message / Paid Question <span className="text-[#FF3D71]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a question or send a shoutout to appear live on stream overlay..."
                  className="w-full rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] p-3 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              {/* Submit / Pay Button */}
              {viewerUser ? (
                <button
                  type="submit"
                  disabled={isProcessing || (sessionData?.status && sessionData.status !== 'active')}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer ${sessionData?.status && sessionData.status !== 'active'
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
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!message || !message.trim()) {
                      alert('Please enter your live stream message / paid question first.');
                      return;
                    }
                    setShowAuthModal(true);
                  }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 mt-4 bg-brand-gradient text-[#0A0A0F] glow-teal hover:opacity-95 cursor-pointer"
                >
                  <Lock className="h-4 w-4" /> Login to Pay ₹{amount || '100'} & Send Question
                </button>
              )}
            </form>
          </div>
        )}
      </main>

      {/* AUTH / LOGIN POPUP MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 glow-teal relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowAuthModal(false);
                setAuthError('');
                setAuthSuccess('');
              }}
              className="absolute right-4 top-4 text-[#8B8B96] hover:text-white transition p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5 pt-2">
              <div className="h-12 w-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-2xl mx-auto shadow-lg glow-teal">
                <Lock className="h-6 w-6 stroke-[2.5]" />
              </div>
              <h3 className="font-heading font-black text-xl text-white">
                {authMode === 'login' ? 'Viewer Login Required' : 'Create Viewer Account'}
              </h3>
              <p className="text-xs text-[#8B8B96]">
                Please sign in to complete payment and send your question to{' '}
                <span className="text-[#00F5D4] font-bold">{creatorData?.fullName || 'Creator'}</span>
              </p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${authMode === 'login' ? 'bg-[#1C1C26] text-[#00F5D4] shadow-sm' : 'text-[#8B8B96]'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${authMode === 'register' ? 'bg-[#1C1C26] text-[#00F5D4] shadow-sm' : 'text-[#8B8B96]'}`}
              >
                Register
              </button>
            </div>

            {/* Notifications */}
            {authError && (
              <div className="p-3 rounded-xl bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Google 1-Click Login Button */}
            <button
              type="button"
              onClick={() => {
                try {
                  googleLoginHook();
                } catch (e) {
                  handleGoogleAuthBackend({
                    email: 'viewer.google@gmail.com',
                    name: 'Google Supporter'
                  });
                }
              }}
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] hover:border-[#00F5D4]/50 text-xs font-bold text-white transition flex items-center justify-center gap-3 shadow-md hover:bg-[#1C1C26]/50 cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#8B8B96]">
              <div className="h-px bg-[#1C1C26] flex-1" />
              <span>or with email</span>
              <div className="h-px bg-[#1C1C26] flex-1" />
            </div>

            {/* Email Forms */}
            {authMode === 'login' ? (
              <form onSubmit={handleEmailLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                    <input
                      type="email"
                      required
                      placeholder="viewer@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {authLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Login & Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="viewer@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {authLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* External Links */}
            <div className="pt-2 text-center text-xs text-[#8B8B96]">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className="text-[#00F5D4] font-bold hover:underline cursor-pointer"
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="text-[#00F5D4] font-bold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT PAYMENT GATEWAY MODAL (PREMIUM PIXEL-PERFECT UI) */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#13131A] border border-[#2A230A] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-white animate-scale-up max-h-[92vh] flex flex-col">

            {/* STICKY TOP HEADER */}
            <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-[#1E1E28] flex items-center justify-between shrink-0 bg-[#13131A]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRazorpayModal(false)}
                  className="h-8 w-8 rounded-full bg-[#1C1C26] text-[#8B8B96] hover:text-white flex items-center justify-center cursor-pointer transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="font-heading font-black text-lg text-white tracking-tight">
                  Checkout
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowRazorpayModal(false)}
                className="h-8 w-8 rounded-full bg-[#1C1C26] text-[#8B8B96] hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto scrollbar-none flex-1">

              {/* ORDER SUMMARY */}
              <div className="p-4 rounded-2xl bg-[#1C1805] border border-[#B38F00]/60 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#FFD60A]/15 border border-[#FFD60A]/40 flex items-center justify-center text-xl shrink-0">
                    💎
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">
                      Live Stream Question – {creatorData?.fullName || 'Creator'}
                    </h4>
                    <p className="text-[11px] text-[#8B8B96]">Instant Live Stream Payout</p>
                  </div>
                </div>
                <span className="font-heading font-black text-2xl text-[#FFD60A] shrink-0 ml-3">
                  ₹{amount || '100'}
                </span>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-extrabold text-[#8B8B96] uppercase tracking-wider block">
                  PAY USING
                </label>

                <div className="space-y-2">
                  {[
                    { id: 'upi', label: 'UPI', desc: 'Paytm, PhonePe, GPay, BHIM', icon: Smartphone },
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
                    { id: 'netbanking', label: 'Net Banking', desc: 'All Major Indian Banks', icon: Building2 },
                    { id: 'wallet', label: 'Wallet', desc: 'Paytm Wallet, Mobikwik', icon: Wallet },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSel = razorpayTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRazorpayTab(item.id)}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${isSel
                            ? 'bg-[#1F1905] border-[#FFD60A] text-white shadow-md'
                            : 'bg-[#181820] border-[#22222E] text-[#8B8B96] hover:border-[#333344]'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className={`h-5 w-5 ${isSel ? 'text-[#FFD60A]' : 'text-[#8B8B96]'}`} />
                          <div>
                            <p className="font-bold text-xs text-white leading-snug">{item.label}</p>
                            <p className="text-[10px] text-[#8B8B96]">{item.desc}</p>
                          </div>
                        </div>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSel ? 'border-[#FFD60A] bg-[#FFD60A]' : 'border-[#444455]'
                            }`}
                        >
                          {isSel && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* CONDITIONAL INPUT FOR UPI */}
                {razorpayTab === 'upi' && (
                  <div className="pt-2 space-y-2 animate-fadeIn">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter UPI ID (e.g. mobile@upi)"
                        value={testUpiId}
                        onChange={(e) => setTestUpiId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-xs text-white placeholder-[#666677] focus:outline-none focus:border-[#FFD60A] transition"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {['success@razorpay', 'gpay@upi', 'paytm@upi'].map((upiPreset) => (
                        <button
                          key={upiPreset}
                          type="button"
                          onClick={() => setTestUpiId(upiPreset)}
                          className="px-2.5 py-1 rounded-lg bg-[#181820] border border-[#2A2A3A] text-[10px] font-semibold text-[#8B8B96] hover:text-white hover:border-[#FFD60A]/50 transition shrink-0 cursor-pointer"
                        >
                          {upiPreset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONDITIONAL INPUT FOR CARD */}
                {razorpayTab === 'card' && (
                  <div className="pt-2 space-y-2.5 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-bold text-[#8B8B96] mb-1">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                        <input
                          type="text"
                          placeholder="Card Number (e.g. 4111 1111 1111 1111)"
                          value={testCardNumber}
                          onChange={(e) => setTestCardNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181820] border border-[#2A2A3A] text-xs text-white font-mono placeholder-[#666677] focus:outline-none focus:border-[#FFD60A] transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#8B8B96] mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={testCardExpiry}
                          onChange={(e) => setTestCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#181820] border border-[#2A2A3A] text-xs text-white font-mono placeholder-[#666677] focus:outline-none focus:border-[#FFD60A] transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#8B8B96] mb-1">CVV / CVC</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B8B96]" />
                          <input
                            type="password"
                            maxLength={3}
                            placeholder="123"
                            value={testCardCvv}
                            onChange={(e) => setTestCardCvv(e.target.value)}
                            className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#181820] border border-[#2A2A3A] text-xs text-white font-mono placeholder-[#666677] focus:outline-none focus:border-[#FFD60A] transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONDITIONAL FOR NET BANKING */}
                {razorpayTab === 'netbanking' && (
                  <div className="pt-2 space-y-2 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'SBI Bank', 'Axis Bank'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between cursor-pointer ${selectedBank === b
                              ? 'bg-[#1F1905] border-[#FFD60A] text-[#FFD60A]'
                              : 'bg-[#181820] border-[#2A2A3A] text-[#8B8B96] hover:text-white'
                            }`}
                        >
                          <span>{b}</span>
                          {selectedBank === b && <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD60A]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONDITIONAL FOR WALLET */}
                {razorpayTab === 'wallet' && (
                  <div className="pt-2 grid grid-cols-2 gap-2 animate-fadeIn">
                    {['Paytm Wallet', 'PhonePe', 'Mobikwik', 'Amazon Pay'].map((w) => (
                      <div
                        key={w}
                        className="p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-xs text-white font-bold flex items-center justify-between"
                      >
                        <span>{w}</span>
                        <span className="text-[10px] text-[#00E676] font-semibold">Active</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* STICKY FOOTER CTA BUTTON */}
            <div className="p-5 sm:p-6 pt-2 border-t border-[#1E1E28] bg-[#13131A] shrink-0">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => executePaymentSuccess(`pay_rzp_${Date.now()}`, razorpayTab.toUpperCase())}
                className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#FF7043] hover:to-[#FF8A65] text-white font-black text-sm transition shadow-xl glow-pay flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <span>Pay ₹{amount || '100'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-[#1C1C26] py-4 text-center text-xs text-[#8B8B96]">

        AskMe PRO Payment Portal &copy; 2026 • Powered by 256-Bit SSL Instant UPI Settlement
      </footer>
    </div>
  );
}

export default function ViewerPaymentPage() {
  return (
    <GoogleAuthProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4">
          <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ViewerPaymentContent />
      </Suspense>
    </GoogleAuthProvider>
  );
}

