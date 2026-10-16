'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export default function AuthCard({ title, subtitle, children, footer }) {
  const { isConfigured } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        background: 'var(--bg-secondary)',
        position: 'relative',
      }}
    >
      {/* Top right Theme Toggle */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 800,
            fontSize: '1.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Layers size={22} />
          </div>
          <span>SaaS<span style={{ color: 'var(--brand-primary)' }}>Core</span></span>
        </Link>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Production-Ready Software Foundation
        </p>
      </div>

      {/* Main Card Container */}
      <Card
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {!isConfigured && (
          <div
            style={{
              background: 'var(--brand-primary-light)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 0.85rem',
              fontSize: '0.8125rem',
              color: 'var(--brand-primary)',
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}
          >
            ⚡ <strong>Interactive Demo Mode</strong>: Real Supabase credentials not set yet. Any email/password will instantly sign in to explore!
          </div>
        )}

        {children}

        {footer && (
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-primary)',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}
