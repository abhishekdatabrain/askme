'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Clock,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Edit3,
  RefreshCw,
  XCircle,
  HelpCircle,
  HelpCircle as QuestionMarkIcon
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { getAdminToken } from '@/utils/cookies';

export default function CreatorWalletDetailPage({ params }) {
  const unwrappedParams = use(params);
  const creatorId = unwrappedParams.id;
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [creator, setCreator] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Balance edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBalanceInput, setEditBalanceInput] = useState('');
  const [bonusCreditInput, setBonusCreditInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const fetchCreatorDetails = async () => {
    try {
      setIsLoading(true);
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.CREATORS}/${creatorId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.creator) {
        setCreator(data.data.creator);
      } else {
        toast.error(data.message || 'Creator details not found.', 'Error');
      }
    } catch (err) {
      console.error('Fetch creator error:', err);
      toast.error('Network error fetching creator details.', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/admin/commission-ledger?creatorId=${creatorId}&limit=20`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const txList = data.data?.ledger || data.data?.transactions || data.ledger || [];
        setTransactions(txList);
      }
    } catch (err) {
      console.warn('Fetch ledger notice:', err.message);
    }
  };

  useEffect(() => {
    if (creatorId) {
      fetchCreatorDetails();
      fetchTransactions();
    }
  }, [creatorId]);

  // Handle Admin Balance Edit / Bonus Credit
  const handleSaveBalanceEdit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.CREATORS}/${creatorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          availableBalance: parseFloat(editBalanceInput || creator.availableBalance || 0),
          bonusCredit: parseFloat(bonusCreditInput || 0)
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        toast.success(`Updated balance for ${creator.name} successfully!`, 'Balance Saved');
        setIsEditModalOpen(false);
        setEditBalanceInput('');
        setBonusCreditInput('');
        fetchCreatorDetails();
        fetchTransactions();
      } else {
        toast.error(data.message || 'Failed to update creator balance.', 'Error');
      }
    } catch (err) {
      toast.error('Network error updating balance.', 'Error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Monthly Settlement for this creator
  const handleSettleMonth = async () => {
    try {
      setIsSettling(true);
      const token = getAdminToken();
      const res = await fetch(`${API_ENDPOINTS.ADMIN.SETTLE_MONTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ creatorId })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const totalAmt = data.data?.totalSettledAmount || 0;
        const month = data.data?.month || '';
        toast.success(
          `Monthly settlement for ${creator.name} (${month}) completed! ₹${totalAmt.toLocaleString('en-IN')} credited to Available Balance.`,
          'Settlement Executed'
        );
        fetchCreatorDetails();
        fetchTransactions();
      } else {
        toast.info(data.message || 'No pending earnings to settle for this creator.', 'Settlement Info');
      }
    } catch (err) {
      toast.error('Network error executing monthly settlement.', 'Error');
    } finally {
      setIsSettling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-[#EB1000]" />
        <p className="text-xs text-[#8B8B96] font-medium">Loading creator profile & wallet details...</p>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto bg-[#13131A] rounded-3xl border border-[#1C1C26] my-12">
        <XCircle className="h-12 w-12 text-[#EB1000] mx-auto" />
        <h3 className="text-lg font-bold text-white">Creator Not Found</h3>
        <p className="text-xs text-[#8B8B96]">No creator matching ID #{creatorId} was found in the database.</p>
        <Link
          href="/admin/wallets"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EB1000] text-white text-xs font-bold hover:bg-[#D00E00] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Creator Wallets
        </Link>
      </div>
    );
  }

  const grossRevenue = creator.totalRevenue || creator.grossEarnings || creator.balance || 0;

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">

      {/* TOP NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/wallets"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8B8B96] hover:text-white transition bg-[#13131A] border border-[#1C1C26] px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 text-[#EB1000]" /> Back to Creator Wallets
        </Link>

      </div>

      {/* 1. CREATOR PROFILE HEADER CARD */}
      <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1C1C26] pb-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#EB1000] to-[#FF5500] text-white flex items-center justify-center font-heading font-black text-2xl shadow-lg shadow-[#EB1000]/20 shrink-0">
              {creator.avatar || creator.name?.slice(0, 2).toUpperCase() || 'CR'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-heading font-black text-white">{creator.name}</h1>
                <span className="text-xs text-[#EB1000] font-semibold">{creator.username}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${creator.accountStatus === 'Blocked'
                  ? 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30'
                  : 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                  }`}>
                  {creator.accountStatus}
                </span>

              </div>
              <p className="text-xs text-[#8B8B96] flex flex-wrap items-center gap-4 pt-1">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-[#EB1000]" /> {creator.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-[#EB1000]" /> {creator.mobile || 'N/A'}</span>
                <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-[#EB1000]" /> {creator.country || 'India'}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#EB1000]" /> Registered: {creator.regDate}</span>
              </p>
            </div>
          </div>


        </div>

        {/* 2. FINANCIAL & QUESTION METRICS 6-GRID */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#EB1000]" /> Revenue & Question Analytics Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

            <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
              <span className="text-[10px] text-[#8B8B96] block font-semibold">Questions Asked</span>
              <span className="font-heading font-black text-[#FFD60A] text-base block">{creator.totalQuestions || 0}</span>
              <span className="text-[9px] text-[#FFD60A]">Total Questions</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
              <span className="text-[10px] text-[#8B8B96] block font-semibold">Questions Answered</span>
              <span className="font-heading font-black text-[#00E676] text-base block">{creator.questionsAnswered || 0}</span>
              <span className="text-[9px] text-[#00E676]">Answered Count</span>
            </div>



          </div>
        </div>
      </div>

    </div>
  );
}
