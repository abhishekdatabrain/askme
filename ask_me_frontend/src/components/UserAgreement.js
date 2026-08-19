import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, Lock, ArrowRight, Scale, AlertTriangle, ScrollText } from 'lucide-react';

export default function UserAgreement({ activeSubTab }) {
  return (
    <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 lg:p-8 shadow-2xl space-y-6 mt-2 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 shadow-md">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading font-black text-xl text-white tracking-tight flex items-center gap-2">
              Platform User Agreement & Legal Terms
            </h1>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Master legal compliance agreement governing Creator broadcasting, 85% revenue split, payout rules & KYC guidelines.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-[#0A0A0F] border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" /> Active Policy v2.4
        </div>
      </div>

      {/* Main Document Body */}
      <div className="space-y-5 text-xs leading-relaxed text-[#8B8B96]">
        
        {/* Section 1: Revenue Split */}
        <div className="p-5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2.5 hover:border-[#00F5D4]/30 transition">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Scale className="h-4 w-4 text-[#00F5D4]" />
            <span>1. Revenue Share Split & Dynamic Platform Fee</span>
          </div>
          <p>
            Creators onboarding on the AskMe PRO live streaming platform retain a guaranteed <strong className="text-[#00E676]">85% net revenue share</strong> on all viewer donations, askMail messages, and paid live stream Q&A interactions.
          </p>
          <p>
            The platform automatically deducts a <strong>15% platform commission cut</strong> (or active VIP tier rate) to cover high-speed streaming infrastructure, OBS browser overlay relay servers, and payment gateway processing fees.
          </p>
        </div>

        {/* Section 2: KYC & Payouts */}
        <div className="p-5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2.5 hover:border-[#00F5D4]/30 transition">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Lock className="h-4 w-4 text-[#FFD60A]" />
            <span>2. Identity Verification & Bank Settlement Requirements</span>
          </div>
          <p>
            To request payout withdrawals exceeding the minimum threshold of <strong className="text-[#FFD60A]">₹500.00</strong>, Creators must complete identity verification by uploading authentic government-issued identity proof (PAN Card / Aadhaar Card / Passport) along with verified bank account or UPI details.
          </p>
          <p>
            All withdrawal requests are reviewed by the platform owner and settled directly to the Creator's registered bank account or UPI handle upon approval.
          </p>
        </div>

        {/* Section 3: Anti-Fraud */}
        <div className="p-5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2.5 hover:border-[#00F5D4]/30 transition">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <AlertTriangle className="h-4 w-4 text-[#FF3D71]" />
            <span>3. Fraud Prevention & Chargeback Protection</span>
          </div>
          <p>
            All viewer payment transactions undergo real-time automated risk assessment. Transactions flagged for stolen card usage, unauthorized payments, or abusive chargeback disputes are subject to hold and review by the compliance team.
          </p>
          <p>
            Creators found attempting fraudulent self-donations or money laundering activities will face immediate account termination and fund forfeiture.
          </p>
        </div>

        {/* Section 4: Live Stream Conduct */}
        <div className="p-5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2.5 hover:border-[#00F5D4]/30 transition">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ScrollText className="h-4 w-4 text-[#00F5D4]" />
            <span>4. Community Broadcasting Guidelines & Code of Conduct</span>
          </div>
          <p>
            Creators must ensure live broadcast streams across YouTube, Twitch, Instagram, Kick, and X comply with community standards. Streaming hate speech, illegal activities, copyrighted content without rights, or explicit material is strictly prohibited.
          </p>
        </div>

      </div>

      {/* Footer Bar */}
      <div className="pt-4 border-t border-[#1C1C26] flex items-center justify-between text-[11px] text-[#8B8B96]">
        <span>Last Updated: 18 August 2026</span>
        <span className="text-[#00F5D4] font-bold">Futurepast Ventures LLP Legal Compliance</span>
      </div>
    </div>
  );
}
