'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import {
  Radio,
  Copy,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Clock,
  StopCircle,
  Sparkles,
  Download,
  ArrowRight,
  Upload
} from 'lucide-react';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { uploadFile, getLocalFilePreview } from '@/utils/fileUpload';

export default function CreatorStartLivePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [creator, setCreator] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState('dark');

  const [form, setForm] = useState({
    title: 'Gaming & Q&A Live Session',
    category: 'Gaming & Esports',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    streamingPlatform: 'YouTube Live',
    streamUrl: '',
    durationHours: '',
    // goalAmount: 5000,
    // minDonation: 10,
    description: 'Ask questions & support live on OBS stream during our broadcast!',
  });

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const localPreview = getLocalFilePreview(file);
      setForm(prev => ({ ...prev, thumbnail: localPreview }));
      toast.info('Uploading cover image...', 'Upload In Progress');
      const uploadRes = await uploadFile(file, 'general');
      setForm(prev => ({ ...prev, thumbnail: uploadRes.path }));
      toast.success('Stream thumbnail uploaded successfully!', 'Uploaded');
    } catch (err) {
      toast.error(err?.message || 'Failed to upload image.', 'Upload Error');
    }
  };

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
            qrCodeUrl: active.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=2&data=${encodeURIComponent(active.paymentLink || `${origin}/pay/${active.sessionCode}`)}`,
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

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = getCreatorToken();
      const creatorId = creator?.id || 1;

      const payload = {
        creatorId,
        title: form.title,
        category: form.category,
        description: form.description,
        thumbnail: form.thumbnail,
        streamingPlatform: form.streamingPlatform,
        streamUrl: form.streamUrl,
        durationHours: Number(form.durationHours),
        // goalAmount: Number(form.goalAmount) || 5000,
        // minDonation: Number(form.minDonation) || 10,
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

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`border-b sticky top-0 z-30 shrink-0 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E2E8F0] bg-white/95 backdrop-blur-md text-[#0F172A] shadow-sm' : 'border-[#222236] bg-[#0A0A0F]/95 backdrop-blur-md text-white shadow-sm'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
              <Radio className="h-5 w-5 text-[#EB1000]" /> Start Live Session
            </h1>
            <p className={`text-xs mt-0.5 font-medium ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
              Fill required stream details below to generate instant QR payment code & OBS stream overlay.
            </p>
          </div>

        </header>

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          <form onSubmit={handleCreateSession} className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-2xl relative overflow-hidden transition-all duration-300 ${theme === 'light' ? 'bg-white border-[#E2E8F0] shadow-slate-200/60' : 'bg-[#12121C]/95 backdrop-blur-xl border-[#222236] shadow-black/80'
            }`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EB1000] via-[#FF5500] to-[#EB1000]" />

            <div>
              <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>● Stream Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. BGMI Live Stream #5 - Paid Q&A & Support"
                className={`w-full rounded-xl border px-4 py-3 text-xs outline-none font-medium transition-all duration-200 ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]' : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                  }`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>● Stream Category *</label>
              <select
                value={form.category}
                required
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full rounded-xl border px-4 py-3 text-xs outline-none font-medium transition-all duration-200 ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]' : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                  }`}
              >
                <option value="Gaming">Gaming</option>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Podcast">Podcast</option>
                <option value="Education">Education</option>
                <option value="Politics">Politics</option>

              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>Stream URL *</label>
                <input
                  type="url"
                  value={form.streamUrl}
                  required
                  onChange={(e) => setForm(prev => ({ ...prev, streamUrl: e.target.value }))}
                  placeholder="https://youtube.com/live/your-broadcast-id"
                  className={`w-full rounded-xl border px-4 py-3 text-xs outline-none font-medium transition-all duration-200 ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]' : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                    }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>Duration Limit (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={form.durationHours}
                  onChange={(e) => setForm(prev => ({ ...prev, durationHours: e.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 text-xs outline-none font-medium transition-all duration-200 ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]' : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                    }`}
                />
              </div>
            </div>



            <div>
              <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                ● Stream Thumbnail / Cover Image <span className="text-[#10B981] font-bold">(Optional)</span>
              </label>
              <div className="flex items-center gap-3">

                <label className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 ${theme === 'light' ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#0F172A] hover:bg-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E] text-white hover:bg-[#222236]'
                  }`}>
                  <Upload className="h-4 w-20 text-[#10B981]" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                </label>
              </div>

              {form.thumbnail && (
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="h-9 w-14 rounded-lg overflow-hidden border border-[#10B981]/50 shadow-sm shrink-0">
                    <img
                      src={getMediaUrl(form.thumbnail)}
                      alt="Stream Cover Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-extrabold text-[#10B981] flex items-center gap-1">
                    Thumbnail Selected
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>Stream Description *</label>
              <textarea
                rows={3}
                value={form.description}
                required
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full rounded-xl border p-3 text-xs outline-none font-medium transition-all duration-200 ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]' : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                  }`}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !form.title.trim()}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />} 🔴 Launch Live Session Now
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
}
