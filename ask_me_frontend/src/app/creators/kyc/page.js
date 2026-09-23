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
    Bell
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

    // Flow State: 'kyc_form' | 'kyc_submitted' | 'kyc_approved' | 'kyc_rejected'
    const [flowState, setFlowState] = useState('kyc_form');
    const [step, setStep] = useState(1); // 1: Personal & ID, 2: Bank & Payout, 3: Review & Submit

    // Form Submission & Error States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Lock Pre-filled Data States
    const [isNameLocked, setIsNameLocked] = useState(false);
    const [isMobileLocked, setIsMobileLocked] = useState(false);

    // KYC Form State
    const [formData, setFormData] = useState({
        fullName: '',
        mobileCountryCode: '+91',
        mobileNumber: '',
        category: '', // Dropdown: 'Creator', 'Freelancer', 'Business', 'Individual'
        socialMediaUrl: '', // Main profile / portfolio URL
        youtubeUrl: '',
        instagramUrl: '',
        facebookUrl: '',
        twitchUrl: '',
        linkedinUrl: '',
        dateOfBirth: '',
        address: '',
        country: 'India',
        state: '',
        city: '',
        pincode: '',
        documentType: 'pan_card',
        panNumber: '',
        documentNumber: '',
        documentPreview: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',

        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        upiId: '',
        accountType: '',

        agreeTerms: false,
    });

    // Cashfree Instant Verification States
    const [isVerifyingPan, setIsVerifyingPan] = useState(false);
    const [panVerificationData, setPanVerificationData] = useState(null);
    const [isVerifyingBank, setIsVerifyingBank] = useState(false);
    const [bankVerificationData, setBankVerificationData] = useState(null);

    const handleVerifyPan = async () => {
        if (!formData.panNumber || !formData.panNumber.trim()) {
            toast.error('Please enter a PAN Card Number first.', 'PAN Required');
            return;
        }

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        const cleanPan = formData.panNumber.trim().toUpperCase();
        if (!panRegex.test(cleanPan)) {
            toast.error('Invalid PAN Card format. E.g. ABCDE1234F', 'Invalid Format');
            return;
        }

        try {
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
                setIsVerifyingPan(true);

                if (data.data.registeredName) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: data.data.registeredName,
                        accountHolderName: prev.accountHolderName || data.data.registeredName,
                    }));
                }
                toast.success(`PAN Card Verified! Registered Name: ${data.data.registeredName}`, 'Cashfree Verification');
            } else {
                toast.error(data.message || 'PAN Verification failed.', 'Cashfree Verification');
            }
        } catch (err) {
            toast.error(err.message, 'Verification Error');
        } finally {
            setIsVerifyingPan(false);
        }
    };

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
                    name: formData.accountHolderName || formData.fullName,
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
                toast.success(`Bank Account Verified via Cashfree! (${data.data.bankName})`, 'Cashfree Penny Drop');
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
        if (numOnly && numOnly.length === 10) {
            setIsMobileLocked(true);
        }

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
        if (field === 'ifscCode') {
            cleanValue = String(value || '').toUpperCase().trim().slice(0, 11);
        } else if (field === 'accountNumber' || field === 'confirmAccountNumber') {
            cleanValue = String(value || '').replace(/\D/g, '');
        }
        setFormData(prev => ({ ...prev, [field]: cleanValue }));
        setErrorMsg('');
    };

    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [docPreviewUrl, setDocPreviewUrl] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            toast.error('Please upload a valid image (JPG, PNG, WEBP) or PDF document.', 'Invalid File Type');
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            toast.error('File size exceeds the 15MB limit.', 'File Too Large');
            return;
        }

        const localBlob = URL.createObjectURL(file);
        setDocPreviewUrl(localBlob);

        try {
            setIsUploadingDoc(true);
            toast.info('Uploading document to server...', 'Uploading File');
            const res = await uploadFile(file, 'document');
            setFormData(prev => ({ ...prev, documentPreview: res.path }));
            toast.success('KYC Document uploaded successfully!', 'Upload Complete');
        } catch (err) {
            toast.error(err?.message || 'Failed to upload document.', 'Upload Error');
        } finally {
            setIsUploadingDoc(false);
        }
    };

    const validateStep1 = () => {
        if (!formData.fullName || !formData.fullName.trim()) {
            return 'Legal Full Name is required.';
        }

        // 10-Digit Mobile Number Validation
        const cleanMobile = String(formData.mobileNumber || '').replace(/\D/g, '');
        if (!cleanMobile) {
            return 'Mobile Number is required.';
        }
        if (cleanMobile.length !== 10) {
            return 'Mobile Number must be a valid 10-digit number (e.g. 9876543210).';
        }

        // Category Dropdown Validation
        if (!formData.category || !formData.category.trim()) {
            return 'Please select a Category (Creator, Freelancer, Business, or Individual).';
        }

        // Social Media URL Validation helper
        const validateUrlFormat = (urlStr, platformName) => {
            if (!urlStr || !urlStr.trim()) return null;
            const trimmed = urlStr.trim();
            const testUrl = (trimmed.startsWith('http://') || trimmed.startsWith('https://')) ? trimmed : `https://${trimmed}`;
            try {
                const parsed = new URL(testUrl);
                if (!parsed.hostname || !parsed.hostname.includes('.')) {
                    return `Invalid URL format for ${platformName}. E.g. https://${platformName.toLowerCase().replace(/[^a-z]/g, '')}.com/yourprofile`;
                }
                return null;
            } catch (e) {
                return `Invalid URL format for ${platformName}. E.g. https://${platformName.toLowerCase().replace(/[^a-z]/g, '')}.com/yourprofile`;
            }
        };

        const primaryErr = validateUrlFormat(formData.socialMediaUrl, 'Primary Social Media');
        if (primaryErr) return primaryErr;
        const ytErr = validateUrlFormat(formData.youtubeUrl, 'YouTube');
        if (ytErr) return ytErr;
        const instaErr = validateUrlFormat(formData.instagramUrl, 'Instagram');
        if (instaErr) return instaErr;
        const linkedinErr = validateUrlFormat(formData.linkedinUrl, 'LinkedIn');
        if (linkedinErr) return linkedinErr;
        const fbErr = validateUrlFormat(formData.facebookUrl, 'Facebook');
        if (fbErr) return fbErr;
        const twitchErr = validateUrlFormat(formData.twitchUrl, 'Twitch');
        if (twitchErr) return twitchErr;

        if (!formData.dateOfBirth) return 'Date of Birth is required.';
        if (!formData.address.trim()) return 'Residential Address is required.';
        if (!formData.country.trim()) return 'Country is required.';
        if (!formData.state.trim()) return 'State is required.';
        if (!formData.city.trim()) return 'City is required.';
        return null;
    };

    const validateStep2 = () => {
        if (!formData.panNumber.trim()) return 'ID Number / PAN Number is required.';
        if (!formData.documentPreview.trim()) return 'Identity Document Image URL / Upload is required.';
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
            return 'Invalid IFSC Code format. IFSC must be 11 characters starting with 4 letters, 5th character 0, followed by 6 alphanumeric characters (e.g. SBIN0001234, HDFC0000240).';
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

            const payload = {
                creatorId,
                fullName: formData.fullName,
                mobileNumber: `${formData.mobileCountryCode} ${formData.mobileNumber}`,
                category: formData.category,
                socialMediaUrl: formData.socialMediaUrl,
                socialLinks: [
                    { platform: 'youtube', link: formData.youtubeUrl },
                    { platform: 'instagram', link: formData.instagramUrl },
                    { platform: 'linkedin', link: formData.linkedinUrl },
                    { platform: 'facebook', link: formData.facebookUrl },
                    { platform: 'twitch', link: formData.twitchUrl },
                ].filter(s => s.link && s.link.trim()),
                dateOfBirth: formData.dateOfBirth,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country || 'India',
                pincode: formData.pincode,
                documentType: formData.documentType,
                panNumber: formData.panNumber,
                documentNumber: formData.documentNumber || formData.panNumber,
                documentFileUrl: formData.documentPreview,
                accountHolderName: formData.accountHolderName,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode,
                upiId: formData.upiId,
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
                setSuccessMsg('KYC Verification Details Submitted Successfully!');
                setFlowState('pending');
                toast.success('KYC Documents & Bank Details saved to database successfully!', 'KYC Submitted');
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
                    {/* Logo & Subtitle */}
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

                    {/* Sign Out Button */}
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
                                    }`}>Your identity documents and bank account have been verified by super admin auditors.</p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/creators/dashboard"
                                className="px-6 py-3 rounded-xl bg-brand-gradient text-white font-bold text-xs shadow-md glow-teal hover:opacity-95 transition inline-flex items-center gap-2"
                            >
                                <ShieldCheck className="h-4 w-4" /> Go to Creator Control Room Dashboard
                            </Link>
                        </div>
                    </div>
                ) : (flowState === 'pending' || flowState === 'kyc_submitted') ? (
                    /* --- 2. SUBMITTED & PENDING AUDIT SCREEN --- */
                    <div className={`p-6 sm:p-10 rounded-3xl border shadow-2xl space-y-8 animate-scale-up relative overflow-hidden transition-all duration-300 ${theme === 'light'
                        ? 'bg-gradient-to-br from-white via-[#FFFDF5] to-white border-[#FFD60A]/40'
                        : 'bg-gradient-to-br from-[#12121A] via-[#1A1A24] to-[#12121A] border-[#FFD60A]/30'
                        }`}>
                        {/* Ambient Glow Effects */}
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#00F5D4]/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Top Header & Status Banner */}
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-6 border-current/10">
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
                                        Documents Submitted & Pending Audit
                                    </h2>
                                    <p className={`text-xs max-w-xl leading-relaxed ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                        }`}>
                                        Your PAN Card, identity proof, and bank payout details have been successfully submitted to the super admin compliance team for verification.
                                    </p>
                                </div>
                            </div>

                            {/* Refresh Action Button */}
                            <button
                                onClick={() => {
                                    toast.info('Checking latest KYC verification status...', 'Status Check');
                                    window.location.reload();
                                }}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${theme === 'light'
                                    ? 'bg-[#F1F3F5] text-[#1A1D20] border-[#DEE2E6] hover:bg-[#E9ECEF]'
                                    : 'bg-[#181824] text-white border-[#262636] hover:border-[#00F5D4]/40'
                                    }`}
                            >
                                <RefreshCw className="h-4 w-4 text-[#00F5D4]" />
                                Check Status
                            </button>
                        </div>

                        {/* Audit Progress Timeline Tracker */}
                        <div className="relative z-10 space-y-3">
                            <h3 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                }`}>
                                Verification Progress Timeline
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Stage 1 */}
                                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${theme === 'light' ? 'bg-white border-[#00E676]/30' : 'bg-[#181824] border-[#00E676]/30'
                                    }`}>
                                    <div className="p-2.5 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 shrink-0">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block">Completed</span>
                                        <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>1. Documents Submitted</h4>
                                        <p className="text-[11px] text-[#8B8B96]">Form & identity files uploaded</p>
                                    </div>
                                </div>

                                {/* Stage 2 */}
                                <div className={`p-4 rounded-2xl border flex items-center gap-3 relative ${theme === 'light' ? 'bg-[#FFD60A]/10 border-[#FFD60A]/50' : 'bg-[#FFD60A]/10 border-[#FFD60A]/40'
                                    }`}>
                                    <div className="p-2.5 rounded-xl bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/40 shrink-0">
                                        <Clock className="h-5 w-5 animate-spin" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold text-[#FFD60A] uppercase tracking-wider block">In Progress</span>
                                        <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>2. Admin Verification</h4>
                                        <p className="text-[11px] text-[#FFD60A]">Compliance team auditing details</p>
                                    </div>
                                </div>

                                {/* Stage 3 */}
                                <div className={`p-4 rounded-2xl border flex items-center gap-3 opacity-60 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#14141E] border-[#222230]'
                                    }`}>
                                    <div className={`p-2.5 rounded-xl border shrink-0 ${theme === 'light' ? 'bg-white border-[#DEE2E6] text-[#8B8B96]' : 'bg-[#1C1C28] border-[#2A2A3A] text-[#8B8B96]'
                                        }`}>
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-[#8B8B96] uppercase tracking-wider block">Final Step</span>
                                        <h4 className={`text-xs font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>3. Dashboard Approval</h4>
                                        <p className="text-[11px] text-[#8B8B96]">Instant access to Live Studio</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submitted Summary Details Box */}
                        <div className={`p-5 rounded-2xl border space-y-3 relative z-10 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#14141E] border-[#222230]'
                            }`}>
                            <h4 className={`text-xs font-extrabold flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                }`}>
                                <FileText className="h-4 w-4 text-[#00F5D4]" />
                                Submitted Application Summary
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#181824]'
                                    }`}>
                                    <span className="text-[10px] text-[#8B8B96] block font-semibold uppercase">Legal Full Name</span>
                                    <span className={`font-bold block mt-0.5 truncate ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                        {submittedKycResult?.fullName || formData.fullName || creatorUser?.fullName || 'Creator Applicant'}
                                    </span>
                                </div>

                                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#181824]'
                                    }`}>
                                    <span className="text-[10px] text-[#8B8B96] block font-semibold uppercase">Document Number</span>
                                    <span className="font-mono font-bold block mt-0.5 text-[#00F5D4] uppercase">
                                        {submittedKycResult?.panNumber || formData.panNumber || '••••••••'}
                                    </span>
                                </div>

                                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#181824]'
                                    }`}>
                                    <span className="text-[10px] text-[#8B8B96] block font-semibold uppercase">Payout Destination</span>
                                    <span className={`font-mono font-bold block mt-0.5 truncate ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                        {submittedKycResult?.upiId || formData.upiId || formData.accountNumber || 'Configured Bank Account'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Security & Audit SLA Notice Banner */}
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 relative z-10 ${theme === 'light' ? 'bg-[#EBFBFA] border-[#00F5D4]/40 text-[#007A6B]' : 'bg-[#00F5D4]/10 border-[#00F5D4]/30 text-[#00F5D4]'
                            }`}>
                            <Sparkles className="h-5 w-5 shrink-0 stroke-[2]" />
                            <div className="text-xs leading-relaxed">
                                <strong>Estimated Audit SLA:</strong> Verification is typically completed within <strong>2 to 24 hours</strong>. Once approved, your account status will automatically update to <strong>Active</strong>.
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- 3. FORM INPUT STEPPER --- */
                    <div className={`p-6 sm:p-8 md:p-10 rounded-3xl border shadow-2xl space-y-6 sm:space-y-8 relative overflow-hidden transition-all duration-300 ${theme === 'light'
                        ? 'bg-white border-[#E2E8F0] shadow-slate-200/60'
                        : 'bg-[#12121C]/95 backdrop-blur-xl border-[#222236] shadow-black/80'
                        }`}>
                        {/* Gradient Top Accent Bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EB1000] via-[#FF5500] to-[#00F5D4]" />

                        {/* Card Top Title & Step Badge */}
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-5 ${theme === 'light' ? 'border-[#E2E8F0]' : 'border-[#222236]'
                            }`}>
                            <div>
                                <h2 className={`font-heading font-black text-xl sm:text-2xl tracking-tight ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'
                                    }`}>
                                    Submit KYC Verification Details
                                </h2>
                                <p className={`text-xs mt-1 font-medium ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'
                                    }`}>
                                    Provide legally accurate personal info, government ID proof, & bank account details.
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

                        {/* STEP 1: Personal & Address Details */}
                        {step === 1 && (
                            <form onSubmit={handleNextStep} className="space-y-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 rounded-xl bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20 shrink-0">
                                        <User className="h-4 w-4" />
                                    </span>
                                    <h3 className={`font-extrabold text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                        Personal Information & Contact Details
                                    </h3>
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
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                readOnly={isNameLocked}
                                                value={formData.fullName}
                                                onChange={(e) => !isNameLocked && handleInputChange('fullName', e.target.value)}
                                                placeholder="e.g. Raja Kumar"
                                                className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${isNameLocked
                                                    ? theme === 'light'
                                                        ? 'bg-[#E2E8F0]/60 border-[#CBD5E1] text-[#475569] cursor-not-allowed'
                                                        : 'bg-[#12121C] border-[#2A2A3E] text-[#94A3B8] cursor-not-allowed'
                                                    : theme === 'light'
                                                        ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                        : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    }`}
                                            />
                                            {isNameLocked && (
                                                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/80 pointer-events-none" />
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                            Date of Birth *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.dateOfBirth || ''}
                                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Mobile Number (with Country Code selector & lock) & Category Dropdown */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className={`block text-xs font-extrabold ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                Mobile Number * (10 Digits)
                                            </label>
                                            {isMobileLocked && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                                    <Lock className="h-3 w-3" /> Verified Mobile (Locked)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                disabled={isMobileLocked}
                                                value={formData.mobileCountryCode || '+91'}
                                                onChange={(e) => handleInputChange('mobileCountryCode', e.target.value)}
                                                className={`w-28 px-2.5 py-3 rounded-xl border text-xs outline-none font-mono font-bold transition-all ${isMobileLocked
                                                    ? theme === 'light' ? 'bg-[#E2E8F0]/60 border-[#CBD5E1] text-[#475569] cursor-not-allowed' : 'bg-[#12121C] border-[#2A2A3E] text-[#94A3B8] cursor-not-allowed'
                                                    : theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]' : 'bg-[#181826] border-[#2A2A3E] text-white'
                                                    }`}
                                            >
                                                <option value="+91">🇮🇳 +91</option>

                                            </select>
                                            <div className="relative flex-1">
                                                <input
                                                    type="tel"
                                                    maxLength={10}
                                                    required
                                                    readOnly={isMobileLocked}
                                                    value={formData.mobileNumber}
                                                    onChange={(e) => !isMobileLocked && handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                                                    placeholder="9876543210"
                                                    className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-mono font-bold transition-all duration-200 ${isMobileLocked
                                                        ? theme === 'light'
                                                            ? 'bg-[#E2E8F0]/60 border-[#CBD5E1] text-[#475569] cursor-not-allowed'
                                                            : 'bg-[#12121C] border-[#2A2A3E] text-[#94A3B8] cursor-not-allowed'
                                                        : theme === 'light'
                                                            ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                            : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                        }`}
                                                />
                                                {isMobileLocked && (
                                                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500/80 pointer-events-none" />
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 block mt-1">Must be exactly 10 digits to continue to Step 2.</span>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                            Stream Category *
                                        </label>
                                        <select
                                            required
                                            value={formData.category || ''}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
                                        >
                                            <option value="">Select Category...</option>
                                            <option value="Gaming">Gaming</option>
                                            <option value="Politics">Politics</option>
                                            <option value="Technology">Technology</option>
                                            <option value="Finance">Finance</option>
                                        </select>
                                        <span className="text-[10px] text-gray-400 block mt-1">Choose the category that best describes your profile.</span>
                                    </div>
                                </div>

                                {/* Row 3: Social Media Links (YouTube, Instagram, Facebook, Twitch, LinkedIn, etc.) */}
                                <div className={`p-4 rounded-2xl border space-y-3 ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826]/70 border-[#2A2A3E]'}`}>
                                    <div className="flex items-center gap-2 border-b pb-2 border-current/10">
                                        <Sparkles className="h-4 w-4 text-[#EB1000]" />
                                        <h4 className={`font-extrabold text-xs ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                            Social Media Links & Profiles
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-1">🎬 YouTube Channel URL</label>
                                            <input
                                                type="url"
                                                value={formData.youtubeUrl || ''}
                                                onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                                                placeholder="https://youtube.com/@channel"
                                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-1">📸 Instagram Profile URL</label>
                                            <input
                                                type="url"
                                                value={formData.instagramUrl || ''}
                                                onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                                                placeholder="https://instagram.com/username"
                                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-1">💼 LinkedIn Profile URL</label>
                                            <input
                                                type="url"
                                                value={formData.linkedinUrl || ''}
                                                onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                                                placeholder="https://linkedin.com/in/username"
                                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-1">👥 Facebook Profile / Page URL</label>
                                            <input
                                                type="url"
                                                value={formData.facebookUrl || ''}
                                                onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                                                placeholder="https://facebook.com/username"
                                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-1">🎮 Twitch Stream URL</label>
                                            <input
                                                type="url"
                                                value={formData.twitchUrl || ''}
                                                onChange={(e) => handleInputChange('twitchUrl', e.target.value)}
                                                placeholder="https://twitch.tv/channel"
                                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-1">🌐 Primary Portfolio / Website URL</label>
                                            <input
                                                type="url"
                                                value={formData.socialMediaUrl || ''}
                                                onChange={(e) => handleInputChange('socialMediaUrl', e.target.value)}
                                                placeholder="https://yourwebsite.com"
                                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#101018] border-[#2A2A3E] text-white'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Residential Address */}
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

                                {/* Row 5: Country, State, City */}
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
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
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
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
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
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
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

                        {/* STEP 2: Document Proof Details */}
                        {step === 2 && (
                            <form onSubmit={handleNextStep} className="space-y-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/20 shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </span>
                                    <h3 className={`font-extrabold text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                        Government Identity Document Proof
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                            Document Type *
                                        </label>
                                        <select
                                            value={formData.documentType}
                                            onChange={(e) => handleInputChange('documentType', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
                                        >
                                            <option value="pan_card" className={theme === 'light' ? 'bg-white text-black' : 'bg-[#181826] text-white'}>PAN Card (India)</option>
                                            <option value="aadhaar_card" className={theme === 'light' ? 'bg-white text-black' : 'bg-[#181826] text-white'}>Aadhaar Card</option>
                                            <option value="passport" className={theme === 'light' ? 'bg-white text-black' : 'bg-[#181826] text-white'}>Passport</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className={`block text-xs font-extrabold ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                ID / PAN Card Number *
                                            </label>
                                            {panVerificationData?.verified ? (
                                                <span className="text-[10px] font-extrabold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/30 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Cashfree Verified
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyPan}
                                                    disabled={isVerifyingPan}
                                                    className="text-[11px] font-extrabold text-[#EB1000] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isVerifyingPan ? (
                                                        <>
                                                            <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="h-3 w-3" /> Instant PAN Verify
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                required
                                                value={formData.panNumber}
                                                onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                                                placeholder="e.g. ABCDE1234F"
                                                className={`flex-1 px-4 py-3 rounded-xl border text-xs outline-none font-mono uppercase transition-all duration-200 ${theme === 'light'
                                                    ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    }`}
                                            />
                                            {!panVerificationData?.verified && (
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyPan}
                                                    disabled={isVerifyingPan}
                                                    className="px-4 py-3 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 hover:bg-[#EB1000]/20 text-xs font-black shrink-0 transition cursor-pointer"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                        </div>
                                        {panVerificationData?.registeredName && (
                                            <p className="text-[11px] text-[#00E676] font-bold mt-1.5 flex items-center gap-1">
                                                <Check className="h-3.5 w-3.5" /> Name on PAN: <strong>{panVerificationData.registeredName}</strong>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                        Upload Identity Document Image *
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={formData.documentPreview}
                                            onChange={(e) => handleInputChange('documentPreview', e.target.value)}
                                            placeholder="Document image URL or click upload button"
                                            className={`flex-1 px-4 py-3 rounded-xl border text-xs outline-none font-mono transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
                                        />
                                        <label className="px-5 py-3 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 hover:bg-[#EB1000]/20 text-xs font-black cursor-pointer flex items-center justify-center gap-2 shrink-0 transition">
                                            <Upload className="h-4 w-4 text-[#EB1000]" /> {isUploadingDoc ? 'Uploading...' : 'Pick Image File'}
                                            <input type="file" accept="image/*,application/pdf" disabled={isUploadingDoc} className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                </div>

                                {/* Live Document Preview Thumbnail Card */}
                                {(docPreviewUrl || formData.documentPreview) && (
                                    <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'
                                        }`}>
                                        <img
                                            src={docPreviewUrl || getMediaUrl(formData.documentPreview)}
                                            alt="Document Preview"
                                            className="h-16 w-24 object-cover rounded-xl border border-current/20 shadow-md"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80';
                                            }}
                                        />
                                        <div>
                                            <span className="text-[10px] font-black text-[#EB1000] uppercase tracking-wider block">Document Image Active</span>
                                            <span className={`text-xs font-bold block mt-0.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                {formData.documentType === 'pan_card' ? 'PAN Card' : formData.documentType === 'aadhaar_card' ? 'Aadhaar Card' : 'Passport'} Image Loaded
                                            </span>
                                            <span className={`text-[11px] font-medium block mt-0.5 ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                                                ID #: {formData.panNumber || 'ABCDE1234F'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${theme === 'light'
                                            ? 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                                            : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E] hover:bg-[#202030] hover:text-white'
                                            }`}
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Back to Personal Info
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#EB1000] to-[#CC0E00] hover:from-[#CC0E00] hover:to-[#B30C00] text-white font-black text-xs shadow-xl shadow-[#EB1000]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Continue to Bank Details</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 3: Bank & Payout Details */}
                        {step === 3 && (
                            <form onSubmit={handleNextStep} className="space-y-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/20 shrink-0">
                                        <Building2 className="h-4 w-4" />
                                    </span>
                                    <h3 className={`font-extrabold text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                        Direct Bank Payout & UPI Destination Details
                                    </h3>
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
                                        placeholder="e.g. Abhishek Kumar"
                                        className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                            ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                            : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
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
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-medium transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
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
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-mono transition-all duration-200 ${theme === 'light'
                                                ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
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
                                            className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-mono transition-all duration-200 ${formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                                                ? 'border-[#FF3D71] bg-[#FF3D71]/10 text-[#FF3D71]'
                                                : theme === 'light'
                                                    ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                }`}
                                        />
                                        {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                                            <span className="text-[10px] text-[#FF3D71] block mt-1.5 font-bold">
                                                Account Number and Confirmation Account Number do not match.
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className={`block text-xs font-extrabold ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                                IFSC Code *
                                            </label>
                                            {bankVerificationData?.verified ? (
                                                <span className="text-[10px] font-extrabold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/30 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Cashfree Verified
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyBank}
                                                    disabled={isVerifyingBank}
                                                    className="text-[11px] font-extrabold text-[#EB1000] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isVerifyingBank ? (
                                                        <>
                                                            <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck className="h-3 w-3" /> Instant Penny Drop
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength={11}
                                                pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}"
                                                required
                                                value={formData.ifscCode}
                                                onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                                placeholder="e.g. SBIN0001234"
                                                className={`flex-1 px-4 py-3 rounded-xl border text-xs outline-none font-mono uppercase transition-all duration-200 ${theme === 'light'
                                                    ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                                    }`}
                                            />
                                            {!bankVerificationData?.verified && (
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyBank}
                                                    disabled={isVerifyingBank}
                                                    className="px-4 py-3 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/30 hover:bg-[#EB1000]/20 text-xs font-black shrink-0 transition cursor-pointer"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                        </div>
                                        {bankVerificationData?.bankName && (
                                            <p className="text-[11px] text-[#00E676] font-bold mt-1.5 flex items-center gap-1">
                                                <Check className="h-3.5 w-3.5" /> Bank: <strong>{bankVerificationData.bankName}</strong> ({bankVerificationData.accountHolderName})
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-extrabold mb-1.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-[#E2E8F0]'}`}>
                                        UPI ID (Optional Payout VPA)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.upiId}
                                        onChange={(e) => handleInputChange('upiId', e.target.value)}
                                        placeholder="e.g. creator@upi or carryminati@okicici"
                                        className={`w-full px-4 py-3 rounded-xl border text-xs outline-none font-mono transition-all duration-200 ${theme === 'light'
                                            ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                            : 'bg-[#181826] border-[#2A2A3E] text-white placeholder-[#6E6E82] focus:border-[#EB1000] focus:ring-1 focus:ring-[#EB1000]'
                                            }`}
                                    />
                                </div>

                                <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${theme === 'light'
                                            ? 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                                            : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E] hover:bg-[#202030] hover:text-white'
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

                        {/* STEP 4: Review & Legal Submit */}
                        {step === 4 && (
                            <form onSubmit={handleSubmitKyc} className="space-y-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 rounded-xl bg-[#EB1000]/10 text-[#EB1000] border border-[#EB1000]/20 shrink-0">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    <h3 className={`font-extrabold text-sm ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                        Final Review & Legal Submission Declaration
                                    </h3>
                                </div>

                                <div className={`p-5 rounded-2xl border space-y-4 text-xs transition-all ${theme === 'light' ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#181826] border-[#2A2A3E]'
                                    }`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-current/10">
                                        <div>
                                            <span className={`text-[10px] uppercase font-black tracking-wider block ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                                                Legal Full Name
                                            </span>
                                            <span className={`font-extrabold text-sm block mt-0.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                {formData.fullName} {isNameLocked ? '🔒 (Locked)' : ''}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`text-[10px] uppercase font-black tracking-wider block ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                                                Mobile & Category
                                            </span>
                                            <span className={`font-extrabold text-sm block mt-0.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                {formData.mobileCountryCode} {formData.mobileNumber} {isMobileLocked ? '🔒' : ''} &bull; <span className="text-[#EB1000]">{formData.category || 'Creator'}</span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`text-[10px] uppercase font-black tracking-wider block ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                                                Address & Location
                                            </span>
                                            <span className={`font-bold block mt-0.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                {formData.address}, {formData.city}, {formData.state}, {formData.country}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`text-[10px] uppercase font-black tracking-wider block ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                                                Document Number
                                            </span>
                                            <span className="font-mono font-black text-[#EB1000] uppercase block mt-0.5">
                                                {formData.panNumber} ({formData.documentType})
                                            </span>
                                        </div>
                                        {(formData.youtubeUrl || formData.instagramUrl || formData.linkedinUrl || formData.facebookUrl || formData.twitchUrl || formData.socialMediaUrl) && (
                                            <div className="col-span-1 sm:col-span-2">
                                                <span className={`text-[10px] uppercase font-black tracking-wider block ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                                                    Social Media Profiles
                                                </span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {formData.youtubeUrl && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-bold text-[11px] border border-red-500/20">YouTube</span>}
                                                    {formData.instagramUrl && <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-500 font-bold text-[11px] border border-pink-500/20">Instagram</span>}
                                                    {formData.linkedinUrl && <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-500 font-bold text-[11px] border border-blue-500/20">LinkedIn</span>}
                                                    {formData.facebookUrl && <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[11px] border border-blue-400/20">Facebook</span>}
                                                    {formData.twitchUrl && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold text-[11px] border border-purple-400/20">Twitch</span>}
                                                    {formData.socialMediaUrl && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[11px] border border-emerald-400/20">Portfolio</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <span className={`text-[10px] uppercase font-black tracking-wider block ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                                                Payout Bank Account
                                            </span>
                                            <span className={`font-bold block mt-0.5 ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>
                                                {formData.bankName} - A/C #{formData.accountNumber} ({formData.ifscCode})
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`text-[10px] uppercase font-black tracking-wider block ${theme === 'light' ? 'text-[#64748B]' : 'text-[#A0A0B2]'}`}>
                                                Payout UPI VPA
                                            </span>
                                            <span className="font-mono font-bold text-[#EB1000] block mt-0.5">
                                                {formData.upiId || 'Not specified'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <label className={`flex items-start gap-3 text-xs cursor-pointer p-4 rounded-xl border transition-all ${theme === 'light'
                                    ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                                    : 'bg-[#181826] border-[#2A2A3E] text-white'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeTerms}
                                        onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded accent-[#EB1000] cursor-pointer"
                                    />
                                    <span className="font-medium leading-relaxed">
                                        I declare under penalty of perjury that all provided identity documents and bank payout details are legally accurate and belong to me.
                                    </span>
                                </label>

                                <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${theme === 'light'
                                            ? 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                                            : 'bg-[#181826] text-[#A0A0B2] border border-[#2A2A3E] hover:bg-[#202030] hover:text-white'
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
                                                <span>Submit KYC for Super Admin Audit</span>
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
