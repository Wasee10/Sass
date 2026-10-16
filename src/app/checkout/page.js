'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { user, isConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const planId = searchParams.get('plan') === 'pro-yearly' ? 'pro-yearly' : 'pro-monthly';
  const yearly = planId === 'pro-yearly';

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout', planId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Checkout could not be started.');
      }
    } catch {
      setError('Checkout could not be reached. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="container" style={{ flex: 1, width: '100%', maxWidth: '760px', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <Link href="/pricing" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> Back to plans
        </Link>
        <Card style={{ padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <p style={{ color: 'var(--brand-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>CHECKOUT</p>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Review your plan</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            Payment processing has not been connected yet. No payment details are collected and no charge can be made.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '1rem 0', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
            <span style={{ fontWeight: 600 }}>Professional · {yearly ? 'Annual' : 'Monthly'}</span>
            <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              ${yearly ? '290 / year' : '29 / month'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
            Listed prices are placeholders and will not be charged.
          </p>

          {error && (
            <div className="alert alert-error" role="alert" style={{ marginTop: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!user ? (
            <Link
              href={`/login?redirect=${encodeURIComponent(`/checkout?plan=${planId}`)}`}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              Sign in to continue
            </Link>
          ) : (
            <Button
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!isConfigured}
              icon={Lock}
              onClick={startCheckout}
              style={{ marginTop: '1.5rem' }}
            >
              {isConfigured ? 'Continue to secure checkout' : 'Payments not configured'}
            </Button>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 1.5rem' }}>Loading checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
