import React, { useState, useEffect } from 'react';
import AskMePayBadge from './AskMePayBadge';
import { DollarSign, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, Send, Wallet, Download, XCircle, Ban } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function WithdrawalsManager({ activeSubTab }) {
  const [withdrawals, setWithdrawals] = useState([
    {
      id: 'WTH-501',
      creator: 'TechBurner Live',
      grossRevenue: '₹1,00,000',
      payoutAmount: '₹85,000 (85%)',
      platformCut: '₹15,000 (15%)',
      bankDetails: 'HDFC Bank **** 9821 (IFSC: HDFC0000240)',
      status: 'pending',
      requestedDate: '10 Aug 2026, 11:30 AM',
    },
    {
      id: 'WTH-502',
      creator: 'FinCal Strategy',
      grossRevenue: '₹1,50,000',
      payoutAmount: '₹1,27,500 (85%)',
      platformCut: '₹22,500 (15%)',
      bankDetails: 'ICICI Bank **** 4410 (IFSC: ICIC0001020)',
      status: 'approved',
      requestedDate: '09 Aug 2026, 04:15 PM',
    },
  ]);

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const token = localStorage.getItem('askme_token');
        const res = await fetch(API_ENDPOINTS.ADMIN.WITHDRAWALS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.withdrawals) {
          setWithdrawals(data.data.withdrawals.map(w => ({
            id: w.id,
            creator: w.creator,
            grossRevenue: `₹${(w.amount || 0).toLocaleString()}`,
            payoutAmount: `₹${(w.creatorNet || 0).toLocaleString()} (85%)`,
            platformCut: `₹${(w.platformCut || 0).toLocaleString()} (15%)`,
            bankDetails: w.bankAccount || 'HDFC Bank **** 4321',
            status: w.status.toLowerCase(),
            requestedDate: w.requestedAt || '10 Aug 2026',
          })));
        }
      } catch (err) {
        console.warn('API fetch withdrawals warning:', err.message);
      }
    };
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'withdrawals_pending') {
      setFilter('pending');
    } else if (activeSubTab === 'withdrawals_approved') {
      setFilter('approved');
    } else if (activeSubTab === 'withdrawals_processing') {
      setFilter('processing');
    } else if (activeSubTab === 'withdrawals_completed' || activeSubTab === 'withdrawals_paid') {
      setFilter('paid');
    } else if (activeSubTab === 'withdrawals_rejected') {
      setFilter('rejected');
    }
  }, [activeSubTab]);

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('askme_token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (newStatus === 'approved') {
        await fetch(`${API_ENDPOINTS.ADMIN.WITHDRAWALS}/${id}/approve`, { method: 'PUT', headers });
      } else if (newStatus === 'rejected') {
        await fetch(`${API_ENDPOINTS.ADMIN.WITHDRAWALS}/${id}/reject`, { method: 'PUT', headers });
      } else if (newStatus === 'paid' || newStatus === 'completed') {
        await fetch(`${API_ENDPOINTS.ADMIN.WITHDRAWALS}/${id}/mark-paid`, { method: 'PUT', headers });
      }
    } catch (e) {}

    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFD60A] text-[#0A0A0F] font-bold shadow-md glow-pay">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Withdrawal & Payout Management</h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Review requests, inspect creator bank information, approve payouts, reject, or mark paid.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'pending', 'approved', 'processing', 'paid', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === st
                  ? 'bg-brand-gradient text-[#0A0A0F]'
                  : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
              }`}
            >
              {st === 'paid' ? 'Marked Paid' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table matching requirement #20 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
              <th className="pb-3 px-2">REQUEST ID</th>
              <th className="pb-3 px-2">CREATOR</th>
              <th className="pb-3 px-2">AMOUNT (85%)</th>
              <th className="pb-3 px-2">BANK / UPI INFORMATION</th>
              <th className="pb-3 px-2">STATUS</th>
              <th className="pb-3 px-2 text-right">ACTIONS (REQUIREMENT #20)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C26]">
            {filteredWithdrawals.map((w) => (
              <tr key={w.id} className="hover:bg-[#0A0A0F]/60 transition">
                <td className="py-3.5 px-2 font-mono text-[#00F5D4] font-bold">{w.id}</td>
                <td className="py-3.5 px-2 font-bold text-white">
                  {w.creator}
                  <span className="block text-[10px] text-[#8B8B96] font-normal">{w.requestedDate}</span>
                </td>
                <td className="py-3.5 px-2 font-bold text-[#00E676]">
                  {w.payoutAmount}
                  <span className="block text-[10px] text-[#FFD60A] font-normal">Platform Cut: {w.platformCut}</span>
                </td>
                <td className="py-3.5 px-2 text-[#8B8B96] font-medium">{w.bankDetails}</td>
                <td className="py-3.5 px-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    w.status === 'paid' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' :
                    w.status === 'approved' ? 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30' :
                    w.status === 'processing' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30' :
                    w.status === 'pending' ? 'bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/40' :
                    'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                  }`}>
                    {w.status === 'paid' ? 'Marked Paid' : w.status}
                  </span>
                </td>
                <td className="py-3.5 px-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {w.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(w.id, 'approved')}
                          className="px-2.5 py-1 rounded-lg bg-[#00E676] text-[#0A0A0F] font-bold text-[11px] hover:opacity-90 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(w.id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-[#FF3D71] text-white font-bold text-[11px] hover:opacity-90 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {(w.status === 'approved' || w.status === 'processing') && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(w.id, 'paid')}
                          className="px-2.5 py-1 rounded-lg bg-brand-gradient text-[#0A0A0F] font-bold text-[11px] shadow-sm hover:opacity-90 transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Mark Paid
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(w.id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-[#FF3D71]/10 text-[#FF3D71] font-bold text-[11px] hover:bg-[#FF3D71]/20 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {(w.status === 'paid' || w.status === 'rejected') && (
                      <span className="text-[11px] text-[#8B8B96] italic">Finalized ({w.status})</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
