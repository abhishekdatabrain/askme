'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminWithdrawalsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/withdrawals/pending');
  }, [router]);

  return null;
}
