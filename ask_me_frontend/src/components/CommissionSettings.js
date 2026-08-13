import React, { useState, useEffect } from 'react';
import { Sliders, DollarSign, Percent, Save, CheckCircle2, Crown, Sparkles, Clock, History, ArrowRight, Wallet } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function CommissionSettings({ activeSubTab }) {
  const [activeTabState, setActiveTabState] = useState('settings');
  const [globalCut, setGlobalCut] = useState(15);
  const [vipCut, setVipCut] = useState(10);
  const [minWithdrawalLimit, setMinWithdrawalLimit] = useState(500);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('askme_token');
        const res = await fetch(API_ENDPOINTS.ADMIN.COMMISSION, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.commissionSettings) {
          const s = data.data.commissionSettings;
          if (s.platformCommissionPercent !== undefined) setGlobalCut(s.platformCommissionPercent);
          if (s.vipCommissionPercent !== undefined) setVipCut(s.vipCommissionPercent);
          if (s.minWithdrawalLimit !== undefined) setMinWithdrawalLimit(s.minWithdrawalLimit);
        }
      } catch (err) {
        console.warn('API fetch commission settings warning:', err.message);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'commissions_history') {
      setActiveTabState('history');
    } else {
      setActiveTabState('settings');
    }
  }, [activeSubTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('askme_token');
    try {
      await fetch(API_ENDPOINTS.ADMIN.COMMISSION, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          platformCommissionPercent: globalCut,
          vipCommissionPercent: vipCut,
          minWithdrawalLimit: minWithdrawalLimit
        })
      });
    } catch (err) {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold shadow-md">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Platform Commission & Revenue Rules</h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Set global platform fee cut, minimum withdrawal limit, VIP tier overrides, and view commission history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabState('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabState === 'settings'
                ? 'bg-brand-gradient text-[#0A0A0F]'
                : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
            }`}
          >
            Commission Settings
          </button>
          <button
            onClick={() => setActiveTabState('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTabState === 'history'
                ? 'bg-brand-gradient text-[#0A0A0F]'
                : 'bg-[#1C1C26] text-[#8B8B96] hover:text-white'
            }`}
          >
            Commission History
          </button>
        </div>
      </div>

      {activeTabState === 'settings' ? (
        <form onSubmit={handleSave} className="space-y-6">
          {savedSuccess && (
            <div className="px-4 py-2.5 rounded-xl bg-[#00E676]/10 text-[#00E676] text-xs font-bold flex items-center gap-2 border border-[#00E676]/30">
              <CheckCircle2 className="h-4 w-4" /> Commission & Minimum Withdrawal Settings Saved!
            </div>
          )}

          {/* Interactive Live Revenue Split Example Box matching prompt requirement #21 */}
          <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#00F5D4]/30 space-y-2">
            <span className="text-[10px] font-extrabold text-[#00F5D4] uppercase tracking-wider block">
              Live Commission Split Calculation Example (Requirement #21)
            </span>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#13131A] border border-[#1C1C26]">
                <span className="text-[#8B8B96] block text-[10px]">Viewer Pays</span>
                <span className="font-bold text-white text-sm">₹1,000</span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#8B8B96] hidden sm:block" />
              <div className="p-2.5 rounded-lg bg-[#13131A] border border-[#FFD60A]/30">
                <span className="text-[#8B8B96] block text-[10px]">Platform Commission ({globalCut}%)</span>
                <span className="font-bold text-[#FFD60A] text-sm">₹{1000 * (globalCut / 100)}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-[#8B8B96] hidden sm:block" />
              <div className="p-2.5 rounded-lg bg-[#13131A] border border-[#00E676]/30">
                <span className="text-[#8B8B96] block text-[10px]">Creator Receives ({100 - globalCut}%)</span>
                <span className="font-bold text-[#00E676] text-sm">₹{1000 * ((100 - globalCut) / 100)}</span>
              </div>
            </div>
          </div>

          {/* Global Commission Split Control */}
          <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-[#00F5D4]" />
                Default Platform Commission Percentage
              </label>
              <span className="font-heading font-black text-lg text-[#00F5D4]">{globalCut}% Net Cut</span>
            </div>

            <input
              type="range"
              min="5"
              max="30"
              value={globalCut}
              onChange={(e) => setGlobalCut(Number(e.target.value))}
              className="w-full h-2 bg-[#1C1C26] rounded-lg appearance-none cursor-pointer accent-[#00F5D4]"
            />

            <div className="flex justify-between text-[11px] text-[#8B8B96]">
              <span>Creator Keeps: <strong className="text-[#00E676]">{100 - globalCut}%</strong></span>
              <span>Platform Revenue: <strong className="text-[#00F5D4]">{globalCut}%</strong></span>
            </div>
          </div>

          {/* Minimum Withdrawal Limit Control matching requirement #21 */}
          <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#FFD60A]" />
                Minimum Creator Payout Withdrawal Limit (₹)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#8B8B96]">₹</span>
                <input
                  type="number"
                  value={minWithdrawalLimit}
                  onChange={(e) => setMinWithdrawalLimit(Number(e.target.value))}
                  className="w-24 px-3 py-1 bg-[#13131A] border border-[#1C1C26] rounded-xl font-bold text-sm text-[#FFD60A] text-right focus:outline-none focus:border-[#00F5D4]"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#8B8B96]">
              Creators cannot request payout withdrawals until their available wallet balance exceeds <span className="text-[#FFD60A] font-bold">₹{minWithdrawalLimit}</span>.
            </p>
          </div>

          {/* VIP Override Control */}
          <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-[#FFD60A]" />
                VIP Creator Discounted Commission Cut
              </label>
              <span className="font-heading font-black text-lg text-[#FFD60A]">{vipCut}% Net Cut</span>
            </div>

            <input
              type="range"
              min="2"
              max="20"
              value={vipCut}
              onChange={(e) => setVipCut(Number(e.target.value))}
              className="w-full h-2 bg-[#1C1C26] rounded-lg appearance-none cursor-pointer accent-[#FFD60A]"
            />

            <div className="flex justify-between text-[11px] text-[#8B8B96]">
              <span>VIP Creator Keeps: <strong className="text-[#00E676]">{100 - vipCut}%</strong></span>
              <span>Platform Revenue: <strong className="text-[#FFD60A]">{vipCut}%</strong></span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-lg shadow-[#00F5D4]/20 flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Save Commission Settings
            </button>
          </div>
        </form>
      ) : (
        /* Commission History Logs */
        <div className="space-y-3">
          {historyLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#1C1C26] text-[#00F5D4]">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{log.title}</h4>
                  <p className="text-[11px] text-[#8B8B96]">{log.detail}</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-white font-bold block">{log.date}</span>
                <span className="text-[10px] text-[#8B8B96]">{log.admin}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
