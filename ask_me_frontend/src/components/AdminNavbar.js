import React from 'react';
import Link from 'next/link';
import { Search, Bell, Shield, Zap, Radio, User, ChevronDown, Activity, Settings, LogIn } from 'lucide-react';

export default function AdminNavbar({ activeView, setActiveView, onOpenAuthModal, isLoggedIn, onLogout, systemStatus = "OPERATIONAL" }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1C1C26] bg-[#0A0A0F]/90 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Brand Logo & Signal Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-lg glow-teal">
              a
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-lg tracking-tight text-white">AskMe</span>
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold tracking-widest uppercase rounded bg-brand-gradient text-[#0A0A0F]">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-[#8B8B96] font-medium tracking-wide">
                Super Admin Control Room
              </span>
            </div>
          </div>

          {/* System Live Signal Telemetry Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#13131A] border border-[#1C1C26] text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
            </span>
            <span className="text-[#8B8B96] font-medium">LIVE SIGNAL:</span>
            <span className="text-[#00E676] font-bold tracking-wide">{systemStatus}</span>
          </div>
        </div>

        {/* Command Palette Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
            <input
              type="text"
              placeholder="Search creators, live streams, askMails, or transactions... (⌘K)"
              className="w-full rounded-full bg-[#13131A] border border-[#1C1C26] pl-9 pr-4 py-2 text-xs text-[#F5F5F7] placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none focus:ring-1 focus:ring-[#00F5D4] transition-all"
            />
          </div>
        </div>

        {/* Right Section  Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Platform View Switches */}
          {/* <div className="hidden lg:flex items-center gap-1 bg-[#13131A] p-1 rounded-lg border border-[#1C1C26]">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeView === 'overview'
                ? 'bg-brand-gradient text-[#0A0A0F] shadow-sm'
                : 'text-[#8B8B96] hover:text-white'
                }`}
            >
              Control Room
            </button>
            <button
              onClick={() => setActiveView('creators')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeView === 'creators'
                ? 'bg-brand-gradient text-[#0A0A0F] shadow-sm'
                : 'text-[#8B8B96] hover:text-white'
                }`}
            >
              Creators Tab
            </button>
          </div> */}

          {/* Login / Logout Controls */}
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-[#1C1C26] text-[#FF5252] border border-[#FF5252]/30 text-xs font-bold hover:bg-[#FF5252] hover:text-white transition-all flex items-center gap-1"
            >
              <LogIn className="h-3.5 w-3.5 rotate-180" />
              <span>Sign Out</span>
            </button>
          ) : (
            <p></p>
          )}


          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-[#13131A] border border-[#1C1C26] text-[#8B8B96] hover:text-[#00F5D4] hover:border-[#00F5D4]/40 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3D71] text-[9px] font-bold text-white animate-live-pulse">
              3
            </span>
          </button>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1C1C26]">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7B2FFF] to-[#00F5D4] p-0.5">
              <div className="h-full w-full rounded-full bg-[#0A0A0F] flex items-center justify-center text-xs font-bold text-[#00F5D4]">
                SA
              </div>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#F5F5F7]">Super Admin</span>
              <span className="text-[10px] text-[#00F5D4]">Futurepast Ventures</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#8B8B96]" />
          </div>
        </div>
      </div>
    </header>
  );
}
