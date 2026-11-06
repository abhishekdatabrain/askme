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

export function setCachedCommissionPercent(newPercent) {
  const num = Number(newPercent);
  if (!isNaN(num) && num >= 0) {
    cachedCommissionPercent = num;
    hasFetchedCommission = true;
    listeners.forEach((listener) => {
      try {
        listener(cachedCommissionPercent);
      } catch (err) {
        console.error('Commission listener notification error:', err);
      }
    });
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('commissionSettingsUpdated', { detail: { commissionPercent: num } }));
      } catch (e) {}
    }
  }
}

export function getCachedCommissionPercent() {
  return cachedCommissionPercent;
}

export async function fetchCommissionSettings(force = false) {
  if (isFetchingCommission) return;
  if (!force && hasFetchedCommission) return;
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
        setCachedCommissionPercent(Number(percent));
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

    if (commissionPercent !== cachedCommissionPercent) {
      setCommissionPercent(cachedCommissionPercent);
    }

    // Always fetch latest saved commission percentage from backend on mount / page reload
    fetchCommissionSettings(true);

    const handleCustomEvent = (e) => {
      if (e.detail?.commissionPercent !== undefined && !isNaN(Number(e.detail.commissionPercent))) {
        setCommissionPercent(Number(e.detail.commissionPercent));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('commissionSettingsUpdated', handleCustomEvent);
    }

    return () => {
      listeners.delete(handleCommissionChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('commissionSettingsUpdated', handleCustomEvent);
      }
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
