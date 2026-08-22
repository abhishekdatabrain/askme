'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { ArrowUpRight, Building2, Clock, CheckCircle2, ArrowLeft, Wallet, RefreshCw, XCircle, ShieldCheck, AlertCircle, FileText, Sun, Moon, Bell } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';

export default function CreatorWithdrawalsPage() {
  const [walletData, setWalletData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingAmount: 0,
    withdrawnAmount: 0,
  });

  const [withdrawals, setWithdrawals] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab: 'history' | 'bank'
  const [activeTab, setActiveTab] = useState('history');

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

  // Payout Withdrawal Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Saved Bank Details Form State
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });
  const [isSavingBank, setIsSavingBank] = useState(false);

  const fetchWithdrawalData = async () => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }

    let creatorId = u.id;

    try {
      setIsLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch Wallet Balances
      const resWallet = await fetch(`${API_ENDPOINTS.CREATORS.WALLET_DETAILS}?creatorId=${creatorId}`, { headers });
      const dataWallet = await resWallet.json();
      if (resWallet.ok && dataWallet.status === 'success' && dataWallet.data) {
        setWalletData(dataWallet.data.wallet || {
          totalEarnings: 0,
          availableBalance: 0,
          pendingAmount: 0,
          withdrawnAmount: 0,
        });
      }

      // 2. Fetch Withdrawal Requests History
      const resWth = await fetch(`${API_ENDPOINTS.CREATORS.WALLET_WITHDRAWALS}?creatorId=${creatorId}`, { headers });
      const dataWth = await resWth.json();
      if (resWth.ok && dataWth.status === 'success' && dataWth.data?.withdrawals) {
        setWithdrawals(dataWth.data.withdrawals);
      }

      // 3. Fetch Saved Bank Account Info
      const resBank = await fetch(`${API_ENDPOINTS.CREATORS.BANK_ACCOUNT}?creatorId=${creatorId}`, { headers });
      const dataBank = await resBank.json();
      if (resBank.ok && dataBank.status === 'success' && dataBank.data?.bankAccount) {
        const b = dataBank.data.bankAccount;
        setBankAccount(b);
        setBankForm({
          accountHolderName: b.account_holder_name || '',
          bankName: b.bank_name || '',
          accountNumber: b.account_number || '',
          ifscCode: b.ifsc_code || '',
          upiId: b.upi_id || '',
        });
        setBankInfo(b.upi_id ? `UPI: ${b.upi_id}` : `${b.bank_name} A/C ****${(b.account_number || '').slice(-4)} (${b.account_holder_name})`);
      }
    } catch (err) {
      console.warn('Withdrawal fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  // Handle Payout Withdrawal Submission
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) return;

    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 500) {
      alert('Minimum withdrawal amount is ₹500.');
      return;
    }

    if (amt > walletData.availableBalance) {
      alert('Insufficient available balance for this withdrawal request.');
      return;
    }

    try {
      setIsSubmittingWithdraw(true);
      const res = await fetch(API_ENDPOINTS.CREATORS.WALLET_WITHDRAWALS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          creatorId: u.id,
          amount: amt,
          bankInfo: bankInfo || 'Bank Payout Details',
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchWithdrawalData();
        alert('Payout withdrawal request submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit withdrawal request.');
      }
    } catch (err) {
      alert('Network error submitting withdrawal request.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Handle Saved Bank Form Submission
  const handleBankSaveSubmit = async (e) => {
    e.preventDefault();
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) return;

    try {
      setIsSavingBank(true);
      const res = await fetch(API_ENDPOINTS.CREATORS.BANK_ACCOUNT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          creatorId: u.id,
          ...bankForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        fetchWithdrawalData();
        alert('Bank details updated successfully!');
      } else {
        alert(data.message || 'Failed to save bank details.');
      }
    } catch (err) {
      alert('Error saving bank account details.');
    } finally {
      setIsSavingBank(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
    }`}>
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors duration-200 ${
          theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
        }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${
              theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
            }`}>
              <ArrowUpRight className="h-5 w-5 text-[#00F5D4]" /> Creator Withdrawal Module
            </h1>
            <p className={`text-xs ${
              theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
            }`}>Request payout settlements, track request statuses, & manage bank accounts</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Icon Popup Dropdown */}
            <CreatorNotificationDropdown theme={theme} />

            {/* Header Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                theme === 'light'
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

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-black shadow-md glow-teal hover:opacity-95 transition flex items-center gap-1.5 shrink-0"
            >
              <ArrowUpRight className="h-4 w-4" /> Request Payout Withdrawal
            </button>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">

          {/* 1. WALLET SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Available Balance */}
            <div className={`p-5 rounded-3xl border-2 space-y-2 shadow-xl glow-teal ${
              theme === 'light'
                ? 'bg-gradient-to-br from-white via-[#F8F9FA] to-white border-[#00F5D4]/60'
                : 'bg-gradient-to-br from-[#13131A] via-[#1A1A26] to-[#13131A] border-[#00F5D4]/40'
            }`}>
              <span className="text-xs font-bold text-[#00F5D4] flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#00F5D4]" /> Available for Withdrawal
              </span>
              <div className="font-heading font-black text-2xl text-[#00F5D4]">
                ₹{walletData.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className={`text-[11px] ${
                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>Ready to Settle to Bank</span>
            </div>

            {/* Pending Withdrawal */}
            <div className={`p-5 rounded-3xl border space-y-2 shadow-xl transition-colors duration-200 ${
              theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>
                <Clock className="h-4 w-4 text-[#FFD60A]" /> Pending Payout Requests
              </span>
              <div className="font-heading font-black text-2xl text-[#FFD60A]">
                ₹{walletData.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className={`text-[11px] ${
                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>Under Admin Verification</span>
            </div>

            {/* Total Withdrawn */}
            <div className={`p-5 rounded-3xl border space-y-2 shadow-xl transition-colors duration-200 ${
              theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>
                <CheckCircle2 className="h-4 w-4 text-[#00E676]" /> Settled Bank Payouts
              </span>
              <div className={`font-heading font-black text-2xl ${
                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
                ₹{walletData.withdrawnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-[#00E676] font-semibold">Completed Transfers</span>
            </div>
          </div>

          {/* 2. TABBED VIEW: WITHDRAWAL HISTORY / BANK DETAILS */}
          <div className={`p-6 rounded-3xl border space-y-5 shadow-xl transition-colors duration-200 ${
            theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
          }`}>
            
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
              theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'bg-brand-gradient text-[#0A0A0F] shadow-md glow-teal'
                      : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D] hover:text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#8B8B96] hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4" /> Withdrawal Requests History ({withdrawals.length})
                </button>

                <button
                  onClick={() => setActiveTab('bank')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'bank'
                      ? 'bg-brand-gradient text-[#0A0A0F] shadow-md glow-teal'
                      : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D] hover:text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#8B8B96] hover:text-white'
                  }`}
                >
                  <Building2 className="h-4 w-4" /> Saved Bank Account Details
                </button>
              </div>

              <button
                onClick={fetchWithdrawalData}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#0A0A0F] border border-[#1C1C26] text-white hover:bg-[#1C1C26]'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#00F5D4]" /> Refresh Statuses
              </button>
            </div>

            {/* TAB 1: WITHDRAWAL REQUESTS HISTORY */}
            {activeTab === 'history' && (
              <div>
                {isLoading ? (
                  <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                    <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p>Loading withdrawal history...</p>
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className={`p-8 rounded-2xl border text-center space-y-3 ${
                    theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}>
                    <ArrowUpRight className="h-10 w-10 text-[#8B8B96] mx-auto stroke-1" />
                    <h4 className={`font-bold text-sm ${
                      theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>No Withdrawal Requests Found</h4>
                    <p className={`text-xs ${
                      theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>
                      Request your first payout withdrawal to transfer available earnings to your bank account.
                    </p>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal"
                    >
                      <ArrowUpRight className="h-4 w-4" /> Request Payout Now
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b uppercase text-[10px] font-extrabold tracking-wider ${
                          theme === 'light' ? 'border-[#E9ECEF] text-[#6C757D]' : 'border-[#1C1C26] text-[#8B8B96]'
                        }`}>
                          <th className="py-3 px-3">Request Date</th>
                          <th className="py-3 px-3">Requested Amount</th>
                          <th className="py-3 px-3">Payout Method / Bank Info</th>
                          <th className="py-3 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        theme === 'light' ? 'divide-[#E9ECEF]' : 'divide-[#1C1C26]'
                      }`}>
                        {withdrawals.map((w) => (
                          <tr key={w.id} className={`transition ${
                            theme === 'light' ? 'hover:bg-[#F8F9FA]' : 'hover:bg-[#1A1A26]/50'
                          }`}>
                            <td className={`py-3.5 px-3 font-mono whitespace-nowrap ${
                              theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                            }`}>
                              {w.createdAt ? new Date(w.createdAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              }) : 'Recent'}
                            </td>

                            <td className="py-3.5 px-3 font-heading font-black text-sm text-[#00E676] whitespace-nowrap">
                              ₹{parseFloat(w.amount || 0).toFixed(2)}
                            </td>

                            <td className={`py-3.5 px-3 font-medium max-w-xs truncate ${
                              theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                            }`}>
                              {w.bankInfo || 'Bank Account Payout'}
                            </td>

                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                w.status === 'completed' || w.status === 'Approved'
                                  ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                                  : w.status === 'rejected' || w.status === 'Rejected'
                                  ? 'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                                  : 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                              }`}>
                                {(w.status === 'completed' || w.status === 'Approved') && <CheckCircle2 className="h-3 w-3" />}
                                {(w.status === 'rejected' || w.status === 'Rejected') && <XCircle className="h-3 w-3" />}
                                {(w.status !== 'completed' && w.status !== 'Approved' && w.status !== 'rejected' && w.status !== 'Rejected') && <Clock className="h-3 w-3" />}
                                {w.status || 'Pending Admin'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SAVED BANK ACCOUNT DETAILS */}
            {activeTab === 'bank' && (
              <div className="space-y-4 max-w-2xl">
                <form onSubmit={handleBankSaveSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${
                      theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>
                      Account Holder Name <span className="text-[#FF3D71]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abhishek Kumar"
                      value={bankForm.accountHolderName}
                      onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                        theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${
                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                      }`}>
                        Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank / ICICI Bank"
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                          theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${
                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                      }`}>
                        Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 50100298410294"
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                          theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${
                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                      }`}>
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0000240"
                        value={bankForm.ifscCode}
                        onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                          theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${
                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                      }`}>
                        UPI ID (Alternative Payout)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. creator@upi"
                        value={bankForm.upiId}
                        onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs text-[#00F5D4] focus:outline-none focus:border-[#00F5D4] ${
                          theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] placeholder-[#8B8B96]'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingBank}
                    className="w-full py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:opacity-95 transition flex items-center justify-center gap-2"
                  >
                    {isSavingBank ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Saving Bank Details...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Save Bank Account & Payout Details
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* REQUEST PAYOUT WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-scale-up ${
            theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
            }`}>
              <div>
                <h3 className={`font-heading font-black text-lg flex items-center gap-2 ${
                  theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                }`}>
                  <ArrowUpRight className="h-5 w-5 text-[#00F5D4]" /> Request Payout Withdrawal
                </h3>
                <p className={`text-xs mt-0.5 ${
                  theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>
                  Settle your available earnings directly to your Bank Account or UPI.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className={`p-1 rounded-xl transition ${
                  theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D] hover:text-[#1A1D20]' : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
                }`}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
              }`}>
                <span className={`text-xs font-bold ${
                  theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>Available for Withdrawal:</span>
                <span className="font-heading font-black text-base text-[#00F5D4]">
                  ₹{walletData.availableBalance.toFixed(2)}
                </span>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${
                  theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>
                  Withdrawal Amount (₹) <span className="text-[#FF3D71]">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Minimum ₹500"
                  min="500"
                  max={walletData.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:border-[#00F5D4] ${
                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                  }`}
                  required
                />
                <span className={`text-[11px] mt-1 block ${
                  theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>Minimum limit: ₹500.00</span>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${
                  theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>
                  Bank / UPI Payout Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank A/C ****4321 / UPI: creator@upi"
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#00F5D4] ${
                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-2 border-t ${
                theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#252533]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-5 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-extrabold shadow-md glow-teal hover:opacity-95 flex items-center gap-1.5"
                >
                  {isSubmittingWithdraw ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Submitting Request...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Submit Payout Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
