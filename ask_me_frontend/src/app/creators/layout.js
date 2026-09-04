'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import CreatorSidebar from '@/components/CreatorSidebar';

export default function CreatorLayout({ children }) {
  const pathname = usePathname();

  // Exclude auth & standalone pages (login, register & kyc) from sidebar layout
  const isNoSidebarPage =
    pathname === '/creators/login' ||
    pathname === '/creators/register' ||
    pathname === '/creators/kyc' ||
    pathname?.startsWith('/creators/kyc');

  if (isNoSidebarPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#00F5D4] selection:text-[#0A0A0F] flex">
      {/* 1. FIXED DESKTOP CREATOR SIDEBAR - STAYS MOUNTED ACCROSS ALL PAGES */}
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto shrink-0 z-30 border-r border-[#1C1C26]/60">
        <CreatorSidebar />
      </div>

      {/* 2. DYNAMIC MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
