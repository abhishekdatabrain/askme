'use client';

import React, { useEffect } from 'react';
import { X, Radio, MessageSquare, ExternalLink, Crown, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Parses any stream URL (YouTube, Twitch, Facebook, Vimeo, Kick) and converts it to a standard <iframe> embed URL
 */
export function getEmbedStreamUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url = rawUrl.trim();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // 1. YouTube Video or Shorts or Live ID
  const ytWatchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]+)/i);
  if (ytWatchMatch && ytWatchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytWatchMatch[1]}?autoplay=1&mute=0&enablejsapi=1`;
  }

  // YouTube Channel/Handle fallback
  if (url.includes('youtube.com/') || url.includes('youtu.be/')) {
    const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9._-]+)/i);
    if (handleMatch && handleMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/live_stream?channel=${handleMatch[1]}&autoplay=1`;
    }
    return url;
  }

  // 2. Twitch Stream (Requires parent parameter)
  const twitchMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
  if (twitchMatch && twitchMatch[1] && twitchMatch[1].toLowerCase() !== 'directory') {
    const channel = twitchMatch[1];
    return `https://player.twitch.tv/?channel=${channel}&parent=${hostname}&autoplay=true`;
  }

  // 3. Facebook Video/Live
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true&show_text=false`;
  }

  // 4. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  // 5. Kick Stream
  const kickMatch = url.match(/kick\.com\/([a-zA-Z0-9_]+)/i);
  if (kickMatch && kickMatch[1]) {
    return `https://player.kick.com/${kickMatch[1]}`;
  }

  return url;
}

export default function StreamPlayerModal({ isOpen, onClose, creator }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !creator) return null;

  const rawUrl =
    creator.liveStreamUrl ||
    creator.streamUrl ||
    creator.session?.streamUrl ||
    creator.session?.stream_url ||
    creator.youtubeUrl ||
    (creator.cleanUsername ? `https://youtube.com/@${creator.cleanUsername}/live` : 'https://youtube.com');

  const embedUrl = getEmbedStreamUrl(rawUrl);
  const streamTitle = creator.streamTitle || creator.session?.title || creator.title || `${creator.name}'s Live Stream`;
  const payCode = creator.sessionCode || creator.session?.sessionCode || creator.cleanUsername;

  const handleAskQuestionClick = () => {
    onClose();
    if (payCode) {
      router.push(`/pay/${payCode}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Modal Card Container */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0D0D14] border border-[#222234] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-[#13131F] border-b border-[#222234] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={creator.name}
              className="h-10 w-10 rounded-xl object-cover border border-[#EB1000]/50 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-white truncate">
                  {creator.name}
                </h3>
                {creator.isLive && (
                  <span className="px-2 py-0.5 rounded-full bg-[#EB1000] text-white text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span> LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8E8E9F] truncate">
                {streamTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* {rawUrl && (
              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1C1C2C] text-[#8E8E9F] hover:text-white text-xs font-semibold transition"
                title="Open in external browser tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Original</span>
              </a>
            )} */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1C1C2C] text-[#8E8E9F] hover:text-white hover:bg-[#28283C] transition cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 16:9 Responsive Video Iframe Container */}
        <div className="relative w-full bg-black aspect-video flex-1 min-h-[240px] max-h-[62vh] overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={streamTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#8E8E9F] space-y-2">
              <Radio className="h-10 w-10 text-[#EB1000] animate-pulse" />
              <p className="text-sm font-bold text-white">Live Stream Source Unavailable</p>
              <p className="text-xs">The creator has not attached a valid video link yet.</p>
            </div>
          )}
        </div>

        {/* Modal Action Footer Bar */}
        <div className="p-3.5 sm:p-4 bg-[#13131F] border-t border-[#222234] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-4 text-xs text-[#8E8E9F]">
            <div>
              Platform: <strong className="text-white capitalize">{creator.platform || 'Live Stream'}</strong>
            </div>
            {creator.category && (
              <div>
                Category: <strong className="text-[#EB1000]">{creator.category}</strong>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleAskQuestionClick}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:opacity-95 text-white text-xs font-black transition-all shadow-lg shadow-[#EB1000]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageSquare className="h-4 w-4 fill-white" />
              <span>Ask Question</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
