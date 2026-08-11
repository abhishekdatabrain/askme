'use client';

import React from 'react';
import CreatorRegisterForm from '@/components/CreatorRegisterForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#8B8B96] hover:text-[#00F5D4] mb-4 transition-colors font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to AskMe Control Room
        </Link>
        <CreatorRegisterForm onClose={() => window.location.href = '/'} />
      </div>
    </div>
  );
}
