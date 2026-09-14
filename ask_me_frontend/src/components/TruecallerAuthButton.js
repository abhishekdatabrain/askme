'use client';

import React, { useState, useEffect } from 'react';

/**
 * Production-Ready Truecaller 1-Tap Authentication Component
 * Uses official Truecaller App Key (Partner Key) for Mobile 1-Tap & Web SDK verification.
 */
export default function TruecallerAuthButton({
  onSuccess,
  onError,
  isLoading = false,
  label = 'Continue with Truecaller',
  className = '',
}) {
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Global callback handlers invoked by Truecaller Web SDK / Deep Link response
      window.onTruecallerSuccess = (truecallerResponse) => {
        setIsVerifying(false);
        if (onSuccess) onSuccess(truecallerResponse);
      };

      window.onTruecallerError = (err) => {
        setIsVerifying(false);
        if (onError) onError(err || 'Truecaller verification cancelled or failed.');
      };

      // Dynamically load Truecaller Web SDK JS script if not present
      if (!document.getElementById('truecaller-web-sdk')) {
        const script = document.createElement('script');
        script.id = 'truecaller-web-sdk';
        script.src = 'https://sdk.truecaller.com/v1/truecallersdk.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [onSuccess, onError]);

  const handleTruecallerAuth = () => {
    if (isLoading || isVerifying) return;
    setIsVerifying(true);

    try {
      const appKey = process.env.NEXT_PUBLIC_TRUECALLER_APP_KEY;
      const requestNonce = `askme_nonce_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      );

      if (isMobile) {
        // Mobile 1-Tap Verification via Truecaller App Deep Link
        const tcDeepLink = `truecallersdk://truesdk/web_verify?requestNonce=${encodeURIComponent(
          requestNonce
        )}&partnerKey=${encodeURIComponent(appKey)}&partnerName=AskMe&lang=en&skipOption=true`;

        window.location.href = tcDeepLink;

        // Reset verification indicator if app does not open within 3.5 seconds
        setTimeout(() => {
          setIsVerifying(false);
        }, 3500);
      } else {
        // Desktop Browser / Web SDK Handling
        if (window.Truecaller && typeof window.Truecaller.init === 'function') {
          window.Truecaller.init({
            appKey,
            requestNonce,
            onSuccess: (data) => {
              setIsVerifying(false);
              if (onSuccess) onSuccess(data);
            },
            onError: (err) => {
              setIsVerifying(false);
              if (onError) onError(err?.message || 'Truecaller verification failed.');
            },
          });
        } else {
          // If on Desktop browser without mobile app, inform user cleanly without 404/40010 OAuth errors
          setIsVerifying(false);
          if (onError) {
            onError('Truecaller 1-Tap is optimized for mobile browsers with Truecaller app installed. Please try on a mobile phone or use WhatsApp / Email login.');
          } else {
            alert('Truecaller 1-Tap is optimized for mobile browsers with Truecaller app installed. Please try on a mobile phone or use WhatsApp / Email login.');
          }
        }
      }
    } catch (err) {
      console.error('[Truecaller Frontend] Auth trigger error:', err);
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
          {/* Iconic Truecaller 't' Logo */}
          <div className="w-5 h-5 rounded-full bg-white text-[#0087FF] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
            t
          </div>
          <span className="tracking-wide">{label}</span>
        </>
      )}
    </button>
  );
}
