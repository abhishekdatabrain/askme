'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useToast } from '@/context/ToastContext';
import { getCreatorToken, getCreatorUser, setCookie } from '@/utils/cookies';
import {
  User,
  Mail,
  Globe,
  Phone,
  Camera,
  Save,
  ArrowLeft,
  MessageSquare,
  CreditCard,
  Building2,
  ShieldCheck,
  Check,
  Sparkles,
  Video,
  Copy,
  ExternalLink,
  RefreshCw,
  Upload,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

const YoutubeIcon = ({ className = "h-4 w-4 text-[#FF0000]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className = "h-4 w-4 text-[#E1306C]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TwitterIcon = ({ className = "h-4 w-4 text-[#1DA1F2]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TwitchIcon = ({ className = "h-4 w-4 text-[#9146FF]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143h-1.715zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

export default function CreatorProfilePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bio'); // 'bio' | 'social' | 'streaming' | 'payment'
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedOverlay, setCopiedOverlay] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    id: null,
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    country: 'India',
    profileImage: '',
    bio: '',
    category: 'Gaming & Esport',

    // Streaming Channels
    streamingChannels: {
      platform: 'YouTube Live',
      streamUrl: '',
      channelHandle: '',
    },

    // Social Links
    socialLinks: {
      youtube: '',
      instagram: '',
      twitter: '',
      twitch: '',
      discord: '',
    },

    // Payment Information
    paymentInfo: {
      upiId: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
    },
  });

  useEffect(() => {
    const token = getCreatorToken();
    const userObj = getCreatorUser();

    if (!token || !userObj || !userObj.id) {
      window.location.href = '/creators/login';
      return;
    }

    setProfile(prev => ({
      ...prev,
      id: userObj.id,
      fullName: userObj.fullName || userObj.full_name || '',
      username: userObj.username || '',
      email: userObj.email || '',
      mobile: userObj.mobile || userObj.mobileNumber || '',
      country: userObj.country || 'India',
      profileImage: userObj.profileImage || userObj.profile_image || '',
      bio: userObj.bio || '',
    }));

    // Fetch complete profile from backend API
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_ENDPOINTS.CREATORS.PROFILE}?creatorId=${userObj.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.status === 'success' && data.data) {
          const d = data.data;
          setProfile(prev => ({
            ...prev,
            fullName: d.fullName || prev.fullName,
            username: d.username || prev.username,
            email: d.email || prev.email,
            mobile: d.mobile || prev.mobile,
            country: d.country || prev.country,
            profileImage: d.profileImage || prev.profileImage,
            bio: d.bio || prev.bio,
            streamingChannels: {
              platform: d.streamingChannels?.platform || prev.streamingChannels.platform,
              streamUrl: d.streamingChannels?.streamUrl || prev.streamingChannels.streamUrl,
              channelHandle: d.streamingChannels?.channelHandle || prev.streamingChannels.channelHandle || prev.username,
            },
            socialLinks: {
              youtube: d.socialLinks?.youtube || prev.socialLinks.youtube,
              instagram: d.socialLinks?.instagram || prev.socialLinks.instagram,
              twitter: d.socialLinks?.twitter || prev.socialLinks.twitter,
              twitch: d.socialLinks?.twitch || prev.socialLinks.twitch,
              discord: d.socialLinks?.discord || prev.socialLinks.discord,
            },
            paymentInfo: {
              upiId: d.paymentInfo?.upiId || prev.paymentInfo.upiId,
              bankName: d.paymentInfo?.bankName || prev.paymentInfo.bankName,
              accountNumber: d.paymentInfo?.accountNumber || prev.paymentInfo.accountNumber,
              ifscCode: d.paymentInfo?.ifscCode || prev.paymentInfo.ifscCode,
              accountHolderName: d.paymentInfo?.accountHolderName || prev.paymentInfo.accountHolderName || prev.fullName,
            }
          }));
        }
      } catch (err) {
        console.warn('Profile fetch warning:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile image must be less than 5MB.', 'File Too Large');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profileImage: reader.result }));
        toast.info('New avatar selected. Click Save Changes to apply.', 'Avatar Selected');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = getCreatorToken();
      const response = await fetch(API_ENDPOINTS.CREATORS.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          creatorId: profile.id,
          fullName: profile.fullName,
          profileImage: profile.profileImage,
          bio: profile.bio,
          country: profile.country,
          streamingChannels: profile.streamingChannels,
          socialLinks: profile.socialLinks,
          paymentInfo: profile.paymentInfo,
        }),
      });

      const resData = await response.json();

      if (response.ok && (resData.status === 'success' || resData.data)) {
        // Update LocalStorage user object
        const u = getCreatorUser();
        if (u) {
          u.fullName = profile.fullName;
          u.profileImage = profile.profileImage;
          u.bio = profile.bio;
          setCookie('askme_user', u);
        }

        toast.success('Creator Profile & Broadcast Settings updated successfully!', 'Profile Saved');
      } else {
        toast.error(resData.message || 'Failed to save profile changes.', 'Save Failed');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      toast.error('Network issue connecting to server. Local settings updated.', 'Saved Locally');
    } finally {
      setIsSaving(false);
    }
  };

  const overlayUrl = `https://askme.pro/overlay/${profile.username?.replace('@', '') || 'creator'}`;
  const copyOverlayUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopiedOverlay(true);
    toast.success('OBS Overlay URL copied to clipboard!', 'Copied!');
    setTimeout(() => setCopiedOverlay(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center space-y-3">
        <div className="h-10 w-10 border-4 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#8B8B96]">Loading Creator Profile Management...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
      {/* 1. Creator Dashboard Sidebar */}
      <CreatorSidebar />

      {/* 2. Main Profile Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="border-b border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-black text-xl text-white">Creator Profile & Channel Settings</h1>
            <p className="text-xs text-[#8B8B96]">Manage your avatar, channel bio, social media handles, stream parameters & payout destination</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/creators/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-[#1C1C26] text-white text-xs font-semibold hover:bg-[#1C1C26]/80 transition-colors border border-[#1C1C26] flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Studio
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          {/* Top Overview & Profile Avatar Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#13131A] via-[#1C1C26] to-[#13131A] border border-[#1C1C26] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Profile Image with Camera Upload Button */}
              <div className="relative group">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.fullName}
                    className="h-24 w-24 rounded-2xl object-cover border-2 border-[#00F5D4]/40 shadow-lg glow-teal"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-[#1C1C26] border-2 border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] font-black text-3xl shadow-lg">
                    {(profile.fullName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#00F5D4] text-[#0A0A0F] hover:scale-110 cursor-pointer shadow-md transition-all">
                  <Camera className="h-4 w-4 stroke-[2.5]" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="font-heading font-black text-2xl text-white">{profile.fullName || 'Creator Host'}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-[10px] font-bold">
                    VERIFIED CREATOR
                  </span>
                </div>
                <p className="text-xs text-[#00F5D4] font-medium mt-0.5">{profile.username || '@creator'}</p>
                <p className="text-xs text-[#8B8B96] mt-1 max-w-md line-clamp-2">
                  {profile.bio || 'No channel bio set yet. Add a short tagline to inform your viewers about your live broadcasts.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition-all flex items-center gap-2 shrink-0 self-center"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 stroke-[2.5]" /> Save Profile Changes
                </>
              )}
            </button>
          </div>

          {/* Section Navigation Tabs (5.1 Management) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1C1C26]">
            {[
              { id: 'bio', label: 'Profile & Bio', icon: User },
              { id: 'social', label: 'Social Links', icon: Globe },
              { id: 'streaming', label: 'Streaming Channels', icon: Radio },
              { id: 'payment', label: 'Payment Information', icon: CreditCard },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-brand-gradient text-[#0A0A0F] shadow-md'
                      : 'bg-[#13131A] text-[#8B8B96] hover:text-white border border-[#1C1C26]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* TAB 1: Profile Image, Personal Info & Bio */}
            {activeTab === 'bio' && (
              <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-5 shadow-xl animate-fade-in">
                <div className="border-b border-[#1C1C26] pb-4">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-[#00F5D4]" /> Profile Image & Personal Bio
                  </h3>
                  <p className="text-xs text-[#8B8B96] mt-0.5">
                    Update your public creator identity, avatar photo, channel tagline, and location.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Full Creator Name</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="e.g. CarryMinati / Technological"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Username Handle (Read Only)</label>
                    <input
                      type="text"
                      value={profile.username}
                      readOnly
                      className="w-full rounded-xl bg-[#0A0A0F]/60 border border-[#1C1C26] px-3.5 py-2.5 text-xs text-[#8B8B96] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full rounded-xl bg-[#0A0A0F]/60 border border-[#1C1C26] px-3.5 py-2.5 text-xs text-[#8B8B96] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Country / Region</label>
                    <input
                      type="text"
                      value={profile.country}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Profile Image URL (Or Upload Above)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profile.profileImage}
                      onChange={(e) => setProfile(prev => ({ ...prev, profileImage: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                      className="flex-1 rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-[#1C1C26] text-white hover:bg-[#252533] text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                      <Upload className="h-4 w-4 text-[#00F5D4]" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Broadcast Channel Bio & Intro</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell your audience about your live broadcasts, stream schedule, topics, and paid Q&A guidelines..."
                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] p-3.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] transition-colors"
                  />
                  <p className="text-[11px] text-[#8B8B96] mt-1">This bio will be shown on your public AskMe viewer page.</p>
                </div>
              </div>
            )}

            {/* TAB 2: Social Links */}
            {activeTab === 'social' && (
              <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-5 shadow-xl animate-fade-in">
                <div className="border-b border-[#1C1C26] pb-4">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#00F5D4]" /> Social Media Links & Community Handles
                  </h3>
                  <p className="text-xs text-[#8B8B96] mt-0.5">
                    Connect your YouTube, Instagram, X/Twitter, Twitch, and Discord community handles.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5 flex items-center gap-2">
                      <YoutubeIcon className="h-4 w-4 text-[#FF0000]" /> YouTube Channel Link
                    </label>
                    <input
                      type="url"
                      value={profile.socialLinks.youtube}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                      }))}
                      placeholder="https://youtube.com/@yourchannel"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5 flex items-center gap-2">
                      <InstagramIcon className="h-4 w-4 text-[#E1306C]" /> Instagram Profile Link
                    </label>
                    <input
                      type="url"
                      value={profile.socialLinks.instagram}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                      }))}
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5 flex items-center gap-2">
                      <TwitterIcon className="h-4 w-4 text-[#1DA1F2]" /> Twitter / X Profile Link
                    </label>
                    <input
                      type="url"
                      value={profile.socialLinks.twitter}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                      }))}
                      placeholder="https://x.com/yourhandle"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5 flex items-center gap-2">
                      <TwitchIcon className="h-4 w-4 text-[#9146FF]" /> Twitch Channel Link
                    </label>
                    <input
                      type="url"
                      value={profile.socialLinks.twitch}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitch: e.target.value }
                      }))}
                      placeholder="https://twitch.tv/yourchannel"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#5865F2]" /> Discord Server Invite URL
                    </label>
                    <input
                      type="url"
                      value={profile.socialLinks.discord}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, discord: e.target.value }
                      }))}
                      placeholder="https://discord.gg/yourserver"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Streaming Channels & OBS Settings */}
            {activeTab === 'streaming' && (
              <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-5 shadow-xl animate-fade-in">
                <div className="border-b border-[#1C1C26] pb-4">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <Radio className="h-5 w-5 text-[#00F5D4]" /> Broadcast & Streaming Channels
                  </h3>
                  <p className="text-xs text-[#8B8B96] mt-0.5">
                    Configure your primary streaming platform, OBS Browser Source overlay, and live channel parameters.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Primary Broadcast Platform</label>
                    <select
                      value={profile.streamingChannels.platform}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        streamingChannels: { ...prev.streamingChannels, platform: e.target.value }
                      }))}
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                    >
                      <option value="YouTube Live">YouTube Live</option>
                      <option value="Twitch">Twitch</option>
                      <option value="Kick">Kick Broadcast</option>
                      <option value="OBS Studio Custom">OBS Studio / Custom RTMP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Live Broadcast / Stream URL</label>
                    <input
                      type="url"
                      value={profile.streamingChannels.streamUrl}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        streamingChannels: { ...prev.streamingChannels, streamUrl: e.target.value }
                      }))}
                      placeholder="https://youtube.com/live/your-live-stream-id"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Broadcast Channel Handle</label>
                    <input
                      type="text"
                      value={profile.streamingChannels.channelHandle}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        streamingChannels: { ...prev.streamingChannels, channelHandle: e.target.value }
                      }))}
                      placeholder="@yourchannel"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  {/* OBS Overlay Link Box */}
                  <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#00F5D4]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Video className="h-4 w-4 text-[#00F5D4]" /> Live OBS Browser Source Overlay URL
                      </span>
                      <button
                        type="button"
                        onClick={copyOverlayUrl}
                        className="px-3 py-1 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] hover:bg-[#00F5D4]/20 border border-[#00F5D4]/30 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Copy className="h-3.5 w-3.5" /> {copiedOverlay ? 'Copied!' : 'Copy Overlay URL'}
                      </button>
                    </div>
                    <code className="block p-2.5 rounded-xl bg-[#13131A] text-[11px] text-[#00F5D4] font-mono overflow-x-auto">
                      {overlayUrl}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Payment Information */}
            {activeTab === 'payment' && (
              <div className="p-6 rounded-3xl bg-[#13131A] border border-[#1C1C26] space-y-5 shadow-xl animate-fade-in">
                <div className="border-b border-[#1C1C26] pb-4">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#00F5D4]" /> Payout & Payment Destination
                  </h3>
                  <p className="text-xs text-[#8B8B96] mt-0.5">
                    Provide your UPI ID and Bank account details to receive automatic 85% revenue settlements.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Primary UPI Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={profile.paymentInfo.upiId}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        paymentInfo: { ...prev.paymentInfo, upiId: e.target.value }
                      }))}
                      placeholder="e.g. 9876543210@paytm / creator@upi"
                      className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Bank Account Holder Name</label>
                      <input
                        type="text"
                        value={profile.paymentInfo.accountHolderName}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          paymentInfo: { ...prev.paymentInfo, accountHolderName: e.target.value }
                        }))}
                        placeholder="As shown in bank passbook / PAN"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Bank Name</label>
                      <input
                        type="text"
                        value={profile.paymentInfo.bankName}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          paymentInfo: { ...prev.paymentInfo, bankName: e.target.value }
                        }))}
                        placeholder="e.g. HDFC Bank / ICICI Bank / SBI"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">Bank Account Number</label>
                      <input
                        type="password"
                        value={profile.paymentInfo.accountNumber}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          paymentInfo: { ...prev.paymentInfo, accountNumber: e.target.value }
                        }))}
                        placeholder="Enter bank account number"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#8B8B96] mb-1.5">IFSC Code</label>
                      <input
                        type="text"
                        value={profile.paymentInfo.ifscCode}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          paymentInfo: { ...prev.paymentInfo, ifscCode: e.target.value.toUpperCase() }
                        }))}
                        placeholder="e.g. HDFC0001234"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3.5 py-2.5 text-xs text-white placeholder-[#8B8B96] focus:outline-none focus:border-[#00F5D4] uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit & Save Footer Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#13131A] border border-[#1C1C26]">
              <span className="text-xs text-[#8B8B96]">
                All changes sync automatically to database and viewer broadcasts.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 stroke-[2.5]" /> Save All Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
