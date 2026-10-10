'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ArrowRight,
  LogOut,
  Radio,
  Tv,
  Wallet,
  Sparkles,
  Users,
  MessageSquare,
  User
} from 'lucide-react';
import AuthModal from './AuthModal';
import {
  getViewerToken,
  getViewerUser,
  clearViewerSession,
  getCreatorToken,
  getCreatorUser,
  clearCreatorSession,
  isTokenExpired,
  getCookie,
  getCookieJson
} from '@/utils/cookies';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { getSocket } from '@/config/socket';
import { useToast } from '@/context/ToastContext';
import { requestViewerFcmToken } from '@/config/firebase';

export default function LandingNavbar() {
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth & User Profile state
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'viewer' | 'creator' | null
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('viewer');
  const [authMode, setAuthMode] = useState('login');

  const checkAuth = () => {
    // 1. Check Creator Session
    const creatorToken = getCreatorToken() || getCookie('askme_token') || (typeof window !== 'undefined' ? localStorage.getItem('askme_token') : null);
    const creatorUser = getCreatorUser() || getCookieJson('askme_user') || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('askme_user') || 'null') : null);

    if (creatorToken && !isTokenExpired(creatorToken)) {
      setCurrentUser(creatorUser || { fullName: 'Creator', role: 'creator' });
      setUserRole('creator');

      if (creatorUser?.id) {
        fetch(`${API_ENDPOINTS.CREATORS.KYC_STATUS}?creatorId=${creatorUser.id}`, {
          headers: { Authorization: `Bearer ${creatorToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data?.status === 'success' && data?.data?.kycStatus) {
              const liveKyc = data.data.kycStatus;
              setCurrentUser(prev => prev ? ({ ...prev, kycStatus: liveKyc, kyc_status: liveKyc }) : prev);
            }
          })
          .catch(() => {});
      }
      return;
    }

    // 2. Check Viewer Session
    const viewerToken = getViewerToken() || getCookie('askme_viewer_token') || (typeof window !== 'undefined' ? localStorage.getItem('askme_viewer_token') : null);
    const viewerUser = getViewerUser() || getCookieJson('askme_viewer_user') || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('askme_viewer_user') || 'null') : null);

    if (viewerToken && !isTokenExpired(viewerToken)) {
      setCurrentUser(viewerUser || { name: 'Viewer', role: 'viewer' });
      setUserRole('viewer');
      return;
    }

    setCurrentUser(null);
    setUserRole(null);
  };

  useEffect(() => {
    checkAuth();

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

    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open_askme_auth_modal', handleOpenAuthEvent);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen to real-time live broadcast alerts for logged-in Viewers
  useEffect(() => {
    if (userRole === 'viewer' && currentUser?.id) {
      const viewerToken = getViewerToken() || getCookie('askme_viewer_token');
      // 1. Register FCM Web Push token for this viewer device
      if (viewerToken) {
        requestViewerFcmToken(viewerToken, currentUser.id).catch(() => {});
      }

      // 2. Connect Socket and join viewer private room
      const socket = getSocket();
      if (socket) {
        socket.emit('join_user', { userId: currentUser.id });

        const handleLiveAlert = (data) => {
          if (!data) return;
          const creatorTitle = data.creatorName ? `🔴 ${data.creatorName} is NOW LIVE!` : (data.title || '🔴 Creator is NOW LIVE!');
          const streamMsg = data.message || (data.sessionTitle ? `"${data.sessionTitle}" has started! Join now.` : 'Live broadcast has started! Click to watch.');
          toast.info(streamMsg, creatorTitle);

          // Native browser push notification if permission is granted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const notif = new Notification(creatorTitle, {
                body: streamMsg,
                icon: '/favicon.ico',
              });
              notif.onclick = () => {
                window.focus();
                if (data.sessionCode) {
                  window.location.href = `/pay/${data.sessionCode}`;
                }
              };
            } catch (e) {}
          }
        };

        socket.on('notification', handleLiveAlert);
        socket.on('creator_live', handleLiveAlert);
        socket.on('creator_went_live', handleLiveAlert);

        return () => {
          socket.emit('leave_user', { userId: currentUser.id });
          socket.off('notification', handleLiveAlert);
          socket.off('creator_live', handleLiveAlert);
          socket.off('creator_went_live', handleLiveAlert);
        };
      }
    }
  }, [userRole, currentUser?.id]);

  const openAuth = (role = 'viewer', mode = 'login') => {
    setAuthRole(role);
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (userRole === 'creator') {
      clearCreatorSession();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('askme_token');
        localStorage.removeItem('askme_user');
      }
    } else {
      clearViewerSession();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('askme_viewer_token');
        localStorage.removeItem('askme_viewer_user');
      }
    }
    setCurrentUser(null);
    setUserRole(null);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  // Safe display information
  const displayName = userRole === 'creator'
    ? (currentUser?.fullName || currentUser?.full_name || currentUser?.name || currentUser?.username || 'Creator')
    : (currentUser?.name || currentUser?.username || currentUser?.email?.split('@')[0] || 'Viewer');

  const displaySub = userRole === 'creator'
    ? (currentUser?.username ? `@${currentUser.username.replace(/^@+/, '')}` : (currentUser?.email || 'Creator Account'))
    : (currentUser?.email || (currentUser?.phone ? `+91 ${currentUser.phone}` : 'Viewer Account'));

  const creatorKyc = String(currentUser?.kycStatus || currentUser?.kyc_status || 'not_submitted').toLowerCase();
  const creatorStatus = String(currentUser?.status || '').toLowerCase();
  const isCreatorActiveAndApproved = creatorKyc === 'approved' && creatorStatus === 'active';

  const dashboardUrl = userRole === 'creator'
    ? (isCreatorActiveAndApproved ? '/creators/dashboard' : '/creators/kyc')
    : '/viewers/dashboard';

  const rawAvatar = currentUser?.profileImage || currentUser?.profile_image;
  const userAvatar = rawAvatar ? getMediaUrl(rawAvatar) : null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen
          ? 'bg-[#07070C]/95 backdrop-blur-xl border-b border-[#1E1E2D]/80 py-2 px-2 sm:px-4 lg:px-6 shadow-2xl'
          : 'bg-transparent py-3 px-2 sm:px-4 lg:px-6'
          }`}
      >
        <div
          className={`max-w-7xl mx-auto transition-all duration-300 ${mobileMenuOpen
            ? 'bg-[#0D0D14] border border-[#222234] shadow-2xl py-3 px-4 sm:px-6 rounded-2xl sm:rounded-3xl'
            : scrolled
              ? 'bg-[#0D0D14] border border-[#222234] shadow-2xl py-2 px-4 sm:px-6 rounded-full'
              : 'bg-[#0F0F18]/90 backdrop-blur-md border border-[#202030] py-2 px-4 sm:px-6 shadow-xl rounded-full'
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
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="h-3.5 w-[1px] bg-[#222234]"></span>
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

              <Link href="/live-streams" className="hover:text-white transition-colors flex items-center gap-1.5 text-white">
                <span className="h-2 w-2 rounded-full bg-[#EB1000] animate-pulse"></span>
                Live Streams
              </Link>
              <span className="h-3.5 w-[1px] bg-[#222234]"></span>
              <Link href="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                About
              </Link>
              <span className="h-3.5 w-[1px] bg-[#222234]"></span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Help
              </Link>
            </nav>

            {/* Desktop Action Area: User Profile Dropdown OR Sign in / Get Started */}
            {currentUser ? (
              <div className="hidden sm:block relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 pl-2 pr-3.5 rounded-full bg-[#161622] hover:bg-[#1E1E2E] border border-[#26263A] transition-all cursor-pointer shadow-md group"
                >
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-sm overflow-hidden ${
                    userRole === 'creator'
                      ? 'bg-gradient-to-tr from-[#EB1000] to-[#FF4633]'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                  }`}>
                    {userAvatar ? (
                      <img src={userAvatar} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col text-left leading-tight min-w-0 max-w-[120px]">
                    <span className="text-xs font-bold text-white truncate">
                      {displayName}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                      userRole === 'creator' ? 'text-[#FF5A43]' : 'text-emerald-400'
                    }`}>
                      {userRole === 'creator' ? 'Creator' : 'Viewer'}
                    </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                    userDropdownOpen ? 'rotate-180 text-white' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[#0F0F18] border border-[#26263A] shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-2xl">
                    {/* User Header */}
                    <div className="p-3 rounded-xl bg-[#161624] border border-[#222234] mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-sm overflow-hidden ${
                          userRole === 'creator'
                            ? 'bg-gradient-to-tr from-[#EB1000] to-[#FF4633]'
                            : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                        }`}>
                          {userAvatar ? (
                            <img src={userAvatar} alt={displayName} className="h-full w-full object-cover" />
                          ) : (
                            <span>{displayName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{displayName}</h4>
                          <p className="text-[11px] text-gray-400 truncate">{displaySub}</p>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium">Account Role</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          userRole === 'creator'
                            ? 'bg-[#EB1000]/15 text-[#FF5A43] border-[#EB1000]/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {userRole === 'creator' ? 'Creator' : 'Viewer / Fan'}
                        </span>
                      </div>
                    </div>

                    {/* Primary Action Button: Go to Dashboard */}
                    <Link
                      href={dashboardUrl}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-xs font-bold shadow-md shadow-[#EB1000]/25 hover:opacity-95 transition-all mb-1.5 group"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Go to {userRole === 'creator' ? 'Creator' : 'Viewer'} Dashboard</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    {/* Role Specific Quick Links */}
                    {/* <div className="space-y-0.5 text-xs text-gray-300">
                      {userRole === 'creator' ? (
                        <>
                          <Link
                            href="/creators/live-sessions"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition"
                          >
                            <Radio className="h-3.5 w-3.5 text-rose-400" />
                            <span>Live Streams</span>
                          </Link>
                          <Link
                            href="/creators/overlay"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition"
                          >
                            <Tv className="h-3.5 w-3.5 text-purple-400" />
                            <span>OBS Overlay</span>
                          </Link>
                          <Link
                            href="/creators/wallet"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition"
                          >
                            <Wallet className="h-3.5 w-3.5 text-amber-400" />
                            <span>Wallet & Payouts</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          
                        
                        </>
                      )}
                    </div> */}

                    {/* Divider & Log Out */}
                    <div className="pt-1 mt-1 border-t border-[#222234]">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
            )}

            {/* Mobile Menu Toggle & Mobile Dashboard Button */}
            <div className="lg:hidden flex items-center gap-2">
              {currentUser ? (
                <Link
                  href={dashboardUrl}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-xs font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth('creator', 'register')}
                  className="px-3.5 py-1.5 rounded-full bg-[#EB1000] text-white text-xs font-bold sm:hidden cursor-pointer shadow-md"
                >
                  Get Started
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full bg-[#161622] text-white border border-[#262638] hover:bg-[#202030] transition cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 pb-3 border-t border-[#222234] space-y-1.5 text-xs font-semibold text-[#A0A0B2] animate-fadeIn">
              <Link href="/discover-creators" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-xl hover:bg-white/5 hover:text-white transition">
                Discover
              </Link>
              <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-xl hover:bg-white/5 hover:text-white transition">
                Categories
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-xl hover:bg-white/5 hover:text-white transition">
                How It Works
              </a>
              <a href="#for-creators" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-xl hover:bg-white/5 hover:text-white transition">
                For Creators
              </a>
              <Link href="/live-streams" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-xl text-white font-bold flex items-center gap-2 hover:bg-white/5 transition">
                <span className="h-2 w-2 rounded-full bg-[#EB1000] animate-pulse"></span>
                Live Streams
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-xl hover:bg-white/5 hover:text-white transition">
                Contact Us
              </Link>

              {/* Mobile Auth Actions: Logged In vs Logged Out */}
              {currentUser ? (
                <div className="pt-2 border-t border-[#222234] space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#161622] border border-[#262638] flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden ${
                        userRole === 'creator'
                          ? 'bg-gradient-to-tr from-[#EB1000] to-[#FF4633]'
                          : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                      }`}>
                        {userAvatar ? (
                          <img src={userAvatar} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{displayName}</span>
                        <span className={`text-[10px] font-black uppercase ${
                          userRole === 'creator' ? 'text-[#FF5A43]' : 'text-emerald-400'
                        }`}>
                          {userRole === 'creator' ? 'Creator Pro' : 'Viewer'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={dashboardUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-center text-white text-xs font-bold shadow-lg shadow-[#EB1000]/25 transition flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to {userRole === 'creator' ? 'Creator' : 'Viewer'} Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#222234] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openAuth('viewer', 'login')}
                    className="py-2.5 rounded-xl bg-[#161622] border border-[#262638] text-center text-white text-xs font-bold hover:bg-[#202030] transition cursor-pointer"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth('creator', 'register')}
                    className="py-2.5 rounded-xl bg-[#EB1000] hover:bg-[#CC0E00] text-center text-white text-xs font-bold shadow-lg shadow-[#EB1000]/25 transition cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* POPUP AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          checkAuth();
        }}
        onSuccess={() => {
          checkAuth();
        }}
        initialRole={authRole}
        initialMode={authMode}
      />
    </>
  );
}
