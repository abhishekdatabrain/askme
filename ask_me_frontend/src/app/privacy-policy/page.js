'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Building2,
  ShieldCheck,
  Lock,
  FileText,
  Database,
  CheckCircle2,
  Share2,
  Clock,
  UserCheck,
  Cookie,
  ShieldAlert,
  Mail,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'introduction-and-scope',
      num: '1',
      title: 'Introduction and Scope',
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            This Privacy Policy (&quot;Policy&quot;) explains how FuturePast Ventures LLP (&quot;Company&quot;, &quot;AskMe&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operating the platform AskMe (<span className="text-white font-medium">ask-me.live</span>), collects, uses, processes, stores, and protects personal data belonging to Creators, Viewers/Fans, and website visitors (&quot;you&quot; or &quot;Users&quot;).
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
            This Policy is drafted in accordance with the <strong className="text-white">Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;)</strong> and applicable rules thereunder, the <strong className="text-white">Information Technology Act, 2000</strong>, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. By accessing or using AskMe, you consent to the data practices described in this Policy.
          </div>
        </div>
      )
    },
    {
      id: 'categories-of-data',
      num: '2',
      title: 'Categories of Personal Data We Collect',
      icon: Database,
      content: (
        <div className="space-y-4">
          {/* 2.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.1</span>
              <span>Viewer / Fan Data</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              When you submit a voluntary paid question or interact with a Creator&apos;s link/QR code, we collect your display name or handle, email address, mobile phone number, the text/content of your submitted question, submission timestamps, queue status logs (In-Queue, Broadcasted, Answered, or Rejected/Skipped), IP address, browser/device metadata, and payment reference identifiers (such as UTR or transaction IDs).
            </p>
          </div>

          {/* 2.2 */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#141422] border border-[#222234]">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.2</span>
              <span>Creator Data</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
              When you register as a Creator, we collect your full legal name, display name, email address, phone number, profile photograph, connected third-party social/streaming profile URLs (e.g., YouTube, Instagram, Twitch, Kick, LinkedIn), biography, pricing settings, and manual studio queue action logs.
            </p>
          </div>

          {/* 2.3 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">2.3</span>
              <span>Creator KYC, Banking, and Tax Data</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              To process Creator payouts and comply with Indian tax laws, we collect your Permanent Account Number (PAN), bank account number, IFSC code, verified UPI ID, residential/business address, and Goods and Services Tax Identification Number (GSTIN), where applicable.
            </p>
          </div>

          {/* 2.4 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#EB1000]" />
              <span className="text-[#EB1000] font-black">2.4</span>
              <span>Payment Processing Data</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              All Viewer payments are processed in Indian Rupees (INR) through RBI-authorized third-party Payment Aggregators and Payment Service Providers supporting UPI, debit/credit cards, netbanking, and digital wallets. AskMe does not store raw credit/debit card numbers, CVV codes, netbanking passwords, or UPI PINs on its servers.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'purpose-and-lawful-basis',
      num: '3',
      title: 'Purpose and Lawful Basis of Processing',
      icon: CheckCircle2,
      content: (
        <div className="space-y-3">
          <p>We process your personal data strictly for the following lawful purposes:</p>
          <div className="space-y-2.5 text-xs sm:text-sm">
            {[
              {
                title: 'Queue Delivery & Real-Time Status Tracking:',
                desc: 'To transmit a Viewer\'s paid question into the Creator\'s live Studio Queue and send real-time transactional status updates (In-Queue, Broadcasted, Answered) and creator live alerts.'
              },
              {
                title: 'Payment Settlement & Creator Payouts:',
                desc: 'To verify Viewer transactions, calculate AskMe\'s 15% Platform Service Fee (plus 18% GST thereon and ~2% gateway charges), and remit the net 80.3% base payout to verified Creators.'
              },
              {
                title: 'Statutory Tax & Regulatory Compliance:',
                desc: 'To verify Creator identity (KYC), deduct/collect statutory taxes (TDS/TCS), issue tax statements/invoices, and file mandatory returns with the Income Tax Department and GST authorities.'
              },
              {
                title: 'Trust, Safety, Fraud Prevention, and Chargeback Defense:',
                desc: 'To enforce our Community Guidelines, enable Creator manual queue management, detect payment fraud, and furnish checkout consent logs, IP addresses, and queue-delivery timestamps to RBI-authorized Payment Aggregators and issuing banks to contest unwarranted chargebacks or UPI disputes.'
              }
            ].map((purpose, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
                <span className="font-bold text-white block">{purpose.title}</span>
                <span className="text-[#A0A0B2] leading-relaxed block">{purpose.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'data-sharing-and-disclosures',
      num: '4',
      title: 'Data Sharing and Disclosures',
      icon: Share2,
      content: (
        <div className="space-y-3">
          <p>
            We do not sell your personal data to third-party advertisers. We share data strictly on a need-to-know basis with:
          </p>
          <div className="space-y-2.5 text-xs sm:text-sm">
            {[
              {
                title: 'The Selected Creator:',
                desc: 'When a Viewer submits a question, the Viewer\'s chosen display name and question text are shared with the target Creator in their Studio Queue and may be displayed publicly on the Creator\'s broadcast overlay.'
              },
              {
                title: 'RBI-Authorized Payment Aggregators & Banks:',
                desc: 'To process INR checkouts, verify UTR/settlement status, execute Creator bank payouts, and resolve billing or chargeback disputes.'
              },
              {
                title: 'Cloud Infrastructure & Communication Providers:',
                desc: 'Trusted hosting, database, analytics, and transactional email/SMS/notification vendors bound by strict confidentiality obligations.'
              },
              {
                title: 'Government, Tax, and Law Enforcement Authorities:',
                desc: 'Where required under Indian law, including disclosures to tax authorities (Income Tax / GST) or certified responses to lawful orders under Section 91 of the CrPC / BNSS or the IT Act, 2000.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
                <span className="font-bold text-white block">{item.title}</span>
                <span className="text-[#A0A0B2] leading-relaxed block">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'data-retention-and-archival',
      num: '5',
      title: 'Data Retention and Statutory Archival',
      icon: Clock,
      content: (
        <div className="space-y-4">
          {/* 5.1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">5.1</span>
              <span>General User Data</span>
            </h3>
            <p className="text-sm text-[#A0A0B2] leading-relaxed">
              We retain Viewer and Creator profile data for as long as your account remains active or as necessary to provide our services.
            </p>
          </div>

          {/* 5.2 */}
          <div className="p-4 rounded-2xl bg-[#180A0C] border border-[#EB1000]/40 text-xs sm:text-sm text-[#D0D0E0] space-y-1.5">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="text-[#EB1000] font-black">5.2</span>
              <span>Mandatory Retention of Financial & Tax Records</span>
            </h3>
            <p className="text-[#D0D0E0] leading-relaxed">
              Notwithstanding any request for account deletion or data erasure, transaction histories, payout ledgers, KYC credentials (PAN/GSTIN), and tax invoices are retained for a minimum period of eight (8) financial years (or longer if subject to an active audit or legal dispute) to comply with the Indian Income-tax Act, 1961, the Central Goods and Services Tax Act, 2017, and RBI guidelines.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'user-rights-dpdp',
      num: '6',
      title: 'Your Rights Under the DPDP Act, 2023',
      icon: UserCheck,
      content: (
        <div className="space-y-3">
          <p>
            Subject to statutory exceptions and mandatory tax/financial retention laws, you have the right to:
          </p>
          <div className="space-y-2 text-xs sm:text-sm">
            {[
              'Request a summary of the personal data we process about you;',
              'Request correction, completion, or updating of inaccurate personal data;',
              'Withdraw consent for non-essential communications or request deletion of your account (subject to Section 5.2 regarding financial/tax records); and',
              'Nominate an individual to exercise your data rights in the event of death or incapacity, and seek grievance redressal.'
            ].map((right, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141422] border border-[#222234] text-[#D0D0E0]">
                <div className="w-2 h-2 rounded-full bg-[#EB1000] shrink-0 mt-1.5"></div>
                <span>{right}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'cookies-and-tracking',
      num: '7',
      title: 'Cookies and Tracking Technologies',
      icon: Cookie,
      content: (
        <div className="space-y-3">
          <p>
            AskMe uses essential cookies and local storage tokens to maintain user authentication sessions, remember queue states during live broadcasts, secure checkout flows, and measure aggregate site performance.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#A0A0B2] leading-relaxed">
            You may manage cookie preferences through your browser settings, though disabling essential cookies may prevent login or checkout functionality.
          </div>
        </div>
      )
    },
    {
      id: 'childrens-privacy',
      num: '8',
      title: "Children's Privacy",
      icon: ShieldAlert,
      content: (
        <div className="space-y-3">
          <p>
            AskMe is intended for users who are at least 18 years of age and legally competent to contract under the Indian Contract Act, 1872.
          </p>
          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#D0D0E0] leading-relaxed">
            We do not knowingly collect personal data or process payments from individuals under 18 years of age without verifiable parental consent.
          </div>
        </div>
      )
    },
    {
      id: 'data-security',
      num: '9',
      title: 'Data Security Practices',
      icon: Lock,
      content: (
        <div className="space-y-3">
          <p>
            FuturePast Ventures LLP implements industry-standard technical and organizational safeguards—including TLS/HTTPS encryption in transit, encrypted database storage, role-based access controls, and firewall monitoring—to protect your personal data against unauthorized access, alteration, or disclosure.
          </p>
        </div>
      )
    },
    {
      id: 'grievance-officer-and-contact',
      num: '10',
      title: 'Grievance Officer & Contact Details',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p>
            In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, any privacy inquiries, data rights requests, or grievances may be directed to our Designated Grievance Officer:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
              <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">Designated Grievance Officer</span>
              <p className="text-white font-bold text-sm">Grievance Officer – FuturePast Ventures LLP</p>
              <a
                href="mailto:Grievance@ask-me.live"
                className="text-[#EB1000] font-bold text-xs hover:underline transition flex items-center gap-1.5 pt-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Grievance@ask-me.live</span>
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] space-y-1">
              <span className="text-[11px] font-bold text-[#8E8E9F] uppercase tracking-wider block">General Support</span>
              <p className="text-white font-bold text-sm">AskMe Help & Support</p>
              <a
                href="mailto:support@ask-me.live"
                className="text-[#EB1000] font-bold text-xs hover:underline transition flex items-center gap-1.5 pt-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@ask-me.live</span>
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs text-[#A0A0B2] space-y-1.5">
            <p className="font-bold text-white">Registered Office:</p>
            <p>FuturePast Ventures LLP (LLPIN: ACQ-4984), Lake View City, Lohegaon, Pune 411047, Maharashtra, India.</p>
            <p className="pt-1 text-[#00E676] font-medium">
              ⏱ <strong>Response Timeline:</strong> We acknowledge grievances within 24–48 hours and endeavor to resolve them within the timelines prescribed under applicable Indian law.
            </p>
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy & Data Protection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white uppercase">
            PRIVACY POLICY
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
