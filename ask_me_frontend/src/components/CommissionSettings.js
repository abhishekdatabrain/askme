import React, { useState } from 'react';
import { Sliders, DollarSign, Percent, Save, CheckCircle2, Crown, Sparkles } from 'lucide-react';

export default function CommissionSettings() {
  const [globalCut, setGlobalCut] = useState(15);
  const [vipCut, setVipCut] = useState(10);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C1C26] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold shadow-md">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white">Platform Commission & Revenue Rules</h3>
            <p className="text-xs text-[#8B8B96] mt-0.5">
              Set global platform fee cut, VIP tier overrides, and minimum question pricing rules.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-xl bg-[#00E676]/20 text-[#00E676] text-xs font-bold flex items-center gap-1 border border-[#00E676]/30">
            <CheckCircle2 className="h-4 w-4" /> Commission Rules Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Global Commission Split Control */}
        <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-[#00F5D4]" />
              Default Platform Commission Cut
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

        {/* VIP Tier Override */}
        <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-[#FFD60A]" />
              VIP / Top Tier Creator Commission Discount
            </label>
            <span className="font-heading font-black text-lg text-[#FFD60A]">{vipCut}% Cut</span>
          </div>

          <input
            type="range"
            min="5"
            max="20"
            value={vipCut}
            onChange={(e) => setVipCut(Number(e.target.value))}
            className="w-full h-2 bg-[#1C1C26] rounded-lg appearance-none cursor-pointer accent-[#FFD60A]"
          />

          <p className="text-[11px] text-[#8B8B96]">
            Verified VIP creators with over 1M subscribers qualify for the reduced <strong className="text-white">{vipCut}%</strong> commission cut.
          </p>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-xl glow-teal hover:opacity-95 transition-all flex items-center gap-2"
        >
          <Save className="h-4 w-4" /> Save Commission Rules
        </button>
      </form>
    </div>
  );
}
