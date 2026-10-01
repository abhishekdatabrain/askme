'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Lock, Check } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { getCreatorUser, getCreatorToken, setCreatorSession } from '@/utils/cookies';
import Logo from '@/components/Logo';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [creator, setCreator] = useState(null);
  const [token, setToken] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Form State
  const [mobile, setMobile] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [otp, setOtp] = useState('');

  // Status & Timers
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [debugOtp, setDebugOtp] = useState('');

  // Cooldown timer interval
  useEffect(() => {
    let timer = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Load creator session on mount
  useEffect(() => {
    const userObj = getCreatorUser();
    const userToken = getCreatorToken();

    if (!userObj || !userToken) {
      router.replace('/');
      return;
    }

    const cleanMob = (userObj.mobile || '').toString().replace(/[^0-9]/g, '');
    if (cleanMob.length >= 10) {
      router.replace('/creators/dashboard');
      return;
    }

    setCreator(userObj);
    setToken(userToken);
    setIsInitializing(false);
  }, [router]);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 10) {
      setMobile(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) {
      setOtp(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPhone = mobile.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      const err = 'Please enter a valid 10-digit Indian mobile number.';
      setErrorMsg(err);
      toast?.error(err, 'Invalid Mobile Number');
      return;
    }

    if (cooldown > 0) {
      const err = `Please wait ${cooldown} seconds before requesting a new OTP code.`;
      setErrorMsg(err);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.CREATORS.WHATSAPP_SEND_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phone: cleanPhone, mobile: cleanPhone }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setOtpStep('otp');
        setCooldown(30);
        const succ = data.message || `6-digit OTP code sent to +91 ${cleanPhone} via WhatsApp!`;
        setSuccessMsg(succ);
        toast?.success(succ, 'OTP Sent');

        if (data.data?.debugOtp || data.debugOtp) {
          setDebugOtp(String(data.data?.debugOtp || data.debugOtp));
        }
      } else {
        const err = data.message || 'Failed to send OTP code. Please try again.';
        setErrorMsg(err);
        toast?.error(err, 'Send OTP Error');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      const errText = 'Unable to connect to server to send OTP code.';
      setErrorMsg(errText);
      toast?.error(errText, 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      const err = 'Please enter the complete 6-digit OTP code sent to your WhatsApp.';
      setErrorMsg(err);
      toast?.error(err, 'Incomplete OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.CREATORS.WHATSAPP_VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone: mobile,
          mobile,
          otp: cleanOtp,
          creatorId: creator?.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success' && data.data) {
        const updatedCreator = data.data.creator || {
          ...creator,
          mobile: mobile.length === 10 ? mobile : mobile.slice(-10),
        };
        const newToken = data.data.token || token;

        setCreatorSession(newToken, updatedCreator);

        const succText = 'Mobile number verified and saved successfully! Redirecting...';
        setSuccessMsg(succText);
        toast?.success(succText, 'Profile Verified');

        const kycStatus = (updatedCreator?.kycStatus || 'pending').toLowerCase();
        const targetUrl = kycStatus === 'approved' ? '/creators/dashboard' : '/creators/kyc';

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 800);
      } else {
        const err = data.message || 'Invalid or expired OTP code. Please check and try again.';
        setErrorMsg(err);
        toast?.error(err, 'Verification Failed');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      const errText = 'Server error during OTP verification. Please try again.';
      setErrorMsg(errText);
      toast?.error(errText, 'Verification Error');
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#25D366] animate-spin" />
          <p className="text-[#8B8B96] text-xs font-semibold">Verifying profile status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col justify-between selection:bg-[#25D366] selection:text-white relative font-sans">
      {/* Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <Logo size="md" />
          <span className="font-heading font-black text-2xl text-white">AskMe</span>
        </div>
        <div className="flex items-center gap-2 bg-[#13131A] border border-[#1C1C26] rounded-full px-4 py-1.5 text-xs text-[#8B8B96]">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
          <span className="font-semibold text-white">Google Account Linked</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        {/* Progress Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {/* Step 1: Google Login (Done) */}
          <div className="flex items-center gap-1.5 text-[#00E676] text-xs font-bold bg-[#00E676]/10 border border-[#00E676]/30 px-3.5 py-1.5 rounded-full">
            <Check className="w-3.5 h-3.5" />
            <span>Google Login</span>
          </div>

          <div className="w-6 sm:w-8 h-[2px] bg-[#1C1C26]" />

          {/* Step 2: Verify Mobile (Active) */}
          <div className="flex items-center gap-1.5 text-white text-xs font-bold bg-[#25D366] border border-[#25D366] px-4 py-1.5 rounded-full shadow-lg shadow-[#25D366]/20">
            <Phone className="w-3.5 h-3.5" />
            <span>Verify Mobile</span>
          </div>

          <div className="w-6 sm:w-8 h-[2px] bg-[#1C1C26]" />

          {/* Step 3: Dashboard */}
          <div className="flex items-center gap-1.5 text-[#8B8B96] text-xs font-semibold bg-[#13131A] border border-[#1C1C26] px-3.5 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-[#8B8B96]" />
            <span>Dashboard</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[#13131A] border border-[#1C1C26] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Icon & Title */}
          <div className="text-center">
            <div className="w-14 h-14 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-[#25D366]" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Complete Your Profile</h1>
            <p className="text-[#8B8B96] text-xs mt-1.5 leading-relaxed">
              Welcome <span className="text-white font-bold">{creator?.fullName || creator?.email}</span>! Enter your Indian mobile number to verify via WhatsApp.
            </p>
          </div>

          {/* Account Email Box */}
          <div className="bg-[#0A0A0F] border border-[#1C1C26] rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-[#8B8B96] font-semibold">Account Email:</span>
            <span className="text-white font-mono font-bold truncate max-w-[200px]">{creator?.email}</span>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-xs font-bold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#FF3D71] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Debug OTP Banner (Development Mode Only) */}
          {debugOtp && (
            <div className="p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-center text-xs text-[#25D366] font-mono font-bold">
              [DEBUG OTP]: <span className="text-white text-sm tracking-widest">{debugOtp}</span>
            </div>
          )}

          {/* Phone Form Step */}
          {otpStep === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B8B96] mb-1.5">
                  Indian Mobile Number <span className="text-[#FF3D71]">*</span>
                </label>

                <div className="relative flex items-center rounded-xl bg-[#0A0A0F] border border-[#1C1C26] focus-within:border-[#25D366] transition-all overflow-hidden">
                  <div className="px-3.5 py-3 text-white bg-[#13131A] border-r border-[#1C1C26] flex items-center gap-1.5 text-xs font-bold shrink-0 select-none">
                    <span>🇮🇳</span>
                    <span className="font-mono text-white">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={handleMobileChange}
                    placeholder="Enter 10-digit number"
                    disabled={loading}
                    className="w-full bg-transparent border-0 px-4 py-3 text-xs text-white placeholder-[#8B8B96] tracking-wider font-mono outline-none focus:outline-none focus:ring-0"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-[#8B8B96] mt-2">
                  A 6-digit WhatsApp OTP verification code will be sent to this number.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length !== 10 || cooldown > 0}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <span>Send 6-Digit OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OTP Form Step */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-[#0A0A0F] border border-[#1C1C26] rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-[#8B8B96] font-semibold">Sent to WhatsApp:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono font-bold">+91 {mobile}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('phone');
                      setOtp('');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-[#25D366] hover:underline font-bold"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B8B96] mb-1.5">
                  Enter 6-Digit OTP Code <span className="text-[#FF3D71]">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="• • • • • •"
                  maxLength={6}
                  disabled={loading}
                  className="w-full bg-[#0A0A0F] border border-[#1C1C26] focus:border-[#25D366] rounded-xl px-4 py-3 text-center text-lg font-mono tracking-[0.5em] text-[#25D366] placeholder-[#8B8B96] transition-all outline-none"
                  autoFocus
                  required
                />
                <div className="flex items-center justify-between text-[11px] text-[#8B8B96] mt-2">
                  <span>OTP expires in 5 minutes</span>
                  {cooldown > 0 ? (
                    <span className="text-[#25D366] font-mono font-bold">Resend in {cooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-[#25D366] hover:underline font-bold"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    <span>Verify & Continue to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-[#8B8B96]">
        &copy; {new Date().getFullYear()} AskMe STUDIO. Secure WhatsApp Mobile Verification.
      </footer>
    </div>
  );
}
