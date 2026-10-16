'use client';

import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { getAdminToken } from '@/utils/cookies';
import StatCard from '@/components/StatCard';
import {
    Radio,
    Users,
    DollarSign,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

export default function AdminDashboardPage() {
    const [dashboardStats, setDashboardStats] = useState({
        totalCreators: 0,
        registeredThisWeek: 0,
        activeStreamers: 0,
        totalViewers: 0,
        totalDonations: 0,
        totalRevenue: 0,
        pendingWithdrawals: 0,
        pendingWithdrawalsAmount: 0,
        pendingKyc: 0,
        commissionRate: 15
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = getAdminToken();
                if (!token) return;

                const res = await fetch(API_ENDPOINTS.ADMIN.DASHBOARD, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.status === 'success' && data.data) {
                    const d = data.data;
                    setDashboardStats({
                        totalCreators: Number(d.totalCreators || 0),
                        registeredThisWeek: Number(d.registeredThisWeek || 0),
                        activeStreamers: Number(d.activeStreamers || 0),
                        totalViewers: Number(d.totalViewers || 0),
                        totalDonations: Number(d.totalDonations || 0),
                        totalRevenue: Number(d.totalRevenue || 0),
                        pendingWithdrawals: Number(d.pendingWithdrawals || 0),
                        pendingWithdrawalsAmount: Number(d.pendingWithdrawalsAmount || 0),
                        pendingKyc: Number(d.pendingKyc || 0),
                        commissionRate: Number(d.commissionRate || 15)
                    });
                }
            } catch (err) {
                console.warn('API fetch dashboard stats warning:', err.message);
            }
        };
        fetchDashboardStats();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Admin Dashboard Overview Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C1C26] pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-heading font-black text-2xl md:text-3xl text-white tracking-tight">
                            Dashboard <span className="text-brand-gradient">Overview</span>
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm text-[#8B8B96] mt-1 max-w-2xl leading-relaxed">
                        Real-time platform statistics, creator activity, total revenue share ({dashboardStats.commissionRate}% platform cut / {100 - dashboardStats.commissionRate}% creator net), pending withdrawals, and KYC verification queues.
                    </p>
                </div>
            </div>

            {/* Admin Dashboard Overview Key Statistics Cards (3 cards per row) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Creators"
                    value={dashboardStats.totalCreators.toLocaleString()}
                    change={`+${dashboardStats.registeredThisWeek} Registered This Week`}
                    subtitle="Active Verified Profiles"
                    icon={Users}
                    accent="teal"
                />
                <StatCard
                    title="Total Viewers"
                    value={dashboardStats.totalViewers.toLocaleString()}
                    change="Registered Viewers & Supporters"
                    subtitle="Platform Active Audience"
                    icon={Users}
                    accent="teal"
                />
                <StatCard
                    title="Active Streamers"
                    value={`${dashboardStats.activeStreamers} Live`}
                    change={dashboardStats.activeStreamers > 0 ? `${dashboardStats.activeStreamers} Active Streams` : 'Live Streamers'}
                    subtitle="YouTube, Twitch, Kick, X"
                    icon={Radio}
                    accent="pink"
                />
                <StatCard
                    title="Total Earning"
                    value={`₹${dashboardStats.totalDonations.toLocaleString()}`}
                    change="Gross Interaction Volume"
                    subtitle="Gross Viewer Interaction Volume"
                    icon={DollarSign}
                    accent="yellow"
                />
                <StatCard
                    title="Total Platform Revenue"
                    value={`₹${dashboardStats.totalRevenue.toLocaleString()}`}
                    change={`${dashboardStats.commissionRate}% Net Commission`}
                    subtitle="Platform Operational Margin"
                    icon={Sparkles}
                    accent="violet"
                />
                <StatCard
                    title="Pending Withdrawals"
                    value={`${dashboardStats.pendingWithdrawals} Requests`}
                    change={`₹${dashboardStats.pendingWithdrawalsAmount.toLocaleString()} Queued`}
                    subtitle="80.3% Net Payout Queue"
                    icon={DollarSign}
                    accent="yellow"
                />
                <StatCard
                    title="Pending KYC"
                    value={`${dashboardStats.pendingKyc} Applications`}
                    change="Identity Verification Queue"
                    subtitle="Awaiting Admin Review"
                    icon={CheckCircle2}
                    accent="teal"
                />
            </section>

            {/* Simple Admin Footer */}
            <footer className="border-t border-[#1C1C26] pt-6 pb-6 text-xs text-[#8B8B96] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        a
                    </div>
                    <span className="font-bold text-white">AskMe Admin</span>
                    <span className="text-[#8B8B96]/40">•</span>
                    <span>© {new Date().getFullYear()} AskMe. All rights reserved.</span>
                </div>
               
            </footer>
        </div>
    );
}
