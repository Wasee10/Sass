'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error('Application route error:', error);
  }, [error]);

  return (
    <main
      className="container"
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeContent: 'center',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <p style={{ color: 'var(--danger)', fontWeight: 700 }}>Something went wrong</p>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>We couldn’t load this page.</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Try again, or return to the homepage.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={() => reset()}>Try again</button>
        <Link href="/" className="btn btn-secondary">Homepage</Link>
      </div>
    </main>
  );
}
