import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Clock,
  RefreshCw
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';

export default function PaymentManagement({ activeSubTab }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync activeFilter when activeSubTab props change from Admin Sidebar
  useEffect(() => {
    setCurrentPage(1);
    if (activeSubTab === 'payments_all') {
      setActiveFilter('All');
    } else if (activeSubTab === 'payments_successful') {
      setActiveFilter('Successful');
    } else if (activeSubTab === 'payments_failed') {
      setActiveFilter('Failed');
    } else if (activeSubTab === 'payments_pending') {
      setActiveFilter('Pending');
    } else if (activeSubTab === 'payments_refunds') {
      setActiveFilter('Refunded');
    }
  }, [activeSubTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch dynamic payment data from Backend API
  const fetchPayments = async (status, search, pageParam = currentPage) => {
    try {
      setIsLoading(true);
      const token = getAdminToken() || (typeof window !== 'undefined' ? (localStorage.getItem('askme_admin_token') || localStorage.getItem('askme_token') || localStorage.getItem('token')) : null);

      const queryParams = new URLSearchParams();
      if (status && status !== 'All') {
        queryParams.append('status', status);
      }
      if (search && search.trim()) {
        queryParams.append('search', search.trim());
      }
      queryParams.append('page', pageParam);
      queryParams.append('limit', 10);

      const res = await fetch(`${API_ENDPOINTS.ADMIN.PAYMENTS}?${queryParams.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && (data.data?.payments || data.data?.transactions)) {
        setTransactions(data.data.payments || data.data.transactions || []);
        const pag = data.pagination || data.data?.pagination;
        if (pag) {
          setTotalPages(pag.totalPages || 1);
          setTotalCount(pag.totalCount || 0);
        } else {
          setTotalCount(data.totalCount || data.total || 0);
        }
      }
    } catch (err) {
      console.warn('Fetch admin payments notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger backend API fetch whenever filter, search query or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments(activeFilter, searchQuery, currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeFilter, searchQuery, currentPage]);

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#00F5D4]" />
            Payment Management & Gateway Audit Logs
          </h2>
          <p className="text-xs text-[#8B8B96] mt-0.5">
            Audit live payment transactions, successful charges, gateway failures, and automatic refunds.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8B8B96]" />
        <input
          type="text"
          placeholder="Search by Transaction ID, Creator or Viewer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0A0A0F] border border-[#1C1C26] rounded-xl text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
        />
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-[#8B8B96] flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-[#00F5D4]" /> Fetching payment transactions from backend API...
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#8B8B96]">
          No payment transactions found matching the filter "{activeFilter}".
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                <th className="pb-3 px-2">TXN ID</th>
                <th className="pb-3 px-2">CREATOR / VIEWER</th>
                <th className="pb-3 px-2">AMOUNT</th>
                <th className="pb-3 px-2">METHOD</th>
                <th className="pb-3 px-2">STATUS</th>
                <th className="pb-3 px-2">GATEWAY AUDIT RESPONSE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C26]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#0A0A0F]/60 transition">
                  <td className="py-3.5 px-2 font-mono text-[#00F5D4] font-bold">{t.id}</td>
                  <td className="py-3.5 px-2">
                    <div className="font-bold text-white">{t.creatorName}</div>
                    <div className="text-[10px] text-[#8B8B96]">By {t.viewerName} • {t.dateTime}</div>
                  </td>
                  <td className="py-3.5 px-2 font-bold text-white">{t.amount}</td>
                  <td className="py-3.5 px-2 text-[#8B8B96]">{t.paymentMethod}</td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${t.status === 'Successful' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' :
                        t.status === 'Failed' ? 'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30' :
                          t.status === 'Pending' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30' :
                            'bg-[#7B2FFF]/10 text-[#7B2FFF] border border-[#7B2FFF]/30'
                      }`}>
                      {t.status === 'Successful' && <CheckCircle2 className="h-3 w-3" />}
                      {t.status === 'Failed' && <XCircle className="h-3 w-3" />}
                      {t.status === 'Pending' && <Clock className="h-3 w-3" />}
                      {t.status === 'Refunded' && <RotateCcw className="h-3 w-3" />}
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 font-mono text-[10px] text-[#8B8B96]">
                    {typeof t.gatewayResponse === 'object' && t.gatewayResponse !== null
                      ? (t.gatewayResponse.message || t.gatewayResponse.status || JSON.stringify(t.gatewayResponse))
                      : String(t.gatewayResponse || '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C1C26] text-xs">
        <span className="text-[#8B8B96]">
          Showing <strong className="text-white">{transactions.length}</strong> of <strong className="text-[#00F5D4]">{totalCount}</strong> Transactions (Page {currentPage} of {totalPages})
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
  );
}
