'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  X,
  Lock,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { setCreatorSession } from '@/utils/cookies';
import Logo from './Logo';

export default function TrialRegistrationModal({
  isOpen,
  trialData,
  role = 'creator',
  onClose,
  onSuccess,
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // 1. Validation
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Full Name must be at least 2 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const tenDigit = cleanPhone.slice(-10);
    if (!tenDigit || tenDigit.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    // 4. Shared demo phone check
    if (tenDigit === '9999999999') {
      setErrorMsg('Please enter your personal phone number, not the shared trial demo number.');
      return;
    }

    setLoading(true);

    try {
      const sessionKey = 'askme_trial_creator_session_id';
      const trialSessionId = trialData?.trialSessionId || (typeof window !== 'undefined' ? localStorage.getItem(sessionKey) : null);
      const trialTempToken = trialData?.trialTempToken;

      const endpoint = API_ENDPOINTS.CREATORS?.TRIAL_COMPLETE_PROFILE || `${API_ENDPOINTS.CREATORS?.LOGIN?.replace('/login', '')}/trial/complete-profile`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          phone: tenDigit,
          trialSessionId,
          trialTempToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setSuccessMsg(data.message || 'Trial profile activated successfully!');

        // Save Creator Session & Token
        const creator = data.data?.creator || data.data?.user;
        const token = data.data?.token || data.token;
        if (token && creator) {
          setCreatorSession(token, creator);
          if (typeof window !== 'undefined') {
            localStorage.setItem('askme_creator_token', token);
            localStorage.setItem('askme_creator_user', JSON.stringify(creator));
            if (data.data?.trialSessionId || data.trialSessionId) {
              localStorage.setItem('askme_trial_creator_session_id', data.data?.trialSessionId || data.trialSessionId);
            }
          }
        }

        setTimeout(() => {
          if (onSuccess) onSuccess(data.data);
          if (onClose) onClose();
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = searchParams.get('redirect') || '/creators/dashboard';
          window.location.href = redirectUrl;
        }, 800);
      } else {
        setErrorMsg(data.message || 'Failed to complete trial registration. Please try again.');
      }
    } catch (err) {
      console.error('TRIAL REGISTRATION ERROR:', err);
      setErrorMsg('An unexpected connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      {/* Modal Card */}
      <div
        className="relative w-full max-w-[470px] bg-[#10101A] border border-[#26263B] rounded-[28px] p-5 sm:p-8 overflow-hidden transition-all duration-300 my-auto"
      >
        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#EB1000] to-transparent shadow-[0_0_15px_#EB1000]" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-36 bg-[#EB1000]/20 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-gray-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.06] transition-all cursor-pointer z-10"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Section */}
        <div className="text-center space-y-3 mb-6 pt-1">
          {/* Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF4500]/15 to-[#EB1000]/15 border border-[#EB1000]/30 text-[#FF501A] text-[10px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.2)]">
              <Sparkles className="w-3 h-3 text-[#FF501A] animate-pulse" />
              <span>Creator Trial Setup</span>
            </span>
          </div>

          {/* Logo Badge */}
          <div className="flex justify-center">
            <div className="w-13 h-13 rounded-2xl bg-[#161626] border border-white/10 flex items-center justify-center shadow-xl shadow-black/60 p-2.5">
              <Logo size="sm" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl sm:text-[26px] font-black text-white tracking-tight leading-tight">
              Complete Your{' '}
              <span className="bg-gradient-to-r from-white via-[#FF7A00] to-[#EB1000] bg-clip-text text-transparent">
                Creator Profile
              </span>
            </h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed mt-1.5">
              You verified with trial demo OTP. Enter your details to activate your 7-day full access.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#FF4D4D] text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#EB1000]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Mandatory Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-200 flex items-center justify-between">
              <span>Full Name <span className="text-[#EB1000] font-black">*</span></span>
            </label>
            <div className="group relative bg-[#151524] border border-[#2A2A40] hover:border-[#3D3D58] focus-within:border-[#EB1000] focus-within:ring-2 focus-within:ring-[#EB1000]/25 rounded-2xl transition-all duration-200">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#EB1000] transition-colors" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                disabled={loading}
                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-200 flex items-center justify-between">
              <span>Email Address <span className="text-[#EB1000] font-black">*</span></span>
            </label>
            <div className="group relative bg-[#151524] border border-[#2A2A40] hover:border-[#3D3D58] focus-within:border-[#EB1000] focus-within:ring-2 focus-within:ring-[#EB1000]/25 rounded-2xl transition-all duration-200">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#EB1000] transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                required
                disabled={loading}
                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Personal Phone Number Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200">
                Personal Phone Number <span className="text-[#EB1000] font-black">*</span>
              </label>
              <span className="text-[10px] text-gray-400 font-semibold px-2 py-0.5 rounded-md bg-white/[0.04]">
                10 digits
              </span>
            </div>
            <div className="group relative bg-[#151524] border border-[#2A2A40] hover:border-[#3D3D58] focus-within:border-[#EB1000] focus-within:ring-2 focus-within:ring-[#EB1000]/25 rounded-2xl transition-all duration-200 flex items-center">
              <div className="flex items-center gap-1.5 pl-3.5 pr-2 py-3 border-r border-[#2A2A40] shrink-0 select-none">
                <Phone className="w-4 h-4 text-gray-500 group-focus-within:text-[#EB1000] transition-colors mr-0.5" />
                <span className="text-xs font-bold text-white tracking-wide">+91</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="9876543210"
                required
                disabled={loading}
                className="w-full bg-transparent pl-3 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none font-medium tracking-wider"
              />
            </div>
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EB1000] shrink-0" />
              <span>Enter your real mobile number (shared demo 9999999999 not allowed).</span>
            </p>
          </div>

          {/* Security & Trial Information Note */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#EB1000]/10 via-[#1C1625]/60 to-[#141422] border border-[#EB1000]/20 flex items-start gap-3 text-xs text-gray-300">
            <ShieldCheck className="w-4 h-4 text-[#EB1000] shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(235,16,0,0.6)]" />
            <span className="leading-relaxed">
              Your profile is valid for <strong className="text-white">7 days</strong>. Once activated, you will be directed straight to your{' '}
              <strong className="text-[#FF5500] font-bold">Creator Dashboard</strong>.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group w-full py-3.5 px-4 rounded-2xl font-black text-sm tracking-wide text-white bg-gradient-to-r from-[#FF3B00] via-[#EB1000] to-[#B80A00] hover:from-[#FF4E1A] hover:via-[#FF2600] hover:to-[#C70E00] shadow-[0_0_25px_rgba(235,16,0,0.35)] hover:shadow-[0_0_35px_rgba(235,16,0,0.55)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Trial Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Enter</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
