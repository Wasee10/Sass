import { NextResponse } from 'next/server';
import { saveUserPackage as saveUserPackageToPostgres, getUserPackage as getUserPackageFromPostgres } from '@/server/services/package.service';
import { PLANS } from '@/lib/mock-data';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, email, fullName, planId = 'pro-monthly', billingInterval = 'month' } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required to save package selection.' },
        { status: 400 }
      );
    }

    // Determine package details from mock-data PLANS
    const isFree = planId === 'free';
    const isEnterprise = planId?.includes('enterprise');
    const isYearly = billingInterval === 'year' || planId?.includes('yearly');

    const matchedPlan = isFree
      ? PLANS[0]
      : isEnterprise
      ? PLANS[2]
      : PLANS[1];

    const price = isFree ? 0 : isYearly ? matchedPlan.priceYearly : matchedPlan.priceMonthly;
    const resolvedInterval = isFree ? 'forever' : isYearly ? 'year' : 'month';
    const resolvedPlanId = isFree
      ? 'free'
      : isEnterprise
      ? (isYearly ? 'enterprise-yearly' : 'enterprise')
      : (isYearly ? 'pro-yearly' : 'pro-monthly');
    const planName = isFree
      ? 'Free Starter'
      : isEnterprise
      ? (isYearly ? 'Enterprise Annual' : 'Enterprise')
      : (isYearly ? 'Pro Yearly' : 'Professional');
    const features = matchedPlan.features || [];

    // Save to PostgreSQL table public.user_packages
    const pgResult = await saveUserPackageToPostgres({
      userId,
      email,
      fullName: fullName || email.split('@')[0],
      planId: resolvedPlanId,
      planName,
      price,
      billingInterval: resolvedInterval,
      features,
    });

    return NextResponse.json({
      success: true,
      message: 'Package selection recorded and synchronized.',
      package: {
        user_id: userId,
        email,
        full_name: fullName,
        plan_id: resolvedPlanId,
        plan_name: planName,
        price,
        billing_interval: resolvedInterval,
        savedToDatabase: pgResult.savedToDatabase,
      },
      data: {
        userId,
        email,
        fullName,
        planId: resolvedPlanId,
        planName,
        price,
        billingInterval: resolvedInterval,
        savedToDatabase: pgResult.savedToDatabase,
      },
    });
  } catch (error) {
    console.error('[API /api/user/package Error]', error);
    return NextResponse.json(
      { error: 'Internal server error saving package to PostgreSQL', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  const pkg = await getUserPackageFromPostgres(userId);
  return NextResponse.json({ success: true, package: pkg });
}
