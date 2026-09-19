'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Mail,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  User,
  Phone,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  Send,
  HelpCircle,
  Tag
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';

export default function AdminContactInquiriesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Selected message for detail view modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchContactMessages = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const endpoint = API_ENDPOINTS?.CONTACT?.MESSAGES || 'http://localhost:5000/api/contact/messages';
      
      const res = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const rawMessages = data?.data || data?.messages || [];
      setMessages(Array.isArray(rawMessages) ? rawMessages : []);
      setFetchError(null);
    } catch (err) {
      console.error('Fetch Contact Messages Error:', err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactMessages();
    const interval = setInterval(fetchContactMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update Message Status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const token = getAdminToken();
      const endpoint = API_ENDPOINTS?.CONTACT?.UPDATE_STATUS(id) || `http://localhost:5000/api/contact/messages/${id}/status`;

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
        throw new Error(data.message || 'Failed to update message status');
      }

      // Local state update
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );

      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }

      if (toast?.success) {
        toast.success(`Message status updated to ${newStatus}`, 'Status Updated');
      }
    } catch (err) {
      console.error('Update Status Error:', err);
      if (toast?.error) {
        toast.error(err.message || 'Failed to update status', 'Error');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Status Filter
      if (statusFilter !== 'all' && msg.status !== statusFilter) {
        return false;
      }
      // Role Filter
      if (roleFilter !== 'all' && msg.role?.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = msg.name?.toLowerCase().includes(q);
        const matchesEmail = msg.email?.toLowerCase().includes(q);
        const matchesSubject = msg.subject?.toLowerCase().includes(q);
        const matchesMessage = msg.message?.toLowerCase().includes(q);
        const matchesPhone = msg.phone ? String(msg.phone).includes(q) : false;
        if (!matchesName && !matchesEmail && !matchesSubject && !matchesMessage && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [messages, statusFilter, roleFilter, searchQuery]);

  // Metrics Counters
  const metrics = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === 'unread').length;
    const read = messages.filter((m) => m.status === 'read').length;
    const replied = messages.filter((m) => m.status === 'replied').length;
    const streamers = messages.filter((m) => m.role?.toLowerCase().includes('streamer') || m.role?.toLowerCase().includes('creator')).length;
    return { total, unread, read, replied, streamers };
  }, [messages]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'unread':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
            Unread
          </span>
        );
      case 'read':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/40 text-[10px] font-extrabold uppercase tracking-wider">
            Read
          </span>
        );
      case 'replied':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
            <Check className="h-3 w-3" />
            Replied
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#374151]/40 text-[#9CA3AF] border border-[#4B5563]/40 text-[10px] font-extrabold uppercase tracking-wider">
            Archived
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#1F2937] text-[#9CA3AF] text-[10px] font-extrabold uppercase">
            {status}
          </span>
        );
    }
  };

  const getRoleBadge = (role) => {
    const roleLower = String(role || '').toLowerCase();
    if (roleLower.includes('streamer') || roleLower.includes('creator')) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30 text-[10px] font-bold">
          🎥 Streamer
        </span>
      );
    } else if (roleLower.includes('brand') || roleLower.includes('partner')) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-[#A855F7]/10 text-[#C084FC] border border-[#A855F7]/30 text-[10px] font-bold">
          🤝 Brand Partner
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-[#1F2937] text-[#9CA3AF] text-[10px] font-bold">
        👤 Viewer
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 w-full max-w-7xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#202032] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000]">
              <Inbox className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Contact Inquiries
            </h1>
          </div>
          <p className="text-xs text-[#8E8E9F] mt-1">
            View, track and respond to user messages, streamer inquiries and support submissions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchContactMessages}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#161622] hover:bg-[#202032] border border-[#28283C] text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#00F5D4] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Messages</span>
        </button>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">
            Total Inquiries
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              {metrics.total}
            </span>
            <Mail className="h-5 w-5 text-[#8E8E9F]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-[#EB1000] uppercase tracking-wider block flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
            Unread Messages
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#EB1000]">
              {metrics.unread}
            </span>
            <AlertCircle className="h-5 w-5 text-[#EB1000]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-[#FFD60A] uppercase tracking-wider block">
            Streamers &amp; Creators
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#FFD60A]">
              {metrics.streamers}
            </span>
            <User className="h-5 w-5 text-[#FFD60A]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider block">
            Replied / Resolved
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#10B981]">
              {metrics.replied}
            </span>
            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH ROW */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0D0D14] p-4 rounded-2xl border border-[#222234]">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, phone, subject or message..."
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

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-[#161622] border border-[#28283C] text-xs font-bold text-white focus:outline-none focus:border-[#EB1000]"
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-[#161622] border border-[#28283C] text-xs font-bold text-white focus:outline-none focus:border-[#EB1000]"
          >
            <option value="all">All Roles</option>
            <option value="viewer">Viewer</option>
            <option value="streamer">Streamer &amp; Creator</option>
            <option value="brand partner">Brand Partner</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* MESSAGES TABLE */}
      <div className="rounded-3xl bg-[#0D0D14] border border-[#222234] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-[#EB1000] animate-spin mx-auto" />
            <p className="text-xs text-[#8E8E9F]">Loading contact inquiries...</p>
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A0A0B2]">
              <thead className="bg-[#141420] text-[#7A7A8E] uppercase tracking-wider font-extrabold border-b border-[#222234]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4">Sender Info</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Subject &amp; Message</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A28]">
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-[#12121F] transition-colors ${
                      msg.status === 'unread' ? 'bg-[#180A0C]/30 font-semibold' : ''
                    }`}
                  >
                    {/* Status Badge */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      {getStatusBadge(msg.status)}
                    </td>

                    {/* Sender Info */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-white font-bold text-sm">{msg.name}</div>
                        <div className="text-[#8E8E9F] text-[11px] flex items-center gap-1">
                          <Mail className="h-3 w-3 text-[#EB1000]" />
                          <a href={`mailto:${msg.email}`} className="hover:text-white transition-colors">
                            {msg.email}
                          </a>
                        </div>
                        {msg.phone && (
                          <div className="text-[#8E8E9F] text-[10px] flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5 text-[#00E599]" />
                            <span>{msg.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getRoleBadge(msg.role)}
                    </td>

                    {/* Subject & Preview */}
                    <td className="py-4 px-4 max-w-xs sm:max-w-sm">
                      <div className="space-y-1">
                        <div className="text-white font-bold truncate">
                          {msg.subject || 'General Support Inquiry'}
                        </div>
                        <p className="text-[#7A7A8E] text-[11px] line-clamp-2 leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-[11px] text-[#7A7A8E]">
                      {msg.created_at ? new Date(msg.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'Recent'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Modal Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (msg.status === 'unread') {
                              handleUpdateStatus(msg.id, 'read');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#1F1F30] hover:bg-[#282840] text-white text-[11px] font-bold border border-[#303048] flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#00F5D4]" />
                          <span>View</span>
                        </button>

                        {/* Quick Status Selector */}
                        <select
                          value={msg.status}
                          disabled={updatingId === msg.id}
                          onChange={(e) => handleUpdateStatus(msg.id, e.target.value)}
                          className="py-1.5 px-2 rounded-lg bg-[#161622] border border-[#28283C] text-[11px] font-bold text-[#A0A0B2] focus:outline-none cursor-pointer"
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="p-16 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-[#161622] border border-[#28283C] text-[#8E8E9F] flex items-center justify-center mx-auto text-2xl">
              📬
            </div>
            <h3 className="text-lg font-bold text-white">No Contact Inquiries Found</h3>
            <p className="text-xs text-[#8E8E9F] max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'No messages matched your selected search filters.'
                : 'Inquiries submitted through the Contact Us form on the landing page will appear here.'}
            </p>
          </div>
        )}
      </div>

      {/* DETAIL VIEW MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0D0D14] border border-[#26263A] rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#202032] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{selectedMessage.subject || 'Contact Inquiry'}</h2>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <p className="text-xs text-[#8E8E9F]">
                  Received on {new Date(selectedMessage.created_at || Date.now()).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-full bg-[#181826] text-[#8E8E9F] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sender Metadata Box */}
            <div className="p-4 rounded-2xl bg-[#141420] border border-[#222234] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#7A7A8E] text-[10px] font-bold uppercase tracking-wider block">Sender Name</span>
                <span className="text-white font-bold text-sm block">{selectedMessage.name}</span>
                {getRoleBadge(selectedMessage.role)}
              </div>

              <div className="space-y-1">
                <span className="text-[#7A7A8E] text-[10px] font-bold uppercase tracking-wider block">Contact Information</span>
                <div className="flex items-center gap-1.5 text-[#00F5D4] font-medium">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${selectedMessage.email}`} className="hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-1.5 text-[#00E599] font-medium pt-0.5">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${selectedMessage.phone}`} className="hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Full Message Box */}
            <div className="space-y-2">
              <span className="text-[#7A7A8E] text-[10px] font-bold uppercase tracking-wider block">Message Content</span>
              <div className="p-4 rounded-2xl bg-[#141420] border border-[#222234] text-xs text-white leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#202032]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E9F]">Status:</span>
                <select
                  value={selectedMessage.status}
                  onChange={(e) => handleUpdateStatus(selectedMessage.id, e.target.value)}
                  className="py-1.5 px-3 rounded-xl bg-[#161622] border border-[#28283C] text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'AskMe Support')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#EB1000] hover:bg-[#CC0E00] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
