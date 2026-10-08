'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Radio } from 'lucide-react';
import CreatorSidebar from '@/components/CreatorSidebar';
import Logo from '@/components/Logo';

export default function CreatorLayout({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exclude auth, root creators listing & standalone pages (login, register & kyc) from sidebar layout
  const isNoSidebarPage =
    pathname === '/creators' ||
    pathname === '/creators/' ||
    pathname === '/' ||
    pathname === '/creators/login' ||
    pathname?.startsWith('/creators/login') ||
    pathname === '/creators/register' ||
    pathname?.startsWith('/creators/register') ||
    pathname === '/creators/kyc' ||
    pathname?.startsWith('/creators/kyc');

  if (isNoSidebarPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex flex-col md:flex-row overflow-hidden">
      {/* 1. MOBILE TOP HEADER (Visible on screens < md) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#13131A] border-b border-[#1C1C26] z-40 shrink-0">
        <Link href="/creators/dashboard" className="flex items-center gap-2.5">
          <Logo size="sm" />
          <div>
            <span className="font-heading font-black text-base leading-none block text-white">AskMe</span>
            <span className="text-[9px] font-bold uppercase tracking-wider block text-[#EB1000]">Creator Studio</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[#1C1C26] text-white hover:bg-[#252533] transition cursor-pointer"
          aria-label="Toggle Creator Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 2. MOBILE DRAWER SLIDE-OVER OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 sm:w-80 max-w-[85vw] bg-[#13131A] h-full shadow-2xl flex flex-col z-50 border-r border-[#1C1C26] overflow-hidden">
            <div className="p-3.5 border-b border-[#1C1C26] flex items-center justify-between bg-[#0A0A0F] shrink-0">
              <span className="font-heading font-black text-xs uppercase tracking-wider text-[#A0A0B2]">Creator Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-[#1C1C26] text-gray-400 hover:text-white cursor-pointer"
                aria-label="Close Navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <CreatorSidebar onNavigate={() => setMobileMenuOpen(false)} isMobileDrawer={true} />
            </div>
          </div>
        </div>
      )}

      {/* 3. FIXED DESKTOP CREATOR SIDEBAR */}
      <div className="hidden md:block h-screen overflow-y-auto shrink-0 z-40 border-r border-[#1C1C26]/60">
        <CreatorSidebar />
      </div>

      {/* 4. DYNAMIC MAIN VIEWPORT WITH STICKY HEADER SCROLL SUPPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
        {children}
      </div>
    </div>
  );
}
