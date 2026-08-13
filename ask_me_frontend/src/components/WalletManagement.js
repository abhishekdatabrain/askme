import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  DollarSign, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  PieChart,
  FileText
} from 'lucide-react';

export default function WalletManagement({ activeSubTab }) {
  const [activeView, setActiveView] = useState('wallets');

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

  const ledgerEntries = [
    { id: 'LED-001', date: '10 Aug 2026', description: 'AskMail SuperChat Cut (15%)', type: 'Credit', amount: '+₹1,84,500', balance: '₹18,45,000' },
    { id: 'LED-002', date: '09 Aug 2026', description: 'Creator Payout Settlement (TechBurner)', type: 'Debit', amount: '-₹38,250', balance: '₹16,60,500' },
    { id: 'LED-003', date: '08 Aug 2026', description: 'Live Stream QR Question Fee', type: 'Credit', amount: '+₹42,000', balance: '₹16,98,750' },
    { id: 'LED-004', date: '07 Aug 2026', description: 'Platform Maintenance Reserve', type: 'Transfer', amount: '₹10,000', balance: '₹16,56,750' },
  ];

  useEffect(() => {
    if (activeSubTab === 'wallets_ledger') {
      setActiveView('ledger');
    } else {
      setActiveView('wallets');
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#00F5D4]" />
            Wallet Management & Commission Ledger
          </h2>
          <p className="text-xs text-[#8B8B96] mt-0.5">
            Monitor creator net balances, platform 15% commission ledger, and settlement status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('wallets')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'wallets'
                ? 'bg-brand-gradient text-[#0A0A0F]'
                : 'bg-[#13131A] text-[#8B8B96] hover:text-white border border-[#1C1C26]'
            }`}
          >
            Creator Wallets
          </button>
          <button
            onClick={() => setActiveView('ledger')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'ledger'
                ? 'bg-brand-gradient text-[#0A0A0F]'
                : 'bg-[#13131A] text-[#8B8B96] hover:text-white border border-[#1C1C26]'
            }`}
          >
            Wallet Ledger
          </button>
        </div>
      </div>

      {activeView === 'wallets' ? (
        /* Creator Wallets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creatorWallets.map((w, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1C1C26] pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm">{w.creatorName}</h3>
                  <span className="text-xs text-[#8B8B96]">{w.handle}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  w.settlementStatus === 'Settled' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-[#FFD60A]/10 text-[#FFD60A]'
                }`}>
                  {w.settlementStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Gross Earnings</span>
                  <span className="font-bold text-white text-sm">{w.grossEarnings}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Platform Fee (15%)</span>
                  <span className="font-bold text-[#FFD60A] text-sm">{w.platformCommission}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Total Withdrawn</span>
                  <span className="font-bold text-white">{w.withdrawnTotal}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Available Payout</span>
                  <span className="font-bold text-[#00F5D4] text-sm">{w.availableBalance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Ledger Table */
        <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C1C26] pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#00F5D4]" />
              Platform Fee & Wallet Ledger Logs
            </h3>
            <span className="text-xs text-[#8B8B96]">Real-time Accounting Ledger</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                <th className="pb-3 px-2">LEDGER ID</th>
                <th className="pb-3 px-2">DATE</th>
                <th className="pb-3 px-2">DESCRIPTION</th>
                <th className="pb-3 px-2">TYPE</th>
                <th className="pb-3 px-2">AMOUNT</th>
                <th className="pb-3 px-2 text-right">CLOSING BALANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C26]">
              {ledgerEntries.map((l) => (
                <tr key={l.id} className="hover:bg-[#0A0A0F]/60 transition">
                  <td className="py-3 px-2 font-mono text-[#00F5D4] font-bold">{l.id}</td>
                  <td className="py-3 px-2 text-white">{l.date}</td>
                  <td className="py-3 px-2 text-[#8B8B96]">{l.description}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.type === 'Credit' ? 'bg-[#00E676]/10 text-[#00E676]' :
                      l.type === 'Debit' ? 'bg-[#FF3D71]/10 text-[#FF3D71]' :
                      'bg-[#FFD60A]/10 text-[#FFD60A]'
                    }`}>
                      {l.type}
                    </span>
                  </td>
                  <td className={`py-3 px-2 font-bold ${
                    l.amount.startsWith('+') ? 'text-[#00E676]' : 'text-[#FF3D71]'
                  }`}>
                    {l.amount}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-white">{l.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
