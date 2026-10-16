'use client';

import {
  Lock,
  CreditCard,
  Layout,
  Database,
  Moon,
  Smartphone,
  Gauge,
  KeyRound,
} from 'lucide-react';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';

const FEATURES = [
  {
    icon: Lock,
    title: 'Supabase Authentication',
    description: 'Email, password, session refresh, email verification, and password reset flows with cookie security.',
    color: 'var(--brand-primary)',
  },
  {
    icon: CreditCard,
    title: 'Subscription & Billing UI',
    description: 'Billing history and plan-management UI, with payment processing intentionally left unconfigured.',
    color: 'var(--brand-secondary)',
  },
  {
    icon: Layout,
    title: 'Dashboard Workspace Shell',
    description: 'Clean sidebar navigation, account settings, billing overview, and a customer support page.',
    color: 'var(--brand-accent)',
  },
  {
    icon: Database,
    title: 'PostgreSQL Schema & RLS',
    description: 'Pre-architected SQL scripts for user profiles, subscriptions, and billing transactions with strict security policies.',
    color: 'var(--success)',
  },
  {
    icon: Moon,
    title: 'Adaptive Dark & Light Theme',
    description: 'Effortless switching between light and dark modes with persistent local storage and CSS custom properties.',
    color: 'var(--warning)',
  },
  {
    icon: Smartphone,
    title: 'Fully Responsive Layouts',
    description: 'Handcrafted responsive layouts that adapt smoothly to mobile phones, tablets, and wide desktop screens.',
    color: 'var(--info)',
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: '5rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
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
            Core Infrastructure
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            Built with production-grade essentials
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
            Everything required to launch your next software venture without reinventing auth,
            pricing pages, or dashboard layouts.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left',
          }}
        >
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1.75rem',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: feat.color,
                  }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <CardTitle style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                    {feat.title}
                  </CardTitle>
                  <CardDescription>
                    {feat.description}
                  </CardDescription>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
