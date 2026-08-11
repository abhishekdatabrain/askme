import React from 'react';
import AskMePayBadge from './AskMePayBadge';
import PlatformIcon from './PlatformIcon';
import { DollarSign, ArrowUpRight, CheckCircle2, Clock, Lock, Sparkles, Download } from 'lucide-react';

export default function AskMePayTable() {
  const transactions = [
    {
      id: 'PAY-8801',
      type: 'Paid AskMail',
      creator: 'TechBurner Live',
      viewer: 'Rahul_M',
      grossAmount: '₹500',
      creatorShare: '₹425 (85%)',
      platformCut: '₹75 (15%)',
      status: 'Escrow Released',
      platform: 'youtube',
      timestamp: '10 mins ago',
    },
    {
      id: 'PAY-8802',
      type: 'Live Session Q&A',
      creator: 'FinCal Strategy',
      viewer: 'Suresh_K',
      grossAmount: '₹1,000',
      creatorShare: '₹850 (85%)',
      platformCut: '₹150 (15%)',
      status: 'Escrow Released',
      platform: 'youtube',
      timestamp: '25 mins ago',
    },
    {
      id: 'PAY-8803',
      type: 'VIP Membership',
      creator: 'GamerX Xtreme',
      viewer: 'ProGamer_99',
      grossAmount: '₹299',
      creatorShare: '₹254.15 (85%)',
      platformCut: '₹44.85 (15%)',
      status: 'Recurring Active',
      platform: 'twitch',
      timestamp: '1 hour ago',
    },
    {
      id: 'PAY-8804',
      type: 'Paid AskMail',
      creator: 'Startup Unfiltered',
      viewer: 'Venture_Partner',
      grossAmount: '₹2,500',
      creatorShare: '₹2,125 (85%)',
      platformCut: '₹375 (15%)',
      status: 'In Escrow (24h Hold)',
      platform: 'linkedin',
      timestamp: '2 hours ago',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFD60A] text-[#0A0A0F] font-bold shadow-md glow-pay">
            <DollarSign className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-white">AskMe Pay Financial Ledger</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] text-xs font-bold border border-[#FFD60A]/30">
                15% Net Platform Revenue
              </span>
            </div>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Guaranteed paid askMails, live session Q&A fees, and VIP recurring subscriptions.
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1C26] text-[#00F5D4] text-xs font-bold border border-[#00F5D4]/30 hover:bg-[#00F5D4]/10 transition-all self-start sm:self-auto">
          <Download className="h-3.5 w-3.5" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
        <div>
          <span className="text-[11px] text-[#8B8B96]">Total Gross Volume (24h)</span>
          <span className="block font-heading font-black text-xl text-[#FFD60A] mt-0.5">₹1,48,500</span>
        </div>
        <div className="border-t sm:border-t-0 sm:border-x border-[#1C1C26] pt-2 sm:pt-0 sm:px-4">
          <span className="text-[11px] text-[#8B8B96]">Creator 85% Payouts</span>
          <span className="block font-heading font-black text-xl text-[#00E676] mt-0.5">₹1,26,225</span>
        </div>
        <div className="pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[11px] text-[#8B8B96]">AskMe 15% Net Revenue</span>
          <span className="block font-heading font-black text-xl text-[#00F5D4] mt-0.5">₹22,275</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Transaction ID</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Creator</th>
              <th className="py-3 px-3">Gross Amount</th>
              <th className="py-3 px-3 text-[#00E676]">Creator (85%)</th>
              <th className="py-3 px-3 text-[#00F5D4]">AskMe Cut (15%)</th>
              <th className="py-3 px-3">Escrow Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C26]">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#1C1C26]/40 transition-colors">
                <td className="py-3 px-3 font-mono text-white font-bold">{tx.id}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-md bg-[#1C1C26] text-[#F5F5F7] font-medium">
                    {tx.type}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{tx.creator}</span>
                    <PlatformIcon platform={tx.platform} showName={false} size="xs" />
                  </div>
                </td>
                <td className="py-3 px-3">
                  <AskMePayBadge amount={tx.grossAmount} />
                </td>
                <td className="py-3 px-3 font-bold text-[#00E676]">{tx.creatorShare}</td>
                <td className="py-3 px-3 font-bold text-[#00F5D4]">{tx.platformCut}</td>
                <td className="py-3 px-3">
                  {tx.status.includes('Released') ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00E676]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Released
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FFD60A]">
                      <Clock className="h-3.5 w-3.5" /> In Escrow
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
