'use client';

import React from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { Radio, Video, Copy, ExternalLink, ArrowLeft } from 'lucide-react';

export default function CreatorLiveSessionsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Live Broadcast Sessions</h1>
            <p className="text-xs text-[#8B8B96]">OBS RTMP Stream keys and active AskMe question sessions</p>
          </div>
          <Link href="/creators/dashboard" className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </header>

        <main className="p-6 max-w-4xl w-full mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#1C1C26] pb-4">
              <Radio className="h-6 w-6 text-[#00F5D4]" />
              <div>
                <h3 className="font-heading font-bold text-base text-white">Live Stream OBS Integration</h3>
                <p className="text-xs text-[#8B8B96]">Connect your YouTube, Twitch, or Kick broadcast for real-time paid question popups.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2">
              <span className="text-xs text-[#8B8B96] font-bold">RTMP Ingest Server URL</span>
              <p className="font-mono text-xs text-[#00F5D4]">rtmp://live.askme.pro/broadcast</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
