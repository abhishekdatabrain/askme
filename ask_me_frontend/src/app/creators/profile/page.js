'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { User, Mail, Globe, Phone, Camera, Save, ArrowLeft } from 'lucide-react';

export default function CreatorProfilePage() {
  const [creator, setCreator] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    country: '',
  });

  useEffect(() => {
    const savedUserStr = localStorage.getItem('askme_user');
    if (savedUserStr) {
      try {
        setCreator(JSON.parse(savedUserStr));
      } catch (e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex">
      <CreatorSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Creator Profile Settings</h1>
            <p className="text-xs text-[#8B8B96]">Manage public creator profile information and broadcast settings</p>
          </div>
          <Link href="/creators/dashboard" className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </header>

        <main className="p-6 max-w-4xl w-full mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-6 shadow-xl">
            <div className="flex items-center gap-4 border-b border-[#1C1C26] pb-6">
              <div className="h-16 w-16 rounded-2xl bg-[#1C1C26] border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] font-black text-2xl">
                {(creator.fullName || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg text-white">{creator.fullName || 'Creator Host'}</h2>
                <p className="text-xs text-[#00F5D4]">{creator.username || '@creator'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Full Name</label>
                <input type="text" readOnly value={creator.fullName || ''} className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Username Handle</label>
                <input type="text" readOnly value={creator.username || ''} className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Email Address</label>
                <input type="email" readOnly value={creator.email || ''} className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Country</label>
                <input type="text" readOnly value={creator.country || 'India'} className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
