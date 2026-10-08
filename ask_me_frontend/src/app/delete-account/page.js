'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, clearCreatorSession, getViewerToken, clearViewerSession } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Mail,
  User,
  ArrowLeft,
  Lock,
  RefreshCw,
  Info,
  Send
} from 'lucide-react';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Form State
  const [accountType, setAccountType] = useState('creator'); // 'creator' | 'viewer'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [reason, setReason] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  // Authenticated Instant Deletion State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showDirectDeleteModal, setShowDirectDeleteModal] = useState(false);
  const [directDeleteConfirmText, setDirectDeleteConfirmText] = useState('');
  const [isDeletingDirectly, setIsDeletingDirectly] = useState(false);

  useEffect(() => {
    // Detect logged in user status
    const creatorToken = getCreatorToken();
    const viewerToken = getViewerToken();

    if (creatorToken) {
      setIsLoggedIn(true);
      setUserRole('creator');
      setAccountType('creator');
    } else if (viewerToken) {
      setIsLoggedIn(true);
      setUserRole('viewer');
      setAccountType('viewer');
    }
  }, []);

  // Submit Account Deletion Request for Google Play Console Requirement
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!emailOrPhone.trim()) {
      if (toast?.error) toast.error('Please enter your registered email address or phone number.', 'Input Required');
      return;
    }

    if (!agreed) {
      if (toast?.warning) toast.warning('Please confirm that you understand the deletion terms.', 'Confirmation Required');
      return;
    }

    setIsSubmitting(true);

    try {
      const isEmail = emailOrPhone.includes('@');
      const payload = {
        name: `Account Deletion Request (${accountType === 'creator' ? 'Creator' : 'Viewer'})`,
        email: isEmail ? emailOrPhone.trim().toLowerCase() : `user_${emailOrPhone.replace(/\D/g, '')}@deletion-request.com`,
        phone: !isEmail ? emailOrPhone.trim() : '',
        role: accountType === 'creator' ? 'Creator' : 'Viewer',
        subject: 'Account Deletion Request',
        message: `Google Play Account Deletion Request.\nAccount Identifier: ${emailOrPhone.trim()}\nAccount Type: ${accountType.toUpperCase()}\nReason: ${reason.trim() || 'Not specified'}\nConsent Given: Yes`
      };

      const res = await fetch(`${API_BASE_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && (data.status === 'success' || res.status === 201)) {
        const generatedId = `DEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setSubmittedRequest({
          requestId: generatedId,
          emailOrPhone: emailOrPhone.trim(),
          accountType: accountType,
          date: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
        if (toast?.success) toast.success('Account deletion request submitted successfully!', 'Request Received');
      } else {
        if (toast?.error) toast.error(data.message || 'Failed to submit account deletion request. Please try again.', 'Submission Error');
      }
    } catch (err) {
      console.error('Account Deletion Request Error:', err);
      if (toast?.error) toast.error('Network error. Please check your connection and try again.', 'Network Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct Account Deletion for Logged-In Users
  const handleDirectInstantDelete = async () => {
    if (directDeleteConfirmText.toUpperCase() !== 'DELETE') {
      if (toast?.warning) toast.warning('Please type DELETE in capital letters to confirm.', 'Verification Failed');
      return;
    }

    setIsDeletingDirectly(true);

    try {
      const endpoint = userRole === 'creator'
        ? API_ENDPOINTS.CREATORS.DELETE_ACCOUNT
        : API_ENDPOINTS.VIEWERS.DELETE_ACCOUNT;
      const token = userRole === 'creator' ? getCreatorToken() : getViewerToken();

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        if (toast?.success) toast.success('Your account has been deleted successfully.', 'Account Deleted');

        if (userRole === 'creator') {
          clearCreatorSession();
        } else {
          clearViewerSession();
        }

        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        if (toast?.error) toast.error(data.message || 'Failed to delete account.', 'Error');
      }
    } catch (err) {
      console.error('Direct account deletion error:', err);
      if (toast?.error) toast.error('An error occurred during account deletion.', 'Error');
    } finally {
      setIsDeletingDirectly(false);
      setShowDirectDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070C] text-white flex flex-col font-sans selection:bg-[#EB1000] selection:text-white">
      {/* Top Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Navigation Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8E8E9F] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Page Header matching mockup */}
        <div className="text-center sm:text-left mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-bold tracking-wide uppercase">
            <Trash2 className="w-4 h-4 text-red-500 animate-pulse" />
            <span>Delete Your Account</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Ask Me Live – Account Deletion Request
          </h1>

          <p className="text-sm sm:text-base text-[#9E9EB2] max-w-2xl leading-relaxed">
            If you wish to delete your account and associated personal data, please submit a request below.
          </p>
        </div>

        {/* Logged in Direct Action Banner */}
        {isLoggedIn && (
          <div className="mb-8 p-5 rounded-2xl bg-[#120D18] border border-red-900/40 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Lock className="w-4 h-4 text-red-400" />
                <span>Logged in as a {userRole === 'creator' ? 'Creator' : 'Viewer'}</span>
              </div>
              <p className="text-xs text-[#A9A9BA]">
                You can delete your account immediately without waiting for standard 24–48h request processing.
              </p>
            </div>
            <button
              onClick={() => setShowDirectDeleteModal(true)}
              className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Instant Account Delete
            </button>
          </div>
        )}


       
      </main>

      {/* Direct Delete Modal */}
      {showDirectDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F0F18] border border-red-800/60 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-700/50 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Confirm Permanent Deletion</h3>
              <p className="text-xs sm:text-sm text-[#9E9EB2] leading-relaxed">
                This action is <span className="font-bold text-red-400">irreversible</span>. Your profile, settings, and personal data will be deleted.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#A0A0B5] uppercase">
                Type <span className="text-white font-mono font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={directDeleteConfirmText}
                onChange={(e) => setDirectDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 rounded-xl bg-[#141422] border border-[#222234] text-white font-mono placeholder-[#5A5A72] text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDirectDeleteModal(false);
                  setDirectDeleteConfirmText('');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1C1C28] hover:bg-[#28283A] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDirectInstantDelete}
                disabled={isDeletingDirectly || directDeleteConfirmText.toUpperCase() !== 'DELETE'}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isDeletingDirectly ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
