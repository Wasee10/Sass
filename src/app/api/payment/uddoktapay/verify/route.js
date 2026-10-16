import { NextResponse } from 'next/server';
import { verifyPayment } from '@/server/payment';
import { saveUserPackage } from '@/server/services/package.service';

export async function POST(req) {
  try {
    const body = await req.json();
    const invoice_id = body.invoice_id || body.invoiceId;

    if (!invoice_id) {
      return NextResponse.json(
        { success: false, error: 'invoice_id is required' },
        { status: 400 }
      );
    }

    const verification = await verifyPayment(invoice_id);

    if (verification?.status === 'COMPLETED') {
      const metadata = verification.metadata || {};
      const planId = metadata.plan_id || metadata.planId || 'pro-monthly';
      const planName = metadata.plan_name || metadata.planName || 'Professional';
      const billingInterval = metadata.billing_interval || metadata.billingInterval || 'month';
      const userId = metadata.user_id || metadata.userId || 'demo-user-id';
      const userEmail = verification.email || 'alex.thorne@stratum.io';
      const fullName = verification.full_name || 'Alex Thorne';
      const chargedAmount = verification.charged_amount || verification.amount || '29.00';

      try {
        await saveUserPackage({
          userId,
          email: userEmail,
          fullName,
          planId,
          planName,
          price: parseFloat(chargedAmount) || 29,
          billingInterval,
          features: [],
        });
      } catch (dbErr) {
        console.warn('PostgreSQL sync in verify route warning:', dbErr.message);
      }

      const res = NextResponse.json({
        success: true,
        verified: true,
        status: 'COMPLETED',
        data: verification,
        plan: {
          planId,
          planName,
          billingInterval,
          price: parseFloat(chargedAmount),
        },
      });

      res.cookies.set('stratum_chosen_plan', planId, { path: '/', maxAge: 2592000, sameSite: 'lax' });
      res.cookies.set('stratum_chosen_interval', billingInterval, { path: '/', maxAge: 2592000, sameSite: 'lax' });
      return res;
    }

    return NextResponse.json({
      success: false,
      verified: false,
      status: verification?.status || 'PENDING',
      data: verification,
    });
  } catch (error) {
    console.error('UddoktaPay verify error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
