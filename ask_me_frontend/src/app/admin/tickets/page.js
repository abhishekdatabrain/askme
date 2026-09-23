'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Ticket,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  User,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  Eye,
  Check,
  X,
  Send,
  HelpCircle,
  Lock,
  Sparkles,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';

function AdminTicketsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams?.get('type') === 'payout' ? 'payout' : 'all'); // 'all' | 'payout' | 'creator' | 'viewer'
  const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || 'all'); // 'all' | 'unread' | 'read' | 'replied' | 'archived'

  // Selected ticket for modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const typeParam = searchParams?.get('type');
    const statusParam = searchParams?.get('status');
    if (typeParam === 'payout') setCategoryFilter('payout');
    if (statusParam) setStatusFilter(statusParam);
  }, [searchParams]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const endpoint = API_ENDPOINTS?.TICKETS?.ADMIN_ALL || 'http://localhost:5000/api/tickets/admin/all';

      const res = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const rawMessages = data?.data || data?.tickets || data?.messages || [];
      setTickets(Array.isArray(rawMessages) ? rawMessages : []);
      setFetchError(null);
    } catch (err) {
      console.error('Fetch Tickets Error:', err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const token = getAdminToken();
      const endpoint = API_ENDPOINTS?.TICKETS?.UPDATE_STATUS?.(id) || `http://localhost:5000/api/tickets/admin/${id}/status`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update ticket status');
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );

      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
      }

      if (toast?.success) {
        toast.success(`Ticket status updated to ${newStatus}`, 'Status Updated');
      }
    } catch (err) {
      console.error('Update Ticket Status Error:', err);
      if (toast?.error) {
        toast.error(err.message || 'Failed to update status', 'Error');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprovePayout = async (id) => {
    try {
      setUpdatingId(id);
      const token = getAdminToken();
      const endpoint = API_ENDPOINTS?.TICKETS?.APPROVE_PAYOUT?.(id) || `http://localhost:5000/api/tickets/admin/${id}/approve-payout`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to approve payout ticket');
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'replied', admin_notes: 'Payout details unlocked & reset by Admin.' } : t))
      );

      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket((prev) => ({ ...prev, status: 'replied', admin_notes: 'Payout details unlocked & reset by Admin.' }));
      }

      if (toast?.success) {
        toast.success(`Payout details unlocked successfully for Creator! Ticket #${id} marked as resolved.`, 'Payout Approved');
      }
    } catch (err) {
      console.error('Approve Payout Error:', err);
      if (toast?.error) {
        toast.error(err.message || 'Failed to approve payout request', 'Error');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to check if ticket is a Payout Change Request
  const isPayoutTicket = (t) => {
    if (t.category === 'Payout Change' || t.category === 'payout_change' || t.category === 'payout') return true;
    const subject = String(t.subject || '').toLowerCase();
    const message = String(t.message || '').toLowerCase();
    return subject.includes('payout') || subject.includes('bank') || subject.includes('upi') ||
           message.includes('payout change') || message.includes('bank account') || message.includes('upi id');
  };

  // Filtered Tickets List
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Category Filter
      if (categoryFilter === 'payout' && !isPayoutTicket(t)) return false;
      if (categoryFilter === 'creator' && !String(t.role || '').toLowerCase().includes('streamer') && !String(t.role || '').toLowerCase().includes('creator')) return false;
      if (categoryFilter === 'viewer' && (String(t.role || '').toLowerCase().includes('streamer') || String(t.role || '').toLowerCase().includes('creator'))) return false;

      // Status Filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = String(t.id).includes(q) || `#tck-${t.id}`.includes(q);
        const matchesName = t.name?.toLowerCase().includes(q);
        const matchesEmail = t.email?.toLowerCase().includes(q);
        const matchesSubject = t.subject?.toLowerCase().includes(q);
        const matchesMessage = t.message?.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesSubject && !matchesMessage) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, categoryFilter, statusFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = tickets.length;
    const payoutRequests = tickets.filter(isPayoutTicket).length;
    const unread = tickets.filter((t) => t.status === 'unread').length;
    const resolved = tickets.filter((t) => t.status === 'replied').length;
    return { total, payoutRequests, unread, resolved };
  }, [tickets]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 w-full max-w-7xl mx-auto">
      
      {/* MODULE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#202032] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#EB1000]/15 border border-[#EB1000]/40 text-[#EB1000] shadow-md shadow-[#EB1000]/20">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight flex items-center gap-2">
                Support &amp; Payout Tickets Module
              </h1>
              <p className="text-xs text-[#8E8E9F] mt-0.5">
                Centralized hub for creator bank payout change requests, support tickets and user inquiries.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchTickets}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#161622] hover:bg-[#202032] border border-[#28283C] text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#00F5D4] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-xl">
          <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">
            Total Tickets Raised
          </span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              {metrics.total}
            </span>
            <Ticket className="h-5 w-5 text-[#8E8E9F]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1F1015] border border-[#EB1000]/40 space-y-1 shadow-xl">
          <span className="text-[11px] font-bold text-[#EB1000] uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Payout Change Requests
          </span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#EB1000]">
              {metrics.payoutRequests}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#EB1000] text-white text-[9px] font-black uppercase">
              HIGH PRIORITY
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-xl">
          <span className="text-[11px] font-bold text-[#FFD60A] uppercase tracking-wider flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD60A] animate-pulse"></span>
            Pending / Unread
          </span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#FFD60A]">
              {metrics.unread}
            </span>
            <AlertCircle className="h-5 w-5 text-[#FFD60A]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-xl">
          <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider block">
            Resolved / Replied
          </span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#10B981]">
              {metrics.resolved}
            </span>
            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
          </div>
        </div>
      </div>

      {/* FILTER CATEGORY TABS & SEARCH BAR */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#202032]">
          {[
            { id: 'all', label: 'All Tickets', count: tickets.length },
            { id: 'payout', label: '🔒 Payout Change Requests', count: tickets.filter(isPayoutTicket).length, isAlert: true },
            { id: 'creator', label: '🎥 Creator Tickets', count: tickets.filter(t => String(t.role || '').toLowerCase().includes('streamer') || String(t.role || '').toLowerCase().includes('creator')).length },
            { id: 'viewer', label: '👤 Viewer Tickets', count: tickets.filter(t => !String(t.role || '').toLowerCase().includes('streamer') && !String(t.role || '').toLowerCase().includes('creator')).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                categoryFilter === tab.id
                  ? tab.isAlert
                    ? 'bg-[#EB1000] text-white shadow-lg shadow-[#EB1000]/30 font-black'
                    : 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white shadow-lg shadow-[#EB1000]/30 font-black'
                  : 'bg-[#0D0D14] text-[#8E8E9F] hover:text-white border border-[#222234]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                categoryFilter === tab.id ? 'bg-black/30 text-white' : 'bg-[#1C1C2A] text-[#8E8E9F]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0D0D14] p-4 rounded-2xl border border-[#222234]">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search ticket #ID, creator name, email, phone or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-8 rounded-xl bg-[#161622] border border-[#28283C] text-xs text-white placeholder-[#6E6E80] focus:outline-none focus:border-[#EB1000] transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7A7A8E]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A7A8E] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-[#8E8E9F] shrink-0">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-[#161622] border border-[#28283C] text-xs font-bold text-white focus:outline-none focus:border-[#EB1000] w-full sm:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread / Pending</option>
              <option value="read">Read / Under Review</option>
              <option value="replied">Replied / Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* TICKETS TABLE */}
      <div className="rounded-3xl bg-[#0D0D14] border border-[#222234] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-[#EB1000] animate-spin mx-auto" />
            <p className="text-xs text-[#8E8E9F]">Loading support tickets module...</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A0A0B2]">
              <thead className="bg-[#141420] text-[#7A7A8E] uppercase tracking-wider font-extrabold border-b border-[#222234]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Ticket ID</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Sender Details</th>
                  <th className="py-3.5 px-4">Subject &amp; Message</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A28]">
                {filteredTickets.map((t) => {
                  const isPayout = isPayoutTicket(t);
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-[#12121F] transition-colors ${
                        isPayout ? 'bg-[#1F1015]/40 border-l-4 border-l-[#EB1000]' : t.status === 'unread' ? 'bg-[#180A0C]/20 font-semibold' : ''
                      }`}
                    >
                      {/* Ticket ID */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap font-mono font-extrabold text-[#EB1000]">
                        {t.ticket_number || `#TCK-${t.id}`}
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPayout ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#EB1000] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit shadow-sm shadow-[#EB1000]/30">
                            <Lock className="h-3 w-3" /> Payout Change
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-[#202032] text-[#A0A0B2] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                            <HelpCircle className="h-3 w-3 text-[#00F5D4]" /> General Ticket
                          </span>
                        )}
                      </td>

                      {/* Sender Details */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="text-white font-bold text-sm flex items-center gap-1.5">
                            <span>{t.name}</span>
                            {String(t.role || '').toLowerCase().includes('streamer') || String(t.role || '').toLowerCase().includes('creator') ? (
                              <span className="px-1.5 py-0.2 rounded bg-[#FFD60A]/10 text-[#FFD60A] text-[9px] font-extrabold">CREATOR</span>
                            ) : null}
                          </div>
                          <div className="text-[#8E8E9F] text-[11px] flex items-center gap-1">
                            <Mail className="h-3 w-3 text-[#EB1000]" />
                            <a href={`mailto:${t.email}`} className="hover:text-white transition-colors">
                              {t.email}
                            </a>
                          </div>
                          {t.phone && (
                            <div className="text-[#8E8E9F] text-[10px] flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5 text-[#00E599]" />
                              <span>{t.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Subject & Message */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                        <div className="space-y-1">
                          <div className="text-white font-bold truncate">
                            {t.subject || 'Support Ticket'}
                          </div>
                          <p className="text-[#7A7A8E] text-[11px] line-clamp-2 leading-relaxed whitespace-pre-wrap">
                            {t.message}
                          </p>
                        </div>
                      </td>

                      {/* Received Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-[11px] text-[#7A7A8E]">
                        {t.created_at ? new Date(t.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'Recent'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {t.status === 'unread' ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
                            Unread / Pending
                          </span>
                        ) : t.status === 'read' ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/40 text-[10px] font-extrabold uppercase tracking-wider">
                            Under Review
                          </span>
                        ) : t.status === 'replied' ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Resolved
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-[#374151]/40 text-[#9CA3AF] text-[10px] font-extrabold uppercase">
                            {t.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicket(t);
                              if (t.status === 'unread') {
                                handleUpdateStatus(t.id, 'read');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#EB1000] hover:bg-[#CC0E00] text-white text-[11px] font-bold shadow-md shadow-[#EB1000]/20 flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Inspect</span>
                          </button>

                          <select
                            value={t.status}
                            disabled={updatingId === t.id}
                            onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                            className="py-1.5 px-2 rounded-lg bg-[#161622] border border-[#28283C] text-[11px] font-bold text-[#A0A0B2] focus:outline-none cursor-pointer"
                          >
                            <option value="unread">Pending</option>
                            <option value="read">Under Review</option>
                            <option value="replied">Resolved</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="p-16 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-[#161622] border border-[#28283C] text-[#8E8E9F] flex items-center justify-center mx-auto text-2xl">
              🎫
            </div>
            <h3 className="text-lg font-bold text-white">No Tickets Found</h3>
            <p className="text-xs text-[#8E8E9F] max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'No tickets match your selected filters.'
                : 'All tickets raised by creators and users will automatically appear in this module.'}
            </p>
          </div>
        )}
      </div>

      {/* INSPECT TICKET DETAIL & ACTION MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0D0D14] border border-[#26263A] rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#202032] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-[#EB1000]">{selectedTicket.ticket_number || `#TCK-${selectedTicket.id}`}</span>
                  <h2 className="text-xl font-bold text-white">{selectedTicket.subject || 'Support Ticket'}</h2>
                </div>
                <p className="text-xs text-[#8E8E9F]">
                  Received on {new Date(selectedTicket.created_at || selectedTicket.createdAt || Date.now()).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-full bg-[#181826] text-[#8E8E9F] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Payout Change Alert Box if Applicable */}
            {isPayoutTicket(selectedTicket) && (
              <div className="p-4 rounded-2xl bg-[#1F1015] border border-[#EB1000]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#EB1000] font-bold text-xs">
                    <Lock className="h-4 w-4" />
                    <span>🔒 Creator Payout Details Change Request</span>
                  </div>
                  {selectedTicket.status === 'replied' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Payout Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  This creator has submitted a ticket requesting updates to their locked bank account or UPI address. Verify the request and click <b>Unlock Payout Details</b> to allow them to enter new bank/UPI details.
                </p>
              </div>
            )}

            {/* Sender Metadata Box */}
            <div className="p-4 rounded-2xl bg-[#141420] border border-[#222234] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#7A7A8E] text-[10px] font-bold uppercase tracking-wider block">Sender Name &amp; Role</span>
                <span className="text-white font-bold text-sm block">{selectedTicket.name}</span>
                <span className="px-2 py-0.5 rounded bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30 text-[10px] font-bold inline-block">
                  {selectedTicket.role || 'User'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[#7A7A8E] text-[10px] font-bold uppercase tracking-wider block">Contact Information</span>
                <div className="flex items-center gap-1.5 text-[#00F5D4] font-medium">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${selectedTicket.email}`} className="hover:underline">
                    {selectedTicket.email}
                  </a>
                </div>
                {selectedTicket.phone && (
                  <div className="flex items-center gap-1.5 text-[#00E599] font-medium pt-0.5">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${selectedTicket.phone}`} className="hover:underline">
                      {selectedTicket.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Message Content */}
            <div className="space-y-2">
              <span className="text-[#7A7A8E] text-[10px] font-bold uppercase tracking-wider block">Ticket Content &amp; Requested Changes</span>
              <div className="p-4 rounded-2xl bg-[#141420] border border-[#222234] text-xs text-white leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedTicket.message}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#202032]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E9F]">Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                  className="py-1.5 px-3 rounded-xl bg-[#161622] border border-[#28283C] text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="unread">Pending</option>
                  <option value="read">Under Review</option>
                  <option value="replied">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isPayoutTicket(selectedTicket) && selectedTicket.status !== 'replied' && (
                  <button
                    type="button"
                    onClick={() => handleApprovePayout(selectedTicket.id)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#10B981]/20 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Unlock Payout Details</span>
                  </button>
                )}

                <a
                  href={`mailto:${selectedTicket.email}?subject=Re: Ticket ${selectedTicket.ticket_number || selectedTicket.id} - ${encodeURIComponent(selectedTicket.subject || 'AskMe Support')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'replied')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#EB1000] hover:bg-[#CC0E00] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Reply via Email &amp; Resolve</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center space-y-3">
        <div className="h-8 w-8 border-4 border-[#EB1000] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-[#8E8E9F]">Loading Support Tickets Module...</p>
      </div>
    }>
      <AdminTicketsContent />
    </Suspense>
  );
}
