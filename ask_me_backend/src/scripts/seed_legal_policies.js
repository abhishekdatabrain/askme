const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { sequelize } = require("../config/db");
const { LegalPolicy, LegalPolicyVersion } = require("../models");

const POLICIES_DATA = [
  {
    title: "End User License Agreement (EULA)",
    slug: "eula",
    category: "Legal",
    display_order: 1,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: true,
    consent_type: "eula",
    meta_title: "End User License Agreement | AskMe",
    meta_description: "End User License Agreement, User Agreement and Creator Agreement governing the AskMe platform operated by FuturePast Ventures LLP.",
    meta_keywords: "eula, license agreement, terms of use, askme, futurepast ventures",
    content: `
      <h2>1. Introduction</h2>
      <p>This End User License Agreement, User Agreement and Creator Agreement ("Agreement") governs access to and use of AskMe, including the AskMe website, mobile applications, software, technology, APIs, Creator discovery services, Creator profiles, sessions, QR codes, links, paid questions, paid messages, notifications, payment functionality, Creator dashboards, moderation tools, integrations and all other services made available by or through AskMe.</p>
      <p>AskMe is operated by FuturePast Ventures LLP ("FuturePast", "Company", "we", "us" or "our"), a limited liability partnership registered in India (LLPIN: ACQ-4984, Pune, Maharashtra).</p>
      <p>By accessing AskMe, creating an account, registering as a Creator, submitting a paid question, creating an AskMe session, using an AskMe QR code, accessing a Creator profile, making a payment or otherwise using any AskMe service, you acknowledge that you have read, understood and agreed to this Agreement and the policies incorporated into it.</p>
      <p>If you do not agree with this Agreement, you must not access or use AskMe.</p>

      <h2>2. Nature and Purpose of AskMe</h2>
      <p>AskMe is a technology platform designed to facilitate discovery and interaction between online personalities, Creators and their audiences.</p>
      <p>The platform may enable Creators to establish profiles, become discoverable to Viewers, create interaction sessions and receive paid questions or messages from their audiences.</p>
      <p>AskMe is not necessarily the platform on which a Creator's underlying livestream or primary content is hosted. A Creator may conduct a livestream or publish content through a third party service such as YouTube, Instagram, Twitch, TikTok, LinkedIn or another streaming platform while using AskMe as an interaction and discovery layer.</p>

      <h2>3. Definitions</h2>
      <ul>
        <li><strong>AskMe:</strong> The technology platform operated by FuturePast Ventures LLP.</li>
        <li><strong>Creator:</strong> A person or eligible entity approved to use AskMe's Creator functionality to establish a profile, conduct sessions, receive questions or otherwise interact with Viewers.</li>
        <li><strong>Viewer:</strong> A person using AskMe to discover or interact with a Creator.</li>
        <li><strong>User:</strong> Any person accessing or using AskMe, including a Viewer and Creator.</li>
        <li><strong>Paid Question:</strong> A question or message submitted through a paid interaction feature for which the Viewer completes the applicable payment transaction.</li>
        <li><strong>Platform Fee:</strong> The percentage fee charged by AskMe for providing its applicable platform services.</li>
        <li><strong>Creator Net Earnings:</strong> The amount remaining from Creator Gross Share after applicable deductions, platform fees, taxes and processing charges.</li>
      </ul>

      <h2>4. Eligibility & Account Registration</h2>
      <p>AskMe is intended primarily for persons aged eighteen (18) years or older. By using AskMe, you represent that you have reached the legal age of majority and possess the legal capacity to enter into this Agreement.</p>
      <p>Users must provide accurate, current, and complete information during registration. Users are responsible for safeguarding account credentials and for all activities conducted under their accounts.</p>

      <h2>5. Platform Fees & Financial Terms</h2>
      <p>AskMe charges a platform service fee on eligible paid interactions processed through the platform. Payouts to Creators are subject to applicable identity verification (KYC), tax deductions (TDS under Section 194J/194M where applicable), and third-party payment gateway fees.</p>

      <h2>6. Termination & Discontinuation</h2>
      <p>AskMe reserves the right to suspend or terminate accounts, remove content, or refuse service to any User who violates this Agreement, our Community Guidelines, or applicable laws.</p>
    `,
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    category: "Privacy & Compliance",
    display_order: 2,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: true,
    consent_type: "privacy_policy",
    meta_title: "Privacy Policy | AskMe",
    meta_description: "Privacy Policy for AskMe, compliant with Digital Personal Data Protection Act 2023 (DPDP Act) and IT Act 2000.",
    meta_keywords: "privacy policy, dpdp act 2023, personal data, futurepast ventures, data protection",
    content: `
      <h2>1. Introduction and Scope</h2>
      <p>This Privacy Policy ("Policy") explains how FuturePast Ventures LLP ("Company", "AskMe", "we", "us", or "our"), operating the platform AskMe (ask-me.live), collects, uses, processes, stores, and protects personal data belonging to Creators, Viewers/Fans, and website visitors ("you" or "Users").</p>
      <blockquote>This Policy is drafted in accordance with the <strong>Digital Personal Data Protection Act, 2023 ("DPDP Act")</strong> and applicable rules thereunder, the <strong>Information Technology Act, 2000</strong>, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</blockquote>

      <h2>2. Categories of Personal Data We Collect</h2>
      <h3>2.1 Viewer / Fan Data</h3>
      <p>When you submit a voluntary paid question or interact with a Creator's link/QR code, we collect your display name or handle, email address, mobile phone number, question content, submission timestamps, queue status logs, IP address, and transaction identifiers.</p>

      <h3>2.2 Creator Data</h3>
      <p>When registering as a Creator, we collect legal name, email, mobile number, social media profiles, government-issued identity documents (Aadhaar number and verification status, PAN number), bank account information (account number, IFSC code, account holder name), and GSTIN where applicable.</p>

      <h2>3. Purpose and Legal Basis for Processing</h2>
      <ul>
        <li>To provide core platform features, including Studio Queue processing and live stream overlays.</li>
        <li>To execute financial transactions, platform fee calculations, and payout settlements.</li>
        <li>To comply with regulatory obligations, including KYC, anti-money laundering (AML), and taxation under the Income Tax Act, 1961 and CGST Act, 2017.</li>
        <li>To detect and prevent fraudulent activities, chargebacks, and unauthorized access.</li>
      </ul>

      <h2>4. Data Retention and Security</h2>
      <p>Personal data is retained only as long as necessary for the fulfillment of the purposes outlined in this Policy, or as mandated by statutory records retention periods (typically up to 8 years under Indian financial regulations). We implement industry-standard AES-256 encryption at rest and TLS 1.3 in transit.</p>

      <h2>5. User Rights Under DPDP Act 2023</h2>
      <p>Under the DPDP Act 2023, data principals have the right to access summaries of personal data processed, request correction or erasure, nominate another individual in the event of death or incapacity, and access grievance redressal mechanisms.</p>
    `,
  },
  {
    title: "Cookie Policy",
    slug: "cookie-policy",
    category: "Privacy & Compliance",
    display_order: 3,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: false,
    consent_type: "cookie_policy",
    meta_title: "Cookie Policy | AskMe",
    meta_description: "Information about how AskMe uses cookies and local storage technologies.",
    meta_keywords: "cookies, local storage, tracking, session cookies, privacy",
    content: `
      <h2>1. Overview of Cookies and Tracking Technologies</h2>
      <p>AskMe may use cookies, software development kits (SDKs), local storage, pixels, device identifiers, and similar technologies to operate the website and application, maintain authenticated sessions, remember user preferences, ensure security, understand platform usage, and continuously improve our services.</p>

      <h2>2. Essential vs. Optional Cookies</h2>
      <p><strong>Essential Technologies:</strong> These cookies and storage items are strictly necessary for authentication, security, account operation, session security, CSRF protection, and fraud prevention. Disabling them in your browser may impair the core functionality of the platform.</p>
      <p><strong>Analytics & Performance:</strong> Optional cookies help us analyze visitor interactions and traffic patterns to optimize platform speed and user experience. These are governed by applicable consent requirements.</p>

      <h2>3. Managing Cookie Preferences</h2>
      <p>Users may control or delete cookies through browser settings. Note that blocking essential cookies will impact your ability to log in, submit questions, or manage Creator dashboards.</p>
    `,
  },
  {
    title: "Cancellation and Refund Policy",
    slug: "refund-policy",
    category: "Financial",
    display_order: 4,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: true,
    consent_type: "refund_policy",
    meta_title: "Cancellation and Refund Policy | AskMe",
    meta_description: "Cancellation and Refund Policy governing voluntary fan payments and paid question submissions on AskMe.",
    meta_keywords: "refund policy, cancellation, chargebacks, viewer payments, creator support",
    content: `
      <h2>1. Purpose and Scope</h2>
      <p>This Cancellation and Refund Policy ("Policy") governs all payments, voluntary fan contributions, and paid question submissions made by users ("Viewers" or "Fans") on AskMe (ask-me.live), operated by FuturePast Ventures LLP.</p>

      <h2>2. Voluntary Fan Support & Strict Non-Refundability</h2>
      <p><strong>2.1 Voluntary Support:</strong> All payments made by Viewers on AskMe are voluntary payments and fan support contributions willingly made to financially support the selected Creator and highlight an interaction within the Creator's Studio Queue.</p>
      <p><strong>2.2 No Guarantee of Answer:</strong> Payment guarantees placement in the Creator's Studio Queue; it does not constitute an unconditional legal guarantee that the Creator will answer, broadcast, or display the question, as editorial freedom and queue moderation remain entirely at the Creator's discretion.</p>
      <p><strong>2.3 General Non-Refundable Rule:</strong> Once a payment is successfully processed through our Payment Service Providers, all payments are final and non-refundable.</p>

      <h2>3. Exceptions for Technical Failures</h2>
      <p>In the event that an amount is debited from a Viewer's bank account or card but the transaction fails to register on AskMe due to a payment gateway communication timeout, the transaction will automatically be reconciled by our Payment Service Providers and reversed back to the original source of payment within 5 to 7 business days.</p>

      <h2>4. Dispute Resolution & Contact</h2>
      <p>For transaction issues or payment inquiries, users may contact our support team at <strong>support@ask-me.live</strong> or submit a support ticket via the user portal.</p>
    `,
  },
  {
    title: "Community Guidelines",
    slug: "community-guidelines",
    category: "Safety & Community",
    display_order: 5,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: false,
    consent_type: "community_guidelines",
    meta_title: "Community Guidelines | AskMe",
    meta_description: "Community standards and zero-tolerance prohibited content rules on AskMe.",
    meta_keywords: "community guidelines, safety rules, moderation, prohibited content",
    content: `
      <h2>1. Purpose of These Guidelines</h2>
      <p>AskMe (ask-me.live), operated by FuturePast Ventures LLP, is built to foster respectful, high-signal real-time connections between Creators and their Viewers across live streaming ecosystems.</p>
      <p>These Guidelines apply to all questions, messages, Creator profiles, broadcast overlays, and interactions on AskMe.</p>

      <h2>2. Zero-Tolerance Prohibited Content</h2>
      <p>Neither Viewers nor Creators may use AskMe to submit, broadcast, solicit, or promote content that violates Indian law (including Rule 3(1)(b) of the IT Rules 2021) or falls into the following categories:</p>
      <ul>
        <li><strong>Hate Speech & Harassment:</strong> Discrimination, intimidation, slurs, targeted abuse, or doxxing based on religion, race, caste, gender, sexual orientation, disability, or nationality.</li>
        <li><strong>Sexually Explicit Content:</strong> Pornography, solicitation of sexual services, or non-consensual sexual material.</li>
        <li><strong>Violence & Illegal Acts:</strong> Incitement to violence, terroristic threats, criminal conspiracies, or self-harm encouragement.</li>
        <li><strong>Financial Scams:</strong> Fraudulent investment schemes, multi-level marketing, unauthorized gambling, or extortion.</li>
      </ul>

      <h2>3. Moderation & Enforcement</h2>
      <p>Creators possess the absolute authority to skip, dismiss, or flag inappropriate questions. Platform administrators reserve the right to permanently terminate offending accounts and blacklist payment credentials.</p>
    `,
  },
  {
    title: "Creator Terms and Conditions",
    slug: "creator-terms",
    category: "Creator Agreement",
    display_order: 6,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: true,
    consent_type: "creator_terms",
    meta_title: "Creator Terms and Conditions | AskMe",
    meta_description: "Terms and conditions governing Creator onboarding, Studio Queue, commission, and payouts on AskMe.",
    meta_keywords: "creator terms, payout settlement, studio queue, commission, kyc",
    content: `
      <h2>1. Scope and Relationship of Parties</h2>
      <p>These Creator Terms ("Creator Terms") govern your onboarding, profile operation, Studio Queue management, and payout settlements as a Content Creator ("Creator", "you", or "your") on AskMe, operated by FuturePast Ventures LLP.</p>
      <blockquote>You participate on AskMe strictly as an <strong>independent contractor</strong> and not as an employee, partner, agent, or joint venturer of FuturePast Ventures LLP.</blockquote>

      <h2>2. Onboarding, KYC & Pricing</h2>
      <p>To receive earnings, Creators must complete Aadhaar, PAN, and Bank Account verification. Creators may configure custom minimum price gates for voluntary paid questions during live sessions.</p>

      <h2>3. Platform Fee and Payout Settlements</h2>
      <p>AskMe deducts a platform facilitation fee from gross transaction amounts. The remaining Creator Net Share is accumulated in the Creator's digital wallet and disbursed according to the standard settlement cycle (T+2 business days) to the Creator's verified Indian bank account.</p>

      <h2>4. Tax Obligations</h2>
      <p>Creators are solely responsible for declaring income and fulfilling all statutory tax liabilities (income tax, advance tax, and GST where registration thresholds are met) arising from payouts received through AskMe.</p>
    `,
  },
  {
    title: "Payment Policy",
    slug: "payment-policy",
    category: "Financial",
    display_order: 7,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: true,
    consent_type: "payment_policy",
    meta_title: "Payment Policy | AskMe",
    meta_description: "Payment terms, processing methods, transaction fees, and settlement cycles on AskMe.",
    meta_keywords: "payment policy, upi, cards, settlement, payout cycle, rbi guidelines",
    content: `
      <h2>1. Introduction and Scope</h2>
      <p>This Payment Policy ("Policy") governs the collection of voluntary Viewer payments, calculation of platform fees, tax deductions, and settlement of Creator payouts on AskMe (ask-me.live), operated by FuturePast Ventures LLP.</p>

      <h2>2. Supported Payment Methods & Processing</h2>
      <p>Payments are processed in Indian Rupees (INR) through RBI-authorized payment aggregators supporting UPI, RuPay, Visa, Mastercard, Net Banking, and approved digital wallets.</p>
      <p>AskMe does not directly store sensitive payment credentials such as card numbers, CVVs, or UPI PINs. All transactions are tokenized and processed in compliance with PCI-DSS standards.</p>

      <h2>3. Settlement Schedules & Thresholds</h2>
      <p>Creator payout withdrawals are processed on standard banking days subject to minimum withdrawal balance thresholds. Payout requests are credited directly to verified bank accounts via NEFT/IMPS/UPI rails.</p>
    `,
  },
  {
    title: "GST and Tax Policy",
    slug: "gst-tax-policy",
    category: "Financial",
    display_order: 8,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: false,
    consent_type: "gst_tax_policy",
    meta_title: "GST and Tax Policy | AskMe",
    meta_description: "Tax deduction, GST treatment, TDS under Income Tax Act, and invoicing rules on AskMe.",
    meta_keywords: "gst policy, tax, tds, section 194j, 194m, cgst, sgst, igst",
    content: `
      <h2>1. Overview and Scope</h2>
      <p>This GST and Tax Policy ("Policy") outlines the indirect and direct tax treatment applicable to voluntary Viewer payments, platform service fees, and Creator payouts processed through AskMe (ask-me.live), operated by FuturePast Ventures LLP.</p>

      <h2>2. Goods & Services Tax (GST) on Platform Fees</h2>
      <p>The platform facilitation fee charged by AskMe to Creators attracts 18% GST (CGST + SGST or IGST) under current Indian tax legislation. AskMe generates GST-compliant invoices for its service fee portion.</p>

      <h2>3. Tax Deducted at Source (TDS)</h2>
      <p>Where mandated by the provisions of the Income Tax Act, 1961 (such as Section 194-O, 194J, or 194M), AskMe or its associated banking entities will deduct applicable TDS prior to remitting net payouts, and provide corresponding Form 16A TDS certificates at quarterly intervals.</p>
    `,
  },
  {
    title: "International Payments Policy",
    slug: "international-payment-policy",
    category: "Financial",
    display_order: 9,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: false,
    consent_type: "international_payments",
    meta_title: "International Payments Policy | AskMe",
    meta_description: "Cross-border payment rules, FEMA compliance, and restricted country guidelines.",
    meta_keywords: "international payments, fema, cross-border, restricted countries, foreign exchange",
    content: `
      <h2>1. International Viewer Interactions & Purchases</h2>
      <p>AskMe may allow international viewers to purchase paid questions or other supported interactions, subject to payment provider capabilities, applicable law, and country availability.</p>

      <h2>2. Regulatory, FEMA & Foreign Exchange Rules</h2>
      <p>All international cross-border transactions are processed in strict compliance with the Foreign Exchange Management Act, 1999 (FEMA), RBI guidelines on cross-border merchant transactions, and anti-money laundering (AML) controls.</p>

      <h2>3. Restricted Jurisdictions</h2>
      <p>AskMe currently enforces platform risk controls that restrict international transactions originating from or processed within certain high-risk jurisdictions, including Pakistan, Bangladesh, North Korea (DPRK), Palestine, and Türkiye (Turkey).</p>
    `,
  },
  {
    title: "Copyright Policy",
    slug: "copyright-policy",
    category: "Legal",
    display_order: 10,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: false,
    consent_type: "copyright_policy",
    meta_title: "Copyright Policy | AskMe",
    meta_description: "Copyright infringement reporting procedures, takedown notices, and IP protection on AskMe.",
    meta_keywords: "copyright, dmca, ip infringement, takedown notice, intellectual property",
    content: `
      <h2>1. Reporting Infringing Material</h2>
      <p>A copyright owner or authorized representative who believes that content hosted on AskMe infringes their protected intellectual property may submit a formal infringement notice to our designated team.</p>

      <h2>2. Complaint Requirements</h2>
      <p>Infringement notices must contain: identification of the copyrighted work claimed to have been infringed, exact URLs/links locating the infringing material on AskMe, proof of ownership or authorization, and clear contact details.</p>

      <h2>3. AskMe's Response & Enforcement</h2>
      <p>Upon receipt of a valid notice, AskMe will expeditiously review the claim, restrict or remove the offending material, and notify the affected user. Repeated or egregious copyright infringement will result in permanent account termination.</p>
    `,
  },
  {
    title: "Grievance Policy",
    slug: "grievance-policy",
    category: "Legal",
    display_order: 11,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: false,
    consent_type: "grievance_policy",
    meta_title: "Grievance Policy | AskMe",
    meta_description: "Grievance Redressal Mechanism under IT Rules 2021 and DPDP Act 2023.",
    meta_keywords: "grievance officer, it rules 2021, dispute redressal, complaints",
    content: `
      <h2>1. Scope of Complaints</h2>
      <p>Users may submit complaints regarding account actions, Creator conduct, content violations, payments, privacy concerns, or platform operation on AskMe.</p>

      <h2>2. Designated Grievance Officer</h2>
      <p>In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and DPDP Act 2023, the details of our designated Grievance Officer are:</p>
      <blockquote>
        <p><strong>Name:</strong> Mr. T.S. Sandhu</p>
        <p><strong>Email:</strong> Grievance@ask-me.live</p>
        <p><strong>Entity:</strong> FuturePast Ventures LLP</p>
        <p><strong>Location:</strong> Pune, Maharashtra, India</p>
      </blockquote>

      <h2>3. Resolution Timeline</h2>
      <p>All grievances received will be acknowledged within 24 to 48 hours and resolved within the statutory period of 15 days from the date of receipt.</p>
    `,
  },
  {
    title: "Terms and Conditions",
    slug: "terms-and-conditions",
    category: "Legal",
    display_order: 12,
    version: "1.0",
    effective_date: "2026-09-25",
    is_consent_required: true,
    consent_type: "terms_and_conditions",
    meta_title: "Terms and Conditions | AskMe",
    meta_description: "Terms and Conditions governing access and transactions on the AskMe platform.",
    meta_keywords: "terms and conditions, user agreement, legal contract, askme live",
    content: `
      <h2>1. Acceptance of Terms</h2>
      <p>Welcome to AskMe (ask-me.live), a digital creator discovery and real-time paid Q&A queuing platform operated by FuturePast Ventures LLP ("Company", "AskMe", "we", "us", or "our").</p>
      <p>By accessing, browsing, registering on, or making a payment through AskMe as a Viewer/Fan ("Viewer") or as a Content Creator ("Creator"), you agree to be legally bound by these Terms and Conditions ("Terms"), along with our Cancellation and Refund Policy, Payment Policy, Privacy Policy, Creator Terms, GST and Tax Policy, and Community Guidelines.</p>

      <h2>2. Eligibility</h2>
      <p>To use AskMe or execute a financial transaction on the platform, you must be at least 18 years of age and competent to enter into a legally binding contract under the Indian Contract Act, 1872.</p>

      <h2>3. Disclaimers & Limitation of Liability</h2>
      <p>AskMe provides interaction queuing and discovery technology on an "AS IS" and "AS AVAILABLE" basis. Under no circumstances shall FuturePast Ventures LLP be liable for indirect, incidental, punitive, or consequential damages arising from use of the platform.</p>

      <h2>4. Governing Law and Jurisdiction</h2>
      <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra, India.</p>
    `,
  },
];

