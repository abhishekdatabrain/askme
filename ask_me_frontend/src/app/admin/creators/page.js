'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCreatorsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/creators/all');
  }, [router]);

  return null;
}
