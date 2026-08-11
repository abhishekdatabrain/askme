import React from 'react';
import { 
  Wallet, 
  DollarSign, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  PieChart
} from 'lucide-react';

export default function WalletManagement() {
  const creatorWallets = [
    {
      creatorName: 'TechBurner Live',
      handle: '@techburner',
      grossEarnings: '₹14,50,000',
      platformCommission: '₹2,17,500', // 15%
      netCreatorShare: '₹12,32,500',  // 85%
      withdrawnTotal: '₹10,48,000',
      availableBalance: '₹1,84,500',
      settlementStatus: 'Settled'
    },
    {
      creatorName: 'CA Rachana Ranade',
      handle: '@ca_rachana',
      grossEarnings: '₹22,80,000',
      platformCommission: '₹3,42,000', // 15%
      netCreatorShare: '₹19,38,000',  // 85%
      withdrawnTotal: '₹15,96,000',
      availableBalance: '₹3,42,000',
      settlementStatus: 'Settled'
    },
    {
      creatorName: 'CodeWithAnish',
      handle: '@codewithanish',
      grossEarnings: '₹3,20,000',
      platformCommission: '₹48,000',   // 15%
      netCreatorShare: '₹2,72,000',   // 85%
      withdrawnTotal: '₹2,26,800',
      availableBalance: '₹45,200',
      settlementStatus: 'Pending Settlement'
    },
    {
      creatorName: 'Sarah AI & Tech',
      handle: '@sarah_ai',
      grossEarnings: '₹1,80,000',
      platformCommission: '₹27,000',   // 15%
      netCreatorShare: '₹1,53,000',   // 85%
      withdrawnTotal: '₹1,40,200',
      availableBalance: '₹12,800',
      settlementStatus: 'Settled'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
          <Wallet className="h-6 w-6 text-[#00F5D4]" />
          Wallet & Settlement Management
        </h2>
        <p className="text-xs text-[#8B8B96] mt-1">
          Manage creator wallet balances, monitor transparent 15% platform fee deductions, and track creator-wise earnings reports.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-2">
          <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider block">Total Platform Commission (15%)</span>
          <h3 className="font-heading font-black text-2xl text-[#FFD60A]">₹6,34,500</h3>
          <p className="text-[11px] text-[#00E676] flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +18.4% this month
          </p>
        </div>

        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-2">
          <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider block">Net Creator Revenue (85%)</span>
          <h3 className="font-heading font-black text-2xl text-[#00E676]">₹35,95,500</h3>
          <p className="text-[11px] text-[#8B8B96]">Settled via Escrow Protection</p>
        </div>

        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-2">
          <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider block">Available Creator Wallet Holds</span>
          <h3 className="font-heading font-black text-2xl text-[#00F5D4]">₹5,84,500</h3>
          <p className="text-[11px] text-[#8B8B96]">Ready for Withdrawal</p>
        </div>
      </div>

      {/* Creator-wise Earnings Report Table */}
      <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] overflow-hidden shadow-2xl space-y-4">
        <div className="p-6 border-b border-[#1C1C26] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white">Creator-wise Revenue & Settlement Breakdown</h3>
            <p className="text-xs text-[#8B8B96]">Transparent 85% creator payout / 15% platform cut audit ledger.</p>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] text-xs font-bold border border-[#00F5D4]/30">
            Escrow Protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0A0F] border-b border-[#1C1C26] text-[#8B8B96] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Gross Earnings</th>
                <th className="px-6 py-4">Platform Fee (15%)</th>
                <th className="px-6 py-4">Net Creator Share (85%)</th>
                <th className="px-6 py-4">Withdrawn Total</th>
                <th className="px-6 py-4">Available Balance</th>
                <th className="px-6 py-4">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C26]">
              {creatorWallets.map((wallet, idx) => (
                <tr key={idx} className="hover:bg-[#1C1C26]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{wallet.creatorName}</div>
                    <div className="text-[10px] text-[#00F5D4] font-mono">{wallet.handle}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-white font-semibold">
                    {wallet.grossEarnings}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#FFD60A] font-bold">
                    {wallet.platformCommission}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#00E676] font-bold">
                    {wallet.netCreatorShare}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#8B8B96]">
                    {wallet.withdrawnTotal}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#00F5D4] font-bold">
                    {wallet.availableBalance}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      wallet.settlementStatus === 'Settled'
                        ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                        : 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                    }`}>
                      {wallet.settlementStatus === 'Settled' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {wallet.settlementStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
