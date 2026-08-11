import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Users, 
  DollarSign,
  PieChart
} from 'lucide-react';
import PlatformIcon from './PlatformIcon';

export default function ReportsAnalytics() {
  const [reportTimeframe, setReportTimeframe] = useState('Monthly');

  const topCreators = [
    { rank: 1, name: 'CA Rachana Ranade', handle: '@ca_rachana', platform: 'youtube', totalDonations: '₹8,45,000', questionsAnswered: 520, rating: '4.95' },
    { rank: 2, name: 'TechBurner Live', handle: '@techburner', platform: 'youtube', totalDonations: '₹6,12,000', questionsAnswered: 340, rating: '4.92' },
    { rank: 3, name: 'CodeWithAnish', handle: '@codewithanish', platform: 'youtube', totalDonations: '₹3,40,000', questionsAnswered: 210, rating: '4.88' },
    { rank: 4, name: 'GamerX Xtreme', handle: '@gamerx', platform: 'twitch', totalDonations: '₹1,85,000', questionsAnswered: 155, rating: '4.80' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-[#7B2FFF]" />
            Reports & Analytics
          </h2>
          <p className="text-xs text-[#8B8B96] mt-1">
            Comprehensive platform telemetry, revenue analytics, creator leaderboard performance, and payment success rates.
          </p>
        </div>

        {/* Timeframe selector (Daily, Weekly, Monthly) */}
        <div className="flex items-center gap-2 bg-[#13131A] p-1 rounded-2xl border border-[#1C1C26]">
          {['Daily', 'Weekly', 'Monthly'].map((tf) => (
            <button
              key={tf}
              onClick={() => setReportTimeframe(tf)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                reportTimeframe === tf
                  ? 'bg-brand-gradient text-[#0A0A0F] shadow-md'
                  : 'text-[#8B8B96] hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 22.1: Revenue Report (Daily, Weekly, Monthly) */}
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

      {/* Grid: 22.2 Creator Performance & 22.3 Payment Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 22.2: Creator Performance Leaderboard */}
        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-[#FFD60A]" />
                Top Creators & Highest Donations
              </h3>
              <p className="text-xs text-[#8B8B96]">Ranked by total audience question donations and rating.</p>
            </div>
            <span className="text-xs font-bold text-[#FFD60A] bg-[#FFD60A]/10 px-2.5 py-1 rounded-full border border-[#FFD60A]/30">
              Leaderboard
            </span>
          </div>

          <div className="space-y-3">
            {topCreators.map((creator) => (
              <div key={creator.rank} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] hover:border-[#00F5D4]/40 transition-all">
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

        {/* SECTION 22.3: Payment Reports (Successful vs Failed) */}
        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[#00F5D4]" />
                Payment Gateway Performance
              </h3>
              <p className="text-xs text-[#8B8B96]">Transaction health metrics (Successful vs. Failed attempts).</p>
            </div>
            <span className="text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 rounded-full border border-[#00E676]/30">
              98.4% Success
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

          <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2">
            <span className="text-xs font-bold text-white block">Payment Gateway Split</span>
            <div className="space-y-1.5 text-xs text-[#8B8B96]">
              <div className="flex justify-between">
                <span>Razorpay UPI & Cards (India)</span>
                <span className="text-white font-mono font-bold">78.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Stripe International Cards</span>
                <span className="text-white font-mono font-bold">21.5%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
