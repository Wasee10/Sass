import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'No payment provider is configured.' },
    { status: 501 }
  );
}
