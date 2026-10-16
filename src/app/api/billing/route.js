import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

const BILLING_ACTIONS = new Set(['checkout', 'cancel', 'change_plan']);

export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Authentication is not configured.' },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'A valid JSON body is required.' }, { status: 400 });
  }

  if (!body || !BILLING_ACTIONS.has(body.action)) {
    return NextResponse.json({ error: 'Unsupported billing action.' }, { status: 400 });
  }

  return NextResponse.json(
    { error: 'Payments are not configured.' },
    { status: 501 }
  );
}
