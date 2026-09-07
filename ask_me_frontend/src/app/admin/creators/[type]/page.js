'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CreatorManagement from '@/components/CreatorManagement';

export default function AdminCreatorsTypePage() {
  const params = useParams();
  const type = params?.type || 'all';

  const subTabMap = {
    all: 'creators_all',
    active: 'creators_active',
    blocked: 'creators_blocked',
  };

  const activeSubTab = subTabMap[type] || 'creators_all';

  return <CreatorManagement activeSubTab={activeSubTab} />;
}
