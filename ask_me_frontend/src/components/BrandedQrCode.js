'use client';

import React, { useEffect, useRef } from 'react';
import './SessionQRCode.css';

export default function BrandedQrCode({
  paymentLink,
  qrUrl,
  size = 'md',
  className = '',
  showCenterLogo = true,
  logoUrl = '/logo.png',
  alt = 'AskMe Live Payment QR Code',
}) {
  const qrRef = useRef(null);

  // Extract pure payment link if URL is an external API generator URL
  let rawUrl = paymentLink || qrUrl;
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

  useEffect(() => {
    if (!targetUrl || !qrRef.current) return;

    let isMounted = true;

    import('qr-code-styling')
      .then(({ default: QRCodeStyling }) => {
        if (!isMounted || !qrRef.current) return;

        qrRef.current.innerHTML = '';

        const qrCode = new QRCodeStyling({
          width: 172,
          height: 172,
          type: 'canvas',
          data: targetUrl,
          image: logoUrl,
          qrOptions: {
            errorCorrectionLevel: 'H',
          },
          dotsOptions: {
            type: 'rounded',
            color: '#ff5555',
          },
          cornersSquareOptions: {
            type: 'extra-rounded',
            color: '#ff5555',
          },
          cornersDotOptions: {
            type: 'square',
            color: '#ffffff',
          },
          backgroundOptions: {
            color: '#000000',
          },
          imageOptions: {
            crossOrigin: 'anonymous',
            hideBackgroundDots: true,
            imageSize: 0.27,
            margin: 0,
          },
        });

        qrCode.append(qrRef.current);
      })
      .catch((err) => {
        console.warn('QRCodeStyling load error:', err);
      });

    return () => {
      isMounted = false;
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, [targetUrl, logoUrl]);

  return (
    <div className={`askme-qr ${className}`}>
      <div className="qr-wrapper">
        <div ref={qrRef} />
      </div>
      <div className="qr-brand">
        <span>Ask-me</span>
        <span className="live">.live</span>
      </div>
    </div>
  );
}