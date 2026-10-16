'use client';

import Link from 'next/link';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';
import { AlertCircle, ArrowLeft, RefreshCw, CreditCard } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, padding: '5rem 1.5rem', maxWidth: '640px' }}>
        <Card style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <AlertCircle size={36} />
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#d97706',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'rgba(245, 158, 11, 0.12)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '0.75rem',
            }}
          >
            TRANSACTION CANCELLED
          </span>

          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Payment Was Not Completed
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 auto 2rem auto', maxWidth: '440px', lineHeight: 1.6 }}>
            You cancelled your payment session on the UddoktaPay gateway. No funds were debited from your account.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              href="/checkout"
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                padding: '0.75rem 1.5rem',
              }}
            >
              <RefreshCw size={16} />
              <span>Try Checkout Again</span>
            </Link>

            <Link
              href="/dashboard/billing"
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                padding: '0.75rem 1.5rem',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Billing</span>
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
