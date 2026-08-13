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
  Download
} from 'lucide-react';
import PlatformIcon from './PlatformIcon';

export default function ReportsAnalytics({ activeSubTab }) {
  const [reportTimeframe, setReportTimeframe] = useState('Monthly');
  const [activeReportSection, setActiveReportSection] = useState('revenue');

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

  const topCreators = [
    { rank: 1, name: 'CA Rachana Ranade', handle: '@ca_rachana', platform: 'youtube', totalDonations: '₹8,45,000', questionsAnswered: 520, rating: '4.95' },
    { rank: 2, name: 'TechBurner Live', handle: '@techburner', platform: 'youtube', totalDonations: '₹6,12,000', questionsAnswered: 340, rating: '4.92' },
    { rank: 3, name: 'CodeWithAnish', handle: '@codewithanish', platform: 'youtube', totalDonations: '₹3,40,000', questionsAnswered: 210, rating: '4.88' },
    { rank: 4, name: 'GamerX Xtreme', handle: '@gamerx', platform: 'twitch', totalDonations: '₹1,85,000', questionsAnswered: 155, rating: '4.80' },
  ];

  const withdrawalReportData = [
    { period: 'Aug 2026', totalRequested: '₹12,45,000', totalApproved: '₹11,80,000', avgProcessingTime: '4 mins' },
    { period: 'Jul 2026', totalRequested: '₹18,90,000', totalApproved: '₹18,50,000', avgProcessingTime: '6 mins' },
    { period: 'Jun 2026', totalRequested: '₹15,20,000', totalApproved: '₹15,00,000', avgProcessingTime: '5 mins' },
  ];

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
            Comprehensive platform telemetry, revenue analytics, creator performance reports, and payment reports.
          </p>
        </div>

        {/* Section buttons & timeframe selector */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-1 bg-[#13131A] p-1 rounded-2xl border border-[#1C1C26]">
            {[
              { id: 'revenue', label: 'Revenue' },
              { id: 'payment', label: 'Payment' },
              { id: 'creator', label: 'Creator' },
              { id: 'withdrawal', label: 'Withdrawal' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveReportSection(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeReportSection === s.id
                    ? 'bg-brand-gradient text-[#0A0A0F]'
                    : 'text-[#8B8B96] hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#13131A] p-1 rounded-2xl border border-[#1C1C26]">
            {['Daily', 'Weekly', 'Monthly'].map((tf) => (
              <button
                key={tf}
                onClick={() => setReportTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  reportTimeframe === tf
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

      {/* Revenue Report Section */}
      {(activeReportSection === 'revenue' || activeReportSection === 'all') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">Gross Platform Volume ({reportTimeframe})</span>
              <TrendingUp className="h-4 w-4 text-[#00E676]" />
            </div>
            <h3 className="font-heading font-black text-3xl text-white">
              {reportTimeframe === 'Daily' ? '₹84,500' : reportTimeframe === 'Weekly' ? '₹5,82,000' : '₹24,89,500'}
            </h3>
            <p className="text-xs text-[#00E676] font-semibold">+14.2% compared to previous {reportTimeframe.toLowerCase()}</p>
          </div>

          <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">AskMe Net Commission (15%)</span>
              <DollarSign className="h-4 w-4 text-[#FFD60A]" />
            </div>
            <h3 className="font-heading font-black text-3xl text-[#FFD60A]">
              {reportTimeframe === 'Daily' ? '₹12,675' : reportTimeframe === 'Weekly' ? '₹87,300' : '₹3,73,425'}
            </h3>
            <p className="text-xs text-[#8B8B96]">Retained platform operational margin</p>
          </div>

          <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider">Creator Net Earnings (85%)</span>
              <Users className="h-4 w-4 text-[#00F5D4]" />
            </div>
            <h3 className="font-heading font-black text-3xl text-[#00E676]">
              {reportTimeframe === 'Daily' ? '₹71,825' : reportTimeframe === 'Weekly' ? '₹4,94,700' : '₹21,16,075'}
            </h3>
            <p className="text-xs text-[#00F5D4]">Settled to creator bank accounts</p>
          </div>
        </div>
      )}

      {/* Creator Report & Payment Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Creator Performance Report */}
        {(activeReportSection === 'creator' || activeReportSection === 'revenue') && (
          <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#FFD60A]" />
                  Top Creators Report
                </h3>
                <p className="text-xs text-[#8B8B96]">Ranked by total audience question donations and rating.</p>
              </div>
              <span className="text-xs font-bold text-[#FFD60A] bg-[#FFD60A]/10 px-2.5 py-1 rounded-full border border-[#FFD60A]/30">
                Leaderboard
              </span>
            </div>

            <div className="space-y-3">
              {topCreators.map((creator) => (
                <div key={creator.rank} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <div className="flex items-center gap-3">
                    <span className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      creator.rank === 1 ? 'bg-[#FFD60A] text-[#0A0A0F]' : 'bg-[#1C1C26] text-[#8B8B96]'
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
                    <span className="font-mono text-xs font-bold text-[#00E676] block">{creator.totalDonations}</span>
                    <span className="text-[10px] text-[#FFD60A]">★ {creator.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Performance Report */}
        {(activeReportSection === 'payment' || activeReportSection === 'revenue') && (
          <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-[#00F5D4]" />
                  Payment Gateway Report
                </h3>
                <p className="text-xs text-[#8B8B96]">Transaction health metrics (Successful vs. Failed attempts).</p>
              </div>
              <span className="text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 rounded-full border border-[#00E676]/30">
                98.4% Success Rate
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#00E676]/30 space-y-2">
                <div className="flex items-center gap-2 text-[#00E676]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">Successful Payments</span>
                </div>
                <h4 className="font-heading font-black text-2xl text-white">14,890</h4>
                <p className="text-[11px] text-[#8B8B96]">Settled with Zero Chat Loss</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#FF5252]/30 space-y-2">
                <div className="flex items-center gap-2 text-[#FF5252]">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase">Failed / Timed Out</span>
                </div>
                <h4 className="font-heading font-black text-2xl text-white">242</h4>
                <p className="text-[11px] text-[#8B8B96]">Automatic Escrow Auto-Refund</p>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Performance Report */}
        {(activeReportSection === 'withdrawal') && (
          <div className="col-span-1 lg:col-span-2 rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-[#00F5D4]" />
                  Withdrawal & Payout Analytics Report
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
                    <td className="py-3 px-2 text-[#FFD60A] font-bold">{row.totalRequested}</td>
                    <td className="py-3 px-2 text-[#00E676] font-bold">{row.totalApproved}</td>
                    <td className="py-3 px-2 text-[#00F5D4]">{row.avgProcessingTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
