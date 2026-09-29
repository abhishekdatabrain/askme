'use client';

import React, { useState } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  FileText,
  ShieldCheck,
  Scale,
  Building2,
  UserCheck,
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle2,
  Mail,
  ChevronRight,
  BookOpen,
  Award,
  Zap,
  Globe,
  HelpCircle,
  Clock,
  Shield
} from 'lucide-react';

export default function EulaPage() {
  const [activeTab, setActiveTab] = useState('part1'); // 'part1' | 'part2' | 'summary'

  const part1Sections = [
    {
      num: '1',
      title: 'Introduction',
      content: 'This End User License Agreement, User Agreement and Creator Agreement ("Agreement") governs access to and use of AskMe, including the AskMe website, mobile applications, software, technology, APIs, Creator discovery services, Creator profiles, sessions, QR codes, links, paid questions, paid messages, notifications, payment functionality, Creator dashboards, moderation tools, integrations and all other services made available by or through AskMe.\n\nAskMe is operated by FuturePast Ventures LLP ("FuturePast", "Company", "we", "us" or "our"), a limited liability partnership registered in India.\n\nBy accessing AskMe, creating an account, registering as a Creator, submitting a paid question, creating an AskMe session, using an AskMe QR code, accessing a Creator profile, making a payment or otherwise using any AskMe service, you acknowledge that you have read, understood and agreed to this Agreement and the policies incorporated into it.\n\nIf you do not agree with this Agreement, you must not access or use AskMe.'
    },
    {
      num: '2',
      title: 'Nature and Purpose of AskMe',
      content: 'AskMe is a technology platform designed to facilitate discovery and interaction between online personalities, Creators and their audiences.\n\nThe platform may enable Creators to establish profiles, become discoverable to Viewers, create interaction sessions and receive paid questions or messages from their audiences.\n\nAskMe may provide technology including Creator discovery, session pages, QR codes, links, paid questions, paid messages, notifications, moderation tools, Creator dashboards, overlays, payment interfaces, transaction records and related services.\n\nAskMe is not necessarily the platform on which a Creator\'s underlying livestream or primary content is hosted.\n\nA Creator may conduct a livestream or publish content through a third party service such as YouTube, Instagram, Twitch, TikTok, LinkedIn or another streaming or content platform while using AskMe as an interaction and discovery layer.\n\nAskMe may add, modify, suspend or discontinue features as its services develop.'
    },
    {
      num: '3',
      title: 'Definitions',
      content: 'For purposes of this Agreement:\n• "AskMe" means the technology platform operated by FuturePast Ventures LLP.\n• "Creator" means a person or eligible entity approved to use AskMe\'s Creator functionality to establish a profile, conduct sessions, receive questions or otherwise interact with Viewers.\n• "Viewer" means a person using AskMe to discover or interact with a Creator.\n• "User" means any person accessing or using AskMe, including a Viewer and Creator.\n• "Paid Question" means a question or message submitted through a paid interaction feature for which the Viewer completes the applicable payment transaction.\n• "Platform Fee" means the fee charged by AskMe for providing its applicable platform services.\n• "Payment Service Provider" means a bank, payment gateway, payment aggregator, payment processor, acquiring institution, card network, foreign exchange provider or other authorised service provider used by AskMe or its transaction partners.\n• "Creator Gross Share" means the portion of an eligible transaction attributable to the Creator after deduction of the applicable AskMe Platform Fee but before applicable taxes, processing charges, withholding, refunds, reversals, chargebacks and other permitted deductions.\n• "Creator Net Earnings" means the amount remaining from the Creator Gross Share after applicable deductions.'
    },
    {
      num: '4',
      title: 'Creator Categories',
      content: 'AskMe may be used by a wide range of online personalities, Creators and professionals including Content Creators, YouTubers, Influencers, Streamers, Teachers, Educators, Coaches, Trainers, Mentors, Speakers, News Anchors, Journalists, Podcasters, Gamers, Musicians, Artists, Performers, Comedians, Authors, Reviewers, Chefs, Travel Creators, Lifestyle Creators, Fitness Creators, Entrepreneurs, Technology Creators, Researchers, Academics, Subject Matter Experts and other online personalities.\n\nThis list is illustrative and not exhaustive. The availability of a category does not mean that FuturePast has certified, licensed, endorsed or professionally verified every Creator operating under that category.'
    },
    {
      num: '5',
      title: 'No Professional Certification or Endorsement',
      content: 'A Creator\'s registration, verification or appearance on AskMe must not be interpreted as certification, accreditation, professional endorsement or recommendation by FuturePast.\n\nWhere a Creator represents that they possess a professional qualification, licence, registration, accreditation or other regulated status, the Creator is responsible for ensuring that the representation is truthful and that the relevant qualification remains valid.\n\nWhere applicable, AskMe may request evidence of qualifications, licences or other credentials.'
    },
    {
      num: '6',
      title: 'Eligibility',
      content: 'AskMe is intended primarily for persons aged eighteen years or older. By using AskMe, you represent that you have reached the applicable age of majority and have the legal capacity to enter into this Agreement.\n\nCreators must satisfy additional onboarding, KYC, payment and verification requirements before receiving or withdrawing Creator earnings. AskMe may restrict or terminate accounts where it reasonably believes that eligibility requirements have not been satisfied.'
    },
    {
      num: '7',
      title: 'Account Registration',
      content: 'Where registration is required, Users must provide accurate, complete and current information. Users must not knowingly provide false information, impersonate another person or create accounts for fraudulent purposes.\n\nUsers are responsible for protecting their account credentials and for activity conducted through their accounts, subject to applicable law. If an account is suspected of compromise, the User should promptly notify AskMe.'
    },
    {
      num: '8',
      title: 'Electronic Agreement',
      content: 'You may accept this Agreement electronically by selecting "Accept", "I Agree", "Register", "Create Account", "Become a Creator", "Continue" or a substantially similar acceptance mechanism.\n\nUse of AskMe after being presented with this Agreement may also constitute acceptance to the extent permitted by applicable law. Electronic records concerning acceptance, transactions, communications, account activity and other interactions may be retained by AskMe as business and legal records.'
    },
    {
      num: '9',
      title: 'Creator Registration',
      content: 'A person seeking to use Creator functionality must complete the applicable registration process. Approval as a Creator is subject to AskMe\'s eligibility, KYC, safety, payment and compliance requirements. Approval does not guarantee access to every feature, discovery placement, payment method, revenue level or continued use of the platform.'
    },
    {
      num: '10',
      title: 'Creator Discovery',
      content: 'AskMe may provide Creator discovery and search functionality. Creator visibility may be affected by categories, search terms, Creator information, session activity, engagement, availability, language, geography, promotional programmes, technical factors, safety systems, risk assessment and algorithmic processes.\n\nPlacement in search or recommendations does not constitute an endorsement by AskMe. AskMe does not guarantee any particular number of views, questions, followers, engagements or earnings.'
    },
    {
      num: '11',
      title: 'AskMe and Third Party Streaming Platforms',
      content: 'Creators may use AskMe alongside third party platforms including YouTube, Instagram, Twitch, TikTok, LinkedIn and other streaming services. The Creator\'s use of a third party platform remains subject to that platform\'s own terms and policies.\n\nAskMe is independent of third party platforms unless expressly stated otherwise and does not acquire ownership of a Creator\'s account on a third party platform.'
    },
    {
      num: '12',
      title: 'Underlying Livestream Responsibility',
      content: 'AskMe ordinarily does not host the Creator\'s underlying livestream. The relevant third party service remains responsible for moderation and enforcement concerning the underlying livestream content hosted on that service.\n\nAskMe remains responsible for activity occurring on AskMe itself, including Creator profiles, AskMe sessions, paid questions, messages, reports, transaction activity and other content submitted to or occurring through AskMe.'
    },
    {
      num: '13',
      title: 'Paid Questions',
      content: 'AskMe may allow a Viewer to submit a paid question or paid message to a Creator. The Viewer must review the Creator, question, transaction amount and applicable information before completing payment.\n\nA Paid Question is a voluntary payment for the opportunity to submit an interaction through AskMe. Payment does not create an unconditional right to a particular answer or outcome.'
    },
    {
      num: '14',
      title: 'Voluntary Nature of Paid Questions',
      content: 'The Viewer understands that a Paid Question is a voluntary audience interaction payment. The Viewer does not acquire a guaranteed right to receive a response merely because payment has been completed. The Creator may decide whether to answer, reject, skip or otherwise moderate a question in accordance with available tools and policies.'
    },
    // {
    //   num: '15',
    //   title: 'No Guaranteed Response',
    //   content: 'AskMe does not guarantee that every Paid Question will be answered. A Creator may choose to answer publicly, answer privately, reject the question, skip it, decline to answer it or respond at another time. A Viewer is not automatically entitled to a refund solely because a Creator does not respond. Refund rights are governed by this Agreement, the Refund Policy and applicable law.'
    // },
    {
      num: '16',
      title: 'No Guaranteed Outcome',
      content: 'Payment does not guarantee that a Creator will provide a particular answer, a favourable answer, an immediate answer, a public answer, a private answer, a particular opinion, an acknowledgement of the Viewer, mention of the Viewer\'s name, professional advice, entertainment value, inclusion in a livestream or any other specific outcome.'
    },
    {
      num: '17',
      title: 'Payment Service Providers',
      content: 'AskMe may use one or more Payment Service Providers to facilitate transactions including payment authentication, transaction processing, fraud screening, settlement, refunds, reversals, chargebacks, currency conversion and related functions. FuturePast may change or replace Payment Service Providers for operational, commercial, technical, regulatory, compliance or risk management reasons.'
    },
    {
      num: '18',
      title: 'Payment Architecture',
      content: 'Payments may be processed and settled through direct settlement, split settlement, settlement to FuturePast followed by Creator payout, or another legally supported structure. The exact settlement architecture may change without altering the fundamental commercial principles contained in this Agreement.\n\nFuturePast shall not represent itself as a bank, Payment Aggregator, wallet issuer, remittance provider or other regulated financial institution unless separately authorised.'
    },
    {
      num: '19',
      title: 'Payment Credentials',
      content: 'Users must not provide card PINs, CVVs, passwords, authentication credentials or other sensitive payment information to Creators. Where payment credentials are processed by a Payment Service Provider, the relevant provider handles them under its security and regulatory framework. AskMe retains transaction references necessary to operate the platform.'
    },
    {
      num: '20',
      title: 'Standard Platform Fee',
      content: 'AskMe\'s standard Platform Fee is 15% of the applicable transaction amount, unless a different fee is expressly displayed, communicated or agreed. The Platform Fee represents the charge for AskMe\'s applicable platform services.'
    },
    {
      num: '21',
      title: 'Creator Gross Share',
      content: 'After deduction of the applicable AskMe Platform Fee, the remaining amount ordinarily constitutes the Creator\'s gross share. Under the standard 15% Platform Fee structure, the Creator\'s gross share is ordinarily 80.3% of the applicable transaction amount. The 80.3% is a gross Creator share and not a guaranteed net payout.'
    },
    {
      num: '22',
      title: 'Variable Platform Fee',
      content: 'AskMe may increase or reduce its standard 15% Platform Fee for promotional campaigns, referral programmes, introductory offers, channel risk, transaction risk, fraud risk, chargeback exposure, geographic risk, compliance requirements or other legitimate risk management considerations. Where reasonably practicable, applicable fees shall be disclosed prior to application.'
    },
    {
      num: '23',
      title: 'Risk Based Commercial Terms',
      content: 'AskMe may conduct risk assessments considering transaction history, chargeback activity, fraud indicators, payment behaviour, geographic activity, content category and account history. The outcome of a risk assessment may affect Platform Fees, transaction limits, payout timing or additional verification requirements.'
    },
    {
      num: '24',
      title: 'Creator Earnings Calculation',
      content: 'Standard Calculation:\n• Transaction Amount: 100%\n• Less AskMe Platform Fee: ordinarily 15%\n• Creator Gross Share: ordinarily 80.3%\n• Less Applicable Deductions\n• Creator Net Earnings: remaining amount\n\n  The applicable deductions may include taxes, payment processing charges, foreign exchange charges, statutory withholding, refunds, reversals, chargebacks, fraud adjustments, Payment Service Provider adjustments and other legally required or contractually applicable deductions.\n Example:Viewer pays \$10, AskMe Platform Fee is \$1.50, Creator Gross Share is \$8.50. If applicable deductions total \$0.70, Creator Net Earnings would be \$7.80. This is an illustration only.'
    },
    {
      num: '25',
      title: 'Creator Net Earnings Are Not Guaranteed at 80.3%',
      content: 'The expression "80.3% Creator Share" refers to the Creator\'s gross share under the standard 15% Platform Fee structure. It does not mean that the Creator will receive 80.3% as the final net payout deposited into their bank account. Final Creator Net Earnings may be lower after applicable deductions.'
    },
    {
      num: '26',
      title: 'Illustrative Transaction',
      content: 'If a Viewer pays ₹1,000 for an eligible Paid Question and the standard 15% Platform Fee applies, the AskMe Platform Fee would be ₹150 and the Creator Gross Share would be ₹850. If taxes, payment processing charges and permitted deductions total ₹50, Creator Net Earnings would be ₹800. This example is illustrative only and does not establish a fixed tax rate, processing fee or payout amount.'
    },
    {
      num: '27',
      title: 'Taxes and Statutory Deductions',
      content: 'Where GST or another tax is legally chargeable on AskMe\'s platform services, FuturePast may charge, collect and account for that tax in accordance with applicable law. Where taxes, withholding or statutory deductions are required to be deducted from Creator earnings, AskMe or its Payment Service Provider may make the relevant deduction before payout. Creators remain responsible for their own tax obligations.'
    },
    {
      num: '28',
      title: 'GST Invoicing',
      content: 'Where FuturePast is legally required to issue a GST tax invoice for its platform service or Platform Fee, the invoice shall reflect the applicable taxable value and GST. AskMe does not represent that the entire amount paid by a Viewer automatically constitutes the taxable value of FuturePast\'s own platform service. Final invoicing implementation shall be configured after FuturePast finalises its Payment Service Provider and obtains appropriate professional tax advice.'
    },
    {
      num: '29',
      title: 'Payment Processing Charges',
      content: 'Payment processing charges vary depending on payment method, currency, country, card network, Payment Service Provider and transaction value. Payment processing charges attributable to the Creator transaction may be deducted from the Creator\'s 80.3% gross share.'
    },
    {
      num: '30',
      title: 'International Payments',
      content: 'AskMe may support international Viewers where international payments are technically and legally supported by Payment Service Providers. International transactions are subject to Indian foreign exchange requirements, payment provider restrictions, sanctions screening, AML requirements and regulatory controls.\n AskMe does not guarantee that international payments will be available from every country, through every currency or using every payment method.'
    },
    {
      num: '31',
      title: 'Restricted International Payment Jurisdictions',
      content: 'AskMe currently does not permit international payments originating from or processed from: Pakistan, Bangladesh, Democratic People\'s Republic of Korea (North Korea), Palestine, or Türkiye (Turkey). Transactions associated with these jurisdictions may be declined, blocked, held, cancelled or reversed. AskMe may update this list based on legal, compliance or risk considerations.'
    },
    {
      num: '32',
      title: 'International Currency Conversion',
      content: 'Currency conversion is performed by the Payment Service Provider, card network, bank or acquiring institution. Exchange rates and charges may vary. AskMe does not guarantee a specific exchange rate unless expressly stated.'
    },
    {
      num: '33',
      title: 'Payment Screening and Financial Crime Controls',
      content: 'AskMe and its Payment Service Providers use automated and manual screening to identify fraudulent, suspicious, sanctioned or restricted transactions. A transaction may be delayed, declined or held where information creates a compliance, fraud or financial crime concern.'
    },
    {
      num: '34',
      title: 'Refunds',
      content: 'Paid Questions are voluntary audience interaction payments. Viewers do not automatically qualify for refunds because they changed their mind, disliked a response, asked the wrong question, or expected faster answers. Refunds may be considered where transactions were unauthorised, duplicated due to technical error, debited without a corresponding transaction, or where required by law.'
    },
    {
      num: '35',
      title: 'Refund Effect on Creator Earnings',
      content: 'Where a transaction is refunded, reversed or cancelled, corresponding Creator earnings may be adjusted. If the amount has already been credited, AskMe may recover or offset the amount against future Creator earnings.'
    },
    {
      num: '36',
      title: 'Chargebacks',
      content: 'A chargeback initiated through a bank or card issuer resulting in loss to AskMe or its Payment Service Provider may result in adjustment of corresponding Creator earnings. Repeated fraudulent or abusive chargebacks may result in account termination.'
    },
    {
      num: '37',
      title: 'Creator Payouts',
      content: 'Creator earnings become eligible for payout after settlement, KYC, fraud, refund, chargeback and compliance requirements are satisfied. Pending earnings balances do not constitute an unconditional payout entitlement.'
    },
    {
      num: '38',
      title: 'Payout Timing',
      content: 'Payout periods displayed by AskMe are estimated processing periods. Actual processing depends upon transaction settlement, KYC verification, fraud review, payment provider timelines, banking holidays and dispute checks.'
    },
    {
      num: '39',
      title: 'Payout Holds',
      content: 'AskMe may temporarily hold Creator earnings to investigate suspicious activity, fraud, chargebacks, KYC issues or regulatory requirements. A hold does not itself constitute a finding of wrongdoing.'
    },
    // {
    //   num: '40',
    //   title: 'No Guaranteed Creator Earnings',
    //   content: 'Registration as a Creator does not guarantee any particular amount of income, number of Viewers, number of Paid Questions, followers, engagement or commercial success.'
    // },
    {
      num: '41-51',
      title: 'Conduct & Safety Rules (Summary of Clauses 41 to 51)',
      content: '• Creator Responsibility (Clause 41): Creators are responsible for content, compliance, and IP.\n• Professional Categories (Clauses 42-46): Journalists, Gamers, Performers, Teachers, and Regulated Professionals (Medical/Legal/Financial) must comply with their respective laws and rules.\n• Prohibited Content & Conduct (Clause 47): Prohibition of fraud, scams, money laundering, CSAM, non-consensual content, violence, harassment, doxxing, malware, and phishing.\n• Child Safety (Clause 48): Zero tolerance for exploitation of minors.\n• Harassment & Privacy (Clauses 49-50): Prohibits threats, stalking, harassment, and unlawful disclosure of private info.\n• Impersonation (Clause 51): Prohibits deceptive impersonation of figures or organizations.'
    },
    {
      num: '52-60',
      title: 'IP, AI & Platform Operation (Summary of Clauses 52 to 60)',
      content: '• Intellectual Property (Clause 52): FuturePast retains all rights to AskMe tech, branding, and interfaces.\n• User Content License (Clause 53): Users grant a non-exclusive license to host, process, display, and moderate content.\n• Creator Profile License (Clause 54): Creators authorize profile display for discovery and platform operation.\n• AI & Automated Moderation (Clause 55): Platform may use AI/machine learning for moderation, safety, and fraud screening.\n• Suspension & Termination (Clauses 56-58): Accounts may be suspended or terminated for violations, fraud, or safety concerns with appeal mechanisms.\n• Privacy & Security (Clauses 59-60): Personal data processed under Privacy Policy; reasonable data security maintained.'
    },
    {
      num: '61-80',
      title: 'General Terms & Legal Framework (Summary of Clauses 61 to 80)',
      content: '• Retention & Notifications (Clauses 61-63): Records retained for legal/tax requirements; transactional notifications enabled.\n• Availability & Force Majeure (Clauses 64-65): Service provided on reasonable effort basis; no liability for force majeure.\n• No Circumvention (Clause 67): Creators must not deliberately bypass Platform Fees or payment systems.\n• Limitation of Liability & Indemnity (Clauses 72-73): Users indemnify against unlawful conduct; liability limited for third-party failures.\n• Governing Law & Disputes (Clauses 74-75): Governed by laws of India with jurisdiction in Maharashtra, India.\n• Grievance Redressal (Clause 76): Grievance Officer: Mr. T.S. Sandhu (Grievance@ask-me.live), Pune, Maharashtra.'
    }
  ];

  const part2Sections = [
    {
      num: '81-87',
      title: 'Creator Status & Onboarding (Clauses 81 to 87)',
      content: '• Creator Agreement Scope (Clause 81): Applies specifically to all approved AskMe Creators.\n• Independent Status (Clause 82): Creators are independent users, not employees, agents, or partners of FuturePast.\n• Profile Accuracy (Clause 83): Creators must provide truthful profile details and update inaccurate information.\n• Creator KYC (Clause 84): Identity verification, PAN/tax details, and bank verification required for earnings withdrawal.\n• Creator Sessions & Dashboard (Clauses 85-87): Tools provided for livestreams, QR codes, question moderation, and earnings tracking.'
    },
    {
      num: '88-96',
      title: 'Creator Financials & Payouts (Clauses 88 to 96)',
      content: '• Gross Revenue Share (Clause 88): Standard model is 15% Platform Fee and 80.3% Creator Gross Share.\n• Variable & Promotional Fees (Clauses 89-91): Platform Fees may adjust for campaigns, referrals, or risk assessments.\n• Net Earnings (Clause 92): Final payout is calculated after deducting taxes, processing charges, withholding, refunds, and chargebacks.\n• Payment Provider Requirements & Holds (Clauses 93-96): Payouts subject to settlement, KYC, and chargeback recovery.'
    },
    {
      num: '97-104',
      title: 'Creator Responsibilities & Compliance (Clauses 97 to 104)',
      content: '• Tax Compliance (Clause 97): Creators responsible for income tax/GST; AskMe may withhold required statutory taxes.\n• Content & Professional Standards (Clauses 98-100): Creators responsible for IP permissions, platform rules, and professional standards.\n• Promotional Use & Referrals (Clauses 101-103): AskMe authorized to use public profiles for discovery and referral programs.\n• Risk Controls (Clause 104): Platform monitors for fraud, abuse, and chargeback risks.'
    },
    {
      num: '105-116',
      title: 'Termination, International Terms & Legal Info (Clauses 105 to 116)',
      content: '• Suspension & Termination (Clauses 105-107): Accounts subject to suspension/termination for material breach or fraud.\n• International Creators & Restricted Jurisdictions (Clauses 109-111): Restrictions apply to Pakistan, Bangladesh, North Korea, Palestine, and Türkiye.\n• Commercial Model Acknowledgement (Clause 112): Creators confirm understanding of the 15% fee / 80.3% gross share structure.\n• Grievance & Corporate Info (Clauses 114-116): Operator: FuturePast Ventures LLP (LLPIN: ACQ-4984, Pune, Maharashtra, India). Grievance Officer: Mr. T.S. Sandhu (Grievance@ask-me.live).'
    }
  ];

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
      {/* Landing Navbar Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10">

        {/* HERO HEADER */}
        <section className="text-center space-y-4 pt-4 border-b border-[#1E1E2E] pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-extrabold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Framework</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight text-white uppercase leading-tight">
            ASKME END USER LICENSE AGREEMENT, USER AGREEMENT AND CREATOR AGREEMENT
          </h1>

          {/* ENTITY & GRIEVANCE BOX */}
          <div className="p-5 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] max-w-3xl mx-auto text-xs sm:text-sm text-[#A0A0B2] space-y-2 text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-white font-bold">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#EB1000]" />
                Operated by: FuturePast Ventures LLP
              </span>
              <span>•</span>
              <span>LLPIN: ACQ-4984</span>
              <span>•</span>
              <span>Pune, Maharashtra, India</span>
            </div>
            <div className="pt-2 border-t border-[#1C1C2A] flex flex-wrap items-center justify-center gap-4 text-xs">
              <span className="text-white font-semibold">Grievance Officer: Mr. T.S. Sandhu</span>
              <span>•</span>
              <a href="mailto:Grievance@ask-me.live" className="text-[#EB1000] hover:underline font-bold flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Grievance@ask-me.live
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-[#8E8E9F] font-medium pt-1">
            <span>Effective Date: <strong>23 September 2026</strong></span>
            <span>•</span>
            <span>Last Updated: <strong>23 September 2026</strong></span>
          </div>
        </section>

        {/* TAB NAVIGATION */}
        <section className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('part1')}
            className={`px-5 py-3 rounded-xl font-heading font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'part1'
              ? 'bg-[#EB1000] text-white shadow-lg shadow-[#EB1000]/30'
              : 'bg-[#0F0F18] text-[#8E8E9F] border border-[#1E1E2E] hover:text-white hover:bg-[#141422]'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>PART I: User Agreement & EULA (Clauses 1–80)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('part2')}
            className={`px-5 py-3 rounded-xl font-heading font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'part2'
              ? 'bg-[#EB1000] text-white shadow-lg shadow-[#EB1000]/30'
              : 'bg-[#0F0F18] text-[#8E8E9F] border border-[#1E1E2E] hover:text-white hover:bg-[#141422]'
              }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>PART II: Creator Agreement (Clauses 81–116)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-5 py-3 rounded-xl font-heading font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'summary'
              ? 'bg-[#EB1000] text-white shadow-lg shadow-[#EB1000]/30'
              : 'bg-[#0F0F18] text-[#8E8E9F] border border-[#1E1E2E] hover:text-white hover:bg-[#141422]'
              }`}
          >
            <Zap className="w-4 h-4" />
            <span>Commercial Model Summary</span>
          </button>
        </section>

        {/* TAB 1: PART I - USER AGREEMENT */}
        {activeTab === 'part1' && (
          <section className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] text-xs sm:text-sm text-[#A0A0B2]">
              <h2 className="text-lg font-heading font-black text-white mb-1">PART I: END USER LICENSE AGREEMENT AND USER AGREEMENT</h2>
              <p>Governs general access, viewer interaction, payments, discovery, third-party streaming platform integration, and safety rules.</p>
            </div>

            {part1Sections.map((sec, idx) => (
              <div
                key={idx}
                className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-3 hover:border-[#EB1000]/40 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 border-b border-[#1C1C2A] pb-3">
                  <span className="px-3 py-1 rounded-lg bg-[#EB1000]/10 border border-[#EB1000]/20 text-[#EB1000] font-bold text-xs">
                    CLAUSE {sec.num}
                  </span>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                    {sec.title}
                  </h3>
                </div>
                <div className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed whitespace-pre-line pt-1">
                  {sec.content}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* TAB 2: PART II - CREATOR AGREEMENT */}
        {activeTab === 'part2' && (
          <section className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#0F0F18] border border-[#1E1E2E] text-xs sm:text-sm text-[#A0A0B2]">
              <h2 className="text-lg font-heading font-black text-white mb-1">PART II: CREATOR AGREEMENT (Clauses 81 to 116)</h2>
              <p>Applies specifically to approved Creators. Governs Creator tools, discovery, revenue share, payout holds, KYC, and commercial terms.</p>
            </div>

            {part2Sections.map((sec, idx) => (
              <div
                key={idx}
                className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-6 sm:p-8 space-y-3 hover:border-[#EB1000]/40 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 border-b border-[#1C1C2A] pb-3">
                  <span className="px-3 py-1 rounded-lg bg-[#EB1000]/10 border border-[#EB1000]/20 text-[#EB1000] font-bold text-xs">
                    CLAUSES {sec.num}
                  </span>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white">
                    {sec.title}
                  </h3>
                </div>
                <div className="text-xs sm:text-sm text-[#A0A0B2] leading-relaxed whitespace-pre-line pt-1">
                  {sec.content}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* TAB 3: COMMERCIAL MODEL AT A GLANCE */}
        {activeTab === 'summary' && (
          <section className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#1C1C2A] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EB1000]/10 border border-[#EB1000]/20 flex items-center justify-center text-[#EB1000] shrink-0 font-bold text-sm">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
                CREATOR COMMERCIAL MODEL AT A GLANCE
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234]">
                <span className="text-xs text-[#8E8E9F] block mb-1">Viewer Payment</span>
                <span className="text-2xl font-black text-white">100%</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234]">
                <span className="text-xs text-[#8E8E9F] block mb-1">Standard Platform Fee</span>
                <span className="text-2xl font-black text-[#EB1000]">15%</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234]">
                <span className="text-xs text-[#8E8E9F] block mb-1">Creator Gross Share</span>
                <span className="text-2xl font-black text-[#00E676]">80.3%</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#141422] border border-[#222234]">
                <span className="text-xs text-[#8E8E9F] block mb-1">Creator Net Payout</span>
                <span className="text-xs text-[#D0D0E0] font-bold block mt-1">Remaining after taxes, gateway fees & withholding</span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#A0A0B2] leading-relaxed pt-2">
              <p>
                • <strong>AskMe standard Platform Fee:</strong> 15% of the applicable transaction amount.
              </p>
              <p>
                • <strong>Creator Gross Share:</strong> 80.3% of the applicable transaction amount.
              </p>
              <p>
                • <strong>Applicable Deductions from Gross Share:</strong> Taxes (GST), payment processing charges, statutory withholding, refunds, reversals, chargebacks and other legally applicable adjustments.
              </p>
              <p className="p-4 rounded-2xl bg-[#141422] border border-[#222234] text-xs text-[#8E8E9F]">
                💡 <strong>Important Note:</strong> AskMe may increase or reduce the 15% Platform Fee for promotional campaigns, referral programs, special arrangements, channel risk, transaction risk, payment provider requirements or compliance considerations. The Creator&apos;s 80.3% is a gross share, not a guaranteed net payout.
              </p>
            </div>
          </section>
        )}

      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
