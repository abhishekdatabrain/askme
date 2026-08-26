import React, { useState } from 'react';
import PlatformIcon from './PlatformIcon';
import LiveBadge from './LiveBadge';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { setCreatorSession } from '@/utils/cookies';

import {
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  Camera,
  AtSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  X
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function CreatorRegisterForm({ onClose, onComplete }) {
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'kyc_pending'
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    username: '',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    country: 'India (IN)',
    category: '',
    socialLinks: [
      { platform: 'youtube', link: '' },
      { platform: 'instagram', link: '' },
    ],
  });

  const [registeredCreator, setRegisteredCreator] = useState(null);

  const countries = [
    'India (IN)',
    'United States (US)',
    'United Kingdom (UK)',
    'Canada (CA)',
    'Australia (AU)',
    'United Arab Emirates (AE)',
    'Singapore (SG)',
    'Germany (DE)',
  ];

  const socialPlatforms = [
    { value: 'youtube', label: 'YouTube Channel', icon: '▶' },
    { value: 'instagram', label: 'Instagram Handle', icon: '📸' },
    { value: 'twitch', label: 'Twitch Channel', icon: '👾' },
    { value: 'facebook', label: 'Facebook Page', icon: 'f' },
    { value: 'kick', label: 'Kick Channel', icon: '⚡' },
    { value: 'x', label: 'X / Twitter Handle', icon: '𝕏' },
    { value: 'linkedin', label: 'LinkedIn Profile', icon: '💼' },
    { value: 'tiktok', label: 'TikTok Handle', icon: '🎵' },
  ];

  const handleInputChange = (field, value) => {
    if (field === 'mobileNumber') {
      const digitsOnly = String(value || '').replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [field]: digitsOnly }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { platform: 'youtube', link: '' }]
    }));
  };

  const handleUpdateSocialLink = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.socialLinks || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socialLinks: updated };
    });
  };

  const handleRemoveSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('profileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getUsernameSuggestions = () => {
    const rawUser = String(formData.username || formData.firstname || 'creator').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const fname = String(formData.firstname || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const lname = String(formData.lastname || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const base = rawUser || 'creator';

    const list = [
      `${base}123`,
      `${base}_official`,
      `${base}_live`,
      fname && lname ? `${fname}_${lname}` : `${base}_pro`,
      `${base}99`
    ];
    return Array.from(new Set(list)).slice(0, 4);
  };

  const validatePasswordComplexity = (pass) => {
    if (!pass || pass.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
    if (!hasLetter || !hasSpecial) {
      return 'Password must contain letters (A–Z/a–z) and at least one special character (e.g. @, #, $, !).';
    }
    return null;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.mobileNumber || !formData.username || !formData.password) {
      toast.error('Please fill in all required personal details before proceeding.', 'Incomplete Form');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(formData.email || '').trim())) {
      toast.error('Accept only a valid email address format (e.g. name@domain.com).', 'Invalid Email Format');
      return;
    }

    const passError = validatePasswordComplexity(formData.password);
    if (passError) {
      toast.error(passError, 'Password Requirements');
      return;
    }

    const cleanMobile = String(formData.mobileNumber || '').replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.', 'Invalid Mobile Number');
      return;
    }

    setStep(2);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(formData.email || '').trim())) {
      toast.error('Accept only a valid email address format (e.g. name@domain.com).', 'Invalid Email Format');
      return;
    }

    const passError = validatePasswordComplexity(formData.password);
    if (passError) {
      toast.error(passError, 'Password Requirements');
      return;
    }

    const cleanMobile = String(formData.mobileNumber || '').replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits.', 'Invalid Mobile Number');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.CREATORS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.status === 'success') {
        const creatorData = data.data?.creator || {
          ...formData,
          status: 'Pending KYC Verification',
          registeredAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        };

        if (data.data?.token) {
          setCreatorSession(data.data.token, creatorData);
        }

        setRegisteredCreator(creatorData);
        setAuthMode('kyc_pending');
        toast.success('Creator registration completed & saved to database!', 'Registration Successful');
        if (onComplete) onComplete(creatorData);
      } else {
        const msg = data.message || data.error || 'Registration failed. Please check form details.';
        setErrorMsg(msg);
        toast.error(msg, 'Registration Failed');
      }
    } catch (err) {
      const msg = 'Unable to connect to backend server at http://localhost:5000/api.';
      setErrorMsg(msg);
      toast.error(msg, 'Network Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center items-start sm:items-center min-h-full py-8 sm:py-12 my-auto">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto my-auto rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 lg:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">

        {/* Close Button */}
        {/* <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1C1C26] text-[#8B8B96] hover:text-white transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button> */}

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-lg shadow-md glow-teal">
              a
            </div>
            <span className="font-heading font-black text-2xl text-white">AskMe <span className="text-brand-gradient">PRO</span></span>
          </div>
          <h2 className="font-heading font-bold text-lg text-white mt-1">Creator Registration</h2>
          <p className="text-xs text-[#8B8B96] max-w-md mx-auto">
            Surface live broadcast streams across YouTube, Twitch, Instagram, Kick & X. Keep <strong className="text-[#00E676]">85% net revenue share</strong> on guaranteed paid questions.
          </p>
        </div>

        {/* CREATOR REGISTRATION FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-6">

            {/* Step Progress Indicator Bar */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-left focus:outline-none"
              >
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#00F5D4] text-[#0A0A0F]' : 'bg-[#1C1C26] text-[#8B8B96]'}`}>
                  1
                </span>
                <span className={`text-xs font-bold ${step === 1 ? 'text-white' : 'text-[#8B8B96]'}`}>
                  Personal Details
                </span>
              </button>

              <span className="h-0.5 w-12 bg-[#1C1C26]"></span>

              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 text-left focus:outline-none"
              >
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#00F5D4] text-[#0A0A0F]' : 'bg-[#1C1C26] text-[#8B8B96]'}`}>
                  2
                </span>
                <span className={`text-xs font-bold ${step === 2 ? 'text-white' : 'text-[#8B8B96]'}`}>
                  Social Media Links
                </span>
              </button>
            </div>

            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8B8B96] mb-1">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                      <input
                        type="text"
                        required
                        value={formData.firstname || ''}
                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                        placeholder="e.g. Technical"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                      <input
                        type="text"
                        required
                        value={formData.lastname || ''}
                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                        placeholder="e.g. Burner"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="creator@techburner.in"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Mobile Number * (10 Digits)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        required
                        value={formData.mobileNumber || ''}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        placeholder="9876543210"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Username *</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-[#00F5D4]" />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="techburner"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none font-mono"
                      />
                    </div>

                    {/* Username Suggestions Recommendation Pills */}
                    {formData.username && (
                      <div className="mt-1.5 space-y-1">
                        <span className="text-[10px] font-semibold text-[#8B8B96] block">
                          Username Suggestions:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {getUsernameSuggestions().map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleInputChange('username', sug)}
                              className="px-2 py-0.5 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-[10px] font-mono hover:bg-[#00F5D4]/20 transition"
                            >
                              @{sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-9 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#8B8B96] hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-[#8B8B96] block mt-1 leading-tight">
                      Must contain letters (A–Z/a–z) and at least 1 special character (@, #, $, !, etc.)
                    </span>
                  </div>

                  {/* Country Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Country *</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-[#8B8B96]" />
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] pl-9 pr-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                      >
                        {countries.map(c => (
                          <option key={c} value={c} className="bg-[#0A0A0F] text-white">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Avatar & Profile Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-[#8B8B96] mb-1.5">Profile Image</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.profileImage}
                      alt="Avatar Preview"
                      className="h-12 w-12 rounded-full object-cover border-2 border-[#00F5D4] shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={formData.profileImage}
                        onChange={(e) => handleInputChange('profileImage', e.target.value)}
                        placeholder="Image URL or upload file below..."
                        className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-1.5 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1C1C26] text-[#00F5D4] text-[11px] font-semibold cursor-pointer hover:bg-[#00F5D4]/10 transition-colors border border-[#00F5D4]/30">
                        <Camera className="h-3.5 w-3.5" />
                        <span>Choose Local File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Next: Social Links</span> <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Social Media Links */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
                      Social Media Links (Select Platform from Dropdown)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSocialLink}
                      className="text-[11px] font-bold text-[#00F5D4] hover:underline flex items-center gap-1"
                    >
                      + Add Platform Link
                    </button>
                  </div>

                  {formData.socialLinks.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {/* Dropdown Selector */}
                      <select
                        value={item.platform}
                        onChange={(e) => handleUpdateSocialLink(idx, 'platform', e.target.value)}
                        className="w-44 rounded-xl bg-[#13131A] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none font-semibold shrink-0"
                      >
                        {socialPlatforms.map(p => (
                          <option key={p.value} value={p.value} className="bg-[#0A0A0F] text-white">
                            {p.icon} {p.label}
                          </option>
                        ))}
                      </select>

                      {/* URL / Handle Input */}
                      <input
                        type="text"
                        value={item.link}
                        onChange={(e) => handleUpdateSocialLink(idx, 'link', e.target.value)}
                        placeholder={`Enter ${item.platform} URL or @handle...`}
                        className="flex-1 rounded-xl bg-[#13131A] border border-[#1C1C26] px-3 py-2 text-xs text-white placeholder-[#8B8B96] focus:border-[#00F5D4] focus:outline-none font-mono"
                      />

                      {formData.socialLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(idx)}
                          className="p-2 rounded-xl bg-[#1C1C26] text-[#8B8B96] hover:text-[#FF5252] hover:bg-[#FF5252]/10 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-[#1C1C26] text-[#8B8B96] hover:text-white font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" /> {isSubmitting ? 'Registering Creator Account...' : 'Complete Creator Registration'}
                  </button>
                </div>
              </div>
            )}

            <div className="text-center pt-3 border-t border-[#1C1C26]">
              <span className="text-xs text-[#8B8B96]">Already have a Creator account? </span>
              <Link href="/creators/login" className="text-xs font-bold text-[#00F5D4] hover:underline">
                Sign In to Creator Studio
              </Link>
            </div>
          </form>
        )}

        {/* ACCOUNT STATUS - PENDING KYC VERIFICATION */}
        {authMode === 'kyc_pending' && registeredCreator && (
          <div className="space-y-6 text-center animate-in zoom-in duration-300">
            {/* Status Card */}
            <div className="p-6 rounded-3xl bg-[#0A0A0F] border border-[#FFD60A]/40 space-y-4 glow-pay">
              <div className="h-16 w-16 rounded-full bg-[#FFD60A]/10 border-2 border-[#FFD60A] text-[#FFD60A] flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 animate-spin" style={{ animationDuration: '8s' }} />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold tracking-widest text-[#FFD60A] uppercase bg-[#FFD60A]/10 px-3 py-1 rounded-full border border-[#FFD60A]/30">
                  ACCOUNT STATUS
                </span>
                <h3 className="font-heading font-black text-xl text-white mt-2">
                  Pending KYC Verification
                </h3>
                <p className="text-xs text-[#8B8B96] max-w-md mx-auto leading-relaxed">
                  Welcome to AskMe PRO, <strong className="text-white">{registeredCreator.fullName}</strong>! Your registration is complete. Your account is currently queued for platform owner KYC document verification.
                </p>
              </div>

              {/* Submitted Details Summary */}
              <div className="grid grid-cols-2 gap-2 text-left text-xs bg-[#13131A] p-4 rounded-2xl border border-[#1C1C26]">
                <div>
                  <span className="text-[#8B8B96] block text-[10px]">Handle</span>
                  <span className="font-mono text-[#00F5D4] font-bold">@{String(registeredCreator.username || 'creator').replace(/^@+/, '')}</span>
                </div>
                <div>
                  <span className="text-[#8B8B96] block text-[10px]">Country</span>
                  <span className="text-white font-bold">{registeredCreator.country || 'India'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#1C1C26]">
                  <span className="text-[#8B8B96] block text-[10px]">Revenue Share Tier</span>
                  <span className="text-[#00E676] font-bold">Keep 85% Net Share (AskMe 15% Fee)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#13131A] border border-[#1C1C26] text-xs text-[#8B8B96] space-y-2">
              <span className="font-bold text-white block flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#00F5D4]" /> Next Steps for Payout Activation:
              </span>
              <p>
                Platform owner will verify your PAN / Aadhaar / Bank details in the admin KYC approval queue. Once verified, instant 85% payouts and live stream OBS overlays will activate automatically!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/creators/kyc';
                }}
                className="w-full py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] text-xs font-bold shadow-md glow-teal hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Complete KYC Verification Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
