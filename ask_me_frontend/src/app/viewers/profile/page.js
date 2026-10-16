'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Trash2,
  Save,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Edit3,
  X,
  ChevronRight,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  Send,
  Eye,
  EyeOff,
  AtSign,
  Lock,
  Key
} from 'lucide-react';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { getViewerToken, getViewerUser, setViewerSession } from '@/utils/cookies';
import { useToast } from '@/context/ToastContext';

// Platform Icons
const InstagramIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitchIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143h-1.715zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
  </svg>
);

const TwitterXIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'United Arab Emirates', 'Singapore', 'Japan', 'France',
  'Brazil', 'Indonesia', 'Saudi Arabia', 'South Korea', 'Other'
];

export default function ViewerProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // Theme Sync
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
    setTheme(saved);

    const handleThemeChange = () => {
      const updated = typeof window !== 'undefined' ? (localStorage.getItem('askme_viewer_theme') || 'dark') : 'dark';
      setTheme(updated);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('viewer-theme-changed', handleThemeChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('viewer-theme-changed', handleThemeChange);
      }
    };
  }, []);

  // Main Profile State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    country: 'India',
    avatar: '',
  });

  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    youtube: '',
    facebook: '',
    twitch: '',
    twitter: '',
  });

  // Avatar Upload / Preview State
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: '',
  });
  const usernameCheckTimeout = useRef(null);

  // Email Change Modal / Flow State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Mobile Change Modal / Flow State
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);
  const [isVerifyingMobileOtp, setIsVerifyingMobileOtp] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileCooldown, setMobileCooldown] = useState(0);

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Initial Load - Fetch Profile
  useEffect(() => {
    fetchProfile();
  }, []);

  // Cooldown timers
  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  useEffect(() => {
    if (mobileCooldown > 0) {
      const timer = setTimeout(() => setMobileCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [mobileCooldown]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = getViewerToken();
      if (!token) {
        toast.error('Session expired. Please log in again.');
        router.push('/');
        return;
      }

      const res = await fetch(API_ENDPOINTS.VIEWERS.PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.status === 'success' && data.data?.user) {
        const u = data.data.user;
        setUserProfile(u);
        setFormData({
          fullName: u.fullName || u.name || '',
          username: u.username || '',
          bio: u.bio || '',
          country: u.country || 'India',
          avatar: u.avatar || u.profileImage || '',
        });
        setAvatarPreview(u.avatar || u.profileImage ? getMediaUrl(u.avatar || u.profileImage) : '');

        const s = u.socialLinks || {};
        setSocialLinks({
          instagram: s.instagram || '',
          youtube: s.youtube || '',
          facebook: s.facebook || '',
          twitch: s.twitch || '',
          twitter: s.twitter || s.x || '',
        });
      } else {
        toast.error(data.message || 'Failed to load profile.');
      }
    } catch (err) {
      console.error('FETCH VIEWER PROFILE ERROR:', err);
      toast.error('Network error loading profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced Username Availability Check
  const handleUsernameChange = (val) => {
    const clean = val.replace(/^@+/, '').trim();
    setFormData(prev => ({ ...prev, username: clean }));

    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }

    if (!clean) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }

    if (userProfile?.username && clean.toLowerCase() === userProfile.username.toLowerCase()) {
      setUsernameStatus({ checking: false, available: true, message: 'Current username' });
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus({ checking: false, available: false, message: 'Must be at least 3 characters' });
      return;
    }

    setUsernameStatus({ checking: true, available: null, message: 'Checking availability...' });

    usernameCheckTimeout.current = setTimeout(async () => {
      try {
        const token = getViewerToken();
        const res = await fetch(`${API_ENDPOINTS.VIEWERS.CHECK_USERNAME}?username=${encodeURIComponent(clean)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setUsernameStatus({
          checking: false,
          available: !!data.available,
          message: data.message || (data.available ? `@${clean} is available` : 'Username unavailable'),
        });
      } catch (e) {
        setUsernameStatus({ checking: false, available: null, message: '' });
      }
    }, 450);
  };

  // Avatar File Upload Handling
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be 5MB or less.', 'File Too Large');
      return;
    }

    // Validate image mimetype
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.mimetype || file.type)) {
      toast.error('Only JPEG, PNG, WEBP, and GIF images are supported.', 'Invalid File Type');
      return;
    }

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    // Upload to server
    try {
      setIsUploadingAvatar(true);
      const token = getViewerToken();
      const uploadData = new FormData();
      uploadData.append('avatar', file);

      const res = await fetch(API_ENDPOINTS.VIEWERS.PROFILE_AVATAR, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await res.json();

      if (data.status === 'success' && data.data?.avatar) {
        toast.success('Profile picture updated successfully!');
        setFormData(prev => ({ ...prev, avatar: data.data.avatar }));
        setAvatarPreview(getMediaUrl(data.data.avatar));

        if (data.data.user) {
          syncUpdatedUser(data.data.user);
        }
      } else {
        toast.error(data.message || 'Avatar upload failed.');
        setAvatarPreview(formData.avatar ? getMediaUrl(formData.avatar) : '');
      }
    } catch (err) {
      console.error('AVATAR UPLOAD ERROR:', err);
      toast.error('Network error uploading profile picture.');
      setAvatarPreview(formData.avatar ? getMediaUrl(formData.avatar) : '');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Avatar Removal
  const handleRemoveAvatar = async () => {
    if (!formData.avatar && !avatarPreview) return;

    try {
      setIsUploadingAvatar(true);
      const token = getViewerToken();
      const res = await fetch(API_ENDPOINTS.VIEWERS.PROFILE_AVATAR, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast.success('Profile picture removed.');
        setFormData(prev => ({ ...prev, avatar: null }));
        setAvatarPreview('');
        if (data.data?.user) {
          syncUpdatedUser(data.data.user);
        }
      } else {
        toast.error(data.message || 'Failed to remove picture.');
      }
    } catch (err) {
      console.error('AVATAR REMOVAL ERROR:', err);
      toast.error('Network error removing profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Sync user state globally across sidebar and cookies without reload
  const syncUpdatedUser = (updatedUser) => {
    setUserProfile(updatedUser);
    const token = getViewerToken();
    if (token && updatedUser) {
      setViewerSession(token, updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('askme_viewer_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('viewer-profile-updated', { detail: updatedUser }));
      }
    }
  };

  // Save Main Profile (Name, Username, Bio, Country, Social Links)
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      toast.error('Full name must be at least 2 characters long.', 'Validation Error');
      return;
    }

    if (usernameStatus.available === false) {
      toast.error(usernameStatus.message || 'Please choose a valid and available username.', 'Username Error');
      return;
    }

    try {
      setIsSaving(true);
      const token = getViewerToken();

      const payload = {
        fullName: formData.fullName.trim(),
        username: formData.username ? formData.username.trim() : null,
        bio: formData.bio ? formData.bio.trim() : '',
        country: formData.country,
        avatar: formData.avatar || null,
        socialLinks: {
          instagram: socialLinks.instagram.trim(),
          youtube: socialLinks.youtube.trim(),
          facebook: socialLinks.facebook.trim(),
          twitch: socialLinks.twitch.trim(),
          twitter: socialLinks.twitter.trim(),
        },
      };

      const res = await fetch(API_ENDPOINTS.VIEWERS.PROFILE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === 'success' && data.data?.user) {
        toast.success('Your profile has been saved successfully!', 'Profile Updated');
        syncUpdatedUser(data.data.user);
      } else {
        toast.error(data.message || 'Failed to save profile changes.', 'Update Failed');
      }
    } catch (err) {
      console.error('SAVE PROFILE ERROR:', err);
      toast.error('An error occurred while saving your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Email Change Flow Handlers
  const handleSendEmailOtp = async () => {
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      toast.error('Please enter a valid email address.', 'Invalid Email');
      return;
    }
    if (clean === userProfile?.email?.toLowerCase()) {
      toast.error('This is already your current email address.', 'Email Unchanged');
      return;
    }

    try {
      setIsSendingEmailOtp(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.EMAIL_SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast.success(`Verification code sent to ${clean}. Please check your inbox.`);
        setEmailOtpSent(true);
        setEmailCooldown(60);
      } else {
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      toast.error('Network error sending verification code.');
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyAndUpdateEmail = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setIsVerifyingEmailOtp(true);
      const token = getViewerToken();

      // Submit PATCH /profile with new email and OTP
      const res = await fetch(API_ENDPOINTS.VIEWERS.PROFILE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          emailOtp: emailOtp.trim(),
        }),
      });

      const data = await res.json();

      if (data.status === 'success' && data.data?.user) {
        toast.success('Email address updated and verified successfully!', 'Email Changed');
        syncUpdatedUser(data.data.user);
        setShowEmailModal(false);
        setNewEmail('');
        setEmailOtp('');
        setEmailOtpSent(false);
      } else {
        toast.error(data.message || 'Verification failed.');
      }
    } catch (err) {
      toast.error('Network error verifying email.');
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  // Mobile Change Flow Handlers
  const handleSendMobileOtp = async () => {
    const clean = newMobile.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.', 'Invalid Number');
      return;
    }

    try {
      setIsSendingMobileOtp(true);
      const res = await fetch(API_ENDPOINTS.VIEWERS.WHATSAPP_SEND_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: clean }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast.success(`OTP sent to +91 ${clean.slice(-10)} via WhatsApp / SMS!`);
        setMobileOtpSent(true);
        setMobileCooldown(60);
      } else {
        toast.error(data.message || 'Failed to send mobile OTP.');
      }
    } catch (err) {
      toast.error('Network error sending OTP.');
    } finally {
      setIsSendingMobileOtp(false);
    }
  };

  const handleVerifyAndUpdateMobile = async () => {
    if (!mobileOtp || mobileOtp.length < 6) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setIsVerifyingMobileOtp(true);
      const token = getViewerToken();

      const res = await fetch(API_ENDPOINTS.VIEWERS.PROFILE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: newMobile.replace(/[^0-9]/g, ''),
          mobileOtp: mobileOtp.trim(),
        }),
      });

      const data = await res.json();

      if (data.status === 'success' && data.data?.user) {
        toast.success('Mobile number updated and verified successfully!', 'Mobile Changed');
        syncUpdatedUser(data.data.user);
        setShowMobileModal(false);
        setNewMobile('');
        setMobileOtp('');
        setMobileOtpSent(false);
      } else {
        toast.error(data.message || 'Verification failed.');
      }
    } catch (err) {
      toast.error('Network error verifying mobile number.');
    } finally {
      setIsVerifyingMobileOtp(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e?.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      toast.error('Please enter your current password.', 'Password Error');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.', 'Password Error');
      return;
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      toast.error('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.', 'Password Error');
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('New password cannot be the same as your current password.', 'Password Error');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.', 'Password Error');
      return;
    }

    try {
      setIsChangingPassword(true);
      const token = getViewerToken();
      const res = await fetch(API_ENDPOINTS.VIEWERS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        toast.success(data.message || 'Password changed successfully!', 'Success');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordFields({ current: false, new: false, confirm: false });
      } else {
        toast.error(data.message || 'Failed to change password.', 'Error');
      }
    } catch (err) {
      toast.error('Network error changing password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] ${theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-[#0A0A0F]'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-3 border-[#EB1000] border-t-transparent rounded-full animate-spin" />
          <p className={`text-xs font-bold tracking-wide uppercase ${theme === 'light' ? 'text-[#64748B]' : 'text-[#8B8B96]'}`}>
            Loading Viewer Profile...
          </p>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-200 ${
      isDark ? 'bg-[#0A0A0F] text-[#F5F5F7]' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* TOP HEADER BAR */}
      <div className={`sticky top-0 z-20 px-4 md:px-8 py-4 border-b backdrop-blur-md flex items-center justify-between gap-4 ${
        isDark ? 'bg-[#0D0D14]/90 border-[#1F1F30]' : 'bg-white/90 border-[#E2E8F0]'
      }`}>
        <div className="flex items-center gap-3">
          <Link
            href="/viewers/dashboard"
            className={`p-2 rounded-xl border transition-colors ${
              isDark ? 'border-[#1F1F30] hover:bg-[#1A1A26] text-[#94A3B8] hover:text-white' : 'border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B]'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className={`font-heading font-black text-lg md:text-xl leading-none flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}>
              My Profile
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/30 tracking-wider uppercase">
                Viewer Hub
              </span>
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#8B8B96]' : 'text-[#64748B]'}`}>
              Manage your personal identity,contact details, and social links.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#EB1000] hover:bg-[#D00E00] text-white shadow-lg shadow-[#EB1000]/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: IDENTITY & PREVIEW CARD (4 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            {/* PROFILE CARD */}
            <div className={`p-4 rounded-3xl border text-center relative overflow-hidden transition-all duration-200 ${
              isDark ? 'bg-[#0D0D14] border-[#1F1F30]' : 'bg-white border-[#E2E8F0] shadow-sm'
            }`}>
              {/* Background gradient flare */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#EB1000]/15 to-transparent pointer-events-none" />

              {/* AVATAR DISPLAY & PHOTO ACTIONS */}
              <div className="relative mx-auto w-20 h-20 mb-3">
                <div className={`w-full h-full rounded-2xl border-2 overflow-hidden flex items-center justify-center font-black text-3xl shadow-xl transition-all ${
                  isDark ? 'bg-[#141420] border-[#EB1000]/40 text-[#EB1000]' : 'bg-[#FEF2F2] border-[#EB1000]/30 text-[#EB1000]'
                }`}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={formData.fullName || 'Viewer Avatar'}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarPreview('')}
                    />
                  ) : (
                    <span>{(formData.fullName || '').charAt(0).toUpperCase()}</span>
                  )}

                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-1">
                      <Loader2 className="h-6 w-6 animate-spin text-[#EB1000]" />
                      <span className="text-[10px] font-bold">Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Upload Trigger Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#EB1000] text-white shadow-lg hover:bg-[#D00E00] hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Avatar action pills */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
                    isDark ? 'border-[#1F1F30] hover:bg-[#1A1A26] text-white' : 'border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5 text-[#EB1000]" />
                  <span>Change Photo</span>
                </button>

                {(formData.avatar || avatarPreview) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
                      isDark ? 'border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10' : 'border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2]'
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* NAME & USERNAME */}
              <h2 className={`font-heading font-black text-lg truncate ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {formData.fullName || 'Viewer Name'}
              </h2>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-xs font-extrabold text-[#EB1000]">
                  {formData.username ? `@${formData.username}` : ''}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-[#1C1C28] text-[#8B8B96] uppercase">
                  Viewer
                </span>
              </div>

            </div>

            {/* QUICK SECURITY STATUS CARD */}
            <div className={`p-5 rounded-3xl border space-y-3.5 ${
              isDark ? 'bg-[#0D0D14] border-[#1F1F30]' : 'bg-white border-[#E2E8F0]'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#EB1000]" />
                <h3 className="font-heading font-black text-xs uppercase tracking-wider">
                  Account Verification
                </h3>
              </div>

              {/* Email Status */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-[#141420] border-[#1F1F30]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="h-4 w-4 text-[#8B8B96] shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      {userProfile?.email || 'No email attached'}
                    </p>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Verified Email
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewEmail('');
                    setEmailOtp('');
                    setEmailOtpSent(false);
                    setShowEmailModal(true);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer shrink-0 ${
                    isDark ? 'border-[#1F1F30] hover:bg-[#1F1F30] text-white' : 'border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  Change
                </button>
              </div>

              {/* Mobile Status */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-[#141420] border-[#1F1F30]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Phone className="h-4 w-4 text-[#8B8B96] shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      {userProfile?.phone ? `+91 ${userProfile.phone.slice(-10)}` : 'No mobile registered'}
                    </p>
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${
                      userProfile?.phone ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {userProfile?.phone ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" /> Not Verified
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewMobile('');
                    setMobileOtp('');
                    setMobileOtpSent(false);
                    setShowMobileModal(true);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer shrink-0 ${
                    isDark ? 'border-[#1F1F30] hover:bg-[#1F1F30] text-white' : 'border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  {userProfile?.phone ? 'Change' : 'Add'}
                </button>
              </div>

              {/* Password Status */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-[#141420] border-[#1F1F30]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Key className="h-4 w-4 text-[#8B8B96] shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      Password
                    </p>
                    <span className="text-[10px] text-[#8B8B96] font-semibold tracking-widest">
                      ••••••••••••
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowPasswordFields({ current: false, new: false, confirm: false });
                    setShowPasswordModal(true);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer shrink-0 ${
                    isDark ? 'border-[#1F1F30] hover:bg-[#1F1F30] text-white' : 'border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EDIT PROFILE FORM (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* SECTION 1: PERSONAL DETAILS */}
              <div className={`p-6 rounded-3xl border space-y-5 ${
                isDark ? 'bg-[#0D0D14] border-[#1F1F30]' : 'bg-white border-[#E2E8F0] shadow-sm'
              }`}>
                <div className="flex items-center gap-2 pb-3 border-b border-[#1F1F30]">
                  <User className="h-4 w-4 text-[#EB1000]" />
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider">
                    Basic Identity Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-[#8B8B96]">
                      Full Name <span className="text-[#EB1000]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="e.g. John Doe"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition outline-none focus:border-[#EB1000] ${
                        isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-[#8B8B96]">
                        Unique Username
                      </label>
                      {usernameStatus.checking && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" /> Checking...
                        </span>
                      )}
                      {!usernameStatus.checking && usernameStatus.available === true && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                          <Check className="h-3 w-3" /> Available
                        </span>
                      )}
                      {!usernameStatus.checking && usernameStatus.available === false && (
                        <span className="text-[10px] text-[#EB1000] flex items-center gap-1 font-bold">
                          <AlertCircle className="h-3 w-3" /> Taken
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B8B96]">
                        <AtSign className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="your_handle"
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition outline-none ${
                          usernameStatus.available === false
                            ? 'border-[#EB1000] bg-[#EB1000]/5 text-[#EB1000]'
                            : usernameStatus.available === true
                              ? 'border-emerald-500/50 focus:border-emerald-500'
                              : isDark
                                ? 'bg-[#141420] border-[#1F1F30] text-white focus:border-[#EB1000]'
                                : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] focus:border-[#EB1000]'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-[#8B8B96]">
                      3-30 letters, numbers, underscores or periods.
                    </p>
                  </div>
                </div>

                {/* Email & Phone Number (Disabled / Read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-[#8B8B96]">
                        Email Address
                      </label>
                      <span className="text-[10px] font-bold text-[#8B8B96] flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" /> Disabled
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B8B96]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        disabled
                        readOnly
                        value={userProfile?.email || ''}
                        placeholder="Registered Email"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold opacity-75 cursor-not-allowed select-none ${
                          isDark
                            ? 'bg-[#141420]/70 border-[#1F1F30] text-[#94A3B8]'
                            : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Phone / Mobile */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-[#8B8B96]">
                        Phone Number
                      </label>
                      <span className="text-[10px] font-bold text-[#8B8B96] flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" /> Disabled
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B8B96]">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={
                          userProfile?.phone || userProfile?.mobile
                            ? (String(userProfile.phone || userProfile.mobile).startsWith('+91')
                                ? String(userProfile.phone || userProfile.mobile)
                                : `+91 ${String(userProfile.phone || userProfile.mobile).slice(-10)}`)
                            : 'Not Registered'
                        }
                        placeholder="Registered Mobile"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold opacity-75 cursor-not-allowed select-none ${
                          isDark
                            ? 'bg-[#141420]/70 border-[#1F1F30] text-[#94A3B8]'
                            : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-[#8B8B96]">
                      Viewer Bio
                    </label>
                    <span className="text-[8px] text-[#8B8B96]">
                      {formData.bio.length}/500 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={500}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell the community about yourself, favorite streams, games, or topics..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-normal leading-relaxed transition outline-none resize-none focus:border-[#EB1000] ${
                      isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                    }`}
                  />
                </div>
              </div>

              {/* SECTION 2: SOCIAL MEDIA PROFILES */}
              <div className={`p-6 rounded-3xl border space-y-5 ${
                isDark ? 'bg-[#0D0D14] border-[#1F1F30]' : 'bg-white border-[#E2E8F0] shadow-sm'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-[#1F1F30]">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#EB1000]" />
                    <h3 className="font-heading font-black text-sm uppercase tracking-wider">
                      Social Media Profiles
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#8B8B96] uppercase">
                    5 Supported Networks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                      <InstagramIcon className="h-3.5 w-3.5 text-[#E1306C]" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="https://instagram.com/username or @handle"
                      className={`w-full px-3.5 py-2.2 rounded-xl border text-xs font-semibold outline-none focus:border-[#E1306C] ${
                        isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                      <YoutubeIcon className="h-3.5 w-3.5 text-[#FF0000]" />
                      <span>YouTube</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.youtube}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: e.target.value }))}
                      placeholder="https://youtube.com/@channel or @handle"
                      className={`w-full px-3.5 py-2.2 rounded-xl border text-xs font-semibold outline-none focus:border-[#FF0000] ${
                        isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>

                  {/* Twitch */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                      <TwitchIcon className="h-3.5 w-3.5 text-[#9146FF]" />
                      <span>Twitch</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.twitch}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, twitch: e.target.value }))}
                      placeholder="https://twitch.tv/username"
                      className={`w-full px-3.5 py-2.2 rounded-xl border text-xs font-semibold outline-none focus:border-[#9146FF] ${
                        isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>

                  {/* X / Twitter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                      <TwitterXIcon className="h-3.5 w-3.5 text-sky-400" />
                      <span>X / Twitter</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://x.com/username or @handle"
                      className={`w-full px-3.5 py-2.2 rounded-xl border text-xs font-semibold outline-none focus:border-sky-400 ${
                        isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>

                  {/* Facebook */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#8B8B96] flex items-center gap-1.5">
                      <FacebookIcon className="h-3.5 w-3.5 text-[#1877F2]" />
                      <span>Facebook Profile or Page</span>
                    </label>
                    <input
                      type="text"
                      value={socialLinks.facebook}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="https://facebook.com/username"
                      className={`w-full px-3.5 py-2.2 rounded-xl border text-xs font-semibold outline-none focus:border-[#1877F2] ${
                        isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* SAVE ACTION BAR */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={fetchProfile}
                  disabled={isSaving}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    isDark ? 'border-[#1F1F30] hover:bg-[#1A1A26] text-[#94A3B8]' : 'border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#475569]'
                  }`}
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#EB1000] hover:bg-[#D00E00] text-white shadow-lg shadow-[#EB1000]/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL 1: CHANGE EMAIL (SECURE OTP VERIFICATION) */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#0D0D14] border-[#1F1F30] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
          }`}>
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#8B8B96] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/25">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base">Change Email Address</h3>
                <p className="text-xs text-[#8B8B96]">Secure verification required to update email.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Email Display */}
              <div className={`p-3 rounded-xl border text-xs ${
                isDark ? 'bg-[#141420] border-[#1F1F30] text-[#8B8B96]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
              }`}>
                Current Email: <span className="font-bold text-white">{userProfile?.email}</span>
              </div>

              {/* New Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-[#8B8B96]">New Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    disabled={emailOtpSent}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new.email@domain.com"
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#EB1000] ${
                      isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={isSendingEmailOtp || emailCooldown > 0}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#EB1000] hover:bg-[#D00E00] text-white transition disabled:opacity-50 shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSendingEmailOtp ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {emailCooldown > 0 ? `${emailCooldown}s` : emailOtpSent ? 'Resend' : 'Send Code'}
                    </span>
                  </button>
                </div>
              </div>

              {/* OTP Input if sent */}
              {emailOtpSent && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs font-bold uppercase text-[#8B8B96]">
                    Enter 6-Digit Email Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className={`w-full text-center tracking-[0.5em] font-mono font-black text-lg px-4 py-2.5 rounded-xl border outline-none focus:border-[#EB1000] ${
                      isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                    }`}
                  />
                  <p className="text-[11px] text-emerald-400 font-semibold text-center mt-1">
                    Code sent to {newEmail}. Valid for 10 minutes.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'border-[#1F1F30] hover:bg-[#1A1A26] text-[#8B8B96]' : 'border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  Cancel
                </button>
                {emailOtpSent && (
                  <button
                    type="button"
                    onClick={handleVerifyAndUpdateEmail}
                    disabled={isVerifyingEmailOtp || !emailOtp}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#EB1000] hover:bg-[#D00E00] text-white shadow-md disabled:opacity-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isVerifyingEmailOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Verify & Update</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE MOBILE (SECURE OTP VERIFICATION) */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#0D0D14] border-[#1F1F30] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
          }`}>
            <button
              onClick={() => setShowMobileModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#8B8B96] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/25">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base">
                  {userProfile?.phone ? 'Change Mobile Number' : 'Add Mobile Number'}
                </h3>
                <p className="text-xs text-[#8B8B96]">Instant OTP verification via WhatsApp or SMS.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Mobile Display */}
              {userProfile?.phone && (
                <div className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-[#141420] border-[#1F1F30] text-[#8B8B96]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                }`}>
                  Current Number: <span className="font-bold text-white">+91 {userProfile.phone.slice(-10)}</span>
                </div>
              )}

              {/* New Mobile Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-[#8B8B96]">New 10-Digit Mobile Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#8B8B96]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={newMobile}
                      disabled={mobileOtpSent}
                      onChange={(e) => setNewMobile(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9876543210"
                      className={`w-full pl-11 pr-3 py-2.5 rounded-xl border text-xs font-semibold outline-none focus:border-[#EB1000] ${
                        isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendMobileOtp}
                    disabled={isSendingMobileOtp || mobileCooldown > 0}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#EB1000] hover:bg-[#D00E00] text-white transition disabled:opacity-50 shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSendingMobileOtp ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {mobileCooldown > 0 ? `${mobileCooldown}s` : mobileOtpSent ? 'Resend' : 'Send OTP'}
                    </span>
                  </button>
                </div>
              </div>

              {/* OTP Input if sent */}
              {mobileOtpSent && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs font-bold uppercase text-[#8B8B96]">
                    Enter 6-Digit WhatsApp/SMS OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className={`w-full text-center tracking-[0.5em] font-mono font-black text-lg px-4 py-2.5 rounded-xl border outline-none focus:border-[#EB1000] ${
                      isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                    }`}
                  />
                  <p className="text-[11px] text-emerald-400 font-semibold text-center mt-1">
                    OTP sent via WhatsApp & SMS. Valid for 10 minutes.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMobileModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'border-[#1F1F30] hover:bg-[#1A1A26] text-[#8B8B96]' : 'border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  Cancel
                </button>
                {mobileOtpSent && (
                  <button
                    type="button"
                    onClick={handleVerifyAndUpdateMobile}
                    disabled={isVerifyingMobileOtp || !mobileOtp}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#EB1000] hover:bg-[#D00E00] text-white shadow-md disabled:opacity-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isVerifyingMobileOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Verify & Save</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CHANGE PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#0D0D14] border-[#1F1F30] text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
          }`}>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#8B8B96] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#EB1000]/15 text-[#EB1000] border border-[#EB1000]/25">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base">Change Password</h3>
                <p className="text-xs text-[#8B8B96]">Update your account password securely.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-[#8B8B96]">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswordFields.current ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-semibold outline-none focus:border-[#EB1000] ${
                      isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(s => ({ ...s, current: !s.current }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8B8B96] hover:text-white cursor-pointer"
                  >
                    {showPasswordFields.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-[#8B8B96]">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswordFields.new ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min 8 chars with uppercase, lowercase, number, special"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-semibold outline-none focus:border-[#EB1000] ${
                      isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(s => ({ ...s, new: !s.new }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8B8B96] hover:text-white cursor-pointer"
                  >
                    {showPasswordFields.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-[#8B8B96]">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswordFields.confirm ? 'text' : 'password'}
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs font-semibold outline-none focus:border-[#EB1000] ${
                      isDark ? 'bg-[#141420] border-[#1F1F30] text-white' : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8B8B96] hover:text-white cursor-pointer"
                  >
                    {showPasswordFields.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Requirements helper */}
              <div className={`p-2.5 rounded-xl border text-[10px] space-y-1 ${
                isDark ? 'bg-[#141420] border-[#1F1F30]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}>
                <p className="font-bold text-[#8B8B96]">Password criteria:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  <span className={passwordForm.newPassword.length >= 8 ? 'text-emerald-400 font-bold' : 'text-[#8B8B96]'}>
                    ✓ At least 8 characters
                  </span>
                  <span className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-emerald-400 font-bold' : 'text-[#8B8B96]'}>
                    ✓ 1 Uppercase (A-Z)
                  </span>
                  <span className={/[a-z]/.test(passwordForm.newPassword) ? 'text-emerald-400 font-bold' : 'text-[#8B8B96]'}>
                    ✓ 1 Lowercase (a-z)
                  </span>
                  <span className={/[0-9]/.test(passwordForm.newPassword) ? 'text-emerald-400 font-bold' : 'text-[#8B8B96]'}>
                    ✓ 1 Number (0-9)
                  </span>
                  <span className={/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword) ? 'text-emerald-400 font-bold' : 'text-[#8B8B96]'}>
                    ✓ 1 Special character
                  </span>
                  <span className={passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword ? 'text-emerald-400 font-bold' : 'text-[#8B8B96]'}>
                    ✓ Passwords match
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? 'border-[#1F1F30] hover:bg-[#1A1A26] text-[#8B8B96]' : 'border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#EB1000] hover:bg-[#D00E00] text-white shadow-md disabled:opacity-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isChangingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
