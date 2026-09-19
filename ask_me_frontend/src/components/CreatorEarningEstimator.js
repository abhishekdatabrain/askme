'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calculator, Sparkles, TrendingUp, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CreatorEarningEstimator() {
  const [subscribers, setSubscribers] = useState(50000);
  const [feePerQuestion, setFeePerQuestion] = useState(150);
  const [questionsPerSession, setQuestionsPerSession] = useState(15);
  const [sessionsPerMonth, setSessionsPerMonth] = useState(8);

  // Estimation math
  const monthlyQuestions = questionsPerSession * sessionsPerMonth;
  const grossMonthlyEarnings = monthlyQuestions * feePerQuestion;
  const platformFee = grossMonthlyEarnings * 0.10; // 10% platform commission
  const netMonthlyEarnings = grossMonthlyEarnings - platformFee;
  const yearlyEarnings = netMonthlyEarnings * 12;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div id="calculator" className="relative rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 md:p-10 shadow-2xl overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00F5D4]/5 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EB1000]/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] text-xs font-bold border border-[#00F5D4]/20 mb-3">
              <Calculator className="h-3.5 w-3.5" />
              <span>REVENUE CALCULATOR</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-heading font-black text-white">
              Estimate Your <span className="text-brand-gradient">Monthly Income</span>
            </h3>
            <p className="text-sm text-[#8B8B96] mt-1">
              Adjust the parameters below to see how much you could earn answering live questions from your fans.
            </p>
          </div>

          {/* Slider 1: Subscribers */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#8B8B96]">Your Active Subscriber Count</span>
              <span className="text-white font-bold">{subscribers.toLocaleString()} Fans</span>
            </div>
            <input
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={subscribers}
              onChange={(e) => setSubscribers(Number(e.target.value))}
              className="w-full h-2 bg-[#1C1C26] rounded-lg appearance-none cursor-pointer accent-[#00F5D4]"
            />
          </div>

          {/* Slider 2: Fee per question */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#8B8B96]">Price Per Question (₹)</span>
              <span className="text-[#FFD60A] font-bold">₹{feePerQuestion} / question</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={feePerQuestion}
              onChange={(e) => setFeePerQuestion(Number(e.target.value))}
              className="w-full h-2 bg-[#1C1C26] rounded-lg appearance-none cursor-pointer accent-[#FFD60A]"
            />
          </div>

          {/* Slider 3: Questions per session */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#8B8B96]">Questions Answered Per Live Session</span>
              <span className="text-white font-bold">{questionsPerSession} Questions</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={questionsPerSession}
              onChange={(e) => setQuestionsPerSession(Number(e.target.value))}
              className="w-full h-2 bg-[#1C1C26] rounded-lg appearance-none cursor-pointer accent-[#00F5D4]"
            />
          </div>

          {/* Slider 4: Live sessions per month */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#8B8B96]">Live Sessions Per Month</span>
              <span className="text-white font-bold">{sessionsPerMonth} Streams / Month</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={sessionsPerMonth}
              onChange={(e) => setSessionsPerMonth(Number(e.target.value))}
              className="w-full h-2 bg-[#1C1C26] rounded-lg appearance-none cursor-pointer accent-[#EB1000]"
            />
          </div>
        </div>

        {/* Right Column: Earnings Card Display */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] p-6 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8B8B96] tracking-wider uppercase">
                ESTIMATED EARNINGS
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-[10px] font-extrabold border border-[#00E676]/20">
                INSTANT PAYOUT READY
              </span>
            </div>

            {/* Big Projected Earnings Number */}
            <div className="space-y-1">
              <div className="text-xs text-[#8B8B96]">Est. Net Monthly Revenue</div>
              <div className="text-3xl sm:text-4xl font-heading font-black text-[#00F5D4] tracking-tight">
                {formatCurrency(netMonthlyEarnings)}
              </div>
              <div className="text-xs text-[#8B8B96]">
                Per Year Projected: <span className="text-white font-bold">{formatCurrency(yearlyEarnings)}</span>
              </div>
            </div>

            {/* Breakdown Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1C1C26] text-xs">
              <div className="p-3 rounded-xl bg-[#13131A] border border-[#1C1C26]">
                <div className="text-[#8B8B96] text-[10px]">Monthly Questions</div>
                <div className="text-sm font-bold text-white mt-0.5">{monthlyQuestions} Answered</div>
              </div>
              <div className="p-3 rounded-xl bg-[#13131A] border border-[#1C1C26]">
                <div className="text-[#8B8B96] text-[10px]">Platform Fee (10%)</div>
                <div className="text-sm font-bold text-[#FF3D71] mt-0.5">-{formatCurrency(platformFee)}</div>
              </div>
            </div>

            {/* Creator Perks List */}
            <div className="space-y-2 text-xs text-[#8B8B96]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#00F5D4] shrink-0" />
                <span>Instant withdrawal to UPI & Bank account</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#00F5D4] shrink-0" />
                <span>Zero setup fees or upfront commitments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#00F5D4] shrink-0" />
                <span>Automatic overlay integration for YouTube/Twitch</span>
              </div>
            </div>

            {/* Call to Action Button */}
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-[#EB1000]/30 hover:opacity-95 transition-all group"
            >
              <Sparkles className="h-4 w-4 text-[#FFD60A]" />
              <span>Start Earning as a Creator</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
