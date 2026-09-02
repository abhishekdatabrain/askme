'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ViewerSidebar from '@/components/ViewerSidebar';
import { useToast } from '@/context/ToastContext';
import { getViewerToken, getViewerUser } from '@/utils/cookies';
import { API_ENDPOINTS } from '@/config/api';
import {
  History,
  Tv,
  RefreshCw,
  Sun,
  Moon,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Radio,
  PlayCircle,
  Video
} from 'lucide-react';

export default function ViewerPastStreamsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark');

  const categories = ['All', 'Gaming', 'Tech & AI', 'Education', 'Finance', 'Crypto', 'Entertainment'];

  // Theme Sync
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_viewer_theme', nextTheme);
      window.dispatchEvent(new Event('viewer-theme-changed'));
    }
  };

  const fetchPastStreams = async () => {
    try {
      setIsLoading(true);
      const u = getViewerUser();
      const token = getViewerToken();

      const url = new URL(API_ENDPOINTS.VIEWERS.PUBLIC_PAST_STREAMS);
      if (u?.id) url.searchParams.set('userId', u.id);
      if (u?.email) url.searchParams.set('email', u.email);
      if (selectedCategory !== 'All') url.searchParams.set('category', selectedCategory);
      if (searchQuery.trim()) url.searchParams.set('search', searchQuery.trim());

      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.sessions) {
        setSessions(data.data.sessions);
      }
    } catch (err) {
      console.warn('Fetch past streams error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPastStreams();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPastStreams();
  };

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER */}
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
              <History className="h-5 w-5 text-[#00F5D4]" /> Watched Past Streams ({sessions.length})
            </h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
              Past broadcast streams and live Q&A sessions where you asked questions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#FFD60A]" /> : <Moon className="h-4 w-4 text-[#7B2FFF]" />}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* SEARCH BAR */}
          <div className={`p-4 rounded-3xl border space-y-4 shadow-xl ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
            }`}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8B96]" />
              <input
                type="text"
                placeholder="Search past streams by title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium border outline-none transition ${theme === 'light'
                    ? 'bg-[#F8F9FA] border-[#E9ECEF] text-[#1A1D20] focus:border-[#00F5D4]'
                    : 'bg-[#0A0A0F] border-[#1C1C26] text-white focus:border-[#00F5D4]'
                  }`}
              />
            </form>
          </div>

          {/* PAST STREAMS SINGLE ROW LIST */}
          {isLoading ? (
            <div className="p-16 text-center text-xs text-[#8B8B96] space-y-2">
              <RefreshCw className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin mx-auto text-[#00F5D4]" />
              <p>Loading your past stream broadcasts...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className={`p-16 rounded-3xl border text-center space-y-3 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
              }`}>
              <History className="h-12 w-12 mx-auto text-[#8B8B96] opacity-40" />
              <h3 className="font-bold text-white text-base">No Watched Past Streams Found</h3>
              <p className="text-xs text-[#8B8B96] max-w-md mx-auto">
                You haven't participated or asked questions in any live broadcast sessions yet.
              </p>
              <Link
                href="/viewers/live-sessions"
                className="inline-block px-5 py-2.5 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:scale-105 transition"
              >
                Browse Live Sessions →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md transition hover:border-[#00F5D4]/40 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                    }`}
                >
                  {/* Left side: Avatar + Creator + Title + Badges */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={s.creator?.avatar || s.thumbnailUrl}
                      alt={s.creator?.fullName}
                      className="h-12 w-12 rounded-full border-2 border-[#00F5D4]/40 object-cover shrink-0"
                    />

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-white truncate">
                          {s.creator?.fullName}
                        </h4>
                        <span className="text-[11px] text-[#8B8B96] font-mono">
                          {s.creator?.username}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#00F5D4]/10 text-[#00F5D4] text-[10px] font-bold border border-[#00F5D4]/20">
                          {s.category}
                        </span>
                      </div>

                      <h3 className={`font-heading font-black text-sm truncate ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                        }`}>
                        {s.title}
                      </h3>

                      <div className="flex items-center gap-2 text-[11px] text-[#8B8B96] flex-wrap pt-0.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FF5500]/10 text-[#FF5500] font-bold border border-[#FF5500]/30 flex items-center gap-1 text-[11px]">
                          <MessageSquare className="h-3 w-3" /> You asked {s.viewerQuestionsCount || 1} Question{s.viewerQuestionsCount === 1 ? '' : 's'}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-black/60 text-[#8B8B96] text-[10px] font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> ENDED BROADCAST
                        </span>


                      </div>
                    </div>
                  </div>

                  {/* Right side: View Questions Button */}
                  <div className="shrink-0 flex items-center gap-3 justify-end">
                    <Link
                      href={`/viewers/past-streams/${s.id}`}
                      className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal hover:scale-105 transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      View Questions <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
