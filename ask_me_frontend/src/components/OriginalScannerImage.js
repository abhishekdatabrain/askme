'use client';

import React from 'react';

export default function OriginalScannerImage({ className = "w-full h-auto object-contain" }) {
  return (
    <img
      src="/scanner-qr.png"
      alt="AskMe Scanner QR Code"
      className={className}
    />
  );
}
