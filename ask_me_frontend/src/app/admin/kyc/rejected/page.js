'use client';

import React from 'react';
import KycApprovalQueue from '@/components/KycApprovalQueue';

export default function AdminKycRejectedPage() {
  return <KycApprovalQueue activeSubTab="kyc_rejected" />;
}
