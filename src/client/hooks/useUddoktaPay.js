'use client';

import { useState } from 'react';
import { initiateCheckout, verifyInvoice } from '@/client/payment/uddoktapay.client';

/**
 * Custom React Hook for managing UddoktaPay checkout and verification in components
 */
export function useUddoktaPay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const startCheckout = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const result = await initiateCheckout(params);
      if (result.success && result.paymentUrl) {
        setPaymentData(result);
        if (typeof window !== 'undefined') {
          window.location.href = result.paymentUrl;
        }
        return result;
      } else {
        const errMsg = result.error || 'Failed to start UddoktaPay payment.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      const errMsg = err.message || 'Network error initiating checkout.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (invoiceId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await verifyInvoice(invoiceId);
      return result;
    } catch (err) {
      setError(err.message || 'Error checking payment status.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paymentData,
    startCheckout,
    checkPaymentStatus,
  };
}

export default useUddoktaPay;
