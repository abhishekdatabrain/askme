'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPaymentsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/payments/all');
  }, [router]);

  return null;
}
