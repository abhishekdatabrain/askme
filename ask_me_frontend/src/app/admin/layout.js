'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';
import AdminSidebar from '@/components/AdminSidebar';
import CreatorRegisterForm from '@/components/CreatorRegisterForm';
import { getAdminToken, getAdminUser, clearAdminSession, isTokenExpired, handleAdminTokenExpiration } from '@/utils/cookies';
import { ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [theme, setTheme] = useState('dark');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Exclude login page from admin layout
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_admin_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_admin_theme', nextTheme);
    }
  };

  // 1. Initial Page Load Check for Token Expiration & Auth
  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const token = getAdminToken();
    const userObj = getAdminUser();
    const userRole = (userObj?.role || '').toLowerCase();

    if (!token || !userObj || userRole !== 'admin' || isTokenExpired(token)) {
      clearAdminSession();
      setIsAuthorized(false);
      setLoading(false);
      window.location.href = '/admin/login';
    } else {
      setIsAuthorized(true);
      setLoading(false);
    }
  }, [pathname, isLoginPage]);

  // 2. Global Fetch Interceptor for Admin API calls (Tab clicks & actions)
  useEffect(() => {
    if (typeof window === 'undefined' || isLoginPage) return;

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);

      try {
        if (response.status === 401) {
          const clone = response.clone();
          const data = await clone.json().catch(() => ({}));
          const msg = data.message || 'Invalid or expired token. Please log in again.';
          handleAdminTokenExpiration(msg);
        } else if (response.ok || response.status === 200 || response.status === 400 || response.status === 403) {
          const clone = response.clone();
          const data = await clone.json().catch(() => ({}));
          if (data && (data.status === 'fail' || data.success === false)) {
            const msg = (data.message || '').toLowerCase();
            if (
              msg.includes('invalid or expired token') ||
              msg.includes('please log in again') ||
              msg.includes('authorization token is required') ||
              msg.includes('access token is required')
            ) {
              handleAdminTokenExpiration(data.message);
            }
          }
        }
      } catch (e) {}

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isLoginPage]);

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthorized(false);
    window.location.href = '/admin/login';
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-2xl animate-pulse glow-teal">
          a
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#8B8B96]">
          <ShieldCheck className="h-4 w-4 text-[#00F5D4] animate-spin" />
          <span>Verifying Admin Control Room Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'light' ? 'bg-[#F8F9FA] text-[#212529]' : 'bg-[#0A0A0F] text-[#F5F5F7]'
    }`}>
      {/* Top Navbar */}
      <AdminNavbar
        onOpenAuthModal={() => setShowAuthModal(true)}
        isLoggedIn={true}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1">
        {/* Left Control Room Sidebar */}
        <AdminSidebar
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Center Main Content Workspace */}
        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {showAuthModal && (
        <CreatorRegisterForm
          onClose={() => setShowAuthModal(false)}
          onComplete={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
