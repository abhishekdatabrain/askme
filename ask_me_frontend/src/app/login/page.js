'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, User } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const loginPayload = { email, username: email, password };

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      const data = await response.json().catch(() => ({}));
      const token = data.data?.token || data.token || data.accessToken;
      const user = data.data?.user || data.user || { email };

      if (response.ok && (data.status === 'success' || data.success || token)) {
        const validToken = token || 'askme_jwt_token_valid';
        localStorage.setItem('askme_token', validToken);
        localStorage.setItem('askme_user', JSON.stringify(user));
        setIsSubmitted(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        setErrorMsg(data.message || data.error || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to backend server at http://localhost:5000/api.');
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
              <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-md glow-teal">
                a
              </div>
              <span className="font-heading font-black text-2xl text-white">AskMe <span className="text-brand-gradient">PRO</span></span>
            </div>
            <h2 className="font-heading font-bold text-lg text-white">Creator Sign In</h2>
            <p className="text-xs text-[#8B8B96]">
              Sign in to manage live AskMe broadcasts, 85% payouts, and askMails.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-center space-y-2">
              <ShieldCheck className="h-10 w-10 text-[#00E676] mx-auto" />
              <h4 className="font-heading font-bold text-base text-white">Sign In Successful!</h4>
              <p className="text-xs text-[#8B8B96]">Redirecting to Super Admin Control Room...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Email or Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@techburner.in or @techburner"
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#8B8B96]">Password</label>
                  <a href="#" className="text-[11px] text-[#00F5D4] hover:underline">Forgot password?</a>
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
                className="w-full py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-xl glow-teal hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" /> Sign In
              </button>

              <div className="text-center pt-3 border-t border-[#1C1C26]">
                <span className="text-xs text-[#8B8B96]">Don't have a creator account yet? </span>
                <Link href="/register" className="text-xs font-bold text-[#00F5D4] hover:underline">
                  Register
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
