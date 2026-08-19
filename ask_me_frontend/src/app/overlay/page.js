'use client';

import { Suspense } from 'react';
import StreamOverlayWidgetPage from './[username]/page';

export default function DirectOverlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[#00F5D4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StreamOverlayWidgetPage />
    </Suspense>
  );
}
