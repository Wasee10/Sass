'use client';

import { Suspense } from 'react';
import ApexAuthBox from '@/components/auth/ApexAuthBox';

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--bg-primary)',
      }}
    >
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem' }}>Loading access portal...</div>}>
        <ApexAuthBox initialMode="signin" />
      </Suspense>
    </div>
  );
}
