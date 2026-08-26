'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import SplashLoader from '@/components/SplashLoader';
import { API_ENDPOINTS } from '@/config/api';
import {
  User,
  Radio,
  Sparkles,
  Heart,
  MessageSquare,
  ExternalLink,
  Globe,
  Video,
  Tv,
  Share2,
  Calendar,
  ArrowLeft,
  Check,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function CreatorPublicProfilePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const rawUsername = params?.username;

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

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

  const handleToggleFollow = async () => {
    if (!creator) return;
    const newStatus = !isFollowing;
    setIsFollowing(newStatus);

    try {
      await fetch(API_ENDPOINTS.VIEWERS.FOLLOW, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: String(creator.id) }),
      });
    } catch (err) {
      console.warn('Follow API error:', err.message);
    }
  };

  if (loading) {
    return <SplashLoader message={`Loading @${rawUsername}'s Creator Profile...`} />;
  }

  if (errorMsg || !creator) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col justify-center items-center p-6 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-3 max-w-md mx-auto">
          <User className="h-10 w-10 text-[#FF3D71] mx-auto" />
          <h2 className="font-heading font-black text-xl text-white">Creator Not Found</h2>
          <p className="text-xs text-[#8B8B96]">{errorMsg || `No profile exists for @${rawUsername}.`}</p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Live Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans selection:bg-[#00F5D4] selection:text-[#0A0A0F] flex flex-col">
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#13131A]/95 backdrop-blur-md border-b border-[#1C1C26] px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#8B8B96] hover:text-[#00F5D4] transition">
          <ArrowLeft className="h-4 w-4" /> Back to Live Feed
        </Link>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-sm shadow-sm">
            a
          </div>
          <span className="font-heading font-black text-sm text-white">
            AskMe <span className="text-brand-gradient">PROFILE</span>
          </span>
        </div>
      </header>

      {/* 2. PROFILE HERO BANNER & HEADER */}
      <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] overflow-hidden shadow-2xl relative">
          {/* Cover Header Graphic Banner */}
          <div className="h-44 sm:h-56 bg-gradient-to-r from-[#1A1A26] via-[#2D1B4E] to-[#13131A] relative">
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${creator.avatar})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-transparent"></div>

            {/* Live Indicator Pill on Cover Banner */}
            {creator.isLive && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#FF3D71] text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span> LIVE BROADCAST NOW
              </div>
            )}
          </div>

          {/* Profile Details Container */}
          <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              {/* Creator Avatar & Name */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <img
                  src={creator.avatar}
                  alt={creator.fullName}
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl object-cover border-4 border-[#13131A] shadow-2xl bg-[#0A0A0F]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                      {creator.fullName}
                    </h1>
                    <ShieldCheck className="h-5 w-5 text-[#00F5D4]" title="Verified AskMe Creator" />
                  </div>
                  <p className="text-xs font-mono font-bold text-[#00F5D4]">
                    {creator.username}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#8B8B96] pt-0.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0A0A0F] border border-[#1C1C26] font-semibold text-white">
                      {creator.category || 'Content Creator'}
                    </span>
                    <span>{creator.followersCount.toLocaleString()} Followers</span>
                    <span>{creator.country || 'India'}</span>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <div className="w-full sm:w-auto">
                <button
                  onClick={handleToggleFollow}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                    isFollowing
                      ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 hover:bg-[#FF3D71]/10 hover:text-[#FF3D71]'
                      : 'bg-brand-gradient text-[#0A0A0F] glow-teal hover:opacity-95'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="h-4 w-4" /> Following Creator
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 text-[#FF3D71]" /> Follow Creator
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Creator Bio */}
            <p className="text-xs sm:text-sm text-[#F5F5F7] leading-relaxed max-w-3xl pt-2">
              {creator.bio}
            </p>

            {/* Social Media Link Buttons */}
            {creator.socialLinks && creator.socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C1C26]">
                <span className="text-[11px] font-bold text-[#8B8B96] mr-1">Social Links:</span>
                {creator.socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-xs font-semibold text-white hover:border-[#00F5D4] hover:text-[#00F5D4] transition inline-flex items-center gap-1.5"
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
        </div>

        {/* 3. ACTIVE LIVE BROADCAST CALLOUT BANNER */}
        {creator.isLive && creator.activeSession && (
          <div className="p-6 rounded-3xl bg-[#13131A] border-2 border-[#00F5D4] shadow-2xl glow-teal space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 animate-pulse">
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

        {/* 4. PAST STREAM SESSION HISTORY */}
        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
            <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#00F5D4]" /> Broadcast Session History
            </h3>
            <span className="text-xs font-bold text-[#8B8B96]">
              {creator.pastSessions?.length || 0} Recorded Sessions
            </span>
          </div>

          {!creator.pastSessions || creator.pastSessions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8B96] space-y-1">
              <Clock className="h-6 w-6 mx-auto text-[#8B8B96]" />
              <p>No past broadcast sessions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creator.pastSessions.map(session => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00F5D4]/30 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#1C1C26] text-[#00F5D4] text-[10px] font-bold border border-[#1C1C26]">
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
                      className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold border border-[#1C1C26] hover:border-[#00F5D4]/40 transition inline-flex items-center gap-1.5"
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
