'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ViewerSidebar from '@/components/ViewerSidebar';
import { getViewerToken, getViewerUser } from '@/utils/cookies';

export default function ViewerLayout({ children }) {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Exclude auth pages (login & register) from sidebar & auth layout protection
  const isAuthPage = pathname === '/viewers/login' || pathname === '/viewers/register';

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    const token = getViewerToken() || (typeof window !== 'undefined' ? localStorage.getItem('askme_viewer_token') : null);
    const user = getViewerUser() || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('askme_viewer_user') || 'null') : null);

    if (!token || !user) {
      setIsAuthorized(false);
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/viewers/login';
      }
    } else {
      setIsAuthorized(true);
      setLoading(false);
    }
  }, [pathname, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#8B8B96]">Verifying Viewer Authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#00F5D4] selection:text-[#0A0A0F] flex">
      {/* 1. FIXED DESKTOP SIDEBAR - STAYS MOUNTED ACCROSS ALL PAGES */}
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto shrink-0 z-30 border-r border-[#1C1C26]/60">
        <ViewerSidebar />
      </div>

      {/* 2. DYNAMIC MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
