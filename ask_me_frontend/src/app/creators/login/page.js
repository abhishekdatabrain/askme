'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Radio, Sparkles, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { setCreatorSession } from '@/utils/cookies';

export default function CreatorLoginPage() {
  const { toast } = useToast();
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const loginPayload = {
      email: loginIdentifier,
      username: loginIdentifier,
      password,
    };

    try {
      const response = await fetch(API_ENDPOINTS.CREATORS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json().catch(() => ({}));
      const token = data.data?.token || data.token;
      const creator = data.data?.creator;

      if (response.ok && (data.status === 'success' || token) && creator) {
        const validToken = token || 'askme_jwt_creator_token';
        setCreatorSession(validToken, creator);
        setIsSubmitted(true);
        toast.success('Creator Sign In Successful! Redirecting to Creator Studio...', 'Welcome Back');

        // --- Post-Login Routing Logic Based on Creator KYC Status ---
        const status = (creator.kycStatus || 'pending').toLowerCase();
        let targetUrl = '/creators/kyc';

        if (status === 'approved') {
          targetUrl = '/creators/dashboard';
        } else if (status === 'pending') {
          targetUrl = '/creators/kyc';
        } else if (status === 'rejected') {
          targetUrl = '/creators/kyc';
        }

        setRedirectPath(targetUrl);
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 600);
      } else {
        const msg = data.message || data.error || 'Invalid creator email/username or password.';
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
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col justify-center items-center p-4 selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      <div className="w-full max-w-md space-y-4">

        {/* Back Link */}

        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 lg:p-8 shadow-2xl space-y-6">

          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-md glow-teal">
                a
              </div>
              <span className="font-heading font-black text-2xl text-white">AskMe <span className="text-brand-gradient">STUDIO</span></span>
            </div>
            <h2 className="font-heading font-bold text-lg text-white">Creator Control Room Sign In</h2>
            {/* <p className="text-xs text-[#8B8B96]">
              Sign in to access your Creator Dashboard, OBS Live Overlays, KYC status, & Payout Ledger.
            </p> */}
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-[#00E676] mx-auto" />
              <h4 className="font-heading font-bold text-base text-white">Creator Sign In Successful!</h4>
              <p className="text-xs text-[#8B8B96]">
                Checking KYC status & redirecting to Creator Studio...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B8B96] mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="creator@techburner.in or @techburner"
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
                  />
                </div>
              </div>

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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-9 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
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
                className="w-full py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-xl glow-teal hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Radio className="h-4 w-4" />
                {isSubmitting ? 'Authenticating Creator...' : 'Sign In to Creator Studio'}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="pt-2 text-center text-xs text-[#8B8B96] border-t border-[#1C1C26] space-y-2">
            <div>
              New Creator?{' '}
              <Link href="/" className="text-[#00F5D4] hover:underline font-bold">
                Register Creator Account
              </Link>
            </div>
            <div>
              Super Admin?{' '}
              <Link href="/login" className="text-[#8B8B96] hover:text-white underline">
                Admin Sign In Page
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
