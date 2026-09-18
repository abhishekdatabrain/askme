import React from 'react';
import { Star, MessageSquare, ArrowUpRight, Crown, Video, Users, Clock, Flame } from 'lucide-react';

export default function CreatorCard({
  creator,
  onAskQuestion,
  onSelectCreator,
  isFollowing,
  onToggleFollow,
  onOpenYoutube,
  onJoinVip,
  profileButtonText = 'Profile',
  hideYoutube = false,
  useLiveQueueMetrics = false,
}) {
  const {
    id,
    name,
    handle,
    cleanUsername,
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

  const handleYoutubeClick = (e) => {
    e.stopPropagation();
    if (onOpenYoutube) {
      onOpenYoutube(creator);
    } else {
      const ytUrl = creator.youtubeUrl || (cleanUsername ? `https://youtube.com/@${cleanUsername}` : 'https://youtube.com');
      window.open(ytUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (onToggleFollow) {
      onToggleFollow(creator);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-3xl bg-[#0D0D14] border border-[#1E1E2C] p-4 sm:p-5 shadow-xl hover:border-[#EB1000]/50 transition-all duration-300 group text-left space-y-4">
      <div>
        {/* Banner Thumbnail & Badges */}
        <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-[#161622] bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-black">
          {banner ? (
            <img
              src={banner}
              alt=""
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1C0A0D] via-[#161622] to-[#0A0A10]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D14] via-black/40 to-transparent"></div>

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


        </div>

        {/* Avatar & Channel Following Status Bar */}
        <div className="flex items-center justify-between -mt-9 px-1 mb-2">
          {/* Avatar with Checkmark */}
          <div className="relative shrink-0 z-10">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={name || 'Creator Avatar'}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-[#10B981] shadow-xl bg-[#0D0D14]"
            />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#EB1000] text-white font-black flex items-center justify-center text-[10px] border-2 border-[#0D0D14] shadow-md">
              ✓
            </div>
          </div>

          {/* Right Status Badges (Interactive Buttons) */}
          <div className="flex items-center gap-2 pt-8">
            <button
              type="button"
              onClick={handleFollowClick}
              className={`px-3 py-1 rounded-full border text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${isFollowing
                ? 'bg-[#1C151F] border-[#FF3D71]/40 text-[#FF92AE] hover:bg-[#2A182E]'
                : 'bg-[#EB1000]/15 border-[#EB1000]/40 text-[#EB1000] hover:bg-[#EB1000] hover:text-white'
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isFollowing ? 'bg-[#FF3D71]' : 'bg-[#EB1000]'}`}></span>
              {isFollowing ? 'Following' : '+ Follow'}
            </button>

            {!hideYoutube && (
              <button
                type="button"
                onClick={handleYoutubeClick}
                className="px-3 py-1 rounded-full bg-[#241014] border border-[#FF0000]/30 text-[#FF4D4D] text-[10px] font-semibold flex items-center gap-1 hover:bg-[#FF0000] hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <Video className="h-3 w-3" /> YouTube
              </button>
            )}
          </div>
        </div>

        {/* Creator Name & Handle */}
        <div className="space-y-0.5 pt-1">
          <h4 className="font-heading font-extrabold text-base text-white flex items-center gap-1.5">
            {name}
            {/* {isVip && <Crown className="h-4 w-4 text-[#FFD60A] shrink-0" />} */}
          </h4>
          <div className="text-xs text-[#7A7A8E] font-medium">{handle}</div>
        </div>

        {/* Bio Text */}
        <p className="text-xs text-[#8E8E9F] font-medium line-clamp-2 my-2.5 leading-relaxed">
          {bio}
        </p>

        {/* Metrics Row */}
        {useLiveQueueMetrics ? (
          <div className="flex items-center justify-around py-2.5 px-4 rounded-full bg-[#090910] border border-[#222234] text-xs font-semibold shadow-inner">
            <div className="flex items-center gap-1.5 text-[#8E8E9F]">
              <Clock className="h-3.5 w-3.5 text-[#FF9500]" />
              <span>Queue: <strong className="text-white font-extrabold">{creator.queueCount !== undefined ? creator.queueCount : (creator.pendingQueue !== undefined ? creator.pendingQueue : 0)}</strong></span>
            </div>
            <span className="h-3.5 w-[1px] bg-[#252538]"></span>
            <div className="flex items-center gap-1.5 text-[#8E8E9F]">
              <Flame className="h-3.5 w-3.5 text-[#FF3B30]" />
              <span>Answered: <strong className="text-white font-extrabold">{answeredCount}</strong></span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 py-2.5 px-3 rounded-xl bg-[#07070C] border border-[#1C1C2A] text-center text-xs">
            <div className="text-[#8E8E9F] font-medium flex items-center justify-center">
              <Users className="h-4 w-4 text-[#7A7A8E] mr-1.5" />

              <span className="text-white font-bold text-sm">
                {subscribers}
              </span>

              <span className="text-[11px] text-[#7A7A8E] ml-1">
                Subs
              </span>
            </div>

            <div className="text-[#8E8E9F] font-medium flex flex-col items-center justify-center">
              <span className="text-xs font-extrabold text-[#EB1000]">
                {answeredCount} <span className="text-[10px] text-[#7A7A8E] font-normal">Answered</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onSelectCreator && onSelectCreator(creator)}
            className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-full bg-[#161622] border border-[#26263A] text-white text-xs font-bold hover:bg-[#202030] hover:border-[#383850] transition-colors cursor-pointer active:scale-95"
          >
            <span>{profileButtonText}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#8E8E9F]" />
          </button>

          <button
            type="button"
            onClick={() => onAskQuestion && onAskQuestion(creator)}
            className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-full bg-[#EB1000] text-white text-xs font-extrabold shadow-lg shadow-[#EB1000]/30 hover:bg-[#CC0E00] hover:scale-[1.02] transition-all cursor-pointer active:scale-95"
          >
            <MessageSquare className="h-3.5 w-3.5 fill-white" />
            <span>Ask Question</span>
          </button>
        </div>

        {/* VIP Membership Footer Bar */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onJoinVip) onJoinVip(creator);
          }}
          className="w-full p-2.5 px-4 rounded-full bg-[#18150A] border border-[#FFD60A]/30 flex items-center justify-between text-xs text-[#FFD60A] font-bold hover:bg-[#2A230C] hover:border-[#FFD60A]/60 transition-all cursor-pointer active:scale-95 group/vip"
        >
          <div className="flex items-center justify-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-[#FFD60A] group-hover/vip:scale-110 transition-transform" />
            <span>Join VIP Membership</span>
          </div>
        </button>
      </div>
    </div>
  );
}

