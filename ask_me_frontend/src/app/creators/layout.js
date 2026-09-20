'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import CreatorSidebar from '@/components/CreatorSidebar';

export default function CreatorLayout({ children }) {
  const pathname = usePathname();

  // Exclude auth, root creators listing & standalone pages (login, register & kyc) from sidebar layout
  const isNoSidebarPage =
    pathname === '/creators' ||
    pathname === '/creators/' ||
    pathname === '/creators/login' ||
    pathname === '/creators/register' ||
    pathname === '/creators/kyc' ||
    pathname?.startsWith('/creators/kyc');

  if (isNoSidebarPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#EB1000] selection:text-white flex overflow-hidden">
      {/* 1. FIXED DESKTOP CREATOR SIDEBAR - STAYS MOUNTED ACCROSS ALL PAGES */}
      <div className="hidden md:block h-screen overflow-y-auto shrink-0 z-40 border-r border-[#1C1C26]/60">
        <CreatorSidebar />
      </div>

      {/* 2. DYNAMIC MAIN VIEWPORT WITH STICKY HEADER SCROLL SUPPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {children}
      </div>
    </div>
  );
}
