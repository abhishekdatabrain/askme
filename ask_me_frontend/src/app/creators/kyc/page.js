'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LandingNavbar from '@/components/LandingNavbar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
import Logo from '@/components/Logo';
import { useToast } from '@/context/ToastContext';
import {
    ShieldCheck,
    CheckCircle2,
    Clock,
    User,
    CreditCard,
    Building2,
    FileText,
    Upload,
    ArrowRight,
    ArrowLeft,
    Lock,
    Sparkles,
    AlertCircle,
    QrCode,
    ExternalLink,
    ChevronRight,
    RefreshCw,
    Check,
    XCircle,
    AlertTriangle,
    LogOut,
    Sun,
    Moon,
    Bell,
    X,
    KeyRound,
    Smartphone
} from 'lucide-react';
import { API_ENDPOINTS, getMediaUrl } from '@/config/api';
import { uploadFile } from '@/utils/fileUpload';
import { getCreatorToken, getCreatorUser, clearCreatorSession } from '@/utils/cookies';

export default function CreatorKycPage() {
    const { toast } = useToast();
    const router = useRouter();

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

    const handleLogout = () => {
        clearCreatorSession();
        toast.info('Logged out successfully from Creator Studio.', 'Logged Out');
        setTimeout(() => {
            window.location.href = '/';
        }, 400);
    };

    // Authentication & Creator State
    const [creatorUser, setCreatorUser] = useState(null);
    const [token, setToken] = useState('');
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Flow State: 'kyc_form' | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected' | 'manual_review'
    const [flowState, setFlowState] = useState('kyc_form');
    const [step, setStep] = useState(1); // 1: Personal Info, 2: Document Proof, 3: Bank Details, 4: Review & Submit

    // Form Submission & Error States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Pre-filled & Locked States
    const [isNameLocked, setIsNameLocked] = useState(false);
    const [isMobileLocked, setIsMobileLocked] = useState(true);

    const socialPlatforms = [
        { value: 'youtube', label: 'YouTube Channel', icon: '▶' },
        { value: 'instagram', label: 'Instagram Handle', icon: '📸' },
        { value: 'twitch', label: 'Twitch Channel', icon: '👾' },
        { value: 'facebook', label: 'Facebook Page', icon: 'f' },
        { value: 'kick', label: 'Kick Channel', icon: '⚡' },
        { value: 'x', label: 'X / Twitter Handle', icon: '𝕏' },
        { value: 'linkedin', label: 'LinkedIn Profile', icon: '💼' },
    ];

    // KYC Form State
    const [formData, setFormData] = useState({
        fullName: '',
        mobileCountryCode: '+91',
        mobileNumber: '',
        category: '',
        categorySelect: '',
        customCategory: '',
        socialMediaUrl: '',
        youtubeUrl: '',
        instagramUrl: '',
        facebookUrl: '',
        twitchUrl: '',
        linkedinUrl: '',
        socialLinks: [
            { platform: 'youtube', link: '' },
            { platform: 'instagram', link: '' },
        ],
        dateOfBirth: '',
        address: '',
        country: 'India',
        state: '',
        city: '',
        pincode: '',
        documentType: 'pan_card',
        panNumber: '',
        aadhaarNumber: '',
        documentNumber: '',
        documentPreview: '',

        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        upiId: '',

        agreeTerms: false,
    });

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

    // ==========================================
    // CASHFREE VERIFICATION STATES & HANDLERS
    // ==========================================
    // 1. PAN State
    const [isVerifyingPan, setIsVerifyingPan] = useState(false);
    const [panVerificationData, setPanVerificationData] = useState(null);

    // 2. Aadhaar & DigiLocker State
    const [isSendingAadhaarOtp, setIsSendingAadhaarOtp] = useState(false);
    const [isVerifyingAadhaarOtp, setIsVerifyingAadhaarOtp] = useState(false);
    const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
    const [aadhaarRefId, setAadhaarRefId] = useState('');
    const [aadhaarOtp, setAadhaarOtp] = useState('');
    const [aadhaarVerificationData, setAadhaarVerificationData] = useState(null);

    // DigiLocker State
    const [isInitiatingDigiLocker, setIsInitiatingDigiLocker] = useState(false);
    const [isVerifyingDigiLocker, setIsVerifyingDigiLocker] = useState(false);
    const [isSendingDigiLockerOtp, setIsSendingDigiLockerOtp] = useState(false);
    const [isVerifyingDigiLockerOtp, setIsVerifyingDigiLockerOtp] = useState(false);
    const [digiLockerOtpSent, setDigiLockerOtpSent] = useState(false);
    const [digiLockerRefId, setDigiLockerRefId] = useState('');
    const [digiLockerOtp, setDigiLockerOtp] = useState('');
    const [digiLockerPin, setDigiLockerPin] = useState('');
    const [showDigiLockerOtpBox, setShowDigiLockerOtpBox] = useState(false);
    const [showDigiConsentModal, setShowDigiConsentModal] = useState(false);
    const [digiConsentAgreed, setDigiConsentAgreed] = useState(true);
    const [digiCardStep, setDigiCardStep] = useState(2); // 2: PAN, 3: DigiLocker Aadhaar, 4: DigiLocker Consent, 5: Verification Success

    // PAN to GSTIN State
    const [isFetchingGstin, setIsFetchingGstin] = useState(false);
    const [gstinData, setGstinData] = useState(null);

    // 3. PAN + Aadhaar Identity Match State
    const [isCheckingIdentityMatch, setIsCheckingIdentityMatch] = useState(false);
    const [identityMatchData, setIdentityMatchData] = useState(null);

    // 4. Bank Account Verification State (Penny Drop)
    const [isVerifyingBank, setIsVerifyingBank] = useState(false);
    const [bankVerificationData, setBankVerificationData] = useState(null);

    // 5. EULA & Legal Agreement State
    const [showEulaModal, setShowEulaModal] = useState(false);
    const [agreeEula, setAgreeEula] = useState(false);

    // Age calculation helper (18+ check)
    const calculateAge = (dobString) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        if (isNaN(dob.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    const sanitizePanNumber = (input) => {
        if (!input) return '';
        let cleaned = String(input).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        if (cleaned.length === 10) {
            let chars = cleaned.split('');
            for (let i = 0; i < 5; i++) {
                if (chars[i] === '0') chars[i] = 'O';
            }
            for (let i = 5; i < 9; i++) {
                if (chars[i] === 'O') chars[i] = '0';
            }
            if (chars[9] === '0') chars[9] = 'O';
            cleaned = chars.join('');
        }
        return cleaned;
    };

    const sanitizeIfscCode = (input) => {
        if (!input) return '';
        let cleaned = String(input).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
        if (cleaned.length >= 5 && cleaned[4] === 'O') {
            let chars = cleaned.split('');
            chars[4] = '0';
            cleaned = chars.join('');
        }
        return cleaned;
    };

    // --- DigiLocker Handlers ---
    const handleInitDigiLocker = async () => {
        try {
            setIsInitiatingDigiLocker(true);
            const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/creators/kyc` : '';
            const res = await fetch(API_ENDPOINTS.CREATORS.DIGILOCKER_INIT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    redirectUrl,
                    verificationId: `CF-DIGI-${Date.now()}`,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data?.redirectUrl) {
                toast.info('Redirecting to DigiLocker for Aadhaar Verification...', 'DigiLocker Initiated');
                setTimeout(() => {
                    window.location.href = data.data.redirectUrl;
                }, 400);
            } else {
                toast.error(data.message || 'Failed to initialize DigiLocker session.', 'DigiLocker Error');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to connect to DigiLocker.', 'DigiLocker Error');
        } finally {
            setIsInitiatingDigiLocker(false);
        }
    };

    const handleVerifyDigiLockerCallback = async (verificationId) => {
        try {
            setIsVerifyingDigiLocker(true);
            toast.info('Verifying Aadhaar document via DigiLocker...', 'DigiLocker Verification');

            const res = await fetch(API_ENDPOINTS.CREATORS.DIGILOCKER_VERIFY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    verificationId,
                    name: panVerificationData?.registeredName || formData.fullName,
                }),
            });

            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data?.verified) {
                const digiData = data.data;
                const aadhaarName = digiData.registeredName || formData.fullName;

                // 18+ Age Restriction Check from DigiLocker DOB
                if (digiData.dob) {
                    const age = calculateAge(digiData.dob);
                    if (age !== null && age < 18) {
                        toast.error(`Age Restriction Error: Verified DigiLocker DOB indicates age ${age} (< 18). You must be 18+ to complete KYC.`, 'Underage Error');
                        setAadhaarVerificationData(null);
                        return;
                    }
                    setFormData(prev => ({
                        ...prev,
                        dateOfBirth: digiData.dob,
                    }));
                }

                setAadhaarVerificationData({
                    ...digiData,
                    verificationMode: 'DigiLocker',
                });
                setDigiCardStep(5);

                toast.success(`Aadhaar Verified via DigiLocker! Name: ${aadhaarName}`, 'DigiLocker Verified');

                // If PAN is already verified, trigger backend identity match
                const panName = panVerificationData?.registeredName || formData.fullName;
                if (panVerificationData?.verified) {
                    runIdentityMatch(panName, aadhaarName);
                }

                // Clear query params from URL
                if (typeof window !== 'undefined' && window.history) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } else {
                toast.error(data.message || 'DigiLocker verification failed.', 'DigiLocker Error');
            }
        } catch (err) {
            toast.error(err.message || 'Error processing DigiLocker verification.', 'Verification Error');
        } finally {
            setIsVerifyingDigiLocker(false);
        }
    };

    // --- DigiLocker Aadhaar OTP Handlers ---
    const handleSendDigiLockerOtp = async () => {
        const cleanAadhaar = String(formData.aadhaarNumber || '').replace(/\D/g, '');
        if (!cleanAadhaar || cleanAadhaar.length !== 12) {
            toast.error('Please enter a valid 12-digit Aadhaar Card Number.', 'Aadhaar Required');
            return;
        }

        try {
            setIsSendingDigiLockerOtp(true);
            const res = await fetch(API_ENDPOINTS.CREATORS.DIGILOCKER_SEND_OTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    aadhaarNumber: cleanAadhaar,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data?.refId) {
                setDigiLockerRefId(data.data.refId);
                setDigiLockerOtpSent(true);
                setShowDigiLockerOtpBox(true);
                toast.success('DigiLocker OTP sent successfully to your Aadhaar-linked mobile!', 'DigiLocker OTP Sent');
            } else {
                toast.error(data.message || 'Failed to send DigiLocker OTP.', 'DigiLocker Error');
            }
        } catch (err) {
            toast.error(err.message, 'DigiLocker OTP Error');
        } finally {
            setIsSendingDigiLockerOtp(false);
        }
    };

    const handleVerifyDigiLockerOtp = async () => {
        if (!digiLockerOtp || digiLockerOtp.trim().length < 4) {
            toast.error('Please enter the 6-digit OTP received for DigiLocker Aadhaar verification.', 'OTP Required');
            return;
        }

        try {
            setIsVerifyingDigiLockerOtp(true);
            const res = await fetch(API_ENDPOINTS.CREATORS.DIGILOCKER_VERIFY_OTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    otp: digiLockerOtp.trim(),
                    securityPin: digiLockerPin.trim(),
                    refId: digiLockerRefId,
                    aadhaarNumber: formData.aadhaarNumber,
                    name: panVerificationData?.registeredName || formData.fullName,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data?.verified) {
                const digiData = data.data;
                const aadhaarName = digiData.registeredName || formData.fullName;

                // 18+ Age restriction check
                if (digiData.dob) {
                    const age = calculateAge(digiData.dob);
                    if (age !== null && age < 18) {
                        toast.error(`Age Restriction Error: DigiLocker DOB indicates age ${age} (< 18). You must be 18+ to complete KYC.`, 'Underage Error');
                        setAadhaarVerificationData(null);
                        return;
                    }
                    setFormData(prev => ({
                        ...prev,
                        dateOfBirth: digiData.dob,
                    }));
                }

                setAadhaarVerificationData({
                    ...digiData,
                    verificationMode: 'DigiLocker OTP',
                });
                setDigiCardStep(5);

                setShowDigiLockerOtpBox(false);
                toast.success(`Aadhaar Verified via DigiLocker OTP! Name: ${aadhaarName}`, 'DigiLocker Verified');

                // Trigger PAN-Aadhaar identity match if PAN is verified
                const panName = panVerificationData?.registeredName || formData.fullName;
                if (panVerificationData?.verified) {
                    runIdentityMatch(panName, aadhaarName);
                }
            } else {
                setAadhaarVerificationData(null);
                toast.error(data.message || 'Invalid DigiLocker OTP. Verification failed.', 'Verification Failed');
            }
        } catch (err) {
            toast.error(err.message, 'Verification Error');
        } finally {
            setIsVerifyingDigiLockerOtp(false);
        }
    };

    // --- PAN to GSTIN Lookup Handler ---
    const handleFetchGstin = async () => {
        if (!formData.panNumber || !formData.panNumber.trim()) {
            toast.error('Please enter a PAN Card Number first.', 'PAN Required');
            return;
        }

        const cleanPan = sanitizePanNumber(formData.panNumber);
        try {
            setIsFetchingGstin(true);
            const res = await fetch(API_ENDPOINTS.CREATORS.PAN_TO_GSTIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    panNumber: cleanPan,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data) {
                setGstinData(data.data);
                const count = data.data.count || (data.data.gstinList ? data.data.gstinList.length : 0);
                if (count > 0) {
                    toast.success(`Found ${count} registered GSTIN(s) for PAN ${cleanPan}!`, 'GSTIN Found');
                } else {
                    toast.info(`No GSTIN registered for PAN ${cleanPan}.`, 'GSTIN Lookup');
                }
            } else {
                toast.error(data.message || 'Failed to fetch GSTIN details for this PAN.', 'GSTIN Lookup Error');
            }
        } catch (err) {
            toast.error(err.message, 'GSTIN Lookup Error');
        } finally {
            setIsFetchingGstin(false);
        }
    };

    // --- STEP 2: PAN Verification Handler ---
    const handleVerifyPan = async () => {
        if (!formData.panNumber || !formData.panNumber.trim()) {
            toast.error('Please enter a PAN Card Number first.', 'PAN Required');
            return;
        }

        const cleanPan = sanitizePanNumber(formData.panNumber);
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(cleanPan)) {
            toast.error('Invalid PAN Card format. Must be 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).', 'Invalid Format');
            return;
        }

        if (cleanPan !== formData.panNumber) {
            setFormData(prev => ({ ...prev, panNumber: cleanPan }));
        }

        try {
            setIsVerifyingPan(true);
            const res = await fetch(API_ENDPOINTS.CREATORS.VERIFY_PAN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    panNumber: cleanPan,
                    name: formData.fullName,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data?.verified) {
                setPanVerificationData(data.data);
                const registeredName = data.data.registeredName || formData.fullName;

                toast.success(`PAN Card Verified! Holder: ${registeredName}`, 'PAN Verified');

                // If Aadhaar was already verified, trigger identity match
                if (aadhaarVerificationData?.verified) {
                    runIdentityMatch(registeredName, aadhaarVerificationData.registeredName);
                }
            } else {
                setPanVerificationData(null);
                toast.error(data.message || 'PAN Verification failed. PAN holder name must match registered creator name.', 'Verification Failed');
            }
        } catch (err) {
            toast.error(err.message, 'Verification Error');
        } finally {
            setIsVerifyingPan(false);
        }
    };

    // --- STEP 2: Aadhaar OKYC Step 1 (Send OTP) ---
    const handleSendAadhaarOtp = async () => {
        const cleanAadhaar = String(formData.aadhaarNumber || '').replace(/\D/g, '');
        if (!cleanAadhaar || cleanAadhaar.length !== 12) {
            toast.error('Please enter a valid 12-digit Aadhaar Card Number.', 'Aadhaar Required');
            return;
        }

        try {
            setIsSendingAadhaarOtp(true);
            const res = await fetch(API_ENDPOINTS.CREATORS.VERIFY_AADHAAR_SEND_OTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    aadhaarNumber: cleanAadhaar,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data?.refId) {
                setAadhaarRefId(data.data.refId);
                setAadhaarOtpSent(true);
                toast.success('Aadhaar OTP sent successfully to your registered mobile number!', 'OTP Sent');
            } else {
                toast.error(data.message || 'Failed to send Aadhaar OTP.', 'Aadhaar e-KYC Error');
            }
        } catch (err) {
            toast.error(err.message, 'OTP Error');
        } finally {
            setIsSendingAadhaarOtp(false);
        }
    };

    // --- STEP 2: Aadhaar OKYC Step 2 (Verify OTP) ---
    const handleVerifyAadhaarOtp = async () => {
        if (!aadhaarOtp || aadhaarOtp.trim().length < 4) {
            toast.error('Please enter the OTP received on your Aadhaar-linked mobile.', 'OTP Required');
            return;
        }

        try {
            setIsVerifyingAadhaarOtp(true);
            const res = await fetch(API_ENDPOINTS.CREATORS.VERIFY_AADHAAR_VERIFY_OTP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    otp: aadhaarOtp.trim(),
                    refId: aadhaarRefId,
                    aadhaarNumber: formData.aadhaarNumber,
                    name: panVerificationData?.registeredName || formData.fullName,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data?.verified) {
                setAadhaarVerificationData(data.data);
                const aadhaarName = data.data.registeredName || formData.fullName;

                toast.success(`Aadhaar e-KYC Verified! Name: ${aadhaarName}`, 'Aadhaar Verified');

                // Update date of birth if available from Aadhaar
                if (data.data.dob) {
                    setFormData(prev => ({
                        ...prev,
                        dateOfBirth: prev.dateOfBirth || data.data.dob,
                    }));
                }

                // If PAN was also verified, trigger backend identity match
                const panName = panVerificationData?.registeredName || formData.fullName;
                if (panVerificationData?.verified) {
                    runIdentityMatch(panName, aadhaarName);
                }
            } else {
                setAadhaarVerificationData(null);
                toast.error(data.message || 'Invalid Aadhaar OTP or name mismatch. Verification failed.', 'Verification Failed');
            }
        } catch (err) {
            toast.error(err.message, 'Verification Error');
        } finally {
            setIsVerifyingAadhaarOtp(false);
        }
    };

    // --- STEP 2: PAN + Aadhaar Backend Identity Matching ---
    const runIdentityMatch = async (panName, aadhaarName) => {
        try {
            setIsCheckingIdentityMatch(true);
            const res = await fetch(API_ENDPOINTS.CREATORS.MATCH_IDENTITY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    panName,
                    aadhaarName,
                    panDob: formData.dateOfBirth,
                    aadhaarDob: aadhaarVerificationData?.dob || formData.dateOfBirth,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data) {
                setIdentityMatchData(data.data);
                if (data.data.isMatch) {
                    toast.success('PAN and Aadhaar Identity Matched Successfully!', 'Identity Verified');
                    // Pre-fill verified name to legal name and bank holder
                    setFormData(prev => ({
                        ...prev,
                        fullName: aadhaarName || panName || prev.fullName,
                        accountHolderName: prev.accountHolderName || aadhaarName || panName,
                    }));
                } else {
                    toast.warning(data.data.message);
                }
            }
        } catch (err) {
            console.error('Identity match error:', err.message);
        } finally {
            setIsCheckingIdentityMatch(false);
        }
    };

    // --- STEP 3: Bank Account Verification (Penny Drop) ---
    const handleVerifyBank = async () => {
        if (!formData.accountNumber || !formData.ifscCode) {
            toast.error('Please enter both Account Number and IFSC Code.', 'Details Required');
            return;
        }

        const cleanIfsc = formData.ifscCode.trim().toUpperCase();
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(cleanIfsc)) {
            toast.error('Invalid IFSC Code format.', 'Invalid IFSC');
            return;
        }

        const verifiedIdentity = aadhaarVerificationData?.registeredName || panVerificationData?.registeredName || formData.accountHolderName || formData.fullName;

        try {
            setIsVerifyingBank(true);
            const res = await fetch(API_ENDPOINTS.CREATORS.VERIFY_BANK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    accountNumber: formData.accountNumber.trim(),
                    ifscCode: cleanIfsc,
                    name: formData.accountHolderName || verifiedIdentity,
                    verifiedIdentityName: verifiedIdentity,
                }),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data?.verified) {
                setBankVerificationData(data.data);
                if (data.data.bankName) {
                    setFormData(prev => ({
                        ...prev,
                        bankName: data.data.bankName,
                        accountHolderName: data.data.accountHolderName || prev.accountHolderName,
                    }));
                }
                if (data.data.isNameMatch) {
                    toast.success(`Bank Account Verified via Cashfree Penny Drop! (${data.data.bankName})`, 'Bank Verified');
                } else {
                    toast.warning('Bank Account valid, but account holder name differs from government identity. Flagged for manual review.', 'Manual Review');
                }
            } else {
                toast.error(data.message || 'Bank Account verification failed.', 'Cashfree Penny Drop');
            }
        } catch (err) {
            toast.error(err.message, 'Verification Error');
        } finally {
            setIsVerifyingBank(false);
        }
    };

    const [submittedKycResult, setSubmittedKycResult] = useState(null);

    useEffect(() => {
        const savedToken = getCreatorToken();
        const user = getCreatorUser();

        if (!savedToken || !user || !user.id) {
            window.location.href = '/';
            return;
        }

        setCreatorUser(user);
        setToken(savedToken);

        const rawName = (user.fullName || user.full_name || user.name || '').trim();
        const rawMobile = String(user.mobile || user.mobileNumber || user.phone || '').trim();

        let codePrefix = '+91';
        let numOnly = '';
        if (rawMobile) {
            const digits = rawMobile.replace(/\D/g, '');
            if (digits.length === 10) {
                numOnly = digits;
            } else if (digits.length > 10) {
                numOnly = digits.slice(-10);
                codePrefix = `+${digits.slice(0, digits.length - 10)}`;
            } else {
                numOnly = digits;
            }
        }

        const initialYtHandle = user.youtubeChannel || (user.username ? `@${user.username.replace(/^@+/, '')}` : '');

        setFormData(prev => {
            const currentLinks = [...(prev.socialLinks || [])];
            const ytIdx = currentLinks.findIndex(l => (l.platform || '').toLowerCase() === 'youtube');
            if (ytIdx >= 0) {
                if (!currentLinks[ytIdx].link && initialYtHandle) {
                    currentLinks[ytIdx] = { ...currentLinks[ytIdx], link: initialYtHandle };
                }
            } else if (initialYtHandle) {
                currentLinks.unshift({ platform: 'youtube', link: initialYtHandle });
            }
            return {
                ...prev,
                fullName: rawName || prev.fullName,
                accountHolderName: rawName || prev.accountHolderName,
                mobileNumber: numOnly || prev.mobileNumber,
                mobileCountryCode: codePrefix || prev.mobileCountryCode,
                socialLinks: currentLinks,
            };
        });

        if (rawName) {
            setIsNameLocked(true);
        }
        setIsMobileLocked(true); // Always keep verified mobile locked per requirements

        // Fetch creator profile to fill saved YouTube social links
        const fetchCreatorProfileLinks = async () => {
            try {
                const resProf = await fetch(API_ENDPOINTS.CREATORS.PROFILE, {
                    headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
                });
                if (resProf.ok) {
                    const profData = await resProf.json();
                    const links = profData.socialLinks || profData.data?.socialLinks || profData.data?.social_links || [];
                    const ytLinkRec = links.find(l => (l.platform || '').toLowerCase() === 'youtube');
                    const fetchedYtUrl = ytLinkRec?.profile_url || ytLinkRec?.url || initialYtHandle;
                    if (fetchedYtUrl) {
                        setFormData(prev => {
                            const currentLinks = [...(prev.socialLinks || [])];
                            const ytIdx = currentLinks.findIndex(l => (l.platform || '').toLowerCase() === 'youtube');
                            if (ytIdx >= 0) {
                                currentLinks[ytIdx] = { ...currentLinks[ytIdx], link: currentLinks[ytIdx].link || fetchedYtUrl };
                            } else {
                                currentLinks.unshift({ platform: 'youtube', link: fetchedYtUrl });
                            }
                            return { ...prev, socialLinks: currentLinks, youtubeUrl: fetchedYtUrl };
                        });
                    }
                }
            } catch (err) {
                console.warn('Profile links fetch note:', err.message);
            }
        };
        fetchCreatorProfileLinks();

        const checkKycStatus = async () => {
            try {
                setIsLoadingStatus(true);
                const creatorId = user.id;
                const res = await fetch(`${API_ENDPOINTS.CREATORS.KYC_STATUS}?creatorId=${creatorId}`, {
                    headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
                });
                const data = await res.json();

                if (res.ok && data.status === 'success' && data.data) {
                    const kycInfo = data.data;
                    const status = (kycInfo.kycStatus || '').toLowerCase();
                    setSubmittedKycResult(kycInfo);

                    if (status === 'approved') {
                        setFlowState('kyc_approved');
                    } else if (status === 'rejected') {
                        setFlowState('kyc_rejected');
                        setErrorMsg(kycInfo.rejectionReason || 'Identity document unclear or bank detail mismatch.');
                    } else if (status === 'manual_review') {
                        setFlowState('manual_review');
                    } else if (status === 'pending' || status === 'under_review') {
                        setFlowState('pending');
                    } else {
                        setFlowState('kyc_form');
                    }
                }
            } catch (err) {
                console.warn('KYC check notice:', err.message);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        // Check for DigiLocker Redirect Callback params
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const digiVerifId = urlParams.get('digilocker_verification_id') || urlParams.get('verification_id');
            if (digiVerifId) {
                setStep(2);
                handleVerifyDigiLockerCallback(digiVerifId);
            }
        }

        checkKycStatus();
    }, []);

    const handleInputChange = (field, value) => {
        let cleanValue = value;
        if (field === 'panNumber') {
            cleanValue = sanitizePanNumber(value);
        } else if (field === 'ifscCode') {
            cleanValue = sanitizeIfscCode(value);
        } else if (field === 'accountNumber' || field === 'confirmAccountNumber') {
            cleanValue = String(value || '').replace(/\D/g, '');
        } else if (field === 'aadhaarNumber') {
            cleanValue = String(value || '').replace(/\D/g, '').slice(0, 12);
        }
        setFormData(prev => ({ ...prev, [field]: cleanValue }));
        setErrorMsg('');
    };

    const validateStep1 = () => {
        if (!formData.fullName || !formData.fullName.trim()) {
            return 'Legal Full Name is required.';
        }

        const cleanMobile = String(formData.mobileNumber || '').replace(/\D/g, '');
        if (!cleanMobile || cleanMobile.length !== 10) {
            return 'Verified Mobile Number must be 10 digits.';
        }

        if (!formData.category || !formData.category.trim()) {
            return 'Please select a Stream Category.';
        }

        if (!formData.dateOfBirth) return 'Date of Birth is required.';

        // 18+ Age Restriction Validation
        const userAge = calculateAge(formData.dateOfBirth);
        if (userAge !== null && userAge < 18) {
            return 'Age Restriction: You must be at least 18 years old to register as a Creator and complete KYC.';
        }

        if (!formData.address.trim()) return 'Residential Address is required.';
        if (!formData.country.trim()) return 'Country is required.';
        if (!formData.state.trim()) return 'State is required.';
        if (!formData.city.trim()) return 'City is required.';
        return null;
    };

    const validateStep2 = () => {
        if (!panVerificationData?.verified) {
            return 'Please complete PAN Card verification via Cashfree first.';
        }
        if (!aadhaarVerificationData?.verified) {
            return 'Please complete Aadhaar verification via DigiLocker or Aadhaar OTP.';
        }
        if (aadhaarVerificationData?.dob) {
            const aadhaarAge = calculateAge(aadhaarVerificationData.dob);
            if (aadhaarAge !== null && aadhaarAge < 18) {
                return 'Underage Error: Verified Aadhaar identity indicates age under 18. KYC cannot be submitted.';
            }
        }
        return null;
    };

    const validateStep3 = () => {
        if (!formData.accountHolderName.trim()) return 'Bank Account Holder Name is required.';
        if (!formData.bankName.trim()) return 'Bank Name is required.';
        if (!formData.accountNumber.trim()) return 'Account Number is required.';
        if (!formData.confirmAccountNumber || !formData.confirmAccountNumber.trim()) {
            return 'Confirmation Account Number is required.';
        }
        if (formData.accountNumber.trim() !== formData.confirmAccountNumber.trim()) {
            return 'Account Number and Confirmation Account Number do not match.';
        }
        if (!formData.ifscCode.trim()) return 'IFSC Code is required.';

        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        const cleanIfsc = formData.ifscCode.trim().toUpperCase();
        if (!ifscRegex.test(cleanIfsc)) {
            return 'Invalid IFSC Code format. E.g. SBIN0001234 or HDFC0000240.';
        }

        if (!bankVerificationData?.verified) {
            return 'Please verify your bank account details via Cashfree Penny Drop before proceeding.';
        }

        return null;
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (step === 1) {
            const err = validateStep1();
            if (err) {
                setErrorMsg(err);
                toast.error(err, 'Validation Error');
                return;
            }
            setErrorMsg('');
            setStep(2);
        } else if (step === 2) {
            const err = validateStep2();
            if (err) {
                setErrorMsg(err);
                toast.error(err, 'Validation Error');
                return;
            }
            setErrorMsg('');
            setStep(3);
        } else if (step === 3) {
            const err = validateStep3();
            if (err) {
                setErrorMsg(err);
                toast.error(err, 'Validation Error');
                return;
            }
            setErrorMsg('');
            setStep(4);
        }
    };

    const handleSubmitKyc = async (e) => {
        e.preventDefault();
        if (!formData.agreeTerms || !agreeEula) {
            setErrorMsg('Please read and accept the AskMe EULA Agreement & legal declaration to proceed.');
            toast.error('Please accept both the AskMe EULA Agreement and identity declaration before submitting KYC.', 'Legal Agreement Required');
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMsg('');
            const creatorId = creatorUser?.id;

            const dynamicLinks = (formData.socialLinks || [])
                .filter(s => s.link && s.link.trim())
                .map(s => ({
                    platform: s.platform,
                    link: s.link.trim(),
                }));

            const staticLinks = [
                { platform: 'youtube', link: formData.youtubeUrl },
                { platform: 'instagram', link: formData.instagramUrl },
                { platform: 'linkedin', link: formData.linkedinUrl },
                { platform: 'facebook', link: formData.facebookUrl },
                { platform: 'twitch', link: formData.twitchUrl },
            ].filter(s => s.link && s.link.trim());

            const finalSocialLinks = dynamicLinks.length > 0 ? dynamicLinks : staticLinks;

            const payload = {
                creatorId,
                fullName: aadhaarVerificationData?.registeredName || panVerificationData?.registeredName || formData.fullName,
                mobileNumber: `${formData.mobileCountryCode} ${formData.mobileNumber}`,
                category: formData.category,
                socialMediaUrl: formData.socialMediaUrl,
                socialLinks: finalSocialLinks,
                dateOfBirth: aadhaarVerificationData?.dob || formData.dateOfBirth,
                address: aadhaarVerificationData?.address || formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country || 'India',
                pincode: formData.pincode,

                // PAN Info
                panNumber: panVerificationData?.panNumber || formData.panNumber,
                panHolderName: panVerificationData?.registeredName || '',
                panReferenceId: panVerificationData?.referenceId || '',
                panStatus: panVerificationData?.verified ? 'verified' : 'pending',

                // Aadhaar OKYC Info
                documentType: 'pan_card',
                aadhaarMasked: aadhaarVerificationData?.maskedAadhaar || `XXXXXXXX${formData.aadhaarNumber.slice(-4)}`,
                aadhaarName: aadhaarVerificationData?.registeredName || '',
                aadhaarDob: aadhaarVerificationData?.dob || formData.dateOfBirth,
                aadhaarReferenceId: aadhaarVerificationData?.referenceId || '',

                // Bank Details
                accountHolderName: formData.accountHolderName,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                upiId: formData.upiId,
                bankVerificationStatus: bankVerificationData?.verified ? 'verified' : 'pending',
            };

            const response = await fetch(API_ENDPOINTS.CREATORS.SUBMIT_KYC, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok && (data.status === 'success' || data.data)) {
                setSubmittedKycResult(data.data);
                const resultStatus = data.data?.kycStatus || 'pending';

                if (resultStatus === 'manual_review') {
                    setFlowState('manual_review');
                    toast.warning('KYC submitted! Details flagged for manual review due to name mismatch.', 'Manual Review');
                } else {
                    setFlowState('pending');
                    toast.success('KYC Documents & Bank Details verified and submitted successfully!', 'KYC Submitted');
                }
            } else {
                const msg = data.message || 'KYC submission failed. Please check details.';
                setErrorMsg(msg);
                toast.error(msg, 'KYC Submission Failed');
            }
        } catch (err) {
            const msg = 'Unable to connect to backend server. Please try again.';
            setErrorMsg(msg);
            toast.error(msg, 'Connection Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
            }`}>

            {/* Landing Page Style Floating Capsule Header */}
            <header className="fixed top-0 left-0 right-0 z-50 py-3 px-2 sm:px-4 lg:px-6">
                <div className={`max-w-7xl mx-auto rounded-full backdrop-blur-md border py-2 px-4 sm:px-6 shadow-2xl flex items-center justify-between gap-3 transition-colors ${theme === 'light'
                    ? 'bg-white/90 border-[#DEE2E6] text-[#1A1D20]'
                    : 'bg-[#0F0F18]/90 border-[#202030] text-white'
                    }`}>
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                        <Logo size="sm" />
                        <div className="flex flex-col leading-none">
                            <span className={`font-heading font-black text-[15px] tracking-tight ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                }`}>
                                AskMe
                            </span>
                            <span className="text-[8px] font-bold text-[#6E6E80] tracking-wider uppercase mt-0.5">
                                DISCOVER • GROW • ENGAGE
                            </span>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-[13px] font-bold shadow-lg shadow-[#EB1000]/30 hover:opacity-90 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6 pt-25 sm:pt-20 lg:pt-25 pb-12">

                {isLoadingStatus ? (
                    <div className="p-12 text-center space-y-3">
                        <Clock className="h-8 w-8 text-[#00F5D4] animate-spin mx-auto" />
                        <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                            }`}>Checking Creator KYC Status...</p>
                    </div>
                ) : flowState === 'kyc_approved' ? (
                    /* --- 1. APPROVED SCREEN --- */
                    <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 animate-scale-up ${theme === 'light'
                        ? 'bg-white border-[#00E676]/40'
                        : 'bg-[#13131A] border-[#00E676]/30'
                        }`}>
                        <div className={`flex items-center gap-4 border-b pb-6 ${theme === 'light'
                            ? 'border-[#E9ECEF]'
                            : 'border-[#1C1C26]'
                            }`}>
                            <div className="p-3.5 rounded-2xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 shrink-0">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>


                            <div>


                                <h2 className={`font-heading font-black text-2xl mt-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                    }`}>
                                    Your Application is Under Review                                </h2>

                                <p className={`text-sm mt-1 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                    }`}>
                                    Your identity verification has been successfully completed.
                                    Our admin team is now reviewing your application. You will be
                                    notified once the final review is completed.
                                </p>
                            </div>
                        </div>



                        {/* <div className="pt-2">
    <Link
        href="/creators/dashboard"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] text-black font-extrabold text-xs shadow-md hover:opacity-95 transition inline-flex items-center gap-2"
    >
        <ShieldCheck className="h-4 w-4" />
        Go to Creator Dashboard
    </Link>
</div> */}

                    </div>

                ) :
                    (flowState === 'pending' || flowState === 'kyc_submitted') ? (
                        /* --- SUBMITTED & PENDING SCREEN --- */
                        <div className={`p-6 sm:p-10 rounded-3xl border shadow-2xl space-y-8 animate-scale-up relative overflow-hidden transition-all duration-300 ${theme === 'light'
                            ? 'bg-gradient-to-br from-white via-[#FFFDF5] to-white border-[#FFD60A]/40'
                            : 'bg-gradient-to-br from-[#12121A] via-[#1A1A24] to-[#12121A] border-[#FFD60A]/30'
                            }`}>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-6 border-current/10">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 rounded-2xl bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30 shrink-0 shadow-lg relative">
                                        <Clock className="h-8 w-8 animate-spin" />
                                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#FFD60A] animate-ping" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-3 py-1 rounded-full bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                <span className="h-2 w-2 rounded-full bg-[#FFD60A] animate-pulse" />
                                                KYC APPLICATION UNDER REVIEW
                                            </span>
                                            <span className={`text-xs font-mono px-2.5 py-0.5 rounded-md border ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#6C757D]' : 'bg-[#181824] border-[#262636] text-[#8B8B96]'
                                                }`}>
                                                ID: #{submittedKycResult?.id || creatorUser?.id || '8839'}
                                            </span>
                                        </div>

                                        <h2 className={`font-heading font-black text-2xl sm:text-3xl tracking-tight ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                            }`}>
                                            Verification Pending Admin Approval
                                        </h2>
                                        <p className={`text-xs max-w-xl leading-relaxed ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                            }`}>
                                            Your PAN Card, Aadhaar e-KYC, and bank payout details have been submitted to the compliance team for final approval.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        toast.info('Checking latest KYC verification status...', 'Status Check');
                                        window.location.reload();
                                    }}
                                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${theme === 'light'
                                        ? 'bg-[#F1F3F5] text-[#1A1D20] border-[#DEE2E6] hover:bg-[#E9ECEF]'
                                        : 'bg-[#181826] text-white border-[#262636] hover:border-[#00F5D4]/40'
                                        }`}
                                >
                                    <RefreshCw className="h-4 w-4 text-[#00F5D4]" />
                                    Check Status
                                </button>
                            </div>

                            {/* Audit Progress Timeline */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${theme === 'light' ? 'bg-white border-[#00E676]/30' : 'bg-[#181824] border-[#00E676]/30'}`}>
                                    <div className="p-2.5 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 shrink-0">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block">Completed</span>
                                        <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>1. Cashfree e-KYC Verified</h4>
                                        <p className="text-[11px] text-[#8B8B96]">PAN & Aadhaar match passed</p>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-2xl border flex items-center gap-3 relative ${theme === 'light' ? 'bg-[#FFD60A]/10 border-[#FFD60A]/50' : 'bg-[#FFD60A]/10 border-[#FFD60A]/40'}`}>
                                    <div className="p-2.5 rounded-xl bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/40 shrink-0">
                                        <Clock className="h-5 w-5 animate-spin" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold text-[#FFD60A] uppercase tracking-wider block">In Progress</span>
                                        <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>2. Admin Final Approval</h4>
                                        <p className="text-[11px] text-[#FFD60A]">Compliance team review</p>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-2xl border flex items-center gap-3 opacity-60 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#14141E] border-[#222230]'}`}>
                                    <div className={`p-2.5 rounded-xl border shrink-0 ${theme === 'light' ? 'bg-white border-[#DEE2E6] text-[#8B8B96]' : 'bg-[#1C1C28] border-[#2A2A3A] text-[#8B8B96]'}`}>
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-[#8B8B96] uppercase tracking-wider block">Final Step</span>
                                        <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>3. Dashboard Access</h4>
                                        <p className="text-[11px] text-[#8B8B96]">Instant Creator Studio access</p>
                                    </div>
                                </div>
                            </div>

                            {/* Security & Audit SLA Notice Banner */}
                            <div className={`p-4 rounded-2xl border flex items-center gap-3 relative z-10 ${theme === 'light' ? 'bg-[#EBFBFA] border-[#00F5D4]/40 text-[#007A6B]' : 'bg-[#00F5D4]/10 border-[#00F5D4]/30 text-[#00F5D4]'
                                }`}>
                                <Sparkles className="h-5 w-5 shrink-0 stroke-[2]" />
                                <div className="text-xs leading-relaxed">
                                    <strong>Estimated SLA:</strong> Final admin approval is typically completed within <strong>2 to 24 hours</strong>.
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- 4-STEP KYC WIZARD --- */
                        <div className={`p-6 sm:p-8 md:p-10 rounded-3xl border shadow-2xl space-y-6 sm:space-y-8 relative overflow-hidden transition-all duration-300 ${theme === 'light'
                            ? 'bg-white border-[#E2E8F0] shadow-slate-200/60'
                            : 'bg-[#12121C]/95 backdrop-blur-xl border-[#222236] shadow-black/80'
                            }`}>
                            {/* Gradient Top Accent Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EB1000] via-[#FF5500] to-[#00F5D4]" />

                            {/* Top Header */}
                            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-5 ${theme === 'light' ? 'border-[#E2E8F0]' : 'border-[#222236]'
                                }`}>
                                <div>
                                    <h2 className={`font-heading font-black text-xl sm:text-2xl tracking-tight ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'
                                        }`}>
                                        Creator KYC Identity Verification
                                    </h2>
                                    <p className={`text-xs mt-1 font-medium ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'
                                        }`}>
                                        PAN, Aadhaar e-KYC, and Bank Account verification.
                                    </p>
                                </div>
                                <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 text-xs font-black shrink-0 flex items-center gap-1.5 shadow-sm">
                                    <span className="h-2 w-2 rounded-full bg-[#EB1000] animate-pulse" />
                                    Step {step} of 4
                                </span>
                            </div>

                            {/* Stepper Navigation Tabs */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <button
                                    onClick={() => setStep(1)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${step === 1
                                        ? 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white shadow-lg shadow-[#EB1000]/30 scale-[1.02]'
                                        : theme === 'light'
                                            ? 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                                            : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E] hover:bg-[#202030] hover:text-white'
                                        }`}
                                >
                                    <User className="h-4 w-4 shrink-0" /> 1. Personal Info
                                </button>
                                <button
                                    onClick={() => step > 1 && setStep(2)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${step === 2
                                        ? 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white shadow-lg shadow-[#EB1000]/30 scale-[1.02]'
                                        : theme === 'light'
                                            ? 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                                            : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E] hover:bg-[#202030] hover:text-white'
                                        }`}
                                >
                                    <FileText className="h-4 w-4 shrink-0" /> 2. Document Proof
                                </button>
                                <button
                                    onClick={() => step > 2 && setStep(3)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${step === 3
                                        ? 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white shadow-lg shadow-[#EB1000]/30 scale-[1.02]'
                                        : theme === 'light'
                                            ? 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                                            : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E] hover:bg-[#202030] hover:text-white'
                                        }`}
                                >
                                    <Building2 className="h-4 w-4 shrink-0" /> 3. Bank Details
                                </button>
                                <button
                                    onClick={() => step > 3 && setStep(4)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${step === 4
                                        ? 'bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white shadow-lg shadow-[#EB1000]/30 scale-[1.02]'
                                        : theme === 'light'
                                            ? 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                                            : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E] hover:bg-[#202030] hover:text-white'
                                        }`}
                                >
                                    <CheckCircle2 className="h-4 w-4 shrink-0" /> 4. Review & Submit
                                </button>
                            </div>

                            {/* STEP 1: Personal Information */}
                            {step === 1 && (
                                <form onSubmit={handleNextStep} className="space-y-5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="p-2 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20 shrink-0">
                                            <User className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <h3 className={`font-extrabold text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                Step 1 — Personal Information
                                            </h3>
                                            <p className="text-[11px] text-[#8B8B96]">Mobile number is pre-verified from Creator Registration.</p>
                                        </div>
                                    </div>

                                    {/* Row 1: Legal Full Name & Date of Birth */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className={`block text-xs font-extrabold ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                    Legal Full Name (Matching PAN/ID) *
                                                </label>
                                                {isNameLocked && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                                        <Lock className="h-3 w-3" /> Pre-filled & Locked
                                                    </span>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                readOnly={isNameLocked}
                                                value={formData.fullName}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                placeholder="e.g. Abhishek Raushan"
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                    ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    }`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                Date of Birth *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                max={new Date().toISOString().split('T')[0]}
                                                value={formData.dateOfBirth || ''}
                                                onClick={(e) => {
                                                    try { e.target.showPicker(); } catch (err) { }
                                                }}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 cursor-pointer ${theme === 'light'
                                                    ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    }`}
                                            />
                                            <span className="text-[10px] text-[#00F5D4] mt-1 block font-medium flex items-center gap-1">
                                                ⚡ 18+ Age Requirement: Must be at least 18 years old (Verified against Aadhaar Govt ID).
                                            </span>
                                        </div>
                                    </div>

                                    {/* Row 2: Verified Mobile Number (Locked) & Stream Category */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className={`block text-xs font-extrabold ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                    Verified Mobile Number *
                                                </label>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/30">
                                                    <CheckCircle2 className="h-3 w-3" /> Pre-Verified (Locked)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`px-3 py-3 rounded-xl border text-xs font-mono font-bold ${theme === 'light' ? 'bg-[#E2E8F0]/60 border-[#CBD5E1] text-[#475569]' : 'bg-[#12121C] border-[#2A2A3E] text-[#94A3B8]'}`}>
                                                    🇮🇳 +91
                                                </div>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="tel"
                                                        readOnly
                                                        disabled
                                                        value={formData.mobileNumber}
                                                        className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-mono font-bold cursor-not-allowed ${theme === 'light'
                                                            ? 'bg-[#E2E8F0]/60 border-[#CBD5E1] text-[#475569]'
                                                            : 'bg-[#12121C] border-[#2A2A3E] text-[#94A3B8]'
                                                            }`}
                                                    />
                                                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00E676] pointer-events-none" />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-[#8B8B96] block mt-1">Verified during Creator Registration. Locked for security.</span>
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                Stream Category *
                                            </label>
                                            <select
                                                required
                                                value={formData.categorySelect || (['Gaming', 'Politics', 'Technology', 'Finance', 'Entertainment', 'Education'].includes(formData.category) ? formData.category : (formData.category ? 'Other' : ''))}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'Other') {
                                                        setFormData(prev => ({ ...prev, categorySelect: 'Other', category: prev.customCategory || '' }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, categorySelect: val, category: val, customCategory: '' }));
                                                    }
                                                }}
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                    ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    }`}
                                            >
                                                <option value="">Select Stream Category...</option>
                                                <option value="Gaming">Gaming</option>
                                                <option value="Politics">Politics</option>
                                                <option value="Technology">Technology</option>
                                                <option value="Finance">Finance</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Education">Education</option>
                                                <option value="Other">Other (Type manually...)</option>
                                            </select>

                                            {(formData.categorySelect === 'Other' || (!['Gaming', 'Politics', 'Technology', 'Finance', 'Entertainment', 'Education', ''].includes(formData.category) && formData.category !== '')) && (
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.customCategory || (['Gaming', 'Politics', 'Technology', 'Finance', 'Entertainment', 'Education', ''].includes(formData.category) ? '' : formData.category)}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData(prev => ({ ...prev, customCategory: val, category: val }));
                                                    }}
                                                    placeholder="Enter custom stream category..."
                                                    className={`w-full mt-2 px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                        ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                        : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Social Media Links */}
                                    <div className={`p-4 rounded-2xl border space-y-3 ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826]/70 border-[#2A2A3E]'}`}>
                                        <div className="flex items-center justify-between border-b pb-2 border-current/10">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-[#EB1000]" />
                                                <h4 className={`font-extrabold text-xs ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                    Social Media & Channel Links
                                                </h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAddSocialLink}
                                                className="text-[11px] font-extrabold text-[#EB1000] hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                + Add Link
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {(formData.socialLinks || []).map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <div className="w-full sm:w-48 shrink-0">
                                                        <select
                                                            value={item.platform}
                                                            onChange={(e) => handleUpdateSocialLink(idx, 'platform', e.target.value)}
                                                            className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none font-semibold transition ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                                        >
                                                            {socialPlatforms.map(p => (
                                                                <option key={p.value} value={p.value}>
                                                                    {p.icon} {p.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={item.link}
                                                            onChange={(e) => handleUpdateSocialLink(idx, 'link', e.target.value)}
                                                            placeholder={`Channel handle or URL (e.g. @${String(creatorUser?.username || 'creator').replace(/^@+/, '')})...`}
                                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition font-mono ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                                        />
                                                        {(formData.socialLinks || []).length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveSocialLink(idx)}
                                                                className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${theme === 'light' ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B] hover:text-[#EF4444]' : 'bg-[#1C1C26] border-[#2A2A3E] text-[#8B8B96] hover:text-[#FF5252]'}`}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                            Residential Address *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="Flat / House No. / Street Address / Area"
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                Country *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.country || ''}
                                                onChange={(e) => handleInputChange('country', e.target.value)}
                                                placeholder="e.g. India"
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.state || ''}
                                                onChange={(e) => handleInputChange('state', e.target.value)}
                                                placeholder="e.g. Delhi / Maharashtra"
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.city || ''}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                                placeholder="e.g. New Delhi / Mumbai"
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                            <span>Continue to Document Proof</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* STEP 2: Document Proof (Unified Single Form Page) */}
                            {step === 2 && (
                                <form onSubmit={handleNextStep} className="space-y-6">
                                    {/* Step Header */}
                                    <div className="flex items-center gap-3">
                                        <span className="p-2.5 rounded-2xl bg-[#EB1000]/10 text-[#FF3B30] border border-[#EB1000]/20 shrink-0 shadow-sm">
                                            <FileText className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h3 className={`font-black text-base tracking-tight ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                Step 2 — Verification
                                            </h3>
                                            <p className="text-xs text-[#94A3B8] font-medium">Verify your PAN card & complete Aadhaar e-KYC via DigiLocker.</p>
                                        </div>
                                    </div>

                                    {/* SECTION 1: PAN CARD VERIFICATION */}
                                    <div className={`p-6 rounded-3xl border space-y-4 transition-all ${theme === 'light' ? 'bg-white border-[#E2E8F0]' : 'bg-[#141422] border-[#26263A]'}`}>
                                        <div className="flex items-center justify-between border-b pb-3 border-current/10">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-[#FF3B30]" />
                                                <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                    1. PAN Card Verification
                                                </h4>
                                            </div>
                                            {panVerificationData?.verified ? (
                                                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> PAN Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                                    Required
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-xs font-extrabold mb-2 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                    PAN Number (10 Digits) *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        maxLength={10}
                                                        required
                                                        value={formData.panNumber}
                                                        onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                                                        placeholder="e.g. ABCDE1234F"
                                                        className={`w-full px-4 py-3.5 rounded-xl border text-xs outline-none font-mono uppercase font-bold tracking-wider pr-28 transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A] focus:border-[#FF3B30]' : 'bg-[#0B0B12] border-[#26263A] text-white focus:border-[#FF3B30]'
                                                            }`}
                                                    />
                                                    {panVerificationData?.verified ? (
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold flex items-center gap-1.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleVerifyPan}
                                                            disabled={isVerifyingPan || !formData.panNumber}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF3B30] to-[#EB1000] hover:from-[#FF4D43] hover:to-[#FF1A0A] shadow-md shadow-[#EB1000]/25 text-white text-[11px] font-extrabold transition shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            {isVerifyingPan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className={`block text-xs font-extrabold mb-2 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                    Name (as per PAN)
                                                </label>
                                                <input
                                                    type="text"
                                                    readOnly={!!panVerificationData?.registeredName}
                                                    value={panVerificationData?.registeredName || formData.fullName}
                                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                    placeholder="Rohit Kumar"
                                                    className={`w-full px-4 py-3.5 rounded-xl border text-xs outline-none font-medium ${theme === 'light' ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]' : 'bg-[#0B0B12] border-[#26263A] text-white'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Green Verified Alert Notice */}
                                        {panVerificationData?.verified && (
                                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1 text-xs">
                                                <div className="font-extrabold flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                                                    <span>PAN verified successfully</span>
                                                </div>
                                                <p className="text-xs opacity-90 pl-6 text-emerald-300">
                                                    You can now proceed to Aadhaar verification using DigiLocker below.
                                                </p>
                                            </div>
                                        )}

                                        {/* PAN to GSTIN Lookup */}
                                        {formData.panNumber && formData.panNumber.length === 10 && (
                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={handleFetchGstin}
                                                    disabled={isFetchingGstin}
                                                    className={`w-full py-3 px-4 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${theme === 'light'
                                                        ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A] hover:bg-[#E2E8F0]'
                                                        : 'bg-[#1A1A2A] border-[#2E2E44] text-white hover:bg-[#222238]'
                                                        }`}
                                                >
                                                    {isFetchingGstin ? (
                                                        <><RefreshCw className="h-4 w-4 animate-spin" /> Fetching Registered GSTINs...</>
                                                    ) : (
                                                        <><Building2 className="h-4 w-4 text-[#00F5D4]" /> Fetch Registered GSTINs (PAN to GSTIN)</>
                                                    )}
                                                </button>

                                                {gstinData && (
                                                    <div className="mt-3 p-4 rounded-2xl border bg-[#0B0B12] border-[#26263A] space-y-2.5 text-xs">
                                                        <div className="flex items-center justify-between text-[#00F5D4] font-bold text-xs">
                                                            <span>Registered GSTIN Details ({gstinData.count || 0})</span>
                                                            <span className="text-gray-400 font-mono">PAN: {gstinData.pan}</span>
                                                        </div>
                                                        {gstinData.gstinList && gstinData.gstinList.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {gstinData.gstinList.map((item, idx) => (
                                                                    <div key={idx} className="p-3 rounded-xl bg-[#141422] border border-[#26263A] flex items-center justify-between text-xs">
                                                                        <div>
                                                                            <span className="font-mono font-bold text-white block">{item.gstin}</span>
                                                                            <span className="text-[#94A3B8] text-[11px]">{item.businessName} &bull; {item.state}</span>
                                                                        </div>
                                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                                                                            {item.status || 'Active'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-400">No active GSTIN registration found for this PAN card.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* SECTION 2: DIGILOCKER AADHAAR VERIFICATION */}
                                    <div className={`p-6 rounded-3xl border space-y-5 transition-all ${theme === 'light' ? 'bg-white border-[#E2E8F0]' : 'bg-[#141422] border-[#26263A]'}`}>
                                        <div className="flex items-center justify-between border-b pb-3 border-current/10">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-[#FF3B30]" />
                                                <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                    2.Aadhaar Verification
                                                </h4>
                                            </div>
                                            {aadhaarVerificationData?.verified ? (
                                                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Aadhaar Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                                    Required
                                                </span>
                                            )}
                                        </div>

                                        {!aadhaarVerificationData?.verified ? (
                                            <div className="space-y-5">
                                                {/* DigiLocker Banner Card */}
                                                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#180A0C] via-[#161624] to-[#0F172A] border border-[#EB1000]/30 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                                                            <Sparkles className="h-4 w-4 text-[#FF3B30]" />
                                                            <span>Verify your Aadhaar with DigiLocker</span>
                                                        </div>
                                                        <span className="text-[10px] font-extrabold text-[#FF3B30] bg-[#EB1000]/10 px-2.5 py-1 rounded-full border border-[#EB1000]/30">
                                                            Recommended
                                                        </span>
                                                    </div>
                                                    {/* <p className="text-xs text-[#94A3B8] leading-relaxed">
                                                        Seamless and secure way to share your verified government documents directly from DigiLocker.
                                                    </p> */}

                                                    <div>
                                                        <label className="block text-xs font-extrabold mb-2 text-white">
                                                            Aadhaar Number (12 Digits) *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={12}
                                                            required
                                                            value={formData.aadhaarNumber || ''}
                                                            onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                                                            placeholder="e.g. 123456789012"
                                                            className="w-full px-4 py-3.5 rounded-xl border border-[#26263A] bg-[#0B0B12] text-white text-sm outline-none font-mono font-bold tracking-widest focus:border-[#FF3B30]"
                                                        />
                                                    </div>

                                                    {/* Consent Checkbox */}
                                                    <div className="pt-1">
                                                        <label className="flex items-center gap-3 text-xs text-gray-300 font-medium cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={digiConsentAgreed}
                                                                onChange={(e) => setDigiConsentAgreed(e.target.checked)}
                                                                className="w-4 h-4 rounded text-[#FF3B30] focus:ring-[#FF3B30] accent-[#FF3B30] border-gray-600 bg-gray-900 cursor-pointer"
                                                            />
                                                            <span>I agree to share my verified Aadhaar details with AskMe</span>
                                                        </label>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!digiConsentAgreed) {
                                                                    toast.error('Please accept consent to proceed.', 'Consent Required');
                                                                    return;
                                                                }
                                                                if (formData.aadhaarNumber && formData.aadhaarNumber.length === 12) {
                                                                    await handleSendDigiLockerOtp();
                                                                } 
                                                            }}
                                                            disabled={!digiConsentAgreed || isSendingDigiLockerOtp || isInitiatingDigiLocker}
                                                            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF3B30] via-[#EB1000] to-[#C90D00] hover:from-[#FF4D43] hover:to-[#EB1000] text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#EB1000]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                                        >
                                                            {isSendingDigiLockerOtp || isInitiatingDigiLocker ? (
                                                                <><RefreshCw className="h-4 w-4 animate-spin" /> Connecting to DigiLocker...</>
                                                            ) : (
                                                                <><ShieldCheck className="h-4 w-4" /> Verify </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* DigiLocker OTP Input Box */}
                                                    {showDigiLockerOtpBox && (
                                                        <div className="p-5 rounded-2xl border border-[#00F5D4]/40 bg-[#00F5D4]/5 space-y-4 mt-3 animate-scale-up">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-xs font-extrabold text-[#00F5D4] flex items-center gap-2">
                                                                    <KeyRound className="h-4 w-4" /> Enter 6-Digit DigiLocker Aadhaar OTP
                                                                </label>
                                                                <span className="text-[11px] text-gray-400">Sent to Aadhaar linked mobile</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[11px] font-bold text-gray-300 block mb-1">DigiLocker OTP *</label>
                                                                    <input
                                                                        type="text"
                                                                        maxLength={6}
                                                                        value={digiLockerOtp}
                                                                        onChange={(e) => setDigiLockerOtp(e.target.value.replace(/\D/g, ''))}
                                                                        placeholder="6-digit OTP"
                                                                        className="w-full px-3 py-2.5 rounded-xl border border-[#2A2A3E] bg-[#101018] text-white text-xs font-mono font-bold text-center outline-none focus:border-[#00F5D4]"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[11px] font-bold text-gray-300 block mb-1">DigiLocker PIN (Optional)</label>
                                                                    <input
                                                                        type="password"
                                                                        maxLength={6}
                                                                        value={digiLockerPin}
                                                                        onChange={(e) => setDigiLockerPin(e.target.value.replace(/\D/g, ''))}
                                                                        placeholder="6-digit PIN"
                                                                        className="w-full px-3 py-2.5 rounded-xl border border-[#2A2A3E] bg-[#101018] text-white text-xs font-mono font-bold text-center outline-none focus:border-[#00F5D4]"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={handleVerifyDigiLockerOtp}
                                                                disabled={isVerifyingDigiLockerOtp || digiLockerOtp.length < 4}
                                                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-black text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                                            >
                                                                {isVerifyingDigiLockerOtp ? (
                                                                    <><RefreshCw className="h-4 w-4 animate-spin" /> Verifying DigiLocker Identity...</>
                                                                ) : (
                                                                    <><Check className="h-4 w-4 stroke-[3]" /> Verify DigiLocker Aadhaar OTP</>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-xs text-[#94A3B8] pt-1">
                                                        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                                                        <span>Your data is safe and secure. We only access what you consent to.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Aadhaar Verification Success Summary Box */
                                            <div className="space-y-4">
                                                <div className="p-5 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] space-y-3">
                                                    <div className="flex items-center gap-2.5 text-sm font-black">
                                                        <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
                                                        <span>Aadhaar Verified Successfully via DigiLocker</span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left pt-1">
                                                        <div className="p-3 rounded-xl bg-[#0B0B12] border border-[#26263A] text-white">
                                                            <span className="text-gray-400 text-[10px] block font-medium uppercase">Verified Name</span>
                                                            <span className="font-extrabold text-xs uppercase tracking-wide">{aadhaarVerificationData?.registeredName || panVerificationData?.registeredName || formData.fullName}</span>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-[#0B0B12] border border-[#26263A] text-white">
                                                            <span className="text-gray-400 text-[10px] block font-medium uppercase">DOB & Gender</span>
                                                            <span className="font-extrabold text-xs">{aadhaarVerificationData?.dob || formData.dateOfBirth || '15-08-1998'} &bull; {aadhaarVerificationData?.gender || 'Male'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs font-bold pt-1">
                                                        <Lock className="w-4 h-4 text-[#00E676] shrink-0" />
                                                        <span>Identity matched with your provided details.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Step Navigation Footer */}
                                    <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className={`w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${theme === 'light'
                                                ? 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                                                : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E]'
                                                }`}
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Back to Personal Info
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!panVerificationData?.verified || !aadhaarVerificationData?.verified}
                                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#EB1000] hover:from-[#FF4D43] hover:to-[#FF1A0A] text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <span>Continue to Bank Details</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* STEP 3: Bank Details */}
                            {step === 3 && (
                                <form onSubmit={handleNextStep} className="space-y-5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="p-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/20 shrink-0">
                                            <Building2 className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <h3 className={`font-extrabold text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                Step 3 — Bank Account Details (Cashfree Penny Drop)
                                            </h3>
                                            <p className="text-[11px] text-[#8B8B96]">Bank account holder name will be verified against your verified government identity.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                            Bank Account Holder Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.accountHolderName}
                                            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                                            placeholder="e.g. Abhishek Raushan"
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000]'
                                                }`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                Bank Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.bankName}
                                                onChange={(e) => handleInputChange('bankName', e.target.value)}
                                                placeholder="e.g. HDFC Bank / ICICI Bank"
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                Account Number *
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                required
                                                value={formData.accountNumber}
                                                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                                placeholder="e.g. 50100298410294"
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-mono ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                Confirmation Account Number *
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                required
                                                value={formData.confirmAccountNumber || ''}
                                                onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                                                placeholder="Re-enter account number"
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-mono ${formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                                                    ? 'border-[#FF3D71] bg-[#FF3D71]/10 text-[#FF3D71]'
                                                    : theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className={`block text-xs font-extrabold ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                    IFSC Code *
                                                </label>
                                                {bankVerificationData?.verified ? (
                                                    <span className="text-[10px] font-extrabold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/30 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Bank Verified
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleVerifyBank}
                                                        disabled={isVerifyingBank || !formData.accountNumber || !formData.ifscCode}
                                                        className="text-[11px] font-extrabold text-[#EB1000] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {isVerifyingBank ? (
                                                            <>
                                                                <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShieldCheck className="h-3 w-3" /> Cashfree Penny Drop
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    maxLength={11}
                                                    required
                                                    value={formData.ifscCode}
                                                    onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                                    placeholder="e.g. SBIN0001234"
                                                    className={`flex-1 px-4 py-3 rounded-xl border text-xs outline-none font-mono uppercase ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'}`}
                                                />
                                                {!bankVerificationData?.verified && (
                                                    <button
                                                        type="button"
                                                        onClick={handleVerifyBank}
                                                        disabled={isVerifyingBank || !formData.accountNumber || !formData.ifscCode}
                                                        className="px-4 py-3 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 hover:bg-[#EB1000]/20 text-xs font-black shrink-0 transition cursor-pointer"
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {bankVerificationData?.verified && (
                                        <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${bankVerificationData.isNameMatch
                                            ? theme === 'light' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                                            : theme === 'light' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/30 border-amber-500/40 text-amber-400'
                                            }`}>
                                            <div className="font-extrabold flex items-center gap-1.5">
                                                <Check className="h-4 w-4" /> Bank Account Verified: {bankVerificationData.bankName}
                                            </div>
                                            <div className="text-[11px]">
                                                Account Holder: <strong>{bankVerificationData.accountHolderName}</strong> &bull; Match: <strong>{bankVerificationData.isNameMatch ? '✓ Verified Match' : '⚠ Flagged for Manual Review'}</strong>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                            UPI ID (Optional Payout VPA)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.upiId}
                                            onChange={(e) => handleInputChange('upiId', e.target.value)}
                                            placeholder="e.g. creator@upi or yourname@oksbi"
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-mono ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'}`}
                                        />
                                    </div>

                                    <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${theme === 'light'
                                                ? 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                                                : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E]'
                                                }`}
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Back to Document Proof
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!bankVerificationData?.verified}
                                            title={!bankVerificationData?.verified ? "Please verify bank account via Cashfree Penny Drop first" : ""}
                                            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                                        >
                                            <span>Review & Final Submit</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* STEP 4: Review & Final Submit */}
                            {step === 4 && (
                                <form onSubmit={handleSubmitKyc} className="space-y-6">
                                    <div className="flex items-center gap-2.5">
                                        <span className="p-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/20 shrink-0">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <h3 className={`font-extrabold text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                Step 4 — Review Verification Summary & Submit
                                            </h3>
                                            <p className="text-[11px] text-[#8B8B96]">Review all Cashfree verification results before final submission.</p>
                                        </div>
                                    </div>

                                    {/* Verification Checklist Badges */}
                                    <div className={`p-5 rounded-2xl border space-y-4 text-xs ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'}`}>
                                        {/* 1. Personal Info Summary */}
                                        <div className="pb-3 border-b border-current/10 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-extrabold uppercase text-[10px] tracking-wider text-[#8B8B96]">1. Personal Information</span>
                                                <span className="text-[#00E676] font-bold text-[11px] flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Mobile Verified
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">Legal Name</span>
                                                    <span className="font-bold">{aadhaarVerificationData?.registeredName || panVerificationData?.registeredName || formData.fullName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">Mobile & Category</span>
                                                    <span className="font-bold">{formData.mobileCountryCode} {formData.mobileNumber} &bull; <span className="text-[#EB1000]">{formData.category}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Document Proof Summary */}
                                        <div className="pb-3 border-b border-current/10 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-extrabold uppercase text-[10px] tracking-wider text-[#8B8B96]">2. Document Proof</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#00E676] font-bold text-[11px] flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> PAN Verified
                                                    </span>
                                                    <span className="text-[#00E676] font-bold text-[11px] flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Aadhaar Verified
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">PAN Number</span>
                                                    <span className="font-mono font-bold text-[#EB1000] uppercase">{panVerificationData?.panNumber || formData.panNumber}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">Aadhaar e-KYC</span>
                                                    <span className="font-mono font-bold text-[#00F5D4]">{aadhaarVerificationData?.maskedAadhaar || `XXXXXXXX${formData.aadhaarNumber.slice(-4)}`}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">PAN / Aadhaar Match</span>
                                                    <span className="font-bold text-[#00E676]">✓ Identity Match</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Bank Details Summary */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-extrabold uppercase text-[10px] tracking-wider text-[#8B8B96]">3. Bank Details</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#00E676] font-bold text-[11px] flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Bank Account Verified
                                                    </span>
                                                    <span className="text-[#00E676] font-bold text-[11px] flex items-center gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Bank Holder Match
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">Payout Destination</span>
                                                    <span className="font-bold">{formData.bankName} - A/C #{formData.accountNumber} ({formData.ifscCode})</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block">UPI VPA</span>
                                                    <span className="font-mono font-bold">{formData.upiId || 'Not configured'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 4 Agreements Section */}
                                    <div className="space-y-3 pt-2">
                                        {/* 1. Identity & Bank Details Declaration */}
                                        <label className={`flex items-start gap-3 text-xs cursor-pointer p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'}`}>
                                            <input
                                                type="checkbox"
                                                checked={formData.agreeTerms}
                                                onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                                                className="mt-0.5 h-4 w-4 rounded accent-[#EB1000] cursor-pointer shrink-0"
                                            />
                                            <span className="font-medium leading-relaxed">
                                                I hereby declare that all identity documents and bank payout details submitted are verified, genuine, and belong to me.
                                            </span>
                                        </label>

                                        {/* 2. AskMe EULA, Privacy & Creator Agreement Checkbox */}
                                        <div className={`p-4 rounded-2xl border transition-all space-y-2.5 ${agreeEula ? (theme === 'light' ? 'bg-emerald-50/50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-500/30') : (theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]')}`}>
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="agreeEulaCheckbox"
                                                    checked={agreeEula}
                                                    onChange={(e) => setAgreeEula(e.target.checked)}
                                                    className="mt-0.5 h-4 w-4 rounded accent-[#EB1000] cursor-pointer shrink-0"
                                                />
                                                <div className="flex-1 text-xs">
                                                    <label htmlFor="agreeEulaCheckbox" className="font-medium leading-relaxed cursor-pointer block">
                                                        I have read, understood, and agree to the <strong className="text-[#EB1000]">AskMe EULA (End User License Agreement)</strong>, User Agreement, Privacy Policy, and Creator Agreement.
                                                    </label>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowEulaModal(true)}
                                                            className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#00F5D4] bg-[#00F5D4]/10 hover:bg-[#00F5D4]/20 border border-[#00F5D4]/30 px-3 py-1.5 rounded-lg transition cursor-pointer"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            <span>Read Full AskMe EULA & Creator Agreement (23 Sept 2026)</span>
                                                        </button>
                                                        {agreeEula && (
                                                            <span className="text-[10px] font-extrabold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/30 flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" /> EULA Accepted
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(3)}
                                            className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${theme === 'light'
                                                ? 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                                                : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E]'
                                                }`}
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Back to Bank Details
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !formData.agreeTerms || !agreeEula}
                                            title={(!formData.agreeTerms || !agreeEula) ? "Please accept both the declaration and AskMe EULA Agreement first" : ""}
                                            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 animate-spin" /> Submitting KYC...
                                                </>
                                            ) : (
                                                <>
                                                    <span>Submit KYC </span>
                                                    <ShieldCheck className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                {/* ASKME EULA & CREATOR AGREEMENT MODAL */}
                {showEulaModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                        <div className={`w-full max-w-4xl max-h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#12121C] border-[#222238] text-white'}`}>
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b flex items-center justify-between border-current/10 bg-[#EB1000]/5 shrink-0">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/20 shrink-0">
                                        <FileText className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h3 className="font-heading font-black text-sm sm:text-base tracking-tight">
                                            ASKME END USER LICENSE AGREEMENT & CREATOR AGREEMENT
                                        </h3>
                                        <p className="text-[11px] text-[#8B8B96]">
                                            Effective Date: 23 September 2026 &bull; Operated by FuturePast Ventures LLP (LLPIN: ACQ-4984)
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowEulaModal(false)}
                                    className="p-2 rounded-xl border border-current/20 hover:bg-current/10 transition cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Scrollable EULA Content */}
                            <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed flex-1 font-sans select-text">
                                <div className="p-4 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs font-medium">
                                    ⚡ Please read through the End User License Agreement, User Agreement, and Creator Agreement below. By clicking &quot;I Have Read & Accept All Terms&quot;, you agree to be legally bound by these terms.
                                </div>

                                <div className="space-y-4">
                                    <div className="border-b pb-3 border-current/10">
                                        <h4 className="font-black text-sm text-[#EB1000]">ASKME — END USER LICENSE AGREEMENT, USER AGREEMENT AND CREATOR AGREEMENT</h4>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            Effective Date: 23 September 2026 | Last Updated: 23 September 2026<br />
                                            Operated by: FuturePast Ventures LLP (LLPIN: ACQ-4984) | Registered Office: Pune, Maharashtra, India<br />
                                            Grievance Officer: Mr. T.S. Sandhu (Email: Grievance@ask-me.live)
                                        </p>
                                    </div>

                                    {/* Commercial Model Glance */}
                                    <div className="p-4 rounded-2xl bg-[#EB1000]/10 border border-[#EB1000]/30 text-[#FF6B60] space-y-2">
                                        <h5 className="font-black text-xs uppercase tracking-wider text-[#FF3B30]">CREATOR COMMERCIAL MODEL AT A GLANCE</h5>
                                        <ul className="list-disc pl-5 space-y-1 text-[11px]">
                                            <li><strong>Viewer pays:</strong> 100%</li>
                                            <li><strong>AskMe standard Platform Fee:</strong> 15%</li>
                                            <li><strong>Creator Gross Share:</strong> 80.3%</li>
                                            <li><strong>Applicable deductions from Creator Gross Share:</strong> Taxes, payment processing charges, statutory withholding, refunds, reversals, chargebacks and other legally or contractually applicable adjustments.</li>
                                            <li><strong>Creator Net Earnings:</strong> The amount remaining after applicable deductions.</li>
                                        </ul>
                                    </div>

                                    {/* PART I */}
                                    <div className="space-y-3 pt-2">
                                        <h4 className="font-black text-sm uppercase tracking-wider text-[#00F5D4] border-b pb-2 border-current/10">
                                            PART I — END USER LICENSE AGREEMENT AND USER AGREEMENT
                                        </h4>

                                        <div className="space-y-2.5 text-xs text-gray-300">
                                            <p><strong>1. Introduction:</strong> This End User License Agreement, User Agreement and Creator Agreement (&quot;Agreement&quot;) governs access to and use of AskMe, including the AskMe website, mobile applications, software, technology, APIs, Creator discovery services, Creator profiles, sessions, QR codes, links, paid questions, paid messages, notifications, payment functionality, Creator dashboards, moderation tools, integrations and all other services made available by or through AskMe. Operated by FuturePast Ventures LLP, Pune, Maharashtra, India.</p>
                                            <p><strong>2. Nature and Purpose of AskMe:</strong> AskMe is a technology platform designed to facilitate discovery and interaction between online personalities, Creators and their audiences.</p>
                                            <p><strong>3. Definitions:</strong> Defines AskMe, Creator, Viewer, User, Paid Question, Platform Fee, Payment Service Provider, Creator Gross Share, and Creator Net Earnings.</p>
                                            <p><strong>4. Creator Categories:</strong> Content Creators, YouTubers, Influencers, Streamers, Teachers, Educators, Coaches, Trainers, Mentors, Speakers, Public Speakers, News Anchors, Journalists, Podcasters, Gamers, Esports Players, Singers, Musicians, Artists, Performers, Comedians, Authors, Bloggers, Chefs, Fitness Creators, Athletes, Entrepreneurs, Science & Technology Creators, Photographers, Hosts, and Subject Matter Experts.</p>
                                            <p><strong>5. No Professional Certification or Endorsement:</strong> A Creator&apos;s registration or appearance on AskMe does not constitute certification or professional endorsement by FuturePast.</p>
                                            <p><strong>6. Eligibility:</strong> AskMe is intended primarily for persons aged 18 years or older with legal capacity.</p>
                                            <p><strong>7. Account Registration:</strong> Users must provide accurate, complete and current information and safeguard account credentials.</p>
                                            <p><strong>8. Electronic Agreement:</strong> Electronic acceptance by selecting &quot;Accept&quot;, &quot;I Agree&quot;, &quot;Submit KYC&quot;, or using AskMe constitutes legal acceptance under applicable law.</p>
                                            <p><strong>9. Creator Registration:</strong> Subject to AskMe&apos;s eligibility, KYC, safety, payment and compliance requirements.</p>
                                            <p><strong>10. Creator Discovery:</strong> Algorithmic and category-based placement does not guarantee views or earnings.</p>
                                            <p><strong>11–12. Third Party Platforms & Livestreams:</strong> Creators may use AskMe alongside YouTube, Instagram, Twitch, TikTok, etc. Third party platforms host the underlying stream; AskMe controls platform interactions.</p>
                                            <p><strong>13–16. Paid Questions & Responses:</strong> Paid Questions are voluntary audience interactions. Specific response or outcome is governed by Creator moderation and policy terms.</p>
                                            <p><strong>17–19. Payment Service Providers & Security:</strong> Payments processed securely via Cashfree and regulated Payment Service Providers.</p>
                                            <p><strong>20–26. Commercial Terms & Platform Fees:</strong> Standard 15% Platform Fee, 80.3% Creator Gross Share before applicable taxes, processing, and statutory deductions.</p>
                                            <p><strong>27–29. Taxes & Invoicing:</strong> GST invoicing and statutory deductions applied in accordance with Indian tax regulations.</p>
                                            <p><strong>30–33. International Payments & Sanctions:</strong> Restricted international jurisdictions include Pakistan, Bangladesh, Democratic People&apos;s Republic of Korea (North Korea), Palestine, and Türkiye.</p>
                                            <p><strong>34–39. Refunds, Chargebacks & Payout Timing:</strong> Subject to settlement, KYC verification, and anti-fraud screening.</p>
                                            <p><strong>40–51. Safety, Harassment & Prohibited Content:</strong> Zero tolerance for CSAM, unlawful content, harassment, doxxing, impersonation, or financial crime.</p>
                                            <p><strong>52–55. Intellectual Property & AI Moderation:</strong> FuturePast retains platform IP rights. Automated systems and AI assist moderation.</p>
                                            <p><strong>56–65. Account Suspension, Termination & SLA:</strong> Right reserved to suspend or terminate accounts for material breaches or risk considerations.</p>
                                            <p><strong>66–80. Legal Framework & Grievances:</strong> Governed by the laws of India. Jurisdiction: Competent courts in Maharashtra, India. Grievance Officer: Mr. T.S. Sandhu (Email: Grievance@ask-me.live).</p>
                                        </div>
                                    </div>

                                    {/* PART II */}
                                    <div className="space-y-3 pt-4 border-t border-current/10">
                                        <h4 className="font-black text-sm uppercase tracking-wider text-[#00E676] border-b pb-2 border-current/10">
                                            PART II — CREATOR AGREEMENT
                                        </h4>

                                        <div className="space-y-2.5 text-xs text-gray-300">
                                            <p><strong>81–87. Creator Status & Dashboard:</strong> Creators operate as independent users. Creator dashboard displays provisional and settled earnings.</p>
                                            <p><strong>88–92. Revenue Share & Risk Based Fees:</strong> 15% Platform Fee, 80.3% Gross Share minus processing/tax deductions. Risk-based commercial adjustments may apply.</p>
                                            <p><strong>93–97. Payout Eligibility & Tax Compliance:</strong> Payouts require completed KYC, bank penny drop verification, and compliance checks.</p>
                                            <p><strong>98–103. Content Rights & Referral Programs:</strong> Creators retain ownership of lawful content and grant AskMe operational display permissions.</p>
                                            <p><strong>104–107. Creator Risk Management & Suspension:</strong> Suspensions or payout holds may be applied for fraud, abuse, or chargebacks.</p>
                                            <p><strong>108–112. Creator Acknowledgement:</strong> Creator confirms understanding of the 15% fee, 80.3% gross share structure, and deduction policy.</p>
                                            <p><strong>113–116. Corporate Information & Final Acceptance:</strong> FuturePast Ventures LLP (LLPIN: ACQ-4984), Pune, Maharashtra, India. Grievance Officer: Mr. T.S. Sandhu (Grievance@ask-me.live).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 border-current/10 bg-[#0B0B12] shrink-0">
                                <span className="text-[11px] text-gray-400">
                                    Grievance Officer: Mr. T.S. Sandhu &bull; Grievance@ask-me.live
                                </span>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setShowEulaModal(false)}
                                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 text-xs font-bold hover:bg-gray-800 cursor-pointer"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAgreeEula(true);
                                            setFormData(prev => ({ ...prev, agreeTerms: true }));
                                            setShowEulaModal(false);
                                            toast.success('AskMe EULA & Creator Agreement Accepted!', 'Agreement Accepted');
                                        }}
                                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-black text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] transition cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <Check className="h-4 w-4 stroke-[3]" />
                                        <span>I Have Read & Accept All Terms</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
