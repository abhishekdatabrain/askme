import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  XCircle,
  Ban,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  X,
  Mail,
  Phone,
  Wallet,
  Globe
} from 'lucide-react';
import PlatformIcon from './PlatformIcon';
import { API_ENDPOINTS } from '@/config/api';

export default function CreatorManagement({ activeSubTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCreatorForView, setSelectedCreatorForView] = useState(null);

  // Mock Creators Database
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const token = localStorage.getItem('askme_token');
        const res = await fetch(API_ENDPOINTS.ADMIN.CREATORS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.creators) {
          setCreators(data.data.creators.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            mobile: c.mobile || '+91 98765 43210',
            registeredDate: c.regDate || '12 Jan 2026',
            kycStatus: c.kycStatus || 'Approved',
            walletBalance: typeof c.balance === 'number' ? `₹${c.balance.toLocaleString()}` : (c.balance || '₹1,84,500'),
            accountStatus: c.accountStatus || 'Active',
            platform: c.platform || 'youtube',
            country: c.country || 'India',
            followers: c.followers || '100K'
          })));
        }
      } catch (err) {
        console.warn('API fetch creators warning:', err.message);
      }
    };
    fetchCreators();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'creators_all') {
      setSelectedStatus('All');
    } else if (activeSubTab === 'creators_active') {
      setSelectedStatus('Active');
    } else if (activeSubTab === 'creators_blocked') {
      setSelectedStatus('Blocked');
    } else if (activeSubTab === 'creators_details') {
      if (creators.length > 0) {
        setSelectedCreatorForView(creators[0]);
      }
    }
  }, [activeSubTab]);

  const handleAction = async (id, action) => {
    const token = localStorage.getItem('askme_token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    try {
      if (action === 'approve') {
        await fetch(`${API_ENDPOINTS.ADMIN.CREATORS}/${id}/approve-kyc`, { method: 'PUT', headers });
      } else if (action === 'reject') {
        await fetch(`${API_ENDPOINTS.ADMIN.CREATORS}/${id}/reject-kyc`, { method: 'PUT', headers, body: JSON.stringify({ reason: 'Invalid documents' }) });
      } else if (action === 'block') {
        await fetch(`${API_ENDPOINTS.ADMIN.CREATORS}/${id}/block`, { method: 'PUT', headers });
      }
    } catch (e) { }

    setCreators(prev => prev.map(c => {
      if (c.id === id) {
        if (action === 'approve') return { ...c, kycStatus: 'Approved', accountStatus: 'Active' };
        if (action === 'reject') return { ...c, kycStatus: 'Rejected' };
        if (action === 'block') return { ...c, accountStatus: c.accountStatus === 'Blocked' ? 'Active' : 'Blocked' };
      }
      return c;
    }));
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('askme_token');
    try {
      await fetch(`${API_ENDPOINTS.ADMIN.CREATORS}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { }
    setCreators(prev => prev.filter(c => c.id !== id));
  };

  const filteredCreators = creators.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || c.accountStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-5 animate-fade-in">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-[#00F5D4]" />
            Creator Management
          </h2>
          <p className="text-xs text-[#8B8B96] mt-0.5">
            Manage registered creators: View Profile, Approve, Reject, Block, and Delete creator accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Active', 'Blocked'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedStatus === status
                ? 'bg-brand-gradient text-[#0A0A0F] shadow-sm'
                : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8B8B96]" />
        <input
          type="text"
          placeholder="Search creator name, email or handle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0A0A0F] border border-[#1C1C26] rounded-xl text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
        />
      </div>

      {/* Creators Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C1C26] text-[#8B8B96] font-bold">
              <th className="pb-3 px-2">CREATOR</th>
              <th className="pb-3 px-2">CONTACT</th>
              <th className="pb-3 px-2">KYC STATUS</th>
              <th className="pb-3 px-2">WALLET BALANCE</th>
              <th className="pb-3 px-2">ACCOUNT</th>
              <th className="pb-3 px-2 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C26]">
            {filteredCreators.map((c) => (
              <tr key={c.id} className="hover:bg-[#0A0A0F]/60 transition">
                <td className="py-3.5 px-2">
                  <div className="flex items-center gap-2.5">
                    <PlatformIcon platform={c.platform} className="h-5 w-5 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">{c.name}</span>
                      <span className="text-[10px] text-[#8B8B96]">{c.followers} Followers • {c.country}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-2 text-[#8B8B96]">
                  <div>{c.email}</div>
                  <div className="text-[10px]">{c.mobile}</div>
                </td>
                <td className="py-3.5 px-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.kycStatus === 'Approved' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' :
                    c.kycStatus === 'Pending' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30' :
                      'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
                    }`}>
                    {c.kycStatus}
                  </span>
                </td>
                <td className="py-3.5 px-2 font-bold text-white">{c.walletBalance}</td>
                <td className="py-3.5 px-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.accountStatus === 'Active' ? 'bg-[#00F5D4]/10 text-[#00F5D4]' : 'bg-[#FF3D71]/20 text-[#FF3D71]'
                    }`}>
                    {c.accountStatus}
                  </span>
                </td>
                <td className="py-3.5 px-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* 1. View Profile Icon */}
                    <button
                      onClick={() => setSelectedCreatorForView(c)}
                      title="View Profile Details"
                      className="p-1.5 rounded-lg bg-[#1C1C26] text-[#8B8B96] hover:text-[#00F5D4] hover:bg-[#00F5D4]/10 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {/* 2. Approve Icon */}
                    <button
                      onClick={() => handleAction(c.id, 'approve')}
                      title="Approve"
                      className={`p-1.5 rounded-lg transition ${c.kycStatus === 'Approved'
                        ? 'bg-[#00E676]/10 text-[#00E676] opacity-60 cursor-default'
                        : 'bg-[#1C1C26] text-[#8B8B96] hover:text-[#00E676] hover:bg-[#00E676]/10'
                        }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>

                    {/* 3. Reject Icon */}
                    <button
                      onClick={() => handleAction(c.id, 'reject')}
                      title="Reject"
                      className={`p-1.5 rounded-lg transition ${c.kycStatus === 'Rejected'
                        ? 'bg-[#FF3D71]/10 text-[#FF3D71] opacity-60 cursor-default'
                        : 'bg-[#1C1C26] text-[#8B8B96] hover:text-[#FF3D71] hover:bg-[#FF3D71]/10'
                        }`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>

                    {/* 4. Block / Unblock Icon */}
                    <button
                      onClick={() => handleAction(c.id, 'block')}
                      title={c.accountStatus === 'Blocked' ? 'Unblock Creator' : 'Block Creator'}
                      className={`p-1.5 rounded-lg transition ${c.accountStatus === 'Blocked'
                        ? 'bg-[#FFD60A]/10 text-[#FFD60A]'
                        : 'bg-[#1C1C26] text-[#8B8B96] hover:text-[#FFD60A] hover:bg-[#FFD60A]/10'
                        }`}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>

                    {/* 5. Delete Icon */}
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Delete Creator"
                      className="p-1.5 rounded-lg bg-[#1C1C26] text-[#8B8B96] hover:text-[#FF3D71] hover:bg-[#FF3D71]/10 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Creator Details Modal */}
      {selectedCreatorForView && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-2xl w-full max-w-md p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-[#00F5D4]" />
                Creator Profile Details
              </h3>
              <button
                onClick={() => setSelectedCreatorForView(null)}
                className="text-[#8B8B96] hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center gap-3">
                <PlatformIcon platform={selectedCreatorForView.platform} className="h-8 w-8" />
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedCreatorForView.name}</h4>
                  <span className="text-[#8B8B96]">{selectedCreatorForView.followers} Followers • Registered {selectedCreatorForView.registeredDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Email</span>
                  <span className="font-semibold text-white">{selectedCreatorForView.email}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Mobile</span>
                  <span className="font-semibold text-white">{selectedCreatorForView.mobile}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">KYC Status</span>
                  <span className="font-bold text-[#00E676]">{selectedCreatorForView.kycStatus}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                  <span className="text-[10px] text-[#8B8B96] block">Wallet Balance</span>
                  <span className="font-bold text-[#00F5D4]">{selectedCreatorForView.walletBalance}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCreatorForView(null)}
                className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
