'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  ShieldCheck,
  Lock,
  FileText,
  CreditCard,
  Globe,
  Clock,
  Database,
  Server,
  UserCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'info-collect',
      num: '1',
      title: 'Information We Collect',
      icon: Database,
      content: (
        <div className="space-y-3">
          <p>
            AskMe may collect information that users voluntarily provide, including name, email address, mobile number, profile photograph, profile information, Creator category, account information, communication preferences and support communications.
          </p>
          <p>
            Creators may be required to provide additional information for identity verification, KYC, payment processing and regulatory compliance.
          </p>
          <p className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#8E8E9F] leading-relaxed">
            📌 This may include government identity information, PAN or equivalent tax information, address information, bank details, business information and other information required by AskMe, its KYC provider, Payment Service Provider or applicable law.
          </p>
        </div>
      )
    },
    {
      id: 'kyc-data',
      num: '2',
      title: 'Strict Creator KYC Data',
      icon: UserCheck,
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-white">
            Creator KYC information is treated as sensitive operational and compliance information.
          </p>
          <p>
            AskMe may collect and process KYC information to verify identity, prevent fraud, comply with payment and financial requirements, enable eligible withdrawals, investigate suspicious activity and comply with applicable law.
          </p>
          <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-[#A0A0B2] pt-1">
            <li>Creators must provide authentic information and valid documents.</li>
            <li>AskMe may reject or suspend a Creator where KYC information cannot be verified.</li>
            <li>AskMe may require re-verification at any time where reasonably necessary.</li>
          </ul>
          <p className="text-xs text-[#8E8E9F] bg-[#141422] p-4 rounded-2xl border border-[#222234]">
            🔒 KYC information may be shared with authorised KYC providers, Payment Service Providers, banks, financial institutions, professional advisers, regulators or governmental authorities where necessary and legally permitted or required.
          </p>
        </div>
      )
    },
    {
      id: 'payment-info',
      num: '3',
      title: 'Payment Information',
      icon: CreditCard,
      content: (
        <div className="space-y-3">
          <p>
            AskMe may process transaction identifiers, payment status, amount, currency, timestamps, refunds, reversals, chargebacks and payment provider references.
          </p>
          <p className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#00E676] font-medium leading-relaxed">
            💳 <strong>Security Note:</strong> Raw card numbers, CVV, PINs and similar payment credentials are generally handled by the relevant Payment Service Provider rather than stored by AskMe.
          </p>
        </div>
      )
    },
    {
      id: 'device-info',
      num: '4',
      title: 'Device and Technical Information',
      icon: Server,
      content: (
        <div className="space-y-3">
          <p>
            AskMe may collect IP address, device information, browser information, operating system, application information, log information, authentication events, security information and usage information.
          </p>
          <p>
            This information may be used for security, fraud prevention, troubleshooting, analytics and service operation.
          </p>
        </div>
      )
    },
    {
      id: 'how-we-use',
      num: '5',
      title: 'How We Use Information',
      icon: Lock,
      content: (
        <div className="space-y-3">
          <p>Information may be used to:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm">
            {[
              'Operate accounts',
              'Provide Creator discovery',
              'Facilitate questions and interactions',
              'Process payments',
              'Enable Creator earnings and withdrawals',
              'Perform KYC',
              'Prevent fraud and financial crime',
              'Maintain platform security',
              'Provide notifications',
              'Respond to support requests',
              'Investigate complaints and disputes',
              'Improve AskMe',
              'Comply with applicable law and lawful government requests'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141422] border border-[#222234] text-[#D0D0E0]">
                <CheckCircle2 className="w-4 h-4 text-[#EB1000] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'sharing-info',
      num: '6',
      title: 'Sharing Information',
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            AskMe may share relevant information with service providers including cloud infrastructure providers, KYC providers, Payment Service Providers, communications providers, security providers, analytics providers and professional advisers.
          </p>
          <p>
            Information may also be disclosed where legally required or reasonably necessary for fraud prevention, security, legal proceedings, regulatory compliance or protection of users and the platform.
          </p>
        </div>
      )
    },
    {
      id: 'international-processing',
      num: '7',
      title: 'International Processing',
      icon: Globe,
      content: (
        <div className="space-y-3">
          <p>
            Some service providers may process information outside India.
          </p>
          <p>
            Where information is transferred or processed internationally, AskMe will apply safeguards and requirements applicable under relevant law and contractual arrangements.
          </p>
        </div>
      )
    },
    {
      id: 'retention',
      num: '8',
      title: 'Retention',
      icon: Clock,
      content: (
        <div className="space-y-3">
          <p>
            AskMe may retain information for as long as reasonably necessary for account operation, transactions, KYC, tax, accounting, dispute resolution, fraud prevention, legal proceedings and compliance requirements.
          </p>
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
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Legal Notice</span>
          </div> */}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white">
            PRIVACY POLICY
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#8E8E9F] font-medium pt-2">
            <span>Effective Date: <strong>25 September 2026</strong></span>
            <span>•</span>
            <span>Last Updated: <strong>25 September 2026</strong></span>
          </div>
        </section>

        {/* INTRO & DPDP FRAMEWORK NOTICE */}
        <section className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <p className="text-sm sm:text-base text-[#D0D0E0] leading-relaxed">
            This Privacy Policy explains how <strong className="text-white">FuturePast Ventures LLP</strong>, operating <strong className="text-white">AskMe</strong>, collects, uses, processes, stores and protects information associated with users and Creators.
          </p>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#A0A0B2] leading-relaxed flex items-start gap-3">
            <div>
              AskMe&apos;s privacy practices are intended to operate consistently with applicable Indian data protection and technology laws, including applicable requirements under the Digital Personal Data Protection framework. The Digital Personal Data Protection Rules, 2025 were notified by MeitY on 14 November 2025 and provide for phased commencement of different provisions.
            </div>
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
