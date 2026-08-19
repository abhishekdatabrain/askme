'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreatorSidebar from '@/components/CreatorSidebar';
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
    LogOut
} from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import { getCreatorToken, getCreatorUser, clearCreatorSession } from '@/utils/cookies';

export default function CreatorKycPage() {
    const { toast } = useToast();
    const router = useRouter();

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
                    } else if (kycInfo.isSubmitted) {
                        setFlowState('kyc_submitted');
                    } else {
                        setFlowState('kyc_form');
                    }
                }
            } catch (err) {
                console.warn('KYC status fetch notice:', err.message);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        checkKycStatus();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleInputChange('documentPreview', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNextToStep2 = (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!formData.fullName.trim()) {
            setErrorMsg('Please enter your full legal name matching identity document.');
            return;
        }
        if (!formData.panNumber.trim()) {
            setErrorMsg('Please enter your PAN Card / Government Document number.');
            return;
        }
        setStep(2);
    };

    const handleNextToStep3 = (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!formData.accountNumber.trim()) {
            setErrorMsg('Please enter your Bank Account number for payouts.');
            return;
        }
        if (formData.accountNumber !== formData.confirmAccountNumber) {
            setErrorMsg('Bank Account number and Confirmation do not match.');
            return;
        }
        if (!formData.ifscCode.trim()) {
            setErrorMsg('Please enter valid IFSC Code.');
            return;
        }
        setStep(3);
    };

    const handleSubmitKyc = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!formData.agreeTerms) {
            setErrorMsg('You must agree to the legal payout declaration to submit KYC.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                creatorId: creatorUser?.id || 1,
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
        <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] font-sans flex flex-col selection:bg-[#00F5D4] selection:text-[#0A0A0F]">
            
            {/* Standalone Header */}
            <header className="border-b border-[#1C1C26] bg-[#13131A] sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                    <Link href="/creators/dashboard" className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-xl shadow-md glow-teal group-hover:scale-105 transition">
                            a
                        </div>
                        <div>
                            <span className="font-heading font-black text-lg text-white block leading-none">
                                AskMe <span className="text-brand-gradient">STUDIO</span>
                            </span>
                            <span className="text-[10px] font-bold text-[#8B8B96] uppercase tracking-wider block mt-1">
                                Standalone KYC Portal
                            </span>
                        </div>
                    </Link>
                    <div className="h-6 w-px bg-[#1C1C26] hidden sm:block mx-1" />
                    <div className="hidden sm:block">
                        <h1 className="font-heading font-bold text-sm text-white">KYC & Identity Verification</h1>
                        <p className="text-[11px] text-[#8B8B96]">Tax compliance, identity proof, & bank account payout verification</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-[#1C1C26] text-[#8B8B96] hover:text-[#FF3D71] hover:bg-[#FF3D71]/10 text-xs font-bold transition-all border border-[#1C1C26] flex items-center gap-1.5 shadow-md"
                >
                    <LogOut className="h-4 w-4" /> Logout Studio
                </button>
            </header>

            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">

                    {isLoadingStatus ? (
                        <div className="p-12 text-center space-y-3">
                            <Clock className="h-8 w-8 text-[#00F5D4] animate-spin mx-auto" />
                            <p className="text-xs font-bold text-[#8B8B96]">Checking Creator KYC Status...</p>
                        </div>
                    ) : flowState === 'kyc_approved' ? (
                        /* --- 1. APPROVED SCREEN --- */
                        <div className="p-8 rounded-3xl bg-[#13131A] border border-[#00E676]/30 shadow-2xl space-y-6 animate-scale-up">
                            <div className="flex items-center gap-4 border-b border-[#1C1C26] pb-6">
                                <div className="p-3.5 rounded-2xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 shrink-0">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-extrabold border border-[#00E676]/30 uppercase tracking-wider">
                                        ✓ KYC VERIFIED & COMPLIANT
                                    </span>
                                    <h2 className="font-heading font-black text-2xl text-white mt-1">KYC Verification Approved!</h2>
                                    <p className="text-xs text-[#8B8B96]">Your tax documents and bank account have been verified by Super Admin.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                                    <span className="text-[10px] text-[#8B8B96] font-bold uppercase">Payout Status</span>
                                    <p className="font-extrabold text-[#00E676] text-sm">85% Revenue Payout Enabled</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                                    <span className="text-[10px] text-[#8B8B96] font-bold uppercase">Verified Bank Account</span>
                                    <p className="font-extrabold text-white text-sm">
                                        {submittedKycResult?.bank?.bankName || 'HDFC Bank'} ({submittedKycResult?.bank?.accountNumber || 'XXXX-1234'})
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                                    <span className="text-[10px] text-[#8B8B96] font-bold uppercase">Tax Proof</span>
                                    <p className="font-extrabold text-[#00F5D4] text-sm">
                                        PAN Card Verified ({submittedKycResult?.kyc?.panNumber || 'ABCDE1234F'})
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <Link
                                    href="/creators/dashboard"
                                    className="px-6 py-3 rounded-2xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-xl glow-teal hover:opacity-95 transition"
                                >
                                    Go to Creator Control Room Dashboard →
                                </Link>
                            </div>
                        </div>
                    ) : flowState === 'kyc_rejected' ? (
                        /* --- 2. REJECTED SCREEN WITH REASON BANNER --- */
                        <div className="p-8 rounded-3xl bg-[#13131A] border border-[#FF3D71]/30 shadow-2xl space-y-6 animate-scale-up">
                            <div className="flex items-center gap-4 border-b border-[#1C1C26] pb-6">
                                <div className="p-3.5 rounded-2xl bg-[#FF3D71]/10 text-[#FF3D71] border border-[#FF3D71]/30 shrink-0">
                                    <XCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-[#FF3D71]/10 text-[#FF3D71] text-xs font-extrabold border border-[#FF3D71]/30 uppercase tracking-wider">
                                        ✕ KYC VERIFICATION REJECTED
                                    </span>
                                    <h2 className="font-heading font-black text-2xl text-white mt-1">KYC Application Action Required</h2>
                                    <p className="text-xs text-[#8B8B96]">Your KYC verification application was reviewed and requires correction.</p>
                                </div>
                            </div>

                            {/* Prominent Red Rejection Reason Box */}
                            <div className="p-5 rounded-2xl bg-[#FF3D71]/10 border border-[#FF3D71]/30 space-y-2">
                                <div className="flex items-center gap-2 text-[#FF3D71] font-bold text-xs uppercase tracking-wider">
                                    <AlertTriangle className="h-4 w-4" /> Admin Rejection Reason:
                                </div>
                                <p className="text-sm font-semibold text-white">
                                    {submittedKycResult?.rejectionReason || submittedKycResult?.kyc?.rejectionReason || 'Document information unreadable or PAN mismatch. Please re-upload clear government identity proof.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] text-xs text-[#8B8B96]">
                                Please click the button below to update your legal identity documents or bank payout details and re-submit for review.
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    onClick={() => setFlowState('kyc_form')}
                                    className="px-6 py-3 rounded-2xl bg-[#FF3D71] text-white font-bold text-xs shadow-xl hover:opacity-90 transition flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" /> Re-submit Corrected KYC Verification Now
                                </button>
                            </div>
                        </div>
                    ) : flowState === 'kyc_submitted' ? (
                        /* --- 3. SUBMITTED PENDING AUDIT SCREEN --- */
                        <div className="p-8 rounded-3xl bg-[#13131A] border border-[#1C1C26] shadow-2xl space-y-6 animate-scale-up">
                            <div className="flex items-center gap-4 border-b border-[#1C1C26] pb-6">
                                <div className="p-3.5 rounded-2xl bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/30 shrink-0">
                                    <Clock className="h-8 w-8 animate-spin" />
                                </div>
                                <div>
                                    <span className="px-3 py-1 rounded-full bg-[#FFD60A]/10 text-[#FFD60A] text-xs font-extrabold border border-[#FFD60A]/30 uppercase tracking-wider">
                                        ● KYC VERIFICATION PENDING
                                    </span>
                                    <h2 className="font-heading font-black text-2xl text-white mt-1">Verification Under Review</h2>
                                    <p className="text-xs text-[#8B8B96]">Estimated audit time: 12-24 Hours</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                                    <span className="text-[10px] text-[#8B8B96] font-bold uppercase">Submitted Account Holder</span>
                                    <p className="font-bold text-white text-sm">{submittedKycResult?.bank?.accountHolderName || creatorUser?.fullName || 'Creator'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-1">
                                    <span className="text-[10px] text-[#8B8B96] font-bold uppercase">Submitted Bank Details</span>
                                    <p className="font-bold text-white text-sm">
                                        {submittedKycResult?.bank?.bankName || 'HDFC Bank'} ({submittedKycResult?.bank?.accountNumber || 'XXXX-1234'})
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-between items-center border-t border-[#1C1C26] pt-4">
                                <span className="text-xs text-[#8B8B96]">Need to make changes? You can update submitted details anytime.</span>
                                <button
                                    onClick={() => setFlowState('kyc_form')}
                                    className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white hover:bg-[#252533] text-xs font-bold transition"
                                >
                                    Edit Submitted Details
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* --- 4. KYC VERIFICATION MULTI-STEP FORM --- */
                        <div className="rounded-3xl bg-[#13131A] border border-[#1C1C26] p-6 lg:p-8 shadow-2xl space-y-6">
                            
                            {/* Step Progress Bar */}
                            <div className="grid grid-cols-3 gap-2 border-b border-[#1C1C26] pb-6">
                                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${step >= 1 ? 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30' : 'bg-[#0A0A0F] text-[#8B8B96]'}`}>
                                    <User className="h-4 w-4 shrink-0" />
                                    <span>1. Personal & ID Proof</span>
                                </div>
                                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${step >= 2 ? 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30' : 'bg-[#0A0A0F] text-[#8B8B96]'}`}>
                                    <Building2 className="h-4 w-4 shrink-0" />
                                    <span>2. Bank Account & Payout</span>
                                </div>
                                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${step >= 3 ? 'bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30' : 'bg-[#0A0A0F] text-[#8B8B96]'}`}>
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    <span>3. Review & Submit</span>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-3.5 rounded-2xl bg-[#FF3D71]/10 border border-[#FF3D71]/30 text-[#FF3D71] text-xs font-bold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {step === 1 && (
                                <form onSubmit={handleNextToStep2} className="space-y-4">
                                    <h3 className="font-bold text-white text-base">Step 1: Personal Details & Identity Proof</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Full Legal Name (matching document)</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.fullName}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                placeholder="Abhishek Kumar"
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Document Type</label>
                                            <select
                                                value={formData.documentType}
                                                onChange={(e) => handleInputChange('documentType', e.target.value)}
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                            >
                                                <option value="pan_card">PAN Card (Recommended for Tax Payouts)</option>
                                                <option value="adhar_card">Aadhaar Card / National ID</option>
                                                <option value="driving_license">Driving License</option>
                                                <option value="passport">Passport</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">PAN Card / ID Document Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.panNumber}
                                                onChange={(e) => handleInputChange('panNumber', e.target.value)}
                                                placeholder="ABCDE1234F"
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white uppercase focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">State & City</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={formData.state}
                                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                                    placeholder="State (e.g. Maharashtra)"
                                                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                    placeholder="City (e.g. Mumbai)"
                                                    className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Date of Birth (Optional)</label>
                                            <input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-xl bg-brand-gradient text-[#0A0A0F] font-bold text-xs shadow-md hover:opacity-90 transition flex items-center gap-1.5"
                                        >
                                            Proceed to Bank Account Setup →
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleNextToStep3} className="space-y-4">
                                    <h3 className="font-bold text-white text-base">Step 2: Bank Account & Payout Setup</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Account Holder Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.accountHolderName}
                                                onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                                                placeholder="Abhishek Kumar"
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Bank Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.bankName}
                                                onChange={(e) => handleInputChange('bankName', e.target.value)}
                                                placeholder="HDFC Bank / ICICI Bank"
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Account Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.accountNumber}
                                                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                                placeholder="5010023456789"
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Confirm Account Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.confirmAccountNumber}
                                                onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                                                placeholder="Confirm account number"
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">IFSC Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.ifscCode}
                                                onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                                placeholder="HDFC0001234"
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white uppercase focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[#8B8B96] mb-1">Instant UPI VPA ID (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.upiId}
                                                onChange={(e) => handleInputChange('upiId', e.target.value)}
                                                placeholder="creator@okaxis"
                                                className="w-full rounded-xl bg-[#0A0A0F] border border-[#1C1C26] px-3 py-2 text-xs text-white focus:border-[#00F5D4] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold"
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
                                    <h3 className="font-bold text-white text-base">Step 3: Legal Declaration & Submission</h3>

                                    <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-[#1C1C26] space-y-2 text-xs">
                                        <div className="flex justify-between border-b border-[#1C1C26] pb-2">
                                            <span className="text-[#8B8B96]">Legal Name:</span>
                                            <span className="font-bold text-white">{formData.fullName}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#1C1C26] pb-2">
                                            <span className="text-[#8B8B96]">PAN Number:</span>
                                            <span className="font-bold text-[#00F5D4]">{formData.panNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#8B8B96]">Payout Account:</span>
                                            <span className="font-bold text-white">{formData.bankName} ({formData.accountNumber})</span>
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-2 text-xs text-[#8B8B96] cursor-pointer">
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
                                            className="px-4 py-2 rounded-xl bg-[#1C1C26] text-white text-xs font-bold"
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
