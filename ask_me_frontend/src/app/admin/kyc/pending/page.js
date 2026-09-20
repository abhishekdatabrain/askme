'use client';

import React from 'react';
import KycApprovalQueue from '@/components/KycApprovalQueue';

export default function AdminKycPendingPage() {
  return <KycApprovalQueue activeSubTab="kyc_pending" />;
}
