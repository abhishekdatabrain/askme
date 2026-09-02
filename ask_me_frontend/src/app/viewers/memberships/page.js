'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ViewerSidebar from '@/components/ViewerSidebar';
import SplashLoader from '@/components/SplashLoader';
import { API_ENDPOINTS } from '@/config/api';
import { getViewerToken, getCookie } from '@/utils/cookies';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  CreditCard,
  XCircle,
  ChevronRight,
  Shield,
  Clock,
  Crown,
  ShieldCheck
} from 'lucide-react';

export default function MyMembershipsPage() {
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState([]);
  const [showManageModal, setShowManageModal] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  console.log("membership", memberships);
  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const token = getViewerToken() || getCookie('askme_viewer_token') || getCookie('askme_token');
      const res = await fetch(API_ENDPOINTS.VIEWERS.VIP_MY_MEMBERSHIPS, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      console.log("data", data);
      if (res.ok && data.status === 'success' && data.data?.memberships) {
        setMemberships(data.data.memberships);
      }
    } catch (err) {
      console.warn('Fetch memberships notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // const handleCancelMembership = async (membership) => {
  //   setCancelling(true);
  //   try {
  //     const token = typeof window !== 'undefined' ? localStorage.getItem('askme_token') : null;
  //     await fetch(API_ENDPOINTS.VIEWERS.VIP_CANCEL, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //       },
  //       body: JSON.stringify({
  //         membershipId: membership.id,
  //         creatorId: membership.creator_id,
  //       }),
  //     });

  //     setCancelMessage(`Membership cancelled. You will retain access until ${membership.next_billing_date || '24 Sep 2026'}.`);
  //     setMemberships(prev => prev.map(m => m.id === membership.id ? { ...m, status: 'cancelled' } : m));
  //   } catch (err) {
  //     setCancelMessage(`Membership cancelled. Access remains valid until next billing date.`);
  //     setMemberships(prev => prev.map(m => m.id === membership.id ? { ...m, status: 'cancelled' } : m));
  //   } finally {
  //     setCancelling(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3 min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#8B8B96]">Loading My VIP Memberships...</p>
      </div>
    );
  }

  return (
    <>
      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-[#13131A]/95 backdrop-blur-md border-b border-[#1C1C26] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/viewers/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#8B8B96] hover:text-[#00F5D4] transition">
            <ArrowLeft className="h-4 w-4" /> Back to Public Live Feed
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-lg">💎</span>
            <h1 className="font-heading font-black text-sm text-white">
              My Memberships
            </h1>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
          <div className="border-b border-[#1C1C26] pb-4">
            <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
              <span>💎</span> My Memberships ({memberships.filter(m => m.status === 'active').length})
            </h2>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Manage your active VIP creator subscriptions, billing history, and membership perks.
            </p>
          </div>

          {cancelMessage && (
            <div className="p-4 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center justify-between">
              <span>{cancelMessage}</span>
              <button onClick={() => setCancelMessage('')} className="text-[#00E676] hover:opacity-75">✕</button>
            </div>
          )}

          {memberships.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#13131A] border border-[#1C1C26] text-center space-y-4 max-w-md mx-auto">
              <span className="text-4xl block">💎</span>
              <h3 className="font-heading font-bold text-lg text-white">No Active Memberships</h3>
              <p className="text-xs text-[#8B8B96]">
                You haven't joined any VIP Creator Memberships yet. Explore creators and join for exclusive perks!
              </p>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-bold shadow-md inline-block glow-teal"
              >
                Explore Live Creators
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memberships.map((membership) => {
                const isActive = membership.status === 'active';

                return (
                  <div
                    key={membership.id}
                    className="p-6 rounded-3xl bg-[#1C1805] border-2 border-[#B38F00] shadow-2xl space-y-5 relative"
                  >
                    {/* TOP BADGE */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <h3 className="font-heading font-black text-lg text-white">
                          {membership.plan_name || ''}
                        </h3>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isActive
                        ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                        : 'bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30'
                        }`}>
                        {isActive ? 'Active' : 'Cancelled'}
                      </span>
                    </div>

                    {/* CREATOR INFO */}
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#13131A] border border-[#332700]">
                      <img
                        src={membership.creatorAvatar}
                        alt={membership.creatorName}
                        className="h-11 w-11 rounded-full object-cover border border-[#FFD60A]"
                      />
                      <div>
                        <p className="text-[10px] text-[#8B8B96] uppercase font-bold">Creator</p>
                        <h4 className="font-bold text-sm text-white">{membership.creatorName}</h4>
                        <p className="text-xs text-[#FFD60A] font-mono">{membership.creatorUsername}</p>
                      </div>
                    </div>

                    {/* BILLING BREAKDOWN */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[#8B8B96]">
                        <span>Amount</span>
                        <span className="font-bold text-[#FFD60A]">₹{membership.amount} / {membership.interval}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#8B8B96]">
                        <span>Member Since</span>
                        <span className="font-bold text-white">
                          {membership.created_at
                            ? new Date(membership.created_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#8B8B96]">
                        <span>Next Billing Date</span>
                        <span className="font-bold text-white">{membership.next_billing_date || ''}</span>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="grid gap-3 pt-2">
                      <button
                        onClick={() => setShowManageModal(membership)}
                        className="py-2.5 px-4 rounded-xl bg-[#2A2308] hover:bg-[#382F0B] border border-[#665200] text-white font-bold text-xs transition"
                      >
                        View Benefits
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* MANAGE / BENEFITS MODAL */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#13131A] border border-[#B38F00] rounded-3xl max-w-md w-full p-6 space-y-5 text-white relative shadow-2xl">
            <button
              onClick={() => setShowManageModal(null)}
              className="absolute top-4 right-4 text-[#8B8B96] hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <h3 className="font-heading font-black text-lg">VIP Membership Benefits</h3>
            </div>

            <p className="text-xs text-[#8B8B96]">
              Exclusive perks active for <strong className="text-white">{showManageModal.creatorName}</strong>:
            </p>

            <div className="space-y-3 p-4 rounded-2xl bg-[#1C1805] border border-[#332700] text-xs font-semibold">
              {(Array.isArray(showManageModal.perks)
                ? showManageModal.perks
                : String(showManageModal.perks || '').split(',')
              ).map((perk, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-4 w-4 text-[#00E676] shrink-0" />
                  <span>{perk.trim()}</span>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <button
                onClick={() => setShowManageModal(null)}
                className="w-full py-3 px-4 rounded-full bg-[#2A2A38] hover:bg-[#333345] text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
