/**
 * Client-side UddoktaPay API Caller
 * Dispatches requests to our backend API endpoints.
 */

/**
 * Initiates checkout via backend API and forwards user to UddoktaPay gateway
 * @param {Object} params
 * @param {string} params.planId - e.g. 'pro-monthly', 'enterprise-yearly'
 * @param {string} params.planName - e.g. 'Professional', 'Enterprise'
 * @param {number|string} params.amount - Price in USD
 * @param {string} params.interval - 'month' | 'year'
 * @param {string} params.fullName - Customer name
 * @param {string} params.email - Customer email
 * @param {string} [params.userId] - Current user UID
 * @returns {Promise<{ success: boolean, paymentUrl?: string, error?: string }>}
 */
export async function initiateCheckout({
  planId = 'pro-monthly',
  planName = 'Professional',
  amount = '29',
  interval = 'month',
  fullName = 'Alex Thorne',
  email = 'alex@stratum.io',
  userId = 'demo-user-id',
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const res = await fetch('/api/payment/uddoktapay/charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      email,
      amount: String(amount),
      planId,
      planName,
      billingInterval: interval,
      userId,
      origin,
    }),
  });

  const data = await res.json();
  return data;
}

/**
 * Verifies transaction completion with backend API
 * @param {string} invoiceId
 * @returns {Promise<{ success: boolean, verified: boolean, data?: Object, error?: string }>}
 */
export async function verifyInvoice(invoiceId) {
  if (!invoiceId) {
    throw new Error('Invoice ID is required for verification.');
  }

  const res = await fetch('/api/payment/uddoktapay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoice_id: invoiceId }),
  });

  const data = await res.json();
  return data;
}

export default {
  initiateCheckout,
  verifyInvoice,
};
