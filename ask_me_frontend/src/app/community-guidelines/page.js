'use client';

import React from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Users,
  ShieldCheck,
  Building2,
  AlertTriangle,
  ShieldAlert,
  Sliders,
  Tv,
  Scale,
  Mail,
  FileText,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function CommunityGuidelinesPage() {
  const sections = [
    {
      id: 'purpose',
      num: '1',
      title: 'Purpose of These Guidelines',
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            AskMe (<span className="text-white font-medium">ask-me.live</span>), operated by FuturePast Ventures LLP, is built to foster respectful, high-signal real-time connections between Creators and their Viewers/Fans across live streaming ecosystems.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
            These Community Guidelines (&quot;Guidelines&quot;) apply to all questions, messages, Creator profiles, broadcast overlays, and interactions on AskMe, and must be read together with our{' '}
            <Link href="/terms-and-conditions" className="text-[#EB1000] underline hover:text-white transition">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link href="/refund-policy" className="text-[#EB1000] underline hover:text-white transition">
              Cancellation and Refund Policy
            </Link>.
          </div>
        </div>
      )
    },
    {
      id: 'prohibited-content',
      num: '2',
      title: 'Prohibited Content & Submissions (Zero-Tolerance Rules)',
      icon: ShieldAlert,
      content: (
        <div className="space-y-4">
          <p>
            Neither Viewers nor Creators may use AskMe to submit, broadcast, solicit, or promote any content that violates applicable Indian law (including Rule 3(1)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021) or falls into the following categories:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {[
              {
                title: 'Harassment, Bullying, and Abuse',
                desc: 'Personal attacks, stalking, intimidation, rape threats, death threats, or targeted harassment directed at a Creator, another Viewer, or any third party.'
              },
              {
                title: 'Hate Speech and Discrimination',
                desc: 'Content that promotes enmity, hatred, or discrimination based on religion, caste, race, ethnicity, gender, sexual orientation, disability, or national origin.'
              },
              {
                title: 'Defamation and Doxxing',
                desc: 'Publishing or asking questions containing another person\'s private personal information (home address, personal phone number, financial details, government IDs) without consent, or making knowingly false and defamatory statements.'
              },
              {
                title: 'Obscenity, Nudity, and Sexual Solicitation',
                desc: 'Sexually explicit messages, pornography, non-consensual sexual content, or solicitation of sexual services.'
              },
              {
                title: 'Child Harm (CSAE/CSAM)',
                desc: 'Any content that exploits, abuses, sexualizes, or endangers minors in any manner. Violations are reported immediately to law enforcement authorities.'
              },
              {
                title: 'Illegal Acts, Fraud, and Gambling',
                desc: 'Promoting illegal betting/gambling apps, money laundering, pyramid/Ponzi schemes, financial scams, piracy, narcotics, weapons, or violence.'
              },
              {
                title: 'Threats to Sovereignty & Public Order',
                desc: 'Content that threatens the unity, integrity, defense, security, or sovereignty of India, or incites any cognizable offense.'
              },
              {
                title: 'Spam, Impersonation, and Malicious Links',
                desc: 'Impersonating another Creator or fan, injecting phishing links/malware into question submissions, or attempting to manipulate platform queues.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#EB1000] shrink-0" />
                  <span className="font-bold text-white text-xs sm:text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-[#A0A0B2] leading-relaxed pl-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'studio-moderation',
      num: '3',
      title: 'Studio Moderation, Creator Discretion, and Forfeiture of Payment (No Refunds)',
      icon: Sliders,
      content: (
        <div className="space-y-4">
          {/* 3.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.1</span>
              <span>Manual Studio Queue Controls</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              AskMe provides Creators with direct manual Studio Queue management controls and minimum price gates so Creators can review incoming submissions and maintain a safe, well-paced broadcast environment.
            </p>
          </div>

          {/* 3.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">3.2</span>
              <span>Creator&apos;s Absolute Right to Skip or Reject</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              Whether a question violates Section 2 or not, a Creator retains 100% editorial freedom and sole discretion to skip, ignore, dismiss, or reject any question from their Studio Queue for any reason at their own will.
            </p>
          </div>

          {/* 3.3 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">3.3</span>
              <span>Strict Non-Refundability of Rejected or Unanswered Questions</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              As set forth in our{' '}
              <Link href="/refund-policy" className="text-[#EB1000] underline font-bold hover:text-white transition">
                Cancellation and Refund Policy
              </Link>, all Viewer payments on AskMe are voluntary, non-refundable fan support contributions (similar to YouTube Super Chats). If a Viewer&apos;s paid question is rejected, skipped, or left unanswered by the Creator at their own discretion, or removed for violating these Guidelines, the payment is strictly final and forfeited, and is NOT eligible for any refund, credit, or chargeback.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'creator-standards',
      num: '4',
      title: 'Creator Standards & On-Air Responsibilities',
      icon: Tv,
      content: (
        <div className="space-y-3">
          <p>Creators using AskMe agree to:</p>
          <div className="space-y-2 text-xs sm:text-sm">
            {[
              'Not use their AskMe profile or Q&A sessions to solicit unlawful acts, defraud viewers, or run deceptive lotteries/giveaways;',
              'Not make false representations on-air promising Viewers that AskMe will refund unanswered, skipped, or rejected questions; and',
              'Comply with the terms of service of the underlying streaming platform (YouTube, Instagram, Twitch, Kick, LinkedIn, etc.) on which they broadcast their AskMe QR code or link.'
            ].map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141422] border border-[#222234] text-[#D0D0E0]">
                <div className="w-2 h-2 rounded-full bg-[#EB1000] shrink-0 mt-1.5"></div>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'intermediary-safe-harbor',
      num: '5',
      title: 'Intermediary Safe-Harbor & No Professional Advice Disclaimer',
      icon: Scale,
      content: (
        <div className="space-y-4">
          {/* 5.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">5.1</span>
              <span>Intermediary Status</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              AskMe (<span className="text-white font-medium">ask-me.live</span>) and FuturePast Ventures LLP operate strictly as a neutral technology intermediary under Section 79 of the Information Technology Act, 2000. AskMe does not pre-screen, edit, author, or endorse the questions submitted by Viewers or the verbal/written responses provided by Creators.
            </p>
          </div>

          {/* 5.2 */}
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">5.2</span>
              <span>No Professional Advice</span>
            </h3>
            <p className="text-[#A0A0B2] leading-relaxed">
              Responses given by Creators during livestreams or via AskMe—including topics relating to finance, stock markets, cryptocurrency, career, legal matters, physical/mental health, or astrology—represent the personal opinions of the independent Creator for informational and entertainment purposes only. Neither AskMe nor FuturePast Ventures LLP is responsible or liable for the accuracy, legality, or consequences of any Creator&apos;s response, or for a Creator&apos;s decision not to respond at all.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'enforcement-and-penalties',
      num: '6',
      title: 'Enforcement & Account Penalties',
      icon: AlertCircle,
      content: (
        <div className="space-y-3">
          <p>
            Violations of these Community Guidelines may result in immediate enforcement actions by FuturePast Ventures LLP without prior notice, including:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            {[
              'Immediate deletion or dismissal of the offending submission without refund;',
              'Temporary or permanent banning of the Viewer\'s account, IP address, or payment instrument from using AskMe;',
              'Suspension or termination of a Creator\'s account and withholding of payouts linked to fraudulent or unlawful activity; and',
              'Reporting unlawful conduct to competent cybercrime and law enforcement authorities.'
            ].map((action, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141422] border border-[#222234] text-[#D0D0E0]">
                <div className="w-2 h-2 rounded-full bg-[#EB1000] shrink-0 mt-1.5"></div>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'reporting-and-grievance',
      num: '7',
      title: 'Reporting Violations & Grievance Redressal',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p>
            To report a violation of these Community Guidelines or file a formal content grievance under the IT Rules, 2021, please contact us with the relevant Creator handle, screenshot/URL, and description of the issue:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
              <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Trust & Safety Support</span>
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
            <Users className="w-3.5 h-3.5" />
            <span>Safety & Community Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            COMMUNITY GUIDELINES
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
