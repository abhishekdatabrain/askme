'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ViewerSidebar from '@/components/ViewerSidebar';
import { getViewerToken, getViewerUser } from '@/utils/cookies';

export default function ViewerLayout({ children }) {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

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
        window.location.href = '/';
      }
    } else {
      setIsAuthorized(true);
      setLoading(false);
    }
  }, [pathname, isAuthPage]);

  // Sync theme with localStorage & event listener
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
    setTheme(saved);

    const handleThemeChange = () => {
      const updated = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
      setTheme(updated);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('viewer-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('viewer-theme-changed', handleThemeChange);
      }
    };
  }, []);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading || !isAuthorized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-[#F8F9FA] text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#F5F5F7]'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#8B8B96]">Verifying Viewer Authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full font-sans flex overflow-hidden selection:bg-[#EB1000] selection:text-white transition-colors duration-200 ${theme === 'light' ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-[#0A0A0F] text-[#F5F5F7]'
      }`}>
      {/* 1. FIXED DESKTOP SIDEBAR - STAYS MOUNTED ACCROSS ALL PAGES */}
      <div className={`hidden md:block h-screen overflow-y-auto shrink-0 z-40 border-r ${theme === 'light' ? 'border-[#E2E8F0] bg-white' : 'border-[#1F1F30] bg-[#0D0D14]'
        }`}>
        <ViewerSidebar theme={theme} onToggleTheme={(t) => setTheme(t)} />
      </div>

      {/* 2. DYNAMIC MAIN VIEWPORT WITH STICKY HEADER SCROLL SUPPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {children}
      </div>
    </div>
  );
}
