'use client';

import React from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { Wallet, DollarSign, ArrowUpRight, TrendingUp, ArrowLeft } from 'lucide-react';

export default function CreatorWalletPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Creator Wallet & Revenue Ledger</h1>
            <p className="text-xs text-[#8B8B96]">85% Creator net earnings share, transaction history, & balance breakdown</p>
          </div>
          <Link href="/creators/dashboard" className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </header>

        <main className="p-6 max-w-4xl w-full mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#00F5D4]" /> Total Net Earnings
              </span>
              <div className="font-heading font-extrabold text-2xl text-white">₹0.00</div>
              <span className="text-[11px] text-[#00E676]">85% Revenue Share</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#FFD60A]" /> Available Balance
              </span>
              <div className="font-heading font-extrabold text-2xl text-white">₹0.00</div>
              <span className="text-[11px] text-[#8B8B96]">Ready for Payout</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4 text-[#FF3D71]" /> Total Withdrawn
              </span>
              <div className="font-heading font-extrabold text-2xl text-white">₹0.00</div>
              <span className="text-[11px] text-[#8B8B96]">Direct Bank Transfer</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
