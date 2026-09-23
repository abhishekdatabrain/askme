'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function TruecallerAuthButton({
  onSuccess,
  onError,
  isLoading = false,
  label = 'Continue with Truecaller',
  className = '',
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const isTriggeredRef = useRef(false);

  // 1. Truecaller Web SDK ke Callbacks & PostMessage Listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Jab Truecaller Modal se CONTINUE dabane par response aaye
    const handleSuccessData = (data) => {
      console.log('[Truecaller Modal Success]:', data);
      setIsVerifying(false);
      if (onSuccess) {
        onSuccess(data);
      }
    };

    const handleErrorData = (err) => {
      console.error('[Truecaller Modal Error]:', err);
      setIsVerifying(false);
      if (onError) {
        onError(err?.message || err || 'Verification cancelled or failed.');
      }
    };

    // Global Functions jo SDK inject karti hai
    window.onTruecallerSuccess = handleSuccessData;
    window.onTruecallerError = handleErrorData;

    // Truecaller Web SDK ka iframe/modal postMessage event bhejta hai
    const handleMessageListener = (event) => {
      try {
        if (!event.data) return;

        // Truecaller iframe response check
        if (
          event.data.type === 'TRUECALLER_AUTH_SUCCESS' ||
          event.data.status === 'success' ||
          (event.data.payload && event.data.signature) ||
          event.data.accessToken
        ) {
          handleSuccessData(event.data);
        } else if (
          event.data.type === 'TRUECALLER_AUTH_FAILURE' ||
          event.data.status === 'failed'
        ) {
          handleErrorData(event.data.error || 'Verification failed');
        }
      } catch (e) {
        console.warn('[Truecaller Listener Warning]:', e);
      }
    };

    window.addEventListener('message', handleMessageListener);

    // Truecaller Web SDK script ensure karein
    if (!document.getElementById('truecaller-web-sdk')) {
      const script = document.createElement('script');
      script.id = 'truecaller-web-sdk';
      script.src = 'https://sdk.truecaller.com/v1/truecallersdk.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      window.removeEventListener('message', handleMessageListener);
    };
  }, [onSuccess, onError]);

  // 2. Button Click Handler
  const handleTruecallerAuth = () => {
    if (isLoading || isVerifying) return;
    setIsVerifying(true);
    isTriggeredRef.current = true;

    try {
      const appKey = process.env.NEXT_PUBLIC_TRUECALLER_APP_KEY;
      const requestNonce = `askme_nonce_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Truecaller Web SDK agar page par loaded hai
      if (window.Truecaller && typeof window.Truecaller.init === 'function') {
        window.Truecaller.init({
          appKey: appKey,
          requestNonce: requestNonce,
          buttonColor: '#0087FF',
          buttonTextColor: '#ffffff',
          lang: 'en',
          onSuccess: (data) => {
            console.log('[Truecaller SDK Direct Callback]:', data);
            setIsVerifying(false);
            if (onSuccess) onSuccess(data);
          },
          onError: (err) => {
            console.error('[Truecaller SDK Error Callback]:', err);
            setIsVerifying(false);
            if (onError) onError(err?.message || 'Truecaller login failed.');
          },
        });
      } else {
        // Fallback: Agar Web SDK load nahi hua toh Deep Link trigger karein
        const returnUrl = window.location.origin + window.location.pathname;
        const tcDeepLink = `truecallersdk://truesdk/web_verify?requestNonce=${encodeURIComponent(
          requestNonce
        )}&partnerKey=${encodeURIComponent(appKey)}&partnerName=AskMe&lang=en&skipOption=true&endpoint=${encodeURIComponent(
          returnUrl
        )}`;

        window.location.href = tcDeepLink;

        setTimeout(() => {
          setIsVerifying(false);
        }, 4000);
      }
    } catch (err) {
      console.error('[Truecaller Frontend Trigger Error]:', err);
      setIsVerifying(false);
      if (onError) onError('Unable to start Truecaller authentication.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleTruecallerAuth}
      disabled={isLoading || isVerifying}
      className={`w-full py-3.5 px-5 rounded-xl bg-[#0087FF] hover:bg-[#0076E0] active:scale-[0.99] text-xs font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#0087FF]/25 cursor-pointer disabled:opacity-50 ${className}`}
    >
      {isVerifying || isLoading ? (
        <>
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Verifying with Truecaller...</span>
        </>
      ) : (
        <>
          <div className="w-5 h-5 rounded-full bg-white text-[#0087FF] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
            t
          </div>
          <span className="tracking-wide">{label}</span>
        </>
      )}
    </button>
  );
}