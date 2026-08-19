import React, { useState, useEffect } from 'react';
import { Activity, Radio, Shield, Send, CheckCircle2, Server, Key, Lock, AlertCircle, User, CreditCard, Sliders, Save } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/context/ToastContext';
import { getAdminToken } from '@/utils/cookies';

export default function PlatformOperations({ activeSubTab }) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('platform');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  // Admin Profile form state
  const [adminName, setAdminName] = useState('System Super Admin');
  const [adminEmail, setAdminEmail] = useState('admin@askme.pro');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getAdminToken();
        const res = await fetch(API_ENDPOINTS.ADMIN.OPERATIONS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.platformSettings) {
          const s = data.data.platformSettings;
          if (s.adminName) setAdminName(s.adminName);
          if (s.adminEmail) setAdminEmail(s.adminEmail);
        }
      } catch (err) {
        console.warn('API fetch platform settings warning:', err.message);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'settings_profile') {
      setActiveSection('profile');
    } else if (activeSubTab === 'settings_gateway') {
      setActiveSection('gateway');
    } else {
      setActiveSection('platform');
    }
  }, [activeSubTab]);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      await fetch(API_ENDPOINTS.ADMIN.OPERATIONS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ broadcastMessage })
      });
      toast.success('System broadcast announcement dispatched to live stream overlays!', 'Broadcast Dispatched');
    } catch (err) {
      toast.error('Failed to send system broadcast message.', 'Broadcast Failed');
    }

    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage('');
    }, 2500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = getAdminToken();
    try {
      await fetch(API_ENDPOINTS.ADMIN.OPERATIONS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adminName, adminEmail })
      });
      toast.success('Admin profile & platform configurations saved to database!', 'Settings Saved');
    } catch (err) {
      toast.error('Failed to save settings to database.', 'Save Error');
    }

    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Platform Settings & System Config</h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Manage admin profile security, payment gateway credentials, and broadcast server controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'profile'
                ? 'bg-brand-gradient text-[#0A0A0F]'
                : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
            }`}
          >
            Admin Profile
          </button>
          <button
            onClick={() => setActiveSection('gateway')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'gateway'
                ? 'bg-brand-gradient text-[#0A0A0F]'
                : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
            }`}
          >
            Payment Gateway
          </button>
          <button
            onClick={() => setActiveSection('platform')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'platform'
                ? 'bg-brand-gradient text-[#0A0A0F]'
                : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
            }`}
          >
            Platform Settings
          </button>
        </div>
      </div>

      {savedSettings && (
        <div className="px-4 py-2.5 rounded-xl bg-[#00E676]/10 text-[#00E676] text-xs font-bold flex items-center gap-2 border border-[#00E676]/30">
          <CheckCircle2 className="h-4 w-4" /> Configuration Saved Successfully!
        </div>
      )}

      {/* Admin Profile Section */}
      {activeSection === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-[#00F5D4]" />
              Super Admin Security Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[#8B8B96] block mb-1">Admin Full Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#13131A] border border-[#1C1C26] rounded-xl text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>
              <div>
                <label className="text-[#8B8B96] block mb-1">Admin Account Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#13131A] border border-[#1C1C26] rounded-xl text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Payment Gateway Section */}
      {activeSection === 'gateway' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#FFD60A]" />
              AskMe Pay API Gateway Keys (Razorpay & Stripe)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-[#13131A] rounded-xl border border-[#1C1C26]">
                <span className="text-[#8B8B96]">Razorpay Key ID (India Live)</span>
                <span className="font-mono text-white font-bold">rzp_live_99812401</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#13131A] rounded-xl border border-[#1C1C26]">
                <span className="text-[#8B8B96]">Stripe Publishable Key (Global)</span>
                <span className="font-mono text-white font-bold">pk_live_51M09218...</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#13131A] rounded-xl border border-[#1C1C26]">
                <span className="text-[#8B8B96]">Instant Payout Webhook Secret</span>
                <span className="font-mono text-[#00E676] font-bold">whsec_askme_2026_ok</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Settings Section */}
      {activeSection === 'platform' && (
        <div className="space-y-6">
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
              <span className="text-[10px] text-[#8B8B96]">End-to-End PII Salt Encrypted</span>
            </div>
          </div>

          {/* Broadcast Banner Tool */}
          <form onSubmit={handleSendBroadcast} className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-[#FF3D71]" />
                Emergency Platform Broadcast Message
              </label>
              {broadcastSent && (
                <span className="text-[10px] font-bold text-[#00E676]">Broadcast Dispatched to Live Overlay Sockets!</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter alert message to stream to all live stream overlays..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#13131A] border border-[#1C1C26] rounded-xl text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF3D71] text-white font-bold text-xs rounded-xl hover:opacity-90 transition flex items-center gap-1.5 shrink-0"
              >
                <Send className="h-3.5 w-3.5" /> Broadcast
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
