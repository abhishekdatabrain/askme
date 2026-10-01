'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Phone, KeyRound, MessageSquare, RotateCcw } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { setAdminSession } from '@/utils/cookies';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const { toast } = useToast();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if input is phone number (numeric digits, optional spaces/hyphens/country code)
  const cleanDigits = identity.replace(/[^0-9]/g, '');
  const isPhoneInput = cleanDigits.length >= 7 && /^\+?[0-9\s\-]+$/.test(identity.trim());

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Handle Identity change: reset OTP state if user switches number
  const handleIdentityChange = (e) => {
    const val = e.target.value;
    setIdentity(val);
    setErrorMsg('');
    if (otpSent) {
      setOtpSent(false);
      setOtp('');
    }
  };

  // 1. Send WhatsApp OTP Flow
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (cleanDigits.length < 10) {
      const msg = 'Please enter a valid 10-digit mobile number.';
      setErrorMsg(msg);
      toast.error(msg, 'Invalid Phone Number');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.WHATSAPP_SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanDigits }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && (data.success || data.status === 'success')) {
        setOtpSent(true);
        setTimer(30);
        const msg = data.message || 'Verification code sent to your WhatsApp number!';
        toast.success(msg, 'WhatsApp OTP Sent');
        if (data.debugOtp) {
          toast.info(`[Dev Demo OTP]: ${data.debugOtp}`, 'OTP Code');
        }
      } else {
        const msg = data.message || data.error || 'Failed to send WhatsApp OTP. Please try again.';
        setErrorMsg(msg);
        toast.error(msg, 'OTP Request Failed');
      }
    } catch (err) {
      const msg = 'Unable to connect to backend server. Please check your connection.';
      setErrorMsg(msg);
      toast.error(msg, 'Connection Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Verify WhatsApp OTP & Login Flow
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp || otp.trim().length !== 6) {
      const msg = 'Please enter the 6-digit verification code received on WhatsApp.';
      setErrorMsg(msg);
      toast.error(msg, 'Invalid OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.WHATSAPP_VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanDigits, otp: otp.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      const token = data.accessToken || data.data?.token || data.token;
      const user = data.admin || data.data?.user || data.user || { role: 'admin' };

      if (response.ok && (data.success || data.status === 'success' || token)) {
        const userRole = (user.role || '').toLowerCase();
        if (userRole !== 'admin' && userRole !== 'superadmin') {
          const msg = 'Access Denied: Only Admin accounts are authorized to access the Admin Dashboard.';
          setErrorMsg(msg);
          toast.error(msg, 'Access Denied');
          setIsSubmitting(false);
          return;
        }

        const validToken = token;
        setAdminSession(validToken, user);
        setIsSubmitted(true);
        toast.success('WhatsApp Authentication Successful! Redirecting to Control Room...', 'Login Success');
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        const msg = data.message || data.error || 'Invalid OTP code. Please check your WhatsApp and try again.';
        setErrorMsg(msg);
        toast.error(msg, 'Verification Failed');
      }
    } catch (err) {
      const msg = 'Unable to connect to backend server. Please try again.';
      setErrorMsg(msg);
      toast.error(msg, 'Connection Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Email / Username + Password Login Flow
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const loginPayload = { email: identity.trim(), password };

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json().catch(() => ({}));
      const token = data.data?.token || data.token || data.accessToken;
      const user = data.data?.user || data.user || data.admin || { email: identity, role: 'admin' };

      if (response.ok && (data.status === 'success' || data.success || token)) {
        const userRole = (user.role || '').toLowerCase();
        if (userRole !== 'admin' && userRole !== 'superadmin') {
          const msg = 'Access Denied: Only Admin accounts are authorized to access the Admin Dashboard.';
          setErrorMsg(msg);
          toast.error(msg, 'Access Denied');
          setIsSubmitting(false);
          return;
        }

        const validToken = token;
        setAdminSession(validToken, user);
        setIsSubmitted(true);
        toast.success('Admin Sign In Successful! Redirecting to Control Room...', 'Login Success');
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        const msg = data.message || data.error || 'Invalid email or password.';
        setErrorMsg(msg);
        toast.error(msg, 'Login Failed');
      }
    } catch (err) {
      const msg = 'Unable to connect to backend server at http://localhost:5000/api.';
      setErrorMsg(msg);
      toast.error(msg, 'Connection Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 lg:p-8 shadow-2xl space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-black text-xl shadow-md glow-teal">
                <Logo />
              </div>
              <span className="font-heading font-black text-2xl text-white">AskMe</span>
            </div>
            <h2 className="font-heading font-bold text-lg text-white">Admin Sign In</h2>
            <p className="text-xs text-[#8B8B96]">
              Sign in to manage live AskMe broadcasts, creators, payouts, and platform operations.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#EB1000]/10 border border-[#EB1000]/30 text-xs text-[#FF4D4D] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-center space-y-2">
              <ShieldCheck className="h-10 w-10 text-[#00E676] mx-auto" />
              <h4 className="font-heading font-bold text-base text-white">Admin Sign In Successful!</h4>
              <p className="text-xs text-[#8B8B96]">Redirecting to Super Admin Control Room...</p>
            </div>
          ) : (
            <form
              onSubmit={
                isPhoneInput
                  ? otpSent
                    ? handleVerifyOtp
                    : handleSendOtp
                  : handleEmailPasswordLogin
              }
              className="space-y-4"
            >
              {/* Identity Input: Mobile or Email */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-[#8B8B96]">
                    {isPhoneInput ? 'Admin Mobile Number' : 'Admin Email,Mobile'}
                  </label>
                  {isPhoneInput && (
                    <span className="text-[10px] text-[#25D366] font-medium flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 inline" /> WhatsApp OTP
                    </span>
                  )}
                </div>
                <div className="relative">
                  {isPhoneInput ? (
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#25D366]" />
                  ) : (
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                  )}
                  <input
                    type="text"
                    required
                    value={identity}
                    onChange={handleIdentityChange}
                    placeholder={isPhoneInput ? 'Enter 10-digit mobile number' : 'admin@gmail.com or 10-digit mobile'}
                    className={`w-full rounded-xl bg-[#0A0A0F] border pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:outline-none transition-all ${isPhoneInput
                        ? 'border-[#25D366]/50 focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]/30'
                        : 'border-[#1C1C26] focus:border-[#EB1000]'
                      }`}
                  />
                </div>
              </div>

              {/* Dynamic Flow: If Phone -> OTP Flow; If Email/Username -> Password Flow */}
              {isPhoneInput ? (
                otpSent ? (
                  <>
                    {/* OTP Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-[#8B8B96]">WhatsApp OTP Code</label>
                        <span className="text-[10px] text-[#8B8B96]">Sent to {cleanDigits}</span>
                      </div>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-[#25D366]" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full rounded-xl bg-[#0A0A0F] border border-[#25D366]/50 pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] tracking-widest font-mono focus:border-[#25D366] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs shadow-xl shadow-[#25D366]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4" /> {isSubmitting ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
                    </button>

                    {/* Resend & Change Number Options */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={timer > 0 || isSubmitting}
                        className="text-[#25D366] hover:underline flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                        className="text-[#8B8B96] hover:text-white transition-colors"
                      >
                        Change Number
                      </button>
                    </div>
                  </>
                ) : (
                  /* Send OTP Button */
                  <button
                    type="submit"
                    disabled={isSubmitting || cleanDigits.length < 10}
                    className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs shadow-xl shadow-[#25D366]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <MessageSquare className="h-4 w-4" /> {isSubmitting ? 'Sending OTP...' : 'Send WhatsApp OTP'}
                  </button>
                )
              ) : (
                /* Email + Password Flow */
                <>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-[#8B8B96]">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={handleIdentityChange ? (e) => setPassword(e.target.value) : undefined}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-9 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#EB1000] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#8B8B96] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#EB1000] hover:bg-[#D00E00] text-white font-bold text-xs shadow-xl shadow-[#EB1000]/25 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <ShieldCheck className="h-4 w-4" /> {isSubmitting ? 'Signing In...' : 'Sign In to Admin Dashboard'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
