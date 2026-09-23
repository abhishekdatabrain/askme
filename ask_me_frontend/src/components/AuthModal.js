'use client';

import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import {
  X,
  User,
  Sparkles,
  DollarSign,
  Tv,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Phone,
  Eye,
  EyeOff,
  Check,
  MessageSquare,
  RefreshCw,
  Globe,
  Camera,
  AtSign,
  Plus,
  Trash2
} from 'lucide-react';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { uploadFile } from '@/utils/fileUpload';
import { setViewerSession, setCreatorSession } from '@/utils/cookies';
import TruecallerAuthButton from './TruecallerAuthButton';
import GoogleAuthProvider from './GoogleAuthProvider';
import { useGoogleLogin } from '@react-oauth/google';
import { useToast } from '@/context/ToastContext';

function InnerAuthModal({ isOpen, onClose, initialRole = 'viewer', initialMode = 'login', onSuccess }) {
  const { toast } = useToast();
  const [role, setRole] = useState(initialRole); // 'viewer' | 'creator'
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  // Common Form fields
  const [name, setName] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('India (IN)');
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
  const [creatorStep, setCreatorStep] = useState(1); // 1: Personal Details, 2: Social Links
  const [socialLinks, setSocialLinks] = useState([
    { platform: 'youtube', link: '' },
    { platform: 'instagram', link: '' }
  ]);

  // Password criteria state for Viewer registration
  const [passCriteria, setPassCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  // State indicators
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // WhatsApp OTP Sub-Modal State
  const [showWaModal, setShowWaModal] = useState(false);
  const [waStep, setWaStep] = useState('phone'); // 'phone' | 'otp'
  const [waPhone, setWaPhone] = useState('');
  const [waOtp, setWaOtp] = useState('');
  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState('');
  const [waSuccess, setWaSuccess] = useState('');
  const [waDebugOtp, setWaDebugOtp] = useState('');

  // Registration WhatsApp OTP Verification State
  const [regWaStep, setRegWaStep] = useState('idle'); // 'idle' | 'otp_sent' | 'verified'
  const [regWaOtp, setRegWaOtp] = useState('');
  const [regWaLoading, setRegWaLoading] = useState(false);
  const [regWaError, setRegWaError] = useState('');
  const [regWaSuccess, setRegWaSuccess] = useState('');
  const [regWaDebugOtp, setRegWaDebugOtp] = useState('');

  // Hybrid Login Flow State (Email or Phone Number + WhatsApp OTP)
  const [loginInput, setLoginInput] = useState('');
  const [loginOtpStep, setLoginOtpStep] = useState('idle'); // 'idle' | 'otp_sent'
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpLoading, setLoginOtpLoading] = useState(false);

  const getLoginInputType = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) return 'empty';
    if (/[a-zA-Z@]/.test(trimmed)) return 'email';
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length > 0) return 'phone';
    return 'email';
  };
  const loginInputType = getLoginInputType(loginInput);

  const handleSendLoginWaOtp = async (e) => {
    if (e) e.preventDefault();
    const targetInput = loginInput || mobile;
    const cleanPhone = (targetInput || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      const errText = 'Please enter a valid 10-digit mobile number.';
      setErrorMsg(errText);
      toast?.error(errText, 'Mobile Required');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoginOtpLoading(true);

    try {
      const endpoint = role === 'viewer'
        ? API_ENDPOINTS.VIEWERS.WHATSAPP_SEND_OTP
        : API_ENDPOINTS.CREATORS.WHATSAPP_SEND_OTP;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, mobile: cleanPhone }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const msg = data.message || `WhatsApp OTP sent to +91 ${cleanPhone}`;
        setSuccessMsg(msg);
        toast?.success(msg, 'WhatsApp OTP Sent');
        setLoginOtpStep('otp_sent');
      } else {
        const errText = data.message || 'Failed to send WhatsApp OTP.';
        setErrorMsg(errText);
        toast?.error(errText, 'OTP Error');
      }
    } catch (err) {
      const errText = 'Server error while sending WhatsApp OTP.';
      setErrorMsg(errText);
      toast?.error(errText, 'OTP Error');
    } finally {
      setLoginOtpLoading(false);
    }
  };

  const handleVerifyLoginWaOtp = async (e) => {
    if (e) e.preventDefault();
    const targetInput = loginInput || mobile;
    const cleanPhone = (targetInput || '').replace(/[^0-9]/g, '');
    if (!loginOtp || loginOtp.length < 4) {
      const errText = 'Please enter the 6-digit OTP code sent to your WhatsApp.';
      setErrorMsg(errText);
      toast?.error(errText, 'OTP Required');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoginOtpLoading(true);

    try {
      const endpoint = role === 'viewer'
        ? API_ENDPOINTS.VIEWERS.WHATSAPP_VERIFY_OTP
        : API_ENDPOINTS.CREATORS.WHATSAPP_VERIFY_OTP;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, mobile: cleanPhone, otp: loginOtp }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const msg = 'WhatsApp Mobile Verified! Logged in successfully.';
        setSuccessMsg(msg);
        toast?.success(msg, 'Login Successful');

        if (role === 'viewer') {
          if (data.data?.token && data.data?.user) {
            setViewerSession(data.data.token, data.data.user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('askme_viewer_token', data.data.token);
              localStorage.setItem('askme_viewer_user', JSON.stringify(data.data.user));
            }
          }
          setTimeout(() => {
            if (onSuccess) onSuccess(data.data);
            onClose();
            window.location.href = '/viewers/dashboard';
          }, 800);
        } else {
          const token = data.data?.token || data.token;
          const creator = data.data?.creator || data.user;
          if (token && creator) {
            setCreatorSession(token, creator);
          }
          setTimeout(() => {
            if (onSuccess) onSuccess(data);
            onClose();
            const status = (creator?.kycStatus || 'pending').toLowerCase();
            let targetUrl = '/creators/kyc';
            if (status === 'approved') {
              targetUrl = '/creators/dashboard';
            }
            window.location.href = targetUrl;
          }, 800);
        }
      } else {
        const errText = data.message || 'Invalid or expired WhatsApp OTP code.';
        setErrorMsg(errText);
        toast?.error(errText, 'Verification Failed');
      }
    } catch (err) {
      const errText = 'Server error during OTP verification.';
      setErrorMsg(errText);
      toast?.error(errText, 'Verification Error');
    } finally {
      setLoginOtpLoading(false);
    }
  };

  const handleSendRegWaOtp = async () => {
    const cleanMobile = (mobile || '').replace(/[^0-9]/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      const errText = 'Please enter a valid 10-digit mobile number first.';
      setRegWaError(errText);
      toast?.error(errText, 'Mobile Required');
      return;
    }
    setRegWaError('');
    setRegWaSuccess('');
    try {
      setRegWaLoading(true);
      const endpoint = role === 'viewer'
        ? API_ENDPOINTS.VIEWERS.WHATSAPP_SEND_OTP
        : API_ENDPOINTS.CREATORS.WHATSAPP_SEND_OTP;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanMobile }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const msg = data.message || `WhatsApp OTP sent to +91 ${cleanMobile}`;
        setRegWaSuccess(msg);
        toast?.success(msg, 'WhatsApp OTP Sent');
        if (data.data?.debugOtp) {
          setRegWaDebugOtp(String(data.data.debugOtp));
        }
        setRegWaStep('otp_sent');
      } else {
        const errText = data.message || 'Failed to send WhatsApp OTP.';
        setRegWaError(errText);
        toast?.error(errText, 'OTP Error');
      }
    } catch (err) {
      const errText = 'Server error while sending WhatsApp OTP.';
      setRegWaError(errText);
      toast?.error(errText, 'OTP Error');
    } finally {
      setRegWaLoading(false);
    }
  };

  const handleVerifyRegWaOtp = async () => {
    const cleanMobile = (mobile || '').replace(/[^0-9]/g, '');
    if (!regWaOtp || regWaOtp.length < 4) {
      const errText = 'Please enter the 6-digit OTP code sent to your WhatsApp.';
      setRegWaError(errText);
      toast?.error(errText, 'OTP Required');
      return;
    }
    setRegWaError('');
    setRegWaSuccess('');
    try {
      setRegWaLoading(true);
      const endpoint = role === 'viewer'
        ? API_ENDPOINTS.VIEWERS.WHATSAPP_VERIFY_OTP
        : API_ENDPOINTS.CREATORS.WHATSAPP_VERIFY_OTP;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanMobile, otp: regWaOtp }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const msg = 'Mobile number verified via WhatsApp!';
        setRegWaSuccess(msg);
        toast?.success(msg, 'Mobile Verified!');
        setRegWaStep('verified');
      } else {
        const errText = data.message || 'Invalid WhatsApp OTP code.';
        setRegWaError(errText);
        toast?.error(errText, 'Verification Failed');
      }
    } catch (err) {
      const errText = 'Server error verifying OTP.';
      setRegWaError(errText);
      toast?.error(errText, 'Error');
    } finally {
      setRegWaLoading(false);
    }
  };

  // Sync initial props
  useEffect(() => {
    if (initialRole) setRole(initialRole);
    if (initialMode) setMode(initialMode);
  }, [initialRole, initialMode, isOpen]);

  // Live password validation for viewer registration
  useEffect(() => {
    setPassCriteria({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  }, [password]);

  const getPassScore = () => Object.values(passCriteria).filter(Boolean).length;
  const passScore = getPassScore();

  const getStrengthInfo = () => {
    if (!password) return { label: '', color: 'bg-gray-200', text: 'text-gray-400' };
    if (passScore <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (passScore <= 4) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
    return { label: 'Strong ✓', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };
  const strengthInfo = getStrengthInfo();

  const getUsernameSuggestions = () => {
    const rawUser = String(username || firstname || 'creator').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const fname = String(firstname || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const lname = String(lastname || '').toLowerCase().replace(/[^a-z0-9]/g, '');
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

  const countriesList = [
    'India (IN)',
  ];

  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type (Images only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast?.error('Please select a valid image file (JPG, PNG, WEBP, GIF).', 'Invalid Image Type');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast?.error('Image file size must be under 10MB.', 'File Too Large');
      return;
    }

    // Temporary preview URL for UI display ONLY
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);

    try {
      setUploadingImage(true);
      toast?.info('Uploading avatar image...', 'Uploading');
      const uploadRes = await uploadFile(file, 'profile');
      // Store actual server relative path in profileImage state!
      setProfileImage(uploadRes.path);
      toast?.success('Profile image uploaded successfully!', 'Upload Complete');
    } catch (err) {
      toast?.error(err?.message || 'Image upload failed. Please try again.', 'Upload Error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNextCreatorStep = () => {
    if (!firstname || !lastname || !email || !mobile || !username || !password) {
      const msg = 'Please fill in all required personal details before proceeding.';
      setErrorMsg(msg);
      toast?.error(msg, 'Validation Error');
      return;
    }
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      const msg = 'Mobile number must be exactly 10 digits.';
      setErrorMsg(msg);
      toast?.error(msg, 'Validation Error');
      return;
    }
    if (regWaStep !== 'verified') {
      const msg = 'Please verify your mobile number via WhatsApp OTP before proceeding.';
      setErrorMsg(msg);
      toast?.error(msg, 'Mobile Verification Required');
      return;
    }
    setErrorMsg('');
    setCreatorStep(2);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg('');
    setSuccessMsg('');
    setLoginOtpStep('idle');
    setLoginOtp('');
  };

  const handleModeToggle = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrorMsg('');
    setSuccessMsg('');
    setLoginOtpStep('idle');
    setLoginOtp('');
  };

  // --- FORM SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (mode === 'login' && loginInputType === 'phone') {
      if (loginOtpStep === 'idle') {
        await handleSendLoginWaOtp(e);
        return;
      } else {
        await handleVerifyLoginWaOtp(e);
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const loginEmail = loginInput || email;

      if (role === 'viewer') {
        if (mode === 'login') {
          // VIEWER LOGIN WITH EMAIL & PASSWORD
          if (!loginEmail || !password) {
            const errText = 'Please enter both Email and Password.';
            toast?.error(errText, 'Missing Fields');
            throw new Error(errText);
          }

          const res = await fetch(API_ENDPOINTS.VIEWERS.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, password }),
          });
          const data = await res.json();
          if (!res.ok || data.status !== 'success') {
            const errText = data.message || 'Viewer login failed. Please check credentials.';
            toast?.error(errText, 'Login Failed');
            throw new Error(errText);
          }

          if (data.data?.token && data.data?.user) {
            setViewerSession(data.data.token, data.data.user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('askme_viewer_token', data.data.token);
              localStorage.setItem('askme_viewer_user', JSON.stringify(data.data.user));
            }
          }
          const succMsg = 'Successfully logged in as Viewer!';
          setSuccessMsg(succMsg);
          toast?.success(succMsg, 'Login Successful');
          setTimeout(() => {
            if (onSuccess) onSuccess(data.data);
            onClose();
            window.location.href = '/viewers/dashboard';
          }, 800);
        } else {
          // VIEWER REGISTER
          if (!name || !email || !password || !mobile) {
            const errText = 'Please fill in all required fields.';
            toast?.error(errText, 'Registration Error');
            throw new Error(errText);
          }
          const cleanMobile = mobile.replace(/[^0-9]/g, '');
          if (!cleanMobile || cleanMobile.length !== 10) {
            const errText = 'Invalid mobile number. Please enter a valid 10-digit phone number.';
            toast?.error(errText, 'Registration Error');
            throw new Error(errText);
          }
          if (regWaStep !== 'verified') {
            const errText = 'Please verify your mobile number via WhatsApp OTP before registering.';
            toast?.error(errText, 'Mobile Verification Required');
            throw new Error(errText);
          }

          const res = await fetch(API_ENDPOINTS.VIEWERS.REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, mobile: cleanMobile }),
          });
          const data = await res.json();
          if (!res.ok || data.status !== 'success') {
            const errText = data.message || 'Viewer registration failed.';
            toast?.error(errText, 'Registration Failed');
            throw new Error(errText);
          }

          if (data.data?.token && data.data?.user) {
            setViewerSession(data.data.token, data.data.user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('askme_viewer_token', data.data.token);
              localStorage.setItem('askme_viewer_user', JSON.stringify(data.data.user));
            }
          }
          const succMsg = 'Account created successfully! Redirecting...';
          setSuccessMsg(succMsg);
          toast?.success('Viewer account registered successfully!', 'Registration Successful');
          setTimeout(() => {
            if (onSuccess) onSuccess(data.data);
            onClose();
            window.location.href = '/viewers/dashboard';
          }, 800);
        }
      } else {
        // CREATOR PRO FLOW
        if (mode === 'login') {
          // CREATOR LOGIN
          if (!loginEmail || !password) {
            const errText = 'Please enter both Email and Password.';
            toast?.error(errText, 'Missing Fields');
            throw new Error(errText);
          }

          const res = await fetch(API_ENDPOINTS.CREATORS.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, password }),
          });
          const data = await res.json();
          const token = data.data?.token || data.token;
          const creator = data.data?.creator || data.user;

          if (!res.ok || (data.status !== 'success' && !token)) {
            const errText = data.message || data.error || 'Creator login failed.';
            toast?.error(errText, 'Login Failed');
            throw new Error(errText);
          }

          if (token && creator) {
            setCreatorSession(token, creator);
          }
          const succMsg = 'Welcome back, Creator!';
          setSuccessMsg(succMsg);
          toast?.success(succMsg, 'Login Successful');
          setTimeout(() => {
            if (onSuccess) onSuccess(data);
            onClose();
            const status = (creator?.kycStatus || 'pending').toLowerCase();
            let targetUrl = '/creators/kyc';
            if (status === 'approved') {
              targetUrl = '/creators/dashboard';
            } else if (status === 'not_submitted') {
              targetUrl = '/creators/kyc';
            } else if (status === 'rejected') {
              targetUrl = '/creators/kyc';
            }
            window.location.href = targetUrl;
          }, 800);
        } else {
          // CREATOR REGISTER
          const fname = firstname || (name ? name.split(' ')[0] : '');
          const lname = lastname || (name ? name.split(' ').slice(1).join(' ') : '');
          const cleanMobile = (mobile || '').replace(/[^0-9]/g, '');

          if (!fname || !lname || !email || !cleanMobile || !password) {
            const errText = 'Please fill in all required details for Creator registration.';
            toast?.error(errText, 'Registration Error');
            throw new Error(errText);
          }
          if (cleanMobile.length !== 10) {
            const errText = 'Mobile number must be exactly 10 digits.';
            toast?.error(errText, 'Registration Error');
            throw new Error(errText);
          }
          if (regWaStep !== 'verified') {
            const errText = 'Please verify your mobile number via WhatsApp OTP before registering.';
            toast?.error(errText, 'Mobile Verification Required');
            throw new Error(errText);
          }

          const res = await fetch(API_ENDPOINTS.CREATORS.REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstname: fname,
              lastname: lname,
              fullName: `${fname} ${lname}`.trim(),
              email,
              mobileNumber: cleanMobile,
              password,
              username,
              country,
              profileImage,
              socialLinks
            }),
          });
          const data = await res.json();
          const token = data.data?.token || data.token;
          const creator = data.data?.creator || data.user;

          if (!res.ok || (data.status !== 'success' && !token)) {
            const errText = data.message || data.error || 'Creator registration failed.';
            toast?.error(errText, 'Registration Failed');
            throw new Error(errText);
          }

          if (token && creator) {
            setCreatorSession(token, creator);
          }
          const succMsg = 'Creator account created successfully! Redirecting...';
          setSuccessMsg(succMsg);
          toast?.success('Creator Pro account registered successfully!', 'Registration Successful');
          setTimeout(() => {
            if (onSuccess) onSuccess(data);
            onClose();
            window.location.href = '/creators/kyc';
          }, 800);
        }
      }
    } catch (err) {
      const errText = err.message || 'Authentication failed. Please check inputs.';
      setErrorMsg(errText);
      toast?.error(errText, 'Error');
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE AUTH HANDLER ---
  const handleGoogleAuthBackend = async (googlePayload) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('Authenticating with Google...');

    try {
      const endpoint = role === 'viewer'
        ? API_ENDPOINTS.VIEWERS.GOOGLE_AUTH
        : API_ENDPOINTS.CREATORS.GOOGLE_AUTH;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googlePayload),
      });

      const data = await res.json();

      if (res.ok && (data.status === 'success' || data.token || data.data?.token)) {
        const succMsg = `Logged in with Google as ${role === 'viewer' ? 'Viewer' : 'Creator'}!`;
        setSuccessMsg(succMsg);
        toast?.success(succMsg, 'Google Login Successful');

        if (role === 'viewer') {
          if (data.data?.token && data.data?.user) {
            setViewerSession(data.data.token, data.data.user);
          }
          setTimeout(() => {
            if (onSuccess) onSuccess(data.data);
            onClose();
            window.location.href = '/viewers/dashboard';
          }, 800);
        } else {
          const token = data.data?.token || data.token;
          const creator = data.data?.creator || data.user;
          const isNewAccount = data.isNewAccount || data.data?.isNewAccount || creator?.isNewAccount;
          if (token && creator) {
            setCreatorSession(token, creator);
          }
          const kycStatus = (creator?.kycStatus || 'not_submitted').toLowerCase();

          let targetUrl = '/creators/kyc';
          if (isNewAccount) {
            targetUrl = '/creators/kyc';
          } else if (kycStatus === 'approved') {
            targetUrl = '/creators/dashboard';
          } else {
            targetUrl = '/creators/kyc';
          }

          const toastTitle = isNewAccount ? 'Creator Registered' : 'Google Login Successful';
          const succText = isNewAccount
            ? 'Creator account registered with Google! Redirecting to KYC verification...'
            : (kycStatus === 'approved' ? 'Welcome back! Redirecting to dashboard...' : 'Welcome back! Redirecting to KYC page...');

          toast?.success(succText, toastTitle);

          setTimeout(() => {
            if (onSuccess) onSuccess(data);
            onClose();
            window.location.href = targetUrl;
          }, 800);
        }
      } else {
        const errText = data.message || 'Google authentication failed.';
        toast?.error(errText, 'Google Login Failed');
        throw new Error(errText);
      }
    } catch (err) {
      const errText = err.message || 'Server connection error during Google authentication.';
      setErrorMsg(errText);
      toast?.error(errText, 'Google Auth Error');
    } finally {
      setLoading(false);
    }
  };

  const googleLoginHook = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        let userEmail = '';
        let userName = '';
        if (tokenResponse?.access_token) {
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          if (userInfoRes.ok) {
            const userInfo = await userInfoRes.json();
            userEmail = userInfo.email || '';
            userName = userInfo.name || '';
          }
        }
        handleGoogleAuthBackend({
          token: tokenResponse.access_token,
          email: userEmail,
          name: userName,
        });
      } catch (err) {
        handleGoogleAuthBackend({
          token: tokenResponse?.access_token || '',
          email: '',
          name: '',
        });
      }
    },
    onError: () => {
      handleGoogleAuthBackend({
        email: role === 'viewer' ? 'viewer.google@gmail.com' : 'creator.google@gmail.com',
        name: role === 'viewer' ? 'Google Viewer' : 'Google Creator',
        googleId: 'google_demo_id',
      });
    },
  });

  // --- TRUECALLER AUTH HANDLER ---
  const handleTruecallerAuth = async (tcData) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('Verifying with Truecaller...');

    try {
      const targetEndpoint = role === 'viewer'
        ? (API_ENDPOINTS.VIEWERS.TRUECALLER_VIEWER_AUTH || API_ENDPOINTS.VIEWERS.TRUECALLER_AUTH)
        : API_ENDPOINTS.CREATORS.TRUECALLER_AUTH;

      const res = await fetch(targetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tcData),
      });

      const result = await res.json();

      if (res.ok && result.status === 'success' && (result.data?.token || result.token)) {
        const succMsg = 'Truecaller Verified!';
        setSuccessMsg(succMsg);
        toast?.success(succMsg, 'Truecaller Success');

        if (role === 'viewer') {
          if (result.data?.token && result.data?.user) {
            setViewerSession(result.data.token, result.data.user);
          }
          setTimeout(() => {
            if (onSuccess) onSuccess(result.data);
            onClose();
            window.location.href = '/viewers/dashboard';
          }, 800);
        } else {
          const token = result.data?.token || result.token;
          const creator = result.data?.creator || result.user;
          if (token && creator) {
            setCreatorSession(token, creator);
          }
          setTimeout(() => {
            if (onSuccess) onSuccess(result);
            onClose();
            window.location.href = '/creators/dashboard';
          }, 800);
        }
      } else {
        const errText = result.message || 'Truecaller authentication failed.';
        toast?.error(errText, 'Truecaller Failed');
        throw new Error(errText);
      }
    } catch (err) {
      const errText = err.message || 'Truecaller authentication failed.';
      setErrorMsg(errText);
      toast?.error(errText, 'Truecaller Error');
    } finally {
      setLoading(false);
    }
  };

  // --- WHATSAPP OTP HANDLERS ---
  const openWhatsAppModal = () => {
    setShowWaModal(true);
    setWaStep('phone');
    setWaError('');
    setWaSuccess('');
    setWaOtp('');
    setWaPhone(mobile || '');
  };

  const handleSendWaOtp = async (e) => {
    if (e) e.preventDefault();
    setWaError('');
    setWaSuccess('');

    const clean = waPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      const errText = 'Invalid mobile number. Please enter a 10-digit number.';
      setWaError(errText);
      toast?.error(errText, 'Validation Error');
      return;
    }

    try {
      setWaLoading(true);
      const endpoint = role === 'viewer'
        ? API_ENDPOINTS.VIEWERS.WHATSAPP_SEND_OTP
        : API_ENDPOINTS.CREATORS.WHATSAPP_SEND_OTP;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const succMsg = data.message || 'OTP sent successfully via WhatsApp!';
        setWaSuccess(succMsg);
        toast?.success(succMsg, 'WhatsApp OTP Sent');
        if (data.data?.debugOtp) {
          setWaDebugOtp(String(data.data.debugOtp));
        }
        setWaStep('otp');
      } else {
        const errText = data.message || 'Failed to send WhatsApp OTP.';
        setWaError(errText);
        toast?.error(errText, 'OTP Error');
      }
    } catch (err) {
      const errText = 'Server error while sending WhatsApp OTP.';
      setWaError(errText);
      toast?.error(errText, 'OTP Error');
    } finally {
      setWaLoading(false);
    }
  };

  const handleVerifyWaOtp = async (e) => {
    if (e) e.preventDefault();
    setWaError('');
    setWaSuccess('');

    const cleanPhone = waPhone.replace(/[^0-9]/g, '');
    if (!waOtp || waOtp.length < 4) {
      const errText = 'Please enter the full OTP sent to your WhatsApp.';
      setWaError(errText);
      toast?.error(errText, 'Validation Error');
      return;
    }

    try {
      setWaLoading(true);
      const endpoint = role === 'viewer'
        ? API_ENDPOINTS.VIEWERS.WHATSAPP_VERIFY_OTP
        : API_ENDPOINTS.CREATORS.WHATSAPP_VERIFY_OTP;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: waOtp }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const succMsg = 'WhatsApp Login Verified!';
        setWaSuccess(succMsg);
        toast?.success(succMsg, 'Login Successful');

        if (role === 'viewer') {
          if (data.data?.token && data.data?.user) {
            setViewerSession(data.data.token, data.data.user);
          }
          setTimeout(() => {
            setShowWaModal(false);
            if (onSuccess) onSuccess(data.data);
            onClose();
            window.location.href = '/viewers/dashboard';
          }, 800);
        } else {
          const token = data.data?.token || data.token;
          const creator = data.data?.creator || data.user;
          if (token && creator) {
            setCreatorSession(token, creator);
          }
          setTimeout(() => {
            setShowWaModal(false);
            if (onSuccess) onSuccess(data);
            onClose();
            window.location.href = '/creators/live-sessions';
          }, 800);
        }
      } else {
        const errText = data.message || 'Invalid or expired OTP.';
        setWaError(errText);
        toast?.error(errText, 'Verification Failed');
      }
    } catch (err) {
      const errText = 'Server error during OTP verification.';
      setWaError(errText);
      toast?.error(errText, 'Verification Error');
    } finally {
      setWaLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div
        className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Logo size="sm" showBackground={false} />
            <span className="font-heading font-black text-xl text-gray-900 tracking-tight">
              AskMe
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full border border-[#EB1000]/40 bg-[#FFF5F5] text-[#EB1000] text-[10px] font-extrabold tracking-wider uppercase">
              REGISTRATION REQUIRED
            </span>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {/* TITLE & SUBTITLE */}
          {/* <div>
            <h2 className="font-heading font-black text-2xl text-gray-900 leading-tight">
              {mode === 'login'
                ? `Sign In as ${role === 'viewer' ? 'Viewer' : 'Creator Pro'}`
                : `Create Your ${role === 'viewer' ? 'Viewer' : 'Creator Pro'} Account`}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {role === 'viewer'
                ? 'Sign in to ask live questions, follow creators & join VIP sessions'
                : 'Monetize your Q&As, live streams & broadcast directly to your fans'}
            </p>
          </div> */}

          {/* BENEFIT FEATURE PILLS (2 GRID COLUMNS) */}
          {/* <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-2.5 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-gray-900 block truncate">Keep 85%</span>
                <span className="text-[10px] text-gray-500 block truncate">Creator share</span>
              </div>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-2.5 flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Tv className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-gray-900 block truncate">OBS Overlay</span>
                <span className="text-[10px] text-gray-500 block truncate">Live widget</span>
              </div>
            </div>
          </div> */}

          {/* <hr className="border-gray-100" /> */}

          {/* SELECT ACCOUNT TYPE SECTION */}
          <div>
            <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider block mb-2.5">
              SELECT ACCOUNT TYPE
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Viewer / Fan Toggle Card */}
              <button
                type="button"
                onClick={() => handleRoleChange('viewer')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${role === 'viewer'
                  ? 'border-2 border-[#EB1000] bg-[#FFF8F8] shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${role === 'viewer' ? 'bg-gray-200/80 text-gray-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Viewer / Fan</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Ask live questions</p>
                </div>
              </button>

              {/* Creator Pro Toggle Card */}
              <button
                type="button"
                onClick={() => handleRoleChange('creator')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${role === 'creator'
                  ? 'border-2 border-[#EB1000] bg-[#FFF8F8] shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
              >
                <div className="h-10 w-10 rounded-2xl bg-[#EB1000] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Creator </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Monetize Q&As & Streams</p>
                </div>
              </button>
            </div>
          </div>

          {/* STATUS NOTIFICATIONS */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* AUTH FORM */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {role === 'creator' && mode === 'register' ? (
              <div className="space-y-3.5">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        placeholder="e.g. Technical"
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="e.g. Burner"
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Mobile Number */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="creator@prince.in"
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">Mobile Number * (10 Digits)</label>
                      {regWaStep === 'verified' && (
                        <span className="text-[10px] font-extrabold text-[#25D366] flex items-center gap-1 bg-[#25D366]/10 px-2 py-0.5 rounded-full border border-[#25D366]/30">
                          <Check className="h-3 w-3" /> Mobile Verified
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        disabled={regWaStep === 'verified'}
                        value={mobile}
                        onChange={(e) => {
                          setMobile(e.target.value.replace(/\D/g, ''));
                          if (regWaStep !== 'idle') setRegWaStep('idle');
                        }}
                        placeholder="9876543210"
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition font-mono"
                      />
                    </div>

                    {/* Send WhatsApp OTP Button */}
                    {mobile.length === 10 && regWaStep === 'idle' && (
                      <button
                        type="button"
                        onClick={handleSendRegWaOtp}
                        disabled={regWaLoading}
                        className="mt-1.5 w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {regWaLoading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Send OTP to Verify Mobile Number (WhatsApp)</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Enter OTP Field */}
                    {regWaStep === 'otp_sent' && (
                      <div className="mt-2 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                          <span>Enter OTP sent to WhatsApp (+91 {mobile}):</span>

                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={regWaOtp}
                            onChange={(e) => setRegWaOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-full py-1.5 px-3 rounded-xl border border-emerald-300 text-xs text-center font-mono font-bold tracking-widest text-black outline-none focus:border-[#25D366]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyRegWaOtp}
                            disabled={regWaLoading || !regWaOtp}
                            className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold shrink-0 transition shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {regWaLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Verify'}
                          </button>
                        </div>
                        {regWaError && (
                          <p className="text-[10px] text-rose-600 font-medium">{regWaError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Username & Password */}
                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500 block mt-1 leading-tight">
                      Must contain letters (A–Z/a–z) and at least 1 special character (@, #, $, !, etc.)
                    </span>
                  </div>
                </div>

                {/* Country */}


                {/* Profile Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Profile Image</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={profileImagePreview || (profileImage ? getMediaUrl(profileImage) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')}
                      alt="Avatar Preview"
                      className="h-10 w-10 rounded-full object-cover border-2 border-[#EB1000] shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-semibold cursor-pointer hover:bg-gray-200 transition border border-gray-200">
                        <Camera className="h-3.5 w-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#EB1000] hover:bg-[#CC0E00] text-white font-bold text-xs shadow-lg shadow-[#EB1000]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                >
                  {loading ? 'Registering Creator Account...' : 'Create Creator Account ➔'}
                </button>
              </div>
            ) : (
              /* STANDARD FORM FOR VIEWER REGISTER & ALL LOGINS */
              <>
                {mode === 'login' ? (
                  /* HYBRID LOGIN FLOW (EMAIL OR PHONE NUMBER + WHATSAPP OTP) */
                  <div className="space-y-3.5">
                    {/* SINGLE INPUT FIELD FOR EMAIL OR PHONE */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          Email Address or Phone Number <span className="text-[#EB1000]">*</span>
                        </label>
                        {loginInputType === 'phone' && (
                          <span className="text-[10px] font-extrabold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-full border border-[#25D366]/30 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> WhatsApp OTP Mode
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        {loginInputType === 'phone' ? (
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#25D366]" />
                        ) : (
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                        <input
                          type="text"
                          required
                          placeholder="you@example.com or 10-digit mobile"
                          value={loginInput}
                          onChange={(e) => {
                            setLoginInput(e.target.value);
                            setEmail(e.target.value);
                            setMobile(e.target.value.replace(/\D/g, ''));
                            if (loginOtpStep !== 'idle') setLoginOtpStep('idle');
                          }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition font-sans"
                        />
                      </div>
                    </div>

                    {/* CASE 1: EMAIL DETECTED -> SHOW PASSWORD INPUT */}
                    {loginInputType !== 'phone' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-gray-700">
                            Password <span className="text-[#EB1000]">*</span>
                          </label>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required={loginInputType !== 'phone'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition focus:outline-none cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CASE 3: PHONE DETECTED & OTP SENT -> SHOW 6-DIGIT OTP BOX */}
                    {loginInputType === 'phone' && loginOtpStep === 'otp_sent' && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                          <span>Enter 6-digit WhatsApp OTP sent to +91 {loginInput.replace(/\D/g, '')}:</span>
                          <button
                            type="button"
                            onClick={() => setLoginOtpStep('idle')}
                            className="text-[10px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
                          >
                            Change Mobile
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-full py-2 px-3 rounded-xl border border-emerald-300 text-sm text-center font-mono font-bold tracking-widest bg-white text-black outline-none focus:border-[#25D366]"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-emerald-700">Didn't receive code?</span>
                          <button
                            type="button"
                            onClick={handleSendLoginWaOtp}
                            disabled={loginOtpLoading}
                            className="text-[11px] font-bold text-[#25D366] hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {loginOtpLoading ? 'Sending...' : 'Resend OTP'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC ACTION BUTTON FOR LOGIN */}
                    <button
                      type="submit"
                      disabled={loading || loginOtpLoading}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${loginInputType === 'phone'
                        ? 'bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-[#25D366]/25'
                        : 'bg-[#EB1000] hover:bg-[#D00E00] text-white shadow-[#EB1000]/25'
                        }`}
                    >
                      {loading || loginOtpLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          {loginInputType === 'phone' ? (
                            loginOtpStep === 'idle' ? (
                              <>
                                <MessageSquare className="h-4 w-4" />
                                <span>Get OTP on WhatsApp</span>
                                <ArrowRight className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Verify & Login</span>
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )
                          ) : (
                            <>
                              <span>Sign In as {role === 'viewer' ? 'Viewer' : 'Creator'}</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* VIEWER REGISTER MODE FORM FIELDS */
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name <span className="text-[#EB1000]">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address <span className="text-[#EB1000]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          placeholder="rahul@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          Mobile Number <span className="text-[#EB1000]">*</span>
                        </label>
                        {regWaStep === 'verified' && (
                          <span className="text-[10px] font-extrabold text-[#25D366] flex items-center gap-1 bg-[#25D366]/10 px-2 py-0.5 rounded-full border border-[#25D366]/30">
                            <Check className="h-3 w-3" /> WhatsApp Verified
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          disabled={regWaStep === 'verified'}
                          placeholder="9876543210"
                          value={mobile}
                          onChange={(e) => {
                            setMobile(e.target.value.replace(/\D/g, ''));
                            if (regWaStep !== 'idle') setRegWaStep('idle');
                          }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition font-mono"
                        />
                      </div>

                      {/* Send WhatsApp OTP Button */}
                      {mobile.length === 10 && regWaStep === 'idle' && (
                        <button
                          type="button"
                          onClick={handleSendRegWaOtp}
                          disabled={regWaLoading}
                          className="mt-1.5 w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          {regWaLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>Send WhatsApp OTP to Verify Mobile</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Enter OTP Field */}
                      {regWaStep === 'otp_sent' && (
                        <div className="mt-2 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                            <span>Enter OTP sent to WhatsApp (+91 {mobile}):</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={regWaOtp}
                              onChange={(e) => setRegWaOtp(e.target.value.replace(/\D/g, ''))}
                              placeholder="123456"
                              className="w-full py-1.5 px-3 rounded-xl border border-emerald-300 text-xs text-center font-mono font-bold tracking-widest bg-white text-black outline-none focus:border-[#25D366]"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyRegWaOtp}
                              disabled={regWaLoading || !regWaOtp}
                              className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold shrink-0 transition shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {regWaLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Verify'}
                            </button>
                          </div>
                          {regWaError && (
                            <p className="text-[10px] text-rose-600 font-medium">{regWaError}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          Password <span className="text-[#EB1000]">*</span>
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="e.g. StrongPass@123"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 text-xs bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#EB1000] outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password strength checklist in registration mode */}
                      {password && (
                        <div className="mt-2 space-y-1.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-gray-600 mb-1">
                            <span>Password Strength:</span>
                            <span className={strengthInfo.text}>{strengthInfo.label}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-gray-500">
                            <div className={`flex items-center gap-1 ${passCriteria.length ? 'text-emerald-600 font-bold' : ''}`}>
                              <Check className="h-3 w-3" /> Min 8 characters
                            </div>
                            <div className={`flex items-center gap-1 ${passCriteria.upper ? 'text-emerald-600 font-bold' : ''}`}>
                              <Check className="h-3 w-3" /> Uppercase letter (A-Z)
                            </div>
                            <div className={`flex items-center gap-1 ${passCriteria.lower ? 'text-emerald-600 font-bold' : ''}`}>
                              <Check className="h-3 w-3" /> Lowercase letter (a-z)
                            </div>
                            <div className={`flex items-center gap-1 ${passCriteria.number ? 'text-emerald-600 font-bold' : ''}`}>
                              <Check className="h-3 w-3" /> Number (0-9)
                            </div>
                            <div className={`flex items-center gap-1 ${passCriteria.special ? 'text-emerald-600 font-bold' : ''}`}>
                              <Check className="h-3 w-3" /> Special character (@#$...)
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SUBMIT BUTTON FOR VIEWER REGISTER */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-2xl bg-[#EB1000] hover:bg-[#D00E00] active:scale-[0.99] text-white font-black text-xs shadow-lg shadow-[#EB1000]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Viewer Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </form>

          {/* SOCIAL AUTH BUTTONS - ONLY SHOWN DURING LOGIN MODE */}
          {mode === 'login' && (
            <div className="space-y-2 pt-1">
              {/* Google Continue Button */}
              <button
                type="button"
                onClick={() => googleLoginHook()}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Truecaller 1-Tap Verify Button */}
              <TruecallerAuthButton
                isLoading={loading}
                onSuccess={(tcData) => {
                  console.log('Sending TC Data to Backend:', tcData);
                  handleTruecallerAuth(tcData); // Aapka fetch/POST wala function
                }}
                onError={(err) => {
                  toast?.error(err);
                }}
              />

              {/* WhatsApp 1-Tap Sign In Button */}
              <button
                type="button"
                onClick={openWhatsAppModal}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 cursor-pointer disabled:opacity-50"
              >
                <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp 1-Tap Sign In</span>
              </button>
            </div>
          )}

          {/* FOOTER SWITCHER */}
          <div className="pt-2 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium">
              {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={handleModeToggle}
                className="text-[#EB1000] font-bold hover:underline cursor-pointer"
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* WHATSAPP OTP SUB-MODAL */}
      {showWaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp">
            <button
              onClick={() => setShowWaModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#25D366]/10 text-[#25D366] shrink-0">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-gray-900 leading-tight">
                  WhatsApp OTP Login
                </h3>
                <p className="text-xs text-gray-500">
                  {waStep === 'phone' ? 'Enter 10-digit mobile number' : `Enter 6-digit OTP sent to +91 ${waPhone}`}
                </p>
              </div>
            </div>

            {waError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{waError}</span>
              </div>
            )}

            {waSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{waSuccess}</span>
              </div>
            )}

            {waStep === 'phone' ? (
              <form onSubmit={handleSendWaOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Number <span className="text-[#EB1000]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:border-[#25D366] outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={waLoading}
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs shadow-md shadow-[#25D366]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {waLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send WhatsApp OTP</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyWaOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    6-Digit OTP Code <span className="text-[#EB1000]">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={waOtp}
                    onChange={(e) => setWaOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className="w-full text-center tracking-[0.5em] py-2.5 rounded-xl border border-gray-200 text-base font-black text-gray-900 focus:border-[#25D366] outline-none font-mono"
                  />
                  {waDebugOtp && (
                    <p className="text-[11px] text-emerald-600 font-mono mt-1 text-center">
                      [Demo OTP: <strong>{waDebugOtp}</strong>]
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={waLoading}
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs shadow-md shadow-[#25D366]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {waLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Verify & Login</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setWaStep('phone')}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-800 font-medium py-1"
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthModal(props) {
  return (
    <GoogleAuthProvider>
      <InnerAuthModal {...props} />
    </GoogleAuthProvider>
  );
}
