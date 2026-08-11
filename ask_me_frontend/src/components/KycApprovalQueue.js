import React, { useState } from 'react';
import PlatformIcon from './PlatformIcon';
import { ShieldCheck, ShieldAlert, Check, X, Eye, FileText, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export default function KycApprovalQueue() {
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
      platform: 'twitch',
    },
  ]);

  const [selectedDocModal, setSelectedDocModal] = useState(null);

  const handleUpdateStatus = (id, newStatus) => {
    setKycRequests(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              Creator KYC & Identity Approvals
              <span className="px-2 py-0.5 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] text-xs font-bold border border-[#FFD60A]/30">
                DPDP Compliant
              </span>
            </h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Verify government documents, tax IDs, and bank account info before enabling 85% payouts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8B8B96] font-medium">Pending Approvals:</span>
          <span className="px-2.5 py-1 rounded-full bg-[#FF3D71] text-white text-xs font-bold animate-live-pulse">
            {kycRequests.filter(k => k.status === 'pending').length}
          </span>
        </div>
      </div>

      {/* KYC Request Cards List */}
      <div className="space-y-3">
        {kycRequests.map((request) => (
          <div
            key={request.id}
            className={`p-4 rounded-xl border transition-all ${
              request.status === 'verified'
                ? 'bg-[#00E676]/5 border-[#00E676]/30'
                : request.status === 'action_required'
                ? 'bg-[#FF5252]/5 border-[#FF5252]/30'
                : 'bg-[#0A0A0F] border-[#1C1C26] hover:border-[#00F5D4]/30'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Creator Metadata */}
              <div className="flex items-start gap-3">
                <img
                  src={request.avatar}
                  alt={request.creatorName}
                  className="h-11 w-11 rounded-full object-cover border-2 border-[#00F5D4]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-white">{request.creatorName}</span>
                    <span className="text-xs text-[#8B8B96]">{request.handle}</span>
                    <PlatformIcon platform={request.platform} showName={false} size="xs" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#8B8B96]">
                    <span className="flex items-center gap-1 font-mono text-white">
                      <FileText className="h-3.5 w-3.5 text-[#00F5D4]" />
                      {request.docType} ({request.idNumber})
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-[#FFD60A]" />
                      {request.bankDetails}
                    </span>
                    <span>UPI: <code className="text-[#00E676]">{request.upiId}</code></span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 self-end lg:self-center">
                <button
                  onClick={() => setSelectedDocModal(request)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1C1C26] text-[#F5F5F7] text-xs font-semibold hover:bg-[#1C1C26]/80 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 text-[#8B8B96]" />
                  <span>Inspect ID</span>
                </button>

                {request.status === 'verified' ? (
                  <span className="px-3 py-1.5 rounded-xl bg-[#00E676]/20 text-[#00E676] text-xs font-bold flex items-center gap-1 border border-[#00E676]/30">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified Creator
                  </span>
                ) : request.status === 'action_required' ? (
                  <span className="px-3 py-1.5 rounded-xl bg-[#FF5252]/20 text-[#FF5252] text-xs font-bold flex items-center gap-1 border border-[#FF5252]/30">
                    <AlertCircle className="h-3.5 w-3.5" /> Action Required
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'action_required')}
                      className="px-3 py-1.5 rounded-xl bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] text-xs font-bold hover:bg-[#FF5252] hover:text-white transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'verified')}
                      className="px-3 py-1.5 rounded-xl bg-[#00E676] text-[#0A0A0F] text-xs font-bold shadow-md hover:bg-[#00E676]/90 transition-all flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      Approve KYC
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Inspection Modal */}
      {selectedDocModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-bold text-base text-white">KYC Document Inspection</h4>
              <button
                onClick={() => setSelectedDocModal(null)}
                className="p-1 rounded-full bg-[#1C1C26] text-[#8B8B96] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2">
              <div className="text-xs text-[#8B8B96]">Creator: <strong className="text-white">{selectedDocModal.creatorName}</strong></div>
              <div className="text-xs text-[#8B8B96]">Document Type: <strong className="text-[#00F5D4]">{selectedDocModal.docType}</strong></div>
              <div className="text-xs text-[#8B8B96]">ID Number: <code className="text-white font-mono">{selectedDocModal.idNumber}</code></div>
              <div className="text-xs text-[#8B8B96]">Bank: <strong className="text-white">{selectedDocModal.bankDetails}</strong></div>
            </div>

            <div className="h-48 rounded-xl bg-[#0A0A0F] border border-dashed border-[#1C1C26] flex flex-col items-center justify-center text-center p-4">
              <FileText className="h-10 w-10 text-[#00F5D4] mb-2" />
              <span className="text-xs font-bold text-white">[ENCRYPTED GOVT ID SAMPLE PREVIEW]</span>
              <span className="text-[10px] text-[#8B8B96] mt-1">DPDP Act Article 8 Verified Hash: 0x8a92...f41e</span>
            </div>

            <button
              onClick={() => {
                handleUpdateStatus(selectedDocModal.id, 'verified');
                setSelectedDocModal(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#00E676] text-[#0A0A0F] font-bold text-xs shadow-md hover:bg-[#00E676]/90 transition-all"
            >
              Confirm Verification & Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
