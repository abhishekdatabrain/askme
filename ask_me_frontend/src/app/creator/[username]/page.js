'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import SplashLoader from '@/components/SplashLoader';
import { API_ENDPOINTS } from '@/config/api';
import {
  User,
  Radio,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Globe,
  Video,
  Tv,
  Share2,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Copy,
  Users,
  Tag
} from 'lucide-react';

export default function CreatorPublicProfilePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const rawUsername = params?.username;

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (rawUsername) {
      fetchCreatorProfile();
    }
  }, [rawUsername]);

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const cleanName = String(rawUsername).replace(/^@+/, '');
      const res = await fetch(`${API_ENDPOINTS.VIEWERS.PUBLIC_CREATOR_PROFILE}/${cleanName}`);
      const data = await res.json();

      if (res.ok && data.status === 'success' && data.data?.creator) {
        setCreator(data.data.creator);
      } else {
        setErrorMsg(data.message || 'Creator profile not found.');
      }
    } catch (err) {
      console.warn('Creator profile fetch error:', err.message);
      setErrorMsg('Unable to connect to AskMe Studio servers.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return <SplashLoader message={`Loading @${rawUsername}'s Creator Profile...`} />;
  }

  if (errorMsg || !creator) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col justify-center items-center p-6 text-center space-y-4 font-sans">
        <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 max-w-md mx-auto shadow-2xl">
          <div className="h-16 w-16 rounded-2xl bg-[#FF3D71]/10 text-[#FF3D71] flex items-center justify-center mx-auto border border-[#FF3D71]/20">
            <User className="h-8 w-8" />
          </div>
          <h2 className="font-heading font-black text-2xl text-white">Creator Not Found</h2>
          <p className="text-xs text-[#8B8B96]">{errorMsg || `No channel or profile exists for @${rawUsername}.`}</p>
          <Link
            href="/viewers/dashboard"
            className="px-6 py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-lg glow-teal hover:opacity-95 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Public Live Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#00F5D4] selection:text-[#0A0A0F] flex flex-col">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-[#1C1C26]/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/viewers/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#8B8B96] hover:text-[#00F5D4] transition">
          <ArrowLeft className="h-4 w-4" /> Back to Live Feed
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-lg shadow-md glow-teal">
            a
          </div>
          <span className="font-heading font-black text-sm text-white tracking-wide">
            AskMe <span className="text-brand-gradient">PROFILE</span>
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">

        {/* 2. HERO PROFILE CARD */}
        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 sm:p-8 overflow-hidden shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

            {/* Creator Avatar & Identity Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={creator.avatar}
                alt={creator.fullName}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-2 border-[#00F5D4]/40 shadow-xl bg-[#0A0A0F] shrink-0"
              />

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide">
                    {creator.fullName}
                  </h1>
                  <ShieldCheck className="h-6 w-6 text-[#00F5D4] shrink-0" title="Verified Creator" />
                  {creator.isLive && (
                    <span className="ml-1 px-2.5 py-0.5 rounded-full bg-[#FF3D71] text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                      ● LIVE NOW
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono font-bold text-[#00F5D4]">
                  {creator.username}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#8B8B96] pt-1">
                  <span className="px-3 py-1 rounded-full bg-[#0A0A0F] border border-[#1C1C26] font-bold text-white flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-[#00F5D4]" />
                    {creator.category || 'Content Creator'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#0A0A0F] border border-[#1C1C26] font-semibold text-[#F5F5F7] flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-[#FFD60A]" />
                    {creator.followersCount.toLocaleString()} Followers
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#0A0A0F] border border-[#1C1C26] font-semibold text-[#8B8B96] flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-[#7B2FFF]" />
                    {creator.country || ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Creator Actions (Share & Ask Question CTA) */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                onClick={handleShareProfile}
                className="px-4 py-3 rounded-2xl bg-[#1C1C26] hover:bg-[#252533] border border-[#2A2A3A] text-xs font-bold text-white transition flex items-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#00E676]" />
                    <span className="text-[#00E676]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-[#00F5D4]" />
                    <span>Share Profile</span>
                  </>
                )}
              </button>

              {creator.isLive && creator.activeSession && (
                <Link
                  href={`/pay/${creator.activeSession.sessionCode}`}
                  className="px-6 py-3 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-xl glow-teal hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> Ask Paid Question (UPI)
                </Link>
              )}
            </div>
          </div>

          {/* Creator Bio */}
          {creator.bio && (
            <div className="pt-2 border-t border-[#1C1C26]/60">
              <p className="text-xs sm:text-sm text-[#F5F5F7] leading-relaxed max-w-3xl">
                {creator.bio}
              </p>
            </div>
          )}

          {/* Social Links Bar */}
          {creator.socialLinks && creator.socialLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C1C26]/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B8B96] mr-1">Social Links:</span>
              {creator.socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs font-semibold text-white hover:border-[#00F5D4] hover:text-[#00F5D4] transition inline-flex items-center gap-1.5 shadow-sm"
                >
                  {social.platform?.toLowerCase().includes('youtube') ? <Video className="h-3.5 w-3.5 text-[#FF0000]" /> :
                    social.platform?.toLowerCase().includes('twitch') ? <Tv className="h-3.5 w-3.5 text-[#9146FF]" /> :
                      social.platform?.toLowerCase().includes('instagram') ? <Globe className="h-3.5 w-3.5 text-[#E1306C]" /> :
                        social.platform?.toLowerCase().includes('twitter') || social.platform?.toLowerCase().includes('x') ? <Share2 className="h-3.5 w-3.5 text-[#1DA1F2]" /> :
                          <Globe className="h-3.5 w-3.5 text-[#00F5D4]" />}
                  <span>{social.platform || 'Social Link'}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 3. ACTIVE LIVE SESSION CALLOUT BANNER */}
        {creator.isLive && creator.activeSession && (
          <div className="p-6 rounded-3xl bg-[#13131A] border-2 border-[#00F5D4] shadow-2xl glow-teal space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30 animate-pulse">
                  <Radio className="h-6 w-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF3D71] text-white text-[10px] font-black uppercase tracking-wider">
                    ● BROADCASTING LIVE NOW
                  </span>
                  <h3 className="font-heading font-extrabold text-lg text-white mt-1">
                    {creator.activeSession.title}
                  </h3>
                </div>
              </div>

              <Link
                href={`/pay/${creator.activeSession.sessionCode}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4" /> Ask Paid Question (UPI)
              </Link>
            </div>

            <p className="text-xs text-[#8B8B96]">
              {creator.activeSession.description || 'Support creator live on stream with guaranteed responses & live OBS overlays.'}
            </p>
          </div>
        )}

        {/* 4. BROADCAST SESSION HISTORY */}
        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
            <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-[#00F5D4]" /> Broadcast Session History
            </h3>
            <span className="text-xs font-bold text-[#8B8B96]">
              {creator.pastSessions?.length || 0} Recorded Sessions
            </span>
          </div>

          {!creator.pastSessions || creator.pastSessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8B96] space-y-2">
              <Clock className="h-8 w-8 mx-auto text-[#8B8B96] opacity-40" />
              <p className="font-medium">No past broadcast sessions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creator.pastSessions.map(session => (
                <div
                  key={session.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00F5D4]/40 transition-all duration-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1C1C26] text-[#00F5D4] text-[10px] font-bold border border-[#1C1C26]">
                        {session.category || 'General'}
                      </span>
                      <span className="text-[10px] text-[#8B8B96] font-semibold">
                        {session.platform} Broadcast
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-white">
                      {session.title}
                    </h4>
                    <p className="text-[10px] text-[#8B8B96]">
                      Session Code: <span className="font-mono text-[#00F5D4]">{session.sessionCode}</span>
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Link
                      href={`/pay/${session.sessionCode}`}
                      className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold border border-[#1C1C26] hover:border-[#00F5D4]/50 hover:text-[#00F5D4] transition inline-flex items-center gap-1.5"
                    >
                      View Session Page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
