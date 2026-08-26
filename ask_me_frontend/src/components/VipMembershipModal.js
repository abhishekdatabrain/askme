'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ArrowLeft, Shield, Sparkles, CreditCard, Smartphone, Building, Wallet, CheckCircle2, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

export default function VipMembershipModal({ isOpen, onClose, creator, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Choose Plan, 2: Checkout, 3: Gateway Processing, 4: Payment Success, 5: Subscription Created
  const [selectedPayMethod, setSelectedPayMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);

  // Dynamic Plans State
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'VIP Membership',
      price: 999,
      interval: 'Month',
      badgeColor: 'bg-[#FFD60A]',
      perks: [
        'VIP Badge in Live Chat & Profile',
        'Priority in Live Q&A Stream Queue',
        'Exclusive VIP Member Content',
        'Early Access to Videos & Announcements',
        'Member Only Live Sessions',
        'Custom Emojis & Badges',
      ],
    },
    {
      id: 2,
      name: 'Premium Pass',
      price: 499,
      interval: 'Month',
      badgeColor: 'bg-[#7B2FFF]',
      perks: [
        'Priority in Live Q&A Stream Queue',
        'Exclusive Member Content',
        'Early Access to Videos',
        'Custom Badges',
      ],
    },
    {
      id: 3,
      name: 'Basic Supporter',
      price: 99,
      interval: 'Month',
      badgeColor: 'bg-[#38BDF8]',
      perks: ['Supporter Badge in Live Chat', 'Custom Emojis'],
    },
  ]);

  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Fetch Dynamic Plans from Backend
  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch(API_ENDPOINTS.VIEWERS.VIP_PLANS);
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data?.plans && data.data.plans.length > 0) {
        setPlans(data.data.plans);
        setSelectedPlan(data.data.plans[0]);
      }
    } catch (err) {
      console.warn("Fetch VIP plans notice:", err.message);
    } finally {
      setLoadingPlans(false);
    }
  };

  if (!isOpen || !creator) return null;

  const creatorName = creator.fullName || creator.name || 'Creator';
  const cleanUsername = String(creator.username || creator.cleanUsername || 'creator').replace(/^@+/, '');

  const handleStartCheckout = () => {
    setStep(2);
  };

  const handleProcessPayment = async () => {
    setProcessing(true);
    setStep(3);

    const planAmount = selectedPlan?.price || 999;
    const planName = selectedPlan?.name || 'VIP Membership';

    // Simulate payment gateway delay (1.5 seconds)
    setTimeout(async () => {
      const generatedTxnId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('askme_token') : null;
        const res = await fetch(API_ENDPOINTS.VIEWERS.VIP_SUBSCRIBE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            creatorId: creator.creatorId || creator.id,
            planName: planName,
            amount: planAmount,
            transactionId: generatedTxnId,
            paymentMethod: selectedPayMethod,
          }),
        });

        const data = await res.json();

        // Next Billing Date: 30 days from now
        const nextBilling = new Date();
        nextBilling.setDate(nextBilling.getDate() + 30);
        const dateFormatted = nextBilling.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const details = {
          txnId: generatedTxnId,
          planName: planName,
          amount: planAmount,
          nextBillingDate: dateFormatted,
          creatorName,
        };

        setTxnDetails(details);
        setProcessing(false);
        setStep(4);

        if (onSuccess) {
          onSuccess(details);
        }
      } catch (err) {
        console.warn('VIP Subscription error:', err.message);
        // Fallback simulation
        const nextBilling = new Date();
        nextBilling.setDate(nextBilling.getDate() + 30);
        const dateFormatted = nextBilling.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const details = {
          txnId: generatedTxnId,
          planName: planName,
          amount: planAmount,
          nextBillingDate: dateFormatted,
          creatorName,
        };
        setTxnDetails(details);
        setProcessing(false);
        setStep(4);
        if (onSuccess) onSuccess(details);
      }
    }, 1500);
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#13131A] border border-[#262007] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-white">

        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-[#1C1C26] text-[#8B8B96] hover:text-white flex items-center justify-center transition z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* STEP 1: CHOOSE MEMBERSHIP PLAN */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <h3 className="font-heading font-black text-xl text-white">
                Choose Membership Plan
              </h3>
              <p className="text-xs text-[#8B8B96]">
                Support <span className="text-[#FFD60A] font-bold">{creatorName}</span> and unlock exclusive perks
              </p>
            </div>

            {/* DYNAMIC PLAN TABS / SELECTOR */}
            {loadingPlans ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-[#8B8B96] text-xs">
                <Loader2 className="h-6 w-6 animate-spin text-[#FFD60A]" />
                <span>Loading available plans...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* SELECT PLAN PILLS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {plans.map((p) => {
                    const isSel = selectedPlan?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlan(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                          isSel
                            ? 'bg-[#FFD60A] text-black shadow-md'
                            : 'bg-[#181820] text-[#8B8B96] border border-[#262007] hover:text-white'
                        }`}
                      >
                        <span>💎</span>
                        <span>{p.name} (₹{p.price})</span>
                      </button>
                    );
                  })}
                </div>

                {/* SELECTED PLAN CARD */}
                {selectedPlan && (
                  <div className="p-5 rounded-2xl bg-[#1C1805] border-2 border-[#B38F00] shadow-xl relative space-y-4 animate-fadeIn">
                    <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                      Popular Choice
                    </span>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💎</span>
                        <span className="font-heading font-black text-lg text-white">{selectedPlan.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-heading font-black text-2xl text-[#FFD60A]">₹{selectedPlan.price}</span>
                        <span className="text-[10px] text-[#8B8B96] block">/ {selectedPlan.interval || 'Month'}</span>
                      </div>
                    </div>

                    {/* BENEFITS CHECKLIST */}
                    <div className="space-y-2.5 pt-2 border-t border-[#332700]/60">
                      {(Array.isArray(selectedPlan.perks) && selectedPlan.perks.length > 0
                        ? selectedPlan.perks
                        : [
                            'VIP Badge in Live Chat & Profile',
                            'Priority in Live Q&A Stream Queue',
                            'Exclusive VIP Member Content',
                            'Early Access to Videos & Announcements',
                          ]
                      ).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#D4D4DE]">
                          <Check className="h-4 w-4 text-[#00E676] shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                      onClick={handleStartCheckout}
                      className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#FF7043] hover:to-[#FF8A65] text-white font-black text-sm transition shadow-xl glow-pay"
                    >
                      Join for ₹{selectedPlan.price} / {selectedPlan.interval || 'Month'}
                    </button>

                    <p className="text-[10px] text-center text-[#8B8B96]">
                      Cancel anytime from your Viewer Studio
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="h-8 w-8 rounded-full bg-[#1C1C26] text-[#8B8B96] hover:text-white flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h3 className="font-heading font-black text-lg text-white">
                Checkout
              </h3>
            </div>

            {/* ORDER SUMMARY */}
            <div className="p-4 rounded-2xl bg-[#1C1805] border border-[#B38F00]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💎</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedPlan?.name || 'VIP Membership'} – {creatorName}</h4>
                  <p className="text-xs text-[#8B8B96]">₹{selectedPlan?.price || 999} / {selectedPlan?.interval || 'Month'}</p>
                </div>
              </div>
              <span className="font-black text-lg text-[#FFD60A]">₹{selectedPlan?.price || 999}</span>
            </div>

            {/* PAYMENT METHOD SELECTION */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#8B8B96] uppercase tracking-wider block">
                Pay Using
              </label>

              <div className="space-y-2">
                {[
                  { id: 'upi', label: 'UPI', desc: 'Paytm, PhonePe, GPay, BHIM', icon: Smartphone },
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', desc: 'All Major Indian Banks', icon: Building },
                  { id: 'wallet', label: 'Wallet', desc: 'Paytm Wallet, Mobikwik', icon: Wallet },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSel = selectedPayMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPayMethod(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                        isSel
                          ? 'bg-[#1F1905] border-[#FFD60A] text-white'
                          : 'bg-[#181820] border-[#22222E] text-[#8B8B96] hover:border-[#333344]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className={`h-5 w-5 ${isSel ? 'text-[#FFD60A]' : 'text-[#8B8B96]'}`} />
                        <div>
                          <p className="font-bold text-xs text-white">{item.label}</p>
                          <p className="text-[10px] text-[#8B8B96]">{item.desc}</p>
                        </div>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSel ? 'border-[#FFD60A] bg-[#FFD60A]' : 'border-[#444455]'
                      }`}>
                        {isSel && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedPayMethod === 'upi' && (
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. mobile@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181820] border border-[#2A2A3A] text-xs text-white focus:outline-none focus:border-[#FFD60A]"
                  />
                </div>
              )}
            </div>

            {/* PAY BUTTON */}
            <button
              onClick={handleProcessPayment}
              className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#FF7043] hover:to-[#FF8A65] text-white font-black text-sm transition shadow-xl glow-pay"
            >
              Pay ₹{selectedPlan?.price || 999}
            </button>
          </div>
        )}

        {/* STEP 3: GATEWAY PROCESSING */}
        {step === 3 && (
          <div className="p-10 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-[#1C1805] border-2 border-[#FFD60A] animate-spin mx-auto flex items-center justify-center text-xl">
              💎
            </div>
            <h3 className="font-heading font-black text-lg text-white">
              Processing Payment...
            </h3>
            <p className="text-xs text-[#8B8B96]">
              Connecting with secure gateway. Please do not close this window.
            </p>
          </div>
        )}

        {/* STEP 4: PAYMENT SUCCESS */}
        {step === 4 && (
          <div className="p-8 text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-[#00E676]/20 border-2 border-[#00E676] mx-auto flex items-center justify-center text-[#00E676]">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-black text-2xl text-white">
                Payment Successful!
              </h3>
              <p className="text-xs text-[#8B8B96]">Thank you for your support.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#181820] border border-[#22222E] space-y-2">
              <span className="font-heading font-black text-3xl text-[#00E676]">₹{txnDetails?.amount || 999}</span>
              <p className="text-xs text-[#8B8B96]">Paid to <strong className="text-white">{txnDetails?.creatorName || creatorName}</strong></p>
              <p className="text-[10px] text-[#666677] font-mono">Transaction ID: {txnDetails?.txnId}</p>
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-3.5 px-4 rounded-full bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white font-black text-sm transition shadow-xl"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 5: SUBSCRIPTION CREATED (VIP ACTIVE) */}
        {step === 5 && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-[#00E676]/20 border border-[#00E676] mx-auto flex items-center justify-center text-[#00E676]">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-black text-xl text-white">
                You are now a VIP Member!
              </h3>
              <p className="text-xs text-[#8B8B96]">
                Enjoy exclusive benefits and support <span className="text-white font-bold">{creatorName}</span>.
              </p>
            </div>

            {/* MEMBERSHIP DETAILS TABLE */}
            <div className="p-4 rounded-2xl bg-[#1C1805] border border-[#B38F00]/50 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#332700]">
                <span className="text-[#8B8B96]">Membership</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span>💎</span> {txnDetails?.planName || selectedPlan?.name || 'VIP Membership'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#332700]">
                <span className="text-[#8B8B96]">Amount</span>
                <span className="font-bold text-[#FFD60A]">₹{txnDetails?.amount || 999} / {selectedPlan?.interval || 'Month'}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#332700]">
                <span className="text-[#8B8B96]">Next Billing Date</span>
                <span className="font-bold text-white">{txnDetails?.nextBillingDate || '24 Sep 2026'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8B8B96]">Transaction ID</span>
                <span className="font-mono text-[10px] text-[#A0A0B0]">{txnDetails?.txnId}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 px-4 rounded-full bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white font-black text-sm transition shadow-xl"
            >
              Go to Live
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
