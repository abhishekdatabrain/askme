import React, { useState } from 'react';
import {
  Tv,
  Radio,
  QrCode,
  Ban,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  DollarSign
} from 'lucide-react';
import PlatformIcon from './PlatformIcon';
import LiveBadge from './LiveBadge';

export default function LiveSessionManagement() {
  const [sessions, setSessions] = useState([
    {
      id: 'sess-801',
      creatorName: 'TechBurner Live',
      handle: '@techburner',
      platform: 'youtube',
      viewersCount: '18,400',
      activeDuration: '1h 45m',
      qrStatus: 'Active',
      donationsTotal: '₹1,24,500',
      questionsCount: 142,
      overlaySocket: 'wss://obs.askme.pro/live/tb-801',
      isSuspicious: false
    },
    {
      id: 'sess-802',
      creatorName: 'Rachana Ranade',
      handle: '@ca_rachana',
      platform: 'youtube',
      viewersCount: '12,100',
      activeDuration: '45m',
      qrStatus: 'Active',
      donationsTotal: '₹84,000',
      questionsCount: 98,
      overlaySocket: 'wss://obs.askme.pro/live/rr-802',
      isSuspicious: false
    },
    {
      id: 'sess-803',
      creatorName: 'GamerX Xtreme',
      handle: '@gamerx',
      platform: 'twitch',
      viewersCount: '6,400',
      activeDuration: '3h 10m',
      qrStatus: 'Flagged',
      donationsTotal: '₹12,400',
      questionsCount: 18,
      overlaySocket: 'wss://obs.askme.pro/live/gx-803',
      isSuspicious: true
    },
    {
      id: 'sess-804',
      creatorName: 'Sarah AI & Tech',
      handle: '@sarah_ai',
      platform: 'kick',
      viewersCount: '4,800',
      activeDuration: '2h 05m',
      qrStatus: 'Active',
      donationsTotal: '₹34,800',
      questionsCount: 52,
      overlaySocket: 'wss://obs.askme.pro/live/st-804',
      isSuspicious: false
    }
  ]);

  const toggleDisableQR = (id) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.qrStatus === 'Disabled' ? 'Active' : 'Disabled';
        return { ...s, qrStatus: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <Tv className="h-6 w-6 text-[#FF3D71]" />
            Live Session Management
          </h2>
          <p className="text-xs text-[#8B8B96] mt-1">
            Monitor active livestream broadcast sessions, generated OBS QR overlays, donation telemetry, and disable suspicious sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13131A] border border-[#1C1C26] text-xs">
          <Radio className="h-4 w-4 text-[#FF3D71] animate-pulse" />
          <span className="text-white font-bold">{sessions.filter(s => s.qrStatus === 'Active').length} Active Live Sessions</span>
        </div>
      </div>

      {/* Grid of Active Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`rounded-3xl bg-[#13131A] border p-6 space-y-4 shadow-xl relative overflow-hidden transition-all ${session.qrStatus === 'Disabled'
                ? 'border-[#FF5252]/40 opacity-75'
                : session.isSuspicious
                  ? 'border-[#FFD60A]/40'
                  : 'border-[#1C1C26]'
              }`}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LiveBadge />
                <PlatformIcon platform={session.platform} className="h-4 w-4" />
                <span className="text-xs font-mono text-[#8B8B96]">{session.handle}</span>
              </div>

              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${session.qrStatus === 'Active'
                  ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                  : session.qrStatus === 'Flagged'
                    ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                    : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
                }`}>
                QR Overlay: {session.qrStatus}
              </span>
            </div>

            {/* Main Info */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-white">{session.creatorName}</h3>
                <p className="text-xs text-[#8B8B96]">Duration:{session.activeDuration} • Viewers: {session.viewersCount}</p>
              </div>

              {/* Generated QR Mock Box */}
              <div className="p-2 rounded-2xl bg-white text-black text-center shrink-0 shadow-lg">
                <QrCode className="h-12 w-12" />
                <span className="text-[9px] font-black uppercase tracking-tighter block text-black">Scan To Ask</span>
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#0A0A0F] p-3 rounded-2xl border border-[#1C1C26]">
              <div>
                <span className="text-[#8B8B96] text-[10px] block">Donation Activity</span>
                <span className="text-[#FFD60A] font-bold font-mono text-sm">{session.donationsTotal}</span>
              </div>
              <div>
                <span className="text-[#8B8B96] text-[10px] block">Questions Answered</span>
                <span className="text-[#00F5D4] font-bold text-sm">{session.questionsCount} Paid Qs</span>
              </div>
            </div>

            {/* Socket Info & Disable Action Button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1C1C26]">
              <span className="text-[10px] font-mono text-[#8B8B96] truncate max-w-[220px]">
                {session.overlaySocket}
              </span>

              <button
                onClick={() => toggleDisableQR(session.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${session.qrStatus === 'Disabled'
                    ? 'bg-[#00E676] text-[#0A0A0F]'
                    : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30 hover:bg-[#FF5252] hover:text-white'
                  }`}
              >
                <Ban className="h-3.5 w-3.5" />
                <span>{session.qrStatus === 'Disabled' ? 'Re-enable QR' : 'Disable Suspicious QR'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
