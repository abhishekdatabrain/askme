'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Home,
  Grid,
  Search,
  Users,
  Heart,
  Bell,
  LogOut,
  Radio,
  Sun,
  Moon,
  Sparkles,
  User,
  Tv,
  ChevronRight
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

function ViewerSidebarContent({ theme: propTheme, onToggleTheme, activeTab: currentTab, onSelectTab }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState(propTheme || 'dark');
  const [liveCount, setLiveCount] = useState(0);

  // Sync theme
  useEffect(() => {
    if (propTheme) {
      setTheme(propTheme);
    } else {
      const saved = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
      setTheme(saved);
    }
  }, [propTheme]);

  // Fetch live count
  useEffect(() => {
    fetch(`${API_ENDPOINTS.VIEWERS.PUBLIC_LIVE_FEED}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setLiveCount(data.data.activeLiveCount || 0);
        }
      })
      .catch(() => { });
  }, []);

  const toggleThemeHandler = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_viewer_theme', nextTheme);
      window.dispatchEvent(new Event('viewer-theme-changed'));
    }
    if (onToggleTheme) onToggleTheme(nextTheme);
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home / Live Feed',
      icon: Home,
      badge: null,
    },
    {
      id: 'live-sessions',
      label: 'Live Sessions',
      icon: Tv,
      badge: liveCount > 0 ? `${liveCount} LIVE` : null,
      badgeColor: 'bg-[#FF3D71] text-white animate-pulse',
      iconColor: 'text-[#FF3D71]',
      href: '/viewers/live-sessions',
    },

    {
      id: 'creators',
      label: 'Creator Profile',
      icon: Users,
      badge: null,
    },
    {
      id: 'following',
      label: 'Following',
      icon: Heart,
      badge: null,
      iconColor: 'text-[#FF3D71]',
      href: '/viewers/following',
    },
    {
      id: 'memberships',
      label: 'My Memberships',
      icon: Sparkles,
      badge: 'VIP',
      badgeColor: 'bg-[#FFD60A] text-[#0A0A0F] font-black',
      iconColor: 'text-[#FFD60A]',
      href: '/viewers/memberships',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: '3',
      badgeColor: 'bg-[#00F5D4] text-[#0A0A0F]',
    },
  ];

  const activeTab = currentTab || (
    pathname.includes('/viewers/live-sessions') ? 'live-sessions' : 
    pathname.includes('/viewers/following') ? 'following' : 
    pathname.includes('/viewers/memberships') ? 'memberships' : 
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null) || 'home'
  );

  const handleNavClick = (item) => {
    if (item.id === 'live-sessions') {
      router.push('/viewers/live-sessions');
      return;
    }

    if (item.id === 'following') {
      router.push('/viewers/following');
      return;
    }

    if (item.id === 'memberships') {
      router.push('/viewers/memberships');
      return;
    }

    if (onSelectTab && pathname === '/viewers/dashboard') {
      onSelectTab(item.id);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/viewers/dashboard?tab=${item.id}`);
      }
    } else {
      router.push(`/viewers/dashboard?tab=${item.id}`);
    }
  };

  return (
    <aside
      className={`w-64 shrink-0 min-h-screen border-r flex flex-col justify-between p-4 selection:bg-[#00F5D4] selection:text-[#0A0A0F] transition-colors duration-200 ${theme === 'light' ? 'bg-white border-[#E9ECEF] text-[#1A1D20]' : 'bg-[#13131A] border-[#1C1C26] text-[#F5F5F7]'
        }`}
    >
      <div className="space-y-6">
        {/* BRANDING HEADER */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-2xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-md glow-teal group-hover:scale-105 transition">
              a
            </div>
            <div>
              <span className={`font-heading font-black text-lg block leading-none ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                AskMe <span className="text-brand-gradient">VIEWER</span>
              </span>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest block mt-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#00F5D4]'}`}>
                Public Studio App
              </span>
            </div>
          </Link>
        </div>

        {/* BROADCAST LIVE STATUS CARD */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${liveCount > 0
            ? theme === 'light' ? 'bg-[#FF3D71]/5 border-[#FF3D71]/30' : 'bg-[#FF3D71]/10 border-[#FF3D71]/30'
            : theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
          }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${liveCount > 0 ? 'bg-[#FF3D71] text-white animate-bounce' : 'bg-[#1C1C26] text-[#8B8B96]'}`}>
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block text-[#8B8B96]">
                STREAM FEED
              </span>
              <span className={`text-xs font-extrabold block ${liveCount > 0 ? 'text-[#FF3D71]' : 'text-white'}`}>
                {liveCount > 0 ? `${liveCount} Streamers Live` : 'Offline Feed'}
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#8B8B96]">
            Viewer Navigation
          </p>
          <nav className="space-y-1 pt-1">
            {navItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${isActive
                      ? 'bg-brand-gradient text-[#0A0A0F] shadow-md glow-teal'
                      : theme === 'light'
                        ? 'text-[#495057] hover:bg-[#F1F3F5] hover:text-[#1A1D20]'
                        : 'text-[#8B8B96] hover:bg-[#1C1C26] hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`h-4 w-4 ${isActive ? 'text-[#0A0A0F]' : item.iconColor || (theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]')}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.badgeColor || 'bg-[#1C1C26] text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* FOOTER CONTROLS & THEME TOGGLE */}
      <div className="space-y-3 pt-4 border-t border-[#1C1C26]">
        {/* Creator Portal Quick Link */}
        <Link
          href="/creators/login"
          className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${theme === 'light'
              ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#212529] hover:bg-[#E9ECEF]'
              : 'bg-[#0A0A0F] border-[#1C1C26] text-white hover:border-[#00F5D4]/40'
            }`}
        >
          <span className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-[#00F5D4]" /> Switch to Creator Studio
          </span>
          <ChevronRight className="h-4 w-4 text-[#8B8B96]" />
        </Link>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleThemeHandler}
          className={`w-full py-2 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${theme === 'light'
              ? 'bg-[#F1F3F5] border-[#E9ECEF] text-[#212529]'
              : 'bg-[#1C1C26] border-[#1C1C26] text-[#8B8B96] hover:text-white'
            }`}
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2CBF]" />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0A0A0F]">
            {theme.toUpperCase()}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default function ViewerSidebar(props) {
  return (
    <Suspense fallback={<div className="w-64 shrink-0 min-h-screen bg-[#13131A] border-r border-[#1C1C26]"></div>}>
      <ViewerSidebarContent {...props} />
    </Suspense>
  );
}
