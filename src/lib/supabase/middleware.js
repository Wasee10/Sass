import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from './client';

export async function updateSession(request) {
  let response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (!isDashboardRoute) {
    return response;
  }

  // 1. Primary Check: Stratum & Firebase session cookies
  const demoCookie = request.cookies.get('saas_demo_user')?.value;
  const stratumSession = request.cookies.get('stratum_user_session')?.value;
  const firebaseUserCookie = request.cookies.get('firebase_user')?.value;

  if (demoCookie || stratumSession || firebaseUserCookie) {
    // Authenticated via Stratum / Firebase session
    return response;
  }

  // 2. Secondary Fallback: If Supabase has cookies and is configured, check Supabase
  if (isSupabaseConfigured()) {
    try {
      const allCookies = request.cookies.getAll();
      const hasSupabaseCookie = allCookies.some((c) => c.name.startsWith('sb-') || c.name.includes('supabase'));

      if (hasSupabaseCookie) {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                  response.cookies.set(name, value, options)
                );
              },
            },
          }
        );

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          return response;
        }
      }
    } catch {
      // Ignore Supabase check errors
    }
  }

  // 3. If unauthenticated, redirect to login
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', pathname);
  return NextResponse.redirect(url);
}
