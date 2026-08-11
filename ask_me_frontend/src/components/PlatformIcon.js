import React from 'react';

export default function PlatformIcon({ platform, showName = true, size = "sm" }) {
  const p = (platform || '').toLowerCase();

  const configs = {
    youtube: {
      name: "YouTube",
      bg: "bg-[#FF0000]/10 border-[#FF0000]/30 text-[#FF0000]",
      dotBg: "bg-[#FF0000]",
      icon: "▶",
    },
    twitch: {
      name: "Twitch",
      bg: "bg-[#9146FF]/10 border-[#9146FF]/30 text-[#9146FF]",
      dotBg: "bg-[#9146FF]",
      icon: "👾",
    },
    instagram: {
      name: "Instagram",
      bg: "bg-[#E1306C]/10 border-[#E1306C]/30 text-[#E1306C]",
      dotBg: "bg-[#E1306C]",
      icon: "📸",
    },
    kick: {
      name: "Kick",
      bg: "bg-[#53FC18]/10 border-[#53FC18]/30 text-[#53FC18]",
      dotBg: "bg-[#53FC18]",
      icon: "⚡",
    },
    x: {
      name: "X",
      bg: "bg-white/10 border-white/20 text-white",
      dotBg: "bg-white",
      icon: "𝕏",
    },
    linkedin: {
      name: "LinkedIn",
      bg: "bg-[#0A66C2]/10 border-[#0A66C2]/30 text-[#0A66C2]",
      dotBg: "bg-[#0A66C2]",
      icon: "💼",
    },
    facebook: {
      name: "Facebook",
      bg: "bg-[#1877F2]/10 border-[#1877F2]/30 text-[#1877F2]",
      dotBg: "bg-[#1877F2]",
      icon: "f",
    },
  };

  const config = configs[p] || {
    name: platform || "Platform",
    bg: "bg-[#00F5D4]/10 border-[#00F5D4]/30 text-[#00F5D4]",
    dotBg: "bg-[#00F5D4]",
    icon: "🌐",
  };

  const pyClass = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors ${config.bg} ${pyClass}`}>
      <span className="font-bold">{config.icon}</span>
      {showName && <span>{config.name}</span>}
    </span>
  );
}
