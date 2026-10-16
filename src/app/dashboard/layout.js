import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import DashboardShell from '@/components/dashboard/DashboardShell';

async function AuthenticatedDashboard({ children }) {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    if (!cookieStore.get('saas_demo_user')) {
      redirect('/login?redirect=/dashboard');
    }
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login?redirect=/dashboard');
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div
          className="container"
          role="status"
          style={{ minHeight: '50vh', display: 'grid', placeContent: 'center', color: 'var(--text-muted)' }}
        >
          Verifying session…
        </div>
      }
    >
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}
