'use client';

import { Zap, ShieldAlert, Code2, Sparkles, Check, X, Clock, ShieldCheck } from 'lucide-react';

export default function Benefits() {
  return (
    <section id="benefits" style={{ padding: '6.5rem 0', position: 'relative' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}
        >
          {/* Left: Value Proposition Copy */}
          <div>
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
              <Zap size={14} />
              Competitive Advantage
            </div>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                marginBottom: '1.25rem',
                lineHeight: 1.15,
                color: 'var(--text-primary)',
              }}
            >
              Focus on your product idea, not plumbing
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Avoid spending three weeks rebuilding authentication redirects, responsive navigation, and account settings from scratch.
              Start with a clear, audited foundation and connect only what makes your SaaS unique.
            </p>

            {/* Impact Metric Counters */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '2.5rem',
                padding: '1.25rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>95%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Setup Time Saved</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>0</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vendor Lock-in</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>100%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Code Ownership</div>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                'Next.js 16 App Router with server-side cookie verification',
                'Tailored CSS variable design system with zero-flicker light/dark mode',
                'PostgreSQL schemas with strict Row Level Security policies',
                'Subscription UI ready for Stripe or Lemon Squeezy integration',
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Side-by-side comparison card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* The Old Way Card */}
            <div
              className="card"
              style={{
                border: '1px solid rgba(239, 68, 68, 0.25)',
                background: 'var(--bg-card)',
                padding: '1.75rem',
                opacity: 0.85,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ef4444', fontWeight: 700, fontSize: '0.875rem' }}>
                <Clock size={16} />
                THE OLD WAY: BUILDING FROM SCRATCH
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <X size={15} color="#ef4444" />
                  <span>3-4 weeks lost debugging cookie session stores &amp; OAuth redirects</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <X size={15} color="#ef4444" />
                  <span>Fragile database security with accidental data leak vulnerabilities</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <X size={15} color="#ef4444" />
                  <span>Inconsistent CSS styles with broken mobile navigation</span>
                </div>
              </div>
            </div>

            {/* The SaaS Core Way Card */}
            <div
              className="card card-interactive"
              style={{
                border: '1px solid rgba(16, 185, 129, 0.4)',
                background: 'var(--bg-card)',
                padding: '2rem',
                boxShadow: '0 12px 30px -10px rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '0.02em' }}>
                  <ShieldCheck size={18} />
                  THE SAAS CORE WAY
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.65rem', borderRadius: '9999px' }}>
                  Ready to Ship
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Check size={16} color="#10b981" strokeWidth={3} />
                  <span>Deploy to Vercel production with custom domain &amp; SSL in 5 minutes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Check size={16} color="#10b981" strokeWidth={3} />
                  <span>PostgreSQL Row Level Security audited and locked down by default</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Check size={16} color="#10b981" strokeWidth={3} />
                  <span>Pixel-perfect responsive app shell with silky smooth dark/light mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
