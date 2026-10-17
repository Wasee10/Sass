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
  Search,
} from 'lucide-react';

export default function Features() {
  return (
    <section id="features" style={{ padding: '5rem 0', background: 'var(--bg-secondary)', position: 'relative' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '680px', margin: '0 auto 3.5rem auto', textAlign: 'center' }}>
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
              fontSize: 'clamp(2rem, 3.8vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginBottom: '1rem',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
            }}
          >
            Everything you need to launch, scale, and monetize
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.6 }}>
            Every foundational layer has been engineered with battle-tested standards, so you can build your unique product features without rebuilding table stakes.
          </p>
        </div>

        {/* Responsive Bento Grid */}
        <div className="features-grid">
          {/* Card 1: Large Bento Tile - Supabase Auth & Security */}
          <div className="card card-interactive bento-card bento-span-7">
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                Turnkey Supabase Authentication
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Complete password &amp; email login, Google OAuth, session refresh, email verification, and password reset flows with HTTP-only cookie protection.
              </p>
            </div>

            {/* Code Snippet visual */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                overflowX: 'auto',
              }}
            >
              <div style={{ color: '#10b981', marginBottom: '0.25rem' }}>// Verified server-side session:</div>
              <div><span style={{ color: 'var(--brand-primary)' }}>const</span> &#123; user, session &#125; = <span style={{ color: '#0d9488' }}>await</span> supabase.auth.getUser()</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>✓ Zero client credential exposure · Automated token refresh</div>
            </div>
          </div>

          {/* Card 2: Medium Bento Tile - Keyword Research Engine */}
          <div className="card card-interactive bento-card bento-span-5">
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(49, 97, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3161F8',
                  marginBottom: '1.25rem',
                }}
              >
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
                Live Keyword Research Engine
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Collect up to 100 genuine suggestions directly from Google Search Autocomplete and YouTube video search across 16 countries and languages.
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
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Google &amp; YouTube Autocomplete</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>100 unique long-tail keywords per query</div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3161F8', background: 'rgba(49, 97, 248, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '9999px' }}>
                Instant Telemetry
              </span>
            </div>
          </div>

          {/* Card 3: Subscription & UddoktaPay Billing UI */}
          <div className="card card-interactive bento-card bento-span-4">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '1rem',
              }}
            >
              <CreditCard size={20} />
            </div>
            <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              UddoktaPay &amp; Billing UI
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55 }}>
              Integrated checkout for bKash, Nagad, Rocket, Cards, and automated vector-rendered PDF tax receipts.
            </p>
          </div>

          {/* Card 4: PostgreSQL Schema & Strict RLS */}
          <div className="card card-interactive bento-card bento-span-4">
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

          {/* Card 5: Adaptive Light & Dark Theming */}
          <div className="card card-interactive bento-card bento-span-4">
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

      <style jsx>{`
        .features-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
        }
        .bento-card {
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          padding: 2rem;
          min-height: 320px;
        }
        .bento-span-7 {
          grid-column: span 7;
        }
        .bento-span-5 {
          grid-column: span 5;
        }
        .bento-span-4 {
          grid-column: span 4;
          min-height: auto;
          padding: 1.75rem;
        }
        @media (max-width: 1024px) {
          .bento-span-7,
          .bento-span-5 {
            grid-column: span 6;
          }
          .bento-span-4 {
            grid-column: span 6;
          }
        }
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .bento-span-7,
          .bento-span-5,
          .bento-span-4 {
            grid-column: span 1 !important;
            padding: 1.35rem 1.15rem !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
