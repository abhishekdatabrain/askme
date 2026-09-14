'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { setViewerSession } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import { useGoogleLogin } from '@react-oauth/google';
import Logo from '@/components/Logo';
import TruecallerAuthButton from '@/components/TruecallerAuthButton';

function LoginContent() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      const msg = 'Please enter both email address and password.';
      setErrorMessage(msg);
      toast.error(msg, 'Login Failed');
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setErrorMessage(msg);
      toast.error(msg, 'Login Failed');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        const msg = 'Logged in successfully! Redirecting...';
        setSuccessMessage(msg);
        toast.success(msg, 'Welcome Back');

        if (data.data?.token && data.data?.user) {
          setViewerSession(data.data.token, data.data.user);
        }

        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = searchParams.get('redirect') || '/viewers/dashboard';
          window.location.href = redirectUrl;
        }, 800);
      } else {
        const msg = data.message || 'Invalid email address or password.';
        setErrorMessage(msg);
        toast.error(msg, 'Login Failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = 'Server connection error. Please try again.';
      setErrorMessage(msg);
      toast.error(msg, 'Connection Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuthBackend = async (googleResponsePayload) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('Authenticating with Google...');

    try {
      const res = await fetch(API_ENDPOINTS.VIEWERS.GOOGLE_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleResponsePayload),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setSuccessMessage('Logged in with Google! Redirecting...');
        if (data.data?.token && data.data?.user) {
          setViewerSession(data.data.token, data.data.user);
        }

        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = searchParams.get('redirect') || '/viewers/dashboard';
          window.location.href = redirectUrl;
        }, 800);
      } else {
        setErrorMessage(data.message || 'Google authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setErrorMessage('Server connection error during Google authentication.');
    } finally {
      setIsLoading(false);
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
          name
        });
      } catch (err) {
        console.error('Failed to fetch Google userinfo:', err);
        handleGoogleAuthBackend({
          token: tokenResponse?.access_token || '',
          email: '',
          name: ''
        });
      }
    },
    onError: () => {
      // Fallback for development without live Google Client ID
      handleGoogleAuthBackend({
        email: 'viewer.google@gmail.com',
        name: 'Google Supporter',
        googleId: 'google_demo_102030'
      });
    }
  });
  const handleTruecallerSuccess = async (tcData) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('Verifying with Truecaller...');
    try {
      const res = await fetch(API_ENDPOINTS.VIEWERS.TRUECALLER_VIEWER_AUTH || API_ENDPOINTS.VIEWERS.TRUECALLER_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tcData),
      });

      const result = await res.json();

      if (result.status === 'success' && result.data?.token) {
        // Token save karein
        setViewerSession(result.data.token, result.data.user);
        // Login page se hata kar Dashboard par redirect karein
        window.location.href = '/viewers/dashboard';
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('API Error:', err);
    }
  };
  // const handleTruecallerAuth = async (payload) => {
  //   setIsLoading(true);
  //   setErrorMessage('');
  //   setSuccessMessage('Verifying with Truecaller...');

  //   try {
  //     const targetEndpoint = API_ENDPOINTS.VIEWERS.TRUECALLER_VIEWER_AUTH || API_ENDPOINTS.VIEWERS.TRUECALLER_AUTH;
  //     const res = await fetch(targetEndpoint, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await res.json();
  //     if (res.ok && data.status === 'success' && data.data) {
  //       setSuccessMessage('Truecaller authentication successful! Redirecting...');

  //       if (typeof window !== 'undefined' && data.data.token) {
  //         localStorage.setItem('askme_token', data.data.token);
  //       }

  //       setViewerSession(data.data.token, data.data.user);

  //       setTimeout(() => {
  //         const searchParams = new URLSearchParams(window.location.search);
  //         const redirectUrl = searchParams.get('redirect') || '/viewers/dashboard';
  //         window.location.href = redirectUrl;
  //       }, 800);
  //     } else {
  //       setErrorMessage(data.message || 'Truecaller authentication failed. Please try again.');
  //     }
  //   } catch (err) {
  //     console.error('Truecaller login error:', err);
  //     setErrorMessage('Truecaller authentication failed. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // WhatsApp OTP State
  const [showWaModal, setShowWaModal] = useState(false);
  const [waStep, setWaStep] = useState('phone'); // 'phone' | 'otp'
  const [waPhone, setWaPhone] = useState('');
  const [waOtp, setWaOtp] = useState('');
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState('');
  const [waSuccess, setWaSuccess] = useState('');
  const [waDebugOtp, setWaDebugOtp] = useState('');

  const openWhatsAppModal = () => {
    setShowWaModal(true);
    setWaStep('phone');
    setWaError('');
    setWaSuccess('');
    setWaOtp('');
  };

  const handleSendWaOtp = async (e) => {
    if (e) e.preventDefault();
    setWaError('');
    setWaSuccess('');

    const clean = waPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length !== 10) {
      setWaError('Invalid mobile number. Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      setWaLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.WHATSAPP_SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setWaStep('otp');
        setWaSuccess(data.message || 'OTP sent to your WhatsApp!');
        if (data.debugOtp) setWaDebugOtp(data.debugOtp);
      } else {
        setWaError(data.message || 'Failed to send OTP to WhatsApp.');
      }
    } catch (err) {
      setWaError('Server error while sending WhatsApp OTP.');
    } finally {
      setWaLoading(false);
    }
  };

  const handleVerifyWaOtp = async (e) => {
    if (e) e.preventDefault();
    setWaError('');
    setWaSuccess('');

    if (!waOtp || waOtp.trim().length < 6) {
      setWaError('Please enter the 6-digit OTP code received on WhatsApp.');
      return;
    }

    try {
      setWaLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.WHATSAPP_VERIFY_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhone, otp: waOtp }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data) {
        setWaSuccess('WhatsApp Login Verified! Redirecting...');
        setViewerSession(data.data.token, data.data.user);
        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = searchParams.get('redirect') || '/viewers/dashboard';
          window.location.href = redirectUrl;
        }, 800);
      } else {
        setWaError(data.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setWaError('Server error during OTP verification.');
    } finally {
      setWaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#00F5D4] selection:text-[#0A0A0F]">

      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Logo size="lg" />
          <span className="font-heading font-black text-2xl text-white">
            AskMe <span className="text-brand-gradient">Viewer</span>
          </span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#13131A] border border-[#1C1C26] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 glow-teal">

          {/* Status Notifications */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-xs font-bold flex items-center gap-2.5 animate-shake">
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


          {/* Standard Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Email Address <span className="text-[#FF3D71]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Password <span className="text-[#FF3D71]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition"
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-brand-gradient text-white font-black text-xs shadow-lg glow-teal hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login to Viewer Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Truecaller 1-Tap Verify Button */}
            <TruecallerAuthButton
              onSuccess={handleTruecallerSuccess}
              onError={(err) => setErrorMessage(err)}
              isLoading={isLoading}
            />

            {/* WhatsApp 1-Tap Sign In Button */}
            <button
              type="button"
              onClick={openWhatsAppModal}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-xs font-black text-white transition flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/20 cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>WhatsApp Login with OTP</span>
            </button>

            {/* Social Auth: Continue with Google */}
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
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] hover:border-[#00F5D4]/50 text-xs font-bold text-white transition flex items-center justify-center gap-3 shadow-md hover:bg-[#1C1C26]/50 cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          {/* Footer Link to Register */}
          <div className="border-t border-[#1C1C26] pt-4 text-center">
            <p className="text-xs text-[#8B8B96]">
              Don't have a viewer account yet?{' '}
              <Link href="/viewers/register" className="text-[#00F5D4] font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp OTP Modal */}
      {showWaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#13131A] border border-[#25D366]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white relative">
            {/* Close Button */}
            <button
              onClick={() => setShowWaModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold p-2"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#1C1C26] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">WhatsApp Verification</h3>
                <p className="text-xs text-gray-400">Instant One-Time Password</p>
              </div>
            </div>

            {/* Error / Success Alerts */}
            {waError && (
              <div className="p-3.5 rounded-xl bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{waError}</span>
              </div>
            )}
            {waSuccess && (
              <div className="p-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{waSuccess}</span>
              </div>
            )}

            {/* STEP 1: Phone Entry */}
            {waStep === 'phone' && (
              <form onSubmit={handleSendWaOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">WhatsApp Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-sm text-white focus:outline-none focus:border-[#25D366] transition font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={waLoading}
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-lg shadow-[#25D366]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {waLoading ? (
                    <span>Sending Code on WhatsApp...</span>
                  ) : (
                    <>
                      <span>Send OTP Code on WhatsApp</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP Entry */}
            {waStep === 'otp' && (
              <form onSubmit={handleVerifyWaOtp} className="space-y-4">
                <div className="p-3.5 bg-[#0A0A0F] border border-[#25D366]/30 rounded-2xl space-y-1 text-xs text-center">
                  <p className="text-gray-300">🔐 Enter 6-digit code sent to <strong className="text-white">+91 {waPhone.slice(-10)}</strong></p>
                  <a
                    href="https://web.whatsapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#25D366] font-bold hover:underline text-[11px] pt-1"
                  >
                    <span>Open WhatsApp Web / App</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 text-center">6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={waOtp}
                    onChange={(e) => setWaOtp(e.target.value)}
                    className="w-full text-center py-3.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xl font-bold text-[#25D366] tracking-[0.4em] focus:outline-none focus:border-[#25D366] transition font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={waLoading}
                  className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs shadow-lg shadow-[#25D366]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {waLoading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setWaStep('phone')}
                    className="text-gray-400 hover:text-white transition"
                  >
                    ← Change Number
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWaOtp}
                    disabled={waLoading}
                    className="text-[#25D366] font-bold hover:underline transition"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewerLoginPage() {
  return (
    <GoogleAuthProvider>
      <LoginContent />
    </GoogleAuthProvider>
  );
}
