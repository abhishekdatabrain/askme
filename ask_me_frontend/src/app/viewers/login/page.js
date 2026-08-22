'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { setViewerSession } from '@/utils/cookies';

export default function ViewerLoginPage() {
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
          const redirectUrl = searchParams.get('redirect') || '/';
          window.location.href = redirectUrl;
        }, 1000);
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
        <h2 className="font-heading font-black text-2xl text-white tracking-tight">
          Viewer Login
        </h2>
        <p className="text-xs text-[#8B8B96] max-w-xs mx-auto">
          Login to your viewer account to auto-fill supporter details and track your paid stream questions.
        </p>
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
              className="w-full py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-lg glow-teal hover:opacity-95 transition flex items-center justify-center gap-2"
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
