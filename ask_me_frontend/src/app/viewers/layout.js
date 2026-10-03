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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exclude auth pages (login & register) from sidebar & auth layout protection
  const isAuthPage = pathname === '/' || pathname === '/';

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
    <div className={`h-screen w-full font-sans flex flex-col md:flex-row overflow-hidden selection:bg-[#EB1000] selection:text-white transition-colors duration-200 ${theme === 'light' ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-[#0A0A0F] text-[#F5F5F7]'
      }`}>
      {/* 1. MOBILE TOP HEADER (< md) */}
      <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b z-40 shrink-0 ${
        theme === 'light' ? 'bg-white border-[#E2E8F0]' : 'bg-[#0D0D14] border-[#1F1F30]'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#EB1000] flex items-center justify-center text-white font-black text-xs shadow-sm">
            a
          </div>
          <div>
            <span className={`font-heading font-black text-sm block leading-none ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
              AskMe
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider block text-[#EB1000] mt-0.5">
              Viewer Hub
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-xl border cursor-pointer ${
            theme === 'light' ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#14141F] border-[#1F1F30] text-white'
          }`}
          aria-label="Toggle Navigation Menu"
        >
          <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 2. MOBILE DRAWER SLIDE-OVER OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`relative w-72 sm:w-80 max-w-[85vw] h-full shadow-2xl flex flex-col z-50 border-r overflow-hidden ${
            theme === 'light' ? 'bg-white border-[#E2E8F0]' : 'bg-[#0D0D14] border-[#1F1F30]'
          }`}>
            <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
              theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#0A0A0F] border-[#1F1F30]'
            }`}>
              <span className="font-heading font-black text-xs uppercase tracking-wider text-[#EB1000]">Viewer Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-1.5 rounded-lg border cursor-pointer ${
                  theme === 'light' ? 'bg-white border-[#E2E8F0] text-gray-600' : 'bg-[#1C1C26] border-[#252533] text-gray-400'
                }`}
                aria-label="Close Navigation"
              >
                <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ViewerSidebar
                theme={theme}
                onToggleTheme={(t) => setTheme(t)}
                isMobileDrawer={true}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. FIXED DESKTOP SIDEBAR - STAYS MOUNTED ACCROSS ALL PAGES */}
      <div className={`hidden md:block h-screen overflow-y-auto shrink-0 z-40 border-r ${theme === 'light' ? 'border-[#E2E8F0] bg-white' : 'border-[#1F1F30] bg-[#0D0D14]'
        }`}>
        <ViewerSidebar theme={theme} onToggleTheme={(t) => setTheme(t)} />
      </div>

      {/* 4. DYNAMIC MAIN VIEWPORT WITH STICKY HEADER SCROLL SUPPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative">
        {children}
      </div>
    </div>
  );
}
