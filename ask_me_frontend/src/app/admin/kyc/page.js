'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminKycIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/kyc/pending');
  }, [router]);

  return null;
}
