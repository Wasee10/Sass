import { NextResponse } from 'next/server';
import { createCharge } from '@/server/payment';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullName = 'Alex Thorne',
      email = 'alex.thorne@stratum.io',
      amount = '99',
      planId = 'enterprise',
      planName = 'Enterprise Tier',
      billingInterval = 'month',
      userId = 'demo-user-id',
    } = body;

    // Determine host dynamically from origin or request headers, ensuring port 3000 is preserved locally
    const clientOrigin = body.origin || req.headers.get('origin');
    let baseUrl = clientOrigin;

    if (!baseUrl) {
      const forwardedHost = req.headers.get('x-forwarded-host');
      const host = forwardedHost || req.headers.get('host') || 'localhost:3000';
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      const protocol = req.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
      const resolvedHost = isLocal && !host.includes(':') ? `${host}:3000` : host;
      baseUrl = `${protocol}://${resolvedHost}`;
    }

    const redirectUrl = `${baseUrl}/payment/success`;
    const cancelUrl = `${baseUrl}/payment/cancel`;
    const webhookUrl = `${baseUrl}/api/payment/uddoktapay/webhook`;

    const metadata = {
      userId,
      email,
      planId,
      planName,
      billingInterval,
      amount: String(amount),
      orderId: `ORD-${Date.now()}`,
    };

    const response = await createCharge({
      fullName,
      email,
      amount: String(amount),
      metadata,
      redirectUrl,
      cancelUrl,
      webhookUrl,
    });

    if (response?.status && response?.payment_url) {
      return NextResponse.json({
        success: true,
        paymentUrl: response.payment_url,
        message: response.message || 'Payment URL generated successfully',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: response?.message || 'Failed to initiate UddoktaPay charge',
        details: response,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('UddoktaPay charge creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
