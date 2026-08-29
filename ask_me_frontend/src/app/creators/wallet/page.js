'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { Wallet, DollarSign, Clock, ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, RefreshCw, ShieldCheck, Search, Sun, Moon, Bell } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';

export default function CreatorWalletPage() {
  const [walletData, setWalletData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingAmount: 0,
    withdrawnAmount: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Theme State
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
      setTheme(savedTheme);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('creator-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('creator-theme-changed', handleThemeChange);
      }
    };
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

    let creatorId = u.id;

    const fetchWallet = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_ENDPOINTS.CREATORS.WALLET_DETAILS}?creatorId=${creatorId}&status=${filterStatus}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.data) {
          setWalletData(data.data.wallet || {
            totalEarnings: 0,
            availableBalance: 0,
            pendingAmount: 0,
            withdrawnAmount: 0,
          });
          setTransactions(data.data.transactions || []);
        }
      } catch (err) {
        console.warn('Wallet fetch notice:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, [filterStatus]);

  // Filter transactions search query
  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery.trim()) return true;
    const vName = String(t.viewerName || t.viewer_name || '');
    const msg = String(t.message || '');
    const uuidStr = String(t.donationUuid || t.donation_uuid || '');
    const q = searchQuery.toLowerCase();

    return (
      vName.toLowerCase().includes(q) ||
      msg.toLowerCase().includes(q) ||
      uuidStr.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
      }`}>
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors duration-200 ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
              <Wallet className="h-5 w-5 text-[#00F5D4]" /> Creator Wallet Module
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>Real-time viewer ledger & earnings balance overview</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Icon Popup Dropdown */}
            <CreatorNotificationDropdown theme={theme} />

            {/* Header Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${theme === 'light'
                ? 'bg-[#F1F3F5] text-[#212529] border-[#E9ECEF] hover:bg-[#E9ECEF]'
                : 'bg-[#1C1C26] text-white border-[#1C1C26] hover:border-[#00F5D4]/40'
                }`}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-[#FFD60A]" />
                  <span className="hidden sm:inline">Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#7B2FFF]" />
                  <span className="hidden sm:inline">Dark Theme</span>
                </>
              )}
            </button>

            <Link
              href="/creators/withdrawals"
              className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-black shadow-md glow-teal hover:opacity-95 transition flex items-center gap-1.5 shrink-0"
            >
              <ArrowUpRight className="h-4 w-4" /> Go to Withdrawal Module
            </Link>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">

          {/* 1. WALLET DASHBOARD CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* 1. Total Earnings */}
            <div className={`p-5 rounded-3xl border space-y-2 shadow-xl transition-colors duration-200 ${theme === 'light' ? 'bg-white border-[#E9ECEF] hover:border-[#00F5D4]/60' : 'bg-[#13131A] border-[#1C1C26] hover:border-[#00F5D4]/40'
              }`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>
                <DollarSign className="h-4 w-4 text-[#00F5D4]" /> Total Earnings
              </span>
              <div className={`font-heading font-black text-2xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                }`}>
                ₹{walletData.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-[#00E676] font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> 85% Net Revenue Share
              </span>
            </div>

            {/* 2. Available Balance */}
            <div className={`p-5 rounded-3xl border-2 space-y-2 shadow-xl glow-teal ${theme === 'light'
              ? 'bg-gradient-to-br from-white via-[#F8F9FA] to-white border-[#00F5D4]/60'
              : 'bg-gradient-to-br from-[#13131A] via-[#1A1A26] to-[#13131A] border-[#00F5D4]/40'
              }`}>
              <span className="text-xs font-bold text-[#00F5D4] flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#00F5D4]" /> Available Balance
              </span>
              <div className="font-heading font-black text-2xl text-[#00F5D4]">
                ₹{walletData.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className={`text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>Ready for Bank Payout</span>
            </div>

            {/* 3. Pending Amount */}
            <div className={`p-5 rounded-3xl border space-y-2 shadow-xl transition-colors duration-200 ${theme === 'light' ? 'bg-white border-[#E9ECEF] hover:border-[#FFD60A]/60' : 'bg-[#13131A] border-[#1C1C26] hover:border-[#FFD60A]/40'
              }`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>
                <Clock className="h-4 w-4 text-[#FFD60A]" /> Pending Amount
              </span>
              <div className="font-heading font-black text-2xl text-[#FFD60A]">
                ₹{walletData.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className={`text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>Under Admin Settlement</span>
            </div>

            {/* 4. Withdrawn Amount */}
            <div className={`p-5 rounded-3xl border space-y-2 shadow-xl transition-colors duration-200 ${theme === 'light' ? 'bg-white border-[#E9ECEF] hover:border-[#00E676]/60' : 'bg-[#13131A] border-[#1C1C26] hover:border-[#00E676]/40'
              }`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>
                <ArrowUpRight className="h-4 w-4 text-[#00E676]" /> Withdrawn Amount
              </span>
              <div className={`font-heading font-black text-2xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                }`}>
                ₹{walletData.withdrawnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className={`text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>Settled to Bank Account</span>
            </div>
          </div>

          {/* 2. TRANSACTION HISTORY TABLE */}
          <div className={`p-6 rounded-3xl border space-y-5 shadow-xl transition-colors duration-200 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>

            <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
              }`}>
              <div>
                <h3 className={`font-heading font-black text-lg flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                  }`}>
                  <ArrowDownLeft className="h-5 w-5 text-[#00F5D4]" /> Viewer Payments & Ledger
                </h3>
                <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                  }`}>
                  Detailed history of viewer payments, live paid questions, & gateway statuses.
                </p>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:w-56">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`} />
                  <input
                    type="text"
                    placeholder="Search supporter or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light'
                      ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]'
                      : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                      }`}
                  />
                </div>

                <div className={`flex items-center gap-1 p-1 rounded-xl border ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}>
                  {['All', 'Successful', 'Pending', 'Failed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${filterStatus === st
                        ? 'bg-[#00F5D4] text-[#0A0A0F]'
                        : theme === 'light' ? 'text-[#6C757D] hover:text-[#1A1D20]' : 'text-[#8B8B96] hover:text-white'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions Data Table */}
            {isLoading ? (
              <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading transaction history...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className={`p-8 rounded-2xl border text-center space-y-2 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                }`}>
                <Wallet className="h-10 w-10 text-[#8B8B96] mx-auto stroke-1" />
                <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                  }`}>No Transactions Found</h4>
                <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                  }`}>Viewer payments and live question will appear here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b uppercase text-[10px] font-extrabold tracking-wider ${theme === 'light' ? 'border-[#E9ECEF] text-[#6C757D]' : 'border-[#1C1C26] text-[#8B8B96]'
                      }`}>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Viewer / Supporter Name</th>
                      <th className="py-3 px-3">Amount Paid</th>
                      <th className="py-3 px-3">Live Stream Message</th>
                      <th className="py-3 px-3 text-right">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'light' ? 'divide-[#E9ECEF]' : 'divide-[#1C1C26]'
                    }`}>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id || tx.donationUuid} className={`transition ${theme === 'light' ? 'hover:bg-[#F8F9FA]' : 'hover:bg-[#1A1A26]/50'
                        }`}>

                        <td className={`py-3.5 px-3 font-mono whitespace-nowrap ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                          }`}>
                          {tx.date ? new Date(tx.date).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }) : 'Just now'}
                        </td>

                        <td className={`py-3.5 px-3 font-bold whitespace-nowrap ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                          }`}>
                          {tx.viewerName}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-heading font-black text-sm text-[#00E676]">
                            ₹{tx.amount.toFixed(2)}
                          </div>
                          <span className={`text-[10px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                            }`}>Net (85%): ₹{tx.netAmount.toFixed(2)}</span>
                        </td>

                        <td className="py-3.5 px-3 max-w-xs">
                          {tx.message ? (
                            <p className={`p-2 rounded-xl text-[11px] border italic line-clamp-2 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF] text-[#00B49F]' : 'bg-[#0A0A0F] border-[#1C1C26] text-[#00F5D4]'
                              }`}>
                              "{tx.message}"
                            </p>
                          ) : (
                            <span className={`italic text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                              }`}>- No message -</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          {(() => {
                            const st = tx.payment_status || tx.status || 'Successful';
                            const isSuccess = st === 'Successful' || st === 'success';
                            const isPending = st === 'Pending' || st === 'pending';
                            return (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${isSuccess
                                ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                                : isPending
                                  ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                                  : 'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                                }`}>
                                {isSuccess && <CheckCircle2 className="h-3 w-3" />}
                                {isPending && <Clock className="h-3 w-3" />}
                                {!isSuccess && !isPending && <XCircle className="h-3 w-3" />}
                                {st}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
