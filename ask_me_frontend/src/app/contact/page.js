'use client';

import React, { useState } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import { useToast } from '@/context/ToastContext';
import {
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Headphones,
  CheckCircle2
} from 'lucide-react';

import { API_ENDPOINTS } from '@/config/api';

const FAQ_ITEMS = [
  {
    q: 'How do I add AskMe live overlay to OBS Studio or Streamlabs?',
    a: 'Simply go to your Creator Dashboard, copy your unique OBS Browser Source URL, and paste it into OBS as a Browser Source with 1080x1920 dimensions. Live questions and superchats will instantly animate on stream!'
  },
  {
    q: 'How fast are creator payouts processed?',
    a: 'AskMe features instant earnings tracking. Payouts are transferred automatically to your connected bank account or UPI ID every 24-48 hours with transparent reports.'
  },
  {
    q: 'Can viewers ask questions without installing any app?',
    a: 'Yes! Viewers can scan your stream QR code or click your AskMe link on any mobile camera or browser without downloading any application.'
  },
  {
    q: 'What should I do if I need urgent help during a live stream?',
    a: 'Our live stream emergency support team monitors active feeds 24/7. Select "Technical/OBS Support" in the contact form or email emergency@askme.live for high-priority response.'
  }
];

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      if (toast?.warning) {
        toast.warning('Please fill in all required fields.', 'Incomplete Form');
      }
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = API_ENDPOINTS?.CONTACT?.SUBMIT || 'http://localhost:5000/api/contact/submit';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      if (toast?.success) {
        toast.success(
          data.message || `Thank you ${formData.name}! Your message has been received. We will reply to ${formData.email} shortly.`,
          'Message Sent Successfully'
        );
      }

      setFormData({
        name: '',
        email: '',
        role: 'Viewer',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Contact Form Submit Error:', err);
      if (toast?.error) {
        toast.error(err.message || 'Server error while sending message. Please try again.', 'Submission Error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col justify-between">
      {/* 1. Global Navigation Bar */}
      <LandingNavbar />

      {/* 2. Main Contact Section */}
      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 w-full flex-1">

        {/* HERO HEADER */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180A0C] border border-[#EB1000]/40 text-[#EB1000] text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(235,16,0,0.25)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-pulse"></span>
            <span>24/7 CUSTOMER & CREATOR SUPPORT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight">
            Get in Touch with <span className="text-[#EB1000]">AskMe</span>
          </h1>

          <p className="text-sm sm:text-base text-[#8E8E9F] leading-relaxed font-normal">
            Have questions about live stream Q&A, OBS overlay integration, payouts, or partnerships? Our dedicated team is here to assist you around the clock.
          </p>
        </section>

        {/* QUICK INFO CARDS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-[#0D0D14] border border-[#222234] space-y-3 hover:border-[#EB1000]/50 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#180A0C] border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000] group-hover:scale-110 transition-transform">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">General Inquiries</h3>
              <p className="text-xs text-[#8E8E9F] mt-1">support@askme.live</p>
            </div>
            <span className="text-[11px] text-[#00E599] font-medium flex items-center gap-1 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E599] animate-pulse"></span>
              Monitored 24/7
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D0D14] border border-[#222234] space-y-3 hover:border-[#EB1000]/50 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#180A0C] border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000] group-hover:scale-110 transition-transform">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Creator Onboarding</h3>
              <p className="text-xs text-[#8E8E9F] mt-1">creators@askme.live</p>
            </div>
            <span className="text-[11px] text-[#8E8E9F] font-medium pt-1 block">
              VIP Manager Allocation
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D0D14] border border-[#222234] space-y-3 hover:border-[#EB1000]/50 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#180A0C] border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000] group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Fast Response Time</h3>
              <p className="text-xs text-[#8E8E9F] mt-1">&lt; 2 Hours Avg. Response</p>
            </div>
            <span className="text-[11px] text-[#FFD60A] font-medium pt-1 block">
              Priority for live streamers
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D0D14] border border-[#222234] space-y-3 hover:border-[#EB1000]/50 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#180A0C] border border-[#EB1000]/30 flex items-center justify-center text-[#EB1000] group-hover:scale-110 transition-transform">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Headquarters</h3>
              <p className="text-xs text-[#8E8E9F] mt-1">Tech Hub, Pune</p>
            </div>
            <span className="text-[11px] text-[#8E8E9F] font-medium pt-1 block">
              Global Support Centers
            </span>
          </div>
        </section>

        {/* CONTACT FORM & DIRECT HELP GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT: FORM CONTAINER */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0D0D14] border border-[#222234] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
              <p className="text-xs text-[#8E8E9F] mt-1">Fill in the details below and our support team will reach out immediately.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A0A0B2]">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samay Raina"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#161622] border border-[#28283C] text-xs text-white placeholder-[#5E5E72] focus:outline-none focus:border-[#EB1000] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A0A0B2]">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#161622] border border-[#28283C] text-xs text-white placeholder-[#5E5E72] focus:outline-none focus:border-[#EB1000] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A0A0B2]">I am a...</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#161622] border border-[#28283C] text-xs text-white focus:outline-none focus:border-[#EB1000] transition-all"
                  >
                    <option value="Viewer">Viewer / Fan</option>
                    <option value="Streamer">Streamer &amp; Creator</option>
                    <option value="Brand Partner">Brand Partner / Advertiser</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A0A0B2]">Phone *</label>
                  <input
                    type="number"
                    placeholder="Your Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#161622] border border-[#28283C] text-xs text-white placeholder-[#5E5E72] focus:outline-none focus:border-[#EB1000] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A0A0B2]">Message *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can we help you today? Please share any relevant details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full py-3 px-4 rounded-xl bg-[#161622] border border-[#28283C] text-xs text-white placeholder-[#5E5E72] focus:outline-none focus:border-[#EB1000] transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#EB1000] hover:bg-[#CC0E00] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#EB1000]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message to Support</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: LIVE HELP & FAQ HIGHLIGHTS */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Support Guarantee */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1C090C] via-[#120B12] to-[#0D0D14] border border-[#EB1000]/40 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-white font-bold text-lg">
                <ShieldCheck className="h-6 w-6 text-[#EB1000]" />
                <span>AskMe Support Promise</span>
              </div>
              <p className="text-xs text-[#A0A0B2] leading-relaxed">
                Whether you're running a live broadcast with 50,000 concurrent viewers or just starting out as a creator, our support team ensures zero downtime for your stream overlays and payment feeds.
              </p>

              <div className="space-y-2 pt-2 text-xs text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00E599]" />
                  <span>Instant OBS Browser Source Diagnostics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00E599]" />
                  <span>Transparent 24-Hour Settlement Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00E599]" />
                  <span>Dedicated Discord &amp; Live Chat Assistance</span>
                </div>
              </div>
            </div>

            {/* Quick Accordion FAQ */}
            <div className="p-6 rounded-3xl bg-[#0D0D14] border border-[#222234] space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[#EB1000]" /> Frequently Asked Questions
              </h3>

              <div className="space-y-3 pt-1">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="border-b border-[#202032] pb-3 last:border-none">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left text-xs font-bold text-white hover:text-[#EB1000] transition-colors py-1 cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#EB1000]' : 'text-[#7A7A8E]'}`} />
                      </button>
                      {isOpen && (
                        <p className="text-[11px] text-[#8E8E9F] leading-relaxed pt-2">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* 3. Global Footer */}
      <LandingFooter />
    </div>
  );
}
