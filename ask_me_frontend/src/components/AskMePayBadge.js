import React from 'react';

export default function AskMePayBadge({ label, amount, icon = "⚡" }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD60A] text-[#0A0A0F] font-bold text-xs shadow-md glow-pay">
      <span>{icon}</span>
      <span>{label || `MIN FEE`}</span>
      {amount && <span className="ml-0.5 border-l border-[#0A0A0F]/20 pl-1.5 font-extrabold">{amount}</span>}
    </div>
  );
}
