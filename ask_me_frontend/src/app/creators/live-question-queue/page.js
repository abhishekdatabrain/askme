'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import {
  Bell,
  ShieldCheck,
  DollarSign,
  Radio,
  ArrowLeft,
  Heart,
  RefreshCw,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Check,
  X,
  Tv,
  ShieldAlert,
  Volume2,
  Search
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import { getSocket } from '@/config/socket';
import { useToast } from '@/context/ToastContext';

export default function CreatorNotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [broadcastingId, setBroadcastingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme State
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
      setTheme(savedTheme);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('creator-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('creator-theme-changed', handleThemeChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_creator_theme', nextTheme);
      window.dispatchEvent(new Event('creator-theme-changed'));
    }
  };

  const [activeFilter, setActiveFilter] = useState('all');
  const [filterCounts, setFilterCounts] = useState({
    all: 0,
    superchat: 0,
    members: 0,
    answered: 0,
    rejected: 0,
  });

  const fetchNotifications = async (f = activeFilter, s = searchQuery) => {
    try {
      setIsLoading(true);
      const creatorId = creator?.id || getCreatorUser()?.id || 1;
      const searchParam = s && s.trim() ? `&search=${encodeURIComponent(s.trim())}` : '';
      const res = await fetch(`${API_ENDPOINTS.CREATORS.OVERLAY_ALERTS}/${creatorId}?filter=${f}${searchParam}`);
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data) {
        setNotifications(data.data.alerts || []);
        setActiveSession(data.data.activeSession || null);
        if (data.data.filterCounts) {
          setFilterCounts(data.data.filterCounts);
        }
      }
    } catch (err) {
      console.warn('Notifications fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }
    setCreator(u);
  }, []);

  useEffect(() => {
    if (creator?.id) {
      const timer = setTimeout(() => {
        fetchNotifications(activeFilter, searchQuery);
      }, 300);

      try {
        const socket = getSocket();
        if (socket) {
          socket.emit('join_creator_room', { creatorId: creator.id });
        }
      } catch (e) { }

      return () => clearTimeout(timer);
    }
  }, [activeFilter, searchQuery, creator]);

  // Action Handler 1: Tick Button -> Update DB status to 'read' & Remove from UI Row
  const handleMarkAnsweredAndRemoveRow = async (id, pos) => {
    if (pos !== 1) {
      toast.error('Only the current queue item (#1 in turn) can be answered!', 'Queue Restriction');
      return;
    }

    if (String(id) === broadcastingId) {
      setBroadcastingId(null);
      try {
        const socket = getSocket();
        if (socket && creator?.id) {
          socket.emit('clear_overlay_alert', { creatorId: creator.id });
        }
      } catch (e) { }
    }

    setNotifications(prev => prev.filter(item => String(item.id || item.donationUuid) !== String(id)));
    toast.success('Question marked as read & answered!', 'Answered');

    // Call Backend API to update donations table status to 'read'
    try {
      const token = getCreatorToken();
      await fetch(`${API_ENDPOINTS.CREATORS.DONATION_STATUS}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 'read' }),
      });
      fetchNotifications(activeFilter);
    } catch (e) {
      console.warn('Update donation status to read notice:', e.message);
    }

    // Socket.IO emission to update viewer queue positions in real-time
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('queue_item_completed', { donationId: id, status: 'read' });
      }
    } catch (e) { }
  };

  // Action Handler 2: Cross Button -> Update DB status to 'cancelled' & Remove from UI Row
  const handleRejectAndRemoveRow = async (id, pos) => {
    if (pos !== 1) {
      toast.error('Only the current queue item (#1 in turn) can be cancelled!', 'Queue Restriction');
      return;
    }

    if (String(id) === broadcastingId) {
      setBroadcastingId(null);
      try {
        const socket = getSocket();
        if (socket && creator?.id) {
          socket.emit('clear_overlay_alert', { creatorId: creator.id });
        }
      } catch (e) { }
    }

    setNotifications(prev => prev.filter(item => String(item.id || item.donationUuid) !== String(id)));
    toast.error('Question cancelled!', 'Cancelled');

    // Call Backend API to update donations table status to 'cancelled'
    try {
      const token = getCreatorToken();
      await fetch(`${API_ENDPOINTS.CREATORS.DONATION_STATUS}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      fetchNotifications(activeFilter);
    } catch (e) {
      console.warn('Update donation status to cancelled notice:', e.message);
    }

    // Socket.IO emission to update viewer queue positions in real-time
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('queue_item_completed', { donationId: id, status: 'cancelled' });
      }
    } catch (e) { }
  };

  // Action Handler 3: Broadcast / Remove from Stream Overlay (Without marking question as Answered)
  const handleToggleBroadcast = async (item, enable) => {
    const itemKey = String(item.id || item.donationUuid);

    if (enable) {
      setBroadcastingId(itemKey);
      toast.success('Question broadcasted to stream overlay!', 'Broadcast Active');

      try {
        const socket = getSocket();
        if (socket && creator?.id) {
          socket.emit('show_overlay_alert', {
            id: item.id || item.donationUuid,
            donationUuid: item.donationUuid,
            viewerName: item.viewerName,
            amount: item.amount,
            message: item.message,
            paidAt: item.paidAt,
            isVip: !!item.isVip,
            creatorId: creator.id,
          });
        }
      } catch (e) { }
    } else {
      setBroadcastingId(null);
      toast.info('Question removed from stream overlay', 'Overlay Cleared');

      try {
        const socket = getSocket();
        if (socket && creator?.id) {
          socket.emit('clear_overlay_alert', { creatorId: creator.id });
        }
      } catch (e) { }
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`border-b sticky top-0 z-30 shrink-0 px-6 py-4 flex items-center justify-between transition-colors duration-200 ${theme === 'light' ? 'border-[#E9ECEF] bg-white/95 backdrop-blur-md shadow-sm' : 'border-[#1C1C26] bg-[#0A0A0F]/95 backdrop-blur-md shadow-sm'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
              <Bell className="h-5 w-5 text-[#EB1000]" /> Real-Time Live Question Queue
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>Strict FIFO Queue: Creator can only approve or reject the current turn (#1 in queue).</p>
          </div>


        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          <div className="w-full space-y-4">

            {/* Active Live Session Info Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
              }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl border bg-[#EB1000]/10 border-[#EB1000]/30 text-[#EB1000]">
                  <Radio className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider block text-[#8B8B96]">
                    CURRENT BROADCAST SESSION
                  </span>
                  <h3 className={`text-sm font-extrabold flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    {activeSession ? (
                      <>
                        <span>{activeSession.title}</span>
                      </>
                    ) : (
                      <span className="text-[#8B8B96]">No Active Broadcast Session Currently Running</span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-black">
                  {notifications.length} Active Queue Item(s)
                </span>
              </div>
            </div>

            {/* DYNAMIC FILTER TABS BAR & VIEWER SEARCH BAR */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className={`p-2 rounded-2xl border flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                {[
                  { id: 'all', label: 'All', icon: null },
                  { id: 'superchat', label: 'Superchat', icon: '💬' },
                  { id: 'members', label: 'Members', icon: '👑' },
                  { id: 'answered', label: 'Answered', icon: null },
                  { id: 'rejected', label: 'Rejected', icon: null },
                ].map(tab => {
                  const count = filterCounts[tab.id] !== undefined ? filterCounts[tab.id] : 0;
                  const isActive = activeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${isActive
                        ? 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white shadow-md shadow-[#EB1000]/30'
                        : theme === 'light'
                          ? 'bg-[#F8F9FA] text-[#495057] border border-[#DEE2E6] hover:bg-[#E9ECEF]'
                          : 'bg-[#1C1C26] text-[#8B8B96] border border-[#2A2A3A] hover:text-white'
                        }`}
                    >
                      {tab.icon && <span>{tab.icon}</span>}
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-black/30 text-white' : 'bg-black/40 text-white/80'
                        }`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* SEARCH BAR BY VIEWER NAME */}
              <div className="relative min-w-[240px] md:w-72">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`} />
                <input
                  type="text"
                  placeholder="Search viewer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-9 py-2 rounded-2xl text-xs font-semibold focus:outline-none transition border ${theme === 'light'
                    ? 'bg-white border-[#E9ECEF] text-[#1A1D20] placeholder-[#6C757D] focus:border-[#EB1000]'
                    : 'bg-[#13131A] border-[#1C1C26] text-white placeholder-[#8B8B96] focus:border-[#EB1000]'
                    }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B96] hover:text-white transition p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <h3 className={`font-heading font-bold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
              <Heart className="h-4 w-4 text-[#EB1000]" /> Recent Viewer Paid & Questions
            </h3>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                <div className="h-8 w-8 border-2 border-[#EB1000] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Fetching live notifications...</p>
              </div>
            ) : !activeSession ? (
              <div className={`p-10 rounded-2xl border text-center space-y-4 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                <div className="w-16 h-16 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 flex items-center justify-center mx-auto text-[#EB1000]">
                  <Radio className="h-8 w-8 animate-pulse" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h4 className={`font-black text-base ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    Broadcast Offline — No Active Live Session
                  </h4>

                </div>
                <div>
                  <Link
                    href="/creators/start-live"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:opacity-95 text-white text-xs font-black transition-all shadow-lg shadow-[#EB1000]/30"
                  >
                    <Radio className="h-4 w-4" />
                    <span>Start Live Session</span>
                  </Link>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              searchQuery.trim() ? (
                <div className={`p-8 rounded-2xl border text-center space-y-3 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                  <Search className="h-8 w-8 text-[#8B8B96] mx-auto opacity-60" />
                  <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    No Viewer Found Matching "{searchQuery}"
                  </h4>
                  <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                    Try searching with a different viewer name or keyword.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#EB1000] text-xs font-bold hover:bg-[#EB1000]/20 transition"
                  >
                    Clear Search Filter
                  </button>
                </div>
              ) : (
                <div className={`p-8 rounded-2xl border text-center space-y-2 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
                  <Sparkles className="h-10 w-10 text-[#EB1000] mx-auto stroke-1" />
                  <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                    All Queue Questions Answered! 🎉
                  </h4>
                  <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                    Database records are saved safely. New viewer donations will arrive here in real-time.
                  </p>
                </div>
              )
            ) : (
              [...notifications]
                .sort((a, b) => {
                  const aVip = a.isVip ? 1 : 0;
                  const bVip = b.isVip ? 1 : 0;
                  if (bVip !== aVip) return bVip - aVip;
                  return new Date(a.paidAt || 0) - new Date(b.paidAt || 0);
                })
                .map((n, index) => {
                  const itemKey = String(n.id || n.donationUuid);
                  const queuePos = index + 1;
                  const isPendingOrActive = activeFilter !== 'rejected' && activeFilter !== 'answered' && n.status !== 'read' && n.status !== 'answered' && n.status !== 'cancelled' && n.status !== 'rejected';
                  const isCurrentTurn = isPendingOrActive && queuePos === 1;
                  const isVipQuestion = !!n.isVip;

                  return (
                    <div
                      key={itemKey}
                      className={`p-4 rounded-2xl border space-y-3 shadow-md transition-all ${isVipQuestion
                        ? 'bg-[#1C1805] border-2 border-[#FFD60A]/80 shadow-xl'
                        : isCurrentTurn
                          ? theme === 'light'
                            ? 'bg-[#FFF5F5] border-2 border-[#EB1000]/60 shadow-lg shadow-[#EB1000]/10'
                            : 'bg-[#1A0B0D] border-2 border-[#EB1000]/60 shadow-lg shadow-[#EB1000]/20'
                          : theme === 'light'
                            ? 'bg-white border-[#E9ECEF]'
                            : 'bg-[#13131A] border-[#1C1C26]'
                        }`}
                    >
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                        }`}>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Queue Position Badge */}
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 ${isCurrentTurn
                            ? 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white shadow-md shadow-[#EB1000]/30'
                            : 'bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30'
                            }`}>
                            #{queuePos} {isCurrentTurn ? 'CURRENT TURN' : ''}
                          </span>

                          <div className="p-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30">
                            <Heart className="h-4 w-4 fill-current" />
                          </div>
                          <div>
                            <h4 className={`font-bold text-xs ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                              }`}>
                              <strong className={theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}>{n.viewerName}</strong> paid <span className="text-[#EB1000] font-black text-sm">₹{n.amount?.toFixed(2)}</span>
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono mr-1 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                            {n.paidAt && !isNaN(new Date(n.paidAt).getTime())
                              ? new Date(n.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                              : 'Just now'}
                          </span>

                          {/* VIP Member Priority Question Badge */}
                          {isVipQuestion && (
                            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#FFD60A] to-[#FF9500] text-black text-xs font-black flex items-center gap-1 shadow-md animate-pulse">
                              👑 VIP Question
                            </span>
                          )}

                          {/* Waiting in Queue Badge for non-#1 items */}
                          {!isCurrentTurn && isPendingOrActive && (
                            <span className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${theme === 'light'
                              ? 'bg-[#F8F9FA] border-[#E9ECEF] text-[#6C757D]'
                              : 'bg-[#1C1C26] border-[#1C1C26] text-[#8B8B96]'
                              }`}>
                              <Clock className="h-3.5 w-3.5 text-[#FFD60A]" />
                              <span>Waiting Turn</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {n.message && (
                        <div className="pt-1">
                          <span className={`text-[10px] font-extrabold block mb-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                            }`}>Viewer Question / Message:</span>
                          <p className={`p-2.5 rounded-xl text-xs italic border ${theme === 'light'
                            ? 'bg-[#F8F9FA] border-[#E9ECEF] text-[#1A1D20]'
                            : 'bg-[#0A0A0F] text-[#E4E4E7] border-[#1C1C26]'
                            }`}>
                            "{n.message}"
                          </p>
                        </div>
                      )}

                      {/* ACTION BUTTONS BAR */}
                      {isCurrentTurn && (
                        <div className="pt-3 border-t border-[#1C1C26]/80 flex flex-wrap items-center justify-end gap-2.5">
                          {/* 1. Broadcast to Stream Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleBroadcast(n, broadcastingId !== itemKey)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 border ${broadcastingId === itemKey
                              ? 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white border-[#EB1000] shadow-[#EB1000]/30 animate-pulse'
                              : theme === 'light'
                                ? 'bg-[#F1F3F5] text-[#212529] border-[#DEE2E6] hover:bg-[#E9ECEF]'
                                : 'bg-[#1C1C26] text-white border-[#2A2A3A] hover:bg-[#252533]'
                              }`}
                          >
                            <Tv className="h-4 w-4 text-[#EB1000]" />
                            <span>{broadcastingId === itemKey ? 'Live on Stream (Stop)' : 'Broadcast to Stream'}</span>
                          </button>

                          {/* 2. Skip Question (Inappropriate) Button */}
                          <button
                            type="button"
                            onClick={() => handleRejectAndRemoveRow(itemKey, queuePos)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 border bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30 hover:bg-[#DC2626] hover:text-white cursor-pointer"
                          >
                            <ShieldAlert className="h-4 w-4" />
                            <span>Skip Question (Inappropriate)</span>
                          </button>

                          {/* 3. Answer Question (Auto-Broadcast) Button */}
                          <button
                            type="button"
                            onClick={() => handleMarkAnsweredAndRemoveRow(itemKey, queuePos)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:opacity-95 text-white text-xs font-black transition-all shadow-lg shadow-[#EB1000]/30 flex items-center gap-2 cursor-pointer"
                          >
                            <Volume2 className="h-4 w-4 text-white" />
                            <span>Answer Question (Auto-Broadcast)</span>
                          </button>
                        </div>
                      )}

                      {/* Accepted / Answered badge */}
                      {(n.status === 'read' || n.status === 'answered' || activeFilter === 'answered') && (
                        <div className="pt-2.5 border-t border-[#1C1C26]/60 flex justify-end">
                          <span className="px-3 py-1.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> Accepted & Answered
                          </span>
                        </div>
                      )}

                      {/* Skipped / Rejected badge */}
                      {(n.status === 'cancelled' || n.status === 'rejected' || activeFilter === 'rejected') && (
                        <div className="pt-2.5 border-t border-[#1C1C26]/60 flex justify-end">
                          <span className="px-3 py-1.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-xs font-bold flex items-center gap-1.5">
                            <XCircle className="h-4 w-4" /> Skipped / Rejected (Inappropriate)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </main>
      </div>
    </>
  );
}
