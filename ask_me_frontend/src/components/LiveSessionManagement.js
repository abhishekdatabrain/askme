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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab]);

  const fetchLiveSessions = async (statusParam = 'Active', pageParam = currentPage) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.LIVE_SESSIONS}?status=${statusParam}&page=${pageParam}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success' && data.data?.sessions) {
        setSessions(data.data.sessions.map((s, idx) => ({
          id: s.id ? (s.id.toString().startsWith('SES') ? s.id : `SES-${s.id}`) : `SES-${idx + 900}`,
          creatorName: s.creator || '',
          handle: s.handle || `@${(s.creator || '').toLowerCase().replace(/\s+/g, '')}`,
          platform: s.platform || '',
          viewersCount: typeof s.viewers === 'number' ? s.viewers.toLocaleString() : (s.viewers || '0'),
          activeDuration: s.duration || '',
          qrStatus: s.qrStatus || '',
          donationsTotal: `₹${(s.totalDonations || 0).toLocaleString()}`,
          questionsCount: s.questionsCount !== undefined ? s.questionsCount : 0,
          overlaySocket: s.overlayUrl || ``,
          qrImageUrl: s.qrImageUrl || ``,
          isSuspicious: s.qrStatus === 'Suspended',
          sessionStatus: s.qrStatus || 'Active',
          category: s.category || '',
        })));

        const pag = data.pagination || data.data?.pagination;
        if (pag) {
          setTotalPages(pag.totalPages || 1);
          setTotalCount(pag.totalCount || 0);
        } else {
          setTotalCount(data.totalCount || data.total || 0);
        }
      }
    } catch (err) {
      console.warn('API fetch live sessions warning:', err.message);
    }
  };

  useEffect(() => {
    let s = 'Active';
    if (activeSubTab === 'livesessions_closed') {
      s = 'Closed';
    } else if (activeSubTab === 'livesessions_suspended') {
      s = 'Suspended';
    } else if (activeSubTab === 'livesessions_active') {
      s = 'Active';
    }
    setFilter(s);
    fetchLiveSessions(s, currentPage);
  }, [activeSubTab, currentPage]);

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

  const filteredSessions = sessions;
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
                  <p className="text-[10px] text-[#8B8B96]">{session.category}</p>
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
                <div className="p-2.5 rounded-lg bg-[#13131A] border border-[#1C1C26]">
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

      {/* PAGINATION CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1C1C26] text-xs">
        <span className="text-[#8B8B96]">
          Showing <strong className="text-white">{sessions.length}</strong> of <strong className="text-[#00F5D4]">{totalCount}</strong> Live Sessions (Page {currentPage} of {totalPages})
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white border border-[#2A2A3A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252533] transition"
          >
            ← Previous
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] font-bold text-[#00F5D4]">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white border border-[#2A2A3A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#252533] transition"
          >
            Next →
          </button>
        </div>
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
