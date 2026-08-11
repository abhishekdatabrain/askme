import React from 'react';
import {
  Radio,
  Users,
  DollarSign,
  ShieldCheck,
  Settings,
  Activity,
  Tv,
  HelpCircle,
  Award,
  Sparkles,
  Lock,
  Wallet,
  BarChart2
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      subtitle: 'Statistics & Platform Metrics',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-[#FF3D71] animate-live-pulse text-white',
    },
    {
      id: 'creators_mgmt',
      label: 'Creator Management',
      subtitle: 'Approve, Block & Delete',
      icon: Users,
      badge: '1.4k',
      badgeColor: 'bg-brand-gradient text-[#0A0A0F]',
    },
    {
      id: 'kyc',
      label: 'KYC Management',
      subtitle: 'Verify Identity & Bank Info',
      icon: ShieldCheck,
      count: '1 Pending',
    },
    {
      id: 'livesessions',
      label: 'Live Session Mgmt',
      subtitle: 'Active Stream QR Overlays',
      icon: Tv,
      count: '7 Live',
    },
    {
      id: 'payments',
      label: 'Payment Management',
      subtitle: 'Transactions & Gateway Logs',
      icon: DollarSign,
    },
    {
      id: 'wallets',
      label: 'Wallet Management',
      subtitle: '15% Cut & Creator Balances',
      icon: Wallet,
    },
    {
      id: 'withdrawals',
      label: 'Withdrawal Management',
      subtitle: 'Approve & Mark Paid',
      icon: DollarSign,
      count: '2 Request',
    },
    {
      id: 'commissions',
      label: 'Commission Rules',
      subtitle: '15% Platform Fee & Limits',
      icon: Sparkles,
      badge: '15%',
      badgeColor: 'bg-[#FFD60A] text-[#0A0A0F]',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      subtitle: 'Revenue & Top Creators',
      icon: BarChart2,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0A0A0F] border-r border-[#1C1C26] p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        {/* Navigation Section Title */}
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8B8B96] uppercase px-3">
            Broadcast Navigation
          </span>

          <nav className="mt-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${isActive
                      ? 'bg-[#13131A] text-white border border-[#00F5D4]/40 glow-teal'
                      : 'text-[#8B8B96] hover:bg-[#13131A]/60 hover:text-white border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[#00F5D4]/10 text-[#00F5D4]' : 'bg-[#1C1C26] text-[#8B8B96]'
                      }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold ${isActive ? 'text-white font-bold' : ''}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-[#8B8B96]">{item.subtitle}</span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}

                  {item.count && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1C1C26] text-[#00F5D4]">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Platform Metrics Widget */}
        <div className="p-3.5 rounded-2xl bg-[#13131A] border border-[#1C1C26] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
              Platform Cut
            </span>
            <span className="text-xs font-extrabold text-[#FFD60A]">15% Net</span>
          </div>
          <p className="text-[11px] text-[#8B8B96] leading-relaxed">
            Creators keep <span className="text-[#00E676] font-bold">85%</span> of guaranteed paid questions and askMail interactions.
          </p>
          <div className="w-full bg-[#1C1C26] h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-gradient h-full w-[85%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[#1C1C26] flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[11px] text-[#8B8B96]">
          <Lock className="h-3 w-3 text-[#00F5D4]" />
          <span>Futurepast ventures LLP</span>
        </div>
        <span className="text-[10px] text-[#8B8B96]/60">Lake View City, Pune 411047</span>
      </div>
    </aside>
  );
}
