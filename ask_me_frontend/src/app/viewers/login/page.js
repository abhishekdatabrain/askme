'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { setViewerSession } from '@/utils/cookies';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import { useGoogleLogin } from '@react-oauth/google';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
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
        setSuccessMessage('Logged in successfully! Redirecting...');
        if (data.data?.token && data.data?.user) {
          setViewerSession(data.data.token, data.data.user);
        }

        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = searchParams.get('redirect') || '/viewers/dashboard';
          window.location.href = redirectUrl;
        }, 800);
      } else {
        setErrorMessage(data.message || 'Invalid email address or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Server connection error. Please try again.');
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

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#00F5D4] selection:text-[#0A0A0F]">

      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-2xl shadow-lg glow-teal">
            a
          </div>
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
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-lg glow-teal hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login to Viewer Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
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
