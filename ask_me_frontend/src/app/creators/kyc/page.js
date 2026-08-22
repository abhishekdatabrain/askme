'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreatorSidebar from '@/components/CreatorSidebar';
import CreatorNotificationDropdown from '@/components/CreatorNotificationDropdown';
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
import { API_ENDPOINTS } from '@/config/api';
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

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('askme_creator_theme', nextTheme);
            window.dispatchEvent(new Event('creator-theme-changed'));
        }
    };

    const handleLogout = () => {
        clearCreatorSession();
        toast.info('Logged out successfully from Creator Studio.', 'Logged Out');
        setTimeout(() => {
            window.location.href = '/creators/login';
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

    // KYC Form State
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        address: '',
        country: '',
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

    const [submittedKycResult, setSubmittedKycResult] = useState(null);

    useEffect(() => {
        const savedToken = getCreatorToken();
        const user = getCreatorUser();

        if (!savedToken || !user || !user.id) {
            window.location.href = '/creators/login';
            return;
        }

        setCreatorUser(user);
        setToken(savedToken);
        setFormData(prev => ({
            ...prev,
            fullName: user.fullName || user.full_name || user.name || '',
            accountHolderName: user.fullName || user.full_name || user.name || '',
        }));

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
                        setFlowState('kyc_submitted');
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
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrorMsg('');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const fakeUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, documentPreview: fakeUrl }));
            toast.success('Document uploaded for KYC submission preview.', 'File Selected');
        }
    };

    const validateStep1 = () => {
        if (!formData.fullName.trim()) return 'Full Name is required.';
        if (!formData.panNumber.trim()) return 'PAN Number / Document Number is required.';
        return null;
    };

    const validateStep2 = () => {
        if (!formData.accountHolderName.trim()) return 'Bank Account Holder Name is required.';
        if (!formData.bankName.trim()) return 'Bank Name is required.';
        if (!formData.accountNumber.trim()) return 'Account Number is required.';
        if (formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber) {
            return 'Account numbers do not match.';
        }
        if (!formData.ifscCode.trim()) return 'IFSC Code is required.';
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
            setStep(2);
        } else if (step === 2) {
            const err = validateStep2();
            if (err) {
                setErrorMsg(err);
                toast.error(err, 'Validation Error');
                return;
            }
            setStep(3);
        }
    };

    const handleSubmitKyc = async (e) => {
        e.preventDefault();
        if (!formData.agreeTerms) {
            setErrorMsg('Please confirm legal agreement terms to submit.');
            toast.error('Legal Agreement Required', 'Form Error');
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMsg('');
            const creatorId = creatorUser?.id;

            const payload = {
                creatorId,
                fullName: formData.fullName,
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
                setFlowState('kyc_submitted');
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
        <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${
            theme === 'light' ? 'bg-[#F4F5F7] text-[#1A1D20] selection:bg-[#00F5D4] selection:text-[#0A0A0F]' : 'bg-[#0A0A0F] text-[#F5F5F7] selection:bg-[#00F5D4] selection:text-[#0A0A0F]'
        }`}>
            
            {/* Standalone Header */}
            <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-xl transition-colors duration-200 ${
                theme === 'light' ? 'border-[#E9ECEF] bg-white' : 'border-[#1C1C26] bg-[#13131A]'
            }`}>
                <div className="flex items-center gap-3">
                    <Link href="/creators/dashboard" className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-md glow-teal group-hover:scale-105 transition">
                            a
                        </div>
                        <div>
                            <span className={`font-heading font-black text-lg block leading-none ${
                                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                            }`}>
                                AskMe <span className="text-brand-gradient">STUDIO</span>
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block mt-1 ${
                                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                            }`}>
                                Standalone KYC Portal
                            </span>
                        </div>
                    </Link>
                    <div className={`h-6 w-px hidden sm:block mx-1 ${
                        theme === 'light' ? 'bg-[#E9ECEF]' : 'bg-[#1C1C26]'
                    }`} />
                    <div className="hidden sm:block">
                        <h1 className={`font-heading font-bold text-sm ${
                            theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                        }`}>KYC & Identity Verification</h1>
                        <p className={`text-[11px] ${
                            theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                        }`}>Tax compliance, identity proof, & bank account payout verification</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Notification Bell Icon Popup Dropdown */}
                    <CreatorNotificationDropdown theme={theme} />

                    {/* Header Theme Switcher Button */}
                    <button
                        onClick={toggleTheme}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                            theme === 'light'
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

                    <button
                        onClick={handleLogout}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-md ${
                            theme === 'light'
                                ? 'bg-[#E9ECEF] border-[#DEE2E6] text-[#495057] hover:text-[#FF3D71] hover:bg-[#FF3D71]/10'
                                : 'bg-[#1C1C26] border-[#1C1C26] text-[#8B8B96] hover:text-[#FF3D71] hover:bg-[#FF3D71]/10'
                        }`}
                    >
                        <LogOut className="h-4 w-4" /> Logout Studio
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">

                    {isLoadingStatus ? (
                        <div className="p-12 text-center space-y-3">
                            <Clock className="h-8 w-8 text-[#00F5D4] animate-spin mx-auto" />
                            <p className={`text-xs font-bold ${
                                theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                            }`}>Checking Creator KYC Status...</p>
                        </div>
                    ) : flowState === 'kyc_approved' ? (
                        /* --- 1. APPROVED SCREEN --- */
                        <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 animate-scale-up ${
                            theme === 'light' ? 'bg-white border-[#00E676]/40' : 'bg-[#13131A] border-[#00E676]/30'
                        }`}>
                            <div className={`flex items-center gap-4 border-b pb-6 ${
                                theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                            }`}>
                                <div className="p-3.5 rounded-2xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 shrink-0">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-extrabold uppercase tracking-wider">
                                        ✓ KYC VERIFIED & APPROVED
                                    </span>
                                    <h2 className={`font-heading font-black text-2xl mt-1 ${
                                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                    }`}>KYC Identity Verification Complete</h2>
                                    <p className={`text-xs ${
                                        theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                    }`}>Your identity documents and bank account have been verified by super admin auditors.</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link
                                    href="/creators/dashboard"
                                    className="px-6 py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition inline-flex items-center gap-2"
                                >
                                    <ShieldCheck className="h-4 w-4" /> Go to Creator Control Room Dashboard
                                </Link>
                            </div>
                        </div>
                    ) : flowState === 'kyc_submitted' ? (
                        /* --- 2. SUBMITTED & PENDING SCREEN --- */
                        <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 animate-scale-up ${
                            theme === 'light' ? 'bg-white border-[#FFD60A]/40' : 'bg-[#13131A] border-[#FFD60A]/30'
                        }`}>
                            <div className={`flex items-center gap-4 border-b pb-6 ${
                                theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                            }`}>
                                <div className="p-3.5 rounded-2xl bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30 shrink-0">
                                    <Clock className="h-8 w-8 animate-spin" />
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30 text-xs font-extrabold uppercase tracking-wider">
                                        ● KYC APPLICATION UNDER REVIEW
                                    </span>
                                    <h2 className={`font-heading font-black text-2xl mt-1 ${
                                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                    }`}>Documents Submitted & Pending Audit</h2>
                                    <p className={`text-xs ${
                                        theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                    }`}>Your PAN Card, identity proof, and bank payout details have been submitted for super admin verification.</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link
                                    href="/creators/dashboard"
                                    className="px-6 py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition inline-flex items-center gap-2"
                                >
                                    Go to Studio Dashboard
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* --- 3. FORM INPUT STEPPER --- */
                        <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 transition-colors duration-200 ${
                            theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                        }`}>
                            <div className={`flex items-center justify-between border-b pb-4 ${
                                theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                            }`}>
                                <div>
                                    <h2 className={`font-heading font-black text-xl ${
                                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                    }`}>Submit KYC Verification Details</h2>
                                    <p className={`text-xs ${
                                        theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                    }`}>Provide legally accurate PAN, government ID proof, & bank account details.</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-xs font-bold">
                                    Step {step} of 3
                                </span>
                            </div>

                            {/* Stepper Tabs */}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                        step === 1 ? 'bg-brand-gradient text-[#0A0A0F] shadow-md' : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D]' : 'bg-[#0A0A0F] text-[#8B8B96]'
                                    }`}
                                >
                                    <User className="h-3.5 w-3.5" /> 1. Identity & PAN
                                </button>
                                <button
                                    onClick={() => step > 1 && setStep(2)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                        step === 2 ? 'bg-brand-gradient text-[#0A0A0F] shadow-md' : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D]' : 'bg-[#0A0A0F] text-[#8B8B96]'
                                    }`}
                                >
                                    <Building2 className="h-3.5 w-3.5" /> 2. Bank Details
                                </button>
                                <button
                                    onClick={() => step > 2 && setStep(3)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                        step === 3 ? 'bg-brand-gradient text-[#0A0A0F] shadow-md' : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D]' : 'bg-[#0A0A0F] text-[#8B8B96]'
                                    }`}
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" /> 3. Submit
                                </button>
                            </div>

                            {/* Form Steps */}
                            {step === 1 && (
                                <form onSubmit={handleNextStep} className="space-y-4">
                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${
                                            theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                        }`}>Legal Full Name (Matching PAN/ID)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder="e.g. Abhishek Kumar"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                                                theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                            }`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold mb-1 ${
                                                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                            }`}>PAN Number / ID Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.panNumber}
                                                onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                                                placeholder="e.g. ABCDE1234F"
                                                className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                                                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-bold mb-1 ${
                                                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                            }`}>Document Type</label>
                                            <select
                                                value={formData.documentType}
                                                onChange={(e) => handleInputChange('documentType', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                                                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                            >
                                                <option value="pan_card">PAN Card (India)</option>
                                                <option value="aadhaar_card">Aadhaar Card</option>
                                                <option value="passport">Passport</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${
                                            theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                        }`}>Upload Identity Document Image</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.documentPreview}
                                                onChange={(e) => handleInputChange('documentPreview', e.target.value)}
                                                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                                                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                            />
                                            <label className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                                                theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#252533]'
                                            }`}>
                                                <Upload className="h-4 w-4 text-[#00F5D4]" /> Pick File
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md hover:opacity-90 transition flex items-center gap-1.5"
                                        >
                                            Continue to Bank Details →
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleNextStep} className="space-y-4">
                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${
                                            theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                        }`}>Bank Account Holder Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.accountHolderName}
                                            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                                            placeholder="e.g. Abhishek Kumar"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                                                theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                            }`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold mb-1 ${
                                                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                            }`}>Bank Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.bankName}
                                                onChange={(e) => handleInputChange('bankName', e.target.value)}
                                                placeholder="e.g. HDFC Bank"
                                                className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                                                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-bold mb-1 ${
                                                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                            }`}>Account Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.accountNumber}
                                                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                                placeholder="e.g. 50100298410294"
                                                className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                                                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold mb-1 ${
                                                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                            }`}>IFSC Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.ifscCode}
                                                onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                                                placeholder="e.g. HDFC0000240"
                                                className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${
                                                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-xs font-bold mb-1 ${
                                                theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                            }`}>UPI ID (Optional Payout VPA)</label>
                                            <input
                                                type="text"
                                                value={formData.upiId}
                                                onChange={(e) => handleInputChange('upiId', e.target.value)}
                                                placeholder="e.g. creator@upi"
                                                className={`w-full px-4 py-2.5 rounded-xl border text-xs text-[#00F5D4] focus:outline-none focus:border-[#00F5D4] ${
                                                    theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold ${
                                                theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#252533]'
                                            }`}
                                        >
                                            ← Back to Step 1
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md hover:opacity-90 transition flex items-center gap-1.5"
                                        >
                                            Review & Legal Submit →
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleSubmitKyc} className="space-y-4">
                                    <h3 className={`font-bold text-base ${
                                        theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                    }`}>Step 3: Legal Declaration & Submission</h3>

                                    <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                                        theme === 'light' ? 'bg-[#F8F9FA] border-[#E9ECEF]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                                    }`}>
                                        <div className={`flex justify-between border-b pb-2 ${
                                            theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                                        }`}>
                                            <span className={theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}>Legal Name:</span>
                                            <span className={`font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>{formData.fullName}</span>
                                        </div>
                                        <div className={`flex justify-between border-b pb-2 ${
                                            theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                                        }`}>
                                            <span className={theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}>PAN Number:</span>
                                            <span className="font-bold text-[#00F5D4]">{formData.panNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}>Payout Account:</span>
                                            <span className={`font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>{formData.bankName} ({formData.accountNumber})</span>
                                        </div>
                                    </div>

                                    <label className={`flex items-start gap-2 text-xs cursor-pointer ${
                                        theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.agreeTerms}
                                            onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                                            className="mt-0.5 rounded accent-[#00F5D4]"
                                        />
                                        <span>I declare that all provided identity proofs and bank payout details are accurate and belong to me.</span>
                                    </label>

                                    <div className="pt-4 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold ${
                                                theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#252533]'
                                            }`}
                                        >
                                            ← Back to Step 2
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Submitting KYC...' : 'Submit KYC for Super Admin Audit'}
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
