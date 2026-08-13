'use client';

import React from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { Bell, ShieldCheck, DollarSign, Radio, ArrowLeft } from 'lucide-react';

export default function CreatorNotificationsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Creator Notifications & Alerts</h1>
            <p className="text-xs text-[#8B8B96]">System updates, KYC audit notifications, & payout alerts</p>
          </div>
          <Link href="/creators/dashboard" className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </header>

        <main className="p-6 max-w-4xl w-full mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-[#13131A] border border-[#1C1C26] flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Welcome to AskMe PRO Creator Control Room</h4>
              <p className="text-[11px] text-[#8B8B96]">Complete your KYC verification to enable 85% net payouts.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
