import React, { useState } from 'react';
import AskMePayBadge from './AskMePayBadge';
import { DollarSign, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, Send, Wallet, Download } from 'lucide-react';

export default function WithdrawalsManager() {
  const [withdrawals, setWithdrawals] = useState([
    {
      id: 'WTH-3091',
      creator: 'TechBurner Live',
      grossRevenue: '₹45,000',
      payoutAmount: '₹38,250 (85%)',
      platformCut: '₹6,750 (15%)',
      payoutMethod: 'HDFC Bank **** 9821',
      status: 'pending',
      requestedDate: '10 Aug 2026, 11:30 AM',
    },
    {
      id: 'WTH-3092',
      creator: 'FinCal Strategy',
      grossRevenue: '₹80,000',
      payoutAmount: '₹68,000 (85%)',
      platformCut: '₹12,000 (15%)',
      payoutMethod: 'ICICI Bank **** 4410',
      status: 'processed',
      requestedDate: '09 Aug 2026, 04:15 PM',
    },
    {
      id: 'WTH-3093',
      creator: 'Startup Unfiltered',
      grossRevenue: '₹1,20,000',
      payoutAmount: '₹1,02,000 (85%)',
      platformCut: '₹18,000 (15%)',
      payoutMethod: 'SBI Bank **** 1102',
      status: 'on_hold',
      requestedDate: '08 Aug 2026, 09:00 PM',
    },
  ]);

  const handleProcessPayout = (id) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'processed' } : w));
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFD60A] text-[#0A0A0F] font-bold shadow-md glow-pay">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Creator Payouts & Withdrawals</h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Review and approve instant payout requests for verified creators (85% net earnings).
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1C26] text-[#00F5D4] text-xs font-bold border border-[#00F5D4]/30 hover:bg-[#00F5D4]/10 transition-all self-start sm:self-auto">
          <Download className="h-3.5 w-3.5" />
          <span>Export Payouts Report</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Withdrawal ID</th>
              <th className="py-3 px-3">Creator</th>
              <th className="py-3 px-3 text-[#FFD60A]">Gross Revenue</th>
              <th className="py-3 px-3 text-[#00E676]">Net Payout (85%)</th>
              <th className="py-3 px-3 text-[#00F5D4]">AskMe Fee (15%)</th>
              <th className="py-3 px-3">Destination</th>
              <th className="py-3 px-3">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C26]">
            {withdrawals.map((w) => (
              <tr key={w.id} className="hover:bg-[#1C1C26]/40 transition-colors">
                <td className="py-3 px-3 font-mono text-white font-bold">{w.id}</td>
                <td className="py-3 px-3 font-bold text-white">{w.creator}</td>
                <td className="py-3 px-3 font-bold text-[#FFD60A]">{w.grossRevenue}</td>
                <td className="py-3 px-3 font-bold text-[#00E676]">{w.payoutAmount}</td>
                <td className="py-3 px-3 font-bold text-[#00F5D4]">{w.platformCut}</td>
                <td className="py-3 px-3 text-[#8B8B96]">{w.payoutMethod}</td>
                <td className="py-3 px-3">
                  {w.status === 'processed' ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold text-[11px] inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Settled
                    </span>
                  ) : w.status === 'on_hold' ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#FFD60A]/20 text-[#FFD60A] font-bold text-[11px] inline-flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Under Audit
                    </span>
                  ) : (
                    <button
                      onClick={() => handleProcessPayout(w.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#00E676] text-[#0A0A0F] font-bold text-xs shadow-md hover:bg-[#00E676]/90 transition-all flex items-center gap-1"
                    >
                      <Send className="h-3 w-3" /> Approve & Transfer
                    </button>
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
