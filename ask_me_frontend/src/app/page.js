'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCreatorToken, getCreatorUser, getAdminToken, getAdminUser } from '@/utils/cookies';

export default function Home() {
  const router = useRouter();

  // useEffect(() => {
  //   const creatorToken = getCreatorToken();
  //   const creatorUser = getCreatorUser();
  //   const adminToken = getAdminToken();
  //   const adminUser = getAdminUser();

  //   if (adminToken && adminUser?.role?.toLowerCase() === 'admin') {
  //     router.replace('/admin/dashboard');
  //   } else if (creatorToken && creatorUser) {
  //     router.replace('/creators/dashboard');
  //   } else {
  //     router.replace('/creators/login');
  //   }
  // }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex flex-col items-center justify-center space-y-4 font-sans">
      <div className="h-12 w-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-[#0A0A0F] font-black text-2xl animate-pulse glow-teal">
        a
      </div>
      <div className="text-xs font-semibold text-[#8B8B96]">
        Redirecting to Creator Portal...
      </div>
    </div>
  );
}
