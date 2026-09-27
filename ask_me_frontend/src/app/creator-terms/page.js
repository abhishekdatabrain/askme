'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Building2,
  Compass,
  BarChart2,
  ShieldOff,
  RefreshCw,
} from 'lucide-react';

export default function CreatorTermsPage() {
  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
      {/* Navigation Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">

        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            Creator Terms
          </h1>

          {/* ENTITY DETAILS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] max-w-2xl mx-auto text-xs sm:text-sm text-[#A0A0B2] space-y-1 text-center shadow-md">
            <p className="text-white font-bold flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4 text-[#EB1000]" />
              <span>Operated by: FuturePast Ventures LLP</span>
            </p>
            <p>LLPIN: ACQ-4984</p>
            <p>Registered Office: Pune, Maharashtra, India</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#8E8E9F] font-medium pt-2">
            <span>Effective Date: <strong>26 September 2026</strong></span>
            <span>•</span>
            <span>Last Updated: <strong>26 September 2026</strong></span>
          </div>
        </section>

        {/* POLICY SECTIONS */}
        <section className="space-y-6">

          {/* Section 1: Creator Discovery Features */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000] shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                1. Creator Discovery Features
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                AskMe may provide Creator discovery features allowing viewers to find Creators according to categories, interests and other relevant signals.
              </p>
            </div>
          </div>

          {/* Section 2: Visibility & Ranking Signals */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                2. Visibility &amp; Ranking Signals
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                Creator visibility may be influenced by relevance, category, session activity, engagement, availability, language, geography, Creator profile completeness, safety considerations, promotional programmes and other platform signals.
              </p>
            </div>
          </div>

          {/* Section 3: No Guarantees */}
          <div className="bg-[#140A0D] border-2 border-[#EB1000]/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EB1000]/15 border border-[#EB1000]/50 flex items-center justify-center text-[#EB1000] shrink-0">
                <ShieldOff className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                3. No Guaranteed Outcomes
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                No Creator is guaranteed a particular position, number of views, number of questions, revenue or level of exposure.
              </p>
            </div>
          </div>

          {/* Section 4: Platform Modifications */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                4. Platform Modifications
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                AskMe may modify discovery and ranking systems as the platform develops.
              </p>
            </div>
          </div>

        </section>

      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
