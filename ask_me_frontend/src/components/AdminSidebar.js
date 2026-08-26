import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  ShieldCheck,
  Tv,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Sparkles,
  BarChart2,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  Lock,
  User,
  CreditCard,
  Sliders,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertOctagon,
  RefreshCw,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, activeSubTab, setActiveSubTab, theme = 'dark', onToggleTheme }) {
  // Navigation structure definition matching exact requirements
  const menuStructure = [
    {
      id: 'overview',
      label: 'Dashboard',
      subtitle: 'Metrics & Platform Summary',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-[#FF3D71] animate-live-pulse text-white',
    },
    {
      id: 'creators',
      label: 'Creators',
      subtitle: 'Management & Details',
      icon: Users,
      badge: '1.4k',
      badgeColor: 'bg-brand-gradient text-[#0A0A0F]',
      children: [
        { id: 'creators_all', label: 'All Creators' },
        { id: 'creators_active', label: 'Active Creators' },
        { id: 'creators_blocked', label: 'Blocked Creators' },
        { id: 'creators_details', label: 'Creator Details' },
      ],
    },
    {
      id: 'kyc',
      label: 'KYC Management',
      subtitle: 'Identity & Bank Approvals',
      icon: ShieldCheck,
      children: [
        { id: 'kyc_pending', label: 'Pending KYC' },
        { id: 'kyc_approved', label: 'Approved KYC' },
        { id: 'kyc_rejected', label: 'Rejected KYC' },
        { id: 'user_agreement', label: 'User Agreement' },
      ],
    },
    {
      id: 'livesessions',
      label: 'Live Sessions',
      subtitle: 'Stream QR Overlays',
      icon: Tv,
      count: '7 Live',
      children: [
        { id: 'livesessions_active', label: 'Active Sessions' },
        { id: 'livesessions_closed', label: 'Closed Sessions' },
        { id: 'livesessions_suspended', label: 'Suspended Sessions' },
      ],
    },
    {
      id: 'memberships',
      label: 'Memberships',
      subtitle: 'Plans & Subscriptions',
      icon: Sparkles,
      badge: 'VIP',
      badgeColor: 'bg-[#7B2FFF] text-white font-black',
      children: [
        { id: 'memberships_overview', label: 'Overview' },
        { id: 'memberships_plans', label: 'Plans' },
        { id: 'memberships_assign', label: 'Assign to Creators' },
        { id: 'memberships_subscriptions', label: 'Subscriptions' },
        { id: 'memberships_active', label: 'Active Members' },
        { id: 'memberships_cancelled', label: 'Cancelled Members' },
        { id: 'memberships_expired', label: 'Expired Members' },
        { id: 'memberships_benefits', label: 'Benefits' },
        { id: 'memberships_settings', label: 'Membership Settings' },
      ],
    },
    {
      id: 'payments',
      label: 'Payments',
      subtitle: 'Transactions & Gateways',
      icon: DollarSign,
      children: [
        { id: 'payments_all', label: 'All Transactions' },
        { id: 'payments_successful', label: 'Successful' },
        { id: 'payments_failed', label: 'Failed' },
        { id: 'payments_pending', label: 'Pending' },
        { id: 'payments_refunds', label: 'Refunds' },
      ],
    },
    {
      id: 'wallets',
      label: 'Wallet',
      subtitle: 'Creator Balances & Ledger',
      icon: Wallet,
      children: [
        { id: 'wallets_creators', label: 'Creator Wallets' },
        { id: 'wallets_ledger', label: 'Wallet Ledger' },
      ],
    },
    {
      id: 'withdrawals',
      label: 'Withdrawals',
      subtitle: 'Payout Requests & Status',
      icon: ArrowUpRight,
      count: '2 Request',
      children: [
        { id: 'withdrawals_pending', label: 'Pending' },
        { id: 'withdrawals_approved', label: 'Approved' },
        { id: 'withdrawals_processing', label: 'Processing' },
        { id: 'withdrawals_completed', label: 'Completed' },
        { id: 'withdrawals_rejected', label: 'Rejected' },
      ],
    },
    {
      id: 'commissions',
      label: 'Commission',
      subtitle: '15% Rules & History',
      icon: Sparkles,
      badge: '15%',
      badgeColor: 'bg-[#FFD60A] text-[#0A0A0F]',
      children: [
        { id: 'commissions_settings', label: 'Commission Settings' },
        { id: 'commissions_history', label: 'Commission History' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      subtitle: 'Revenue & Performance',
      icon: BarChart2,
      children: [
        { id: 'reports_revenue', label: 'Revenue Report' },
        { id: 'reports_payment', label: 'Payment Report' },
        { id: 'reports_creator', label: 'Creator Report' },
        { id: 'reports_withdrawal', label: 'Withdrawal Report' },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      subtitle: 'System Alerts & Logs',
      icon: Bell,
      badge: '3',
      badgeColor: 'bg-[#00F5D4] text-[#0A0A0F]',
    },
  ];

  // Track expanded accordion sections - closed by default
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleParentClick = (item) => {
    setActiveTab(item.id);
    if (item.children && item.children.length > 0) {
      // Toggle expand state
      toggleSection(item.id);
      // Select first sub-item if activeSubTab is not already under this parent
      if (!activeSubTab || !item.children.some(c => c.id === activeSubTab)) {
        if (setActiveSubTab) {
          setActiveSubTab(item.children[0].id);
        }
      }
    } else {
      if (setActiveSubTab) {
        setActiveSubTab('');
      }
    }
  };

  const handleChildClick = (parentId, childId, e) => {
    e.stopPropagation();
    setActiveTab(parentId);
    if (setActiveSubTab) {
      setActiveSubTab(childId);
    }
  };

  return (
    <aside className={`w-64 shrink-0 border-r p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-61px)] overflow-y-auto max-h-[calc(100vh-61px)] custom-scrollbar transition-colors ${
      theme === 'light'
        ? 'bg-white border-[#E9ECEF] text-[#212529]'
        : 'bg-[#0A0A0F] border-[#1C1C26] text-[#F5F5F7]'
    }`}>
      <div className="space-y-4">
        {/* Section Header */}
        <div>
          <span className={`text-[11px] font-bold tracking-wider uppercase px-3 ${
            theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
          }`}>
            Admin Navigation
          </span>

          <nav className="mt-2.5 space-y-1">
            {menuStructure.map((item) => {
              const Icon = item.icon;
              const isParentActive = activeTab === item.id;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedSections[item.id];

              return (
                <div key={item.id} className="space-y-1">
                  {/* Parent Menu Item */}
                  <button
                    onClick={() => handleParentClick(item)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      isParentActive
                        ? theme === 'light'
                          ? 'bg-[#F1F3F5] text-[#1A1D20] border border-[#00F5D4] font-bold shadow-sm'
                          : 'bg-[#13131A] text-white border border-[#00F5D4]/40 glow-teal shadow-sm shadow-[#00F5D4]/10'
                        : theme === 'light'
                          ? 'text-[#495057] hover:bg-[#F8F9FA] hover:text-[#1A1D20] border border-transparent'
                          : 'text-[#8B8B96] hover:bg-[#13131A]/60 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isParentActive
                            ? 'bg-[#00F5D4]/10 text-[#00F5D4]'
                            : theme === 'light' ? 'bg-[#E9ECEF] text-[#495057]' : 'bg-[#1C1C26] text-[#8B8B96]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className={`text-xs font-semibold truncate ${
                          isParentActive ? (theme === 'light' ? 'text-[#1A1D20] font-bold' : 'text-white font-bold') : ''
                        }`}>
                          {item.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}

                      {item.count && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          theme === 'light' ? 'bg-[#E9ECEF] text-[#00F5D4]' : 'bg-[#1C1C26] text-[#00F5D4]'
                        }`}>
                          {item.count}
                        </span>
                      )}

                      {hasChildren && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSection(item.id);
                          }}
                          className={`p-1 rounded transition ${theme === 'light' ? 'text-[#6C757D] hover:text-[#1A1D20]' : 'text-[#8B8B96] hover:text-white'}`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-[#00F5D4]" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Sub-menu items accordion */}
                  {hasChildren && isExpanded && (
                    <div className={`pl-7 pr-1 py-1 space-y-1 border-l-2 ml-4 transition-all ${
                      theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                    }`}>
                      {item.children.map((child) => {
                        const isChildActive = isParentActive && activeSubTab === child.id;
                        return (
                          <button
                            key={child.id}
                            onClick={(e) => handleChildClick(item.id, child.id, e)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                              isChildActive
                                ? 'bg-[#00F5D4]/15 text-[#00F5D4] font-bold border-l-2 border-[#00F5D4]'
                                : theme === 'light'
                                  ? 'text-[#6C757D] hover:text-[#1A1D20] hover:bg-[#F1F3F5]'
                                  : 'text-[#8B8B96] hover:text-white hover:bg-[#13131A]/40'
                            }`}
                          >
                            <span className="truncate">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Quick Platform Metrics Widget */}
        <div className={`p-3.5 rounded-2xl border space-y-3 ${
          theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold flex items-center gap-1.5 ${theme === 'light' ? 'text-[#212529]' : 'text-white'}`}>
              <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
              Platform Cut
            </span>
            <span className="text-xs font-extrabold text-[#FFD60A]">15% Net</span>
          </div>
          <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
            Creators keep <span className="text-[#00E676] font-bold">85%</span> of guaranteed paid questions and askMail interactions.
          </p>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-[#E9ECEF]' : 'bg-[#1C1C26]'}`}>
            <div className="bg-brand-gradient h-full w-[85%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Footer Info & Theme Toggle Button */}
      <div className={`pt-3 mt-3 border-t flex flex-col gap-2 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'}`}>
        
        {/* Theme Switcher Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`w-full px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
              theme === 'light'
                ? 'bg-[#F1F3F5] text-[#212529] border-[#E9ECEF] hover:bg-[#E9ECEF]'
                : 'bg-[#13131A] text-[#F5F5F7] border-[#1C1C26] hover:border-[#00F5D4]/40'
            }`}
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-[#FFD60A]" />
                  <span>Light Mode Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#7B2FFF]" />
                  <span>Dark Mode Theme</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-gradient text-[#0A0A0F]">
              TOGGLE
            </span>
          </button>
        )}

        <div className={`flex items-center gap-2 text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
          <Lock className="h-3 w-3 text-[#00F5D4]" />
          <span>Futurepast ventures LLP</span>
        </div>
        <span className={`text-[10px] ${theme === 'light' ? 'text-[#6C757D]/70' : 'text-[#8B8B96]/60'}`}>Lake View City, Pune 411047</span>
      </div>
    </aside>
  );
}
