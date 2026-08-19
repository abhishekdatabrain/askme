import React, { useState, useEffect } from 'react';
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
  DollarSign,
  Eye
} from 'lucide-react';
import PlatformIcon from './PlatformIcon';
import LiveBadge from './LiveBadge';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { getAdminToken } from '@/utils/cookies';

export default function LiveSessionManagement({ activeSubTab }) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);

  const [filter, setFilter] = useState('Active');
  const [selectedQrModal, setSelectedQrModal] = useState(null);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const token = getAdminToken();
        const res = await fetch(API_ENDPOINTS.ADMIN.LIVE_SESSIONS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.sessions) {
          setSessions(data.data.sessions.map((s, idx) => ({
            id: s.id ? (s.id.toString().startsWith('SES') ? s.id : `SES-${s.id}`) : `SES-${idx + 900}`,
            creatorName: s.creator || '',
            handle: `@${(s.creator || '').toLowerCase().replace(/\s+/g, '')}`,
            platform: 'youtube',
            viewersCount: typeof s.viewers === 'number' ? s.viewers.toLocaleString() : (s.viewers || '14,200'),
            activeDuration: s.duration || '',
            qrStatus: s.qrStatus || '',
            donationsTotal: `₹${(s.totalDonations || 0).toLocaleString()}`,
            questionsCount: 120,
            overlaySocket: `wss://obs.askme.pro/live/${(s.id || 'sess').toString().toLowerCase()}`,
            qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(s.streamUrl || 'https://askme.pro')}`,
            isSuspicious: s.qrStatus === 'Suspended',
            sessionStatus: s.qrStatus || 'Active'
          })));
        }
      } catch (err) {
        console.warn('API fetch live sessions warning:', err.message);
      }
    };
    fetchLiveSessions();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'livesessions_active') {
      setFilter('Active');
    } else if (activeSubTab === 'livesessions_closed') {
      setFilter('Closed');
    } else if (activeSubTab === 'livesessions_suspended') {
      setFilter('Suspended');
    }
  }, [activeSubTab]);

  const toggleSuspendSession = async (id) => {
    const token = getAdminToken();
    const targetSession = sessions.find(s => s.id === id);
    try {
      await fetch(`${API_ENDPOINTS.ADMIN.LIVE_SESSIONS}/${id}/disable`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.warning(`Live stream broadcast status toggled in database for ${targetSession?.creatorName || id}!`, 'Live Session Updated');
    } catch (e) {
      toast.error('Failed to update live session status in database.', 'Database Error');
    }

    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.sessionStatus === 'Suspended' ? 'Active' : 'Suspended';
        return { ...s, sessionStatus: nextStatus, qrStatus: nextStatus };
      }
      return s;
    }));
  };

  const filteredSessions = sessions.filter(s => {
    if (filter === 'All') return true;
    return s.sessionStatus === filter;
  });

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tv className="h-5 w-5 text-[#00F5D4]" />
            Live Session Management & Stream QR Overlays
          </h2>
          <p className="text-xs text-[#8B8B96] mt-0.5">
            View active sessions, creator details, generated QR codes, donation activity, and disable suspicious sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['Active', 'Closed', 'Suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === status
                  ? 'bg-brand-gradient text-[#0A0A0F]'
                  : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
                }`}
            >
              {status} Sessions
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sessions with Generated QR Overlay Preview (Requirement #17) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className={`p-4 rounded-xl border transition-all ${session.sessionStatus === 'Suspended'
                ? 'bg-[#1A0A0F] border-[#FF3D71]/40'
                : 'bg-[#0A0A0F] border-[#1C1C26]'
              }`}
          >
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <PlatformIcon platform={session.platform} className="h-6 w-6" />
                <div>
                  <h4 className="font-bold text-white text-sm">{session.creatorName}</h4>
                  <span className="text-[10px] text-[#8B8B96]">{session.handle}</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${session.sessionStatus === 'Active' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' :
                  session.sessionStatus === 'Closed' ? 'bg-[#1C1C26] text-[#8B8B96]' :
                    'bg-[#FF3D71]/20 text-[#FF3D71] border border-[#FF3D71]/40'
                }`}>
                {session.sessionStatus}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-3">
              {/* Generated QR Code Preview matching requirement #17 */}
              <div className="p-2 bg-white rounded-xl shrink-0 cursor-pointer hover:scale-105 transition" onClick={() => setSelectedQrModal(session)}>
                <img src={session.qrImageUrl} alt="Stream QR" className="h-16 w-16 object-contain" />
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-[#13131A] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Viewers / Duration</span>
                  <span className="font-bold text-white">{session.viewersCount} ({session.activeDuration})</span>
                </div>
                <div className="p-2 rounded-lg bg-[#13131A] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Donation Activity</span>
                  <span className="font-bold text-[#00F5D4]">{session.questionsCount} Qs ({session.donationsTotal})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs border-t border-[#1C1C26]">
              <span className="text-[10px] text-[#8B8B96] font-mono truncate max-w-[180px]">
                {session.overlaySocket}
              </span>
              <button
                onClick={() => toggleSuspendSession(session.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${session.sessionStatus === 'Suspended'
                    ? 'bg-[#00E676] text-[#0A0A0F]'
                    : 'bg-[#FF3D71]/10 text-[#FF3D71] hover:bg-[#FF3D71]/20 border border-[#FF3D71]/30'
                  }`}
              >
                <Ban className="h-3.5 w-3.5" />
                {session.sessionStatus === 'Suspended' ? 'Enable Session' : 'Disable Suspicious Session'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enlarged Stream QR Code Modal */}
      {selectedQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-2xl w-full max-w-xs p-6 space-y-4 text-center animate-scale-up">
            <h3 className="font-bold text-white text-base">Generated Stream QR Overlay</h3>
            <p className="text-xs text-[#8B8B96]">{selectedQrModal.creatorName} ({selectedQrModal.handle})</p>
            <div className="p-4 bg-white rounded-2xl inline-block mx-auto">
              <img src={selectedQrModal.qrImageUrl} alt="QR Overlay" className="h-40 w-40 object-contain mx-auto" />
            </div>
            <button
              onClick={() => setSelectedQrModal(null)}
              className="w-full py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs"
            >
              Close QR View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
