import React, { useState } from 'react';
import PlatformIcon from './PlatformIcon';
import AskMePayBadge from './AskMePayBadge';
import { ShieldCheck, ShieldAlert, Check, X, Eye, Filter, RefreshCw } from 'lucide-react';

export default function ModerationQueue() {
  const [items, setItems] = useState([
    {
      id: 'MOD-9021',
      viewer: 'Alex_Gamer99',
      creator: 'TechBurner Live',
      platform: 'youtube',
      amount: '₹200',
      question: 'Hey! What is your exact opinion on the new M4 Mac Mini vs custom PC build for 4K video rendering?',
      status: 'pending',
      riskScore: 'Low (0.04)',
      timestamp: '2 mins ago',
    },
    {
      id: 'MOD-9022',
      viewer: 'CryptoKing_X',
      creator: 'FinCal Strategy',
      platform: 'x',
      amount: '₹500',
      question: 'Guaranteed 100x return token presale link here: http://bit.ly/fake-link-claim-now!!',
      status: 'flagged',
      riskScore: 'High (0.96 - Spam Link)',
      timestamp: '5 mins ago',
    },
    {
      id: 'MOD-9023',
      viewer: 'DevStudent_22',
      creator: 'CodeWithAnish',
      platform: 'twitch',
      amount: '₹150',
      question: 'How do I optimize Next.js server components with Turbopack for large scale enterprise dashboards?',
      status: 'pending',
      riskScore: 'Low (0.01)',
      timestamp: '12 mins ago',
    },
    {
      id: 'MOD-9024',
      viewer: 'Investor_Rohit',
      creator: 'Startup Unfiltered',
      platform: 'linkedin',
      amount: '₹1,000',
      question: 'We are raising a $2M seed round. Can we schedule a 15-min direct pitch call via askMail?',
      status: 'pending',
      riskScore: 'Low (0.02)',
      timestamp: '18 mins ago',
    },
  ]);

  const handleAction = (id, newStatus) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C26] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#00F5D4]" />
            <h3 className="font-heading font-bold text-base text-white">Smart Moderation Queue</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#FF3D71]/10 text-[#FF3D71] text-xs font-bold border border-[#FF3D71]/30">
              AI Filter Active
            </span>
          </div>
          <p className="text-xs text-[#8B8B96] mt-0.5">
            Automated spam, toxicity, and phishing filtering before questions land in creator dashboards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C26] text-[#8B8B96] text-xs hover:text-white transition-colors">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C26] text-[#00F5D4] text-xs font-semibold hover:bg-[#00F5D4]/10 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Moderation List */}
      <div className="space-y-3">
        {items.map((item) => {
          const isHighRisk = item.riskScore.includes('High');
          const isApproved = item.status === 'approved';
          const isRejected = item.status === 'rejected';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                isApproved
                  ? 'bg-[#00E676]/5 border-[#00E676]/30'
                  : isRejected
                  ? 'bg-[#FF5252]/5 border-[#FF5252]/30 opacity-60'
                  : isHighRisk
                  ? 'bg-[#FF3D71]/10 border-[#FF3D71]/40'
                  : 'bg-[#0A0A0F] border-[#1C1C26] hover:border-[#00F5D4]/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left Metadata */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-[#8B8B96] font-bold">{item.id}</span>
                    <span className="text-white font-bold">{item.viewer}</span>
                    <span className="text-[#8B8B96]">→</span>
                    <span className="text-[#00F5D4] font-bold">{item.creator}</span>
                    <PlatformIcon platform={item.platform} showName={false} size="xs" />
                    <AskMePayBadge amount={item.amount} />
                    <span className="text-[10px] text-[#8B8B96] ml-auto md:ml-2">{item.timestamp}</span>
                  </div>

                  {/* Question Text */}
                  <p className="text-xs text-[#F5F5F7] bg-[#13131A] p-2.5 rounded-lg border border-[#1C1C26] font-mono">
                    "{item.question}"
                  </p>

                  {/* Risk Telemetry */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#8B8B96]">AI Risk Assessment:</span>
                    <span
                      className={`font-semibold ${
                        isHighRisk ? 'text-[#FF3D71]' : 'text-[#00E676]'
                      }`}
                    >
                      {item.riskScore}
                    </span>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {isApproved ? (
                    <span className="px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Approved & Sent
                    </span>
                  ) : isRejected ? (
                    <span className="px-3 py-1 rounded-full bg-[#FF5252]/20 text-[#FF5252] text-xs font-bold flex items-center gap-1">
                      <X className="h-3.5 w-3.5" /> Rejected & Refunded
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(item.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] text-xs font-bold hover:bg-[#FF5252] hover:text-white transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00E676] text-[#0A0A0F] text-xs font-bold shadow-md hover:bg-[#00E676]/90 transition-all"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
