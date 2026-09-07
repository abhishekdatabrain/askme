'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Search,
  Eye,
  Ban,
  X,
  MessageSquare,
  DollarSign,
  Crown,
  Calendar,
  Mail,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { getAdminToken } from '@/utils/cookies';

export default function ViewerManagement() {
  const { toast } = useToast();
  const [viewers, setViewers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal state
  const [selectedViewerId, setSelectedViewerId] = useState(null);
  const [viewerDetail, setViewerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('history'); // 'history' | 'vip'

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    const fetchViewers = async () => {
      setLoading(true);
      try {
        const token = getAdminToken();
        const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : '';
        const statusParam = selectedStatus !== 'All' ? `&status=${selectedStatus.toLowerCase()}` : '';

        const res = await fetch(
          `${API_ENDPOINTS.ADMIN.VIEWERS}?page=${currentPage}&limit=10${searchParam}${statusParam}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.status === 'success' && data.data?.viewers) {
          setViewers(data.data.viewers);
          const pag = data.pagination || data.data?.pagination;
          if (pag) {
            setTotalPages(pag.totalPages || 1);
            setTotalCount(pag.totalCount || 0);
          } else {
            setTotalCount(data.totalCount || data.results || 0);
          }
        }
      } catch (err) {
        console.warn('API fetch viewers warning:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchViewers();
  }, [currentPage, searchQuery, selectedStatus]);

  // Fetch full viewer detail when modal is opened
  const handleOpenDetailModal = async (viewerId) => {
    setSelectedViewerId(viewerId);
    setDetailLoading(true);
    setActiveModalTab('history');
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.VIEWERS}/${viewerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success' && data.data?.viewer) {
        setViewerDetail(data.data.viewer);
      } else {
        toast.error('Failed to load viewer detail.', 'Viewer Error');
      }
    } catch (err) {
      toast.error('Error fetching viewer information.', 'Network Error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleBlock = async (id, currentStatus) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_ENDPOINTS.ADMIN.VIEWERS}/${id}/toggle-block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';

      if (data.status === 'success') {
        toast.warning(`Viewer account status updated to ${newStatus}.`, 'Status Updated');
        setViewers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        );
        if (viewerDetail && viewerDetail.id === id) {
          setViewerDetail((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error('Failed to update viewer status.', 'Error');
    }
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-5 animate-fade-in">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-[#00F5D4]" />
            Viewer Management
          </h2>
          <p className="text-xs text-[#8B8B96] mt-0.5">
            Manage platform viewers, monitor supporter contributions, view donation history & VIP memberships.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0A0F] border border-[#1C1C26] rounded-xl self-start sm:self-auto">
          {['All', 'Active', 'Blocked'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedStatus === st
                  ? 'bg-brand-gradient text-[#0A0A0F] shadow-sm'
                  : 'text-[#8B8B96] hover:text-white'
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8B8B96]" />
        <input
          type="text"
          placeholder="Search viewer by name or email address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0F] border border-[#1C1C26] rounded-xl text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition"
        />
      </div>

      {/* Viewers Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
              <th className="pb-3 px-3">VIEWER</th>
              <th className="pb-3 px-3">EMAIL</th>
              <th className="pb-3 px-3">REGISTRATION DATE</th>
              <th className="pb-3 px-3">TOTAL SPENT</th>
              <th className="pb-3 px-3">QUESTIONS ASKED</th>
              <th className="pb-3 px-3">ACCOUNT STATUS</th>
              <th className="pb-3 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C26]">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-[#8B8B96]">
                  Loading viewers data...
                </td>
              </tr>
            ) : viewers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-[#8B8B96]">
                  No viewers found matching your criteria.
                </td>
              </tr>
            ) : (
              viewers.map((v) => (
                <tr key={v.id} className="hover:bg-[#0A0A0F]/60 transition">
                  <td className="py-3.5 px-3">
                    <div>
                      <span className="font-bold text-white block">{v.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-[#8B8B96]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#8B8B96]" />
                      <span>{v.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-[#8B8B96]">
                    {v.regDate}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-[#00E676]">
                    {v.formattedTotalSpent || `₹${v.totalSpent || 0}`}
                  </td>
                  <td className="py-3.5 px-3 text-white font-semibold">
                    <span className="px-2 py-0.5 rounded-lg bg-[#0A0A0F] border border-[#1C1C26]">
                      💬 {v.totalQuestions || 0}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${v.status === 'Active'
                          ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                          : 'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                        }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details Icon */}
                      <button
                        onClick={() => handleOpenDetailModal(v.id)}
                        title="View Full Viewer Details"
                        className="p-1.5 rounded-lg bg-[#1C1C26] text-[#8B8B96] hover:text-[#00F5D4] hover:bg-[#00F5D4]/10 transition flex items-center gap-1 text-[11px] px-2.5 font-bold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </button>

                      {/* Block / Unblock Icon */}
                      <button
                        onClick={() => handleToggleBlock(v.id, v.status)}
                        title={v.status === 'Blocked' ? 'Unblock Viewer' : 'Block Viewer'}
                        className={`p-1.5 rounded-lg transition ${v.status === 'Blocked'
                            ? 'bg-[#FFD60A]/10 text-[#FFD60A]'
                            : 'bg-[#1C1C26] text-[#8B8B96] hover:text-[#FF3D71] hover:bg-[#FF3D71]/10'
                          }`}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C1C26] text-xs">
        <span className="text-[#8B8B96]">
          Showing <strong className="text-white">{viewers.length}</strong> of{' '}
          <strong className="text-[#00F5D4]">{totalCount}</strong> Viewers (Page {currentPage} of {totalPages})
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white border border-[#2A2A3A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252533] transition"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Comprehensive Viewer Details Modal */}
      {selectedViewerId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start sm:items-center min-h-full py-8">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-2xl w-full max-w-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto animate-scale-up shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  {viewerDetail?.name || 'Viewer Profile'}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${viewerDetail?.status === 'Active'
                        ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                        : 'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                      }`}
                  >
                    {viewerDetail?.status || 'Active'}
                  </span>
                </h3>
                <p className="text-xs text-[#8B8B96]">{viewerDetail?.email}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedViewerId(null);
                  setViewerDetail(null);
                }}
                className="text-[#8B8B96] hover:text-white p-1.5 rounded-xl hover:bg-[#1C1C26] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-[#8B8B96]">Loading viewer detailed information...</div>
            ) : viewerDetail ? (
              <div className="space-y-5 text-xs">
                {/* Stats Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                    <span className="text-[10px] text-[#8B8B96] flex items-center gap-1 font-bold">
                      <DollarSign className="h-3.5 w-3.5 text-[#00E676]" /> TOTAL CONTRIBUTION
                    </span>
                    <p className="text-lg font-extrabold text-[#00E676]">
                      {viewerDetail.formattedTotalSpent || `₹${viewerDetail.totalSpent || 0}`}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                    <span className="text-[10px] text-[#8B8B96] flex items-center gap-1 font-bold">
                      <MessageSquare className="h-3.5 w-3.5 text-[#00F5D4]" /> TOTAL QUESTIONS ASKED
                    </span>
                    <p className="text-lg font-extrabold text-white">
                      {viewerDetail.totalQuestions || 0} Questions
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                    <span className="text-[10px] text-[#8B8B96] flex items-center gap-1 font-bold">
                      <Crown className="h-3.5 w-3.5 text-[#FFD60A]" /> VIP MEMBERSHIPS
                    </span>
                    <p className="text-lg font-extrabold text-[#FFD60A]">
                      {viewerDetail.vipCount || 0} Subscriptions
                    </p>
                  </div>
                </div>

                {/* Account Details Metadata */}
                <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#8B8B96] block">Registration Date</span>
                    <span className="font-semibold text-white">{viewerDetail.regDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B8B96] block">User Role</span>
                    <span className="font-semibold text-[#00F5D4] capitalize">
                      {viewerDetail.role === 'user' || viewerDetail.role === 'viewer' ? 'Viewer' : viewerDetail.role}
                    </span>
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="border-b border-[#1C1C26] flex items-center gap-4">
                  <button
                    onClick={() => setActiveModalTab('history')}
                    className={`pb-2.5 font-bold text-xs border-b-2 transition ${activeModalTab === 'history'
                        ? 'border-[#00F5D4] text-[#00F5D4]'
                        : 'border-transparent text-[#8B8B96] hover:text-white'
                      }`}
                  >
                    Question History ({viewerDetail.donations?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveModalTab('vip')}
                    className={`pb-2.5 font-bold text-xs border-b-2 transition ${activeModalTab === 'vip'
                        ? 'border-[#00F5D4] text-[#00F5D4]'
                        : 'border-transparent text-[#8B8B96] hover:text-white'
                      }`}
                  >
                    VIP Memberships ({viewerDetail.vipMemberships?.length || 0})
                  </button>
                </div>

                {/* Tab 1: Question & Donation History */}
                {activeModalTab === 'history' && (
                  <div className="space-y-3">
                    {!viewerDetail.donations || viewerDetail.donations.length === 0 ? (
                      <div className="py-6 text-center text-[#8B8B96] bg-[#0A0A0F] rounded-xl border border-[#1C1C26]">
                        No question or donation history recorded for this viewer.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                              <th className="pb-2 px-2">CREATOR</th>
                              <th className="pb-2 px-2">AMOUNT</th>
                              <th className="pb-2 px-2">QUESTION / MESSAGE</th>
                              <th className="pb-2 px-2">STATUS</th>
                              <th className="pb-2 px-2 text-right">DATE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1C1C26]">
                            {viewerDetail.donations.map((d) => (
                              <tr key={d.id} className="hover:bg-[#0A0A0F]/60">
                                <td className="py-2.5 px-2 font-bold text-white">
                                  {d.creator?.name || 'Creator Host'}
                                  <span className="text-[10px] text-[#8B8B96] block font-normal">
                                    {d.creator?.username || '@creator'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 font-bold text-[#00E676]">
                                  {d.formattedAmount}
                                </td>
                                <td className="py-2.5 px-2 text-white max-w-xs truncate">
                                  {d.message}
                                </td>
                                <td className="py-2.5 px-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.paymentStatus === 'SUCCESS' || d.paymentStatus === 'SUCCESSFUL'
                                        ? 'bg-[#00E676]/10 text-[#00E676]'
                                        : d.paymentStatus === 'FAILED'
                                          ? 'bg-[#FF3D71]/10 text-[#FF3D71]'
                                          : 'bg-[#FFD60A]/10 text-[#FFD60A]'
                                      }`}
                                  >
                                    {d.paymentStatus}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-right text-[#8B8B96]">
                                  {d.formattedDate || (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: VIP Memberships */}
                {activeModalTab === 'vip' && (
                  <div className="space-y-3">
                    {!viewerDetail.vipMemberships || viewerDetail.vipMemberships.length === 0 ? (
                      <div className="py-6 text-center text-[#8B8B96] bg-[#0A0A0F] rounded-xl border border-[#1C1C26]">
                        This viewer has no active or past VIP memberships.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                              <th className="pb-2 px-2">CREATOR</th>
                              <th className="pb-2 px-2">PLAN & AMOUNT</th>
                              <th className="pb-2 px-2">STATUS</th>
                              <th className="pb-2 px-2 text-right">NEXT BILLING</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1C1C26]">
                            {viewerDetail.vipMemberships.map((v) => (
                              <tr key={v.id} className="hover:bg-[#0A0A0F]/60">
                                <td className="py-2.5 px-2 font-bold text-white">
                                  {v.creator?.name || 'Creator Host'}
                                </td>
                                <td className="py-2.5 px-2 text-white font-semibold">
                                  {v.planName} (₹{v.amount})
                                </td>
                                <td className="py-2.5 px-2 font-bold text-[#FFD60A]">
                                  {v.status}
                                </td>
                                <td className="py-2.5 px-2 text-right text-[#8B8B96]">
                                  {v.nextBillingDate ? new Date(v.nextBillingDate).toLocaleDateString() : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-[#1C1C26] flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedViewerId(null);
                      setViewerDetail(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
