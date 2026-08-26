'use client';

import React from 'react';
import { Sparkles, Radio } from 'lucide-react';

export default function SplashLoader({ message = 'Loading AskMe Live Feed...' }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 select-none font-sans animate-in fade-in duration-300">
      {/* Background Gradient Glow Blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#00F5D4]/15 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-[#7B2CBF]/20 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-6 max-w-sm mx-auto">
        {/* Glowing Logo Icon */}
        <div className="relative inline-block">
          <div className="h-20 w-20 rounded-3xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-4xl shadow-2xl glow-teal animate-bounce">
            a
          </div>
          <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-[#FF3D71] border-2 border-[#0A0A0F] flex items-center justify-center animate-ping">
            <Radio className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Branding & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="font-heading font-black text-2xl tracking-wide text-white">
            AskMe <span className="text-brand-gradient">STUDIO</span>
          </h1>
          <p className="text-xs font-semibold text-[#00F5D4] flex items-center justify-center gap-1.5 tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 animate-spin" /> Live Broadcast & Q&A Feed
          </p>
        </div>

        {/* Loading Spinner & Progress Line */}
        <div className="space-y-3 pt-2">
          <div className="w-48 h-1 bg-[#1C1C26] rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-brand-gradient rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-[11px] font-medium text-[#8B8B96]">{message}</p>
        </div>
      </div>
    </div>
  );
}
