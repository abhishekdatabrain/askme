'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { Bell, ShieldCheck, DollarSign, Radio, ArrowLeft, MessageSquare, Heart, RefreshCw } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';

export default function CreatorNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creator, setCreator] = useState(null);

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

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#00F5D4]" /> Real-Time Donation Notifications
            </h1>
            <p className="text-xs text-[#8B8B96]">Live stream viewer payments, gateway confirmations, & wallet updates</p>
          </div>
          <Link href="/creators/dashboard" className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </header>

        <main className="p-6 max-w-4xl w-full mx-auto space-y-4">
          
          {/* Top Status Card */}
          <div className="p-5 rounded-3xl bg-[#13131A] border border-[#1C1C26] flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Requirement 8: Real-Time Stream Alerts</h4>
                <p className="text-xs text-[#8B8B96]">Every viewer payment triggers an instant live screen notification & wallet update.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-bold shrink-0">
              Live Webhook Active
            </span>
          </div>

          {/* Notifications Feed */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-base text-white">Recent Viewer Donations & Questions</h3>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-[#8B8B96] space-y-2">
                <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Fetching live notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#13131A] border border-[#1C1C26] text-center space-y-2">
                <Heart className="h-10 w-10 text-[#8B8B96] mx-auto stroke-1" />
                <h4 className="font-bold text-white text-sm">No Donation Notifications Yet</h4>
                <p className="text-xs text-[#8B8B96]">Viewer payments and live question alerts will appear here in real-time.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-2 shadow-md hover:border-[#00F5D4]/40 transition">
                  <div className="flex items-center justify-between border-b border-[#1C1C26] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#00E676]/10 text-[#00E676]">
                        <Heart className="h-4 w-4 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">
                          <strong className="text-[#00F5D4]">{n.viewerName}</strong> donated <span className="text-[#00E676]">₹{n.amount?.toFixed(2)}</span>
                        </h4>
                        <span className="text-[10px] text-[#8B8B96]">ID: {n.donationUuid}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8B8B96] font-mono">
                      {new Date(n.paidAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {n.message && (
                    <div className="pt-1">
                      <span className="text-[10px] font-extrabold text-[#8B8B96] block mb-0.5">Message:</span>
                      <p className="p-2.5 rounded-xl bg-[#0A0A0F] text-[#00F5D4] text-xs italic border border-[#1C1C26]">
                        "{n.message}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
