import React from 'react';
import LiveBadge from './LiveBadge';
import AskMePayBadge from './AskMePayBadge';
import PlatformIcon from './PlatformIcon';
import { Star, MessageSquare, ArrowUpRight, Mail, Crown, CheckCircle2 } from 'lucide-react';

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
    <div className="flex flex-col justify-between rounded-2xl bg-[#13131A] border border-[#1C1C26] p-4 shadow-xl hover:border-[#00F5D4]/40 transition-all duration-300 group">
      <div>
        {/* Banner Thumbnail & Live Badge Overlay */}
        <div className="relative h-32 w-full rounded-xl overflow-hidden bg-[#0A0A0F] mb-3">
          <img
            src={banner || avatar}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Row Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-2">
            {isLive ? (
              <LiveBadge label="LIVE ASKME" size="small" />
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-[#1C1C26]/80 text-[#8B8B96] text-[10px] font-bold">
                OFFLINE
              </span>
            )}
          </div>

          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-md bg-[#0A0A0F]/80 text-white text-[10px] font-bold border border-[#1C1C26]">
              {category}
            </span>
          </div>

          {/* Min Fee Tag */}
          <div className="absolute bottom-2 right-2">
            <AskMePayBadge amount={minFee} />
          </div>
        </div>

        {/* Creator Identity Bar */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={name}
              className="h-11 w-11 rounded-full object-cover border-2 border-[#00F5D4]"
            />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#00F5D4] flex items-center justify-center text-[#0A0A0F]">
              <CheckCircle2 className="h-3 w-3 stroke-[3]" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-bold text-sm text-white truncate">{name}</h3>
              {isVip && <Crown className="h-3.5 w-3.5 text-[#FFD60A] shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-[#8B8B96] truncate">{handle}</span>
              <PlatformIcon platform={platform} showName={false} size="xs" />
            </div>
          </div>
        </div>

        {/* Bio Text */}
        <p className="text-xs text-[#8B8B96] line-clamp-2 mb-3 leading-relaxed">
          {bio}
        </p>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-1 py-2 px-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-center mb-4">
          <div>
            <span className="block text-[10px] text-[#8B8B96]">Subs</span>
            <span className="text-xs font-bold text-white">{subscribers}</span>
          </div>
          <div className="border-x border-[#1C1C26]">
            <span className="block text-[10px] text-[#8B8B96]">Rating</span>
            <span className="text-xs font-bold text-[#FFD60A] flex items-center justify-center gap-0.5">
              <Star className="h-3 w-3 fill-[#FFD60A]" />
              {rating}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-[#8B8B96]">Answered</span>
            <span className="text-xs font-bold text-white">{answeredCount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Matching PDF Design */}
      <div className="space-y-2 pt-2 border-t border-[#1C1C26]">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectCreator && onSelectCreator(creator)}
            className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-[#1C1C26] text-[#F5F5F7] text-xs font-semibold hover:bg-[#1C1C26]/80 transition-colors"
          >
            <span>Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#8B8B96]" />
          </button>

          <button
            onClick={() => onAskQuestion && onAskQuestion(creator)}
            className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-[#00F5D4] text-[#0A0A0F] text-xs font-bold shadow-md hover:bg-[#00F5D4]/90 transition-all glow-teal"
          >
            <MessageSquare className="h-3.5 w-3.5 fill-[#0A0A0F]" />
            <span>Ask Question</span>
          </button>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] text-[#F5F5F7] text-xs font-semibold hover:border-[#FFD60A]/40 transition-colors">
          <Mail className="h-3.5 w-3.5 text-[#FFD60A]" />
          <span>Paid Mail & Brand Inquiries</span>
        </button>

        <button className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#1C1C26]/60 text-[#00F5D4] text-xs font-bold hover:bg-[#00F5D4]/10 transition-colors">
          <Crown className="h-3.5 w-3.5 text-[#00F5D4]" />
          <span>Join VIP Membership</span>
        </button>
      </div>
    </div>
  );
}
