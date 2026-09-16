import React from 'react';
import { Star, MessageSquare, ArrowUpRight, Crown, Video, Users } from 'lucide-react';

export default function CreatorCard({ creator, onAskQuestion, onSelectCreator }) {
  const {
    id,
    name,
    handle,
    avatar,
    banner,
    category,
    platform,
    minFee,
    subscribers,
    rating,
    answeredCount,
    bio,
    isLive,
    isVip,
  } = creator;

  return (
    <div className="flex flex-col justify-between rounded-3xl bg-[#0D0D14] border border-[#1E1E2C] p-4 sm:p-5 shadow-xl hover:border-[#EB1000]/50 transition-all duration-300 group text-left space-y-4">
      <div>
        {/* Banner Thumbnail & Badges */}
        <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-purple-950 via-indigo-950 to-black">
          <img
            src={banner || avatar}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          {/* Top Left Live Badge */}
          <div className="absolute top-3 left-3">
            {isLive ? (
              <span className="px-3 py-1 rounded-full bg-[#EB1000] text-white text-[10px] font-extrabold flex items-center gap-1.5 uppercase tracking-wider shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span> LIVE ASKME
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-black/70 text-[#8E8E9F] text-[10px] font-bold border border-white/10">
                OFFLINE
              </span>
            )}
          </div>

          {/* Top Right Category Tag */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-semibold">
              {category}
            </span>
          </div>

          {/* Bottom Right Min Fee Tag */}
          <div className="absolute bottom-2.5 right-2.5">
            <div className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-right">
              <div className="text-[8px] font-mono text-[#7A7A8E] uppercase tracking-widest leading-none">MIN FEE</div>
              <div className="text-xs font-extrabold text-white leading-tight">₹{minFee}</div>
            </div>
          </div>
        </div>

        {/* Avatar & Channel Following Status Bar */}
        <div className="flex items-center justify-between -mt-9 px-1 mb-2">
          {/* Avatar with Checkmark */}
          <div className="relative shrink-0 z-10">
            <img
              src={avatar}
              alt={name}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-[#10B981] shadow-xl bg-[#0D0D14]"
            />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#EB1000] text-white font-black flex items-center justify-center text-[10px] border-2 border-[#0D0D14] shadow-md">
              ✓
            </div>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center gap-2 pt-6">
            <span className="px-3 py-1 rounded-full bg-[#1C151F] border border-[#FF3D71]/30 text-[#FF92AE] text-[10px] font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3D71]"></span> Following
            </span>
            <span className="px-3 py-1 rounded-full bg-[#241014] border border-[#FF0000]/30 text-[#FF4D4D] text-[10px] font-semibold flex items-center gap-1">
              <Video className="h-3 w-3" /> YouTube
            </span>
          </div>
        </div>

        {/* Creator Name & Handle */}
        <div className="space-y-0.5 pt-1">
          <h4 className="font-heading font-extrabold text-base text-white flex items-center gap-1.5">
            {name}
            {isVip && <Crown className="h-4 w-4 text-[#FFD60A] shrink-0" />}
          </h4>
          <div className="text-xs text-[#7A7A8E] font-medium">{handle}</div>
        </div>

        {/* Bio Text */}
        <p className="text-xs text-[#8E8E9F] font-medium line-clamp-2 my-2.5 leading-relaxed">
          {bio}
        </p>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-1 py-2.5 px-3 rounded-xl bg-[#07070C] border border-[#1C1C2A] text-center text-xs">
          <div className="text-[#8E8E9F] font-medium flex flex-col items-center justify-center">
            <span className="text-white font-bold text-xs flex items-center gap-1">
              <Users className="h-3 w-3 text-[#7A7A8E]" /> {subscribers}
            </span>
            <span className="text-[10px] text-[#7A7A8E]">Subs</span>
          </div>
          <div className="border-x border-[#1C1C2A] text-[#8E8E9F] font-medium flex flex-col items-center justify-center">
            <span className="text-[#FFD60A] font-extrabold text-xs flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-[#FFD60A] text-[#FFD60A]" /> {rating}
            </span>
          </div>
          <div className="text-[#8E8E9F] font-medium flex flex-col items-center justify-center">
            <span className="text-xs font-extrabold text-[#EB1000]">
              {answeredCount} <span className="text-[10px] text-[#7A7A8E] font-normal">Answered</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onSelectCreator && onSelectCreator(creator)}
            className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-full bg-[#161622] border border-[#26263A] text-white text-xs font-bold hover:bg-[#202030] transition-colors"
          >
            <span>Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#8E8E9F]" />
          </button>

          <button
            onClick={() => onAskQuestion && onAskQuestion(creator)}
            className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-full bg-[#EB1000] text-white text-xs font-extrabold shadow-lg shadow-[#EB1000]/30 hover:opacity-90 transition-all"
          >
            <MessageSquare className="h-3.5 w-3.5 fill-white" />
            <span>Ask Question</span>
          </button>
        </div>

        {/* VIP Membership Footer Bar */}
        <div className="p-2.5 px-4 rounded-full bg-[#18150A] border border-[#FFD60A]/20 flex items-center justify-between text-xs text-[#FFD60A] font-bold">
          <div className="flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-[#FFD60A]" />
            <span>Join VIP Membership</span>
          </div>
          <span className="text-[10px] text-[#A09040]">₹{minFee * 3 + 199}/mo</span>
        </div>
      </div>
    </div>
  );
}
