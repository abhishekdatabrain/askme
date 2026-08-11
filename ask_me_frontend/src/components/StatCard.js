import React from 'react';
import { TrendingUp, ArrowUpRight, Radio, DollarSign, Users, CheckCircle } from 'lucide-react';

export default function StatCard({ title, value, change, subtitle, icon: Icon, accent = "teal" }) {
  const accentClasses = {
    teal: "border-[#00F5D4]/30 text-[#00F5D4] bg-[#00F5D4]/10",
    pink: "border-[#FF3D71]/30 text-[#FF3D71] bg-[#FF3D71]/10",
    yellow: "border-[#FFD60A]/30 text-[#FFD60A] bg-[#FFD60A]/10",
    violet: "border-[#7B2FFF]/30 text-[#7B2FFF] bg-[#7B2FFF]/10",
  };

  return (
    <div className="rounded-2xl bg-[#13131A] border border-[#1C1C26] p-5 shadow-lg relative overflow-hidden group hover:border-[#00F5D4]/40 transition-all">
      {/* Background Subtle Glow Accent */}
      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-brand-gradient opacity-5 blur-xl group-hover:opacity-15 transition-opacity"></div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#8B8B96] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${accentClasses[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-heading font-black text-2xl lg:text-3xl text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span className="inline-flex items-center text-xs font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full">
            <TrendingUp className="h-3 w-3 mr-1" />
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-[#8B8B96] flex items-center gap-1.5 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
