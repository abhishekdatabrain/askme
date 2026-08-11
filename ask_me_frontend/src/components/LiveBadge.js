import React from 'react';

export default function LiveBadge({ label = "LIVE ASKME", size = "normal", showPulse = true }) {
  const isSmall = size === "small";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#FF3D71] text-white font-semibold shadow-lg ${
        showPulse ? "animate-live-pulse" : ""
      } ${
        isSmall ? "px-2.5 py-0.5 text-[10px] tracking-wider" : "px-3 py-1 text-xs tracking-wide"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
      <span>{label}</span>
    </div>
  );
}
