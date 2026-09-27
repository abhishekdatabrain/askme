'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Building2,
  Mail,
  MapPin,
  FileText,
  MessagesSquare,
  ShieldCheck,
  Info,
  ClipboardList,
} from 'lucide-react';

export default function GrievancePolicyPage() {
  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
      {/* Navigation Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">

        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            Grievance Policy
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

          {/* Section 1: Scope of Complaints */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000] shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                1. Scope of Complaints
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                Users may submit complaints concerning accounts, Creator activity, content, payments, privacy, transactions, platform operation or other AskMe matters.
              </p>
            </div>
          </div>

          {/* Section 2: Grievance Officer */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                2. Designated Grievance Officer
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed pl-1">
              <p className="mb-4">The designated Grievance Officer is:</p>
              <div className="bg-[#07070C] border border-[#1E1E2E] rounded-2xl p-5 space-y-3">
                <p className="text-white font-bold text-base">Mr. T.S. Sandhu</p>
                <div className="flex items-center gap-2 text-sm text-[#A0A0B2]">
                  <Mail className="w-4 h-4 text-[#EB1000] shrink-0" />
                  <a
                    href="mailto:Grievance@ask-me.live"
                    className="hover:text-white transition-colors break-all"
                  >
                    Grievance@ask-me.live
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#A0A0B2]">
                  <MapPin className="w-4 h-4 text-[#EB1000] shrink-0" />
                  <span>Pune, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Complaint Requirements */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD60A]/10 border border-[#FFD60A]/30 flex items-center justify-center text-[#FFD60A] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                3. Complaint Requirements
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                Complaints should contain sufficient information to identify the complainant, account or transaction where relevant, the issue complained of and the requested resolution.
              </p>
            </div>
          </div>

          {/* Section 4: Additional Information */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                4. Additional Information Requests
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                AskMe may request additional information where necessary to investigate a complaint.
              </p>
            </div>
          </div>

          {/* Section 5: Handling of Grievances */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shrink-0">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                5. Handling of Grievances
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1">
              <p>
                Grievances will be handled in accordance with applicable law and the procedures applicable to the relevant category of complaint.
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
