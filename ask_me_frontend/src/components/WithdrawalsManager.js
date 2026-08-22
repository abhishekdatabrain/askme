import React, { useState, useEffect } from 'react';
import AskMePayBadge from './AskMePayBadge';
import { DollarSign, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, Send, Wallet, Download, XCircle, Ban, RefreshCw, FileText } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { getAdminToken } from '@/utils/cookies';

export default function WithdrawalsManager({ activeSubTab }) {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Status Action Modals
  const [completeModalItem, setCompleteModalItem] = useState(null);
  const [transactionRefInput, setTransactionRefInput] = useState('');

  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.ADMIN.WITHDRAWALS, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.status === 'success' && data.data?.withdrawals) {
        setWithdrawals(data.data.withdrawals.map((w, idx) => ({
          id: w.id ? (w.id.toString().startsWith('WTH') ? w.id : `WTH-${w.id}`) : `WTH-${idx + 500}`,
          rawId: w.rawId || w.id,
          creator: w.creator || w.creatorName || 'Creator Host',
          creatorEmail: w.creatorEmail || '',
          amount: parseFloat(w.amount || 0),
          grossRevenue: w.grossRevenue || `₹${(w.amount || 0).toLocaleString()}`,
          payoutAmount: w.payoutAmount || `₹${(w.amount || 0).toLocaleString()}`,
          platformCut: w.platformCut || '₹0',
          bankDetails: w.bankDetails || 'Bank Account Provided',
          status: (w.status || 'pending').toLowerCase(),
          requestedDate: w.requestedDate
            ? (!isNaN(new Date(w.requestedDate).getTime())
                ? new Date(w.requestedDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                : w.requestedDate)
            : 'Recent',
          transactionReference: w.transactionReference || null,
          rejectionReason: w.rejectionReason || null,
        })));
      }
    } catch (err) {
      console.warn('API fetch withdrawals notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
      setFilter('completed');
    } else if (activeSubTab === 'withdrawals_rejected') {
      setFilter('rejected');
    }
  }, [activeSubTab]);

  // Update Withdrawal Status API call
  const handleUpdateStatusCall = async (id, newStatus, extraData = {}) => {
    const token = getAdminToken();
    const targetW = withdrawals.find(w => w.id === id || w.rawId === id);
    const targetId = targetW?.rawId || id;

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_ENDPOINTS.ADMIN.WITHDRAWALS}/${targetId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: newStatus,
          ...extraData
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        toast.success(`Withdrawal ${targetW?.id || ''} updated to ${newStatus.toUpperCase()}!`, 'Status Updated');
        // Update state locally
        setWithdrawals(prev => prev.map(w => {
          if (w.id === id || w.rawId === id) {
            return {
              ...w,
              status: newStatus === 'paid' ? 'completed' : newStatus,
              transactionReference: extraData.transactionReference || w.transactionReference,
              rejectionReason: extraData.rejectionReason || w.rejectionReason,
            };
          }
          return w;
        }));
      } else {
        toast.error(data.message || 'Failed to update withdrawal status.', 'Error');
      }
    } catch (e) {
      toast.error('Network error updating status.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Completed Modal
  const handleConfirmCompleted = async (e) => {
    e.preventDefault();
    if (!completeModalItem) return;
    await handleUpdateStatusCall(completeModalItem.id, 'completed', {
      transactionReference: transactionRefInput || `UPI-SETTLED-${Date.now()}`
    });
    setCompleteModalItem(null);
    setTransactionRefInput('');
  };

  // Submit Reject Modal
  const handleConfirmRejected = async (e) => {
    e.preventDefault();
    if (!rejectModalItem) return;
    if (!rejectionReasonInput) {
      toast.error('Please enter a reason for rejecting the withdrawal request.', 'Reason Required');
      return;
    }
    await handleUpdateStatusCall(rejectModalItem.id, 'rejected', {
      rejectionReason: rejectionReasonInput
    });
    setRejectModalItem(null);
    setRejectionReasonInput('');
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filter === 'all') return true;
    if (filter === 'paid' || filter === 'completed') return w.status === 'completed' || w.status === 'paid';
    return w.status === filter;
  });

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-4 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFD60A] text-[#0A0A0F] font-bold shadow-md glow-pay">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Withdrawal & Payout Management (Requirement 12)</h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Review requests, verify creator bank details, approve, set processing, mark completed, or reject with balance refund.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'pending', 'approved', 'processing', 'completed', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === st
                  ? 'bg-brand-gradient text-[#0A0A0F]'
                  : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table matching requirement #12 */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
          <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading withdrawal requests...</p>
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#8B8B96] rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
          No withdrawal requests found for filter: <span className="text-white font-bold capitalize">{filter}</span>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                <th className="pb-3 px-2">REQUEST ID</th>
                <th className="pb-3 px-2">CREATOR</th>
                <th className="pb-3 px-2">AMOUNT</th>
                <th className="pb-3 px-2">BANK / UPI INFORMATION</th>
                <th className="pb-3 px-2">STATUS</th>
                <th className="pb-3 px-2 text-right">ACTIONS & STATUS WORKFLOW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C26]">
              {filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-[#0A0A0F]/60 transition">
                  
                  {/* Request ID */}
                  <td className="py-3.5 px-2 font-mono text-[#00F5D4] font-bold">
                    {w.id}
                  </td>

                  {/* Creator Info */}
                  <td className="py-3.5 px-2 font-bold text-white">
                    {w.creator}
                    <span className="block text-[10px] text-[#8B8B96] font-normal">{w.requestedDate}</span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-2 font-bold text-[#00E676]">
                    {w.payoutAmount}
                  </td>

                  {/* Bank Information */}
                  <td className="py-3.5 px-2 text-[#8B8B96] font-medium max-w-xs">
                    {w.bankDetails}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      w.status === 'completed' || w.status === 'paid' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' :
                      w.status === 'approved' ? 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30' :
                      w.status === 'processing' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30' :
                      w.status === 'pending' ? 'bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/40' :
                      'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                    }`}>
                      {w.status === 'completed' || w.status === 'paid' ? 'Completed' : w.status}
                    </span>
                  </td>

                  {/* Action Buttons Workflow */}
                  <td className="py-3.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* PENDING: Approve or Reject */}
                      {w.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatusCall(w.id, 'approved')}
                            className="px-2.5 py-1 rounded-lg bg-[#00F5D4] text-[#0A0A0F] font-bold text-[11px] hover:opacity-90 transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleUpdateStatusCall(w.id, 'processing')}
                            className="px-2.5 py-1 rounded-lg bg-[#FFD60A] text-[#0A0A0F] font-bold text-[11px] hover:opacity-90 transition"
                          >
                            Set Processing
                          </button>

                          <button
                            onClick={() => {
                              setRejectModalItem(w);
                              setRejectionReasonInput('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 font-bold text-[11px] hover:bg-[#FF3D71]/20 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* APPROVED / PROCESSING: Mark Completed or Reject */}
                      {(w.status === 'approved' || w.status === 'processing') && (
                        <>
                          {w.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatusCall(w.id, 'processing')}
                              className="px-2.5 py-1 rounded-lg bg-[#FFD60A] text-[#0A0A0F] font-bold text-[11px] hover:opacity-90 transition"
                            >
                              Set Processing
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setCompleteModalItem(w);
                              setTransactionRefInput('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-brand-gradient text-[#0A0A0F] font-black text-[11px] shadow-sm hover:opacity-90 transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Complete Payment
                          </button>

                          <button
                            onClick={() => {
                              setRejectModalItem(w);
                              setRejectionReasonInput('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 font-bold text-[11px] hover:bg-[#FF3D71]/20 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* COMPLETED or REJECTED */}
                      {(w.status === 'completed' || w.status === 'paid') && (
                        <div className="text-right">
                          <span className="text-[10px] text-[#00E676] font-bold block">Payout Completed</span>
                          {w.transactionReference && (
                            <span className="text-[10px] text-[#8B8B96] font-mono block">Ref: {w.transactionReference}</span>
                          )}
                        </div>
                      )}

                      {w.status === 'rejected' && (
                        <div className="text-right">
                          <span className="text-[10px] text-[#FF3D71] font-bold block">Request Rejected</span>
                          {w.rejectionReason && (
                            <span className="text-[10px] text-[#8B8B96] italic block">"{w.rejectionReason}"</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: MARK WITHDRAWAL COMPLETED */}
      {completeModalItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 p-4 flex items-center justify-center">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#00E676]" /> Complete Payout Transfer
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Confirm bank payout for {completeModalItem.creator} ({completeModalItem.payoutAmount}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompleteModalItem(null)}
                className="text-[#8B8B96] hover:text-white p-1 rounded-xl bg-[#1C1C26]"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCompleted} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                <span className="text-xs text-[#8B8B96] font-bold block">Destination Bank Account:</span>
                <span className="text-xs text-white font-semibold block">{completeModalItem.bankDetails}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8B8B96] mb-1">
                  Bank Transaction Reference / UTR Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR982140192 / BANK-REF-902"
                  value={transactionRefInput}
                  onChange={(e) => setTransactionRefInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-white text-xs font-mono font-bold focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1C1C26]">
                <button
                  type="button"
                  onClick={() => setCompleteModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold hover:bg-[#252533]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-extrabold shadow-md glow-teal hover:opacity-95 flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Mark Payment Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REJECT WITHDRAWAL REQUEST */}
      {rejectModalItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 p-4 flex items-center justify-center">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-[#FF3D71] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Reject Withdrawal Request
                </h3>
                <p className="text-xs text-[#8B8B96] mt-0.5">
                  Reserved funds ({rejectModalItem.payoutAmount}) will be refunded back to creator's available balance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="text-[#8B8B96] hover:text-white p-1 rounded-xl bg-[#1C1C26]"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejected} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Rejection Reason <span className="text-[#FF3D71]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Invalid IFSC Code or Bank Account details provided. Please update bank information."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-white text-xs placeholder-[#8B8B96] focus:outline-none focus:border-[#FF3D71]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1C1C26]">
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold hover:bg-[#252533]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#FF3D71] text-white text-xs font-extrabold shadow-md hover:opacity-95 flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />} Reject & Refund Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
