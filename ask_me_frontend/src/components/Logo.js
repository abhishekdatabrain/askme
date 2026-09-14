'use client';

import React from 'react';

export default function Logo({
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className = '',
  showBackground = true,
  alt = 'AskMe Logo',
}) {
  const sizeMap = {
    xs: { container: 'h-7 w-7 rounded-lg p-0.5', imgClass: 'h-5 w-5' },
    sm: { container: 'h-8 w-8 rounded-xl p-1', imgClass: 'h-6 w-6' },
    md: { container: 'h-9 w-9 rounded-xl p-1', imgClass: 'h-7 w-7' },
    lg: { container: 'h-10 w-10 rounded-2xl p-1.5', imgClass: 'h-8 w-8' },
    xl: { container: 'h-14 w-14 rounded-2xl p-2', imgClass: 'h-10 w-10' },
    '2xl': { container: 'h-20 w-20 rounded-3xl p-3', imgClass: 'h-14 w-14' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (!showBackground) {
    return (
      <img
        src="/logo.png"
        alt={alt}
        className={`object-contain ${className || 'h-8 w-8'}`}
      />
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-[#FEF2F2] shadow-md border border-[#EB1000]/20 glow-brand transition-transform duration-200 group-hover:scale-105 overflow-hidden shrink-0 ${currentSize.container} ${className}`}
    >
      <img
        src="/logo.png"
        alt={alt}
        className={`object-contain ${currentSize.imgClass}`}
      />
    </div>
  );
}
