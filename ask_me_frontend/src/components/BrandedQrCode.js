'use client';

import React from 'react';

export default function BrandedQrCode({
  qrUrl,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  showCenterLogo = true,
  showSideLabel = true,
  layout = 'side', // 'side' | 'stacked' | 'none'
  alt = 'AskMe Live Payment QR Code',
}) {
  const sizeMap = {
    sm: {
      box: 'h-24 w-24',
      img: 'h-24 w-24',
      centerLogoBox: 'h-4 w-4 p-[1px] rounded-md',
      textSize: 'text-sm',
      subTextSize: 'text-[9px]',
    },
    md: {
      box: 'h-32 w-32',
      img: 'h-32 w-32',
      centerLogoBox: 'h-5 w-5 p-0.5 rounded-md',
      textSize: 'text-base',
      subTextSize: 'text-[10px]',
    },
    lg: {
      box: 'h-44 w-44',
      img: 'h-44 w-44',
      centerLogoBox: 'h-7 w-7 p-0.5 rounded-lg',
      textSize: 'text-xl',
      subTextSize: 'text-xs',
    },
    xl: {
      box: 'h-60 w-60',
      img: 'h-60 w-60',
      centerLogoBox: 'h-9 w-9 p-1 rounded-xl',
      textSize: 'text-2xl',
      subTextSize: 'text-sm',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Ensure high error correction (ecc=H) parameter is present in qrUrl if from qrserver
  let processQrUrl = qrUrl;
  if (processQrUrl.includes('api.qrserver.com') && !processQrUrl.includes('ecc=')) {
    processQrUrl += '&ecc=H&margin=2';
  }

  const qrBox = (
    <div className={`relative rounded-2xl bg-white p-2 shadow-md border border-[#EB1000]/30 glow-brand flex items-center justify-center overflow-hidden shrink-0 ${currentSize.box}`}>
      {/* Base QR Code Image */}
      <img
        src={processQrUrl}
        alt={alt}
        className={`object-contain rounded-xl ${currentSize.img}`}
      />

      {/* Center Logo ONLY inside QR Code */}
      {showCenterLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`bg-white shadow-md border border-[#EB1000]/40 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 p-0.5 rounded-lg ${currentSize.centerLogoBox}`}>
            <img
              src="/logo.png"
              alt="AskMe Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative inline-flex flex-col items-center group ${className}`}>
      {qrBox}
    </div>
  );
}
