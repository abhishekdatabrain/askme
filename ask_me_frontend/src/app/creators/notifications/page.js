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
  X
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import { getSocket } from '@/config/socket';
import { useToast } from '@/context/ToastContext';

export default function CreatorNotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creator, setCreator] = useState(null);

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

  useEffect(() => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }

    setCreator(u);

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const creatorId = u?.id || 1;
        const res = await fetch(`${API_ENDPOINTS.CREATORS.OVERLAY_ALERTS}/${creatorId}`);
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.data?.alerts) {
          setNotifications(data.data.alerts);
        }
      } catch (err) {
        console.warn('Notifications fetch notice:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Action Handler 1: Tick Button -> Update DB status to 'read' & Remove from UI Row
  const handleMarkAnsweredAndRemoveRow = async (id, pos) => {
    if (pos !== 1) {
      toast.error('Only the current queue item (#1 in turn) can be answered!', 'Queue Restriction');
      return;
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

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
      }`}>
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors duration-200 ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
              <Bell className="h-5 w-5 text-[#00F5D4]" /> Real-Time Live Question Queue
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>Strict FIFO Queue: Creator can only approve or reject the current turn (#1 in queue).</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Header Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${theme === 'light'
                ? 'bg-[#F1F3F5] text-[#212529] border-[#E9ECEF] hover:bg-[#E9ECEF]'
                : 'bg-[#1C1C26] text-white border-[#1C1C26] hover:border-[#00F5D4]/40'
                }`}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-[#FFD60A]" />
                  <span className="hidden sm:inline">Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#7B2FFF]" />
                  <span className="hidden sm:inline">Dark Theme</span>
                </>
              )}
            </button>

            <Link href="/creators/dashboard" className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#1C1C26]/80'
              }`}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          <div className="w-full space-y-4">

            {/* Queue Counter Summary Bar */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
              }`}>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-extrabold uppercase">
                  ACTIVE QUEUE
                </span>
                <span className={`text-xs font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                  }`}>
                  {notifications.length} Pending Question(s)
                </span>
              </div>
              <p className={`text-xs text-right ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                }`}>
                Only current turn (#1) has active Tick/Cross buttons
              </p>
            </div>

            <h3 className={`font-heading font-bold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>
              <Heart className="h-4 w-4 text-[#00E676]" /> Recent Viewer Donations & Questions
            </h3>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Fetching live notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className={`p-8 rounded-2xl border text-center space-y-2 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                <Sparkles className="h-10 w-10 text-[#00F5D4] mx-auto stroke-1" />
                <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                  }`}>All Queue Questions Answered! 🎉</h4>
                <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                  }`}>Database records are saved safely. New viewer donations will arrive here in real-time.</p>
              </div>
            ) : (
              notifications.map((n, index) => {
                const itemKey = String(n.id || n.donationUuid);
                const queuePos = index + 1;
                const isCurrentTurn = queuePos === 1;

                return (
                  <div
                    key={itemKey}
                    className={`p-4 rounded-2xl border space-y-3 shadow-md transition-all ${isCurrentTurn
                      ? theme === 'light'
                        ? 'bg-[#F0FDF4] border-2 border-[#00E676]/60 shadow-lg glow-teal'
                        : 'bg-[#0E1A16] border-2 border-[#00E676]/60 shadow-lg glow-teal'
                      : theme === 'light'
                        ? 'bg-white border-[#E9ECEF]'
                        : 'bg-[#13131A] border-[#1C1C26]'
                      }`}
                  >
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                      }`}>
                      <div className="flex items-center gap-2.5">
                        {/* Queue Position Badge */}
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 ${isCurrentTurn
                          ? 'bg-[#00E676] text-[#0A0A0F] glow-teal'
                          : 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30'
                          }`}>
                          #{queuePos} {isCurrentTurn ? 'CURRENT TURN' : ''}
                        </span>

                        <div className="p-2 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                            }`}>
                            <strong className="text-[#00F5D4]">{n.viewerName}</strong> donated <span className="text-[#00E676] font-black text-sm">₹{n.amount?.toFixed(2)}</span>
                          </h4>
                          <span className={`text-[10px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                            }`}>ID: {n.donationUuid}</span>
                        </div>
                      </div>

                      {/* Right Action Bar: Timestamp, Tick (Answer) & Cross (Reject) Buttons for Current Turn Only */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono mr-1 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                          }`}>
                          {n.paidAt && !isNaN(new Date(n.paidAt).getTime())
                            ? new Date(n.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                            : 'Just now'}
                        </span>

                        {isCurrentTurn ? (
                          <>
                            {/* TICK BUTTON (Approve / Mark Answered & Remove Row) */}
                            <button
                              type="button"
                              onClick={() => handleMarkAnsweredAndRemoveRow(itemKey, queuePos)}
                              className="px-3 py-1.5 rounded-xl bg-[#00E676]/15 border border-[#00E676]/40 text-[#00E676] hover:bg-[#00E676] hover:text-[#0A0A0F] hover:scale-105 transition-all shadow-md glow-teal flex items-center gap-1.5"
                              title="Answer current turn question & remove from row"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {/* <span className="text-xs font-bold hidden sm:inline">Answered</span> */}
                            </button>

                            {/* CROSS BUTTON (Reject & Remove Row) */}
                            <button
                              type="button"
                              onClick={() => handleRejectAndRemoveRow(itemKey, queuePos)}
                              className="px-3 py-1.5 rounded-xl bg-[#FF3D71]/15 border border-[#FF3D71]/40 text-[#FF3D71] hover:bg-[#FF3D71] hover:text-white hover:scale-105 transition-all shadow-md glow-red flex items-center gap-1.5"
                              title="Reject current turn question & remove from row"
                            >
                              <XCircle className="h-4 w-4" />
                              {/* <span className="text-xs font-bold hidden sm:inline">Reject</span> */}
                            </button>
                          </>
                        ) : (
                          /* Waiting in Queue Badge for non-#1 items */
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
                          ? 'bg-[#F8F9FA] border-[#E9ECEF] text-[#00B49F]'
                          : 'bg-[#0A0A0F] text-[#00F5D4] border-[#1C1C26]'
                          }`}>
                          "{n.message}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
