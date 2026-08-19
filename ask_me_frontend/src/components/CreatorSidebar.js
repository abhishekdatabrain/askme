'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Radio,
  Wallet,
  ArrowUpRight,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser, setCookie, clearCreatorSession } from '@/utils/cookies';

export default function CreatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [creatorUser, setCreatorUser] = useState(null);
  const [kycStatus, setKycStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'

  useEffect(() => {
    // 1. Retrieve stored creator user
    try {
      const parsed = getCreatorUser();
      if (parsed) {
        setCreatorUser(parsed);
        if (parsed.kycStatus) {
          setKycStatus(parsed.kycStatus.toLowerCase());
        }
      }
    } catch (e) { }

    // 2. Fetch live KYC status from backend
    const fetchStatus = async () => {
      try {
        const token = getCreatorToken();
        const res = await fetch(API_ENDPOINTS.CREATORS.KYC_STATUS, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.kycStatus) {
          const fetchedStatus = data.data.kycStatus.toLowerCase();
          setKycStatus(fetchedStatus);
          // Sync with stored user
          const parsed = getCreatorUser();
          if (parsed) {
            parsed.kycStatus = fetchedStatus;
            setCookie('askme_user', parsed);
          }
        }
      } catch (err) {
        console.warn('Sidebar KYC status sync notice:', err.message);
      }
    };

    fetchStatus();
  }, []);

  const handleLogout = () => {
    clearCreatorSession();
    window.location.href = '/creators/login';
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/creators/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Profile',
      href: '/creators/profile',
      icon: User,
    },
    {
      name: 'Live Sessions',
      href: '/creators/live-sessions',
      icon: Radio,
    },
    {
      name: 'Wallet',
      href: '/creators/wallet',
      icon: Wallet,
    },
    {
      name: 'Withdrawals',
      href: '/creators/withdrawals',
      icon: ArrowUpRight,
    },
    {
      name: 'Notifications',
      href: '/creators/notifications',
      icon: Bell,
    },
  ];

  return (
    <aside className="w-64 bg-[#13131A] border-r border-[#1C1C26] flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Studio Header & Branding */}
      <div className="p-5 border-b border-[#1C1C26] flex items-center justify-between">
        <Link href="/creators/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-md glow-teal group-hover:scale-105 transition">
            a
          </div>
          <div>
            <span className="font-heading font-black text-lg text-white block leading-none">
              AskMe <span className="text-brand-gradient">STUDIO</span>
            </span>
            <span className="text-[10px] font-bold text-[#8B8B96] uppercase tracking-wider block mt-1">
              Creator Control Room
            </span>
          </div>
        </Link>
      </div>

      {/* Creator Profile Summary Pill */}
      {creatorUser && (
        <div className="mx-4 mt-4 p-3 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#1C1C26] border border-[#252533] overflow-hidden shrink-0 flex items-center justify-center text-[#00F5D4] font-bold text-sm">
            {creatorUser.profileImage ? (
              <img src={creatorUser.profileImage} alt={creatorUser.fullName} className="h-full w-full object-cover" />
            ) : (
              (creatorUser.fullName || 'Creator').charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-white truncate">{creatorUser.fullName || 'Creator'}</h4>
            <p className="text-[10px] text-[#8B8B96] truncate">{creatorUser.username || '@creator'}</p>
          </div>
        </div>
      )}

      {/* Main Navigation Sidebar Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                ? 'bg-brand-gradient text-[#0A0A0F] shadow-lg glow-teal font-black'
                : 'text-[#8B8B96] hover:text-white hover:bg-[#1C1C26]'
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#0A0A0F]' : 'text-[#8B8B96]'}`} />
                <span className="truncate">{item.name}</span>
              </div>

              {/* Dynamic KYC Badge (Always Visible on KYC Menu Item) */}
              {item.isKycItem && (
                <div className="ml-1 shrink-0">
                  {kycStatus === 'approved' && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${isActive ? 'bg-[#0A0A0F]/20 text-[#0A0A0F]' : 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                      }`}>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>✓ Approved</span>
                    </span>
                  )}
                  {kycStatus === 'rejected' && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${isActive ? 'bg-[#0A0A0F]/20 text-[#0A0A0F]' : 'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                      }`}>
                      <XCircle className="h-3 w-3" />
                      <span>✕ Rejected</span>
                    </span>
                  )}
                  {(kycStatus === 'pending' || (kycStatus !== 'approved' && kycStatus !== 'rejected')) && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${isActive ? 'bg-[#0A0A0F]/20 text-[#0A0A0F]' : 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                      }`}>
                      <span className="h-2 w-2 rounded-full bg-[#FFD60A] animate-pulse" />
                      <span>● Pending</span>
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer & Logout */}
      <div className="p-3 border-t border-[#1C1C26]">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded-xl bg-[#1C1C26]/60 hover:bg-[#FF3D71]/10 hover:text-[#FF3D71] text-[#8B8B96] text-xs font-bold transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
