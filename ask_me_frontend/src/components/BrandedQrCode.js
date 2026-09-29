'use client';

import React, { useEffect, useRef } from 'react';

export default function BrandedQrCode({
  paymentLink,
  qrUrl,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | number
  className = '',
  showCenterLogo = true,
  logoUrl = '/flame-logo.png',
  alt = 'AskMe Live Payment QR Code',
}) {
  const qrRef = useRef(null);

  // Extract pure payment link if URL is an external API generator URL
  let rawUrl = paymentLink || qrUrl || 'https://askme.live';
  if (typeof rawUrl === 'string' && rawUrl.includes('data=')) {
    try {
      const urlObj = new URL(rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`);
      const extractedData = urlObj.searchParams.get('data');
      if (extractedData) {
        rawUrl = decodeURIComponent(extractedData);
      }
    } catch (e) {
      // Keep rawUrl as fallback
    }
  }

  const targetUrl = rawUrl;

  const numericSizeMap = {
    sm: { box: 200, centerBox: 'h-12 w-12 p-1' },
    md: { box: 260, centerBox: 'h-16 w-16 p-1.5' },
    lg: { box: 340, centerBox: 'h-15 w-15 p-2' },
    xl: { box: 420, centerBox: 'h-20 w-20 p-2.5' },
  };

  const config = typeof size === 'number'
    ? { box: size, centerBox: 'h-14 w-14 p-1.5' }
    : (numericSizeMap[size] || numericSizeMap.md);

  const pixelSize = config.box;

  useEffect(() => {
    if (!qrRef.current || !targetUrl) return;

    let isMounted = true;

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (!isMounted || !qrRef.current) return;

      qrRef.current.innerHTML = '';

      const qrCodeInstance = new QRCodeStyling({
        width: pixelSize,
        height: pixelSize,
        type: 'canvas',
        data: targetUrl,
        margin: 1,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H',
        },
        dotsOptions: {
          color: '#000000',
          type: 'square',
        },
        backgroundOptions: {
          color: '#FFFFFF',
        },
        cornersSquareOptions: {
          color: '#000000',
          type: 'extra-rounded',
        },
        cornersDotOptions: {
          color: '#EB1000',
          type: 'extra-rounded',
        },
      });

      qrCodeInstance.append(qrRef.current);
    }).catch((err) => {
      console.warn('QRCodeStyling load notice:', err);
    });

    return () => {
      isMounted = false;
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, [targetUrl, pixelSize]);

  return (
    <div className={`relative inline-flex flex-col items-center group ${className}`}>
      {/* Crisp White Outer Container - Fits Edge to Edge */}
      <div className="relative rounded-2xl bg-white p-1.5 border-2 border-[#EB1000]/40 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
        {/* QR Code Canvas */}
        <div
          ref={qrRef}
          className="rounded-xl overflow-hidden bg-white flex items-center justify-center"
        />

        {/* Center Black Rounded Badge with Red Flame & AskMe Text */}
        {showCenterLogo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className={`rounded-2xl bg-black border-2 border-[#EB1000] shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105 ${config.centerBox}`}>
              <img
                src={logoUrl}
                alt={alt}
                className="h-4/5 w-4/5 object-contain"
              />
              <span className="text-[9px] font-black tracking-tight text-white leading-none mt-0.5">
                Ask<span className="text-[#EB1000]">Me</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
