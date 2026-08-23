'use client';

import React, { useState, useEffect } from 'react';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Wallet,
  Sun,
  Moon
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function AnalyticsPage() {
  const [creator, setCreator] = useState(null);
  const [walletMetrics, setWalletMetrics] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    questionsAnsweredCount: 0,
  });
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_creator_theme', nextTheme);
      window.dispatchEvent(new Event('creator-theme-changed'));
    }
  };

  useEffect(() => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }
    setCreator(u);

    const fetchWallet = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.CREATORS.WALLET_DETAILS}?creatorId=${u.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.data) {
          const w = data.data.wallet || {};
          const txs = data.data.transactions || [];
          const successfulCount = txs.filter(t => t.payment_status === 'Successful' || t.payment_status === 'success').length;
          setWalletMetrics({
            totalEarnings: parseFloat(w.totalEarnings || 0),
            availableBalance: parseFloat(w.availableBalance || 0),
            questionsAnsweredCount: successfulCount || 0,
          });
        }
      } catch (err) { }
    };

    fetchWallet();
  }, []);

  const grossVolume = walletMetrics.totalEarnings > 0 ? (walletMetrics.totalEarnings / 0.85) : 0;
  const platformCut = walletMetrics.totalEarnings > 0 ? (grossVolume * 0.15) : 0;

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#F5F5F7]'
    }`}>
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${
          theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
        }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
              <BarChart3 className="h-5 w-5 text-[#00F5D4]" /> Creator Financial Analytics
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
              Revenue breakdown, platform settlements, and viewer donation volume stats.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2FFF]" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <CreatorNotificationDropdown theme={theme} />
          </div>
        </header>

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          <div className={`p-6 rounded-3xl border space-y-6 shadow-xl ${
            theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
          }`}>
            <div>
              <h3 className={`font-heading font-black text-xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>Revenue & Commission Breakdown</h3>
              <p className="text-xs text-[#8B8B96] mt-0.5">85% creator share model with transparent settlement reporting.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-5 rounded-2xl border space-y-2 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                <span className="text-xs text-[#8B8B96] font-bold block">Gross Broadcast Revenue</span>
                <div className={`font-heading font-extrabold text-2xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                  ₹{grossVolume.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-[#8B8B96]">Total paid viewer donations</span>
              </div>

              <div className={`p-5 rounded-2xl border space-y-2 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                <span className="text-xs text-[#8B8B96] font-bold block">Platform Infrastructure (15%)</span>
                <div className="font-heading font-extrabold text-2xl text-[#FF3D71]">
                  ₹{platformCut.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-[#FF3D71]">Platform maintenance & gateway fee</span>
              </div>

              <div className={`p-5 rounded-2xl border space-y-2 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'}`}>
                <span className="text-xs text-[#8B8B96] font-bold block">Creator Net Earnings (85%)</span>
                <div className="font-heading font-extrabold text-2xl text-[#00E676]">
                  ₹{walletMetrics.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-[#00E676]">Net payout credited to wallet</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
