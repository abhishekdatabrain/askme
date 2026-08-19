'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { ArrowUpRight, Building2, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';

export default function CreatorWithdrawalsPage() {
  useEffect(() => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
    }
  }, []);
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Bank Payout Withdrawals</h1>
            <p className="text-xs text-[#8B8B96]">Instant UPI & Bank NEFT/IMPS payout requests</p>
          </div>
          <Link href="/creators/dashboard" className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </header>

        <main className="p-6 max-w-4xl w-full mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-[#00F5D4]" />
                <div>
                  <h3 className="font-heading font-bold text-base text-white">Payout Payout Destination</h3>
                  <p className="text-xs text-[#8B8B96]">Earnings are settled directly to your verified KYC bank account.</p>
                </div>
              </div>

              <Link href="/creators/kyc" className="px-4 py-2 rounded-xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-bold hover:bg-[#00F5D4]/20 transition">
                Manage Verified Bank Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
