import React from 'react';
import LiveBadge from './LiveBadge';
import PlatformIcon from './PlatformIcon';

export default function HeroStreamMarquee() {
  const row1Creators = [
    { name: 'TechBurner Live', platform: 'youtube', category: 'Technology', minFee: '₹100', subs: '3.4M', isLive: true, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { name: 'FinCal Strategy', platform: 'youtube', category: 'Finance', minFee: '₹200', subs: '1.8M', isLive: true, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { name: 'CodeWithAnish', platform: 'youtube', category: 'Education', minFee: '₹150', subs: '850K', isLive: true, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
    { name: 'GamerX Xtreme', platform: 'twitch', category: 'Gaming', minFee: '₹50', subs: '2.1M', isLive: false, img: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80' },
  ];

  const row2Creators = [
    { name: 'Dr. Priya HealthTalk', platform: 'youtube', category: 'Health & Fitness', minFee: '₹250', subs: '620K', isLive: false, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
    { name: 'Startup Unfiltered', platform: 'youtube', category: 'Business', minFee: '₹500', subs: '410K', isLive: true, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ajeet Bharti', platform: 'youtube', category: 'Podcasts', minFee: '₹150', subs: '1.25M', isLive: true, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Crypto Pulse Live', platform: 'kick', category: 'Finance', minFee: '₹300', subs: '980K', isLive: true, img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
  ];

  const row3Creators = [
    { name: 'CyberSec Insider', platform: 'youtube', category: 'Technology', minFee: '₹180', subs: '740K', isLive: true, img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' },
    { name: 'Design Craft', platform: 'instagram', category: 'Lifestyle', minFee: '₹120', subs: '530K', isLive: false, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Market Movers Q&A', platform: 'x', category: 'Business', minFee: '₹400', subs: '1.1M', isLive: true, img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80' },
    { name: 'Vocal Masterclass', platform: 'facebook', category: 'Music', minFee: '₹220', subs: '890K', isLive: false, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  ];

  const renderMarqueeRow = (items, direction = "left") => {
    // Duplicate array to loop infinitely
    const doubled = [...items, ...items, ...items, ...items];
    const animClass = direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

    return (
      <div className="overflow-hidden w-full relative py-1.5">
        <div className={animClass}>
          {doubled.map((item, idx) => (
            <div
              key={idx}
              className="w-64 shrink-0 mx-2 p-2.5 rounded-2xl bg-[#13131A] border border-[#1C1C26] shadow-md hover:border-[#00F5D4]/50 transition-all cursor-pointer group"
            >
              <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2 bg-[#0A0A0F]">
                <img
                  src={item.img}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {item.isLive && (
                  <div className="absolute top-2 left-2">
                    <LiveBadge label="LIVE" size="small" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <PlatformIcon platform={item.platform} showName={false} size="xs" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[140px]">{item.name}</span>
                <span className="text-[10px] font-extrabold text-[#FFD60A] bg-[#FFD60A]/10 px-2 py-0.5 rounded-full">
                  {item.minFee}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#0A0A0F] border border-[#1C1C26] p-4 shadow-2xl">
      {/* Visual Direction Section 5 Gradient Overlay: 85% center #0A0A0F, 20% edges */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/85 to-[#0A0A0F]"></div>

      {/* Marquee Rows with Vertical Offsets */}
      <div className="space-y-2 relative z-0">
        <div className="transform -rotate-1">
          {renderMarqueeRow(row1Creators, "left")}
        </div>
        <div className="transform rotate-1">
          {renderMarqueeRow(row2Creators, "right")}
        </div>
        <div className="transform -rotate-1">
          {renderMarqueeRow(row3Creators, "left")}
        </div>
      </div>

      {/* Banner Floating Title */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-[#1C1C26]/90 border border-[#00F5D4]/40 backdrop-blur-md mb-3 inline-flex items-center gap-2 pointer-events-auto">
          <span className="h-2 w-2 rounded-full bg-[#FF3D71] animate-live-pulse"></span>
          <span className="text-xs font-bold text-white tracking-wide">
            LIVE SIGNAL BROADCAST MATRIX
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-heading font-black tracking-tight text-white mb-2 max-w-xl">
          Surfacing Live Creators Real-Time Across <span className="text-brand-gradient">All Platforms</span>
        </h2>
      </div>
    </div>
  );
}
