'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

export const DEFAULT_CALC_AMOUNT = 250000;
export const DEFAULT_PLATFORM_COMMISSION_PERCENT = 3;

// Module-level cache and subscriber system so all components share the fetched commission
let cachedCommissionPercent = DEFAULT_PLATFORM_COMMISSION_PERCENT;
let isFetchingCommission = false;
let hasFetchedCommission = false;
const listeners = new Set();

export function calculatePayoutDetails(grossAmount = DEFAULT_CALC_AMOUNT, platformCommissionPercent = cachedCommissionPercent) {
  const safeAmount = Number(grossAmount) > 0 ? Number(grossAmount) : 0;
  const safeCommission = Number(platformCommissionPercent) >= 0 ? Number(platformCommissionPercent) : DEFAULT_PLATFORM_COMMISSION_PERCENT;

  const askmeFee = Math.round(safeAmount * (safeCommission / 100));
  const gstFee = Math.round(askmeFee * 0.18);
  const pgCharge = Math.round(safeAmount * 0.02);
  const totalDeductions = askmeFee + gstFee + pgCharge;
  const netEarnings = Math.max(0, safeAmount - totalDeductions);
  const payoutPercentage = safeAmount > 0 ? (netEarnings / safeAmount) * 100 : 0;
  const formattedPercentage = `${payoutPercentage.toFixed(1)}%`;

  return {
    grossAmount: safeAmount,
    platformCommissionPercent: safeCommission,
    askmeFee,
    gstFee,
    pgCharge,
    totalDeductions,
    netEarnings,
    payoutPercentage,
    formattedPercentage,
  };
}

export async function fetchCommissionSettings() {
  if (isFetchingCommission) return;
  isFetchingCommission = true;

  try {
    const url = API_ENDPOINTS?.CREATORS?.COMMISSION_SETTINGS || '/api/creators/commission-settings';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const percent = data.data?.platformCommissionPercent !== undefined
        ? data.data.platformCommissionPercent
        : data.data?.commission_percentage;

      if (percent !== undefined && percent !== null && !isNaN(Number(percent))) {
        cachedCommissionPercent = Number(percent);
        hasFetchedCommission = true;
        listeners.forEach((listener) => listener(cachedCommissionPercent));
      }
    }
  } catch (err) {
    console.warn('Using cached/default commission for calculator:', err);
  } finally {
    isFetchingCommission = false;
  }
}

export function usePayoutCalculator(initialAmount = DEFAULT_CALC_AMOUNT) {
  const [calcAmount, setCalcAmount] = useState(initialAmount);
  const [commissionPercent, setCommissionPercent] = useState(cachedCommissionPercent);

  useEffect(() => {
    const handleCommissionChange = (newPercent) => {
      setCommissionPercent(newPercent);
    };

    listeners.add(handleCommissionChange);

    if (!hasFetchedCommission) {
      fetchCommissionSettings();
    }

    return () => {
      listeners.delete(handleCommissionChange);
    };
  }, []);

  const details = calculatePayoutDetails(calcAmount, commissionPercent);

  return {
    calcAmount,
    setCalcAmount,
    commissionPercent,
    platformCommissionPercent: commissionPercent,
    ...details,
    calculateFor: (amount) => calculatePayoutDetails(amount, commissionPercent),
  };
}

export function getDefaultPayoutPercentage() {
  return calculatePayoutDetails(DEFAULT_CALC_AMOUNT, cachedCommissionPercent).formattedPercentage;
}
