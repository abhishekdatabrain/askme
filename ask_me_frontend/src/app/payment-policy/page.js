'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  CreditCard,
  Building2,
  ShieldCheck,
  Lock,
  Landmark,
  FileCheck
} from 'lucide-react';

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
      {/* Landing Navbar Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">

        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-extrabold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Financial & Payment Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            PAYMENT POLICY
          </h1>

          {/* ENTITY DETAILS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] max-w-2xl mx-auto text-xs sm:text-sm text-[#A0A0B2] space-y-1 text-center">
            <p className="text-white font-bold flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4 text-[#EB1000]" />
              <span>Operated by: FuturePast Ventures LLP</span>
            </p>
            <p>LLPIN: ACQ-4984</p>
            <p>Registered Office: Pune, Maharashtra, India</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#8E8E9F] font-medium pt-2">
            <span>Effective Date: <strong>25 September 2026</strong></span>
            <span>•</span>
            <span>Last Updated: <strong>25 September 2026</strong></span>
          </div>
        </section>

        {/* POLICY CARDS */}
        <section className="space-y-6">

          {/* Main Payment Policy Section */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-6 hover:border-[#EB1000]/40 transition-all shadow-lg">

            <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed space-y-4">
              <p>
                AskMe may use one or more Payment Service Providers for payment collection, transaction processing, settlement, refunds, chargebacks, fraud screening, foreign exchange and related payment functions.
              </p>

              <p>
                The specific Payment Service Provider may change over time.
              </p>

              <p>
                AskMe does not represent itself as a bank, Payment Aggregator, remittance provider, wallet issuer or other regulated financial entity unless it separately obtains the relevant authorisation.
              </p>

              <p>
                Payment processing may be subject to the Payment Service Provider's terms, verification procedures, transaction limits, country restrictions and security controls.
              </p>

              <p>
                AskMe ordinarily does not require raw card credentials such as CVV or payment PINs to be stored on its systems.
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
