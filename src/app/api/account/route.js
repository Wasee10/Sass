import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export async function DELETE(request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Request origin could not be verified.' }, { status: 403 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Account deletion is not configured.' }, { status: 503 });
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
    return NextResponse.json({ error: 'A valid confirmation is required.' }, { status: 400 });
  }

  if (body?.confirmation !== 'DELETE') {
    return NextResponse.json({ error: 'Type DELETE to confirm account removal.' }, { status: 400 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey.includes('your-service-role-key')) {
    return NextResponse.json({ error: 'Account deletion is not configured.' }, { status: 503 });
  }

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('Supabase account deletion failed:', error.message);
    return NextResponse.json({ error: 'Account deletion failed. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
