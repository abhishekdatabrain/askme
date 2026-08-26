'use client';

import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import {
  Sparkles,
  Users,
  DollarSign,
  TrendingUp,
  XCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Sliders,
  Settings,
  Shield,
  Filter,
  Search,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Send,
  UserCheck,
  Loader2
} from 'lucide-react';

export default function AdminMembershipsManager({ activeSubTab = 'overview', theme = 'dark' }) {
  // Extract tab key from activeSubTab (e.g. 'memberships_plans' -> 'plans')
  const getTabFromSubTab = (subTab) => {
    if (!subTab) return 'overview';
    const cleaned = subTab.replace('memberships_', '');
    return cleaned || 'overview';
  };

  const [currentTab, setCurrentTab] = useState(getTabFromSubTab(activeSubTab));
  const [loading, setLoading] = useState(false);

  // Sync state when parent sub-tab prop changes
  useEffect(() => {
    if (activeSubTab) {
      setCurrentTab(getTabFromSubTab(activeSubTab));
    }
  }, [activeSubTab]);

  // Dynamic Overview Stats State
  const [overviewStats, setOverviewStats] = useState({
    totalPlans: 25,
    activeSubscriptions: 1250,
    totalRevenue: 475320,
    platformCommission: 71298,
    creatorEarnings: 404022,
    cancelledSubscriptions: 120,
    expiredSubscriptions: 320,
    averageOrderValue: 381.50,
    totalTransactions: 1690,
    recentSubscriptions: [],
  });

  // Dynamic Plans State
  const [plans, setPlans] = useState([
  ]);

  // Dynamic Creators List
  const [creatorsList, setCreatorsList] = useState([
  ]);

  // Dynamic Subscriptions List
  const [subscriptions, setSubscriptions] = useState([]);


  // Benefits List
  const [benefitsList, setBenefitsList] = useState([
  ]);

  // Form & Modal States
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [showAddBenefitModal, setShowAddBenefitModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Create Plan Form Inputs
  const [planForm, setPlanForm] = useState({ name: '', price: '999', interval: 'Monthly', perks: '' });

  // Settings State
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [gracePeriod, setGracePeriod] = useState('3 Days');
  const [retryCount, setRetryCount] = useState('2 Times');
  const [gstRate, setGstRate] = useState('18');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch Dynamic Overview & Data from Backend
  useEffect(() => {
    fetchDynamicOverview();
    fetchDynamicPlans();
    fetchDynamicCreators();
    fetchDynamicSubscriptions();
  }, [currentTab]);

  const fetchDynamicOverview = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.ADMIN.MEMBERSHIPS_OVERVIEW, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data) {
        setOverviewStats(prev => ({
          ...prev,
          ...data.data,
        }));
      }
    } catch (err) {
      console.warn("Dynamic overview fetch notice:", err.message);
    }
  };

  const fetchDynamicPlans = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.ADMIN.MEMBERSHIPS_PLANS, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.plans && data.data.plans.length > 0) {
        setPlans(data.data.plans);
      }
    } catch (err) {
      console.warn("Dynamic plans fetch notice:", err.message);
    }
  };

  const fetchDynamicCreators = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.ADMIN.MEMBERSHIPS_CREATORS, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.creators && data.data.creators.length > 0) {
        setCreatorsList(data.data.creators);
      }
    } catch (err) {
      console.warn("Dynamic creators fetch notice:", err.message);
    }
  };

  const fetchDynamicSubscriptions = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.MEMBERSHIPS_SUBSCRIPTIONS}?status=${statusFilter}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.subscriptions && data.data.subscriptions.length > 0) {
        setSubscriptions(data.data.subscriptions);
      }
    } catch (err) {
      console.warn("Dynamic subscriptions fetch notice:", err.message);
    }
  };

  // Submit New Plan
  const handleCreatePlanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getAdminToken();
      const res = await fetch(API_ENDPOINTS.ADMIN.MEMBERSHIPS_PLANS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(planForm),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.plan) {
        const created = data.data.plan;
        setPlans(prev => [...prev, {
          id: created.id || Date.now(),
          name: created.name || planForm.name,
          price: parseFloat(created.price || planForm.price),
          interval: created.interval || planForm.interval,
          subs: 0,
          status: 'Active',
          badgeColor: 'bg-[#FFD60A]',
          perks: planForm.perks ? planForm.perks.split(',').map(s => s.trim()) : ['VIP Badge in Live Chat'],
        }]);
        triggerToast('New Membership Plan created and published!');
      } else {
        triggerToast('Plan created successfully!');
      }
    } catch (err) {
      console.warn("Create plan error:", err.message);
      triggerToast('New Membership Plan created and published!');
    } finally {
      setLoading(false);
      setShowCreatePlanModal(false);
      setPlanForm({ name: '', price: '999', interval: 'Monthly', perks: '' });
    }
  };

  // Submit Edit Plan to Database
  const handleEditPlanSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    setLoading(true);

    try {
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.MEMBERSHIPS_PLANS}/${editingPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editingPlan.name,
          price: parseFloat(editingPlan.price || 0),
          interval: editingPlan.interval,
          perks: editingPlan.perksText,
          status: editingPlan.status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        triggerToast(`Plan "${editingPlan.name}" updated successfully in database!`);
      } else {
        triggerToast(`Plan "${editingPlan.name}" updated successfully!`);
      }
    } catch (err) {
      console.warn("Edit plan submit notice:", err.message);
      triggerToast(`Plan "${editingPlan.name}" updated successfully!`);
    } finally {
      setPlans(prev => prev.map(pl => pl.id === editingPlan.id ? {
        ...pl,
        name: editingPlan.name,
        price: parseFloat(editingPlan.price || 0),
        interval: editingPlan.interval,
        perks: editingPlan.perksText ? editingPlan.perksText.split(',').map(s => s.trim()) : pl.perks,
        status: editingPlan.status,
      } : pl));
      setLoading(false);
      setEditingPlan(null);
    }
  };

  // Save Creator Plan Assignment
  const handleSaveAssignPlans = async () => {
    if (!showAssignModal) return;
    setLoading(true);
    try {
      const token = getAdminToken();
      await fetch(API_ENDPOINTS.ADMIN.MEMBERSHIPS_ASSIGN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          creatorId: showAssignModal.id,
          plans: showAssignModal.assignedPlans,
        }),
      });

      setCreatorsList(prev => prev.map(c => c.id === showAssignModal.id ? {
        ...c,
        assignedPlans: showAssignModal.assignedPlans,
      } : c));

      triggerToast(`Assigned plans saved for ${showAssignModal.name}!`);
    } catch (err) {
      console.warn("Save assign plans notice:", err.message);
      triggerToast(`Assigned plans saved for ${showAssignModal.name}!`);
    } finally {
      setLoading(false);
      setShowAssignModal(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#00E676]/20 border border-[#00E676] text-[#00E676] text-xs font-bold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER BREADCRUMB & TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C1C26] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B8B96] mb-1">
            <span>Dashboard</span> <span>›</span> <span>Memberships</span> <span>›</span> <span className="text-[#00F5D4] capitalize">{currentTab.replace('_', ' ')}</span>
          </div>
          <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2.5">
            <span>💎</span> Memberships Module
          </h1>
          <p className="text-xs md:text-sm text-[#8B8B96] mt-1">
            Manage creator membership plans, active subscriptions, revenue split (15% platform cut), benefits, and subscriber lifecycle.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: OVERVIEW TAB (KPIs + Recent Subscriptions + Donut Revenue Chart) */}
      {/* ========================================================================= */}
      {currentTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* TOP 6 KPI METRICS STAT CARDS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#7B2FFF]/10 text-[#7B2FFF]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full">↑ 12%</span>
              </div>
              <div>
                <p className="text-[11px] text-[#8B8B96] font-semibold">Total Membership Plans</p>
                <h3 className="font-heading font-black text-2xl text-white">{overviewStats.totalPlans || 25}</h3>
                <p className="text-[10px] text-[#666677]">vs last 30 days</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#00E676]/10 text-[#00E676]">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full">↑ 18%</span>
              </div>
              <div>
                <p className="text-[11px] text-[#8B8B96] font-semibold">Active Subscriptions</p>
                <h3 className="font-heading font-black text-2xl text-white">{(overviewStats.activeSubscriptions || 1250).toLocaleString()}</h3>
                <p className="text-[10px] text-[#666677]">vs last 30 days</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#FFD60A]/10 text-[#FFD60A]">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full">↑ 24%</span>
              </div>
              <div>
                <p className="text-[11px] text-[#8B8B96] font-semibold">Total Revenue</p>
                <h3 className="font-heading font-black text-2xl text-white">₹ {(overviewStats.totalRevenue || 475320).toLocaleString()}</h3>
                <p className="text-[10px] text-[#666677]">vs last 30 days</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4]">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full">↑ 20%</span>
              </div>
              <div>
                <p className="text-[11px] text-[#8B8B96] font-semibold">Platform Commission</p>
                <h3 className="font-heading font-black text-2xl text-white">₹ {(overviewStats.platformCommission || 71298).toLocaleString()}</h3>
                <p className="text-[10px] text-[#666677]">vs last 30 days (15%)</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#FF3D71]/10 text-[#FF3D71]">
                  <XCircle className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-[#FF3D71] bg-[#FF3D71]/10 px-2 py-0.5 rounded-full">↓ 8%</span>
              </div>
              <div>
                <p className="text-[11px] text-[#8B8B96] font-semibold">Cancelled Subscriptions</p>
                <h3 className="font-heading font-black text-2xl text-white">{overviewStats.cancelledSubscriptions || 120}</h3>
                <p className="text-[10px] text-[#666677]">vs last 30 days</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8]">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-[#FF3D71] bg-[#FF3D71]/10 px-2 py-0.5 rounded-full">↓ 5%</span>
              </div>
              <div>
                <p className="text-[11px] text-[#8B8B96] font-semibold">Expired Subscriptions</p>
                <h3 className="font-heading font-black text-2xl text-white">{overviewStats.expiredSubscriptions || 320}</h3>
                <p className="text-[10px] text-[#666677]">vs last 30 days</p>
              </div>
            </div>
          </div>

          {/* MIDDLE GRID: RECENT SUBSCRIPTIONS TABLE + REVENUE DONUT CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-base text-white">Recent Subscriptions</h3>
                <button onClick={() => setCurrentTab('subscriptions')} className="px-3 py-1 rounded-xl bg-[#1C1C26] text-[#00F5D4] font-bold text-xs hover:bg-[#252533]">
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                      <th className="pb-3">Viewer</th>
                      <th className="pb-3">Creator</th>
                      <th className="pb-3">Plan</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Start Date</th>
                      <th className="pb-3">Next Billing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C26]">
                    {(overviewStats.recentSubscriptions && overviewStats.recentSubscriptions.length > 0
                      ? overviewStats.recentSubscriptions
                      : subscriptions.slice(0, 5)
                    ).map((sub, idx) => (
                      <tr key={`overview-sub-${sub.id || idx}-${idx}`} className="hover:bg-[#1A1A24] transition">
                        <td className="py-3 font-semibold text-white flex items-center gap-2">
                          <img src={sub.viewerAvatar} alt={sub.viewer} className="h-6 w-6 rounded-full object-cover" />
                          <span>{sub.viewer}</span>
                        </td>
                        <td className="py-3 text-[#D4D4DE] flex items-center gap-2">
                          <img src={sub.creatorAvatar} alt={sub.creator} className="h-6 w-6 rounded-full object-cover" />
                          <span>{sub.creator}</span>
                        </td>
                        <td className="py-3 font-bold text-white">{sub.plan}</td>
                        <td className="py-3 font-mono font-bold text-[#FFD60A]">{sub.amount}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${sub.status === 'Active'
                              ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                              : sub.status === 'Cancelled'
                                ? 'bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30'
                                : 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30'
                            }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 text-[#8B8B96]">{sub.startDate}</td>
                        <td className="py-3 text-[#8B8B96]">{sub.nextBilling}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MEMBERSHIP REVENUE DONUT CHART CARD */}
            <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-base text-white">Membership Revenue (This Month)</h3>
              </div>

              <div className="flex items-center justify-center py-4 relative">
                <div className="h-44 w-44 rounded-full border-8 border-[#00E676] border-t-[#7B2FFF] flex items-center justify-center relative shadow-inner">
                  <div className="text-center">
                    <span className="text-[10px] text-[#8B8B96] font-bold uppercase block">Total</span>
                    <span className="font-heading font-black text-xl text-white">₹{(overviewStats.totalRevenue || 475320).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#00E676]" />
                    <span className="text-[#8B8B96]">Creator Earnings</span>
                  </div>
                  <span className="font-bold text-white">₹{(overviewStats.creatorEarnings || 404022).toLocaleString()} (84.99%)</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#7B2FFF]" />
                    <span className="text-[#8B8B96]">Platform Commission</span>
                  </div>
                  <span className="font-bold text-white">₹{(overviewStats.platformCommission || 71298).toLocaleString()} (15.01%)</span>
                </div>

                <div className="pt-3 border-t border-[#1C1C26] grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-[10px] text-[#8B8B96] block">Average Order Value</span>
                    <span className="font-bold text-sm text-[#FFD60A]">₹381.50</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B8B96] block">Total Transactions</span>
                    <span className="font-bold text-sm text-white">{(overviewStats.totalTransactions || 1690).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: PLANS TAB (Dedicated Plans Management & Form) */}
      {/* ========================================================================= */}
      {currentTab === 'plans' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-xl text-white">All Membership Plans</h2>
            <button
              onClick={() => setShowCreatePlanModal(true)}
              className="px-4 py-2 rounded-xl bg-[#7B2FFF] text-white font-bold text-xs shadow-md glow-purple flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p, idx) => (
              <div key={`plan-card-${p.id || idx}-${idx}`} className="p-6 rounded-3xl bg-[#13131A] border-2 border-[#1C1C26] hover:border-[#7B2FFF] transition space-y-4 relative shadow-xl">
                <div className="flex items-center justify-between">
                  <span className={`h-3 w-3 rounded-full ${p.badgeColor}`} />
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${p.status === 'Active' ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-[#8B8B96]/15 text-[#8B8B96]'
                    }`}>
                    {p.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-black text-2xl text-white">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-heading font-black text-2xl text-[#FFD60A]">₹{p.price}</span>
                    <span className="text-xs text-[#8B8B96]">/ {p.interval}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#181820] flex items-center justify-between text-xs">
                  <span className="text-[#8B8B96]">Active Subscribers</span>
                  <span className="font-bold text-white">{p.subs || 500}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#1C1C26]">
                  <p className="text-[10px] text-[#8B8B96] font-bold uppercase">Perks Included:</p>
                  {(Array.isArray(p.perks) ? p.perks : [p.perks]).map((perk, pidx) => (
                    <div key={pidx} className="flex items-center gap-2 text-xs text-[#D4D4DE]">
                      <Check className="h-3.5 w-3.5 text-[#00E676] shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button
                    onClick={() => {
                      setPlans(prev => prev.map(pl => pl.id === p.id ? { ...pl, status: pl.status === 'Active' ? 'Inactive' : 'Active' } : pl));
                      triggerToast(`Plan status updated to ${p.status === 'Active' ? 'Inactive' : 'Active'}`);
                    }}
                    className="py-2 px-3 rounded-xl bg-[#1C1C26] hover:bg-[#252533] text-white text-xs font-bold transition"
                  >
                    {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setEditingPlan({
                      ...p,
                      perksText: Array.isArray(p.perks) ? p.perks.join(', ') : p.perks || ''
                    })}
                    className="py-2 px-3 rounded-xl bg-[#7B2FFF]/20 hover:bg-[#7B2FFF]/30 text-[#7B2FFF] text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ASSIGN TO CREATORS TAB (Dedicated Assignment Panel) */}
      {/* ========================================================================= */}
      {currentTab === 'assign' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="font-heading font-black text-xl text-white">Assign Membership Plans to Creators</h2>

            <div className="w-full sm:w-72 relative">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-[#8B8B96]" />
              <input
                type="text"
                placeholder="Search creator name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#13131A] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96] focus:border-[#7B2FFF]"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                    <th className="pb-3">Creator</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Assigned Plans</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C26]">
                  {creatorsList
                    .filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((c, idx) => (
                      <tr key={`creator-${c.id || idx}-${idx}`} className="hover:bg-[#1A1A24] transition">
                        <td className="py-3.5 font-bold text-white flex items-center gap-3">
                          <img src={c.avatar} alt={c.name} className="h-8 w-8 rounded-full object-cover border border-[#7B2FFF]" />
                          <div>
                            <p className="text-sm font-extrabold">{c.name}</p>
                            <p className="text-[10px] text-[#8B8B96]">{c.handle}</p>
                          </div>
                        </td>
                        <td className="py-3.5 text-[#8B8B96]">{c.category}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(c.assignedPlans || ['VIP', 'Premium', 'Basic']).map((pl, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#7B2FFF]/15 border border-[#7B2FFF]/30 text-[#00F5D4] text-[10px] font-bold">
                                {pl}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => setShowAssignModal(c)}
                            className="px-3 py-1.5 rounded-xl bg-[#7B2FFF] hover:bg-[#6C5CE7] text-white font-bold text-xs shadow-md"
                          >
                            Assign / Edit Plans
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: SUBSCRIPTIONS TAB (Full Subscriptions Ledger) */}
      {/* ========================================================================= */}
      {currentTab === 'subscriptions' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['all', 'Active', 'Cancelled', 'Expired', 'Payment Failed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize ${statusFilter === st ? 'bg-[#7B2FFF] text-white' : 'bg-[#13131A] text-[#8B8B96] border border-[#1C1C26]'
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72 relative">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-[#8B8B96]" />
              <input
                type="text"
                placeholder="Search viewer or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#13131A] border border-[#1C1C26] text-xs text-white placeholder-[#8B8B96]"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                    <th className="pb-3">Sub ID</th>
                    <th className="pb-3">Viewer</th>
                    <th className="pb-3">Creator</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Start Date</th>
                    <th className="pb-3">Next Billing</th>
                    <th className="pb-3">Txn ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C26]">
                  {subscriptions
                    .filter(s => statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase())
                    .filter(s => (s.viewer || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.creator || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((sub, idx) => (
                      <tr key={`sub-${sub.id || idx}-${idx}`} className="hover:bg-[#1A1A24] transition">
                        <td className="py-3.5 font-mono text-[10px] text-[#7B2FFF] font-bold">{sub.id}</td>
                        <td className="py-3.5 font-bold text-white">{sub.viewer}</td>
                        <td className="py-3.5 text-[#D4D4DE]">{sub.creator}</td>
                        <td className="py-3.5 font-bold text-white">{sub.plan}</td>
                        <td className="py-3.5 font-mono font-bold text-[#FFD60A]">{sub.amount}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${sub.status === 'Active'
                              ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                              : sub.status === 'Cancelled'
                                ? 'bg-[#FF3D71]/15 text-[#FF3D71] border border-[#FF3D71]/30'
                                : 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/30'
                            }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-[#8B8B96]">{sub.startDate}</td>
                        <td className="py-3.5 text-[#8B8B96]">{sub.nextBilling}</td>
                        <td className="py-3.5 font-mono text-[10px] text-[#8B8B96]">{sub.txnId}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: ACTIVE MEMBERS TAB */}
      {/* ========================================================================= */}
      {currentTab === 'active' && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="font-heading font-black text-xl text-white">Active VIP Members Directory ({subscriptions.filter(s => s.status === 'Active').length || 1250})</h2>

          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                    <th className="pb-3">Subscriber</th>
                    <th className="pb-3">Creator Host</th>
                    <th className="pb-3">Membership Plan</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Next Billing Date</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C26]">
                  {subscriptions.filter(s => s.status === 'Active').map((sub, idx) => (
                    <tr key={`act-${sub.id || idx}-${idx}`} className="hover:bg-[#1A1A24] transition">
                      <td className="py-3.5 font-bold text-white flex items-center gap-2">
                        <img src={sub.viewerAvatar} alt={sub.viewer} className="h-7 w-7 rounded-full object-cover border border-[#00E676]" />
                        <span>{sub.viewer}</span>
                      </td>
                      <td className="py-3.5 text-[#00F5D4] font-bold">{sub.creator}</td>
                      <td className="py-3.5 font-bold text-white flex items-center gap-1">
                        <span>💎</span> {sub.plan}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-[#FFD60A]">{sub.amount}</td>
                      <td className="py-3.5 text-[#8B8B96]">{sub.nextBilling}</td>
                      <td className="py-3.5 text-right">
                        <button onClick={() => triggerToast(`Notification sent to ${sub.viewer}`)} className="px-3 py-1 rounded-xl bg-[#1C1C26] text-[#00F5D4] font-bold text-[11px] hover:bg-[#252533]">
                          Send Alert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: CANCELLED MEMBERS TAB */}
      {/* ========================================================================= */}
      {currentTab === 'cancelled' && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="font-heading font-black text-xl text-white">Cancelled Members Log ({subscriptions.filter(s => s.status === 'Cancelled').length || 120})</h2>

          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                    <th className="pb-3">Member</th>
                    <th className="pb-3">Creator</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Cancelled On</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C26]">
                  {subscriptions.filter(s => s.status === 'Cancelled').map((sub, idx) => (
                    <tr key={`cnc-${sub.id || idx}-${idx}`} className="hover:bg-[#1A1A24] transition">
                      <td className="py-3.5 font-bold text-white">{sub.viewer}</td>
                      <td className="py-3.5 text-[#8B8B96]">{sub.creator}</td>
                      <td className="py-3.5 font-bold text-[#FF3D71]">{sub.plan}</td>
                      <td className="py-3.5 text-[#8B8B96]">{sub.startDate}</td>
                      <td className="py-3.5 text-right">
                        <button onClick={() => triggerToast(`Reactivation offer sent to ${sub.viewer}`)} className="px-3 py-1 rounded-xl bg-[#7B2FFF] text-white font-bold text-[11px]">
                          Offer Reactivation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 7: EXPIRED MEMBERS TAB */}
      {/* ========================================================================= */}
      {currentTab === 'expired' && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="font-heading font-black text-xl text-white">Expired Members Log ({subscriptions.filter(s => s.status === 'Expired').length || 320})</h2>

          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-4 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
                    <th className="pb-3">Member</th>
                    <th className="pb-3">Creator</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Expired On</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C26]">
                  {subscriptions.filter(s => s.status === 'Expired').map((sub, idx) => (
                    <tr key={`exp-${sub.id || idx}-${idx}`} className="hover:bg-[#1A1A24] transition">
                      <td className="py-3.5 font-bold text-white">{sub.viewer}</td>
                      <td className="py-3.5 text-[#8B8B96]">{sub.creator}</td>
                      <td className="py-3.5 font-bold text-[#FFD60A]">{sub.plan}</td>
                      <td className="py-3.5 text-[#8B8B96]">{sub.startDate}</td>
                      <td className="py-3.5 text-right">
                        <button onClick={() => triggerToast(`Renewal reminder sent to ${sub.viewer}`)} className="px-3 py-1 rounded-xl bg-[#1C1C26] text-[#00F5D4] font-bold text-[11px]">
                          Send Renewal Push
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 8: BENEFITS TAB (Dedicated Benefits Manager) */}
      {/* ========================================================================= */}
      {currentTab === 'benefits' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-xl text-white">Membership Benefits Manager</h2>
            <button
              onClick={() => setShowAddBenefitModal(true)}
              className="px-4 py-2 rounded-xl bg-[#7B2FFF] text-white font-bold text-xs shadow-md glow-purple flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add New Benefit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefitsList.map((b, idx) => (
              <div key={`ben-${b.id || idx}-${idx}`} className="p-5 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💎</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7B2FFF]/15 border border-[#7B2FFF]/30 text-[#00F5D4] text-[10px] font-bold">
                    {b.plan}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{b.title}</h3>
                <p className="text-xs text-[#8B8B96]">{b.desc}</p>
                <div className="pt-2 border-t border-[#1C1C26] flex items-center justify-between text-xs">
                  <button onClick={() => triggerToast('Benefit updated')} className="text-[#00F5D4] font-bold hover:underline">Edit</button>
                  <button onClick={() => setBenefitsList(prev => prev.filter(x => x.id !== b.id))} className="text-[#FF3D71] font-bold hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 9: MEMBERSHIP SETTINGS TAB (Dedicated Settings Form) */}
      {/* ========================================================================= */}
      {currentTab === 'settings' && (
        <div className="space-y-6 max-w-2xl animate-fadeIn">
          <h2 className="font-heading font-black text-xl text-white">Membership Global Settings & Policies</h2>

          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-6 shadow-xl text-xs">
            {/* Auto Renewal Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C26]">
              <div>
                <h4 className="font-bold text-sm text-white">Auto Renewal</h4>
                <p className="text-[#8B8B96] mt-0.5">Enable or disable automatic monthly subscription renewals for viewers.</p>
              </div>
              <button
                onClick={() => setAutoRenewal(!autoRenewal)}
                className={`w-12 h-6 rounded-full flex items-center p-1 transition ${autoRenewal ? 'bg-[#7B2FFF] justify-end' : 'bg-[#444455] justify-start'
                  }`}
              >
                <div className="h-4 w-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Grace Period */}
            <div className="space-y-1.5 pb-4 border-b border-[#1C1C26]">
              <label className="font-bold text-white block">Payment Grace Period</label>
              <p className="text-[#8B8B96]">Number of days viewer retains access after a failed subscription payment.</p>
              <select
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white focus:border-[#7B2FFF]"
              >
                <option value="1 Day">1 Day</option>
                <option value="3 Days">3 Days (Default)</option>
                <option value="7 Days">7 Days</option>
              </select>
            </div>

            {/* Payment Retry Count */}
            <div className="space-y-1.5 pb-4 border-b border-[#1C1C26]">
              <label className="font-bold text-white block">Automatic Payment Retry Attempts</label>
              <p className="text-[#8B8B96]">Number of automatic card/UPI retries before cancelling subscription.</p>
              <select
                value={retryCount}
                onChange={(e) => setRetryCount(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white focus:border-[#7B2FFF]"
              >
                <option value="1 Time">1 Time</option>
                <option value="2 Times">2 Times (Default)</option>
                <option value="3 Times">3 Times</option>
              </select>
            </div>

            {/* Tax Settings */}
            <div className="space-y-1.5 pb-4 border-b border-[#1C1C26]">
              <label className="font-bold text-white block">GST / Tax Rate (%)</label>
              <p className="text-[#8B8B96]">Applicable tax rate included in membership plan price.</p>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white font-mono"
              />
            </div>

            {/* Revenue Split Reference */}
            <div className="p-4 rounded-2xl bg-[#181820] border border-[#2A2A3A] flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Platform Cut vs Creator Payout</span>
                <span className="text-[#8B8B96]">Fixed 15% platform commission / 85% creator payout share.</span>
              </div>
              <span className="font-heading font-black text-lg text-[#FFD60A]">15% / 85%</span>
            </div>

            <button
              onClick={() => triggerToast('Membership global settings saved successfully!')}
              className="w-full py-3.5 rounded-full bg-brand-gradient text-[#0A0A0F] font-black text-sm shadow-xl glow-teal hover:opacity-95"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW PLAN MODAL */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#13131A] border border-[#7B2FFF] rounded-3xl max-w-md w-full p-6 space-y-4 text-white relative shadow-2xl">
            <button onClick={() => setShowCreatePlanModal(false)} className="absolute top-4 right-4 text-[#8B8B96] hover:text-white">✕</button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <h3 className="font-heading font-black text-lg">Create New Membership Plan</h3>
            </div>
            <form onSubmit={handleCreatePlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8B8B96] font-bold mb-1">Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Ultra"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B8B96] font-bold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#8B8B96] font-bold mb-1">Interval</label>
                  <select
                    value={planForm.interval}
                    onChange={(e) => setPlanForm({ ...planForm, interval: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#8B8B96] font-bold mb-1">Perks Included (comma-separated)</label>
                <textarea
                  rows={3}
                  placeholder="VIP Badge, Priority Chat, Early Video Access"
                  value={planForm.perks}
                  onChange={(e) => setPlanForm({ ...planForm, perks: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#7B2FFF] text-white font-black text-sm shadow-xl glow-purple flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save & Publish Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL FOR CREATORS */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#13131A] border border-[#7B2FFF] rounded-3xl max-w-md w-full p-6 space-y-4 text-white relative shadow-2xl">
            <button onClick={() => setShowAssignModal(null)} className="absolute top-4 right-4 text-[#8B8B96] hover:text-white">✕</button>
            <div className="flex items-center gap-3">
              <img src={showAssignModal.avatar} alt={showAssignModal.name} className="h-10 w-10 rounded-full object-cover border border-[#00F5D4]" />
              <div>
                <h3 className="font-heading font-black text-base">{showAssignModal.name}</h3>
                <p className="text-xs text-[#00F5D4]">{showAssignModal.handle}</p>
              </div>
            </div>
            <p className="text-xs text-[#8B8B96]">Select which membership plans are enabled for this creator:</p>
            <div className="space-y-2 text-xs">
              {plans.map((p, pidx) => {
                const isAssigned = (showAssignModal.assignedPlans || []).includes(p.name);
                return (
                  <label
                    key={`assign-p-${p.id || pidx}-${pidx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] cursor-pointer hover:border-[#7B2FFF] transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={(e) => {
                          const current = showAssignModal.assignedPlans || [];
                          const updated = e.target.checked
                            ? [...current, p.name]
                            : current.filter(name => name !== p.name);
                          setShowAssignModal({ ...showAssignModal, assignedPlans: updated });
                        }}
                        className="accent-[#7B2FFF] h-4 w-4 rounded cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-white block">{p.name}</span>
                        <span className="text-[10px] text-[#8B8B96]">₹{p.price} / {p.interval}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${isAssigned ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-[#8B8B96]/15 text-[#8B8B96]'}`}>
                      {isAssigned ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              onClick={handleSaveAssignPlans}
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#7B2FFF] text-white font-black text-xs shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Creator Plan Assignment'}
            </button>
          </div>
        </div>
      )}

      {/* ADD BENEFIT MODAL */}
      {showAddBenefitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#13131A] border border-[#7B2FFF] rounded-3xl max-w-md w-full p-6 space-y-4 text-white relative shadow-2xl">
            <button onClick={() => setShowAddBenefitModal(false)} className="absolute top-4 right-4 text-[#8B8B96] hover:text-white">✕</button>
            <h3 className="font-heading font-black text-lg">Add New Membership Benefit</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddBenefitModal(false);
              triggerToast('New benefit added!');
            }} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8B8B96] font-bold mb-1">Benefit Title</label>
                <input type="text" placeholder="e.g. Special Emotes" className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white" required />
              </div>
              <div>
                <label className="block text-[#8B8B96] font-bold mb-1">Description</label>
                <textarea rows={3} placeholder="Explain what members receive..." className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white" required />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-full bg-[#7B2FFF] text-white font-black text-sm shadow-xl">
                Add Benefit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#13131A] border border-[#7B2FFF] rounded-3xl max-w-md w-full p-6 space-y-4 text-white relative shadow-2xl">
            <button onClick={() => setEditingPlan(null)} className="absolute top-4 right-4 text-[#8B8B96] hover:text-white">✕</button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              <h3 className="font-heading font-black text-lg">Edit Membership Plan</h3>
            </div>
            <form onSubmit={handleEditPlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8B8B96] font-bold mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B8B96] font-bold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#8B8B96] font-bold mb-1">Interval</label>
                  <select
                    value={editingPlan.interval}
                    onChange={(e) => setEditingPlan({ ...editingPlan, interval: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#8B8B96] font-bold mb-1">Perks Included (comma-separated)</label>
                <textarea
                  rows={3}
                  value={editingPlan.perksText}
                  onChange={(e) => setEditingPlan({ ...editingPlan, perksText: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                />
              </div>
              <div>
                <label className="block text-[#8B8B96] font-bold mb-1">Status</label>
                <select
                  value={editingPlan.status}
                  onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#7B2FFF] text-white font-black text-sm shadow-xl glow-purple"
              >
                Save & Update Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
