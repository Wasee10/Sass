import { NextResponse } from 'next/server';

export async function GET(req) {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host') || 'localhost:3000';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = req.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
  const resolvedHost = isLocal && !host.includes(':') ? `${host}:3000` : host;
  const baseUrl = `${protocol}://${resolvedHost}`;

  return NextResponse.redirect(`${baseUrl}/dashboard/billing?payment=cancelled`);
}
