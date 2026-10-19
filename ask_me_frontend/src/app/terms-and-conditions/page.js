'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  FileText,
  Building2,
  ShieldCheck,
  UserCheck,
  Layers,
  AlertTriangle,
  HeartHandshake,
  Lock,
  AlertCircle,
  ShieldAlert,
  Scale,
  Mail,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export default function TermsAndConditionsPage() {
  const sections = [
    {
      id: 'acceptance',
      num: '1',
      title: 'Acceptance of Terms',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p>
            Welcome to AskMe (<span className="text-white font-medium">ask-me.live</span>), a digital creator discovery and real-time paid Q&A queuing platform operated by FuturePast Ventures LLP (&quot;Company&quot;, &quot;AskMe&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </p>
          <p>
            By accessing, browsing, registering on, or making a payment through AskMe as a Viewer/Fan (&quot;Viewer&quot;) or as a Content Creator (&quot;Creator&quot;), you agree to be legally bound by these Terms and Conditions (&quot;Terms&quot;), along with our Cancellation and Refund Policy, Payment Policy, Privacy Policy, Creator Terms, GST and Tax Policy, and Community Guidelines.
          </p>
         
        </div>
      )
    },
    {
      id: 'eligibility',
      num: '2',
      title: 'Eligibility',
      icon: UserCheck,
      content: (
        <div className="space-y-3">
          <p>
            To use AskMe or make a financial transaction on the platform, you must be at least 18 years of age and competent to enter into a legally binding contract under the Indian Contract Act, 1872.
          </p>
          <p>
            If you are accessing AskMe on behalf of a business entity or organization, you represent and warrant that you have the requisite legal authority to bind that entity to these Terms.
          </p>
        </div>
      )
    },
    {
      id: 'platform-services',
      num: '3',
      title: "Nature of AskMe's Platform Services",
      icon: Layers,
      content: (
        <div className="space-y-4">
          <p>
            AskMe operates strictly as a <strong className="text-white">technology intermediary under Section 79 of the Information Technology Act, 2000</strong>.
          </p>
          <p>
            We provide digital software tools—including shareable Creator links, broadcast QR codes, a live Studio Queue dashboard, and discovery listings—that allow Viewers to submit voluntary paid questions and messages to Creators during livestreams across third-party platforms (such as YouTube, Instagram, Twitch, Kick, LinkedIn, etc.).
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#EB1000] shrink-0 mt-0.5" />
            <p>
              AskMe does not host the underlying video livestreams and does not employ, control, endorse, or direct any Creator.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'paid-questions',
      num: '4',
      title: 'Paid Questions, Voluntary Fan Support, and Strict Non-Refundability',
      icon: HeartHandshake,
      content: (
        <div className="space-y-5">
          {/* 4.1 */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">4.1</span>
              <span>Voluntary Fan Contributions</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              All payments made by Viewers on AskMe are voluntary payments and fan support contributions willingly paid by the Viewer to financially support the selected Creator and to highlight a question or message within the Creator&apos;s AskMe Studio Queue.
            </p>
          </div>

          {/* 4.2 */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">4.2</span>
              <span>Queue Visibility Only (Same as YouTube Super Chat Model)</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              Operating on the same principles as standard livestream paid-chat and tipping features (such as YouTube Super Chats), a payment on AskMe purchases digital queue placement and studio visibility tools only. It does not create a contract for a guaranteed answer, consultation, professional service, or mandatory response from the Creator.
            </p>
          </div>

          {/* 4.3 */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">4.3</span>
              <span>Creator&apos;s Sole Will & Complete Limitation of Liability</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              Whether, when, and how a submitted question is noticed, read, broadcasted, or answered rests entirely on the Creator&apos;s own will and sole editorial discretion. Creators may choose to answer publicly, answer briefly, skip, reject, dismiss, or not respond to any submission for any reason whatsoever—including broadcast time constraints, stream pacing, topic relevance, or personal preference. AskMe (<span className="text-white">ask-me.live</span>) and FuturePast Ventures LLP are not responsible or liable in any manner whatsoever for a Creator&apos;s failure, refusal, or inability to respond to any particular question.
            </p>
          </div>

          {/* 4.4 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">4.4</span>
              <span>Strictly Final and Non-Refundable</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              Once a payment is completed and the Viewer&apos;s submission enters the Creator&apos;s Studio Queue, the transaction is final, non-cancellable, and strictly non-refundable, regardless of whether the question is answered, skipped, rejected, or left unaddressed when the livestream ends.
            </p>
            <p className="pt-1">
              All payments are governed strictly by our{' '}
              <Link href="/refund-policy" className="text-[#EB1000] underline font-bold hover:text-white transition">
                Cancellation and Refund Policy
              </Link>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'user-conduct',
      num: '5',
      title: 'User Conduct and Manual Moderation',
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            Viewers and Creators must comply with our{' '}
            <Link href="/community-guidelines" className="text-[#EB1000] underline font-semibold hover:text-white transition">
              Community Guidelines
            </Link>{' '}
            at all times.
          </p>
          <p>
            Creators are provided with manual Studio Queue moderation controls and minimum price gates to manage incoming submissions.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0]">
            If a Viewer submits a question that violates our Community Guidelines or is manually skipped or rejected by the Creator at their own discretion, the submission will be dismissed without any refund of the voluntary payment.
          </div>
        </div>
      )
    },
    {
      id: 'intellectual-property',
      num: '6',
      title: 'Intellectual Property Rights',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">6.1</span>
              <span>Platform IP</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              All software, source code, UI/UX designs, logos, trademarks, and branding associated with AskMe (<span className="text-white font-medium">ask-me.live</span>) are the exclusive intellectual property of FuturePast Ventures LLP.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">6.2</span>
              <span>User Submissions</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              By submitting a question or message on AskMe, the Viewer grants AskMe and the target Creator a worldwide, non-exclusive, royalty-free, perpetual license to display, read aloud, broadcast, record, and reproduce the submitted text and display name during livestreams and in subsequent video-on-demand (VOD) clips or promotional materials.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'disclaimer',
      num: '7',
      title: 'Disclaimer of Warranties & No Professional Advice',
      icon: AlertCircle,
      content: (
        <div className="space-y-3">
          <p>
            AskMe is provided on an <strong className="text-white">&quot;AS IS&quot;</strong> and <strong className="text-white">&quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, whether express or implied.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] space-y-2">
            <p>
              Opinions, advice, or statements expressed by Creators during their broadcasts (including on finance, trading, career, health, legal, or general topics) are solely the personal views of the independent Creator.
            </p>
            <p className="text-[#8E8E9F]">
              Neither AskMe nor FuturePast Ventures LLP verifies, endorses, or guarantees any Creator response, nor shall we be liable for any reliance placed by a Viewer on a Creator&apos;s statements.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'liability',
      num: '8',
      title: 'Limitation of Liability & Indemnity',
      icon: ShieldAlert,
      content: (
        <div className="space-y-3">
          <p>
            To the maximum extent permitted under applicable Indian law, neither FuturePast Ventures LLP nor its designated partners, officers, or employees shall be liable for any indirect, incidental, consequential, or punitive damages, or for any loss of profits, data, or goodwill arising out of your use of AskMe or any unanswered submission.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0]">
            In no event shall FuturePast Ventures LLP&apos;s aggregate liability to any Viewer exceed the amount of the specific transaction in dispute (strictly limited to verifiable duplicate gateway debits under the Refund Policy).
          </div>
          <p>
            You agree to indemnify, defend, and hold harmless FuturePast Ventures LLP from any claims, losses, damages, liabilities, or legal fees arising from your breach of these Terms or violation of applicable law.
          </p>
        </div>
      )
    },
    {
      id: 'governing-law',
      num: '9',
      title: 'Governing Law and Dispute Resolution',
      icon: Scale,
      content: (
        <div className="space-y-3">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0]">
            Any disputes, claims, or proceedings arising out of or relating to AskMe or these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong className="text-white">Pune, Maharashtra, India</strong>.
          </div>
        </div>
      )
    },
    {
      id: 'grievance',
      num: '10',
      title: 'Grievance Redressal & Contact Information',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p>
            If you have any questions, concerns, feedback, or grievances regarding these Terms or the AskMe platform, you may reach out to our team:
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
            <FileText className="w-3.5 h-3.5" />
            <span>Platform Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            TERMS AND CONDITIONS
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

        {/* QUICK JUMP NAVIGATION PILLS */}
        <section className="bg-[#0F0F18] border border-[#1E1E2E] rounded-2xl p-4 sm:p-5">
          <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block mb-3">
            Quick Navigation
          </span>
          <div className="flex flex-wrap gap-2">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-3 py-1.5 rounded-xl bg-[#141422] hover:bg-[#EB1000]/15 border border-[#222234] hover:border-[#EB1000]/40 text-xs font-semibold text-[#A0A0B2] hover:text-white transition"
              >
                {sec.num}. {sec.title}
              </a>
            ))}
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
