'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLiveSessionsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/live-sessions/active');
  }, [router]);

  return null;
}
