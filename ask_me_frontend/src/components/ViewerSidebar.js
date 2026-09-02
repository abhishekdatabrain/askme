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
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  History
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getViewerUser, clearViewerSession, removeCookie } from '@/utils/cookies';

function ViewerSidebarContent({ theme: propTheme, onToggleTheme, activeTab: currentTab, onSelectTab }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState(propTheme || 'dark');
  const [liveCount, setLiveCount] = useState(0);
  const [myQuestionsCount, setMyQuestionsCount] = useState(0);
  const [viewerUser, setViewerUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const user = getViewerUser();
      if (user) {
        setViewerUser(user);
      }
    } catch (e) { }
  }, []);

  const handleLogout = () => {
    // Clear viewer session only
    clearViewerSession();

    // Remove viewer cookies only
    removeCookie("askme_viewer_token");
    removeCookie("askme_viewer_user");

    if (typeof window !== "undefined") {
      // Remove viewer localStorage only
      localStorage.removeItem("askme_viewer_token");
      localStorage.removeItem("askme_viewer_user");
    }

    window.location.href = "/viewers/login";
  };

  // Sync theme
  useEffect(() => {
    if (propTheme) {
      setTheme(propTheme);
    } else {
      const saved = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
      setTheme(saved);
    }
  }, [propTheme]);

  // Fetch live count & my questions count
  useEffect(() => {
    fetch(`${API_ENDPOINTS.VIEWERS.PUBLIC_LIVE_FEED}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setLiveCount(data.data.activeLiveCount || 0);
        }
      })
      .catch(() => { });

    const u = getViewerUser();
    if (u) {
      fetch(`${API_ENDPOINTS.VIEWERS.MY_QUESTIONS}?userId=${u.id || ''}&email=${encodeURIComponent(u.email || '')}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && typeof data.data?.totalQuestions === 'number') {
            setMyQuestionsCount(data.data.totalQuestions);
          }
        })
        .catch(() => { });
    }
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
      id: 'my-questions',
      label: 'My Questions',
      icon: MessageSquare,
      badge: myQuestionsCount > 0 ? `(${myQuestionsCount})` : '(0)',
      badgeColor: 'bg-[#FF5500] text-white font-black',
      iconColor: 'text-[#FF5500]',
      href: '/viewers/my-questions',
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
      id: 'past-streams',
      label: 'Past Streams',
      icon: History,
      badge: null,
      iconColor: 'text-[#00F5D4]',
      href: '/viewers/past-streams',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: 'LIVE',
      badgeColor: 'bg-[#00F5D4] text-[#0A0A0F]',
      href: '/viewers/notifications',
    },
  ];

  const activeTab = currentTab || (
    pathname.includes('/viewers/past-streams') ? 'past-streams' :
      pathname.includes('/viewers/my-questions') ? 'my-questions' :
        pathname.includes('/viewers/live-sessions') ? 'live-sessions' :
          pathname.includes('/viewers/following') ? 'following' :
            pathname.includes('/viewers/memberships') ? 'memberships' :
              pathname.includes('/viewers/notifications') ? 'notifications' :
                (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null) || 'home'
  );

  const handleNavClick = (item) => {
    if (item.id === 'past-streams') {
      router.push('/viewers/past-streams');
      return;
    }
    if (item.id === 'my-questions') {
      router.push('/viewers/my-questions');
      return;
    }
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

    if (item.id === 'notifications') {
      router.push('/viewers/notifications');
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

  const renderSidebarContent = () => (
    <div className="flex flex-col justify-between h-full p-4 selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      <div className="space-y-6">
        {/* BRANDING HEADER */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 group">
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
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-xl text-[#8B8B96] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* VIEWER USER PROFILE SUMMARY PILL */}
        {viewerUser && (
          <div className={`p-3 rounded-2xl border flex items-center gap-3 ${theme === 'light' ? 'bg-[#F1F3F5] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
            }`}>
            <div className={`h-9 w-9 rounded-xl border overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm ${theme === 'light' ? 'bg-[#E9ECEF] border-[#DEE2E6] text-[#00F5D4]' : 'bg-[#1C1C26] border-[#252533] text-[#00F5D4]'
              }`}>
              {viewerUser.avatar || viewerUser.profileImage ? (
                <img src={viewerUser.avatar || viewerUser.profileImage} alt={viewerUser.fullName || viewerUser.name || 'Viewer'} className="h-full w-full object-cover" />
              ) : (
                (viewerUser.fullName || viewerUser.name || viewerUser.email || 'Viewer').charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className={`font-bold text-xs truncate ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                {viewerUser.fullName || viewerUser.name || 'Viewer'}
              </h4>
              <p className={`text-[10px] truncate ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                {viewerUser.email || viewerUser.username || 'Logged in'}
              </p>
            </div>
          </div>
        )}

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
                  onClick={() => {
                    handleNavClick(item);
                    setMobileOpen(false);
                  }}
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

      {/* FOOTER CONTROLS & THEME TOGGLE & SIGN OUT */}
      <div className="space-y-3 pt-4 border-t border-[#1C1C26]">
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

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className={`w-full py-2 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${theme === 'light'
            ? 'bg-[#FFF5F5] border-[#FFE3E3] text-[#E03131] hover:bg-[#FFE3E3]'
            : 'bg-[#FF3D71]/10 border-[#FF3D71]/20 text-[#FF3D71] hover:bg-[#FF3D71]/20 hover:border-[#FF3D71]/40'
            }`}
        >
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Header (< md) */}
      <div className={`md:hidden sticky top-0 z-40 w-full px-4 py-3 border-b flex items-center justify-between ${theme === 'light' ? 'bg-white/95 border-[#E9ECEF] text-[#1A1D20]' : 'bg-[#0A0A0F]/95 border-[#1C1C26] text-white'
        } backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded-xl border ${theme === 'light' ? 'bg-[#F1F3F5] border-[#E9ECEF] text-[#1A1D20]' : 'bg-[#13131A] border-[#1C1C26] text-white'
              }`}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-sm">
              a
            </div>
            <span className="font-heading font-black text-sm">
              AskMe <span className="text-brand-gradient">VIEWER</span>
            </span>
          </Link>
        </div>

        <button
          onClick={toggleThemeHandler}
          className={`p-2 rounded-xl border ${theme === 'light' ? 'bg-[#F1F3F5] border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2CBF]" />}
        </button>
      </div>

      {/* Mobile Slide-Out Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-fadeIn"
            onClick={() => setMobileOpen(false)}
          />
          <div className={`relative w-72 max-w-[80vw] h-full flex flex-col z-10 shadow-2xl transition-colors duration-200 ${theme === 'light' ? 'bg-white text-[#1A1D20]' : 'bg-[#13131A] text-white'
            }`}>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar (>= md) */}
      <aside
        className={`hidden md:flex w-64 shrink-0 min-h-screen border-r flex-col justify-between selection:bg-[#00F5D4] selection:text-[#0A0A0F] transition-colors duration-200 ${theme === 'light' ? 'bg-white border-[#E9ECEF] text-[#1A1D20]' : 'bg-[#13131A] border-[#1C1C26] text-[#F5F5F7]'
          }`}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}

export default function ViewerSidebar(props) {
  return (
    <Suspense fallback={<div className="w-64 shrink-0 min-h-screen bg-[#13131A] border-r border-[#1C1C26]"></div>}>
      <ViewerSidebarContent {...props} />
    </Suspense>
  );
}
