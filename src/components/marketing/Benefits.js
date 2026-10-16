'use client';

import { Zap, ShieldAlert, Code2, Sparkles, Check } from 'lucide-react';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Cut Weeks of Repetitive Boilerplate',
    description: 'Skip configuring routing, session stores, cookie refresh tokens, and UI layout primitives from scratch.',
  },
  {
    icon: ShieldAlert,
    title: 'Hardened Security By Default',
    description: 'Server-side route verification, environment variable encapsulation, and database Row Level Security policies.',
  },
  {
    icon: Code2,
    title: 'Pure JavaScript & Standard JSX',
    description: 'No convoluted TypeScript abstraction overhead or rigid component framework locks. Fully customizable and readable.',
  },
  {
    icon: Sparkles,
    title: 'Designed For Instant Product Plug-in',
    description: 'When you finalize your SaaS product idea, seamlessly plug your domain logic into the ready dashboard and API routes.',
  },
];

export default function Benefits() {
  return (
    <section id="benefits" style={{ padding: '5rem 0' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Why This Starter
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
              Focus on your product idea, not plumbing
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Avoid rebuilding authentication redirects, responsive navigation, and account settings from scratch.
              Start with a clear foundation and connect only the services your product needs.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'Next.js App Router with Server-Side verification',
                'Modular CSS variable system with light and dark mode',
                  'Supabase schema with per-user Row Level Security policies',
                  'Billing interface ready for a future provider integration',
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--success-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--success)',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={13} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            {BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                    padding: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--brand-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--brand-primary)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      {benefit.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
