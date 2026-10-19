'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  RefreshCw,
  FileText,
  HeartHandshake,
  UserCheck,
  XCircle,
  AlertTriangle,
  Building2,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function RefundPolicyPage() {
  const sections = [
    {
      id: 'purpose-and-scope',
      num: '1',
      title: 'Purpose and Scope',
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            This Cancellation and Refund Policy (&quot;Policy&quot;) governs all payments, voluntary fan contributions, and paid question submissions made by users (&quot;Viewers&quot; or &quot;Fans&quot;) on AskMe (<span className="text-white font-medium">ask-me.live</span>), operated by FuturePast Ventures LLP (&quot;Company&quot;, &quot;AskMe&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </p>
          <p>
            By completing a payment on AskMe, you acknowledge that you have read, understood, and agreed to be bound by this Policy, together with our{' '}
            <Link href="/terms-and-conditions" className="text-[#EB1000] underline hover:text-white transition">Terms and Conditions</Link>,{' '}
            <Link href="/privacy-policy" className="text-[#EB1000] underline hover:text-white transition">Privacy Policy</Link>,{' '}
            <Link href="/creator-terms" className="text-[#EB1000] underline hover:text-white transition">Creator Terms</Link>, and{' '}
            <Link href="/payment-policy" className="text-[#EB1000] underline hover:text-white transition">Payment Policy</Link>.
          </p>
        </div>
      )
    },
    {
      id: 'voluntary-fan-support',
      num: '2',
      title: 'Voluntary Fan Support & Strict Non-Refundability',
      icon: HeartHandshake,
      content: (
        <div className="space-y-5">
          {/* 2.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.1</span>
              <span>Voluntary Support Contributions</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              All payments made by Viewers on AskMe are voluntary payments and fan support contributions willingly made by the Viewer to financially support the chosen Creator and to highlight a question or message within the Creator&apos;s AskMe Studio Queue.
            </p>
          </div>

          {/* 2.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.2</span>
              <span>Queue Visibility Only (Same as YouTube Super Chat Model)</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              Operating on the same principles as standard livestream paid-chat and tipping features (such as YouTube Super Chats), a payment on AskMe provides digital queue placement and studio visibility tools only. It does not constitute a purchase of a guaranteed consultation, professional service, or mandatory response.
            </p>
          </div>

          {/* 2.3 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">2.3</span>
              <span>Final and Non-Refundable</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              Because payments are voluntary fan contributions and digital delivery into the Creator&apos;s live queue happens instantaneously upon payment confirmation, all completed payments are strictly final, non-cancellable, and non-refundable.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'creator-sole-will',
      num: '3',
      title: "Creator's Sole Will & Complete Limitation of Liability",
      icon: UserCheck,
      content: (
        <div className="space-y-5">
          {/* 3.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.1</span>
              <span>Sole Will of the Creator</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              Whether, when, and how a submitted question or message is noticed, read, broadcasted, or answered is entirely at the Creator&apos;s own will and sole editorial discretion. A Creator may choose to answer publicly, answer briefly, skip, reject, or not respond to any submission for any reason whatsoever—including stream time limits, broadcast pacing, personal preference, or topic relevance.
            </p>
          </div>

          {/* 3.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.2</span>
              <span>No Responsibility of AskMe or FuturePast Ventures LLP</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              AskMe (<span className="text-white font-medium">ask-me.live</span>) and FuturePast Ventures LLP act strictly as technology intermediaries and are not responsible or liable in any manner whatsoever for a Creator&apos;s failure, refusal, or inability to respond to any particular question.
            </p>
          </div>

          {/* 3.3 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">3.3</span>
              <span>No Refund if Unanswered</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              Under no circumstances shall an unanswered, skipped, ignored, rejected, or partially answered question entitle the Viewer to a refund, reversal, credit, or chargeback from AskMe, FuturePast Ventures LLP, or the Creator.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'excluded-circumstances',
      num: '4',
      title: 'Circumstances Explicitly Excluded from Refunds',
      icon: XCircle,
      content: (
        <div className="space-y-4">
          <p>
            Without limiting the generality of Sections 2 and 3, no refund shall be issued in any of the following cases:
          </p>
          <div className="space-y-2.5 text-xs sm:text-sm">
            {[
              'The Creator did not read, notice, or answer the submitted question during or after the livestream;',
              'The Creator ended the livestream early, experienced technical issues on third-party streaming platforms (e.g., YouTube, Instagram, Twitch, Kick, LinkedIn, etc.), or ran out of broadcast time before reaching the Viewer\'s submission;',
              'The Creator manually skipped, rejected, or dismissed the question from their Studio Queue at their own will;',
              'The Viewer is dissatisfied with the tone, depth, accuracy, or length of the Creator\'s response;',
              'The Viewer\'s submission was rejected by the Creator or removed by AskMe for violating AskMe Community Guidelines (including profanity, hate speech, harassment, spam, defamation, or unlawful content); or',
              'The Viewer claims accidental purchase, buyer\'s remorse, or a change of mind after completing the payment.'
            ].map((reason, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#141422] border border-[#222234] text-[#D0D0E0] leading-relaxed"
              >
                <div className="w-5 h-5 rounded-full bg-[#EB1000]/15 border border-[#EB1000]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <XCircle className="w-3.5 h-3.5 text-[#EB1000]" />
                </div>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'duplicate-billing-exception',
      num: '5',
      title: 'Limited Exception for Verifiable Duplicate Billing Errors',
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p>
            Notwithstanding the strict non-refundability of voluntary fan payments, AskMe may, after internal verification with its RBI-authorized Payment Aggregator / Payment Service Provider, process a reversal solely where:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1.5">
              <strong className="text-white block font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E676]"></span>
                Duplicate Debit:
              </strong>
              <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
                Due to a verifiable technical glitch at the banking or payment gateway level, the Viewer&apos;s payment instrument (UPI, card, netbanking, or wallet) was debited more than once for the exact same single submission, and the duplicate amount was actually settled into AskMe&apos;s merchant account; or
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1.5">
              <strong className="text-white block font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E676]"></span>
                Failed Checkout Debit:
              </strong>
              <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
                Funds were debited from the Viewer&apos;s account during a failed transaction where no queue submission was generated, and the banking network failed to automatically reverse the amount within standard RBI turn-around timelines.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F0F18] border border-[#EB1000]/30 text-xs sm:text-sm text-[#D0D0E0] space-y-2">
            <strong className="text-white block font-bold">Reporting Procedure:</strong>
            <p className="text-[#A0A0B2] leading-relaxed">
              To report a duplicate debit, the Viewer must email{' '}
              <a href="mailto:support@ask-me.live" className="text-[#EB1000] font-bold underline hover:text-white transition">
                support@ask-me.live
              </a>{' '}
              within <strong className="text-white">48 hours</strong> of the transaction along with the UTR / Transaction Reference ID and payment confirmation screenshot.
            </p>
            <p className="text-xs text-[#8E8E9F] pt-1">
              Verified duplicate-charge reversals are processed back to the original source payment method within <strong className="text-white">5 to 7 business days</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'chargebacks-and-disputes',
      num: '6',
      title: 'Chargebacks and Payment Disputes',
      icon: AlertTriangle,
      content: (
        <div className="space-y-3">
          <p>
            Because all Viewer payments are voluntary and non-refundable upon submission, raising a chargeback, UPI dispute, or payment reversal request with a bank or card issuer on the grounds that a Creator did not answer a question constitutes a material breach of our Terms and Conditions.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
            AskMe and FuturePast Ventures LLP reserve the right to contest unwarranted disputes using checkout consent logs, IP addresses, and queue delivery timestamps, and to permanently suspend any Viewer account that initiates bad-faith payment disputes.
          </div>
        </div>
      )
    },
    {
      id: 'grievance-and-contact',
      num: '7',
      title: 'Grievance Redressal & Contact Information',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p>
            For any billing inquiries or grievances relating to this Policy, please contact:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
              <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Customer Support</span>
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
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Policy Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            CANCELLATION AND REFUND POLICY
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
                className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#EB1000]/40 transition-all shadow-lg scroll-mt-28"
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
