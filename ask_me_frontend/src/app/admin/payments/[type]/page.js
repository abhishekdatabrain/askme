'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PaymentManagement from '@/components/PaymentManagement';

export default function AdminPaymentsTypePage() {
  const params = useParams();
  const type = params?.type || 'all';

  const subTabMap = {
    all: 'payments_all',
    successful: 'payments_successful',
    failed: 'payments_failed',
    pending: 'payments_pending',
    refunds: 'payments_refunds',
  };

  const activeSubTab = subTabMap[type] || 'payments_all';

  return <PaymentManagement activeSubTab={activeSubTab} />;
}
