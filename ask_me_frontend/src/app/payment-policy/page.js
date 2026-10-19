'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  CreditCard,
  Building2,
  ShieldCheck,
  Lock,
  HeartHandshake,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  UserCheck,
  ShieldAlert,
  Mail
} from 'lucide-react';

export default function PaymentPolicyPage() {
  const sections = [
    {
      id: 'introduction-and-scope',
      num: '1',
      title: 'Introduction and Scope',
      icon: CreditCard,
      content: (
        <div className="space-y-3">
          <p>
            This Payment Policy (&quot;Policy&quot;) governs the collection of voluntary Viewer payments, calculation of platform fees, tax deductions, and settlement of Creator payouts on AskMe (<span className="text-white font-medium">ask-me.live</span>), operated by FuturePast Ventures LLP (&quot;Company&quot;, &quot;AskMe&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </p>
          <p>
            This Policy forms an integral part of the{' '}
            <Link href="/terms-and-conditions" className="text-[#EB1000] underline hover:text-white transition">
              AskMe Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link href="/creator-terms" className="text-[#EB1000] underline hover:text-white transition">
              Creator Terms
            </Link>.
          </p>
        </div>
      )
    },
    {
      id: 'supported-payment-methods',
      num: '2',
      title: 'Supported Payment Methods & Processing',
      icon: ShieldCheck,
      content: (
        <div className="space-y-4">
          {/* 2.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.1</span>
              <span>Authorized Domestic Payment Gateways</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              All payments on AskMe are processed in Indian Rupees (INR) through RBI-authorized third-party Payment Aggregators and Payment Service Providers supporting UPI, RuPay/Visa/Mastercard debit and credit cards, netbanking, and approved digital wallets.
            </p>
          </div>

          {/* 2.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">2.2</span>
              <span>No Storage of Sensitive Payment Credentials</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              AskMe does not directly store raw debit/credit card numbers, CVV codes, netbanking passwords, or UPI PINs on its servers. All payment credentials are encrypted and processed directly by PCI-DSS compliant payment gateway partners.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'voluntary-fan-payments',
      num: '3',
      title: 'Voluntary Fan Payments & Finality of Checkout',
      icon: HeartHandshake,
      content: (
        <div className="space-y-4">
          {/* 3.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.1</span>
              <span>Voluntary Contribution Model</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              Every payment initiated by a Viewer on AskMe is a voluntary fan support contribution willingly paid by the Viewer to support a Creator and to place a question or message into the Creator&apos;s AskMe Studio Queue.
            </p>
          </div>

          {/* 3.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
              <span className="text-[#EB1000] font-black">3.2</span>
              <span>Immediate Technological Fulfilment</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              AskMe&apos;s obligation as a technology platform is fulfilled the moment the Viewer&apos;s paid submission is transmitted into the Creator&apos;s Studio Queue upon confirmation of payment.
            </p>
          </div>

          {/* 3.3 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">3.3</span>
              <span>Strict Non-Refundability</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              Operating on the same principles as YouTube Super Chats and livestream tipping, all Viewer payments are final, non-cancellable, and non-refundable. Answering any question is strictly on the Creator&apos;s own will. Neither AskMe (<span className="text-white font-medium">ask-me.live</span>), FuturePast Ventures LLP, nor the Creator is responsible or liable for an unanswered, skipped, or rejected question, and no refund is provided if a question goes unanswered.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'fee-structure',
      num: '4',
      title: 'Fee Structure & Creator Revenue Share (80.3% Net Payout)',
      icon: Percent,
      content: (
        <div className="space-y-5">
          <p>
            For every eligible gross voluntary payment collected from a Viewer, the transaction breakdown is calculated transparently as follows:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Gross Viewer Payment */}
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">
                  Gross Viewer Payment
                </span>
                <span className="text-xs text-[#A0A0B2]">Total amount paid at checkout</span>
              </div>
              <span className="text-lg font-heading font-black text-white shrink-0">100.0%</span>
            </div>

            {/* AskMe Platform Fee */}
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">
                  AskMe Platform Service Fee
                </span>
                <span className="text-xs text-[#A0A0B2]">Technology & software fee</span>
              </div>
              <span className="text-lg font-heading font-black text-[#EB1000] shrink-0">15.0%</span>
            </div>

            {/* GST on Platform Fee */}
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">
                  GST on Platform Service Fee
                </span>
                <span className="text-xs text-[#A0A0B2]">18% GST on the 15% Platform Fee</span>
              </div>
              <span className="text-lg font-heading font-black text-[#FFB300] shrink-0">2.7%</span>
            </div>

            {/* Gateway Processing Charges */}
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">
                  Payment Gateway Charges
                </span>
                <span className="text-xs text-[#A0A0B2]">Standard processing charges</span>
              </div>
              <span className="text-lg font-heading font-black text-[#A0A0B2] shrink-0">~2.0%</span>
            </div>
          </div>

          {/* Highlight Net Creator Payout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#180A0C] to-[#141422] border border-[#EB1000]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#EB1000] uppercase tracking-wider block">
                Net Creator Base Payout
              </span>
              <p className="text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
                Subject to applicable statutory tax withholdings such as TDS/TCS under Indian tax laws, as detailed in our{' '}
                <Link href="/gst-tax-policy" className="text-[#EB1000] underline hover:text-white transition font-medium">
                  GST and Tax Policy
                </Link>.
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#00E676] block">
                80.3%
              </span>
              <span className="text-[10px] font-bold text-[#8E8E9F] uppercase tracking-wider">
                of Gross Payment
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'creator-kyc-and-payouts',
      num: '5',
      title: 'Creator KYC & Payout Settlements',
      icon: UserCheck,
      content: (
        <div className="space-y-4">
          {/* 5.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">5.1</span>
              <span>Mandatory KYC Verification</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              Prior to enabling payouts, Creators must complete identity and banking verification within the AskMe Creator Dashboard by submitting a valid, operative Indian Permanent Account Number (PAN), verified Indian bank account details (Account Number and IFSC) or UPI ID in the Creator&apos;s legal/registered name, and a valid GSTIN (where registered under GST).
            </p>
          </div>

          {/* 5.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">5.2</span>
              <span>Settlement Timelines</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              Subject to successful settlement of funds from the Payment Aggregator into AskMe&apos;s settlement account and the absence of fraud or risk flags, net Creator earnings are remitted to the Creator&apos;s verified bank account according to the settlement cycle displayed in the Creator Dashboard.
            </p>
          </div>

          {/* 5.3 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">5.3</span>
              <span>Holds & Risk Mitigation</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              FuturePast Ventures LLP reserves the right to temporarily delay, withhold, or offset Creator payouts if a transaction is flagged by our payment gateway partner for suspected fraud, unauthorized payment instrument use, regulatory inquiry, or violation of our Terms and Conditions.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'chargebacks-and-fraud-prevention',
      num: '6',
      title: 'Chargebacks, UPI Disputes, and Fraud Prevention',
      icon: ShieldAlert,
      content: (
        <div className="space-y-3">
          <p>
            By completing a payment on AskMe, the Viewer expressly agrees that a Creator&apos;s decision not to answer a question does not constitute &quot;non-delivery of service&quot; or grounds for a payment dispute.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
            If a Viewer initiates an unwarranted chargeback or UPI dispute, FuturePast Ventures LLP will provide checkout logs, timestamped queue delivery proofs, and IP records to the Payment Aggregator and issuing bank to contest the dispute, and will permanently terminate the Viewer&apos;s platform access.
          </div>
        </div>
      )
    },
    {
      id: 'contact-and-grievance',
      num: '7',
      title: 'Contact & Grievance Officer',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p>
            For any billing inquiries, payout clarifications, or grievances relating to this Policy, please contact:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
              <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Billing & Payout Support</span>
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
            <CreditCard className="w-3.5 h-3.5" />
            <span>Financial & Payment Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            PAYMENT POLICY
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

        {/* NUMERICAL POLICY SECTIONS */}
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
