'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import PlatformIcon from './PlatformIcon';
import { Shield, Sparkles, ArrowUpRight, Globe, Share2, Video, Radio } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-[#07070A] border-t border-[#1C1C26] pt-16 pb-12 relative overflow-hidden text-[#8B8B96]">
      {/* Glow effect in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#EB1000]/5 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1C1C26]">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Logo size="lg" />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-[#8B8B96]">
              AskMe PRO is the ultimate live Q&A and priority interaction broadcast platform connecting digital creators directly with their audience across YouTube, Twitch, Instagram, and Kick.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <PlatformIcon platform="youtube" showName={true} size="xs" />
              <PlatformIcon platform="twitch" showName={true} size="xs" />
              <PlatformIcon platform="instagram" showName={true} size="xs" />
              <PlatformIcon platform="kick" showName={true} size="xs" />
              <PlatformIcon platform="x" showName={true} size="xs" />
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white mb-4 tracking-wider uppercase">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="#creators" className="hover:text-white transition-colors">
                  Discover Creators
                </a>
              </li>
              <li>
                <a href="#live-matrix" className="hover:text-white transition-colors">
                  Live Stream Matrix
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">
                  Creator Earnings Estimator
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  SuperChat Q&A
                </a>
              </li>
            </ul>
          </div>

          {/* For Viewers & Creators */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white mb-4 tracking-wider uppercase">
              Portals
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/viewers/login" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Viewer Sign In</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/creators/login" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Creator Sign In</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/creators/register" className="text-[#00F5D4] hover:underline font-bold flex items-center gap-1">
                  <span>Become a Creator</span>
                  <Sparkles className="h-3 w-3 text-[#FFD60A]" />
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="font-heading font-bold text-sm text-white mb-4 tracking-wider uppercase">
              Security & Legal
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <span className="flex items-center gap-1.5 text-[#00E676]">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Encrypted UPI Payouts</span>
                </span>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Creator Agreement
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} AskMe PRO Broadcast Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[#8B8B96]">
            <span>System Status: <strong className="text-[#00E676] font-bold">● Operational</strong></span>
            <span>Razorpay & UPI Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
