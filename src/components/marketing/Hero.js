'use client';

import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, LayoutDashboard, CreditCard } from 'lucide-react';

export default function Hero() {
  return (
    <section
      style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.05), transparent 70%)',
          filter: 'blur(50px)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ textAlign: 'center' }}>
        {/* Top Announcement Badge */}
        <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
          <Badge variant="brand" icon={Sparkles}>
            Next.js + Supabase SaaS Starter
          </Badge>
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          The modern foundation for your next{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SaaS application
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
          }}
        >
          Engineered with clean Next.js App Router, complete Supabase authentication,
          protected dashboard layouts, and modular subscription billing interfaces.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}
        >
          <Link href="/register" className="btn btn-primary btn-lg">
            Start Free Starter
            <ArrowRight size={18} />
          </Link>
          <Link href="/dashboard" className="btn btn-secondary btn-lg">
            <LayoutDashboard size={18} />
            View Dashboard Shell
          </Link>
        </div>

        {/* Trust Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginBottom: '4.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle2 size={16} color="var(--success)" />
            <span>Zero Lock-in JavaScript & JSX</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={16} color="var(--brand-primary)" />
            <span>Supabase PostgreSQL + RLS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CreditCard size={16} color="var(--warning)" />
            <span>Checkout placeholder; no payments processed</span>
          </div>
        </div>

        {/* Interactive Dashboard Mockup Preview */}
        <div
          className="card"
          style={{
            maxWidth: '1000px',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '1.25rem',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-card)',
          }}
        >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'left', marginBottom: '0.75rem' }}>
          Illustrative workspace preview — no customer metrics shown.
        </p>
        {/* Mock Browser Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-primary)',
            }}
          >
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981' }} />
            <div
              style={{
                marginLeft: '1rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-secondary)',
                padding: '0.2rem 1rem',
                borderRadius: 'var(--radius-sm)',
                flex: 1,
                textAlign: 'left',
              }}
            >
              https://app.yourdomain.com/dashboard
            </div>
          </div>

          {/* Mock Dashboard Preview Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Workspace</span>
                <LayoutDashboard size={16} color="var(--brand-primary)" />
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>Overview</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workspace information in one place</span>
            </div>

            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Billing & plans</span>
                <CreditCard size={16} color="var(--brand-secondary)" />
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>Plan settings</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connect a provider to enable payments</span>
            </div>

            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Account</span>
                <Badge variant="brand">Settings</Badge>
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>Profile & security</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manage your account</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
