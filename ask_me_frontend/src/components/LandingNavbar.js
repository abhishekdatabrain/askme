'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Search, Menu, X } from 'lucide-react';
import AuthModal from './AuthModal';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('viewer');
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const handleOpenAuthEvent = (e) => {
      const { role = 'viewer', mode = 'login' } = e.detail || {};
      setAuthRole(role);
      setAuthMode(mode);
      setAuthModalOpen(true);
    };
    window.addEventListener('open_askme_auth_modal', handleOpenAuthEvent);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open_askme_auth_modal', handleOpenAuthEvent);
    };
  }, []);

  const openAuth = (role = 'viewer', mode = 'login') => {
    setAuthRole(role);
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#07070C]/95 backdrop-blur-xl border-b border-[#1E1E2D]/80 py-2 px-2 sm:px-4 lg:px-6 shadow-2xl'
          : 'bg-transparent py-3 px-2 sm:px-4 lg:px-6'
          }`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-300 ${scrolled
            ? 'bg-[#0D0D14] border border-[#222234] shadow-2xl py-2 px-4 sm:px-6'
            : 'bg-[#0F0F18]/90 backdrop-blur-md border border-[#202030] py-2 px-4 sm:px-6 shadow-xl'
            }`}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Logo & Subtitle */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <Logo size="sm" />
              <div className="flex flex-col leading-none">
                <span className="font-heading font-black text-white text-[15px] tracking-tight">
                  AskMe
                </span>
                <span className="text-[8px] font-bold text-[#6E6E80] tracking-wider uppercase mt-0.5">
                  DISCOVER • GROW • ENGAGE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links WITH VERTICAL SEPARATORS */}
            <nav className="hidden lg:flex items-center gap-3.5 text-[13px] font-semibold text-[#A0A0B2]">
              <Link href="/discover-creators" className="hover:text-white transition-colors">
                Discover
              </Link>
              <span className="h-3.5 w-[1px] bg-[#222234]"></span>

              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <span className="h-3.5 w-[1px] bg-[#222234]"></span>

              <a href="#for-creators" className="hover:text-white transition-colors">
                For Creators
              </a>
              <span className="h-3.5 w-[1px] bg-[#222234]"></span>

              <Link href="/live-streams" className="hover:text-white transition-colors flex items-center gap-1.5 text-white font-bold">
                <span className="h-2 w-2 rounded-full bg-[#EB1000] animate-pulse"></span>
                Live Streams
              </Link>
              <span className="h-3.5 w-[1px] bg-[#222234]"></span>

              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </nav>

            {/* Search Bar & Get Started Button */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={() => openAuth('viewer', 'login')}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-[13px] font-bold shadow-lg shadow-[#EB1000]/30 hover:opacity-90 transition-all shrink-0 cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => openAuth('creator', 'register')}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-[13px] font-bold shadow-lg shadow-[#EB1000]/30 hover:opacity-90 transition-all shrink-0 cursor-pointer"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuth('creator', 'register')}
                className="px-3.5 py-1.5 rounded-full bg-[#EB1000] text-white text-xs font-bold sm:hidden cursor-pointer"
              >
                Get Started
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full bg-[#161622] text-white border border-[#262638]"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 pb-2 border-t border-[#222234] space-y-2 text-xs font-semibold text-[#A0A0B2]">
              <Link href="/discover-creators" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-white">
                Discover
              </Link>
              <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-white">
                Categories
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-white">
                How It Works
              </a>
              <a href="#for-creators" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-white">
                For Creators
              </a>
              <Link href="/live-streams" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-white font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#EB1000] animate-pulse"></span>
                Live Streams
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-white">
                Contact Us
              </Link>
              <div className="pt-2 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openAuth('viewer', 'login')}
                    className="py-2 rounded-full bg-[#161622] border border-[#262638] text-center text-white font-semibold cursor-pointer"
                  >
                    Viewer Login
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth('creator', 'register')}
                    className="py-2 rounded-full bg-[#EB1000] text-center text-white font-bold cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* POPUP AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authRole}
        initialMode={authMode}
      />
    </>
  );
}

