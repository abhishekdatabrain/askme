import React, { useState } from 'react';
import { Activity, Radio, Shield, Send, CheckCircle2, Server, Key, Lock, AlertCircle } from 'lucide-react';

export default function PlatformOperations() {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage('');
    }, 2500);
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Platform Operations & Gateway Telemetry</h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Live socket connections, payment gateways, OBS overlay servers, and DPDP compliance logs.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-bold border border-[#00E676]/30 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#00E676] animate-ping"></span>
          All Gateways Operational
        </span>
      </div>

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
          <span className="text-[11px] text-[#8B8B96]">AskMe Pay Gateway (Razorpay/Stripe)</span>
          <span className="block font-bold text-white text-sm flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#00E676]" /> Active (99.99% Uptime)
          </span>
          <span className="text-[10px] text-[#8B8B96]">Instant Payout API: Healthy</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
          <span className="text-[11px] text-[#8B8B96]">OBS Live Stream Overlay Socket</span>
          <span className="block font-bold text-white text-sm flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-[#00F5D4]" /> 7 Active Streams Connected
          </span>
          <span className="text-[10px] text-[#8B8B96]">Latency: 14ms (Turbopack Socket)</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
          <span className="text-[11px] text-[#8B8B96]">DPDP Privacy & Security Vault</span>
          <span className="block font-bold text-white text-sm flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-[#FFD60A]" /> Compliant (2026 Audit)
          </span>
          <span className="text-[10px] text-[#8B8B96]">Encrypted Vault: India West-1</span>
        </div>
      </div>

      {/* Broadcast Message Box */}
      <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
        <h4 className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
          <Send className="h-3.5 w-3.5 text-[#00F5D4]" />
          Platform System Broadcast (All Live Streams)
        </h4>

        {broadcastSent ? (
          <div className="p-3 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 text-xs font-bold text-[#00E676] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> System broadcast dispatched to 7 active live stream overlays!
          </div>
        ) : (
          <form onSubmit={handleSendBroadcast} className="flex gap-2">
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              required
              placeholder="e.g. Scheduled platform maintenance in 30 mins..."
              className="flex-1 rounded-xl bg-[#13131A] border border-[#1C1C26] px-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md hover:opacity-95 transition-all shrink-0"
            >
              Send Broadcast
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
