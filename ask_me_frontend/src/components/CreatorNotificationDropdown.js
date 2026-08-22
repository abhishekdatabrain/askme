'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  ShieldCheck,
  DollarSign,
  ArrowUpRight,
  XCircle,
  Sparkles,
  Check,
  RefreshCw,
  X,
  Heart,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import { getSocket } from '@/config/socket';

export default function CreatorNotificationDropdown({ theme = 'dark' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('All'); // 'All' | 'kyc' | 'payment' | 'withdrawal' | 'system'
  const dropdownRef = useRef(null);
  const [creatorUser, setCreatorUser] = useState(null);

  const fetchNotifications = async () => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!u || !u.id) return;
    setCreatorUser(u);

    try {
      setIsLoading(true);
      const res = await fetch(`${API_ENDPOINTS.CREATORS.NOTIFICATIONS}?creatorId=${u.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.notifications) {
        setNotifications(data.data.notifications);
      }
    } catch (err) {
      console.warn('Dropdown notification fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const u = getCreatorUser();
    if (!u || !u.id) return;

    // Listen to real-time Socket.IO notifications
    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
      };

      socket.on(`creator_notification_${u.id}`, handleNewNotification);
      socket.on('creator_notification', handleNewNotification);

      return () => {
        socket.off(`creator_notification_${u.id}`, handleNewNotification);
        socket.off('creator_notification', handleNewNotification);
      };
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    const token = getCreatorToken();
    const creatorId = creatorUser?.id || 1;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      await fetch(API_ENDPOINTS.CREATORS.NOTIFICATIONS + '/mark-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ creatorId })
      });
    } catch (e) { }
  };

  const markSingleRead = async (id) => {
    const token = getCreatorToken();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

    try {
      await fetch(`${API_ENDPOINTS.CREATORS.NOTIFICATIONS}/${id}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) { }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'kyc') return n.type === 'kyc_approved' || n.type === 'kyc_rejected';
    if (filter === 'payment') return n.type === 'payment_received';
    if (filter === 'withdrawal') return n.type === 'withdrawal_approved' || n.type === 'withdrawal_rejected';
    if (filter === 'system') return n.type === 'system_update';
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications & Alerts Popup"
        className={`p-2 rounded-xl border transition-all flex items-center justify-center relative ${
          isOpen
            ? 'border-[#00F5D4] bg-[#00F5D4]/10 text-[#00F5D4] glow-teal'
            : theme === 'light'
              ? 'bg-[#F1F3F5] border-[#E9ECEF] text-[#00B49F] hover:bg-[#E9ECEF]'
              : 'bg-[#1C1C26] border-[#1C1C26] text-[#00F5D4] hover:border-[#00F5D4]/40 hover:bg-[#252533]'
        }`}
      >
        <Bell className="h-5 w-5 text-[#00F5D4]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#00E676] text-[#0A0A0F] text-[9px] font-black flex items-center justify-center border border-[#0A0A0F] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notifications Popup Modal */}
      {isOpen && (
        <div className={`absolute right-0 mt-2.5 w-80 sm:w-96 rounded-3xl border shadow-2xl z-50 overflow-hidden animate-scale-up ${
          theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            theme === 'light' ? 'border-[#E9ECEF] bg-[#F8F9FA]' : 'border-[#1C1C26] bg-[#0A0A0F]'
          }`}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#00F5D4]" />
              <h3 className={`font-heading font-black text-sm ${
                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40 text-[10px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-[#00F5D4] hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg ${
                  theme === 'light' ? 'text-[#6C757D] hover:bg-[#E9ECEF]' : 'text-[#8B8B96] hover:bg-[#1C1C26]'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className={`px-3 py-2 border-b flex items-center gap-1 overflow-x-auto text-[11px] font-bold ${
            theme === 'light' ? 'border-[#E9ECEF] bg-[#F8F9FA]' : 'border-[#1C1C26] bg-[#0A0A0F]/60'
          }`}>
            {['All', 'kyc', 'payment', 'withdrawal', 'system'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg capitalize transition whitespace-nowrap ${
                  filter === f
                    ? 'bg-[#00F5D4] text-[#0A0A0F] font-black'
                    : theme === 'light'
                      ? 'text-[#6C757D] hover:text-[#1A1D20]'
                      : 'text-[#8B8B96] hover:text-white'
                }`}
              >
                {f === 'kyc' ? 'KYC' : f === 'payment' ? 'Payments' : f === 'withdrawal' ? 'Payouts' : f === 'system' ? 'Updates' : 'All'}
              </button>
            ))}
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#1C1C26]/40 p-2 space-y-1.5">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#8B8B96] space-y-2">
                <div className="h-6 w-6 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading alerts...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="h-8 w-8 text-[#8B8B96] mx-auto stroke-1" />
                <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                  No notifications found
                </p>
              </div>
            ) : (
              filteredNotifications.map(n => {
                let IconComp = Bell;
                let iconColor = 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/30';

                if (n.type === 'kyc_approved') {
                  IconComp = ShieldCheck;
                  iconColor = 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30';
                } else if (n.type === 'kyc_rejected') {
                  IconComp = XCircle;
                  iconColor = 'text-[#FF3D71] bg-[#FF3D71]/10 border-[#FF3D71]/30';
                } else if (n.type === 'payment_received') {
                  IconComp = Heart;
                  iconColor = 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30';
                } else if (n.type === 'withdrawal_approved') {
                  IconComp = ArrowUpRight;
                  iconColor = 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30';
                } else if (n.type === 'withdrawal_rejected') {
                  IconComp = XCircle;
                  iconColor = 'text-[#FF3D71] bg-[#FF3D71]/10 border-[#FF3D71]/30';
                } else if (n.type === 'system_update') {
                  IconComp = Sparkles;
                  iconColor = 'text-[#7B2FFF] bg-[#7B2FFF]/10 border-[#7B2FFF]/30';
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => markSingleRead(n.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                      !n.isRead
                        ? theme === 'light'
                          ? 'bg-[#F0FDF4] border-[#00E676]/40'
                          : 'bg-[#1A1A26] border-[#00F5D4]/30'
                        : theme === 'light'
                          ? 'bg-white border-[#E9ECEF] hover:bg-[#F8F9FA]'
                          : 'bg-[#13131A] border-[#1C1C26] hover:bg-[#1C1C26]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border shrink-0 ${iconColor}`}>
                          <IconComp className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs line-clamp-1 ${
                            theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                          }`}>
                            {n.title}
                          </h4>
                          <span className={`text-[10px] font-mono ${
                            theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                          }`}>
                            {n.date ? new Date(n.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                          </span>
                        </div>
                      </div>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-[#00F5D4] shrink-0 mt-1" />
                      )}
                    </div>
                    <p className={`text-[11px] line-clamp-2 pl-7 ${
                      theme === 'light' ? 'text-[#495057]' : 'text-[#8B8B96]'
                    }`}>
                      {n.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
