'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { setViewerSession } from '@/utils/cookies';

export default function ViewerRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setSuccessMessage('Account created successfully! Redirecting...');
        if (data.data?.token && data.data?.user) {
          setViewerSession(data.data.token, data.data.user);
        }

        setTimeout(() => {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectUrl = searchParams.get('redirect') || '/viewers/dashboard';
          window.location.href = redirectUrl;
        }, 800);
      } else {
        setErrorMessage(data.message || 'Failed to create viewer account. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage('Server connection error. Please check backend API server.');
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
      </div>

      {/* Main Registration Card */}
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

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Full Name <span className="text-[#FF3D71]">*</span>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Email Address <span className="text-[#FF3D71]">*</span>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
                <input
                  type="number"
                  name="mobile"
                  placeholder="+91 9876543210"
                  value={formData.mobile}
                  onChange={handleChange}
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
                  name="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
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
