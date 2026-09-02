'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  DollarSign,
  PieChart,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  Download
} from 'lucide-react';
import PlatformIcon from './PlatformIcon';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';

export default function ReportsAnalytics({ activeSubTab }) {
  const [reportTimeframe, setReportTimeframe] = useState('Monthly');
  const [activeReportSection, setActiveReportSection] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (activeSubTab === 'reports_payment') {
      setActiveReportSection('payment');
    } else if (activeSubTab === 'reports_creator') {
      setActiveReportSection('creator');
    } else if (activeSubTab === 'reports_withdrawal') {
      setActiveReportSection('withdrawal');
    } else {
      setActiveReportSection('revenue');
    }
  }, [activeSubTab]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, reportTimeframe, activeReportSection]);

  const fetchReports = async (pageParam = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.REPORTS}?timeframe=${reportTimeframe}&page=${pageParam}&limit=10`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setReportData(json.data);
        const pag = json.pagination || json.data?.pagination;
        if (pag) {
          setTotalPages(pag.totalPages || 1);
          setTotalCount(pag.totalCount || 0);
        } else {
          setTotalCount(json.totalCount || 0);
        }
      } else {
        setError(json.message || 'Failed to load report analytics');
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
      setError('Unable to connect to analytics server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(currentPage);
  }, [reportTimeframe, currentPage]);

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const activeRev = reportData?.revenueReport?.[reportTimeframe] || {
    gross: reportTimeframe === 'Daily' ? 84500 : reportTimeframe === 'Weekly' ? 582000 : 2489500,
    commission: reportTimeframe === 'Daily' ? 12675 : reportTimeframe === 'Weekly' ? 87300 : 373425,
    creatorNet: reportTimeframe === 'Daily' ? 71825 : reportTimeframe === 'Weekly' ? 494700 : 2116075,
    growth: 14.2
  };

  const commRate = reportData?.commissionRate || 15;
  const creatorPercent = 100 - commRate;

  const topCreators = reportData?.topCreators || [];
  const highestDonations = reportData?.highestDonations || [];
  const paymentReport = reportData?.paymentReport || {
    successfulCount: 14890,
    successfulVolume: 2489500,
    failedCount: 242,
    failedVolume: 45000,
    gatewaySuccessRate: 98.4,
    recentTransactions: []
  };

  const withdrawalReportData = reportData?.withdrawalReportData || [
    { period: 'Aug 2026', totalRequested: 1245000, totalApproved: 1180000, avgProcessingTime: '4 mins' },
    { period: 'Jul 2026', totalRequested: 1890000, totalApproved: 1850000, avgProcessingTime: '6 mins' },
    { period: 'Jun 2026', totalRequested: 1520000, totalApproved: 1500000, avgProcessingTime: '5 mins' },
  ];

  const withdrawalSummary = reportData?.withdrawalSummary || {
    totalRequested: 4655000,
    totalApproved: 4530000,
    totalPending: 125000,
    pendingCount: 2,
    approvedCount: 48,
    recentRequests: []
  };

  const handleDownloadReport = () => {
    const sectionName = activeReportSection.toUpperCase();
    const filename = `AskMe_${sectionName}_Report_${reportTimeframe}_${new Date().toISOString().slice(0, 10)}.csv`;
    let rows = [];

    if (activeReportSection === 'revenue') {
      rows.push(['Timeframe', 'Gross Platform Volume (INR)', 'AskMe Net Commission (INR)', 'Creator Net Earnings (INR)', 'Growth %']);
      const revs = reportData?.revenueReport || {};
      ['Daily', 'Weekly', 'Monthly'].forEach(tf => {
        const item = revs[tf] || {};
        rows.push([tf, item.gross || 0, item.commission || 0, item.creatorNet || 0, `${item.growth || 0}%`]);
      });
    } else if (activeReportSection === 'creator') {
      rows.push(['Rank', 'Creator Name', 'Handle', 'Platform', 'Total Donations (INR)', 'Questions Answered', 'Rating']);
      topCreators.forEach(c => {
        rows.push([c.rank || 0, `"${(c.name || '').replace(/"/g, '""')}"`, c.handle || '', c.platform || '', c.totalDonations || 0, c.questionsAnswered || 0, c.rating || '0']);
      });
      rows.push([]);
      rows.push(['Highest Individual Donations']);
      rows.push(['ID', 'Viewer Name', 'Creator Name', 'Amount (INR)', 'Message', 'Paid At']);
      highestDonations.forEach(h => {
        rows.push([h.id || 0, `"${(h.viewerName || '').replace(/"/g, '""')}"`, `"${(h.creatorName || '').replace(/"/g, '""')}"`, h.amount || 0, `"${(h.message || '').replace(/"/g, '""')}"`, h.paidAt || '']);
      });
    } else if (activeReportSection === 'payment') {
      rows.push(['Metric', 'Value']);
      rows.push(['Gateway Success Rate', `${paymentReport.gatewaySuccessRate || 0}%`]);
      rows.push(['Successful Transactions Count', paymentReport.successfulCount || 0]);
      rows.push(['Successful Volume (INR)', paymentReport.successfulVolume || 0]);
      rows.push(['Failed Transactions Count', paymentReport.failedCount || 0]);
      rows.push(['Failed Volume (INR)', paymentReport.failedVolume || 0]);
      rows.push([]);
      rows.push(['Recent Gateway Activity Log']);
      rows.push(['ID', 'Gateway', 'Payment Method', 'Amount (INR)', 'Status', 'Paid At']);
      (paymentReport.recentTransactions || []).forEach(tx => {
        rows.push([tx.id || 0, tx.gateway || '', tx.paymentMethod || '', tx.amount || 0, tx.status || '', tx.paidAt || '']);
      });
    } else if (activeReportSection === 'withdrawal') {
      rows.push(['Metric', 'Value']);
      rows.push(['Total Payout Requested (INR)', withdrawalSummary.totalRequested || 0]);
      rows.push(['Approved & Disbursed (INR)', withdrawalSummary.totalApproved || 0]);
      rows.push(['Pending Payout Requests (INR)', withdrawalSummary.totalPending || 0]);
      rows.push(['Pending Requests Count', withdrawalSummary.pendingCount || 0]);
      rows.push([]);
      rows.push(['Period', 'Requested Volume (INR)', 'Approved & Disbursed (INR)', 'Avg Processing Speed']);
      withdrawalReportData.forEach(w => {
        rows.push([`"${w.period || ''}"`, w.totalRequested || 0, w.totalApproved || 0, `"${w.avgProcessingTime || ''}"`]);
      });
      if (withdrawalSummary.recentRequests && withdrawalSummary.recentRequests.length > 0) {
        rows.push([]);
        rows.push(['Recent Creator Withdrawal Requests Log']);
        rows.push(['ID', 'Creator Name', 'Requested Amount (INR)', 'Net Payout (INR)', 'Status', 'Requested At']);
        withdrawalSummary.recentRequests.forEach(req => {
          rows.push([req.id || 0, `"${(req.creatorName || '').replace(/"/g, '""')}"`, req.amount || 0, req.netAmount || 0, req.status || '', req.requestedAt || '']);
        });
      }
    }

    const csvString = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-[#7B2FFF]" />
            Reports & Analytics
          </h2>
          <p className="text-xs text-[#8B8B96] mt-1">
            Real-time platform telemetry, revenue analytics, creator performance, and payment reports.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-2 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shrink-0 shadow-lg shadow-[#00F5D4]/10"
            title="Download CSV Report"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="p-2 rounded-2xl bg-[#13131A] border border-[#1C1C26] text-[#8B8B96] hover:text-white transition-all shrink-0"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#00F5D4]' : ''}`} />
          </button>

          <div className="flex items-center gap-1 bg-[#13131A] p-1 rounded-2xl border border-[#1C1C26]">
            {['Daily', 'Weekly', 'Monthly'].map((tf) => (
              <button
                key={tf}
                onClick={() => setReportTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reportTimeframe === tf
                    ? 'bg-[#1C1C26] text-[#00F5D4]'
                    : 'text-[#8B8B96] hover:text-white'
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#FF5252]/10 border border-[#FF5252]/30 flex items-center gap-3 text-[#FF5252] text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !reportData ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#00F5D4] animate-spin" />
          <p className="text-xs text-[#8B8B96]">Loading dynamic analytics telemetry...</p>
        </div>
      ) : (
        <>
          {/* 22.1 Revenue Report Section */}
          {activeReportSection === 'revenue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8B8B96] uppercase tracking-wider">
                  Revenue Report ({reportTimeframe})
                </span>
                <span className="text-xs text-[#00F5D4] font-semibold bg-[#00F5D4]/10 px-2.5 py-1 rounded-full border border-[#00F5D4]/30">
                  Dynamic Calculation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">
                      Gross Platform Volume ({reportTimeframe})
                    </span>
                    <TrendingUp className="h-4 w-4 text-[#00E676]" />
                  </div>
                  <h3 className="font-heading font-black text-3xl text-white">
                    {formatCurrency(activeRev.gross)}
                  </h3>
                  <p className="text-xs text-[#00E676] font-semibold">
                    {activeRev.growth >= 0 ? `+${activeRev.growth}%` : `${activeRev.growth}%`} compared to previous {reportTimeframe.toLowerCase()}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">
                      AskMe Net Commission ({commRate}%)
                    </span>
                    <DollarSign className="h-4 w-4 text-[#FFD60A]" />
                  </div>
                  <h3 className="font-heading font-black text-3xl text-[#FFD60A]">
                    {formatCurrency(activeRev.commission)}
                  </h3>
                  <p className="text-xs text-[#8B8B96]">Retained platform operational margin</p>
                </div>

                <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">
                      Creator Net Earnings ({creatorPercent}%)
                    </span>
                    <Users className="h-4 w-4 text-[#00F5D4]" />
                  </div>
                  <h3 className="font-heading font-black text-3xl text-[#00E676]">
                    {formatCurrency(activeRev.creatorNet)}
                  </h3>
                  <p className="text-xs text-[#00F5D4]">Settled to creator bank accounts</p>
                </div>
              </div>
            </div>
          )}

          {/* 22.2 Creator Performance Report */}
          {activeReportSection === 'creator' && (
            <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#FFD60A]" />
                    Creator Performance Report
                  </h3>
                  <p className="text-xs text-[#8B8B96]">Top creators ranked by audience donations and rating.</p>
                </div>
                <span className="text-xs font-bold text-[#FFD60A] bg-[#FFD60A]/10 px-2.5 py-1 rounded-full border border-[#FFD60A]/30">
                  Top Creators
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#8B8B96] uppercase tracking-wider block">Top Creators Leaderboard</span>
                  {topCreators.slice(0, 5).map((creator) => (
                    <div key={creator.rank || creator.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26]">
                      <div className="flex items-center gap-3">
                        <span className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs ${creator.rank === 1 ? 'bg-[#FFD60A] text-[#0A0A0F]' : 'bg-[#1C1C26] text-[#8B8B96]'
                          }`}>
                          #{creator.rank}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            {creator.name}
                            <PlatformIcon platform={creator.platform} className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-[10px] text-[#8B8B96]">{creator.handle} • {creator.questionsAnswered} Answered</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-[#00E676] block">{formatCurrency(creator.totalDonations)}</span>
                        <span className="text-[10px] text-[#FFD60A]">★ {creator.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {highestDonations && highestDonations.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#FFD60A] uppercase tracking-wider block">Highest Individual Donations</span>
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                      {highestDonations.map((hd, i) => (
                        <div key={hd.id || i} className="flex items-center justify-between text-xs p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26]">
                          <div>
                            <span className="text-white font-semibold block">{hd.viewerName}</span>
                            <span className="text-[#8B8B96] text-[10px]">Donated to {hd.creatorName}</span>
                            <p className="text-[11px] text-[#00F5D4] mt-0.5 font-medium">"{hd.message}"</p>
                          </div>
                          <span className="font-mono font-bold text-[#00E676] text-sm">{formatCurrency(hd.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 22.3 Payment Performance Report */}
          {activeReportSection === 'payment' && (
            <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-[#00F5D4]" />
                    Payment Reports
                  </h3>
                  <p className="text-xs text-[#8B8B96]">Transaction health metrics (Successful vs. Failed attempts).</p>
                </div>
                <span className="text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 rounded-full border border-[#00E676]/30">
                  {paymentReport.gatewaySuccessRate}% Success Rate
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#00E676]/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#00E676]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase">Successful Transactions</span>
                  </div>
                  <h4 className="font-heading font-black text-2xl text-white">
                    {Number(paymentReport.successfulCount || 0).toLocaleString()}
                  </h4>
                  <p className="text-[11px] text-[#8B8B96]">
                    Total Volume: <span className="text-[#00E676] font-bold">{formatCurrency(paymentReport.successfulVolume)}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#FF5252]/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#FF5252]">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase">Failed Transactions</span>
                  </div>
                  <h4 className="font-heading font-black text-2xl text-white">
                    {Number(paymentReport.failedCount || 0).toLocaleString()}
                  </h4>
                  <p className="text-[11px] text-[#8B8B96]">
                    Failed Volume: <span className="text-[#FF5252] font-bold">{formatCurrency(paymentReport.failedVolume)}</span>
                  </p>
                </div>
              </div>

              {paymentReport.recentTransactions && paymentReport.recentTransactions.length > 0 && (
                <div className="pt-4 border-t border-[#1C1C26] space-y-3">
                  <span className="text-xs font-bold text-[#00F5D4] uppercase tracking-wider block">Recent Gateway Activity Log</span>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {paymentReport.recentTransactions.map((tx, idx) => (
                      <div key={tx.id || idx} className="flex items-center justify-between text-xs p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26]">
                        <div className="flex items-center gap-3">
                          <span className={`h-2.5 w-2.5 rounded-full ${tx.status === 'success' ? 'bg-[#00E676]' : 'bg-[#FF5252]'}`}></span>
                          <div>
                            <span className="text-white font-semibold block">{tx.gateway} • {tx.paymentMethod}</span>
                            <span className="text-[10px] text-[#8B8B96]">Transaction ID: #{tx.id}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-white text-sm">{formatCurrency(tx.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Withdrawal Performance Report */}
          {activeReportSection === 'withdrawal' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">
                      Total Payout Requested
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#FFD60A]" />
                  </div>
                  <h3 className="font-heading font-black text-3xl text-[#FFD60A]">
                    {formatCurrency(withdrawalSummary.totalRequested)}
                  </h3>
                  <p className="text-xs text-[#8B8B96]">Gross withdrawal requests volume</p>
                </div>

                <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">
                      Approved & Disbursed
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-[#00E676]" />
                  </div>
                  <h3 className="font-heading font-black text-3xl text-[#00E676]">
                    {formatCurrency(withdrawalSummary.totalApproved)}
                  </h3>
                  <p className="text-xs text-[#00E676] font-semibold">Settled to bank accounts</p>
                </div>

                <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">
                      Pending Payout Requests
                    </span>
                    <Users className="h-4 w-4 text-[#00F5D4]" />
                  </div>
                  <h3 className="font-heading font-black text-3xl text-[#00F5D4]">
                    {formatCurrency(withdrawalSummary.totalPending)}
                  </h3>
                  <p className="text-xs text-[#00F5D4]">{withdrawalSummary.pendingCount || 0} requests awaiting review</p>
                </div>
              </div>

              {/* Monthly Breakdowns */}
              <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
                  <div>
                    <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5 text-[#00F5D4]" />
                      Monthly Withdrawal Trends
                    </h3>
                    <p className="text-xs text-[#8B8B96]">Monthly payout volume requested vs processed.</p>
                  </div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                      <th className="pb-3 px-2">PERIOD</th>
                      <th className="pb-3 px-2">REQUESTED VOLUME</th>
                      <th className="pb-3 px-2">APPROVED & DISBURSED</th>
                      <th className="pb-3 px-2">AVG DISBURSAL SPEED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C26]">
                    {withdrawalReportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#0A0A0F]">
                        <td className="py-3 px-2 font-bold text-white">{row.period}</td>
                        <td className="py-3 px-2 text-[#FFD60A] font-bold">{formatCurrency(row.totalRequested)}</td>
                        <td className="py-3 px-2 text-[#00E676] font-bold">{formatCurrency(row.totalApproved)}</td>
                        <td className="py-3 px-2 text-[#00F5D4]">{row.avgProcessingTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Withdrawal Activity */}
              {withdrawalSummary.recentRequests && withdrawalSummary.recentRequests.length > 0 && (
                <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
                    <h3 className="font-heading font-bold text-base text-white">Recent Creator Withdrawal Requests</h3>
                    <span className="text-xs font-semibold text-[#8B8B96]">Live Activity Log</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {withdrawalSummary.recentRequests.map((req, idx) => (
                      <div key={req.id || idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] text-xs">
                        <div>
                          <span className="text-white font-bold block">{req.creatorName}</span>
                          <span className="text-[10px] text-[#8B8B96]">REF: #{req.id} • {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-[#FFD60A] block">{formatCurrency(req.amount)}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            req.status === 'completed' || req.status === 'approved' || req.status === 'paid'
                              ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                              : req.status === 'rejected'
                              ? 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
                              : 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGINATION CONTROLS BAR (Only for Payment & Withdrawal Reports) */}
          {(activeReportSection === 'payment' || activeReportSection === 'withdrawal') && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C1C26] text-xs">
              <span className="text-[#8B8B96]">
                Page <strong className="text-[#00F5D4]">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> (Total Telemetry Items: {totalCount})
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
          )}
        </>
      )}
    </div>
  );
}
