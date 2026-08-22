'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
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
  CheckCircle2,
  Sun,
  Moon,
  Bell
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

const YoutubeIcon = ({ className = "h-4 w-4 text-[#FF0000]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = ({ className = "h-4 w-4 text-[#E1306C]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ className = "h-4 w-4 text-[#1DA1F2]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TwitchIcon = ({ className = "h-4 w-4 text-[#9146FF]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143h-1.715zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
  </svg>
);

export default function CreatorProfilePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bio'); // 'bio' | 'social' | 'streaming' | 'payment'
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedOverlay, setCopiedOverlay] = useState(false);

  // Theme State
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('askme_creator_theme') || 'dark') : 'dark';
      setTheme(savedTheme);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('creator-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('creator-theme-changed', handleThemeChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('askme_creator_theme', nextTheme);
      window.dispatchEvent(new Event('creator-theme-changed'));
    }
  };

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
  });

  const [socialLinks, setSocialLinks] = useState({
    youtube: '',
    instagram: '',
    twitter: '',
    twitch: '',
    discord: '',
  });

  const [streamingChannels, setStreamingChannels] = useState({
    platform: 'YouTube Live',
    streamUrl: '',
    channelHandle: '',
  });

  const [bankAccount, setBankAccount] = useState({
    upiId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });

  const fetchCreatorProfile = useCallback(async () => {
    const token = getCreatorToken();
    const userObj = getCreatorUser();

    if (!token || !userObj?.id) {
      window.location.href = "/creators/login";
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${API_ENDPOINTS.CREATORS.PROFILE}?creatorId=${userObj.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      console.log("Profile Data:", data);

      if (res.ok && data.status === "success" && data.data) {
        const c = data.data.creator || {};
        const p = data.data.profile || {};
        const bank = data.data.bankAccount || {};
        const socialArr = data.data.socialLinks || [];

        const socialMap = {
          youtube: '',
          instagram: '',
          twitter: '',
          twitch: '',
          discord: '',
        };

        if (Array.isArray(socialArr)) {
          socialArr.forEach((link) => {
            const key = (link.platform || '').toLowerCase();
            const url = link.profile_url || link.url || link.profileUrl || '';
            if (key === 'x' || key === 'twitter') socialMap.twitter = url;
            else if (Object.prototype.hasOwnProperty.call(socialMap, key)) {
              socialMap[key] = url;
            }
          });
        }

        setProfile({
          id: c.id || userObj.id,
          fullName: c.full_name || c.fullName || userObj.fullName || userObj.full_name || '',
          username: c.username ? (c.username.startsWith('@') ? c.username : `@${c.username}`) : (userObj.username || '@creator'),
          email: c.email || userObj.email || '',
          mobile: c.mobile || c.mobileNumber || userObj.mobile || '',
          country: c.country || 'India',
          profileImage: c.profile_image || c.profileImage || userObj.profileImage || '',
          bio: p.bio || '',
        });

        setStreamingChannels({
          platform: p.streaming_platform || 'YouTube Live',
          streamUrl: p.stream_url || '',
          channelHandle: p.channel_handle || (c.username ? `@${c.username.replace(/^@+/, '')}` : ''),
        });

        setSocialLinks(socialMap);

        setBankAccount({
          upiId: bank.upi_id || bank.upiId || '',
          bankName: bank.bank_name || bank.bankName || '',
          accountNumber: bank.account_number || bank.accountNumber || '',
          ifscCode: bank.ifsc_code || bank.ifscCode || '',
          accountHolderName: bank.account_holder_name || bank.accountHolderName || c.full_name || userObj.fullName || '',
        });
      }
    } catch (err) {
      console.warn(
        "Profile details fetch notice:",
        err?.message
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreatorProfile();
  }, [fetchCreatorProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, profileImage: fakeUrl }));
      toast.success('Avatar preview updated!', 'Profile Picture');
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const token = getCreatorToken();
      const userObj = getCreatorUser();
      const creatorId = profile.id || userObj?.id;

      const payload = {
        creatorId,
        fullName: profile.fullName,
        profileImage: profile.profileImage,
        bio: profile.bio,
        country: profile.country,
        streamingChannels: {
          platform: streamingChannels.platform,
          streamUrl: streamingChannels.streamUrl,
          channelHandle: streamingChannels.channelHandle,
        },
        socialLinks: socialLinks,
        paymentInfo: {
          upiId: bankAccount.upiId,
          bankName: bankAccount.bankName,
          accountNumber: bankAccount.accountNumber,
          ifscCode: bankAccount.ifscCode,
          accountHolderName: bankAccount.accountHolderName,
        },
      };

      const res = await fetch(API_ENDPOINTS.CREATORS.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const storedUser = getCreatorUser();
        if (storedUser) {
          storedUser.fullName = profile.fullName;
          storedUser.full_name = profile.fullName;
          storedUser.profileImage = profile.profileImage;
          storedUser.profile_image = profile.profileImage;
          setCookie('askme_user', storedUser);
        }

        toast.success('Creator profile settings saved successfully!', 'Saved!');
        fetchCreatorProfile();
      } else {
        toast.error(data?.message || 'Failed to save profile settings.', 'Error');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      toast.error('Network issue connecting to server.', 'Error');
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
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-3 font-sans ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20]' : 'bg-[#0A0A0F] text-white'
        }`}>
        <div className="h-10 w-10 border-4 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#8B8B96]">Loading Creator Profile Management...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
      }`}>
      {/* 1. Creator Dashboard Sidebar */}
      <CreatorSidebar theme={theme} onToggleTheme={toggleTheme} />

      {/* 2. Main Profile Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between transition-colors duration-200 ${theme === 'light' ? 'border-[#E9ECEF] bg-white/90 backdrop-blur-md' : 'border-[#1C1C26] bg-[#0A0A0F]/80 backdrop-blur-md'
          }`}>
          <div>
            <h1 className={`font-heading font-black text-xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
              }`}>Creator Profile & Channel Settings</h1>
            <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
              }`}>Manage your avatar, channel bio, social media handles, stream parameters & payout destination</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Header Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${theme === 'light'
                ? 'bg-[#F1F3F5] text-[#212529] border-[#E9ECEF] hover:bg-[#E9ECEF]'
                : 'bg-[#1C1C26] text-white border-[#1C1C26] hover:border-[#00F5D4]/40'
                }`}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-[#FFD60A]" />
                  <span className="hidden sm:inline">Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-[#7B2FFF]" />
                  <span className="hidden sm:inline">Dark Theme</span>
                </>
              )}
            </button>

            {/* Notification Bell Icon Popup Dropdown */}
            <CreatorNotificationDropdown theme={theme} />
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-5xl w-full mx-auto">
          {/* Top Overview & Profile Avatar Header Card */}
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-200 ${theme === 'light'
            ? 'bg-gradient-to-r from-white via-[#F8F9FA] to-white border-[#E9ECEF]'
            : 'bg-gradient-to-r from-[#13131A] via-[#1C1C26] to-[#13131A] border-[#1C1C26]'
            }`}>
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
                  <div className={`h-24 w-24 rounded-2xl border-2 border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] font-black text-3xl shadow-lg ${theme === 'light' ? 'bg-[#F8F9FA]' : 'bg-[#1C1C26]'
                    }`}>
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
                  <h2 className={`font-heading font-black text-2xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>{profile.fullName || 'Creator Host'}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-[10px] font-bold">
                    VERIFIED CREATOR
                  </span>
                </div>
                <p className="text-xs text-[#00F5D4] font-medium mt-0.5">{profile.username || '@creator'}</p>
                <p className={`text-xs mt-1 max-w-md line-clamp-2 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                  }`}>
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

          {/* Section Navigation Tabs */}
          <div className={`flex items-center gap-2 overflow-x-auto pb-1 border-b ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
            }`}>
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
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-brand-gradient text-[#0A0A0F] shadow-md font-black'
                    : theme === 'light'
                      ? 'bg-white text-[#6C757D] hover:text-[#1A1D20] border border-[#E9ECEF]'
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
              <div className={`p-6 rounded-3xl border space-y-5 shadow-xl animate-fade-in ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                <div className={`border-b pb-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                  }`}>
                  <h3 className={`font-heading font-bold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>
                    <User className="h-5 w-5 text-[#00F5D4]" /> Profile Image & Personal Bio
                  </h3>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>
                    Update your public creator identity, avatar photo, channel tagline, and location.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>Full Creator Name</label>
                    <input
                      type="text"
                      value={profile.fullName || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="e.g. CarryMinati / Technological"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] transition-colors ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>Username </label>
                    <input
                      type="text"
                      value={profile.username || ''}
                      readOnly
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs cursor-not-allowed ${theme === 'light' ? 'bg-[#E9ECEF] border-[#DEE2E6] text-[#6C757D]' : 'bg-[#0A0A0F]/60 border-[#1C1C26] text-[#8B8B96]'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>Email Address</label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      readOnly
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs cursor-not-allowed ${theme === 'light' ? 'bg-[#E9ECEF] border-[#DEE2E6] text-[#6C757D]' : 'bg-[#0A0A0F]/60 border-[#1C1C26] text-[#8B8B96]'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>Country / Region</label>
                    <input
                      type="text"
                      value={profile.country || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] transition-colors ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                        }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>Profile Image URL (Or Upload Above)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profile.profileImage || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, profileImage: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                      className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                    />
                    <label className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 transition ${theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#252533]'
                      }`}>
                      <Upload className="h-4 w-4 text-[#00F5D4]" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>Broadcast Channel Bio & Intro</label>
                  <textarea
                    rows={4}
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell your audience about your live broadcasts, stream schedule, topics, and paid Q&A guidelines..."
                    className={`w-full rounded-xl border p-3.5 text-xs focus:outline-none focus:border-[#00F5D4] transition-colors ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                      }`}
                  />
                  <p className={`text-[11px] mt-1 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>This bio will be shown on your public AskMe viewer page.</p>
                </div>
              </div>
            )}

            {/* TAB 2: Social Links */}
            {activeTab === 'social' && (
              <div className={`p-6 rounded-3xl border space-y-5 shadow-xl animate-fade-in ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                <div className={`border-b pb-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                  }`}>
                  <h3 className={`font-heading font-bold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>
                    <Globe className="h-5 w-5 text-[#00F5D4]" /> Social Media Links & Community Handles
                  </h3>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>
                    Connect your YouTube, Instagram, X/Twitter, Twitch, and Discord community handles.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-2 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>
                      <YoutubeIcon className="h-4 w-4 text-[#FF0000]" /> YouTube Channel Link
                    </label>
                    <input
                      type="url"
                      value={socialLinks.youtube || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: e.target.value }))}
                      placeholder="https://youtube.com/@yourchannel"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-2 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>
                      <InstagramIcon className="h-4 w-4 text-[#E1306C]" /> Instagram Profile Link
                    </label>
                    <input
                      type="url"
                      value={socialLinks.instagram || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="https://instagram.com/yourhandle"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-2 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>
                      <TwitterIcon className="h-4 w-4 text-[#1DA1F2]" /> Twitter / X Profile Link
                    </label>
                    <input
                      type="url"
                      value={socialLinks.twitter || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://twitter.com/yourhandle"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 flex items-center gap-2 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>
                      <TwitchIcon className="h-4 w-4 text-[#9146FF]" /> Twitch Channel Link
                    </label>
                    <input
                      type="url"
                      value={socialLinks.twitch || ''}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, twitch: e.target.value }))}
                      placeholder="https://twitch.tv/yourchannel"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Streaming Channels */}
            {activeTab === 'streaming' && (
              <div className={`p-6 rounded-3xl border space-y-5 shadow-xl animate-fade-in ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                <div className={`border-b pb-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                  }`}>
                  <h3 className={`font-heading font-bold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>
                    <Radio className="h-5 w-5 text-[#00F5D4]" /> Live Streaming Platform Parameters
                  </h3>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>
                    Configure default broadcast platform, stream URL link, and OBS widget parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>Default Streaming Platform</label>
                    <select
                      value={streamingChannels.platform || 'YouTube Live'}
                      onChange={(e) => setStreamingChannels(prev => ({ ...prev, platform: e.target.value }))}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                        }`}
                    >
                      <option value="YouTube Live">YouTube Live</option>
                      <option value="Twitch">Twitch</option>
                      <option value="Kick">Kick Broadcast</option>
                      <option value="OBS Studio">OBS Studio / Custom RTMP</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>Live Broadcast Stream URL</label>
                    <input
                      type="url"
                      value={streamingChannels.streamUrl || ''}
                      onChange={(e) => setStreamingChannels(prev => ({ ...prev, streamUrl: e.target.value }))}
                      placeholder="https://youtube.com/live/your-stream-id"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                        }`}
                    />
                  </div>
                </div>

                {/* OBS Overlay Link Box */}
                <div className={`p-4 rounded-2xl border space-y-2 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                  }`}>
                  <label className={`block text-xs font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>Your Personal OBS Browser Source Overlay URL</label>
                  <div className={`p-3 rounded-xl border font-mono text-xs text-[#00F5D4] flex items-center justify-between overflow-x-auto ${theme === 'light' ? 'bg-white border-[#DEE2E6]' : 'bg-[#13131A] border-[#1C1C26]'
                    }`}>
                    <span>{overlayUrl}</span>
                    <button
                      type="button"
                      onClick={copyOverlayUrl}
                      className="px-3 py-1 rounded-lg bg-[#00F5D4] text-[#0A0A0F] font-bold text-[11px] hover:opacity-90 transition flex items-center gap-1 shrink-0 ml-2"
                    >
                      {copiedOverlay ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedOverlay ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Payment Information */}
            {activeTab === 'payment' && (
              <div className={`p-6 rounded-3xl border space-y-5 shadow-xl animate-fade-in ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                }`}>
                <div className={`border-b pb-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                  }`}>
                  <h3 className={`font-heading font-bold text-base flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                    }`}>
                    <CreditCard className="h-5 w-5 text-[#00F5D4]" /> Bank Payout & UPI Destination Settings
                  </h3>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                    }`}>
                    Configure default UPI Virtual Payment Address (VPA) and direct bank account payout details.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                      }`}>UPI ID (Instant Payout VPA)</label>
                    <input
                      type="text"
                      value={bankAccount.upiId || ''}
                      onChange={(e) => setBankAccount(prev => ({ ...prev, upiId: e.target.value }))}
                      placeholder="e.g. creator@upi or carryminati@okicici"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-xs text-[#00F5D4] font-bold focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] placeholder-[#8B8B96]'
                        }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                        }`}>Account Holder Name</label>
                      <input
                        type="text"
                        value={bankAccount.accountHolderName || ''}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        placeholder="e.g. Abhishek Kumar"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                          }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                        }`}>Bank Name</label>
                      <input
                        type="text"
                        value={bankAccount.bankName || ''}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, bankName: e.target.value }))}
                        placeholder="e.g. HDFC Bank / ICICI Bank"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                        }`}>Account Number</label>
                      <input
                        type="text"
                        value={bankAccount.accountNumber || ''}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="e.g. 50100298410294"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                          }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                        }`}>IFSC Code</label>
                      <input
                        type="text"
                        value={bankAccount.ifscCode || ''}
                        onChange={(e) => setBankAccount(prev => ({ ...prev, ifscCode: e.target.value }))}
                        placeholder="e.g. HDFC0000240"
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20] placeholder-[#A0A0A0]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white placeholder-[#8B8B96]'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
