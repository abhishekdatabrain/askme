'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-[#8B8B96] text-xs font-mono">
      Redirecting to Admin Control Room...
    </div>
  );
}
