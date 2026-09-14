'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCreatorToken, getCreatorUser, getAdminToken, getAdminUser } from '@/utils/cookies';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/viewers/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col items-center justify-center space-y-4 font-sans">
      <div className="animate-pulse">
        <Logo size="xl" />
      </div>
      <div className="text-xs font-semibold text-[#8B8B96]">
        Redirecting to Creator Portal...
      </div>
    </div>
  );
}
