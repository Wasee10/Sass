import { NextResponse } from 'next/server';
import { validateWebhook } from '@/server/payment';
import { saveUserPackage } from '@/server/services/package.service';

export async function POST(req) {
  try {
    const apiKeyHeader =
      req.headers.get('rt-uddoktapay-api-key') ||
      req.headers.get('RT-UDDOKTAPAY-API-KEY');

    if (!validateWebhook(apiKeyHeader)) {
      return NextResponse.json({ error: 'Unauthorized Action' }, { status: 401 });
    }

    const payload = await req.json();

    if (payload?.status === 'COMPLETED') {
      const metadata = payload.metadata || {};
      const planId = metadata.plan_id || metadata.planId || 'enterprise';
      const planName = metadata.plan_name || metadata.planName || 'Enterprise';
      const billingInterval = metadata.billing_interval || metadata.billingInterval || 'month';
      const userId = metadata.user_id || metadata.userId || 'demo-user-id';
      const userEmail = payload.email || 'alex.thorne@stratum.io';
      const fullName = payload.full_name || 'Alex Thorne';
      const chargedAmount = payload.charged_amount || payload.amount || '99.00';

      try {
        await saveUserPackage({
          userId,
          email: userEmail,
          fullName,
          planId,
          planName,
          price: parseFloat(chargedAmount) || 99,
          billingInterval,
          features: [],
        });
      } catch (dbErr) {
        console.warn('PostgreSQL sync in UddoktaPay webhook warning:', dbErr.message);
      }
    }

    return NextResponse.json({ received: true, status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('UddoktaPay webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook failed' }, { status: 400 });
  }
}
