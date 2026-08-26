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

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const fakeUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, documentPreview: fakeUrl }));
            toast.success('Document uploaded for KYC submission preview.', 'File Selected');
        }
    };

    const validateStep1 = () => {
        if (!formData.fullName.trim()) return 'Legal Full Name is required.';
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

            {/* Standalone Header */}
            <header className={`border-b sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-xl transition-colors duration-200 ${theme === 'light' ? 'border-[#E9ECEF] bg-white' : 'border-[#1C1C26] bg-[#13131A]'
                }`}>
                <div className="flex items-center gap-3">
                    <Link href="/creators/dashboard" className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-md glow-teal group-hover:scale-105 transition">
                            a
                        </div>
                        <div>
                            <span className={`font-heading font-black text-lg block leading-none ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                                }`}>
                                AskMe <span className="text-brand-gradient">STUDIO</span>
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block mt-1 ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                                }`}>
                                Standalone KYC Portal
                            </span>
                        </div>
                    </Link>
                    <div className={`h-6 w-px hidden sm:block mx-1 ${theme === 'light' ? 'bg-[#E9ECEF]' : 'bg-[#1C1C26]'
                        }`} />
                    <div className="hidden sm:block">
                        <h1 className={`font-heading font-bold text-sm ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'
                            }`}>KYC & Identity Verification</h1>
                        <p className={`text-[11px] ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'
                            }`}>Tax compliance, identity proof, & bank account payout verification</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Notification Bell Icon Popup Dropdown */}
                    <CreatorNotificationDropdown theme={theme} />

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

                    <button
                        onClick={handleLogout}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-md ${theme === 'light'
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
                                className="px-6 py-3 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition inline-flex items-center gap-2"
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
                    <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 transition-colors duration-200 ${theme === 'light' ? 'bg-white border-[#E9ECEF]' : 'bg-[#13131A] border-[#1C1C26]'
                        }`}>
                        <div className={`flex items-center justify-between border-b pb-4 ${theme === 'light' ? 'border-[#E9ECEF]' : 'border-[#1C1C26]'
                            }`}>
                            <div>
                                <h2 className={`font-heading font-black text-xl ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                    Submit KYC Verification Details
                                </h2>
                                <p className={`text-xs ${theme === 'light' ? 'text-[#6C757D]' : 'text-[#8B8B96]'}`}>
                                    Provide legally accurate personal info, government ID proof, & bank account details.
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30 text-xs font-bold">
                                Step {step} of 4
                            </span>
                        </div>

                        {/* Stepper Tabs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                                onClick={() => setStep(1)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${step === 1 ? 'bg-brand-gradient text-[#0A0A0F] shadow-md' : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D]' : 'bg-[#0A0A0F] text-[#8B8B96]'
                                    }`}
                            >
                                <User className="h-3.5 w-3.5 shrink-0" /> 1. Personal Info
                            </button>
                            <button
                                onClick={() => step > 1 && setStep(2)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${step === 2 ? 'bg-brand-gradient text-[#0A0A0F] shadow-md' : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D]' : 'bg-[#0A0A0F] text-[#8B8B96]'
                                    }`}
                            >
                                <FileText className="h-3.5 w-3.5 shrink-0" /> 2. Document Proof
                            </button>
                            <button
                                onClick={() => step > 2 && setStep(3)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${step === 3 ? 'bg-brand-gradient text-[#0A0A0F] shadow-md' : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D]' : 'bg-[#0A0A0F] text-[#8B8B96]'
                                    }`}
                            >
                                <Building2 className="h-3.5 w-3.5 shrink-0" /> 3. Bank Details
                            </button>
                            <button
                                onClick={() => step > 3 && setStep(4)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${step === 4 ? 'bg-brand-gradient text-[#0A0A0F] shadow-md' : theme === 'light' ? 'bg-[#F1F3F5] text-[#6C757D]' : 'bg-[#0A0A0F] text-[#8B8B96]'
                                    }`}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> 4. Review & Submit
                            </button>
                        </div>

                        {/* STEP 1: Personal & Address Details */}
                        {step === 1 && (
                            <form onSubmit={handleNextStep} className="space-y-4">
                                <h3 className={`font-bold text-sm flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                    <User className="h-4 w-4 text-[#00F5D4]" /> Personal Information & Residential Address
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            Legal Full Name (Matching PAN/ID) *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder="e.g. Abhishek Kumar"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            Date of Birth *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.dateOfBirth || ''}
                                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                        Residential Address *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address || ''}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Flat / House No. / Street Address / Area"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                            }`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            Country *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.country || ''}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            placeholder="e.g. India"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.state || ''}
                                            onChange={(e) => handleInputChange('state', e.target.value)}
                                            placeholder="e.g. Delhi / Maharashtra"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city || ''}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            placeholder="e.g. New Delhi / Mumbai"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md hover:opacity-90 transition flex items-center gap-1.5"
                                    >
                                        Continue to Document Proof →
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2: Document Proof Details */}
                        {step === 2 && (
                            <form onSubmit={handleNextStep} className="space-y-4">
                                <h3 className={`font-bold text-sm flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                    <FileText className="h-4 w-4 text-[#00F5D4]" /> Government Identity Document Proof
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            Document Type *
                                        </label>
                                        <select
                                            value={formData.documentType}
                                            onChange={(e) => handleInputChange('documentType', e.target.value)}
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        >
                                            <option value="pan_card">PAN Card (India)</option>
                                            <option value="aadhaar_card">Aadhaar Card</option>
                                            <option value="passport">Passport</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            ID / Document Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.panNumber}
                                            onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                                            placeholder="e.g. ABCDE1234F"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] font-mono uppercase ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                        Upload Identity Document Image *
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={formData.documentPreview}
                                            onChange={(e) => handleInputChange('documentPreview', e.target.value)}
                                            placeholder="Document image URL or click upload button"
                                            className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] font-mono ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                        <label className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shrink-0 ${theme === 'light' ? 'bg-[#00F5D4]/10 text-[#007A6B] border border-[#00F5D4]/40 hover:bg-[#00F5D4]/20' : 'bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/30 hover:bg-[#00F5D4]/30'
                                            }`}>
                                            <Upload className="h-4 w-4 text-[#00F5D4]" /> Pick Image File
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                </div>

                                {/* Live Document Preview Thumbnail Card */}
                                {formData.documentPreview && (
                                    <div className={`p-3 rounded-2xl border flex items-center gap-3 ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                                        }`}>
                                        <img
                                            src={formData.documentPreview}
                                            alt="Document Preview"
                                            className="h-16 w-24 object-cover rounded-lg border border-current/20 shadow-sm"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80';
                                            }}
                                        />
                                        <div>
                                            <span className="text-[10px] font-bold text-[#00F5D4] uppercase tracking-wider block">Document Image Active</span>
                                            <span className={`text-xs font-semibold block ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                                {formData.documentType === 'pan_card' ? 'PAN Card' : formData.documentType === 'aadhaar_card' ? 'Aadhaar Card' : 'Passport'} Image Loaded
                                            </span>
                                            <span className="text-[11px] text-[#8B8B96]">ID #: {formData.panNumber || 'ABCDE1234F'}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold ${theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#252533]'
                                            }`}
                                    >
                                        ← Back to Personal Info
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md hover:opacity-90 transition flex items-center gap-1.5"
                                    >
                                        Continue to Bank Details →
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 3: Bank & Payout Details */}
                        {step === 3 && (
                            <form onSubmit={handleNextStep} className="space-y-4">
                                <h3 className={`font-bold text-sm flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                    <Building2 className="h-4 w-4 text-[#00F5D4]" /> Direct Bank Payout & UPI Destination Details
                                </h3>

                                <div>
                                    <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                        Bank Account Holder Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.accountHolderName}
                                        onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                                        placeholder="e.g. Abhishek Kumar"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                            }`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            Bank Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.bankName}
                                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                                            placeholder="e.g. HDFC Bank / ICICI Bank"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
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
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] font-mono ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
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
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] font-mono ${formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                                                    ? 'border-[#FF3D71] bg-[#FF3D71]/10 text-[#FF3D71]'
                                                    : theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                        {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                                            <span className="text-[10px] text-[#FF3D71] block mt-1 font-semibold">
                                                Account Number and Confirmation Account Number do not match.
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                            IFSC Code *
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={11}
                                            pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}"
                                            required
                                            value={formData.ifscCode}
                                            onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                            placeholder="e.g. SBIN0001234"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#00F5D4] font-mono uppercase ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#0A0A0F] border-[#1C1C26] text-white'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-bold mb-1 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                        UPI ID (Optional Payout VPA)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.upiId}
                                        onChange={(e) => handleInputChange('upiId', e.target.value)}
                                        placeholder="e.g. creator@upi or carryminati@okicici"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-xs text-[#00F5D4] font-mono focus:outline-none focus:border-[#00F5D4] ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                                            }`}
                                    />
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold ${theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#252533]'
                                            }`}
                                    >
                                        ← Back to Document Proof
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md hover:opacity-90 transition flex items-center gap-1.5"
                                    >
                                        Review & Final Submit →
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 4: Review & Legal Submit */}
                        {step === 4 && (
                            <form onSubmit={handleSubmitKyc} className="space-y-5">
                                <h3 className={`font-bold text-sm flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                    <CheckCircle2 className="h-4 w-4 text-[#00F5D4]" /> Final Review & Legal Submission Declaration
                                </h3>

                                <div className={`p-4 rounded-2xl border space-y-3 text-xs ${theme === 'light' ? 'bg-[#F8F9FA] border-[#DEE2E6]' : 'bg-[#0A0A0F] border-[#1C1C26]'
                                    }`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-current/10">
                                        <div>
                                            <span className="text-[10px] text-[#8B8B96] block uppercase font-bold">Legal Full Name</span>
                                            <span className={`font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>{formData.fullName}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-[#8B8B96] block uppercase font-bold">Date of Birth</span>
                                            <span className={`font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>{formData.dateOfBirth || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-[#8B8B96] block uppercase font-bold">Address & Location</span>
                                            <span className={`font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                                {formData.address}, {formData.city}, {formData.state}, {formData.country}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-[#8B8B96] block uppercase font-bold">Document Number</span>
                                            <span className="font-mono font-bold text-[#00F5D4] uppercase">{formData.panNumber} ({formData.documentType})</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-[10px] text-[#8B8B96] block uppercase font-bold">Payout Bank Account</span>
                                            <span className={`font-bold ${theme === 'light' ? 'text-[#1A1D20]' : 'text-white'}`}>
                                                {formData.bankName} - A/C #{formData.accountNumber} ({formData.ifscCode})
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-[#8B8B96] block uppercase font-bold">Payout UPI VPA</span>
                                            <span className="font-mono font-bold text-[#00F5D4]">{formData.upiId || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>

                                <label className={`flex items-start gap-2.5 text-xs cursor-pointer p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-[#DEE2E6] text-[#1A1D20]' : 'bg-[#14141E] border-[#222230] text-white'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeTerms}
                                        onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                                        className="mt-0.5 rounded accent-[#00F5D4]"
                                    />
                                    <span>I declare under penalty of perjury that all provided identity documents and bank payout details are legally accurate and belong to me.</span>
                                </label>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold ${theme === 'light' ? 'bg-[#E9ECEF] text-[#1A1D20] hover:bg-[#DEE2E6]' : 'bg-[#1C1C26] text-white hover:bg-[#252533]'
                                            }`}
                                    >
                                        ← Back to Bank Details
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md glow-teal hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Submitting KYC...
                                            </>
                                        ) : (
                                            'Submit KYC for Super Admin Audit'
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
