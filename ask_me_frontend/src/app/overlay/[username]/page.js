'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Radio, QrCode, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

import { getSocket } from '@/config/socket';

function StreamOverlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const usernameParam = params?.username || searchParams?.get('username') || searchParams?.get('creatorId') || 'creator';

  const [overlayData, setOverlayData] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [lastAlertId, setLastAlertId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverlayData = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.CREATORS.OVERLAY_DATA}/${usernameParam}`);
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.data) {
          setOverlayData(data.data);
        } else {
          // Fallback mock overlay data
          const payUrl = `${window.location.origin}/pay/demo-session?creatorId=1`;
          setOverlayData({
            creator: {
              fullName: 'Creator Host',
              username: '@creator',
            },
            paymentLink: payUrl,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payUrl)}`,
            supportText: 'Support Creator',
            scanText: 'Scan & Send Message',
          });
        }
      } catch (err) {
        console.warn('Overlay data fetch notice:', err.message);
        const payUrl = `${window.location.origin}/pay/demo-session?creatorId=1`;
        setOverlayData({
          creator: {
            fullName: 'Creator Host',
            username: '@creator',
          },
          paymentLink: payUrl,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payUrl)}`,
          supportText: 'Support Creator',
          scanText: 'Scan & Send Message',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverlayData();

    // Poll every 10 seconds to keep QR updated if session changes
    const interval = setInterval(fetchOverlayData, 10000);
    return () => clearInterval(interval);
  }, [usernameParam]);

  // Real-time Socket.IO listener for live overlay alert
  useEffect(() => {
    if (!overlayData?.creator?.id) return;
    try {
      const socket = getSocket();
      if (socket) {
        const creatorId = overlayData.creator.id;
        socket.emit('join_creator_room', { creatorId });

        const handleShowAlert = (alertData) => {
          if (alertData) {
            setLastAlertId(alertData.id);
            setActiveAlert(alertData);
          }
        };

        const handleClearAlert = () => {
          setActiveAlert(null);
        };

        socket.on('show_overlay_alert', handleShowAlert);
        socket.on(`overlay_alert_${creatorId}`, handleShowAlert);
        socket.on('clear_overlay_alert', handleClearAlert);
        socket.on(`clear_overlay_${creatorId}`, handleClearAlert);

        return () => {
          socket.off('show_overlay_alert', handleShowAlert);
          socket.off(`overlay_alert_${creatorId}`, handleShowAlert);
          socket.off('clear_overlay_alert', handleClearAlert);
          socket.off(`clear_overlay_${creatorId}`, handleClearAlert);
        };
      }
    } catch (e) { }
  }, [overlayData]);

  // Poll for live donation alerts & active featured questions
  useEffect(() => {
    if (!overlayData?.creator?.id) return;

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.CREATORS.OVERLAY_ALERTS}/${overlayData.creator.id}`);
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.data) {
          const activeItem = data.data.latestReadAlert;
          if (activeItem) {
            if (activeItem.id !== lastAlertId) {
              setLastAlertId(activeItem.id);
              setActiveAlert(activeItem);
            }
          } else {
            setActiveAlert(null);
          }
        }
      } catch (e) { }
    };

    fetchAlerts();
    const alertInterval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(alertInterval);
  }, [overlayData, lastAlertId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const creatorName = overlayData?.creator?.fullName || 'Creator';
  const qrUrl = overlayData?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=AskMePay`;

  return (
    <div className="min-h-screen bg-transparent p-4 font-sans select-none flex flex-col justify-between items-start pointer-events-none">

      {/* 1. CONTINUOUS LIVE SMALL QR WIDGET FOR OBS / STREAMLABS */}
      <div className="w-56 p-3.5 rounded-3xl bg-[#0A0A0F]/90 backdrop-blur-xl border-2 border-[#00F5D4]/40 shadow-2xl space-y-2.5 text-center text-white glow-teal pointer-events-auto animate-scale-up">

        {/* Support Creator Text Header */}
        <div className="flex items-center justify-between border-b border-[#1C1C26] pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="h-2 w-2 rounded-full bg-[#00E676] animate-pulse shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-white truncate">
              Support {creatorName}
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded-md bg-[#00F5D4]/10 text-[#00F5D4] text-[9px] font-black uppercase">
            LIVE
          </span>
        </div>

        {/* Small Size QR Code */}
        <div className="p-2 rounded-2xl bg-white shadow-inner flex items-center justify-center border border-[#00F5D4]/30">
          <img
            src={qrUrl}
            alt="Live Stream QR Code"
            className="h-28 w-28 object-contain"
          />
        </div>

        {/* Scan & Send Message Footer */}
        <div className="pt-0.5 space-y-0.5">
          <p className="text-[11px] font-black text-[#00F5D4] tracking-wide flex items-center justify-center gap-1">
            <Heart className="h-3 w-3 fill-current text-[#FF3D71]" /> Scan & Send Message
          </p>
          <p className="text-[9px] text-[#8B8B96] font-semibold">
            Instant UPI • Paid Q&A On Screen
          </p>
        </div>
      </div>

      {/* 2. REAL-TIME FEATURED QUESTION ON STREAM OVERLAY */}
      {activeAlert && (
        <div className="mt-4 max-w-md w-full p-4 rounded-3xl bg-[#0A0A0F]/95 backdrop-blur-xl border-2 border-[#00F5D4] text-white shadow-2xl space-y-2.5 animate-fadeIn glow-teal pointer-events-auto">
          <div className="flex items-center justify-between border-b border-[#1C1C26] pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-ping" />
                FEATURED QUESTION ON STREAM
              </span>
              {activeAlert.isVip && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFD60A] text-black text-[10px] font-black uppercase">
                  👑 VIP Member
                </span>
              )}
            </div>

            {/* <button
              onClick={() => setActiveAlert(null)}
              className="text-[#8B8B96] hover:text-white text-xs font-bold px-1"
              title="Hide Question Overlay"
            >
              ✕
            </button> */}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-2xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-heading font-black text-sm text-white truncate">
                  {activeAlert.viewerName}
                </h4>
                <span className="text-[10px] text-[#8B8B96] font-mono block">
                  Viewer Supporter
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-heading font-black text-base text-[#00E676] block">
                ₹{activeAlert.amount?.toFixed(2) || activeAlert.amount}
              </span>
              <span className="text-[9px] text-[#8B8B96] block uppercase tracking-wider font-bold">
                UPI Paid
              </span>
            </div>
          </div>

          {activeAlert.message && (
            <div className="pt-1">
              <span className="text-[10px] font-extrabold text-[#8B8B96] uppercase tracking-wider block mb-1">
                Viewer Question / Message:
              </span>
              <p className="p-3 rounded-2xl bg-[#13131A] text-[#00F5D4] text-xs italic font-semibold border border-[#252533]">
                "{activeAlert.message}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StreamOverlayWidgetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StreamOverlayContent />
    </Suspense>
  );
}
