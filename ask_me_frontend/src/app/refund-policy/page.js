'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  RefreshCw,
  FileText,
  HeartHandshake,
  HelpCircle,
  XCircle,
  AlertCircle,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function RefundPolicyPage() {
  const sections = [
    {
      id: 'purpose',
      num: '1',
      title: 'Purpose of This Policy',
      icon: FileText,
      content: (
        <div className="space-y-3">
          <p>
            This Cancellation and Refund Policy explains the circumstances in which a payment made through AskMe may or may not be cancelled, refunded, reversed or otherwise adjusted.
          </p>
          <p>
            AskMe provides a technology platform through which Viewers can discover Creators and voluntarily interact with them by submitting questions or messages that may involve a payment.
          </p>
          <p>
            Because AskMe payments are associated with Creator interaction, appreciation and support, they operate differently from an ordinary purchase of a physical product or a conventional guaranteed service.
          </p>
          <p className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#8E8E9F] leading-relaxed">
            📖 This Policy should therefore be read together with the AskMe Terms and Conditions, Privacy Policy, Creator Terms, Payment Policy and other applicable policies.
          </p>
        </div>
      )
    },
    {
      id: 'nature-of-payment',
      num: '2',
      title: 'Nature of an AskMe Payment',
      icon: HeartHandshake,
      content: (
        <div className="space-y-3">
          <p>
            An AskMe payment is a voluntary payment made by a Viewer to interact with, appreciate or support a Creator through the AskMe platform.
          </p>
          <p>
            The Viewer voluntarily chooses whether to make a payment and, where applicable, selects the amount offered through the available payment options.
          </p>
          <p>
            A payment may be accompanied by a question or message intended for the Creator.
          </p>
          <p>
            The payment does not constitute the purchase of a physical product, merchandise, subscription, guaranteed consultation, guaranteed appointment, guaranteed appearance, guaranteed publication or any other guaranteed outcome from the Creator.
          </p>

          <div className="p-4 rounded-2xl bg-[#141422] border border-[#EB1000]/30 text-xs sm:text-sm text-[#D0D0E0] space-y-2 mt-2">
            <strong className="text-white block font-bold">Most importantly:</strong>
            <p>
              A payment does not guarantee a response from the Creator.
            </p>
            <p className="text-[#A0A0B2]">
              The Creator may decide whether to respond, when to respond, how to respond and whether to respond publicly or privately, subject to applicable AskMe policies and law.
            </p>
            <p className="text-xs text-[#8E8E9F] pt-1">
              The Viewer therefore understands and accepts that making a payment does not create an unconditional contractual obligation on the Creator to provide a particular response or outcome.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'appreciation-support',
      num: '3',
      title: 'Voluntary Appreciation and Support',
      icon: HelpCircle,
      content: (
        <div className="space-y-3">
          <p>
            AskMe enables Viewers to use its payment functionality as a voluntary means of showing appreciation or support to a Creator while submitting a question or message.
          </p>
          <p>
            A Viewer may choose to make such a payment because they wish to participate in a Creator interaction, express appreciation for the Creator&apos;s work, support the Creator or increase the opportunity for their question or message to receive attention.
          </p>
          <p className="font-semibold text-white">
            The decision to make the payment belongs entirely to the Viewer.
          </p>
          <p>
            AskMe does not require a Viewer to make a payment merely to watch a Creator&apos;s underlying livestream or publicly available content unless a separate paid feature is expressly identified.
          </p>
          <p className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#00E676] font-medium leading-relaxed">
            💡 A Viewer should therefore make a payment only when the Viewer voluntarily wishes to do so.
          </p>
        </div>
      )
    },
    {
      id: 'no-guaranteed-response',
      num: '4',
      title: 'No Guaranteed Creator Response',
      icon: AlertCircle,
      content: (
        <div className="space-y-3">
          <p>The submission of a paid question does not guarantee that the Creator will:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm">
            {[
              'Read the question',
              'Notice the question',
              'Answer the question',
              'Answer the question immediately',
              'Answer the question within a particular period',
              'Answer the question publicly',
              "Mention the Viewer's name",
              'Agree with the Viewer',
              'Provide the information expected by the Viewer',
              'Provide a detailed response',
              'Take an action requested by the Viewer',
              'Continue the interaction beyond the submitted question'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141422] border border-[#222234] text-[#D0D0E0]">
                <XCircle className="w-4 h-4 text-[#EB1000] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <p className="pt-2">
            The Creator may answer publicly, answer privately, reject the question, skip the question or choose not to respond.
          </p>
          <p>
            The Creator may also be unavailable because of circumstances including the end of a livestream, technical problems, personal circumstances, third party platform issues or other reasons.
          </p>
          <p className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#8E8E9F] font-medium">
            Accordingly, the circumstances listed above do not by themselves create a right to a refund.
          </p>
        </div>
      )
    },
    {
      id: 'no-refund-circumstances',
      num: '5',
      title: 'Circumstances That Generally Do Not Qualify for a Refund',
      icon: XCircle,
      content: (
        <div className="space-y-3">
          <p>A refund will generally not be provided merely because:</p>
          <div className="space-y-2.5 text-xs sm:text-sm">
            {[
              'The Viewer changed their mind after making the payment',
              'The Viewer no longer wants the question answered',
              'The Viewer expected a different answer',
              'The Viewer disagrees with the Creator',
              "The Viewer dislikes the Creator's opinion"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#141422] border border-[#222234] text-[#D0D0E0]">
                <div className="w-2 h-2 rounded-full bg-[#EB1000] shrink-0"></div>
                <span>{item}</span>
              </div>
            ))}
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
