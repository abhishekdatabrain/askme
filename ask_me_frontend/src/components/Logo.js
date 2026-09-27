'use client';

import React from 'react';

export default function Logo({
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className = '',
  showBackground = true,
  alt = 'AskMe Logo',
}) {
  const sizeMap = {
    xs: { container: 'h-7 w-7 rounded-lg', imgClass: 'h-full w-full' },
    sm: { container: 'h-8 w-8 rounded-xl', imgClass: 'h-full w-full' },
    md: { container: 'h-9 w-9 rounded-xl', imgClass: 'h-full w-full' },
    lg: { container: 'h-10 w-10 rounded-2xl', imgClass: 'h-full w-full' },
    xl: { container: 'h-14 w-14 rounded-2xl', imgClass: 'h-full w-full' },
    '2xl': { container: 'h-20 w-20 rounded-3xl', imgClass: 'h-full w-full' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (!showBackground) {
    return (
      <img
        src="/logo.png"
        alt={alt}
        className={`object-contain rounded-xl ${className || 'h-8 w-8'}`}
      />
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-black rounded-xl shadow-md shadow-[#EB1000]/25 border border-[#EB1000]/30 transition-transform duration-200 group-hover:scale-105 overflow-hidden shrink-0 ${currentSize.container} ${className}`}
    >
      <img
        src="/logo.png"
        alt={alt}
        className={`object-cover w-full h-full ${currentSize.imgClass}`}
      />
    </div>
  );
}

