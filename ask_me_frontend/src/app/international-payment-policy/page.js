'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Globe,
  Building2,
  ShieldAlert,
  CreditCard,
  Ban,
  ShieldCheck,
  Scale,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react';

export default function InternationalPaymentPolicyPage() {
  const restrictedCountries = [
    { name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    { name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
    { name: 'North Korea (DPRK)', code: 'KP', flag: '🇰🇵' },
    { name: 'Palestine', code: 'PS', flag: '🇵🇸' },
    { name: 'Türkiye (Turkey)', code: 'TR', flag: '🇹🇷' },
  ];

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
      {/* Navigation Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">

        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            INTERNATIONAL PAYMENT POLICY
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

          {/* Section 1: International Viewers */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000] shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                1. International Viewer Interactions & Purchases
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1 sm:pl-13">
              <p>
                AskMe may allow international viewers to purchase paid questions or other supported interactions from launch, subject to payment provider capability, applicable law and country availability.
              </p>
            </div>
          </div>

          {/* Section 2: Foreign Exchange & Regulatory Compliance */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                2. Regulatory, FEMA & Foreign Exchange Rules
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1 sm:pl-13">
              <p>
                International transactions may be subject to foreign exchange rules, FEMA requirements, tax rules, payment network requirements, sanctions controls, AML/CFT requirements, banking restrictions and Payment Service Provider rules.
              </p>
            </div>
          </div>

          {/* Section 3: International Creator Payouts */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD60A]/10 border border-[#FFD60A]/30 flex items-center justify-center text-[#FFD60A] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                3. International Creator Payout Availability
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1 sm:pl-13">
              <p>
                International Creators may not automatically be enabled for payouts at launch. Creator payout availability outside India may depend on KYC, payment provider support, country eligibility, tax documentation, foreign exchange requirements and applicable law.
              </p>
            </div>
          </div>

          {/* Section 4: Restricted Jurisdictions */}
          <div className="bg-[#140A0D] border-2 border-[#EB1000]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            AskMe currently restricts international payments originating from or processed from Pakistan, Bangladesh, North Korea (DPRK), Palestine and Türkiye (Turkey).
            <br />
            These restrictions are platform and payment risk controls and should not be interpreted as a statement that Indian law universally prohibits every transaction involving those jurisdictions.
          </div>

          {/* Section 5: Dynamic Policy Updates */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                5. Modifications to Restricted Jurisdictions
              </h2>
            </div>
            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-3 pl-1 sm:pl-13">
              <p>
                AskMe may add, remove or modify restricted jurisdictions based on sanctions, law, banking requirements, Payment Service Provider requirements, foreign exchange restrictions, AML/CFT considerations or risk.
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
