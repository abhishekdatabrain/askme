import React, { useState, useEffect } from 'react';
import PlatformIcon from './PlatformIcon';
import { ShieldCheck, ShieldAlert, Check, X, Eye, FileText, CheckCircle2, AlertCircle, Building2, AlertTriangle } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function KycApprovalQueue({ activeSubTab }) {
  const [kycRequests, setKycRequests] = useState([
    {
      id: 'KYC-501',
      creatorName: 'TechBurner Live',
      handle: '@techburner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      docType: 'PAN + GST Verification',
      idNumber: 'ABCDE1234F',
      bankDetails: 'HDFC Bank **** 9821 (IFSC: HDFC0000240)',
      upiId: 'techburner@okaxis',
      submittedDate: '10 Aug 2026',
      status: 'pending',
      platform: 'youtube',
    },
    {
      id: 'KYC-502',
      creatorName: 'FinCal Strategy',
      handle: '@fincal_live',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      docType: 'Aadhaar + Business License',
      idNumber: '9982-1234-5678',
      bankDetails: 'ICICI Bank **** 4410 (IFSC: ICIC0001020)',
      upiId: 'fincal@icici',
      submittedDate: '09 Aug 2026',
      status: 'verified',
      platform: 'youtube',
    },
    {
      id: 'KYC-503',
      creatorName: 'GamerX Xtreme',
      handle: '@gamerx_live',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
      docType: 'National ID Passport',
      idNumber: 'Z8920192',
      bankDetails: 'State Bank of India **** 1102',
      upiId: 'gamerx@sbi',
      submittedDate: '08 Aug 2026',
      status: 'action_required',
      rejectionReason: 'ID Document signature illegible. Re-upload clear PAN card.',
      platform: 'twitch',
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDocModal, setSelectedDocModal] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  useEffect(() => {
    const fetchKycList = async () => {
      try {
        const token = localStorage.getItem('askme_token');
        const res = await fetch(API_ENDPOINTS.ADMIN.KYC, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.kycApplications) {
          setKycRequests(data.data.kycApplications.map(k => ({
            id: `KYC-${k.id}`,
            creatorName: k.name,
            handle: `@${k.name.toLowerCase().replace(/\s+/g, '')}`,
            docType: 'PAN + GST Verification',
            idNumber: k.pan,
            bankDetails: k.bankAccount,
            upiId: k.upiId,
            submittedDate: k.submittedAt,
            status: k.status === 'Approved' ? 'verified' : k.status === 'Rejected' ? 'action_required' : 'pending',
            rejectionReason: k.rejectionReason || '',
            platform: 'youtube'
          })));
        }
      } catch (err) {
        console.warn('API fetch KYC warning:', err.message);
      }
    };
    fetchKycList();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'kyc_pending') {
      setSelectedFilter('pending');
    } else if (activeSubTab === 'kyc_approved') {
      setSelectedFilter('verified');
    } else if (activeSubTab === 'kyc_rejected') {
      setSelectedFilter('action_required');
    } else if (activeSubTab === 'kyc_details') {
      if (kycRequests.length > 0) {
        setSelectedDocModal(kycRequests[0]);
      }
    }
  }, [activeSubTab]);

  const handleUpdateStatus = async (id, newStatus, reason = '') => {
    const token = localStorage.getItem('askme_token');
    const numericId = id.replace('KYC-', '');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    try {
      if (newStatus === 'verified') {
        await fetch(`${API_ENDPOINTS.ADMIN.KYC}/${numericId}/approve`, { method: 'PUT', headers });
      } else if (newStatus === 'action_required') {
        await fetch(`${API_ENDPOINTS.ADMIN.KYC}/${numericId}/reject`, { method: 'PUT', headers, body: JSON.stringify({ reason }) });
      }
    } catch (e) {}

    setKycRequests(prev => prev.map(item => item.id === id ? {
      ...item,
      status: newStatus,
      rejectionReason: reason || item.rejectionReason
    } : item));
  };

  const confirmRejection = (e) => {
    e.preventDefault();
    if (rejectingItem) {
      handleUpdateStatus(rejectingItem.id, 'action_required', rejectionReasonText || 'Document verification failed.');
      setRejectingItem(null);
      setRejectionReasonText('');
    }
  };

  const filteredRequests = kycRequests.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.status === selectedFilter;
  });

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">KYC Verification Queue</h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Review tax compliance documents, government IDs, and bank account verifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'verified', label: 'Approved' },
            { id: 'action_required', label: 'Rejected' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === f.id
                  ? 'bg-brand-gradient text-[#0A0A0F]'
                  : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-3">
        {filteredRequests.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <PlatformIcon platform={item.platform} className="h-6 w-6 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{item.creatorName}</span>
                  <span className="text-xs text-[#8B8B96]">{item.handle}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8B8B96] mt-1">
                  <span className="flex items-center gap-1 text-white font-medium">
                    <FileText className="h-3.5 w-3.5 text-[#00F5D4]" />
                    {item.docType} ({item.idNumber})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-[#FFD60A]" />
                    {item.bankDetails}
                  </span>
                </div>
                {item.rejectionReason && (
                  <p className="text-[11px] text-[#FF3D71] mt-1 italic">
                    Reason: {item.rejectionReason}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-[#1C1C26] pt-3 md:pt-0">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                item.status === 'verified' ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30' :
                item.status === 'pending' ? 'bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30' :
                'bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30'
              }`}>
                {item.status === 'verified' && <CheckCircle2 className="h-3.5 w-3.5" />}
                {item.status === 'pending' && <AlertCircle className="h-3.5 w-3.5" />}
                {item.status === 'action_required' && <X className="h-3.5 w-3.5" />}
                <span className="capitalize">{item.status === 'verified' ? 'Approved' : item.status === 'action_required' ? 'Rejected' : 'Pending'}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDocModal(item)}
                  className="px-3 py-1.5 rounded-xl bg-[#1C1C26] text-white hover:bg-[#252533] text-xs font-bold flex items-center gap-1 transition"
                >
                  <Eye className="h-3.5 w-3.5 text-[#00F5D4]" />
                  Details
                </button>
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'verified')}
                      className="px-3 py-1.5 rounded-xl bg-[#00E676] text-[#0A0A0F] font-bold text-xs hover:opacity-90 transition"
                    >
                      Approve KYC
                    </button>
                    <button
                      onClick={() => {
                        setRejectingItem(item);
                        setRejectionReasonText('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#FF3D71] text-white font-bold text-xs hover:opacity-90 transition"
                    >
                      Reject KYC
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject KYC with Reason Modal (Requirement #16) */}
      {rejectingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={confirmRejection} className="bg-[#13131A] border border-[#1C1C26] rounded-2xl w-full max-w-md p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#FF3D71]" />
                Reject KYC Request for {rejectingItem.creatorName}
              </h3>
              <button type="button" onClick={() => setRejectingItem(null)} className="text-[#8B8B96] hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[#8B8B96] block font-bold">
                Rejection Reason (will be sent to creator email)
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="Specify rejection reason (e.g. Document unreadable, PAN mismatch, invalid IFSC...)"
                className="w-full p-3 bg-[#0A0A0F] border border-[#1C1C26] rounded-xl text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#FF3D71]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FF3D71] text-white font-bold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KYC Details Modal */}
      {selectedDocModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13131A] border border-[#1C1C26] rounded-2xl w-full max-w-lg p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#1C1C26] pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00F5D4]" />
                KYC Verification Document Details
              </h3>
              <button onClick={() => setSelectedDocModal(null)} className="text-[#8B8B96] hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26]">
                <span className="text-[10px] text-[#8B8B96]">Creator Handle</span>
                <p className="font-bold text-white text-sm">{selectedDocModal.creatorName} ({selectedDocModal.handle})</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                <span className="text-[10px] text-[#8B8B96]">Submitted Document Type</span>
                <p className="font-bold text-[#00F5D4]">{selectedDocModal.docType}</p>
                <p className="text-white">ID Number: {selectedDocModal.idNumber}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                <span className="text-[10px] text-[#8B8B96]">Payout Destination</span>
                <p className="font-bold text-white">{selectedDocModal.bankDetails}</p>
                <p className="text-white">UPI ID: {selectedDocModal.upiId}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedDocModal(null)}
                className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
