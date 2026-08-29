'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ViewerSidebar from '@/components/ViewerSidebar';
import SplashLoader from '@/components/SplashLoader';
import { API_ENDPOINTS } from '@/config/api';
import { getViewerToken, getCookie } from '@/utils/cookies';
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
            time: `${(idx + 1) * 2} mins ago`,
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
    return <SplashLoader message="Loading Live Broadcast Notifications..." />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#00F5D4] selection:text-[#0A0A0F] flex">
      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto shrink-0 z-30">
        <ViewerSidebar activeTab="notifications" />
      </div>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-40 bg-[#13131A]/95 backdrop-blur-md border-b border-[#1C1C26] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/viewers/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#8B8B96] hover:text-[#00F5D4] transition">
            <ArrowLeft className="h-4 w-4" /> Back to Public Live Feed
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-[#00F5D4]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#FF3D71] animate-ping" />
              )}
            </div>
            <h1 className="font-heading font-black text-sm text-white">
              Live Notifications
            </h1>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
          {/* HEADER TITLE & CONTROL BUTTONS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-2xl text-white">
                  Live Stream Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-xs font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8B8B96] mt-1">
                Real-time alerts when creators go live with interactive instant UPI payment & Q&A links.
              </p>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 rounded-xl bg-[#1C1C26] hover:bg-[#252533] text-[#00F5D4] text-xs font-bold transition flex items-center gap-1.5 border border-[#2A2A3A]"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark All as Read
                </button>
                <button
                  onClick={handleClearNotifications}
                  className="px-3 py-1.5 rounded-xl bg-[#1C1C26] hover:bg-[#FF3D71]/10 text-[#8B8B96] hover:text-[#FF3D71] text-xs font-bold transition flex items-center gap-1.5 border border-[#2A2A3A]"
                  title="Clear All Notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear All
                </button>
              </div>
            )}
          </div>

          {/* NOTIFICATION LIST */}
          {notifications.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#13131A] border border-[#1C1C26] text-center space-y-4 max-w-md mx-auto my-8">
              <BellOff className="h-12 w-12 text-[#8B8B96] mx-auto" />
              <h3 className="font-heading font-bold text-lg text-white">No Live Notifications</h3>
              <p className="text-xs text-[#8B8B96]">
                You are all caught up! When a creator starts a live broadcast session, real-time alerts will appear right here.
              </p>
              <Link
                href="/viewers/dashboard"
                className="px-5 py-2.5 rounded-xl bg-[#00F5D4] text-[#0A0A0F] text-xs font-bold shadow-md inline-block"
              >
                Browse Live Feed
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-5 rounded-3xl bg-[#13131A] border transition-all duration-200 shadow-2xl space-y-4 ${notif.isRead ? 'border-[#1C1C26] opacity-90' : 'border-[#FF3D71]/40 hover:border-[#FF3D71] glow-notif'
                    }`}
                >
                  {/* TOP NOTIFICATION HEADER */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF3D71] animate-ping" />
                        BROADCASTING LIVE
                      </span>
                      {notif.isFollowing && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-bold flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> Following
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8B8B96]">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" /> {notif.time}
                      </span>
                      <button
                        onClick={() => handleRemoveNotification(notif.id)}
                        className="text-[#666677] hover:text-[#FF3D71] transition ml-2 p-1"
                        title="Remove Notification"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* CREATOR & SESSION CONTENT ROW */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-[#1C1C26] py-3.5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={notif.avatar}
                          alt={notif.creatorName}
                          className="h-12 w-12 rounded-2xl object-cover border border-[#00F5D4]/40"
                        />
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#FF3D71] text-white text-[9px] font-black flex items-center justify-center border border-[#13131A]">
                          ▶
                        </span>
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-heading font-black text-base text-white truncate">
                          {notif.creatorName} <span className="text-xs text-[#8B8B96] font-mono font-normal">({notif.username})</span>
                        </h4>
                        <p className="text-xs text-[#00F5D4] font-bold truncate">
                          {notif.sessionTitle}
                        </p>
                        <span className="text-[10px] text-[#8B8B96] block">
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
                        className="px-3 py-2 rounded-xl bg-[#1C1C26] hover:bg-[#2A2A3A] text-white text-xs font-bold border border-[#2D2D3F] transition flex items-center gap-1.5"
                        title="Watch Live Stream"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-[#00F5D4]" /> Watch
                      </a>

                      {notif.sessionCode ? (
                        <Link
                          href={`/pay/${notif.sessionCode}`}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#FF7043] hover:to-[#FF8A65] text-white font-black text-xs transition flex items-center gap-1.5 shadow-lg glow-pay"
                        >
                          <MessageSquare className="h-3.5 w-3.5 fill-white" /> Join Q&A Stream
                        </Link>
                      ) : (
                        <Link
                          href={`/creator/${notif.username.replace(/^@+/, '')}`}
                          className="px-4 py-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] font-black text-xs transition flex items-center gap-1.5 shadow-lg"
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
    </div>
  );
}
