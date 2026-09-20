'use client';

import React from 'react';
import WithdrawalsManager from '@/components/WithdrawalsManager';

export default function AdminWithdrawalsPendingPage() {
  return <WithdrawalsManager activeSubTab="withdrawals_pending" />;
}
