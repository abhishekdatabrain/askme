'use client';

import React, { useState, useEffect } from 'react';
import CreatorSidebar from '@/components/CreatorSidebar';
import { Wallet, DollarSign, Clock, ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, RefreshCw, MessageSquare, ShieldCheck, Search, Filter } from 'lucide-react';
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

  // Payout Withdrawal Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const token = getCreatorToken();
    const u = getCreatorUser();
    let creatorId = u?.id || 1;

    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 500) {
      alert('Minimum withdrawal request amount is ₹500.00.');
      return;
    }

    if (amt > walletData.availableBalance) {
      alert(`Insufficient balance. Your available balance is ₹${walletData.availableBalance.toFixed(2)}.`);
      return;
    }

    try {
      setIsSubmittingWithdraw(true);
      const res = await fetch(API_ENDPOINTS.CREATORS.WALLET_WITHDRAW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          creatorId,
          amount: amt,
          bankAccountInfo: bankInfo || 'HDFC Bank ****4321 / Instant UPI'
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        alert(`Payout Withdrawal Request of ₹${amt.toFixed(2)} submitted successfully! Admin will settle funds directly to your Bank/UPI account.`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        // Update local wallet balance
        setWalletData(prev => ({
          ...prev,
          availableBalance: Math.max(0, prev.availableBalance - amt),
          pendingAmount: prev.pendingAmount + amt
        }));
      } else {
        alert(data.message || 'Failed to submit withdrawal request.');
      }
    } catch (err) {
      alert('Error submitting payout withdrawal request.');
    } finally {
      setIsSubmittingWithdraw(false);
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
        const res = await fetch(`${API_ENDPOINTS.CREATORS.WALLET_DETAILS}?creatorId=${creatorId}`, {
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
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = filterStatus === 'All' || t.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesQuery = searchQuery === '' || 
      t.viewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.donationUuid && t.donationUuid.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      <CreatorSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#00F5D4]" /> Creator Wallet Module
            </h1>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-black shadow-md glow-teal hover:opacity-95 transition flex items-center gap-1.5 shrink-0"
          >
            <ArrowUpRight className="h-4 w-4" /> Request Payout Withdrawal
          </button>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">

          {/* 1. WALLET DASHBOARD CARDS (REQUIREMENT 11) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Total Earnings */}
            <div className="p-5 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2 shadow-xl hover:border-[#00F5D4]/40 transition">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#00F5D4]" /> Total Earnings
              </span>
              <div className="font-heading font-black text-2xl text-white">
                ₹{walletData.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-[#00E676] font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> 85% Net Revenue Share
              </span>
            </div>

            {/* 2. Available Balance */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#13131A] via-[#1A1A26] to-[#13131A] border-2 border-[#00F5D4]/40 space-y-2 shadow-xl glow-teal">
              <span className="text-xs font-bold text-[#00F5D4] flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#00F5D4]" /> Available Balance
              </span>
              <div className="font-heading font-black text-2xl text-[#00F5D4]">
                ₹{walletData.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-[#8B8B96]">Ready for Bank Payout</span>
            </div>

            {/* 3. Pending Amount */}
            <div className="p-5 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2 shadow-xl hover:border-[#FFD60A]/40 transition">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#FFD60A]" /> Pending Amount
              </span>
              <div className="font-heading font-black text-2xl text-[#FFD60A]">
                ₹{walletData.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-[#8B8B96]">Processing & Clearing</span>
            </div>

            {/* 4. Withdrawn Amount */}
            <div className="p-5 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2 shadow-xl hover:border-[#00E676]/40 transition">
              <span className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4 text-[#00E676]" /> Withdrawn Amount
              </span>
              <div className="font-heading font-black text-2xl text-white">
                ₹{walletData.withdrawnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-[#8B8B96]">Settled to Bank Account</span>
            </div>
          </div>

          {/* 2. TRANSACTION HISTORY TABLE (REQUIREMENT 11) */}
          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-5 shadow-xl">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                  <ArrowDownLeft className="h-5 w-5 text-[#00F5D4]" /> Transaction History Ledger
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Detailed history of viewer payments, live paid questions, & gateway statuses.
                </p>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B8B96]" />
                  <input
                    type="text"
                    placeholder="Search supporter or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>

                <div className="flex items-center gap-1 bg-[#0A0A0F] p-1 rounded-xl border border-[#1C1C26]">
                  {['All', 'Successful', 'Pending', 'Failed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        filterStatus === st
                          ? 'bg-[#00F5D4] text-[#0A0A0F]'
                          : 'text-[#8B8B96] hover:text-white'
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
              <div className="p-8 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] text-center space-y-2">
                <Wallet className="h-10 w-10 text-[#8B8B96] mx-auto stroke-1" />
                <h4 className="font-bold text-white text-sm">No Transactions Found</h4>
                <p className="text-xs text-[#8B8B96]">Viewer payments and live question donations will appear here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1C1C26] text-[#8B8B96] uppercase text-[10px] font-extrabold tracking-wider">
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Viewer / Supporter Name</th>
                      <th className="py-3 px-3">Amount Paid</th>
                      <th className="py-3 px-3">Live Stream Message</th>
                      <th className="py-3 px-3 text-right">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C26]">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id || tx.donationUuid} className="hover:bg-[#1A1A26]/50 transition">
                        
                        {/* Date */}
                        <td className="py-3.5 px-3 font-mono text-[#8B8B96] whitespace-nowrap">
                          {tx.date ? new Date(tx.date).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }) : 'Just now'}
                        </td>

                        {/* Viewer Name */}
                        <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                          {tx.viewerName}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-heading font-black text-sm text-[#00E676]">
                            ₹{tx.amount.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-[#8B8B96]">Net (85%): ₹{tx.netAmount.toFixed(2)}</span>
                        </td>

                        {/* Message */}
                        <td className="py-3.5 px-3 max-w-xs">
                          {tx.message ? (
                            <p className="p-2 rounded-xl bg-[#0A0A0F] text-[#00F5D4] italic text-[11px] border border-[#1C1C26] line-clamp-2">
                              "{tx.message}"
                            </p>
                          ) : (
                            <span className="text-[#8B8B96] italic text-[11px]">- No message -</span>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            tx.status === 'Successful'
                              ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                              : tx.status === 'Pending'
                              ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                              : 'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                          }`}>
                            {tx.status === 'Successful' && <CheckCircle2 className="h-3 w-3" />}
                            {tx.status === 'Pending' && <Clock className="h-3 w-3" />}
                            {tx.status === 'Failed' && <XCircle className="h-3 w-3" />}
                            {tx.status}
                          </span>
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

      {/* REQUEST PAYOUT WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 p-4 flex items-center justify-center">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-[#00F5D4]" /> Request Payout Withdrawal
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Settle your available earnings directly to your Bank Account or UPI.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="text-[#8B8B96] hover:text-white p-1 rounded-xl bg-[#1C1C26]"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center justify-between">
                <span className="text-xs text-[#8B8B96] font-bold">Available for Withdrawal:</span>
                <span className="font-heading font-black text-base text-[#00F5D4]">
                  ₹{walletData.availableBalance.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">
                  Withdrawal Amount (₹) <span className="text-[#FF3D71]">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Minimum ₹500"
                  min="500"
                  max={walletData.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-white text-sm font-bold focus:outline-none focus:border-[#00F5D4]"
                  required
                />
                <span className="text-[11px] text-[#8B8B96] mt-1 block">Minimum limit: ₹500.00</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">
                  Bank / UPI Payout Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank A/C ****4321 / UPI: creator@upi"
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-white text-xs font-semibold focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1C1C26]">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold hover:bg-[#252533]"
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
