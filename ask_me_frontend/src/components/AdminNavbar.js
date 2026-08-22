import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Bell, Shield, Zap, Radio, User, ChevronDown, Activity, Settings, LogIn, Sun, Moon, Check, CheckCheck, Sparkles, UserCheck, DollarSign, ExternalLink, X } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import { getSocket } from '@/config/socket';

export default function AdminNavbar({ activeView, setActiveView, onOpenAuthModal, isLoggedIn, onLogout, systemStatus = "OPERATIONAL", theme = 'dark', onToggleTheme }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpenNotifPopup, setIsOpenNotifPopup] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.ADMIN.NOTIFICATIONS, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        const notifs = data.data?.notifications || [];
        setNotifications(notifs);
      }
    } catch (err) {
      console.warn('Failed to fetch admin notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    if (socket) {
      const handleNewNotif = (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
      };
      socket.on('admin_notification', handleNewNotif);
      return () => {
        socket.off('admin_notification', handleNewNotif);
      };
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenNotifPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, status: 'read' })));
      const token = getAdminToken();
      await fetch(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS}/mark-read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}
  };

  const handleMarkSingleRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setNotifications(prev => prev.map(n => String(n.id) === String(id) ? { ...n, isRead: true, status: 'read' } : n));
      const token = getAdminToken();
      await fetch(`${API_ENDPOINTS.ADMIN.NOTIFICATIONS}/${id}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead && n.status !== 'read').length;

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md px-4 lg:px-8 py-3 transition-colors ${
      theme === 'light'
        ? 'bg-white/90 border-[#E9ECEF] text-[#212529]'
        : 'bg-[#0A0A0F]/90 border-[#1C1C26] text-[#F5F5F7]'
    }`}>
      <div className="flex items-center justify-between gap-4">
        {/* Brand Logo & Signal Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView && setActiveView('overview')}>
            <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-lg glow-teal">
              a
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`font-heading font-bold text-lg tracking-tight ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>AskMe</span>
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold tracking-widest uppercase rounded bg-brand-gradient text-[#0A0A0F]">
                  PRO
                </span>
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                Super Admin Control Room
              </span>
            </div>
          </div>

          {/* System Live Signal Telemetry Badge */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${
            theme === 'light' ? 'bg-[#F1F3F5] border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
            </span>
            <span className={theme === 'light' ? 'text-[#6C757D] font-medium' : 'text-[#8B8B96] font-medium'}>LIVE SIGNAL:</span>
            <span className="text-[#00E676] font-bold tracking-wide">{systemStatus}</span>
          </div>
        </div>

        {/* Command Palette Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`} />
            <input
              type="text"
              placeholder="Search creators, live streams, askMails, or transactions... (⌘K)"
              className={`w-full rounded-full border pl-9 pr-4 py-2 text-xs focus:border-[#00F5D4] focus:outline-none transition-all ${
                theme === 'light'
                  ? 'bg-[#F8F9FA] border-[#E9ECEF] text-[#212529] placeholder-[#6C757D]'
                  : 'bg-[#13131A] border-[#1C1C26] text-[#F5F5F7] placeholder-[#8B8B96]'
              }`}
            />
          </div>
        </div>

        {/* Right Section  Actions & Profile */}
        <div className="flex items-center gap-3">
          
          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className={`p-2.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 ${
              theme === 'light'
                ? 'bg-[#F1F3F5] text-[#212529] border-[#E9ECEF] hover:bg-[#E9ECEF]'
                : 'bg-[#13131A] text-[#FFD60A] border-[#1C1C26] hover:border-[#FFD60A]/40'
            }`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-[#FFD60A]" />
                <span className="hidden lg:inline text-[11px] text-[#F5F5F7]">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[#7B2FFF]" />
                <span className="hidden lg:inline text-[11px] text-[#212529]">Dark Mode</span>
              </>
            )}
          </button>

          {/* Login / Logout Controls */}
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-[#1C1C26] text-[#FF5252] border border-[#FF5252]/30 text-xs font-bold hover:bg-[#FF5252] hover:text-white transition-all flex items-center gap-1"
            >
              <LogIn className="h-3.5 w-3.5 rotate-180" />
              <span>Sign Out</span>
            </button>
          ) : (
            <p></p>
          )}

          {/* Notifications Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpenNotifPopup(!isOpenNotifPopup)}
              title="Notifications"
              className={`relative p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                isOpenNotifPopup
                  ? 'border-[#00F5D4] text-[#00F5D4] bg-[#00F5D4]/10'
                  : theme === 'light'
                  ? 'bg-[#F1F3F5] border-[#E9ECEF] text-[#495057] hover:text-[#00F5D4]'
                  : 'bg-[#13131A] border-[#1C1C26] text-[#8B8B96] hover:text-[#00F5D4] hover:border-[#00F5D4]/40'
              }`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3D71] text-[9px] font-bold text-white shadow-md animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popup Modal */}
            {isOpenNotifPopup && (
              <div className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-fade-in ${
                theme === 'light'
                  ? 'bg-white border-[#E9ECEF] text-[#212529]'
                  : 'bg-[#13131A] border-[#1C1C26] text-white'
              }`}>
                {/* Popup Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  theme === 'light' ? 'border-[#E9ECEF] bg-[#F8F9FA]' : 'border-[#1C1C26] bg-[#1A1A26]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#00F5D4]" />
                    <h3 className="text-sm font-bold tracking-tight">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#FF3D71]/20 text-[#FF3D71] border border-[#FF3D71]/30">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-[#00F5D4] hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Popup Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#1C1C26]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 text-[#8B8B96] mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold text-[#8B8B96]">No notifications found</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !notif.isRead && notif.status !== 'read';
                      const isCreatorReg = notif.type === 'creator_registration' || notif.title?.toLowerCase().includes('creator');

                      return (
                        <div
                          key={notif.id}
                          onClick={() => isUnread && handleMarkSingleRead(notif.id)}
                          className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                            isUnread
                              ? theme === 'light' ? 'bg-[#F1F3F5]/60' : 'bg-[#1A1A26]/80'
                              : 'hover:bg-[#1A1A26]/40'
                          }`}
                        >
                          {/* Icon Container */}
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isCreatorReg
                              ? 'bg-gradient-to-tr from-[#7B2FFF]/20 to-[#00F5D4]/20 border border-[#00F5D4]/40 text-[#00F5D4]'
                              : notif.type === 'kyc'
                              ? 'bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A]'
                              : notif.type === 'payout'
                              ? 'bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]'
                              : 'bg-[#1C1C26] border border-[#2C2C3E] text-[#8B8B96]'
                          }`}>
                            {isCreatorReg ? (
                              <Sparkles className="h-4 w-4" />
                            ) : notif.type === 'kyc' ? (
                              <UserCheck className="h-4 w-4" />
                            ) : notif.type === 'payout' ? (
                              <DollarSign className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className={`text-xs font-bold truncate ${
                                isUnread ? (theme === 'light' ? 'text-[#1A1D20]' : 'text-white') : 'text-[#8B8B96]'
                              }`}>
                                {notif.title}
                              </h4>
                              {isUnread && (
                                <span className="h-2 w-2 rounded-full bg-[#00F5D4] shrink-0 animate-pulse"></span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#8B8B96] mt-0.5 leading-snug line-clamp-2">
                              {notif.message}
                            </p>

                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[9px] font-medium text-[#8B8B96]/70">
                                {notif.time || 'Recently'}
                              </span>

                              {isCreatorReg && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
                                  New Creator
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Popup Footer */}
                <div className={`p-3 border-t text-center ${
                  theme === 'light' ? 'border-[#E9ECEF] bg-[#F8F9FA]' : 'border-[#1C1C26] bg-[#0A0A0F]'
                }`}>
                  <button
                    onClick={() => {
                      setIsOpenNotifPopup(false);
                      if (setActiveView) setActiveView('notifications');
                    }}
                    className="text-xs font-bold text-[#00F5D4] hover:underline flex items-center justify-center gap-1 w-full"
                  >
                    View All Notifications
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1C1C26]">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7B2FFF] to-[#00F5D4] p-0.5">
              <div className="h-full w-full rounded-full bg-[#0A0A0F] flex items-center justify-center text-xs font-bold text-[#00F5D4]">
                SA
              </div>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#F5F5F7]">Super Admin</span>
              <span className="text-[10px] text-[#00F5D4]">Futurepast Ventures</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#8B8B96]" />
          </div>
        </div>
      </div>
    </header>
  );
}

