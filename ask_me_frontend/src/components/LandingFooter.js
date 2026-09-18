'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function LandingFooter() {
  return (
    <footer className="bg-[#07070C] border-t border-[#1C1C28] pt-14 pb-10 text-[#8B8B9E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Brand & Socials Column */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <Link href="/" className="inline-block">
              <Logo size="lg" />
            </Link>

            <div className="space-y-0.5">
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                Real Conversations
              </h3>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#EB1000] tracking-tight">
                Real– Time Connections
              </h3>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3 pt-3">
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 hover:border-white transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Snapchat */}
              <a
                href="#"
                aria-label="Snapchat"
                className="w-9 h-9 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 hover:border-white transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.166 3c-3.743 0-6.166 2.658-6.166 5.86 0 1.344.426 2.827.994 3.792-.256.342-.796.657-1.466.829-.395.101-.58.337-.58.55 0 .385.496.793 1.398 1.05.215.344.382.784.382 1.258 0 .423-.153.805-.444 1.107-.468.487-1.196.776-2.052.776-.411 0-.672.23-.672.516 0 .524.772 1.262 2.698 1.262.535 0 1.103-.06 1.67-.17.954-.185 1.838-.722 2.684-1.071.492-.203.957-.348 1.39-.348.43 0 .895.145 1.387.348.847.349 1.73.886 2.684 1.071.567.11 1.135.17 1.67.17 1.926 0 2.698-.738 2.698-1.262 0-.286-.261-.516-.672-.516-.856 0-1.584-.289-2.052-.776-.291-.302-.444-.684-.444-1.107 0-.474.167-.914.382-1.258.902-.257 1.398-.665 1.398-1.05 0-.213-.185-.449-.58-.55-.67-.172-1.21-.487-1.466-.829.568-.965.994-2.448.994-3.792C18.332 5.658 15.909 3 12.166 3z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 hover:border-white transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 hover:border-white transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Links Columns with Vertical Dividers */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 pt-2">
            {/* Column 1: Platform */}
            <div className="space-y-4 text-left sm:border-r border-[#1C1C2A] sm:pr-6">
              <h4 className="font-heading font-bold text-base text-white tracking-wide">
                Platform
              </h4>
              <ul className="space-y-3 text-sm text-[#9E9EB2] font-medium">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <Link href="/creators/register" className="hover:text-white transition-colors">
                    As a Creator
                  </Link>
                </li>
                <li>
                  <Link href="/viewers/login" className="hover:text-white transition-colors">
                    As a Viewer
                  </Link>
                </li>
                <li>
                  <Link href="/live-streams" className="hover:text-white transition-colors">
                    Live Streams
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-4 text-left sm:border-r border-[#1C1C2A] sm:pr-6">
              <h4 className="font-heading font-bold text-base text-white tracking-wide">
                Resources
              </h4>
              <ul className="space-y-3 text-sm text-[#9E9EB2] font-medium">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-4 text-left">
              <h4 className="font-heading font-bold text-base text-white tracking-wide">
                Company
              </h4>
              <ul className="space-y-3 text-sm text-[#9E9EB2] font-medium">
                <li>
                  <a href="#origin" className="hover:text-white transition-colors">
                    About Ask Me
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar Separated by Horizontal Border */}
        <div className="pt-8 border-t border-[#1C1C2A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8E9F] font-medium">
          <p>2026 All rights reserved</p>
          <p>Made with ♡ for Live Moments</p>
        </div>
      </div>
    </footer>
  );
}
