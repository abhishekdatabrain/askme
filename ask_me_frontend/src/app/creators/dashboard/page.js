'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  DollarSign,
  Video,
  Copy,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  MessageSquare,
  QrCode,
  ArrowLeft,
  ExternalLink,
  Layers,
  Wallet,
  Check,
  XCircle
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function CreatorDashboardPage() {
  const [creator, setCreator] = useState(null);
  const [copiedOverlay, setCopiedOverlay] = useState(false);
  const [kycStatus, setKycStatus] = useState('pending');

  useEffect(() => {
    const savedUserStr = localStorage.getItem('askme_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        setCreator(u);
        if (u.kycStatus) setKycStatus(u.kycStatus.toLowerCase());
      } catch (e) {}
    }

    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('askme_token');
        const res = await fetch(API_ENDPOINTS.CREATORS.KYC_STATUS, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.kycStatus) {
          setKycStatus(data.data.kycStatus.toLowerCase());
        }
      } catch (err) {}
    };

    fetchStatus();
  }, []);

  const overlayUrl = `https://askme.pro/overlay/${creator?.username?.replace('@', '') || 'creator'}`;

  const copyOverlayUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopiedOverlay(true);
    setTimeout(() => setCopiedOverlay(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      {/* 1. Creator Dashboard Sidebar */}
      <CreatorSidebar />

      {/* 2. Main Studio Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header Bar */}
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Creator Studio Control Room</h1>
            <p className="text-xs text-[#8B8B96]">Live AskMe Broadcast Overlay, Payout Ledger & Studio Management</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/creators/kyc"
              className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-xs font-bold text-[#00F5D4] border border-[#00F5D4]/30 hover:bg-[#00F5D4]/10 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" /> KYC Status: <span className="capitalize">{kycStatus}</span>
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 transition-colors border border-[#1C1C26] flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to App
            </Link>
          </div>
        </header>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">

          {/* Welcome Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#13131A] via-[#1C1C26] to-[#13131A] border border-[#1C1C26] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-bold uppercase tracking-wider">
                  CREATOR BROADCAST STUDIO
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-[10px] font-extrabold animate-pulse">
                  LIVE OVERLAY READY
                </span>
              </div>
              <h2 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight mt-2">
                Welcome, <span className="text-brand-gradient">{creator?.fullName || 'Creator Host'}</span>
              </h2>
              <p className="text-xs md:text-sm text-[#8B8B96] mt-1">
                85% net revenue share enabled. Embed your stream overlay for paid viewer questions & instant UPI settlements.
              </p>
            </div>

            <Link
              href="/creators/kyc"
              className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              Check KYC Verification <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#00F5D4]" /> Total Net Earnings
              </span>
              <div className="font-heading font-extrabold text-2xl text-white">₹0.00</div>
              <span className="text-[11px] text-[#00E676] font-semibold">85% Revenue Share active</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-[#FF3D71]" /> Questions Answered
              </span>
              <div className="font-heading font-extrabold text-2xl text-white">0 Paid Qs</div>
              <span className="text-[11px] text-[#8B8B96]">Guaranteed Min Fee: ₹100</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#FFD60A]" /> Available Balance
              </span>
              <div className="font-heading font-extrabold text-2xl text-white">₹0.00</div>
              <span className="text-[11px] text-[#8B8B96]">Min Withdrawal: ₹500</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00F5D4]" /> KYC Verification
              </span>
              <div className="font-heading font-extrabold text-xl capitalize flex items-center gap-1.5">
                {kycStatus === 'approved' && <span className="text-[#00E676] flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Approved</span>}
                {kycStatus === 'rejected' && <span className="text-[#FF3D71] flex items-center gap-1"><XCircle className="h-4 w-4" /> Rejected</span>}
                {(kycStatus === 'pending' || (kycStatus !== 'approved' && kycStatus !== 'rejected')) && (
                  <span className="text-[#FFD60A] flex items-center gap-1"><Clock className="h-4 w-4 animate-spin" /> Pending</span>
                )}
              </div>
              <span className="text-[11px] text-[#8B8B96]">Status menu always available</span>
            </div>
          </div>

          {/* OBS Stream Overlay Source Card */}
          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Video className="h-5 w-5 text-[#00F5D4]" /> OBS / Streamlabs Browser Source URL
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Paste this URL as a Browser Source overlay in OBS Studio, Streamlabs, or vMix to show QR codes & paid question alerts live during your broadcast.
                </p>
              </div>

              <button
                onClick={copyOverlayUrl}
                className="px-4 py-2 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-bold hover:bg-[#00F5D4]/20 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedOverlay ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#00E676]" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy OBS Browser Source URL
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] font-mono text-xs text-[#00F5D4] flex items-center justify-between overflow-x-auto">
              <span>{overlayUrl}</span>
              <ExternalLink className="h-4 w-4 text-[#8B8B96] shrink-0 ml-2" />
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="border-t border-[#1C1C26] py-4 text-center text-xs text-[#8B8B96]">
          AskMe PRO Creator Studio &copy; 2026 • 85% Net Revenue Payout System
        </footer>
      </div>
    </div>
  );
}
