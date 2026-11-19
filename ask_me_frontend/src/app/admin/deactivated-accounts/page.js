'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Users,
  Mail,
  Phone,
  ShieldCheck,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  X,
  Loader2
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';

export default function AdminDeactivatedAccountsPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  // Reactivate modal state
  const [targetAccount, setTargetAccount] = useState(null);
  const [isReactivating, setIsReactivating] = useState(false);

  const fetchDeactivatedAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const endpoint = API_ENDPOINTS?.ADMIN?.DEACTIVATED_ACCOUNTS || 'http://localhost:5000/api/admin/deactivated-accounts';
      
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        role: roleFilter,
        search: searchQuery.trim(),
      });

      const res = await fetch(`${endpoint}?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setAccounts(Array.isArray(data.data.accounts) ? data.data.accounts : []);
        setPagination(data.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalCount: (data.data.accounts || []).length,
          limit,
        });
        setFetchError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch deactivated accounts');
      }
    } catch (err) {
      console.error('Fetch Deactivated Accounts Error:', err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, roleFilter, searchQuery]);

  useEffect(() => {
    fetchDeactivatedAccounts();
  }, [fetchDeactivatedAccounts]);

  // Handle Reactivate Account
  const handleReactivate = async () => {
    if (!targetAccount) return;

    try {
      setIsReactivating(true);
      const token = getAdminToken();
      const endpoint = API_ENDPOINTS?.ADMIN?.REACTIVATE_ACCOUNT || 'http://localhost:5000/api/admin/deactivated-accounts/reactivate';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          role: targetAccount.rawRole,
          id: targetAccount.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        toast.success(
          data.message || `Account for ${targetAccount.name} has been reactivated successfully.`,
          'Account Reactivated'
        );
        setTargetAccount(null);
        fetchDeactivatedAccounts();
      } else {
        toast.error(data.message || 'Failed to reactivate account.', 'Reactivation Error');
      }
    } catch (err) {
      console.error('Reactivate account error:', err);
      toast.error('Network error while reactivating account.', 'Error');
    } finally {
      setIsReactivating(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Calculate days remaining until scheduled permanent deletion
  const getRemainingDays = (dateStr) => {
    if (!dateStr) return null;
    const diffMs = new Date(dateStr) - new Date();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days;
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = pagination.totalCount || accounts.length;
    let creators = 0;
    let viewers = 0;
    let expired = 0;

    accounts.forEach((acc) => {
      if (acc.rawRole === 'creator') creators++;
      if (acc.rawRole === 'viewer') viewers++;
      if (acc.is_expired) expired++;
    });

    return { total, creators, viewers, expired };
  }, [pagination.totalCount, accounts]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 w-full max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#202032] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Deactivated Accounts
            </h1>
          </div>
          <p className="text-xs text-[#8E8E9F] mt-1">
            2-year data retention management, automatic permanent deletion schedules, and admin recovery.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDeactivatedAccounts}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#161622] hover:bg-[#202032] border border-[#28283C] text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-[#00F5D4] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">
            Total Deactivated
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              {metrics.total}
            </span>
            <AlertOctagon className="h-5 w-5 text-[#8E8E9F]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-[#EB1000] uppercase tracking-wider block">
            Deactivated Creators
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#EB1000]">
              {roleFilter === 'creator' ? metrics.total : metrics.creators}
            </span>
            <Users className="h-5 w-5 text-[#EB1000]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-[#00F5D4] uppercase tracking-wider block">
            Deactivated Viewers
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#00F5D4]">
              {roleFilter === 'viewer' ? metrics.total : metrics.viewers}
            </span>
            <User className="h-5 w-5 text-[#00F5D4]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-[#222234] space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Retention Window
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-heading font-extrabold text-amber-400">
              2 Years
            </span>
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH ROW */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0D0D14] p-4 rounded-2xl border border-[#222234]">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E9F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or handle..."
            className="w-full bg-[#161622] border border-[#28283C] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E9F] focus:outline-none focus:border-[#EB1000] transition-colors"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-[#8E8E9F] shrink-0" />
          <div className="flex gap-1.5 p-1 bg-[#161622] rounded-xl border border-[#28283C] w-full sm:w-auto">
            {['all', 'creator', 'viewer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRoleFilter(r);
                  setPage(1);
                }}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-[#EB1000] text-white shadow-md shadow-red-900/30'
                    : 'text-[#8E8E9F] hover:text-white hover:bg-[#202032]'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ERROR NOTICE IF FETCH FAILED */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={fetchDeactivatedAccounts}
            className="font-bold underline hover:text-white ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ACCOUNTS TABLE */}
      <div className="rounded-2xl bg-[#0D0D14] border border-[#222234] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#222234] bg-[#161622]/50 text-[#8E8E9F] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">User / Account</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Deactivation Date</th>
                <th className="py-3.5 px-4">Scheduled Deletion</th>
                <th className="py-3.5 px-4">Recovery Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D1D2C]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8E8E9F]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-[#00F5D4]" />
                      <span>Loading deactivated accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8E8E9F]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      <span className="font-bold text-white text-sm">No Deactivated Accounts Found</span>
                      <p className="text-xs text-[#8E8E9F] max-w-sm">
                        {searchQuery || roleFilter !== 'all'
                          ? 'No deactivated accounts match the selected filters.'
                          : 'There are currently no soft-deleted accounts in the retention window.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const remainingDays = getRemainingDays(acc.scheduled_permanent_deletion_at);
                  const isExpiringSoon = remainingDays !== null && remainingDays <= 30 && remainingDays > 0;

                  return (
                    <tr
                      key={`${acc.rawRole}-${acc.id}`}
                      className="hover:bg-[#151522]/60 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#EB1000]/20 to-[#FF8C00]/20 border border-[#EB1000]/30 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                            {(acc.name || 'U').charAt(0)}
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-bold text-white block">
                              {acc.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-[#8E8E9F]">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {acc.email || 'No email'}
                              </span>
                              {acc.mobile && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {acc.mobile}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account Role */}
                      <td className="py-3.5 px-4">
                        {acc.rawRole === 'creator' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/25 font-bold text-[11px]">
                            <Users className="h-3 w-3" />
                            Creator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-bold text-[11px]">
                            <User className="h-3 w-3" />
                            Viewer
                          </span>
                        )}
                      </td>

                      {/* Deactivation Date */}
                      <td className="py-3.5 px-4 text-[#C5C5D2]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#8E8E9F] shrink-0" />
                          <span>{formatDate(acc.deactivation_date)}</span>
                        </div>
                      </td>

                      {/* Scheduled Permanent Deletion Date */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[#C5C5D2]">
                            <Clock className="h-3.5 w-3.5 text-[#8E8E9F] shrink-0" />
                            <span>{formatDate(acc.scheduled_permanent_deletion_at)}</span>
                          </div>
                          {remainingDays !== null && (
                            <span
                              className={`text-[10px] font-semibold block ${
                                acc.is_expired
                                  ? 'text-red-400'
                                  : isExpiringSoon
                                  ? 'text-amber-400'
                                  : 'text-[#8E8E9F]'
                              }`}
                            >
                              {acc.is_expired
                                ? 'Expired (Scheduled for permanent purge)'
                                : `~${remainingDays} days remaining in retention`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Recovery Status */}
                      <td className="py-3.5 px-4">
                        {acc.is_expired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 border border-red-800/40 font-bold text-[11px]">
                            <AlertCircle className="h-3 w-3" />
                            Expired (Pending Deletion)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold text-[11px]">
                            <CheckCircle2 className="h-3 w-3" />
                            Deactivated (Recoverable)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setTargetAccount(acc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Reactivate</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#222234] bg-[#161622]/40 text-xs text-[#8E8E9F]">
            <div>
              Showing page <span className="font-bold text-white">{pagination.currentPage}</span> of{' '}
              <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.totalCount} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.currentPage <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#28283C] bg-[#161622] hover:bg-[#202032] disabled:opacity-40 transition cursor-pointer text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-[#28283C] bg-[#161622] hover:bg-[#202032] disabled:opacity-40 transition cursor-pointer text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM REACTIVATE MODAL */}
      {targetAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl border border-emerald-500/30 bg-[#12121A] text-white shadow-2xl relative">
            <button
              type="button"
              disabled={isReactivating}
              onClick={() => setTargetAccount(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#8E8E9F] hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-emerald-400">
                  Reactivate Account?
                </h3>
                <p className="text-xs text-[#8E8E9F]">
                  Restore platform access and cancel permanent deletion.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#1A1A26] border border-[#28283C] text-xs space-y-1.5">
                <div>
                  <span className="text-[#8E8E9F]">Name: </span>
                  <span className="font-bold text-white">{targetAccount.name}</span>
                </div>
                <div>
                  <span className="text-[#8E8E9F]">Email: </span>
                  <span className="font-mono text-emerald-300">{targetAccount.email}</span>
                </div>
                <div>
                  <span className="text-[#8E8E9F]">Role: </span>
                  <span className="font-bold text-white capitalize">{targetAccount.rawRole}</span>
                </div>
                <div>
                  <span className="text-[#8E8E9F]">Deactivated on: </span>
                  <span className="text-white">{formatDate(targetAccount.deactivation_date)}</span>
                </div>
              </div>

              <p className="text-xs text-[#8E8E9F] leading-relaxed">
                Reactivating will set <code className="text-white">is_deleted = false</code>, reset the 2-year scheduled deletion timer, and immediately restore the user&apos;s ability to log in and interact with AskMe.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isReactivating}
                  onClick={() => setTargetAccount(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#28283C] hover:bg-[#1E1E2E] text-xs font-bold text-[#8E8E9F] transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReactivate}
                  disabled={isReactivating}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/30 disabled:opacity-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isReactivating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Reactivating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Confirm Reactivate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
