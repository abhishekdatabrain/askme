'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import {
  Wallet,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Search,
  Sun,
  Moon,
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Lock,
  RotateCcw
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';

export default function CreatorWalletPage() {
  const [walletData, setWalletData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingAmount: 0,
    withdrawnAmount: 0,
  });

  const [currentSettlement, setCurrentSettlement] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Active View Tab: 'ledger' | 'settlements'
  const [activeTab, setActiveTab] = useState('ledger');

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

  const fetchWallet = async (targetPage = 1) => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }

    let creatorId = u.id;

    try {
      setIsLoading(true);
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery.trim())}` : '';
      const res = await fetch(`${API_ENDPOINTS.CREATORS.WALLET_DETAILS}?creatorId=${creatorId}&status=${filterStatus}&page=${targetPage}&limit=10${searchParam}`, {
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
        setCurrentSettlement(data.data.currentSettlement || null);
        setTransactions(data.data.transactions || []);
        setSettlements(data.data.settlements || []);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
          setPage(data.data.pagination.page);
        }
      }
    } catch (err) {
      console.warn('Wallet fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchWallet(newPage);
  };

  // CSV Exporter for Ledger & Monthly Settlements
  const handleDownloadCSV = () => {
    if (activeTab === 'ledger') {
      if (!transactions || transactions.length === 0) {
        alert('No transaction data available to download.');
        return;
      }

      const headers = [
        'Sr No',
        'Date & Time',
        'Viewer / Supporter Name',
        'Gross Amount (INR)',
        'Creator Net Share 85% (INR)',
        'Live Stream Message',
        'Payment Status'
      ];

      const rows = transactions.map((tx, index) => [
        index + 1,
        `"${tx.date ? new Date(tx.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}"`,
        `"${(tx.viewerName || '').replace(/"/g, '""')}"`,
        tx.amount ? tx.amount.toFixed(2) : '0.00',
        tx.netAmount ? tx.netAmount.toFixed(2) : '0.00',
        `"${(tx.message || '').replace(/"/g, '""')}"`,
        `"${(tx.payment_status || tx.status || 'Successful').replace(/"/g, '""')}"`
      ]);

      const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `creator_ledger_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (!settlements || settlements.length === 0) {
        alert('No monthly settlement history available to download.');
        return;
      }

      const headers = [
        'Sr No',
        'Earning Month',
        'Settlement Month',
        'Gross Earning (INR)',
        'Platform Fee 15% (INR)',
        'Creator Net Earning 85% (INR)',
        'Previous Carried Balance (INR)',
        'Available Amount (INR)',
        'Withdrawn Amount (INR)',
        'Remaining Carried Forward (INR)',
        'Single Withdrawal Status',
        'Settlement Date'
      ];

      const rows = settlements.map((s, index) => [
        index + 1,
        `"${s.earningMonth || ''}"`,
        `"${s.settlementMonth || ''}"`,
        s.grossAmount ? s.grossAmount.toFixed(2) : '0.00',
        s.commissionAmount ? s.commissionAmount.toFixed(2) : '0.00',
        s.netAmount ? s.netAmount.toFixed(2) : '0.00',
        s.previousCarriedBalance ? s.previousCarriedBalance.toFixed(2) : '0.00',
        s.availableAmount ? s.availableAmount.toFixed(2) : '0.00',
        s.withdrawnAmount ? s.withdrawnAmount.toFixed(2) : '0.00',
        s.remainingAmount ? s.remainingAmount.toFixed(2) : '0.00',
        s.hasWithdrawn ? '"Already Withdrawn"' : '"Withdrawal Available"',
        `"${s.settledAt ? new Date(s.settledAt).toLocaleString('en-IN') : ''}"`
      ]);

      const csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `creator_monthly_settlements_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    fetchWallet(1);
  }, [filterStatus, searchQuery]);

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors duration-200 ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
              <Wallet className="h-5 w-5 text-[#00F5D4]" /> Creator Wallet Module
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>Real-time viewer ledger, carried-forward balances & monthly settlement cycle</p>
          </div>

          <div className="flex items-center gap-3">
            <CreatorNotificationDropdown theme={theme} />

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
              <ArrowUpRight className="h-4 w-4" /> Go to Payout Withdrawal
            </Link>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">

          {/* 1. WALLET DASHBOARD CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* 1. Total Lifetime Earnings */}
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
                <ShieldCheck className="h-3.5 w-3.5" /> 85% Net Revenue Lifetime
              </span>
            </div>

            {/* 2. Available Balance (Settlement + Carried Forward) */}
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
                }`}>Includes Carried-Forward Balance</span>
            </div>

            {/* 3. Pending Amount (Current Month Unsettled) */}
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
                }`}>Under Monthly Settlement</span>
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
                }`}>Transferred to Bank Account</span>
            </div>
          </div>



          {/* 3. TABBED VIEW: VIEWER LEDGER vs MONTHLY SETTLEMENT HISTORY */}
          <div className={`p-6 rounded-3xl border space-y-5 shadow-xl transition-colors duration-200 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>

            <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
              }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'ledger'
                    ? 'bg-brand-gradient text-[#0A0A0F] shadow-md glow-teal'
                    : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D] hover:text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#8B8B96] hover:text-white'
                    }`}
                >
                  <ArrowDownLeft className="h-4 w-4" /> Viewer Payments & Ledger ({transactions.length})
                </button>

                <button
                  onClick={() => setActiveTab('settlements')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'settlements'
                    ? 'bg-brand-gradient text-[#0A0A0F] shadow-md glow-teal'
                    : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D] hover:text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#8B8B96] hover:text-white'
                    }`}
                >
                  <Calendar className="h-4 w-4" /> Monthly Settlements History ({settlements.length})
                </button>
              </div>

              {/* Controls: Search, Filters & Download CSV */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {activeTab === 'ledger' && (
                  <>
                    <div className="relative flex-1 md:w-48">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                        }`} />
                      <input
                        type="text"
                        placeholder="Search supporter..."
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
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${filterStatus === st
                            ? 'bg-[#00F5D4] text-[#0A0A0F]'
                            : theme === 'light' ? 'text-[#6C757D] hover:text-[#1A1D20]' : 'text-[#8B8B96] hover:text-white'
                            }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button
                  onClick={handleDownloadCSV}
                  title={activeTab === 'ledger' ? 'Download Ledger CSV' : 'Download Monthly Settlements CSV'}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs hover:opacity-90 transition flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Download className="h-4 w-4" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* TAB 1: VIEWER PAYMENTS & LEDGER */}
            {activeTab === 'ledger' && (
              <div>
                {isLoading ? (
                  <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                    <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p>Loading transaction history...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className={`p-8 rounded-2xl border text-center space-y-2 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}>
                    <Wallet className="h-10 w-10 text-[#8B8B96] mx-auto stroke-1" />
                    <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                      }`}>No Transactions Found</h4>
                    <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>Viewer payments and live question will appear here in real-time.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b uppercase text-[10px] font-extrabold tracking-wider ${theme === 'light' ? 'border-[#E9ECEF] text-[#6C757D]' : 'border-[#1C1C26] text-[#8B8B96]'
                            }`}>
                            <th className="py-3 px-3">Sr No</th>
                            <th className="py-3 px-3">Date & Time</th>
                            <th className="py-3 px-3">Viewer / Supporter Name</th>
                            <th className="py-3 px-3">Amount Paid</th>
                            <th className="py-3 px-3">Live Stream Message</th>
                            <th className="py-3 px-3 text-right">Payment Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'light' ? 'divide-[#E9ECEF]' : 'divide-[#1C1C26]'
                          }`}>
                          {transactions.map((tx, idx) => (
                            <tr key={tx.id || tx.donationUuid} className={`transition ${theme === 'light' ? 'hover:bg-[#F8F9FA]' : 'hover:bg-[#1A1A26]/50'
                              }`}>
                              <td className="py-3.5 px-3 font-mono font-bold text-[#8B8B96]">
                                {(page - 1) * 10 + idx + 1}
                              </td>

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

                    {/* PAGINATION CONTROLS */}
                    {pagination && (
                      <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                        }`}>
                        <div className="text-xs text-[#8B8B96]">
                          Showing Page <span className="font-bold text-[#00F5D4]">{pagination.page}</span> of{' '}
                          <span className="font-bold">{pagination.totalPages}</span> ({pagination.totalCount} total transactions)
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${pagination.hasPrevPage
                              ? theme === 'light'
                                ? 'bg-white border-[#E9ECEF] text-[#1A1D20] hover:bg-[#F8F9FA]'
                                : 'bg-[#0A0A0F] border-[#1C1C26] text-white hover:border-[#00F5D4]/50'
                              : 'opacity-40 cursor-not-allowed border-transparent text-[#8B8B96]'
                              }`}
                          >
                            <ChevronLeft className="h-4 w-4" /> Previous
                          </button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center transition ${pageNum === pagination.page
                                  ? 'bg-brand-gradient text-[#0A0A0F] shadow-md glow-teal'
                                  : theme === 'light'
                                    ? 'bg-white border border-[#E9ECEF] text-[#6C757D] hover:bg-[#F8F9FA]'
                                    : 'bg-[#0A0A0F] border border-[#1C1C26] text-[#8B8B96] hover:text-white'
                                  }`}
                              >
                                {pageNum}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${pagination.hasNextPage
                              ? theme === 'light'
                                ? 'bg-white border-[#E9ECEF] text-[#1A1D20] hover:bg-[#F8F9FA]'
                                : 'bg-[#0A0A0F] border-[#1C1C26] text-white hover:border-[#00F5D4]/50'
                              : 'opacity-40 cursor-not-allowed border-transparent text-[#8B8B96]'
                              }`}
                          >
                            Next <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 2: MONTHLY SETTLEMENTS HISTORY */}
            {activeTab === 'settlements' && (
              <div>
                {settlements.length === 0 ? (
                  <div className={`p-8 rounded-2xl border text-center space-y-2 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}>
                    <Calendar className="h-10 w-10 text-[#8B8B96] mx-auto stroke-1" />
                    <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                      }`}>No Monthly Settlements Yet</h4>
                    <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>Monthly settlements are processed automatically on the 1st of every month.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b uppercase text-[10px] font-extrabold tracking-wider ${theme === 'light' ? 'border-[#E9ECEF] text-[#6C757D]' : 'border-[#1C1C26] text-[#8B8B96]'
                          }`}>
                          <th className="py-3 px-3">Sr No</th>
                          <th className="py-3 px-3">Earning Month</th>
                          <th className="py-3 px-3">Settlement Month</th>
                          <th className="py-3 px-3">Net Earning (85%)</th>
                          <th className="py-3 px-3">Prev Carried Bal</th>
                          <th className="py-3 px-3">Available Amount</th>
                          <th className="py-3 px-3">Withdrawn</th>
                          <th className="py-3 px-3">Remaining Carried</th>
                          <th className="py-3 px-3 text-right">Cycle Payout Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'light' ? 'divide-[#E9ECEF]' : 'divide-[#1C1C26]'
                        }`}>
                        {settlements.map((s, idx) => (
                          <tr key={s.id || s.settlementMonth} className={`transition ${theme === 'light' ? 'hover:bg-[#F8F9FA]' : 'hover:bg-[#1A1A26]/50'
                            }`}>
                            <td className="py-3.5 px-3 font-mono font-bold text-[#8B8B96]">
                              {idx + 1}
                            </td>

                            <td className={`py-3.5 px-3 font-bold whitespace-nowrap ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                              }`}>
                              {s.earningMonth}
                            </td>

                            <td className="py-3.5 px-3 font-bold text-[#00F5D4] whitespace-nowrap">
                              {s.settlementMonth}
                            </td>

                            <td className="py-3.5 px-3 font-heading font-extrabold text-white">
                              ₹{(s.netAmount || 0).toFixed(2)}
                            </td>

                            <td className="py-3.5 px-3 font-heading font-extrabold text-[#FFD60A]">
                              ₹{(s.previousCarriedBalance || 0).toFixed(2)}
                            </td>

                            <td className="py-3.5 px-3 font-heading font-black text-[#00E676]">
                              ₹{(s.availableAmount || 0).toFixed(2)}
                            </td>

                            <td className="py-3.5 px-3 font-heading font-black text-[#FF3D71]">
                              ₹{(s.withdrawnAmount || 0).toFixed(2)}
                            </td>

                            <td className="py-3.5 px-3 font-heading font-black text-[#00F5D4]">
                              ₹{(s.remainingAmount || 0).toFixed(2)}
                            </td>

                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              {s.hasWithdrawn ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30">
                                  <Lock className="h-3 w-3" /> Already Withdrawn
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                                  <CheckCircle2 className="h-3 w-3" /> Withdrawal Available
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
