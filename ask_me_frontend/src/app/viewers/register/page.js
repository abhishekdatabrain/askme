'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle2, Check, X, Eye, EyeOff, MessageSquare, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { setViewerSession } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';
import Logo from '@/components/Logo';

export default function ViewerRegisterPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // WhatsApp OTP Verification States
  const [regWaStep, setRegWaStep] = useState('idle'); // 'idle' | 'otp_sent' | 'verified'
  const [regWaOtp, setRegWaOtp] = useState('');
  const [regWaLoading, setRegWaLoading] = useState(false);
  const [regWaError, setRegWaError] = useState('');
  const [regWaSuccess, setRegWaSuccess] = useState('');

  const handleSendRegWaOtp = async () => {
    const cleanMobile = (formData.mobile || '').replace(/[^0-9]/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      const errText = 'Please enter a valid 10-digit mobile number first.';
      setRegWaError(errText);
      toast.error(errText, 'Mobile Required');
      return;
    }
    setRegWaError('');
    setRegWaSuccess('');
    try {
      setRegWaLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.WHATSAPP_SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanMobile }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const msg = data.message || `WhatsApp OTP sent to +91 ${cleanMobile}`;
        setRegWaSuccess(msg);
        toast.success(msg, 'WhatsApp OTP Sent');
        setRegWaStep('otp_sent');
      } else {
        const errText = data.message || 'Failed to send WhatsApp OTP.';
        setRegWaError(errText);
        toast.error(errText, 'OTP Error');
      }
    } catch (err) {
      const errText = 'Server error while sending WhatsApp OTP.';
      setRegWaError(errText);
      toast.error(errText, 'OTP Error');
    } finally {
      setRegWaLoading(false);
    }
  };

  const handleVerifyRegWaOtp = async () => {
    const cleanMobile = (formData.mobile || '').replace(/[^0-9]/g, '');
    if (!regWaOtp || regWaOtp.length < 4) {
      const errText = 'Please enter the 6-digit OTP code sent to your WhatsApp.';
      setRegWaError(errText);
      toast.error(errText, 'OTP Required');
      return;
    }
    setRegWaError('');
    setRegWaSuccess('');
    try {
      setRegWaLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.WHATSAPP_VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanMobile, otp: regWaOtp }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const msg = 'Mobile number verified via WhatsApp!';
        setRegWaSuccess(msg);
        toast.success(msg, 'Mobile Verified!');
        setRegWaStep('verified');
      } else {
        const errText = data.message || 'Invalid WhatsApp OTP code.';
        setRegWaError(errText);
        toast.error(errText, 'Verification Failed');
      }
    } catch (err) {
      const errText = 'Server error verifying OTP.';
      setRegWaError(errText);
      toast.error(errText, 'Error');
    } finally {
      setRegWaLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage('');
  };

  const pass = formData.password || '';
  const passCriteria = {
    length: pass.length >= 8,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass),
  };

  const passScore = Object.values(passCriteria).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!pass) return { label: '', color: 'bg-gray-700', text: 'text-gray-400' };
    if (passScore <= 2) return { label: 'Weak Password', color: 'bg-[#FF3D71]', text: 'text-[#FF3D71]' };
    if (passScore <= 4) return { label: 'Medium Password', color: 'bg-[#FFAA00]', text: 'text-[#FFAA00]' };
    return { label: 'Strong Password ✓', color: 'bg-[#00E676]', text: 'text-[#00E676]' };
  };

  const strengthInfo = getStrengthLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      const msg = 'Please fill in all required fields.';
      setErrorMessage(msg);
      toast.error(msg, 'Validation Error');
      return;
    }

    if (!passCriteria.length || !passCriteria.upper || !passCriteria.lower || !passCriteria.number || !passCriteria.special) {
      const msg = 'Please create a strong password (at least 8 characters with uppercase, lowercase, number, and special character).';
      setErrorMessage(msg);
      toast.error(msg, 'Weak Password');
      return;
    }

    const cleanMobile = (formData.mobile || '').replace(/[^0-9]/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      const msg = 'Invalid mobile number. Please enter a valid 10-digit phone number.';
      setErrorMessage(msg);
      toast.error(msg, 'Invalid Mobile Number');
      return;
    }

    if (regWaStep !== 'verified') {
      const msg = 'Please verify your mobile number via WhatsApp OTP before registering.';
      setErrorMessage(msg);
      toast.error(msg, 'Mobile Verification Required');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mobile: cleanMobile,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        const msg = 'Account created successfully! Redirecting...';
        setSuccessMessage(msg);
        toast.success(msg, 'Registration Successful');

        if (data.data?.token && data.data?.user) {
          setViewerSession(data.data.token, data.data.user);
        }

        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = searchParams.get('redirect') || '/viewers/dashboard';
          window.location.href = redirectUrl;
        }, 800);
      } else {
        const msg = data.message || 'Failed to create viewer account. Please try again.';
        setErrorMessage(msg);
        toast.error(msg, 'Registration Failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = 'Server connection error. Please check backend API server.';
      setErrorMessage(msg);
      toast.error(msg, 'Connection Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#00F5D4] selection:text-[#0A0A0F]">

      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Logo size="lg" />
          <span className="font-heading font-black text-2xl text-white">
            AskMe <span className="text-[#EB1000]">Viewer</span>
          </span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#12121C] border border-[#1F1F30] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

          {/* Status Notifications */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-bold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center gap-2.5 animate-pulse">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Full Name <span className="text-[#EB1000]">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0D14] border border-[#1F1F30] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#EB1000] transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Email Address <span className="text-[#EB1000]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0D14] border border-[#1F1F30] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#EB1000] transition"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-white">
                  Mobile Number <span className="text-[#EB1000]">*</span>
                </label>
                {regWaStep === 'verified' && (
                  <span className="text-[10px] font-extrabold text-[#00E676] flex items-center gap-1 bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/30">
                    <Check className="h-3 w-3" /> WhatsApp Verified ✓
                  </span>
                )}
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  placeholder="9876543210"
                  disabled={regWaStep === 'verified'}
                  value={formData.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setFormData({ ...formData, mobile: val });
                    setErrorMessage('');
                    if (regWaStep !== 'idle') setRegWaStep('idle');
                  }}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0D14] border border-[#1F1F30] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#EB1000] transition font-mono"
                />
              </div>

              {/* Send WhatsApp OTP Button */}
              {formData.mobile.length === 10 && regWaStep === 'idle' && (
                <button
                  type="button"
                  onClick={handleSendRegWaOtp}
                  disabled={regWaLoading}
                  className="mt-2 w-full py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-black font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {regWaLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 fill-black" />
                      <span>Send WhatsApp OTP to Verify Mobile</span>
                    </>
                  )}
                </button>
              )}

              {/* Enter OTP Field */}
              {regWaStep === 'otp_sent' && (
                <div className="mt-2 p-3 rounded-2xl bg-[#0A1A10] border border-[#00E676]/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#00E676]">
                    <span>Enter OTP sent to WhatsApp (+91 {formData.mobile}):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={regWaOtp}
                      onChange={(e) => setRegWaOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full py-2 px-3 rounded-xl border border-[#00E676]/50 text-xs text-center font-mono font-bold tracking-widest bg-[#0D0D14] text-white outline-none focus:border-[#00E676]"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyRegWaOtp}
                      disabled={regWaLoading || !regWaOtp}
                      className="px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-black font-black text-xs shrink-0 transition shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {regWaLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                  {regWaError && (
                    <p className="text-[11px] text-[#EB1000] font-bold">{regWaError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Strong Password Input with Live Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-white">
                  Password <span className="text-[#EB1000]">*</span>
                </label>
                {pass && (
                  <span className={`text-[11px] font-bold ${strengthInfo.text}`}>
                    {strengthInfo.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="e.g. StrongPass@123"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0D0D14] border border-[#1F1F30] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#EB1000] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B8B96] hover:text-white transition focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 shrink-0" />
                  ) : (
                    <Eye className="h-4 w-4 shrink-0" />
                  )}
                </button>
              </div>

              {/* Strength Meter Bar */}
              {pass && (
                <div className="mt-2 space-y-1.5">
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 rounded-full transition-all duration-300 ${level <= passScore ? strengthInfo.color : 'bg-[#1C1C26]'
                          }`}
                      />
                    ))}
                  </div>

                  {/* Criteria Checklist */}
                  <div className="p-3 bg-[#0D0D14] border border-[#1F1F30] rounded-xl text-[11px] space-y-1 mt-2">
                    <p className="font-bold text-gray-300 text-[10px] uppercase tracking-wider mb-1">Strong Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-1 text-[#8B8B96]">
                      <span className={`flex items-center gap-1.5 ${passCriteria.length ? 'text-[#00E676] font-bold' : ''}`}>
                        {passCriteria.length ? <Check className="h-3 w-3 shrink-0 text-[#00E676]" /> : <X className="h-3 w-3 shrink-0 text-gray-500" />}
                        <span>8+ Characters</span>
                      </span>
                      <span className={`flex items-center gap-1.5 ${passCriteria.upper ? 'text-[#00E676] font-bold' : ''}`}>
                        {passCriteria.upper ? <Check className="h-3 w-3 shrink-0 text-[#00E676]" /> : <X className="h-3 w-3 shrink-0 text-gray-500" />}
                        <span>Uppercase (A-Z)</span>
                      </span>
                      <span className={`flex items-center gap-1.5 ${passCriteria.lower ? 'text-[#00E676] font-bold' : ''}`}>
                        {passCriteria.lower ? <Check className="h-3 w-3 shrink-0 text-[#00E676]" /> : <X className="h-3 w-3 shrink-0 text-gray-500" />}
                        <span>Lowercase (a-z)</span>
                      </span>
                      <span className={`flex items-center gap-1.5 ${passCriteria.number ? 'text-[#00E676] font-bold' : ''}`}>
                        {passCriteria.number ? <Check className="h-3 w-3 shrink-0 text-[#00E676]" /> : <X className="h-3 w-3 shrink-0 text-gray-500" />}
                        <span>Number (0-9)</span>
                      </span>
                      <span className={`flex items-center gap-1.5 col-span-2 ${passCriteria.special ? 'text-[#00E676] font-bold' : ''}`}>
                        {passCriteria.special ? <Check className="h-3 w-3 shrink-0 text-[#00E676]" /> : <X className="h-3 w-3 shrink-0 text-gray-500" />}
                        <span>Special Symbol (@, #, $, !, %, etc.)</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#EB1000] hover:bg-[#CC0E00] text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Viewer Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Login */}
          <div className="border-t border-[#1C1C26] pt-4 text-center">
            <p className="text-xs text-[#8B8B96]">
              Already have a viewer account?{' '}
              <Link href="/viewers/login" className="text-[#00F5D4] font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
