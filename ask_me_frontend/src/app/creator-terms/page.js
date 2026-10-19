'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Building2,
  FileText,
  Sliders,
  Tv,
  Percent,
  ShieldCheck,
  ShieldAlert,
  Scale,
  Mail,
  AlertTriangle,
  Lock,
  UserCheck
} from 'lucide-react';

export default function CreatorTermsPage() {
  const sections = [
    {
      id: 'scope-and-relationship',
      num: '1',
      title: 'Scope and Relationship of Parties',
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            These Creator Terms (&quot;Creator Terms&quot;) govern your onboarding, profile operation, Studio Queue management, and payout settlements as a Content Creator (&quot;Creator&quot;, &quot;you&quot;, or &quot;your&quot;) on AskMe (<span className="text-white font-medium">ask-me.live</span>), operated by FuturePast Ventures LLP (&quot;Company&quot;, &quot;AskMe&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0]">
            You participate on AskMe strictly as an <strong className="text-white">independent contractor</strong> and not as an employee, partner, agent, or joint venturer of FuturePast Ventures LLP.
          </div>
        </div>
      )
    },
    {
      id: 'onboarding-and-queue-tools',
      num: '2',
      title: 'Creator Onboarding, Pricing, and Studio Queue Tools',
      icon: Sliders,
      content: (
        <div className="space-y-4">
          {/* 2.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.1</span>
              <span>Profile & Price Gates</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              Upon registering as a Creator, you may configure your public AskMe profile, connect your third-party streaming channels, generate your broadcast QR code/link, and set minimum price gates for voluntary paid questions during your live sessions.
            </p>
          </div>

          {/* 2.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.2</span>
              <span>Manual Studio Queue Moderation</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              AskMe provides you with a real-time Studio Queue interface allowing you to manually review incoming paid submissions, broadcast selected questions on-screen, mark submissions as answered, or manually skip/dismiss questions at your discretion. AskMe does not apply automated keyword filtering; queue curation rests under your manual control.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'editorial-freedom',
      num: '3',
      title: 'Editorial Freedom & Non-Refundable Viewer Contributions',
      icon: Tv,
      content: (
        <div className="space-y-4">
          {/* 3.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.1</span>
              <span>Sole Discretion Over Responses</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              You retain 100% editorial independence and sole discretion over which paid questions in your AskMe Studio Queue you choose to read, broadcast, answer, skip, or dismiss at your own will. Neither AskMe (<span className="text-white font-medium">ask-me.live</span>) nor FuturePast Ventures LLP compels you to respond to any specific submission, and neither party assumes any liability to the Viewer if a submission goes unanswered.
            </p>
          </div>

          {/* 3.2 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">3.2</span>
              <span>No False Refund Promises</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              Because all Viewer payments on AskMe are processed as voluntary, non-refundable fan support contributions (similar to YouTube Super Chats), you expressly agree not to represent, state, or promise to Viewers during your livestreams or in written descriptions that AskMe will refund unanswered, skipped, or rejected questions.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'revenue-share-and-payouts',
      num: '4',
      title: 'Creator Revenue Share, Fees, and Payouts',
      icon: Percent,
      content: (
        <div className="space-y-4">
          {/* 4.1 */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">4.1</span>
              <span>80.3% Net Creator Payout</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              For every eligible voluntary payment received from a Viewer, AskMe deducts a 15.0% Platform Service Fee, 18% GST on the Platform Service Fee (2.7% of gross), and standard ~2.0% payment gateway charges, resulting in a net base payout to you of 80.3% of the gross transaction value, subject to applicable statutory withholding taxes (TDS/TCS) as detailed in our{' '}
              <Link href="/gst-tax-policy" className="text-[#EB1000] underline hover:text-white transition">
                GST and Tax Policy
              </Link>.
            </p>
          </div>

          {/* 4.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">4.2</span>
              <span>Mandatory KYC & Tax Compliance</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              To receive payouts, you must submit and maintain a valid, operative Indian PAN, verified Indian bank account details (Account Number and IFSC) or UPI ID in your legal name, and a GSTIN (if you are registered under GST).
            </p>
          </div>

          {/* 4.3 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">4.3</span>
              <span>Prohibition on Self-Funding & Wash Transactions</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              You must not use your own cards, UPI accounts, or collude with third parties to submit artificial or fraudulent payments to your own Creator queue (including for money laundering, credit card cashing, or artificial leaderboard inflation). Any suspected wash transactions will result in immediate account termination and forfeiture/freeze of funds.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'creator-conduct-and-compliance',
      num: '5',
      title: 'Creator Conduct & Third-Party Platform Compliance',
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            You are solely responsible for all verbal and written statements you make during your livestreams. You agree to comply with our{' '}
            <Link href="/community-guidelines" className="text-[#EB1000] underline font-semibold hover:text-white transition">
              Community Guidelines
            </Link>{' '}
            and the terms of service of the underlying streaming platforms (YouTube, Instagram, Twitch, Kick, LinkedIn, etc.) where you display your AskMe link or QR code.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0]">
            You agree to indemnify FuturePast Ventures LLP against any third-party claims, regulatory penalties, or disputes arising out of your broadcast content or advice.
          </div>
        </div>
      )
    },
    {
      id: 'suspension-and-termination',
      num: '6',
      title: 'Account Suspension & Termination',
      icon: ShieldAlert,
      content: (
        <div className="space-y-3">
          <p>
            You may stop using AskMe or close your Creator account at any time.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
            FuturePast Ventures LLP reserves the right to suspend or terminate your Creator account if you violate these Creator Terms, fail KYC verification, engage in fraudulent payment activity, or violate Indian law.
          </div>
        </div>
      )
    },
    {
      id: 'governing-law-and-contact',
      num: '7',
      title: 'Governing Law & Contact',
      icon: Scale,
      content: (
        <div className="space-y-4">
          <p>
            These Creator Terms are governed by the laws of India, with exclusive jurisdiction vested in the competent courts of <strong className="text-white">Pune, Maharashtra, India</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
              <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Creator Support</span>
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
      {/* Navigation Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-extrabold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Creator Partnership Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            CREATOR TERMS
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
