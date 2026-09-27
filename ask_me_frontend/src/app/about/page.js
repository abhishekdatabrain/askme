'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import AuthModal from '@/components/AuthModal';
import {
  Users,
  Sparkles,
  ShieldCheck,
  Zap,
  MessageSquare,
  Building2,
  ArrowRight,
  Heart,
  Globe
} from 'lucide-react';

export default function AboutPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState('creator');
  const [authMode, setAuthMode] = useState('register');

  const openCreatorAuth = () => {
    setAuthRole('creator');
    setAuthMode('register');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col">
      {/* Landing Navbar Header */}
      <LandingNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">

        {/* HERO SECTION */}
        <section className="relative text-center space-y-6 max-w-4xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-[#EB1000]/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Us</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white leading-tight">
            Real Conversations.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#EB1000] via-[#FF3D00] to-[#FF7A00]">
              Real–Time Connections.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#9E9EB2] font-medium leading-relaxed max-w-3xl mx-auto">
            AskMe is a creator discovery and paid interaction platform built to make conversations between Creators and their audiences more direct, structured and meaningful.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={openCreatorAuth}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-extrabold text-sm shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Join as Creator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/discover-creators"
              className="px-7 py-3.5 rounded-xl bg-[#141420] border border-[#2A2A3E] hover:border-[#EB1000]/50 hover:bg-[#1A1A2A] text-white font-extrabold text-sm transition-all"
            >
              Explore Creators
            </Link>
          </div>
        </section>

        {/* 1. ABOUT ASKME */}
        <section className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden group hover:border-[#EB1000]/40 transition-all">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#EB1000]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/20 flex items-center justify-center text-[#EB1000]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              About AskMe
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-[#A0A0B2] leading-relaxed font-normal">
            <p>
              AskMe is a creator discovery and paid interaction platform built to make conversations between Creators and their audiences more direct, structured and meaningful.
            </p>
            <p>
              Today, Creators communicate with their audiences across multiple platforms. Viewers may watch a livestream, follow a Creator, listen to a podcast, attend an educational session or discover content across different platforms, but getting a question noticed and answered can often be difficult.
            </p>
            <p className="text-white font-bold text-base sm:text-lg">
              AskMe is designed to simplify that interaction.
            </p>
            <p>
              Creators can create an AskMe presence, connect their audience to an AskMe session through a link or QR code, and allow viewers to submit paid questions or messages. Viewers can discover Creators, participate in supported sessions and receive notifications relating to their questions and interactions.
            </p>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141422] border border-[#222234] text-xs sm:text-sm text-[#8E8E9F] leading-relaxed">
              💡 <strong className="text-white">Multi-Platform Compatibility:</strong> AskMe does not need to host the underlying livestream. A Creator may continue using platforms such as YouTube, Instagram, Twitch, TikTok, LinkedIn or other supported services while using AskMe as an interaction and audience engagement layer.
            </div>
          </div>
        </section>

        {/* 2. BUILT FOR CREATORS */}
        <section className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-8 sm:p-10 space-y-6 hover:border-[#EB1000]/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/20 flex items-center justify-center text-[#EB1000]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Built for Creators
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-[#A0A0B2] leading-relaxed font-normal">
            <p>
              AskMe is designed for a broad range of online personalities and professionals.
            </p>
            <p>
              This can include Creators, Teachers, Coaches, Educators, Speakers, Streamers, Content Creators, YouTubers, Influencers, Journalists, Podcasters, Gamers, Artists, Musicians, Performers, Trainers, Mentors, Authors, Reviewers, Chefs, Travel Creators, Lifestyle Creators, Fashion Creators, Fitness Creators, Entrepreneurs, Technology Creators, Researchers, Academics, Subject Matter Experts and other online personalities.
            </p>
            <p>
              A Creator&apos;s category on AskMe describes how the Creator identifies their online activity. Selecting a category does not mean that AskMe certifies, endorses or professionally qualifies that Creator.
            </p>
          </div>
        </section>

        {/* 3. BUILT FOR VIEWERS & 4. MORE THAN A PAYMENT (SIDE BY SIDE) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Built for Viewers */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-8 space-y-5 hover:border-[#EB1000]/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-white">
                Built for Viewers
              </h2>
              <div className="space-y-3 text-sm text-[#A0A0B2] leading-relaxed">
                <p>
                  AskMe gives viewers a structured way to participate in Creator interactions.
                </p>
                <p>
                  Instead of relying entirely on ordinary chat messages, viewers can use an AskMe link or QR code to submit a question or message through the supported AskMe experience.
                </p>
                <p>
                  Depending on the Creator&apos;s settings and activity, viewers may receive updates about their question, including whether it has been answered or otherwise processed.
                </p>
              </div>
            </div>
          </div>

          {/* More Than a Payment */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-8 space-y-5 hover:border-[#EB1000]/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center text-[#00F5D4]">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-white">
                More Than a Payment
              </h2>
              <div className="space-y-3 text-sm text-[#A0A0B2] leading-relaxed">
                <p>
                  AskMe is not intended to be merely a payment button.
                </p>
                <p>
                  The platform is designed around the interaction between a Creator and a Viewer. Payment functionality is used to facilitate supported paid questions and interactions, while AskMe provides the surrounding technology for discovery, session participation, moderation, notifications and Creator management.
                </p>
                <p className="text-xs text-[#8E8E9F] bg-[#141422] p-4 rounded-xl border border-[#222234]">
                  ⚠️ A payment does not guarantee that a Creator will answer a question. Creators retain control over which questions they answer and how they respond, subject to AskMe policies and applicable law.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. INDEPENDENT PLATFORM & 6. OUR APPROACH (SIDE BY SIDE) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Independent Platform */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-8 space-y-5 hover:border-[#EB1000]/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 flex items-center justify-center text-[#3D5AFE]">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-white">
                Independent Platform
              </h2>
              <div className="space-y-3 text-sm text-[#A0A0B2] leading-relaxed">
                <p className="text-white font-bold bg-[#141422] p-4 rounded-xl border border-[#222234]">
                  AskMe is operated by FuturePast Ventures LLP, LLPIN ACQ-4984, based in Pune, Maharashtra, India.
                </p>
                <p>
                  AskMe may integrate with third party services and streaming platforms. Such platforms remain independent services and their respective terms, policies and moderation systems continue to apply to activity hosted on those platforms.
                </p>
                <p>
                  AskMe is not owned, operated or endorsed by a third party streaming platform unless expressly stated.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8E8E9F] pt-4 border-t border-[#1C1C2A]">
              <Globe className="w-4 h-4 text-[#3D5AFE]" />
              <span>Registered Entity • Pune, Maharashtra, India</span>
            </div>
          </div>

          {/* Our Approach */}
          <div className="bg-[#0F0F18] border border-[#1E1E2E] rounded-3xl p-8 space-y-5 hover:border-[#EB1000]/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/20 flex items-center justify-center text-[#EB1000]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-white">
                Our Approach
              </h2>
              <div className="space-y-3 text-sm text-[#A0A0B2] leading-relaxed">
                <p>
                  We believe online audiences should have better ways to participate in conversations with the people they follow.
                </p>
                <p>
                  Our focus is on building technology that makes Creator discovery, audience interaction, paid questions and communication simpler while maintaining appropriate standards for safety, privacy, security and responsible platform operation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8E8E9F] pt-4 border-t border-[#1C1C2A]">
              <Heart className="w-4 h-4 text-[#EB1000]" />
              <span>Built for Creators & Audiences Worldwide</span>
            </div>
          </div>
        </section>

      </main>

      {/* Landing Footer */}
      <LandingFooter />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialRole={authRole}
        initialMode={authMode}
      />
    </div>
  );
}
