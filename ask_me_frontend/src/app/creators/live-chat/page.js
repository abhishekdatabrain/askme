'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import {
  Radio,
  MessageSquare,
  DollarSign,
  Copy,
  ExternalLink,
  RefreshCw,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Bell
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import LiveChatBox from '@/components/LiveChatBox';

export default function CreatorLiveChatModulePage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

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

  const fetchSessions = async (uId, token) => {
    try {
      setIsLoading(true);
      const creatorId = uId || creator?.id || 1;
      const res = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${creatorId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.sessions) {
        const fetchedSessions = data.data.sessions;
        setSessions(fetchedSessions);

        // Filter ONLY active live sessions
        const activeSessions = fetchedSessions.filter(s => s.status === 'active');
        if (activeSessions.length > 0) {
          setSelectedSessionId(activeSessions[0].id);
        } else {
          setSelectedSessionId(null);
        }
      }
    } catch (err) {
      console.warn('Live chat sessions fetch notice:', err.message);
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
    fetchSessions(u?.id, token);
  }, []);

  // Filter ONLY active sessions for the Live Chat Panel
  const activeSessions = sessions.filter(s => s.status === 'active');
  const selectedSession = activeSessions.find(s => String(s.id) === String(selectedSessionId)) || activeSessions[0];

  const copyLink = (link) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success('Live Payment link copied to clipboard!', 'Copied');
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
    }`}>
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Module Header */}
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors duration-200 ${
          theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/90 backdrop-blur-md'
        }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${
              theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
            }`}>
              <MessageSquare className="h-5 w-5 text-[#00F5D4]" /> Live Chat Panel Module
            </h1>
            <p className={`text-xs ${
              theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
            }`}>Active live stream Socket.IO chat room, incoming viewer donations & creator replies</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Icon Popup Dropdown */}
            <CreatorNotificationDropdown theme={theme} />

            {/* Header Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                theme === 'light'
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

            {activeSessions.length > 0 ? (
              <span className="px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-extrabold flex items-center gap-1.5 animate-pulse">
                <Zap className="h-3.5 w-3.5" /> Socket Live Active ({activeSessions.length})
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 text-xs font-extrabold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Offline (No Active Broadcast)
              </span>
            )}

            <button
              onClick={() => fetchSessions(creator?.id, getCreatorToken())}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] hover:bg-[#252533] text-white'
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#00F5D4]" /> Refresh
            </button>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-8 w-8 border-4 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className={`text-xs font-bold uppercase tracking-wider ${
                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>Loading Live Chat Panel...</p>
            </div>
          ) : activeSessions.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center space-y-4 max-w-xl mx-auto shadow-xl my-8 ${
              theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
              <div className="p-4 rounded-2xl bg-[#FF3D71]/10 text-[#FF3D71] w-fit mx-auto border border-[#FF3D71]/30">
                <Radio className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className={`font-heading font-black text-xl ${
                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>No Active Live Session Found</h3>
              <p className={`text-xs ${
                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>
                You need an active broadcast session to open the live chat panel and receive instant viewer questions.
              </p>
              <div className="pt-2">
                <Link
                  href="/creators/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition inline-flex items-center gap-2"
                >
                  <Radio className="h-4 w-4" /> Go to Dashboard & Start Session
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: ACTIVE LIVE CHAT BOX (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Session Selector (If multiple active sessions) */}
                {activeSessions.length > 1 && (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                  }`}>
                    <span className={`text-xs font-bold ${
                      theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>Select Active Broadcast:</span>
                    <select
                      value={selectedSessionId || ''}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className={`text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#00F5D4] ${
                        theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                      }`}
                    >
                      {activeSessions.map(s => (
                        <option key={s.id} value={s.id}>{s.title} ({s.category})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Real-time Socket.IO Live Chat Box */}
                {selectedSession && (
                  <LiveChatBox
                    sessionId={selectedSession.id}
                    creatorId={creator?.id}
                    isCreatorHost={true}
                    creatorName={creator?.fullName || 'Host'}
                  />
                )}
              </div>

              {/* RIGHT COLUMN: SESSION OVERVIEW & QR LINKS */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Session Card Info */}
                <div className={`p-5 rounded-3xl border space-y-4 shadow-xl ${
                  theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-3 ${
                    theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                  }`}>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 animate-pulse">
                      ● LIVE SESSION ACTIVE
                    </span>
                    <span className={`text-xs ${
                      theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>ID #{selectedSession.id}</span>
                  </div>

                  <div>
                    <h4 className={`font-heading font-bold text-base ${
                      theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>{selectedSession.title}</h4>
                    <p className={`text-xs mt-0.5 ${
                      theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>{selectedSession.category || 'General Broadcast'}</p>
                  </div>

                  <div className={`grid grid-cols-2 gap-3 p-3 rounded-2xl border text-xs ${
                    theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}>
                    <div>
                      <span className={`text-[10px] block font-bold ${
                        theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>TOTAL DONATIONS</span>
                      <span className={`font-heading font-black text-sm ${
                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                      }`}>
                        {selectedSession.totalDonations || 0}
                      </span>
                    </div>
                    <div>
                      <span className={`text-[10px] block font-bold ${
                        theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>TOTAL COLLECTED</span>
                      <span className="font-heading font-black text-[#00E676] text-sm">
                        ₹{(selectedSession.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Stream QR Code */}
                <div className={`p-4 rounded-3xl border space-y-3 shadow-xl ${
                  theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                  <span className="text-[10px] font-extrabold text-[#00F5D4] uppercase tracking-wider block">
                    Active Session QR Code
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedSession.qrCodeUrl}
                      alt="Session QR"
                      className="h-20 w-20 rounded-xl bg-white p-1 shadow-md shrink-0 border border-[#00F5D4]/30"
                    />
                    <div className="space-y-1">
                      <p className={`text-xs font-bold ${
                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                      }`}>Scan & Pay Instant UPI</p>
                      <a
                        href={selectedSession.qrCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#00F5D4] font-bold hover:underline"
                      >
                        Open QR <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Payment Link */}
                <div className={`p-4 rounded-3xl border space-y-2 shadow-xl ${
                  theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                  <span className="text-[10px] font-extrabold text-[#00F5D4] uppercase tracking-wider block">
                    Stream Payment Link
                  </span>
                  <p className={`text-xs font-mono truncate p-2 rounded-xl border ${
                    theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                  }`}>
                    {selectedSession.paymentLink}
                  </p>
                  <button
                    onClick={() => copyLink(selectedSession.paymentLink)}
                    className="w-full py-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] font-bold text-xs hover:opacity-90 transition flex items-center justify-center gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Payment Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
