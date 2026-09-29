'use client';

import React, { useEffect, useState } from 'react';

export default function BrandedQrCode({
  qrUrl,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  showCenterLogo = true,
  alt = 'AskMe Live Payment QR Code',
}) {
  const [gradientDataUrl, setGradientDataUrl] = useState(null);

  const sizeMap = {
    sm: {
      box: 'h-28 w-28',
      img: 'h-28 w-28',
      centerLogoBox: 'h-6 w-6 p-0.5 rounded-lg',
    },
    md: {
      box: 'h-36 w-36',
      img: 'h-36 w-36',
      centerLogoBox: 'h-8 w-8 p-1 rounded-xl',
    },
    lg: {
      box: 'h-48 w-48',
      img: 'h-48 w-48',
      centerLogoBox: 'h-10 w-10 p-1 rounded-xl',
    },
    xl: {
      box: 'h-64 w-64',
      img: 'h-64 w-64',
      centerLogoBox: 'h-14 w-14 p-1.5 rounded-2xl',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Ensure high error correction (ecc=H) parameter is present in qrUrl if from qrserver
  let processQrUrl = qrUrl || '';
  if (processQrUrl.includes('api.qrserver.com') && !processQrUrl.includes('ecc=')) {
    processQrUrl += '&ecc=H&margin=2';
  }

  useEffect(() => {
    if (!processQrUrl) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!isMounted) return;
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || 400;
        const h = img.naturalHeight || 400;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Apply Left-to-Right Navy-to-Red Linear Gradient to QR Code modules
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lightness = (r + g + b) / 3;

            if (lightness > 180) {
              // Keep background clean white
              data[idx] = 255;
              data[idx + 1] = 255;
              data[idx + 2] = 255;
              data[idx + 3] = 255;
            } else {
              // Colorize QR dark pixels with Navy Blue -> Burgundy -> Bright Red horizontal gradient
              const t = x / w;
              let red, green, blue;
              if (t < 0.5) {
                const factor = t / 0.5;
                red = Math.round(16 + (107 - 16) * factor);
                green = Math.round(42 + (17 - 42) * factor);
                blue = Math.round(107 + (77 - 107) * factor);
              } else {
                const factor = (t - 0.5) / 0.5;
                red = Math.round(107 + (235 - 107) * factor);
                green = Math.round(17 + (16 - 17) * factor);
                blue = Math.round(77 + (0 - 77) * factor);
              }

              data[idx] = red;
              data[idx + 1] = green;
              data[idx + 2] = blue;
              data[idx + 3] = 255;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setGradientDataUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Gradient canvas process notice:', err);
        setGradientDataUrl(processQrUrl);
      }
    };

    img.onerror = () => {
      if (isMounted) setGradientDataUrl(processQrUrl);
    };

    img.src = processQrUrl;

    return () => {
      isMounted = false;
    };
  }, [processQrUrl]);

  const displaySrc = gradientDataUrl || processQrUrl;

  const qrBox = (
    <div className={`relative rounded-2xl bg-white p-2 shadow-xl border-2 border-[#EB1000]/40 glow-brand flex items-center justify-center overflow-hidden shrink-0 ${currentSize.box}`}>
      {/* Base QR Code Image with Navy-to-Red Gradient */}
      <img
        src={displaySrc}
        alt={alt}
        className={`object-contain rounded-xl ${currentSize.img}`}
      />

      {/* Center Black Logo Box with Flame Icon */}
      {showCenterLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className={`bg-black shadow-2xl border-2 border-[#EB1000] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${currentSize.centerLogoBox}`}>
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

