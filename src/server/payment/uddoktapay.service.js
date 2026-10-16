import { serverConfig } from '@/server/config/env';

/**
 * Server-side UddoktaPay Service
 * Interacts directly with UddoktaPay Sandbox or Production APIs.
 */

const { apiKey: UDDOKTAPAY_API_KEY, baseUrl: UDDOKTAPAY_BASE_URL } = serverConfig.uddoktaPay;

/**
 * Initiates a new payment session on UddoktaPay
 * @param {Object} params
 * @param {string} params.fullName - Customer full name
 * @param {string} params.email - Customer email
 * @param {string|number} params.amount - Payment amount
 * @param {Object} params.metadata - Metadata (userId, planId, billingInterval, etc.)
 * @param {string} params.redirectUrl - Client redirect URL on success
 * @param {string} params.cancelUrl - Client redirect URL on cancellation
 * @param {string} [params.webhookUrl] - IPN webhook callback URL
 * @returns {Promise<{ status: boolean, message: string, payment_url: string }>}
 */
export async function createCharge({
  fullName,
  email,
  amount,
  metadata = {},
  redirectUrl,
  cancelUrl,
  webhookUrl,
}) {
  const endpoint = `${UDDOKTAPAY_BASE_URL}/checkout-v2`;

  const payload = {
    full_name: fullName || 'Stratum Customer',
    email: email || 'customer@stratum.io',
    amount: String(amount),
    metadata: metadata,
    redirect_url: redirectUrl,
    cancel_url: cancelUrl,
    return_type: 'GET',
  };

  if (webhookUrl) {
    payload.webhook_url = webhookUrl;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

/**
 * Verifies transaction completion with UddoktaPay using invoice_id
 * @param {string} invoiceId - Unique invoice ID from UddoktaPay
 * @returns {Promise<Object>} Verification details
 */
export async function verifyPayment(invoiceId) {
  if (!invoiceId) {
    throw new Error('invoiceId parameter is required for payment verification.');
  }

  const endpoint = `${UDDOKTAPAY_BASE_URL}/verify-payment`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ invoice_id: invoiceId }),
  });

  const data = await response.json();
  return data;
}

/**
 * Validates incoming IPN webhook signatures from UddoktaPay
 * @param {string} incomingApiKeyHeader
 * @returns {boolean} True if header matches authorized key
 */
export function validateWebhook(incomingApiKeyHeader) {
  if (!incomingApiKeyHeader) return false;
  return incomingApiKeyHeader.trim() === UDDOKTAPAY_API_KEY.trim();
}

export default {
  createCharge,
  verifyPayment,
  validateWebhook,
};
