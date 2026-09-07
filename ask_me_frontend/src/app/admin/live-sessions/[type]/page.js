'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import LiveSessionManagement from '@/components/LiveSessionManagement';

export default function AdminLiveSessionsTypePage() {
  const params = useParams();
  const type = params?.type || 'active';

  const subTabMap = {
    active: 'livesessions_active',
    closed: 'livesessions_closed',
    suspended: 'livesessions_suspended',
  };

  const activeSubTab = subTabMap[type] || 'livesessions_active';

  return <LiveSessionManagement activeSubTab={activeSubTab} />;
}
