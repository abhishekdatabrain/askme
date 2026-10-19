'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Receipt,
  Building2,
  FileText,
  Percent,
  Calculator,
  Landmark,
  ShieldCheck,
  AlertCircle,
  Mail,
  UserCheck,
  Lock,
  AlertTriangle
} from 'lucide-react';

export default function GstTaxPolicyPage() {
  const sections = [
    {
      id: 'overview-and-scope',
      num: '1',
      title: 'Overview and Scope',
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            This GST and Tax Policy (&quot;Policy&quot;) outlines the indirect and direct tax treatment applicable to voluntary Viewer payments, platform service fees, and Creator payouts processed through AskMe (<span className="text-white font-medium">ask-me.live</span>), operated by FuturePast Ventures LLP (&quot;Company&quot;, &quot;AskMe&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </p>
        </div>
      )
    },
    {
      id: 'platform-service-fee-and-gst',
      num: '2',
      title: 'Platform Service Fee and Goods & Services Tax (GST)',
      icon: Percent,
      content: (
        <div className="space-y-4">
          {/* 2.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.1</span>
              <span>AskMe Platform Service Fee</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              AskMe charges Creators a technology and platform facilitation fee of 15% on the gross value of voluntary Viewer payments processed through the platform, in addition to standard third-party payment gateway charges (~2%).
            </p>
          </div>

          {/* 2.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.2</span>
              <span>GST on Platform Fee</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              In accordance with the Central Goods and Services Tax Act, 2017 (and applicable IGST/SGST statutes), Goods and Services Tax at the prevailing statutory rate of 18% is levied on AskMe&apos;s 15% Platform Service Fee (representing 2.7% of the gross transaction value).
            </p>
          </div>

          {/* 2.3 */}
          <div className="space-y-3 pt-1">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.3</span>
              <span>Net Creator Payout Calculation</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              After deducting the 15% Platform Service Fee, 18% GST on the Platform Fee (2.7%), and standard 2% payment gateway charges, eligible Creators receive a net base share of 80.3% of the gross transaction value, subject to applicable statutory withholding taxes (TDS/TCS) detailed in Section 4.
            </p>

            {/* Visual Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Gross Viewer Payment</span>
                  <span className="text-xs text-[#A0A0B2]">Total checkout contribution</span>
                </div>
                <span className="text-lg font-heading font-black text-white shrink-0">100.0%</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">AskMe Platform Fee</span>
                  <span className="text-xs text-[#A0A0B2]">Technology & facilitation fee</span>
                </div>
                <span className="text-lg font-heading font-black text-[#EB1000] shrink-0">15.0%</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">GST on Platform Fee</span>
                  <span className="text-xs text-[#A0A0B2]">18% GST on 15% fee</span>
                </div>
                <span className="text-lg font-heading font-black text-[#FFB300] shrink-0">2.7%</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Payment Gateway Charges</span>
                  <span className="text-xs text-[#A0A0B2]">Standard processing charges</span>
                </div>
                <span className="text-lg font-heading font-black text-[#A0A0B2] shrink-0">~2.0%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#180A0C] to-[#141422] border border-[#EB1000]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#EB1000] uppercase tracking-wider block">
                  Net Creator Base Payout
                </span>
                <span className="text-xs text-[#D0D0E0]">
                  Subject to applicable statutory tax withholdings (TDS/TCS)
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#00E676] shrink-0">
                80.3%
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tax-invoicing-and-creator-gst',
      num: '3',
      title: 'Tax Invoicing & Creator GST Compliance',
      icon: Calculator,
      content: (
        <div className="space-y-4">
          {/* 3.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.1</span>
              <span>AskMe Commission Statements</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              AskMe generates periodic tax-compliant statements/invoices reflecting the Platform Service Fee charged to the Creator and the GST levied thereon.
            </p>
          </div>

          {/* 3.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.2</span>
              <span>GST-Registered Creators</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              Creators registered under Indian GST must furnish and maintain an active GSTIN within their AskMe Creator Dashboard. Where a valid GSTIN is provided prior to transaction settlement, AskMe will issue B2B tax invoices enabling eligible Creators to claim Input Tax Credit (ITC) on the GST charged on AskMe&apos;s Platform Service Fee, subject to compliance with prevailing GST regulations.
            </p>
          </div>

          {/* 3.3 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.3</span>
              <span>Independent Tax Liability of Creators</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              Creators operate as independent individuals or entities and remain solely responsible for assessing whether their aggregate annual turnover exceeds the statutory threshold requiring GST registration, and for discharging their own income tax and GST obligations.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tds-and-tcs',
      num: '4',
      title: 'Tax Deducted at Source (TDS) & Tax Collected at Source (TCS)',
      icon: Landmark,
      content: (
        <div className="space-y-3">
          <p>
            Where mandated under the Indian Income-tax Act, 1961 (including Section 194-O or other applicable provisions) or the CGST Act, 2017 (including Section 52 TCS provisions applicable to electronic commerce operators), FuturePast Ventures LLP will deduct or collect statutory taxes at the rates prescribed by law prior to remitting net payouts to the Creator&apos;s verified bank account.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
            All statutory deductions are deposited against the Creator&apos;s verified Permanent Account Number (PAN) and reflected in periodic tax certificates issued within statutory timelines.
          </div>
        </div>
      )
    },
    {
      id: 'mandatory-pan-and-kyc',
      num: '5',
      title: 'Mandatory PAN & KYC Compliance',
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            Accurate statutory tax reporting requires verified identity and tax credentials. Creators must furnish a valid, operative Indian PAN and verified bank account details before initiating withdrawals.
          </p>
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <AlertTriangle className="w-4 h-4 text-[#EB1000]" />
              <span>Section 206AA / 206AB Compliance</span>
            </div>
            <p className="leading-relaxed">
              AskMe reserves the right to hold payouts or apply higher statutory withholding rates under the Income-tax Act, 1961 (such as Section 206AA / 206AB) if a Creator fails to provide a valid, operative PAN linked with Aadhaar.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'general-tax-disclaimer',
      num: '6',
      title: 'General Tax Disclaimer',
      icon: AlertCircle,
      content: (
        <div className="space-y-3">
          <p>
            This Policy sets forth AskMe&apos;s standard operational tax procedures under Indian law.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
            Creators are encouraged to consult their own Chartered Accountant or tax advisor regarding their personal income tax and GST filing obligations arising from earnings received through AskMe.
          </div>
        </div>
      )
    },
    {
      id: 'contact-information',
      num: '7',
      title: 'Contact Information',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p>
            For any tax, GST invoicing, or TDS certificate inquiries relating to AskMe, please contact:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
              <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Tax & Billing Support</span>
              <a
                href="mailto:support@ask-me.live"
                className="text-white font-bold text-sm hover:text-[#EB1000] transition flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4 text-[#EB1000]" />
                <span>support@ask-me.live</span>
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
              <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Designated Grievance Officer</span>
              <a
                href="mailto:Grievance@ask-me.live"
                className="text-white font-bold text-sm hover:text-[#EB1000] transition flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4 text-[#EB1000]" />
                <span>Grievance@ask-me.live</span>
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs text-[#A0A0B2] space-y-1">
            <p className="font-bold text-white">Entity & Registered Office:</p>
            <p>FuturePast Ventures LLP (LLPIN: ACQ-4984)</p>
            <p>Lake View City, Lohegaon, Pune 411047, Maharashtra, India.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
      {/* Landing Navbar Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-extrabold uppercase tracking-wider">
            <Receipt className="w-3.5 h-3.5" />
            <span>Taxation Policy & Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            GST AND TAX POLICY
          </h1>

          {/* ENTITY DETAILS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] max-w-2xl mx-auto text-xs sm:text-sm text-[#A0A0B2] space-y-1 text-center shadow-md">
            <p className="text-white font-bold flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4 text-[#EB1000]" />
              <span>Operated by: FuturePast Ventures LLP (LLPIN: ACQ-4984)</span>
            </p>
            <p>
              Platform: AskMe (<a href="https://www.ask-me.live" target="_blank" rel="noopener noreferrer" className="text-[#EB1000] hover:underline">https://www.ask-me.live</a>)
            </p>
            <p>Registered Office: Lake View City, Lohegaon, Pune 411047, Maharashtra, India</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#8E8E9F] font-medium pt-2">
            <span>Effective Date: <strong>25 September 2026</strong></span>
            <span>•</span>
            <span>Last Updated: <strong>17 October 2026</strong></span>
          </div>
        </section>

        {/* POLICY SECTIONS */}
        <section className="space-y-6">
          {sections.map((sec) => {
            const IconComponent = sec.icon;
            return (
              <div
                key={sec.id}
                id={sec.id}
                className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 border-b border-[#1C1C2A] pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EB1000]/10 border border-[#EB1000]/20 flex items-center justify-center text-[#EB1000] shrink-0 font-bold text-sm">
                    {sec.num}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white flex items-center gap-2.5">
                    <IconComponent className="w-5 h-5 text-[#EB1000]" />
                    <span>{sec.title}</span>
                  </h2>
                </div>

                <div className="text-sm sm:text-base text-[#A0A0B2] leading-relaxed pt-1">
                  {sec.content}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
