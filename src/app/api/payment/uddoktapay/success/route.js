import { NextResponse } from 'next/server';
import { verifyPayment } from '@/server/payment';
import { saveUserPackage } from '@/server/services/package.service';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get('invoice_id');

  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host') || 'localhost:3000';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = req.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
  const resolvedHost = isLocal && !host.includes(':') ? `${host}:3000` : host;
  const baseUrl = `${protocol}://${resolvedHost}`;

  if (!invoiceId) {
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?payment=error&message=missing_invoice`);
  }

  try {
    const verification = await verifyPayment(invoiceId);

    if (verification?.status === 'COMPLETED') {
      const metadata = verification.metadata || {};
      const planId = metadata.plan_id || metadata.planId || 'enterprise';
      const planName = metadata.plan_name || metadata.planName || 'Enterprise';
      const billingInterval = metadata.billing_interval || metadata.billingInterval || 'month';
      const userId = metadata.user_id || metadata.userId || 'demo-user-id';
      const userEmail = verification.email || 'alex.thorne@stratum.io';
      const fullName = verification.full_name || 'Alex Thorne';
      const chargedAmount = verification.charged_amount || verification.amount || '99.00';
      const paymentMethod = verification.payment_method || 'bKash/Nagad';

      // Update package in PostgreSQL database table public.user_packages
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
        console.warn('PostgreSQL sync after UddoktaPay completion warning:', dbErr.message);
      }

      // Redirect to billing dashboard with success flags and encoded invoice data
      const successUrl = new URL(`${baseUrl}/dashboard/billing`);
      successUrl.searchParams.set('payment', 'success');
      successUrl.searchParams.set('invoice_id', invoiceId);
      successUrl.searchParams.set('plan_id', planId);
      successUrl.searchParams.set('plan_name', planName);
      successUrl.searchParams.set('amount', chargedAmount);
      successUrl.searchParams.set('method', paymentMethod);
      successUrl.searchParams.set('tx_id', verification.transaction_id || '');

      const response = NextResponse.redirect(successUrl.toString());

      // Set cookie for instant client-side plan recognition
      response.cookies.set('stratum_chosen_plan', planId, { path: '/', maxAge: 2592000, sameSite: 'lax' });
      response.cookies.set('stratum_chosen_interval', billingInterval, { path: '/', maxAge: 2592000, sameSite: 'lax' });

      return response;
    } else {
      // Pending or non-completed status
      const pendingUrl = new URL(`${baseUrl}/dashboard/billing`);
      pendingUrl.searchParams.set('payment', 'pending');
      pendingUrl.searchParams.set('invoice_id', invoiceId);
      pendingUrl.searchParams.set('status', verification?.status || 'UNKNOWN');
      return NextResponse.redirect(pendingUrl.toString());
    }
  } catch (err) {
    console.error('UddoktaPay return handler error:', err);
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?payment=error&message=verification_failed`);
  }
}