async function seedLegalPolicies() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database for Legal Policy seeding.");

    // Sync tables in schema
    await LegalPolicy.sync({ alter: true });
    await LegalPolicyVersion.sync({ alter: true });

    let insertedCount = 0;
    let existingCount = 0;

    for (const policyData of POLICIES_DATA) {
      const existing = await LegalPolicy.findOne({
        where: { slug: policyData.slug },
      });

      if (existing) {
        console.log(`[SKIPPED] Policy "${policyData.slug}" already exists (id: ${existing.id}).`);
        existingCount++;
      } else {
        const created = await LegalPolicy.create({
          title: policyData.title,
          slug: policyData.slug,
          category: policyData.category,
          content: policyData.content.trim(),
          draft_content: null,
          has_draft: false,
          status: "published",
          version: policyData.version,
          effective_date: policyData.effective_date,
          meta_title: policyData.meta_title,
          meta_description: policyData.meta_description,
          meta_keywords: policyData.meta_keywords,
          is_consent_required: policyData.is_consent_required,
          consent_type: policyData.consent_type,
          requires_reconsent: false,
          display_order: policyData.display_order,
          published_at: new Date(),
          published_by: null,
        });

        // Create immutable initial version
        await LegalPolicyVersion.create({
          policy_id: created.id,
          version: policyData.version,
          title: policyData.title,
          content: policyData.content.trim(),
          effective_date: policyData.effective_date,
          changelog: "Initial published version migrated from AskMe frontend.",
          is_material_change: false,
          published_by: null,
          publisher_name: "System Migration",
          published_at: new Date(),
        });

        console.log(`[CREATED] Policy "${policyData.slug}" created with ID: ${created.id}`);
        insertedCount++;
      }
    }

    console.log(`\nSeeding completed: ${insertedCount} inserted, ${existingCount} already present.`);
  } catch (error) {
    console.error("Error seeding legal policies:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seedLegalPolicies();
