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
  FileText,
  Edit3,
  PlusCircle,
  ShieldCheck,
  RefreshCw,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { getAdminToken } from '@/utils/cookies';

export default function WalletManagement({ activeSubTab }) {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState('wallets');
  const [isLoading, setIsLoading] = useState(true);
  const [creatorWallets, setCreatorWallets] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);

  // Modal for editing creator balance
  const [selectedWalletModal, setSelectedWalletModal] = useState(null);
  const [editBalanceInput, setEditBalanceInput] = useState('');
  const [bonusCreditInput, setBonusCreditInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchWallets = async (pageParam = currentPage) => {
    try {
      setIsLoading(true);
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.WALLETS}?page=${pageParam}&limit=10`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.wallets) {
        setCreatorWallets(data.data.wallets);
        const pag = data.pagination || data.data?.pagination;
        if (pag) {
          setTotalPages(pag.totalPages || 1);
          setTotalCount(pag.totalCount || 0);
        } else {
          setTotalCount(data.totalCount || data.total || 0);
        }
      } else {
        setCreatorWallets([]);
      }
    } catch (err) {
      console.warn('Admin wallets fetch notice:', err.message);
      setCreatorWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (activeSubTab === 'wallets_ledger') {
      setActiveView('ledger');
    } else {
      setActiveView('wallets');
    }
  }, [activeSubTab]);

  // Overall Earnings Report Totals
  const totalGrossRevenue = creatorWallets.reduce((acc, w) => acc + (w.grossEarnings || 0), 0);
  const totalPlatformCut = Math.round(totalGrossRevenue * 0.15);
  const totalCreatorNet = Math.round(totalGrossRevenue * 0.85);
  const totalAvailableBalance = creatorWallets.reduce((acc, w) => acc + (w.availableBalance || 0), 0);

  // Handle Admin Balance Edit / Bonus Credit
  const handleSaveBalanceEdit = async (e) => {
    e.preventDefault();
    if (!selectedWalletModal) return;

    try {
      setIsUpdating(true);
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.CREATORS}/${selectedWalletModal.creatorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          availableBalance: parseFloat(editBalanceInput || selectedWalletModal.availableBalance),
          bonusCredit: parseFloat(bonusCreditInput || 0)
        })
      });

      const data = await res.json();
      const updatedBalance = parseFloat(editBalanceInput || selectedWalletModal.availableBalance) + parseFloat(bonusCreditInput || 0);

      // Update local state
      setCreatorWallets(prev => prev.map(w => {
        if (w.creatorId === selectedWalletModal.creatorId) {
          return {
            ...w,
            availableBalance: updatedBalance,
            settlementStatus: 'Settled'
          };
        }
        return w;
      }));

      toast.success(`Updated balance for ${selectedWalletModal.creatorName} to ₹${updatedBalance.toLocaleString()}`, 'Balance Saved!');
      setSelectedWalletModal(null);
      setEditBalanceInput('');
      setBonusCreditInput('');
    } catch (err) {
      toast.error('Failed to update creator balance.', 'Error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* 1. System Earnings Overview Header (Requirement 19: Earnings Report) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#13131A] via-[#1A1A26] to-[#13131A] border border-[#1C1C26] shadow-xl space-y-4">
        <div className="border-b border-[#1C1C26] pb-4">
          <div>
            <h2 className="text-xl font-heading font-black text-white flex items-center gap-2">
              <Wallet className="h-6 w-6 text-[#00F5D4]" /> System Earnings & Revenue Settlement Report
            </h2>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Live tracking of viewer donations, 15% platform cut, 85% creator payouts, & wallet balance settlements.
            </p>
          </div>
        </div>

        {/* System Totals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
            <span className="text-[11px] font-bold text-[#8B8B96] flex items-center gap-1">
              <PieChart className="h-3.5 w-3.5 text-[#FFD60A]" /> Platform Cut (15%)
            </span>
            <div className="font-heading font-black text-xl text-[#FFD60A]">
              ₹{totalPlatformCut.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#00E676] font-semibold">System Net Revenue</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
            <span className="text-[11px] font-bold text-[#8B8B96] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00E676]" /> Creator Net Share (85%)
            </span>
            <div className="font-heading font-black text-xl text-white">
              ₹{totalCreatorNet.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#8B8B96]">Total Creator Allocation</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
            <span className="text-[11px] font-bold text-[#8B8B96] flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-[#00F5D4]" /> Available for Settlement
            </span>
            <div className="font-heading font-black text-xl text-[#00F5D4]">
              ₹{totalAvailableBalance.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-[#8B8B96]">Pending Creator Payouts</span>
          </div>
        </div>
      </div>

      {/* 2. CREATOR WISE REVENUE TABLE & BALANCE MANAGEMENT */}
      <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1C1C26] pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00F5D4]" /> Creator Wise Revenue & Wallet Balances
            </h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Admin can edit creator balances, adjust platform commission cuts, & trigger settlements.
            </p>
          </div>
          <span className="text-xs font-bold text-[#00F5D4] bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/30">
            {creatorWallets.length} Creators Listed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creatorWallets.map((w) => (
            <div key={w.creatorId} className="p-5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-4 hover:border-[#00F5D4]/40 transition">
              <div className="flex items-center justify-between border-b border-[#1C1C26] pb-3">
                <div>
                  <h4 className="font-heading font-black text-base text-white">{w.creatorName}</h4>
                  <span className="text-xs text-[#00F5D4] font-semibold">{w.handle}</span>
                </div>
                <div className="flex items-center gap-2">
                  {w.settlementStatus ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      w.settlementStatus === 'Settled' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' : 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                    }`}>
                      {w.settlementStatus}
                    </span>
                  ) : null}

                  <button
                    onClick={() => {
                      setSelectedWalletModal(w);
                      setEditBalanceInput((w.availableBalance || 0).toString());
                      setBonusCreditInput('0');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#1C1C26] text-white text-xs font-bold hover:bg-[#00F5D4] hover:text-[#0A0A0F] transition flex items-center gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit Balance
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#13131A] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block font-semibold">Gross Raised</span>
                  <span className="font-heading font-black text-white text-sm">₹{(w.grossEarnings || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#13131A] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block font-semibold">Platform Fee (15%)</span>
                  <span className="font-heading font-black text-[#FFD60A] text-sm">₹{(w.platformCommission || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#13131A] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block font-semibold">Creator Net Share (85%)</span>
                  <span className="font-heading font-black text-[#00E676] text-sm">₹{(w.netCreatorShare || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#13131A] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block font-semibold">Available Balance</span>
                  <span className="font-heading font-black text-[#00F5D4] text-sm">₹{(w.availableBalance || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION CONTROLS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C1C26] text-xs">
          <span className="text-[#8B8B96]">
            Showing <strong className="text-white">{creatorWallets.length}</strong> of <strong className="text-[#00F5D4]">{totalCount}</strong> Wallets (Page {currentPage} of {totalPages})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white border border-[#2A2A3A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252533] transition"
            >
              ← Previous
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] font-bold text-[#00F5D4]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white border border-[#2A2A3A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252533] transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* 3. ADMIN EDIT CREATOR BALANCE MODAL */}
      {selectedWalletModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 p-4 flex items-center justify-center">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#00F5D4]" /> Manage Balance: {selectedWalletModal.creatorName}
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Admin manual balance adjustment & bonus settlement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWalletModal(null)}
                className="text-[#8B8B96] hover:text-white p-1 rounded-xl bg-[#1C1C26]"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBalanceEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">Available Wallet Balance (₹)</label>
                <input
                  type="number"
                  value={editBalanceInput}
                  onChange={(e) => setEditBalanceInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-white text-sm font-bold focus:outline-none focus:border-[#00F5D4]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">Bonus / Adjustment Credit (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500 or 0"
                  value={bonusCreditInput}
                  onChange={(e) => setBonusCreditInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-[#00F5D4] text-sm font-bold focus:outline-none focus:border-[#00F5D4]"
                />
                <span className="text-[11px] text-[#8B8B96]">Bonus credit will be added to available balance instantly.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1C1C26]">
                <button
                  type="button"
                  onClick={() => setSelectedWalletModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold hover:bg-[#252533]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-extrabold shadow-md glow-teal hover:opacity-95 flex items-center gap-1.5"
                >
                  {isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save Balance Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
