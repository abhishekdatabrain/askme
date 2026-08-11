import React, { useState } from 'react';
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

export default function CreatorManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCreatorForView, setSelectedCreatorForView] = useState(null);

  // Mock Creators Database
  const [creators, setCreators] = useState([
    {
      id: 'c-101',
      name: 'TechBurner Live',
      email: 'creator@techburner.in',
      mobile: '+91 98765 43210',
      registeredDate: '12 Jan 2026',
      kycStatus: 'Approved',
      walletBalance: '₹1,84,500',
      accountStatus: 'Active',
      platform: 'youtube',
      country: 'India',
      followers: '3.4M'
    },
    {
      id: 'c-102',
      name: 'Rachana Ranade',
      email: 'ca.rachana@finance.in',
      mobile: '+91 91234 56789',
      registeredDate: '15 Jan 2026',
      kycStatus: 'Approved',
      walletBalance: '₹3,42,000',
      accountStatus: 'Active',
      platform: 'youtube',
      country: 'India',
      followers: '1.8M'
    },
    {
      id: 'c-103',
      name: 'CodeWithAnish',
      email: 'anish@codewithanish.com',
      mobile: '+91 99887 76655',
      registeredDate: '28 Jan 2026',
      kycStatus: 'Pending',
      walletBalance: '₹45,200',
      accountStatus: 'Active',
      platform: 'youtube',
      country: 'India',
      followers: '850K'
    },
    {
      id: 'c-104',
      name: 'GamerX Xtreme',
      email: 'gamerx@twitch.tv',
      mobile: '+91 97766 55443',
      registeredDate: '02 Feb 2026',
      kycStatus: 'Rejected',
      walletBalance: '₹0',
      accountStatus: 'Blocked',
      platform: 'twitch',
      country: 'India',
      followers: '620K'
    },
    {
      id: 'c-105',
      name: 'Sarah AI & Tech',
      email: 'sarah@aitech.io',
      mobile: '+1 415 890 1234',
      registeredDate: '05 Feb 2026',
      kycStatus: 'Pending',
      walletBalance: '₹12,800',
      accountStatus: 'Active',
      platform: 'kick',
      country: 'United States',
      followers: '410K'
    }
  ]);

  const handleAction = (id, action) => {
    setCreators(prev => prev.map(c => {
      if (c.id === id) {
        if (action === 'approve') return { ...c, kycStatus: 'Approved', accountStatus: 'Active' };
        if (action === 'reject') return { ...c, kycStatus: 'Rejected' };
        if (action === 'block') return { ...c, accountStatus: c.accountStatus === 'Blocked' ? 'Active' : 'Blocked' };
      }
      return c;
    }).filter(c => action === 'delete' ? c.id !== id : true));
  };

  const filteredCreators = creators.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery);
    const matchesStatus = selectedStatus === 'All' || c.kycStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-[#00F5D4]" />
            Creator Management
          </h2>
          <p className="text-xs text-[#8B8B96] mt-1">
            View registered creators, inspect profile details, manage KYC approvals, block or delete accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, mobile..."
              className="rounded-xl bg-[#13131A] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none w-64"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl bg-[#13131A] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
          >
            <option value="All">All KYC Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Creators Table */}
      <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0A0F] border-b border-[#1C1C26] text-[#8B8B96] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Creator Details</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Reg. Date</th>
                <th className="px-6 py-4">KYC Status</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C26]">
              {filteredCreators.map((creator) => (
                <tr key={creator.id} className="hover:bg-[#1C1C26]/40 transition-colors">
                  {/* Name & Platform */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#7B2FFF] to-[#00F5D4] p-0.5 shrink-0">
                        <div className="h-full w-full rounded-full bg-[#0A0A0F] flex items-center justify-center font-bold text-white text-xs">
                          {creator.name.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {creator.name}
                          <PlatformIcon platform={creator.platform} className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] text-[#8B8B96]">{creator.country} • {creator.followers}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email & Mobile */}
                  <td className="px-6 py-4 space-y-0.5">
                    <div className="text-white flex items-center gap-1">
                      <Mail className="h-3 w-3 text-[#00F5D4]" /> {creator.email}
                    </div>
                    <div className="text-[#8B8B96] text-[11px] font-mono flex items-center gap-1">
                      <Phone className="h-3 w-3 text-[#8B8B96]" /> {creator.mobile}
                    </div>
                  </td>

                  {/* Registration Date */}
                  <td className="px-6 py-4 text-[#8B8B96] font-mono">
                    {creator.registeredDate}
                  </td>

                  {/* KYC Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${creator.kycStatus === 'Approved'
                        ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                        : creator.kycStatus === 'Pending'
                          ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30'
                          : 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30'
                      }`}>
                      {creator.kycStatus === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                      {creator.kycStatus === 'Pending' && <Clock className="h-3 w-3" />}
                      {creator.kycStatus === 'Rejected' && <XCircle className="h-3 w-3" />}
                      {creator.kycStatus}
                    </span>
                  </td>

                  {/* Wallet Balance */}
                  <td className="px-6 py-4 font-bold text-[#00E676] font-mono">
                    {creator.walletBalance}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {/* View Profile */}
                      <button
                        onClick={() => setSelectedCreatorForView(creator)}
                        title="View Profile"
                        className="p-1.5 rounded-lg bg-[#1C1C26] text-[#00F5D4] hover:bg-[#00F5D4]/10 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Approve */}
                      {creator.kycStatus !== 'Approved' && (
                        <button
                          onClick={() => handleAction(creator.id, 'approve')}
                          title="Approve KYC"
                          className="p-1.5 rounded-lg bg-[#1C1C26] text-[#00E676] hover:bg-[#00E676]/10 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Reject */}
                      {creator.kycStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleAction(creator.id, 'reject')}
                          title="Reject KYC"
                          className="p-1.5 rounded-lg bg-[#1C1C26] text-[#FFD60A] hover:bg-[#FFD60A]/10 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}

                      {/* Block / Unblock */}
                      <button
                        onClick={() => handleAction(creator.id, 'block')}
                        title={creator.accountStatus === 'Blocked' ? 'Unblock' : 'Block'}
                        className={`p-1.5 rounded-lg transition-colors ${creator.accountStatus === 'Blocked'
                            ? 'bg-[#FF5252] text-white'
                            : 'bg-[#1C1C26] text-[#8B8B96] hover:text-[#FF5252] hover:bg-[#FF5252]/10'
                          }`}
                      >
                        <Ban className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleAction(creator.id, 'delete')}
                        title="Delete Creator"
                        className="p-1.5 rounded-lg bg-[#1C1C26] text-[#8B8B96] hover:text-[#FF5252] hover:bg-[#FF5252]/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Creator Profile Modal */}
      {selectedCreatorForView && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setSelectedCreatorForView(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#1C1C26] text-[#8B8B96] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#7B2FFF] to-[#00F5D4] p-0.5 mx-auto">
                <div className="h-full w-full rounded-full bg-[#0A0A0F] flex items-center justify-center font-black text-xl text-white">
                  {selectedCreatorForView.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <h3 className="font-heading font-bold text-lg text-white">{selectedCreatorForView.name}</h3>
              <span className="text-xs text-[#00F5D4] font-mono">ID: {selectedCreatorForView.id}</span>
            </div>

            <div className="space-y-2 text-xs bg-[#0A0A0F] p-4 rounded-2xl border border-[#1C1C26]">
              <div className="flex justify-between py-1 border-b border-[#1C1C26]">
                <span className="text-[#8B8B96]">Email</span>
                <span className="text-white font-semibold">{selectedCreatorForView.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1C26]">
                <span className="text-[#8B8B96]">Mobile</span>
                <span className="text-white font-semibold">{selectedCreatorForView.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1C26]">
                <span className="text-[#8B8B96]">Registration Date</span>
                <span className="text-white font-semibold">{selectedCreatorForView.registeredDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1C1C26]">
                <span className="text-[#8B8B96]">KYC Status</span>
                <span className="text-[#00E676] font-bold">{selectedCreatorForView.kycStatus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8B8B96]">Wallet Balance</span>
                <span className="text-[#FFD60A] font-bold">{selectedCreatorForView.walletBalance}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCreatorForView(null)}
              className="w-full py-2.5 rounded-xl bg-[#1C1C26] text-white text-xs font-bold hover:bg-[#1C1C26]/80"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
