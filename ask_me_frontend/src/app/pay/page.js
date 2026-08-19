'use client';

import { Suspense } from 'react';
import ViewerPaymentPage from './[sessionCode]/page';

export default function DirectPayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4">
        <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ViewerPaymentPage />
    </Suspense>
  );
}
