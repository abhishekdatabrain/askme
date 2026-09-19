'use client';

import React from 'react';

export default function OriginalScannerImage({ className = "w-48 h-auto" }) {
  return (
    <svg
      viewBox="0 0 300 330"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Corner Camera Brackets */}
      {/* Top-Left Bracket */}
      <path
        d="M 65 28 L 40 28 C 33.373 28 28 33.373 28 40 L 28 65"
        stroke="black"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top-Right Bracket */}
      <path
        d="M 235 28 L 260 28 C 266.627 28 272 33.373 272 40 L 272 65"
        stroke="black"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom-Left Bracket */}
      <path
        d="M 28 205 L 28 230 C 28 236.627 33.373 242 40 242 L 65 242"
        stroke="black"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom-Right Bracket */}
      <path
        d="M 272 205 L 272 230 C 272 236.627 266.627 242 260 242 L 235 242"
        stroke="black"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Finder Patterns (3 corner squares) */}
      {/* Top-Left Finder */}
      <rect x="44" y="44" width="56" height="56" rx="4" fill="none" stroke="black" strokeWidth="8" />
      <rect x="60" y="60" width="24" height="24" rx="2" fill="black" />

      {/* Top-Right Finder */}
      <rect x="200" y="44" width="56" height="56" rx="4" fill="none" stroke="black" strokeWidth="8" />
      <rect x="216" y="60" width="24" height="24" rx="2" fill="black" />

      {/* Bottom-Left Finder */}
      <rect x="44" y="170" width="56" height="56" rx="4" fill="none" stroke="black" strokeWidth="8" />
      <rect x="60" y="186" width="24" height="24" rx="2" fill="black" />

      {/* Dense QR Code Matrix Blocks */}
      {/* Top Row / Alignment */}
      <rect x="112" y="44" width="14" height="26" fill="black" />
      <rect x="134" y="44" width="12" height="12" fill="black" />
      <rect x="154" y="44" width="12" height="36" fill="black" />
      <rect x="174" y="44" width="16" height="12" fill="black" />

      {/* Upper Center Matrix */}
      <rect x="112" y="78" width="14" height="12" fill="black" />
      <rect x="134" y="66" width="12" height="24" fill="black" />
      <rect x="174" y="66" width="16" height="34" fill="black" />

      {/* Left Column Modules */}
      <rect x="44" y="110" width="12" height="24" fill="black" />
      <rect x="44" y="142" width="12" height="16" fill="black" />

      {/* Middle Grid Modules */}
      <rect x="66" y="110" width="26" height="12" fill="black" />
      <rect x="78" y="130" width="14" height="26" fill="black" />
      <rect x="102" y="100" width="26" height="12" fill="black" />
      <rect x="112" y="120" width="46" height="14" fill="black" />
      <rect x="102" y="142" width="14" height="24" fill="black" />
      <rect x="124" y="142" width="22" height="12" fill="black" />
      <rect x="154" y="90" width="12" height="44" fill="black" />
      <rect x="154" y="142" width="14" height="12" fill="black" />

      {/* Right Column Modules */}
      <rect x="190" y="110" width="46" height="12" fill="black" />
      <rect x="190" y="130" width="14" height="26" fill="black" />
      <rect x="214" y="130" width="42" height="12" fill="black" />
      <rect x="244" y="150" width="12" height="42" fill="black" />

      {/* Bottom Row Modules */}
      <rect x="112" y="174" width="14" height="24" fill="black" />
      <rect x="134" y="174" width="24" height="12" fill="black" />
      <rect x="134" y="194" width="12" height="30" fill="black" />
      <rect x="154" y="194" width="14" height="12" fill="black" />
      <rect x="174" y="170" width="16" height="14" fill="black" />
      <rect x="198" y="170" width="12" height="12" fill="black" />
      <rect x="218" y="170" width="12" height="24" fill="black" />
      <rect x="198" y="190" width="34" height="12" fill="black" />
      <rect x="174" y="210" width="36" height="14" fill="black" />
      <rect x="220" y="210" width="24" height="14" fill="black" />

      {/* "SCAN ME" Tooltip Speech Bubble Badge */}
      <polygon points="150,243 141,253 159,253" fill="black" />
      <rect x="70" y="252" width="160" height="46" rx="4" fill="black" />
      <text
        x="150"
        y="283"
        textAnchor="middle"
        fill="white"
        fontSize="22"
        fontWeight="900"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="2"
      >
        SCAN ME
      </text>
    </svg>
  );
}
