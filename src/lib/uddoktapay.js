/**
 * Backward compatibility proxy for UddoktaPay Server Service
 * All server payment implementations live in @/server/payment
 */

import {
  createCharge,
  verifyPayment,
  validateWebhook,
} from '@/server/payment';

export const createUddoktaPayCharge = createCharge;
export const verifyUddoktaPayPayment = verifyPayment;
export const validateUddoktaPayWebhook = validateWebhook;

export default {
  createUddoktaPayCharge,
  verifyUddoktaPayPayment,
  validateUddoktaPayWebhook,
};
