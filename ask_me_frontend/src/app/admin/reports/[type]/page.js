'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ReportsAnalytics from '@/components/ReportsAnalytics';

export default function AdminReportsTypePage() {
  const params = useParams();
  const type = params?.type || 'revenue';

  const subTabMap = {
    revenue: 'reports_revenue',
    creator: 'reports_creator',
    payment: 'reports_payment',
    withdrawal: 'reports_withdrawal',
  };

  const activeSubTab = subTabMap[type] || 'reports_revenue';

  return <ReportsAnalytics activeSubTab={activeSubTab} />;
}
