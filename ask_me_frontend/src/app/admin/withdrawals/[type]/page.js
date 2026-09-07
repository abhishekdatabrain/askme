'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import WithdrawalsManager from '@/components/WithdrawalsManager';

export default function AdminWithdrawalsTypePage() {
  const params = useParams();
  const type = params?.type || 'pending';

  const subTabMap = {
    pending: 'withdrawals_pending',
    approved: 'withdrawals_approved',
    processing: 'withdrawals_processing',
    completed: 'withdrawals_completed',
    rejected: 'withdrawals_rejected',
  };

  const activeSubTab = subTabMap[type] || 'withdrawals_pending';

  return <WithdrawalsManager activeSubTab={activeSubTab} />;
}
