'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ViewerSidebar from '@/components/ViewerSidebar';
import SplashLoader from '@/components/SplashLoader';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { getViewerToken, getCookie } from '@/utils/cookies';

const formatDateTime = (dateVal) => {
  if (!dateVal) {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return String(dateVal);
  }
};
import {
  Bell,
  Radio,
  ArrowLeft,
  MessageSquare,
  CheckCheck,
  Tv,
  Sparkles,
  ExternalLink,
  Clock,
  ShieldCheck,
  UserCheck,
  Trash2,
  BellOff
} from 'lucide-react';

export default function ViewerNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [followedSet, setFollowedSet] = useState(new Set());
  const [theme, setTheme] = useState('dark');

  // Theme Sync
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

  useEffect(() => {
    fetchNotificationsData();
  }, []);

  const fetchNotificationsData = async () => {
    try {
      setLoading(true);
      const token = getViewerToken() || getCookie('askme_viewer_token') || getCookie('askme_token');

      // 1. Fetch Followed Creators list if logged in
      let fSet = new Set();
      if (token) {
        try {
          const resFollowing = await fetch(API_ENDPOINTS.VIEWERS.FOLLOWING, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const dataFollowing = await resFollowing.json();
          if (resFollowing.ok && dataFollowing.followingIds) {
            fSet = new Set(dataFollowing.followingIds.map(String));
            setFollowedSet(fSet);
          }
        } catch (e) { }
      }

      // 2. Fetch Public Live Feed for live broadcasting creators
      const resFeed = await fetch(API_ENDPOINTS.VIEWERS.PUBLIC_LIVE_FEED);
      const dataFeed = await resFeed.json();

      let liveNotifications = [];

      if (resFeed.ok && dataFeed.status === 'success' && dataFeed.data?.creators) {
        const creators = dataFeed.data.creators;

        // Filter ONLY creators currently broadcasting live
        const liveCreators = creators.filter(c => c.isLive);

        liveNotifications = liveCreators.map((creator, idx) => {
          const isFollowing = fSet.has(String(creator.creatorId || creator.id));
          const startedAt = creator.session?.startedAt || creator.session?.started_at || creator.createdAt || creator.created_at;

          return {
            id: `notif_${creator.creatorId || idx}_${Date.now()}`,
            type: 'live_stream',
            creatorId: creator.creatorId || creator.id,
            creatorName: creator.fullName || creator.name || 'Verified Creator',
            username: creator.username || '@creator',
            avatar: creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            sessionTitle: creator.session?.title || 'Live Stream Q&A Session',
            sessionCode: creator.session?.sessionCode,
            streamUrl: creator.session?.streamUrl || creator.socialLinks?.[0]?.url || 'https://youtube.com',
            platform: creator.session?.platform || 'YouTube',
            category: creator.category || creator.session?.category || 'General Q&A',
            isFollowing,
            time: formatDateTime(startedAt),
            isRead: false,
          };
        });
      }

      setNotifications(liveNotifications);
    } catch (err) {
      console.warn('Notifications page fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleRemoveNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3 min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-[#EB1000] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#8B8B96]">Loading Live Broadcast Notifications...</p>
      </div>
    );
  }

  return (
    <>
      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className={`sticky top-0 z-30 shrink-0 backdrop-blur-md border-b px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-sm transition-colors ${
          theme === 'light' ? 'bg-white/95 border-[#E2E8F0]' : 'bg-[#0A0A0F]/95 border-[#1F1F30]'
        }`}>
          <Link href="/viewers/dashboard" className={`inline-flex items-center gap-2 text-xs font-bold transition ${
            theme === 'light' ? 'text-[#64748B] hover:text-[#EB1000]' : 'text-[#94A3B8] hover:text-[#EB1000]'
          }`}>
            <ArrowLeft className="h-4 w-4 text-[#EB1000]" /> Back to Public Live Feed
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-[#EB1000]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#EB1000] animate-ping" />
              )}
            </div>
            <h1 className={`font-heading font-black text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
              Live Notifications
            </h1>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
          {/* HEADER TITLE & CONTROL BUTTONS */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
            theme === 'light' ? 'border-[#E2E8F0]' : 'border-[#1F1F30]'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-heading font-black text-2xl ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                  Live Stream Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 text-xs font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${theme === 'light' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                Real-time alerts when creators go live with interactive instant UPI payment & Q&A links.
              </p>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleMarkAllRead}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    theme === 'light'
                      ? 'bg-[#F1F5F9] text-[#EB1000] border-[#E2E8F0] hover:bg-[#E2E8F0]'
                      : 'bg-[#14141F] hover:bg-[#1C1C28] text-[#EB1000] border-[#1F1F30]'
                  }`}
                >
                  <CheckCheck className="h-3.5 w-3.5 text-[#EB1000]" /> Mark All as Read
                </button>
                <button
                  onClick={handleClearNotifications}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    theme === 'light'
                      ? 'bg-[#F1F5F9] text-[#64748B] hover:text-[#EB1000] border-[#E2E8F0]'
                      : 'bg-[#14141F] hover:bg-[#EB1000]/10 text-[#94A3B8] hover:text-[#EB1000] border-[#1F1F30]'
                  }`}
                  title="Clear All Notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear All
                </button>
              </div>
            )}
          </div>

          {/* NOTIFICATION LIST */}
          {notifications.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center space-y-4 max-w-md mx-auto my-8 ${
              theme === 'light' ? 'bg-white border-[#E2E8F0]' : 'bg-[#12121C] border-[#1F1F30]'
            }`}>
              <BellOff className="h-12 w-12 text-[#8B8B96] mx-auto" />
              <h3 className={`font-heading font-bold text-lg ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>No Live Notifications</h3>
              <p className={`text-xs ${theme === 'light' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                You are all caught up! When a creator starts a live broadcast session, real-time alerts will appear right here.
              </p>
              <Link
                href="/viewers/dashboard"
                className="px-5 py-2.5 rounded-xl bg-[#EB1000] hover:bg-[#CC0E00] text-white text-xs font-bold shadow-md inline-block transition"
              >
                Browse Live Feed
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-5 rounded-3xl border transition-all duration-200 shadow-xl space-y-4 ${
                    theme === 'light' ? 'bg-white' : 'bg-[#12121C]'
                  } ${
                    notif.isRead
                      ? theme === 'light' ? 'border-[#E2E8F0] opacity-90' : 'border-[#1F1F30] opacity-90'
                      : 'border-[#EB1000]/40 hover:border-[#EB1000]'
                  }`}
                >
                  {/* TOP NOTIFICATION HEADER */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#EB1000] animate-ping" />
                        BROADCASTING LIVE
                      </span>
                      {notif.isFollowing && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-bold flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> Following
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center gap-2 text-xs ${theme === 'light' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3 text-[#EB1000]" /> {notif.time}
                      </span>
                      <button
                        onClick={() => handleRemoveNotification(notif.id)}
                        className="text-[#666677] hover:text-[#EB1000] transition ml-2 p-1"
                        title="Remove Notification"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* CREATOR & SESSION CONTENT ROW */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y py-3.5 ${
                    theme === 'light' ? 'border-[#E2E8F0]' : 'border-[#1F1F30]'
                  }`}>
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={getMediaUrl(notif.avatar)}
                          alt={notif.creatorName}
                          className="h-12 w-12 rounded-2xl object-cover border border-[#EB1000]/40"
                        />
                        <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#EB1000] text-white text-[9px] font-black flex items-center justify-center border ${
                          theme === 'light' ? 'border-white' : 'border-[#12121C]'
                        }`}>
                          ▶
                        </span>
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className={`font-heading font-black text-base truncate ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                          {notif.creatorName} <span className={`text-xs font-mono font-normal ${theme === 'light' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>({notif.username})</span>
                        </h4>
                        <p className="text-xs text-[#EB1000] font-bold truncate">
                          {notif.sessionTitle}
                        </p>
                        <span className={`text-[10px] block ${theme === 'light' ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                          Category: {notif.category} • Stream: {notif.platform}
                        </span>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <a
                        href={notif.streamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                          theme === 'light'
                            ? 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border-[#E2E8F0]'
                            : 'bg-[#14141F] hover:bg-[#1C1C28] text-white border-[#1F1F30]'
                        }`}
                        title="Watch Live Stream"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-[#EB1000]" /> Watch
                      </a>

                      {notif.sessionCode ? (
                        <Link
                          href={`/pay/${notif.sessionCode}`}
                          className="px-4 py-2 rounded-xl bg-[#EB1000] hover:bg-[#CC0E00] text-white font-black text-xs transition flex items-center gap-1.5 shadow-md"
                        >
                          <MessageSquare className="h-3.5 w-3.5 fill-white" /> Join Q&A Stream
                        </Link>
                      ) : (
                        <Link
                          href={`/creator/${notif.username.replace(/^@+/, '')}`}
                          className="px-4 py-2 rounded-xl bg-[#EB1000] hover:bg-[#CC0E00] text-white font-black text-xs transition flex items-center gap-1.5 shadow-md"
                        >
                          View Creator
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* CARD FOOTER */}

                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
