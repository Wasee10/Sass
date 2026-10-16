'use client';

import {
  Lock,
  CreditCard,
  Layout,
  Database,
  Moon,
  Zap,
  ShieldCheck,
  Check,
  Code2,
  Sparkles,
} from 'lucide-react';

export default function Features() {
  return (
    <section id="features" style={{ padding: '6rem 0', background: 'var(--bg-secondary)', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '680px', margin: '0 auto 4rem auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--brand-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem',
              background: 'var(--brand-primary-light)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
            }}
          >
            <Sparkles size={14} />
            Production Architecture
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginBottom: '1rem',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
            }}
          >
            Everything you need to launch, scale, and monetize
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.6 }}>
            Every foundational layer has been engineered with battle-tested standards, so you can build your unique product features without rebuilding table stakes.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.5rem',
          }}
        >
          {/* Card 1: Large Bento Tile - Supabase Auth & Security (Spans 7 cols) */}
          <div
            className="card card-interactive"
            style={{
              gridColumn: 'span 7',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px',
              padding: '2rem',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(79, 70, 229, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  marginBottom: '1.25rem',
                }}
              >
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                Turnkey Supabase Authentication
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '480px' }}>
                Complete password & email login, Google OAuth, session refresh, email verification, and password reset flows with HTTP-only cookie protection.
              </p>
            </div>

            {/* Code Snippet visual */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ color: '#10b981', marginBottom: '0.25rem' }}>// Verified server-side session:</div>
              <div><span style={{ color: 'var(--brand-primary)' }}>const</span> &#123; user, session &#125; = <span style={{ color: '#0d9488' }}>await</span> supabase.auth.getUser()</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>✓ Zero client credential exposure · Automated token refresh</div>
            </div>
          </div>

          {/* Card 2: Medium Bento Tile - Subscription & Monetization UI (Spans 5 cols) */}
          <div
            className="card card-interactive"
            style={{
              gridColumn: 'span 5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px',
              padding: '2rem',
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  marginBottom: '1.25rem',
                }}
              >
                <CreditCard size={22} />
              </div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                Subscription &amp; Billing UI
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Pre-built pricing tiers, checkout routing, and customer invoice history. Designed for seamless webhook connection to Stripe or Lemon Squeezy.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pro Plan Tier</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>$29 / month billed annually</div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '9999px' }}>
                Active Status
              </span>
            </div>
          </div>

          {/* Card 3: Medium Bento Tile - PostgreSQL & RLS (Spans 4 cols) */}
          <div
            className="card card-interactive"
            style={{
              gridColumn: 'span 4',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
                marginBottom: '1rem',
              }}
            >
              <Database size={20} />
            </div>
            <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Postgres Schema &amp; Strict RLS
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55 }}>
              Production SQL schemas with Row Level Security (RLS) guaranteeing that customers can only read and write their own data.
            </p>
          </div>

          {/* Card 4: Medium Bento Tile - Responsive Dashboard Shell (Spans 4 cols) */}
          <div
            className="card card-interactive"
            style={{
              gridColumn: 'span 4',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(14, 165, 233, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0ea5e9',
                marginBottom: '1rem',
              }}
            >
              <Layout size={20} />
            </div>
            <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Responsive App Shell
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55 }}>
              Clean sidebar workspace, account profile controls, password updates, and customer support portal pre-configured out of the box.
            </p>
          </div>

          {/* Card 5: Medium Bento Tile - Adaptive Light & Dark Theming (Spans 4 cols) */}
          <div
            className="card card-interactive"
            style={{
              gridColumn: 'span 4',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
                marginBottom: '1rem',
              }}
            >
              <Moon size={20} />
            </div>
            <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Adaptive Dark &amp; Light UI
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55 }}>
              Seamless theme switching with persistent local storage, custom CSS tokens, accessible contrast, and zero theme flicker on load.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
