'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Building2,
  Copyright,
  Search,
  UserCheck,
  ShieldOff,
  AlertTriangle,
} from 'lucide-react';

export default function CopyrightPolicyPage() {
  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
      {/* Navigation Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">

        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            Copyright Policy
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

          {/* Section 1: Reporting Infringing Material */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000] shrink-0">
                <Copyright className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                1. Reporting Infringing Material
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                A copyright owner or authorised representative may report allegedly infringing material to AskMe.
              </p>
            </div>
          </div>

          {/* Section 2: Complaint Requirements */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                2. Complaint Requirements
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                A complaint should identify the protected work, identify the allegedly infringing material with sufficient detail to locate it, provide contact information, explain the basis of the complaint and confirm the complainant's authority where applicable.
              </p>
            </div>
          </div>

          {/* Section 3: AskMe's Response */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD60A]/10 border border-[#FFD60A]/30 flex items-center justify-center text-[#FFD60A] shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                3. AskMe's Response to Complaints
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                AskMe may investigate the complaint, restrict or remove material where appropriate, notify affected users where appropriate and consider counter-notices or responses where applicable.
              </p>
            </div>
          </div>

          {/* Section 4: Repeated Infringement */}
          <div className="bg-[#140A0D] border-2 border-[#EB1000]/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EB1000]/15 border border-[#EB1000]/50 flex items-center justify-center text-[#EB1000] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                4. Repeated or Serious Infringement
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                Repeated or serious infringement may result in account restrictions or termination.
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
