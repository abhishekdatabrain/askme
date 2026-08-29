'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import {
  Radio,
  Copy,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  QrCode,
  Clock,
  StopCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function StartLivePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [theme, setTheme] = useState('dark');

  // Theme Sync
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_creator_theme', nextTheme);
      window.dispatchEvent(new Event('creator-theme-changed'));
    }
  };

  const [form, setForm] = useState({
    title: 'Gaming & Q&A Live Broadcast',
    category: 'Gaming & Esports',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    description: 'Welcome to our live broadcast! Ask questions & support live on OBS stream.',
    streamingPlatform: 'YouTube Live',
    streamUrl: '',
    durationHours: 2,
    goalAmount: 5000,
    minDonation: 10,
  });

  const fetchActiveSession = async (uId, token) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}?creatorId=${uId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.sessions) {
        const active = data.data.sessions.find(s => s.status === 'active');
        if (active) {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          setActiveSession({
            ...active,
            paymentLink: active.paymentLink || `${origin}/pay/${active.sessionCode}?creatorId=${uId}&sessionId=${active.id}`,
            qrCodeUrl: active.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(active.paymentLink || `${origin}/pay/${active.sessionCode}`)}`,
            overlayUrl: active.overlayUrl || `${origin}/overlay/${creator?.username || uId}?sessionCode=${active.sessionCode}`,
          });
        } else {
          setActiveSession(null);
        }
      }
    } catch (err) { }
  };

  useEffect(() => {
    const token = getCreatorToken();
    const u = getCreatorUser();
    if (!token || !u || !u.id) {
      window.location.href = '/creators/login';
      return;
    }
    setCreator(u);
    fetchActiveSession(u.id, token);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!activeSession) {
      setTimeRemaining('');
      return;
    }

    const durationMs = (Number(activeSession.durationHours) || 2) * 3600 * 1000;
    const endTime = activeSession.endsAt
      ? new Date(activeSession.endsAt).getTime()
      : new Date(activeSession.startedAt || activeSession.createdAt || Date.now()).getTime() + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeRemaining('00h 00m 00s (Expired)');
        handleEndSession();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [activeSession]);

  const handleThumbnailFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, thumbnailUrl: tempUrl }));
      toast.success('Stream thumbnail uploaded successfully!', 'Image Selected');
    }
  };

  const handleCreateSession = async (e) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Please enter a valid stream title.', 'Validation Error');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getCreatorToken();
      const creatorId = creator?.id || 1;

      const payload = {
        creatorId,
        title: form.title,
        category: form.category,
        thumbnailUrl: form.thumbnailUrl,
        description: form.description,
        streamingPlatform: form.streamingPlatform,
        streamUrl: form.streamUrl,
        durationHours: Number(form.durationHours) || 2,
        goalAmount: Number(form.goalAmount) || 5000,
        minDonation: Number(form.minDonation) || 10,
      };

      const res = await fetch(API_ENDPOINTS.CREATORS.LIVE_SESSIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data) {
        const sessData = data.data;
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const pLink = sessData.paymentLink || `${origin}/pay/${sessData.session.sessionCode}?creatorId=${creatorId}&sessionId=${sessData.session.id}`;
        const qrUrl = sessData.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(pLink)}`;
        const oUrl = sessData.overlayUrl || `${origin}/overlay/${creator?.username || creatorId}?sessionCode=${sessData.session.sessionCode}`;

        const outputObj = {
          ...sessData.session,
          paymentLink: pLink,
          qrCodeUrl: qrUrl,
          overlayUrl: oUrl,
        };

        toast.success('Live donation session started! Redirecting to Active Session...', 'Session Launched!');
        router.push('/creators/active-session');
      } else {
        toast.error(data?.message || 'Failed to start live session', 'Error');
      }
    } catch (err) {
      toast.error('Network error starting live session.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      const token = getCreatorToken();
      await fetch(`${API_ENDPOINTS.CREATORS.LIVE_SESSIONS}/${activeSession.id}/close`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSession(null);
      toast.info('Live Broadcast Session ended.', 'Session Ended');
    } catch (err) {
      setActiveSession(null);
    }
  };

  const copyText = (text, title = 'Copied!') => {
    navigator.clipboard.writeText(text);
    toast.success(`${title} copied to clipboard!`, 'Copied!');
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20]' : 'bg-[#0A0A0F] text-[#F5F5F7]'
      }`}>
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
              <Radio className="h-5 w-5 text-[#00F5D4]" /> Start Live Session
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
              Fill required stream details below to generate instant QR payment code & OBS stream overlay.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2FFF]" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <CreatorNotificationDropdown theme={theme} />
          </div>
        </header>

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">

          {/* Simple Live Session Form with ALL Required Fields */}
          <form onSubmit={handleCreateSession} className={`p-6 rounded-3xl border space-y-6 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>

            {/* Field 1: Stream Title */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">● Stream Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. BGMI Live Stream #5 - Paid Q&A & Support"
                className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}
                required
              />
            </div>

            {/* Field 2 & 5: Stream Category & Streaming Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">● Stream Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}
                >
                  <option value="Gaming & Esports">Gaming & Esports</option>
                  <option value="Tech & Coding">Tech & Coding</option>
                  <option value="Music & Art">Music & Art</option>
                  <option value="Just Chatting / Podcast">Just Chatting / Podcast</option>
                  <option value="Education / Q&A">Education / Q&A</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">● Streaming Platform *</label>
                <select
                  value={form.streamingPlatform}
                  onChange={(e) => setForm(prev => ({ ...prev, streamingPlatform: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}
                >
                  <option value="YouTube Live">YouTube Live</option>
                  <option value="Twitch">Twitch</option>
                  <option value="Kick">Kick Broadcast</option>
                  <option value="OBS Studio">OBS Studio / Custom RTMP</option>
                </select>
              </div>
            </div>

            {/* Stream URL (Optional) & Duration Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">● Stream URL </label>
                <input
                  type="url"
                  value={form.streamUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, streamUrl: e.target.value }))}
                  placeholder="https://youtube.com/live/your-broadcast-id or twitch.tv/your-channel"
                  className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">● Stream Duration Limit (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={form.durationHours}
                  onChange={(e) => setForm(prev => ({ ...prev, durationHours: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}
                />
              </div>
            </div>

            {/* Stream Description (Placed Niche / At Bottom) */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-[#8B8B96]">● Stream Description *</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Welcome to our live broadcast! Ask questions & support live on stream."
                className={`w-full rounded-xl border p-3 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}
              />
            </div>

            {/* Stream Thumbnail / Cover Image (Simple Design at Very Bottom) */}
            <div className="pt-2 border-t border-[#1C1C26] space-y-2">
              <label className="block text-xs font-bold text-[#8B8B96]">● Stream Thumbnail / Cover Image <span className="text-[#00F5D4] font-semibold">(Optional)</span></label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  placeholder="Paste Thumbnail Image URL or Upload"
                  className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                    }`}
                />
                <label className="px-4 py-2.5 rounded-xl bg-[#1C1C26] text-white hover:bg-[#252533] text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0 border border-[#252533]">
                  <Upload className="h-3.5 w-3.5 text-[#00F5D4]" /> Upload Image
                  <input type="file" accept="image/*" onChange={handleThumbnailFileUpload} className="hidden" />
                </label>
              </div>
              {form.thumbnailUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <img src={form.thumbnailUrl} alt="Thumbnail Preview" className="h-10 w-16 rounded-lg object-cover border border-[#00F5D4]/40" />
                  <span className="text-[11px] text-[#00E676] font-semibold">Thumbnail Selected</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-lg glow-teal hover:scale-105 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
                🔴 Launch Live Session Now
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
