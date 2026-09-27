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

    // 2. Aadhaar OKYC State
    const [isSendingAadhaarOtp, setIsSendingAadhaarOtp] = useState(false);
    const [isVerifyingAadhaarOtp, setIsVerifyingAadhaarOtp] = useState(false);
    const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
    const [aadhaarRefId, setAadhaarRefId] = useState('');
    const [aadhaarOtp, setAadhaarOtp] = useState('');
    const [aadhaarVerificationData, setAadhaarVerificationData] = useState(null);

    // 3. PAN + Aadhaar Identity Match State
    const [isCheckingIdentityMatch, setIsCheckingIdentityMatch] = useState(false);
    const [identityMatchData, setIdentityMatchData] = useState(null);

    // 4. Bank Account Verification State (Penny Drop)
    const [isVerifyingBank, setIsVerifyingBank] = useState(false);
    const [bankVerificationData, setBankVerificationData] = useState(null);

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
                    toast.warning(data.data.message || 'Identity mismatch detected between PAN and Aadhaar. Flagged for manual review.', 'Manual Review Required');
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

        setFormData(prev => ({
            ...prev,
            fullName: rawName || prev.fullName,
            accountHolderName: rawName || prev.accountHolderName,
            mobileNumber: numOnly || prev.mobileNumber,
            mobileCountryCode: codePrefix || prev.mobileCountryCode,
        }));

        if (rawName) {
            setIsNameLocked(true);
        }
        setIsMobileLocked(true); // Always keep verified mobile locked per requirements

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
            return 'Please complete Aadhaar e-KYC (OTP verification) via Cashfree.';
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
        if (!formData.agreeTerms) {
            setErrorMsg('Please confirm legal agreement terms to submit.');
            toast.error('Legal Agreement Required');
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
                    <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 animate-scale-up ${theme === 'light' ? 'bg-white border-[#00E676]/40' : 'bg-[#13131A] border-[#00E676]/30'
                        }`}>
                        <div className={`flex items-center gap-4 border-b pb-6 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                            }`}>
                            <div className="p-3.5 rounded-2xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 shrink-0">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <span className="px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-extrabold uppercase tracking-wider">
                                    ✓ KYC VERIFIED & APPROVED
                                </span>
                                <h2 className={`font-heading font-black text-2xl mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                    }`}>KYC Identity Verification Complete</h2>
                                <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                    }`}>Your PAN, Aadhaar e-KYC, and bank details have been verified by Cashfree and super admin auditors.</p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/creators/dashboard"
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] text-black font-extrabold text-xs shadow-md hover:opacity-95 transition inline-flex items-center gap-2"
                            >
                                <ShieldCheck className="h-4 w-4" /> Go to Creator Control Room Dashboard
                            </Link>
                        </div>
                    </div>
                ) : flowState === 'manual_review' ? (
                    /* --- MANUAL REVIEW SCREEN --- */
                    <div className={`p-6 sm:p-10 rounded-3xl border shadow-2xl space-y-6 animate-scale-up relative overflow-hidden ${theme === 'light'
                        ? 'bg-gradient-to-br from-white via-[#FFF9F5] to-white border-[#FF9800]/40'
                        : 'bg-gradient-to-br from-[#1A1510] via-[#1E1712] to-[#14100C] border-[#FF9800]/30'
                        }`}>
                        <div className="flex items-start gap-4">
                            <div className="p-4 rounded-2xl bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/30 shrink-0 shadow-lg">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <span className="px-3 py-1 rounded-full bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/40 text-xs font-black uppercase tracking-wider inline-block">
                                    KYC STATUS: MANUAL REVIEW
                                </span>
                                <h2 className={`font-heading font-black text-2xl sm:text-3xl tracking-tight mt-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                    Application Under Compliance Review
                                </h2>
                                <p className={`text-xs max-w-xl leading-relaxed ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                                    Your PAN, Aadhaar, or Bank Account details could not be matched automatically. Your application has been sent to our super admin team for manual identity verification.
                                </p>
                            </div>
                        </div>

                        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${theme === 'light' ? 'bg-[#FFF3E0] border-[#FFB74D] text-[#E65100]' : 'bg-[#FF9800]/10 border-[#FF9800]/30 text-[#FFB74D]'}`}>
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <div className="text-xs">
                                <strong>Compliance Note:</strong> Manual review takes approximately <strong>24 to 48 hours</strong>. You will receive a notification once verified.
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 bg-[#181824] text-white border-[#262636] hover:border-[#FF9800]"
                            >
                                <RefreshCw className="h-4 w-4 text-[#FF9800]" /> Check Status
                            </button>
                        </div>
                    </div>
                ) : (flowState === 'pending' || flowState === 'kyc_submitted') ? (
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
                                    Cashfree-powered PAN, Aadhaar e-KYC, and Bank Account Penny Drop verification.
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
                                                        placeholder={`Channel handle or URL (e.g. @${creatorUser?.username || 'creator'})...`}
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

                        {/* STEP 2: Document Proof (PAN + Aadhaar OKYC + Identity Match) */}
                        {step === 2 && (
                            <form onSubmit={handleNextStep} className="space-y-6">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/20 shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <h3 className={`font-extrabold text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                            Step 2 — Cashfree Identity Verification
                                        </h3>
                                        <p className="text-[11px] text-[#8B8B96]">Verify your PAN card & complete UIDAI Aadhaar e-KYC via OTP.</p>
                                    </div>
                                </div>

                                {/* SECTION 1: PAN VERIFICATION */}
                                <div className={`p-5 rounded-2xl border space-y-3 transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'}`}>
                                    <div className="flex items-center justify-between border-b pb-2 border-current/10">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-[#EB1000]" />
                                            <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                1. PAN Card Verification
                                            </h4>
                                        </div>
                                        {panVerificationData?.verified ? (
                                            <span className="text-[10px] font-extrabold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/30 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> PAN Verified
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                                Required
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                            PAN Number (10 Digits) *
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength={10}
                                                required
                                                value={formData.panNumber}
                                                onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                                                placeholder="e.g. ABCDE1234F"
                                                className={`flex-1 px-4 py-3 rounded-xl border text-xs outline-none font-mono uppercase font-bold transition-all duration-200 ${theme === 'light'
                                                    ? 'bg-white border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000]'
                                                    : 'bg-[#101018] border-[#2A2A3E] text-white focus:border-[#EB1000]'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyPan}
                                                disabled={isVerifyingPan || !formData.panNumber}
                                                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] text-white text-xs font-black shrink-0 transition hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {isVerifyingPan ? (
                                                    <>
                                                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck className="h-3.5 w-3.5" /> Verify PAN
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {panVerificationData?.verified && (
                                        <div className={`p-3 rounded-xl border text-xs space-y-1 ${theme === 'light' ? 'bg-[#EBFBFA] border-[#00F5D4]/40 text-[#007A6B]' : 'bg-[#00F5D4]/10 border-[#00F5D4]/30 text-[#00F5D4]'}`}>
                                            <div className="font-extrabold flex items-center gap-1.5">
                                                <Check className="h-4 w-4" /> PAN Holder Name: {panVerificationData.registeredName}
                                            </div>
                                            <div className="text-[11px] opacity-80">
                                                PAN Type: {panVerificationData.type || 'INDIVIDUAL'} &bull; Ref: {panVerificationData.referenceId}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 2: AADHAAR E-KYC / OKYC */}
                                <div className={`p-5 rounded-2xl border space-y-3 transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'}`}>
                                    <div className="flex items-center justify-between border-b pb-2 border-current/10">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-[#00F5D4]" />
                                            <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                2. Aadhaar e-KYC (OKYC + OTP)
                                            </h4>
                                        </div>
                                        {aadhaarVerificationData?.verified ? (
                                            <span className="text-[10px] font-extrabold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/30 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Aadhaar Verified
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                                Required
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                            Aadhaar Number (12 Digits) *
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={12}
                                                required
                                                value={formData.aadhaarNumber}
                                                onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                                                placeholder="e.g. 123456789012"
                                                className={`flex-1 px-4 py-3 rounded-xl border text-xs outline-none font-mono font-bold transition-all duration-200 ${theme === 'light'
                                                    ? 'bg-white border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000]'
                                                    : 'bg-[#101018] border-[#2A2A3E] text-white focus:border-[#EB1000]'
                                                    }`}
                                            />
                                            {!aadhaarVerificationData?.verified && (
                                                <button
                                                    type="button"
                                                    onClick={handleSendAadhaarOtp}
                                                    disabled={isSendingAadhaarOtp || String(formData.aadhaarNumber || '').length !== 12}
                                                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00F5D4] to-[#00B4D8] text-black text-xs font-black shrink-0 transition hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    {isSendingAadhaarOtp ? (
                                                        <>
                                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <KeyRound className="h-3.5 w-3.5" /> {aadhaarOtpSent ? 'Resend OTP' : 'Send OTP'}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Aadhaar OTP Input Box */}
                                    {aadhaarOtpSent && !aadhaarVerificationData?.verified && (
                                        <div className={`p-4 rounded-xl border space-y-2 animate-scale-up ${theme === 'light' ? 'bg-amber-50/60 border-amber-300' : 'bg-amber-950/20 border-amber-700/50'}`}>
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                                                    <KeyRound className="h-3.5 w-3.5" /> Enter 6-Digit Aadhaar OTP
                                                </label>
                                                <span className="text-[10px] text-gray-400">Sent to linked mobile</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    value={aadhaarOtp}
                                                    onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="Enter 6-digit OTP"
                                                    className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none font-mono font-bold tracking-widest text-center ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-black' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyAadhaarOtp}
                                                    disabled={isVerifyingAadhaarOtp || aadhaarOtp.length < 4}
                                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-black text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                                >
                                                    {isVerifyingAadhaarOtp ? (
                                                        <>
                                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="h-3.5 w-3.5" /> Verify OTP
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {aadhaarVerificationData?.verified && (
                                        <div className={`p-3 rounded-xl border text-xs space-y-1 ${theme === 'light' ? 'bg-[#EBFBFA] border-[#00F5D4]/40 text-[#007A6B]' : 'bg-[#00F5D4]/10 border-[#00F5D4]/30 text-[#00F5D4]'}`}>
                                            <div className="font-extrabold flex items-center gap-1.5">
                                                <Check className="h-4 w-4" /> Aadhaar Verified: {aadhaarVerificationData.registeredName}
                                            </div>
                                            <div className="text-[11px] opacity-80">
                                                DOB: {aadhaarVerificationData.dob || 'Verified'} &bull; Masked: {aadhaarVerificationData.maskedAadhaar}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${theme === 'light'
                                            ? 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                                            : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E]'
                                            }`}
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back to Personal Info
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!panVerificationData?.verified || !aadhaarVerificationData?.verified}
                                        className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
                                        className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
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

                                <label className={`flex items-start gap-3 text-xs cursor-pointer p-4 rounded-xl border transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeTerms}
                                        onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded accent-[#EB1000] cursor-pointer"
                                    />
                                    <span className="font-medium leading-relaxed">
                                        I hereby declare that all identity documents and bank payout details submitted are verified, genuine, and belong to me.
                                    </span>
                                </label>

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
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" /> Submitting KYC...
                                            </>
                                        ) : (
                                            <>
                                                <span>Submit KYC for Admin Review</span>
                                                <ShieldCheck className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
