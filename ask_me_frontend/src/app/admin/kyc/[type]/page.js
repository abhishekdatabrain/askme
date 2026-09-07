'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import KycApprovalQueue from '@/components/KycApprovalQueue';
import UserAgreement from '@/components/UserAgreement';

export default function AdminKycTypePage() {
  const params = useParams();
  const type = params?.type || 'pending';

  if (type === 'user-agreement' || type === 'user_agreement') {
    return <UserAgreement activeSubTab="user_agreement" />;
  }

  const subTabMap = {
    pending: 'kyc_pending',
    approved: 'kyc_approved',
    rejected: 'kyc_rejected',
  };

  const activeSubTab = subTabMap[type] || 'kyc_pending';

  return <KycApprovalQueue activeSubTab={activeSubTab} />;
}
