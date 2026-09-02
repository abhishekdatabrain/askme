'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import {
  Sparkles,
  Users,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  User,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
  Edit,
  Trash2,
  XCircle,
  Crown
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';

export default function CreatorMembershipsPage() {
  const { toast } = useToast();
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [subscribersList, setSubscribersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatorUser, setCreatorUser] = useState(null);

  // Theme State
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
      setTheme(savedTheme);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('creator-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('creator-theme-changed', handleThemeChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_creator_theme', nextTheme);
      window.dispatchEvent(new Event('creator-theme-changed'));
    }
  };

  // Modal & Form State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    interval: '',
    perks: '',
    badgeColor: 'bg-[#FFD60A]',
    status: 'Active',
  });

  useEffect(() => {
    const u = getCreatorUser();
    if (u) setCreatorUser(u);

    fetchPlans();
    fetchSubscribers();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const token = getCreatorToken();
      const u = getCreatorUser();
      const creatorId = u?.id;

      const res = await fetch(`${API_ENDPOINTS.CREATORS.MEMBERSHIPS_PLANS}?creatorId=${creatorId || ''}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.plans) {
        setMembershipPlans(data.data.plans);
      }
    } catch (err) {
      console.warn('Fetch plans error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const token = getCreatorToken();
      const u = getCreatorUser();
      const creatorId = u?.id;

      const res = await fetch(`${API_ENDPOINTS.CREATORS.MEMBERSHIPS_SUBSCRIBERS}?creatorId=${creatorId || ''}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.subscribers) {
        setSubscribersList(data.data.subscribers);
      }
    } catch (err) {
      console.warn('Fetch subscribers error:', err.message);
    }
  };

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      price: '',
      interval: '',
      perks: '',
      badgeColor: 'bg-[#FFD60A]',
      status: 'Active',
    });
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name || '',
      price: String(plan.price || 499),
      interval: plan.interval || 'Monthly',
      perks: Array.isArray(plan.perks) ? plan.perks.join(', ') : (plan.perks || ''),
      badgeColor: plan.badgeColor || 'bg-[#FFD60A]',
      status: plan.status || 'Active',
    });
    setShowPlanModal(true);
  };

  const handleSavePlanSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSavingPlan(true);
      const token = getCreatorToken();
      const u = getCreatorUser();
      const creatorId = u?.id;
      const perksArr = planForm.perks.split(',').map(s => s.trim()).filter(Boolean);

      if (editingPlan) {
        // Update Plan
        const res = await fetch(`${API_ENDPOINTS.CREATORS.MEMBERSHIPS_PLANS}/${editingPlan.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ...planForm,
            perks: perksArr,
          }),
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          toast.success('Membership Tier updated successfully!', 'Tier Updated');
          setMembershipPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planForm, perks: perksArr, price: parseFloat(planForm.price) } : p));
          setShowPlanModal(false);
        }
      } else {
        // Create Plan
        const res = await fetch(API_ENDPOINTS.CREATORS.MEMBERSHIPS_PLANS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            creatorId,
            ...planForm,
            perks: perksArr,
          }),
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          toast.success('New Membership Tier published live!', 'Tier Created');
          if (data.data?.plan) {
            setMembershipPlans(prev => [data.data.plan, ...prev]);
          } else {
            fetchPlans();
          }
          setShowPlanModal(false);
        }
      }
    } catch (err) {
      toast.error('Failed to save membership tier plan.', 'Error');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlanSubmit = async (planId) => {
    if (!confirm('Are you sure you want to delete this membership tier?')) return;
    try {
      const token = getCreatorToken();
      await fetch(`${API_ENDPOINTS.CREATORS.MEMBERSHIPS_PLANS}/${planId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.info('Membership tier deleted.', 'Deleted');
      setMembershipPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      toast.error('Failed to delete tier.', 'Error');
    }
  };

  return (
    <>
      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* TOP NAVBAR */}
        <header className={`sticky top-0 z-20 border-b px-6 py-3.5 flex items-center justify-between backdrop-blur-md transition-colors ${theme === 'light' ? 'bg-white/90 border-[#E9ECEF]' : 'bg-[#13131A]/90 border-[#1C1C26]'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FFD60A]/10 text-[#FFD60A]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className={`font-heading font-black text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                Memberships & VIP Tiers
              </h1>
              <p className="text-xs text-[#8B8B96]">
                Manage public VIP membership perks, pricing, and active fan subscribers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Dropdown */}
            <CreatorNotificationDropdown theme={theme} />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition ${theme === 'light'
                ? 'bg-[#F1F3F5] border-[#DEE2E6] text-[#495057] hover:text-[#1A1D20]'
                : 'bg-[#1C1C26] border-[#2A2A38] text-[#8B8B96] hover:text-white'
                }`}
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Creator Profile Link */}
            <Link href="/creators/profile" className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition ${theme === 'light' ? 'bg-[#F1F3F5] border-[#DEE2E6]' : 'bg-[#1C1C26] border-[#2A2A38]'}`}>
              {creatorUser?.profileImage ? (
                <img src={creatorUser.profileImage} alt={creatorUser.fullName} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-[#00F5D4]" />
              )}
              <span className="text-xs font-bold text-white max-w-[100px] truncate">
                {creatorUser?.fullName || 'Creator'}
              </span>
            </Link>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
          {/* Header Banner */}
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] text-xs font-black uppercase tracking-wider">
                  💎 RECURRING FAN MEMBERSHIPS
                </span>
              </div>
              <h2 className={`font-heading font-black text-2xl md:text-3xl tracking-tight mt-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                Active Membership <span className="text-brand-gradient">Tiers & Perks</span>
              </h2>
              <p className={`text-xs md:text-sm mt-1 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                Tiers displayed to fans on your public AskMe profile viewer. Fans get VIP chat badges, priority live Q&A queues, and exclusive perks.
              </p>
            </div>

            <button
              onClick={handleOpenCreatePlan}
              className="px-5 py-3 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-lg glow-teal hover:scale-105 transition-all flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="h-5 w-5 stroke-[2.5]" /> Create Membership Tier
            </button>
          </div>

          {/* Tiers Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
              <span className="text-xs font-bold text-[#8B8B96] uppercase flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#FFD60A]" /> Active Configured Tiers
              </span>
              <div className={`font-heading font-extrabold text-2xl mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                {membershipPlans.length} Active Tiers
              </div>
              <span className="text-[11px] text-[#00E676] font-semibold">Live on Public Profile</span>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
              <span className="text-xs font-bold text-[#8B8B96] uppercase flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[#7B2FFF]" /> Active Subscribed Fans
              </span>
              <div className="font-heading font-extrabold text-2xl mt-1 text-[#7B2FFF]">
                {subscribersList.length} Members
              </div>
              <span className="text-[11px] text-[#8B8B96]">Recurring fan support</span>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A]'}`}>
              <span className="text-xs font-bold text-[#8B8B96] uppercase flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#00F5D4]" /> Monthly Membership Revenue
              </span>
              <div className={`font-heading font-extrabold text-2xl mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                ₹{subscribersList.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString('en-IN') || (membershipPlans.length * 499).toLocaleString('en-IN')} / mo
              </div>
              <span className="text-[11px] text-[#00E676] font-semibold">85% Creator Net Payout</span>
            </div>
          </div>

          {/* Active Membership Tier Cards */}
          <div className="space-y-3">
            <h3 className={`font-heading font-bold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
              Your Active Public Membership Tiers
            </h3>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#8B8B96] flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-[#00F5D4]" /> Loading Membership Tiers...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {membershipPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-3xl border-2 shadow-xl space-y-4 relative flex flex-col justify-between transition-all ${theme === 'light' ? 'bg-white border-[#E9ECEF] hover:border-[#00F5D4]' : 'bg-[#13131A] border-[#1C1C26] hover:border-[#00F5D4]/50'
                      }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${plan.badgeColor || 'bg-[#FFD60A]'} text-[#0A0A0F]`}>
                          {plan.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-bold">
                          {plan.status || 'Active'}
                        </span>
                      </div>

                      <div>
                        <div className={`font-heading font-black text-2xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                          ₹{plan.price.toLocaleString('en-IN')} <span className="text-xs font-semibold text-[#8B8B96]">/ {plan.interval || 'Month'}</span>
                        </div>
                        <p className="text-xs text-[#8B8B96] mt-0.5">Public Fan Tier Perks:</p>
                      </div>

                      <ul className="space-y-2 text-xs">
                        {(Array.isArray(plan.perks) ? plan.perks : String(plan.perks || '').split(',')).map((perk, pIdx) => (
                          <li key={pIdx} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#00E676] shrink-0" />
                            <span className={theme === 'light' ? 'text-[#343A40]' : 'text-[#D1D5DB]'}>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-[#1C1C26] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className="flex-1 py-2 rounded-xl bg-[#1C1C26] text-white hover:bg-[#00F5D4] hover:text-[#0A0A0F] font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit Tier
                      </button>
                      <button
                        onClick={() => handleDeletePlanSubmit(plan.id)}
                        className="px-3 py-2 rounded-xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 hover:bg-[#FF3D71]/20 font-bold text-xs transition flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fan Subscribers List */}
          <div className={`p-6 rounded-3xl border space-y-4 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-heading font-bold text-lg ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                  Active Fan Members ({subscribersList.length})
                </h3>
                <p className="text-xs text-[#8B8B96]">Fans currently subscribed to your active membership tiers.</p>
              </div>
            </div>

            {subscribersList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8B8B96]">
                No active subscribers yet. Share your AskMe profile link with fans to start building your recurring VIP community!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase tracking-wider ${theme === 'light' ? 'border-[#E9ECEF] text-[#6C757D]' : 'border-[#1C1C26] text-[#8B8B96]'}`}>
                      <th className="py-3 px-4">Fan / Viewer</th>
                      <th className="py-3 px-4">Tier Plan</th>
                      <th className="py-3 px-4">Monthly Fee</th>
                      <th className="py-3 px-4">Subscribed Date</th>
                      <th className="py-3 px-4">Next Billing</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'light' ? 'divide-[#E9ECEF]' : 'divide-[#1C1C26]'}`}>
                    {subscribersList.map((sub) => (
                      <tr key={sub.id} className={theme === 'light' ? 'hover:bg-[#F8F9FA]' : 'hover:bg-[#1A1A26]'}>
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <User className="h-4 w-4 text-[#00F5D4]" />
                          <div>
                            <div>{sub.viewerName}</div>
                            <div className="text-[10px] font-normal text-[#8B8B96]">{sub.viewerEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#FFD60A]">{sub.planName}</td>
                        <td className="py-3 px-4 font-bold text-[#00E676]">₹{sub.amount}</td>
                        <td className="py-3 px-4 text-[#8B8B96]">{sub.startDate}</td>
                        <td className="py-3 px-4 text-[#8B8B96]">{sub.nextBillingDate}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-[10px] font-bold">
                            Active Member
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE / EDIT TIER PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#13131A] border border-[#00F5D4]/50 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 text-[#8B8B96] hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#FFD60A]" />
              <h3 className="font-heading font-black text-xl">
                {editingPlan ? 'Edit Membership Tier' : 'Create New Membership Tier'}
              </h3>
            </div>

            <form onSubmit={handleSavePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-[#8B8B96]">Tier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Membership, Gold Fan Pass"
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-[#8B8B96]">Monthly Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    placeholder="499"
                    value={planForm.price}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-[#8B8B96]">Billing Interval</label>
                  <select
                    value={planForm.interval}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, interval: e.target.value }))}
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-[#8B8B96]">Tier Perks (comma-separated)</label>
                <textarea
                  rows={3}
                  placeholder="VIP Chat Badge, Priority Q&A Queue, Member-Only Live Sessions, Custom Emojis"
                  value={planForm.perks}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, perks: e.target.value }))}
                  className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-[#8B8B96]">Badge Color Accent</label>
                  <select
                    value={planForm.badgeColor}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, badgeColor: e.target.value }))}
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  >
                    <option value="bg-[#FFD60A]">Gold / Yellow</option>
                    <option value="bg-[#7B2FFF]">Purple / Violet</option>
                    <option value="bg-[#00F5D4]">Cyan / Teal</option>
                    <option value="bg-[#FF3D71]">Pink / Magenta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-[#8B8B96]">Tier Status</label>
                  <select
                    value={planForm.status}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                  >
                    <option value="Active">Active (Visible to Fans)</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#1C1C26] text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-black text-xs shadow-md glow-teal flex items-center gap-1.5"
                >
                  {isSavingPlan ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {editingPlan ? 'Save & Update Tier' : 'Publish Membership Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
