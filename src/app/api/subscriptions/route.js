import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { DEMO_USER } from '@/lib/mock-data';

// GET /api/subscriptions
// Verifies subscription status on the server
export async function GET(request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        configured: false,
        subscription: DEMO_USER.subscription,
        message: 'Running in simulated demo mode. Connect Supabase to enable production database persistence.',
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid session required' },
        { status: 401 }
      );
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to retrieve subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      configured: true,
      subscription: subscription || {
        plan_id: 'free',
        status: 'active',
        billing_interval: 'month',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
