'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  Users,
  CreditCard,
  Key,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, profile, subscription } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Member';
  const planName = subscription?.plan_id === 'pro-yearly'
    ? 'Pro Yearly'
    : subscription?.plan_id === 'pro-monthly'
    ? 'Pro Monthly'
    : 'Free Starter';

  const OVERVIEW = [
    {
      label: 'Account',
      value: displayName,
      subtext: profile?.company_name || 'Add an organization in account settings.',
      icon: Users,
      color: 'var(--brand-primary)',
    },
    {
      label: 'Email address',
      value: user?.email || '—',
      subtext: 'Your sign-in email',
      icon: ShieldCheck,
      color: 'var(--brand-secondary)',
    },
    {
      label: 'Subscription',
      value: planName,
      subtext: subscription?.status || 'active',
      icon: CreditCard,
      color: 'var(--success)',
      badge: subscription?.status || 'active',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Welcome, {displayName}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Here is your SaaS application workspace status and active subscription tier.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard/billing" className="btn btn-primary btn-sm">
            <span>Manage Billing</span>
            <ArrowUpRight size={15} />
          </Link>
          <Link href="/dashboard/settings" className="btn btn-secondary btn-sm">
            Account Settings
          </Link>
        </div>
      </div>

      {/* Account overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {OVERVIEW.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {stat.label}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {stat.value}
                </span>
                {stat.badge && (
                  <Badge variant={stat.badge === 'active' ? 'success' : 'warning'}>
                    {stat.badge}
                  </Badge>
                )}
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {stat.subtext}
              </span>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions + Recent Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Quick Action Shortcuts */}
        <Card style={{ padding: '1.75rem' }}>
          <CardTitle style={{ marginBottom: '0.35rem' }}>Quick Actions</CardTitle>
          <CardDescription style={{ marginBottom: '1.5rem' }}>
            Frequently used tools and workspace configurations.
          </CardDescription>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link
              href="/dashboard/billing"
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CreditCard size={18} color="var(--brand-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Upgrade or Switch Plan</span>
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </Link>

            <Link
              href="/dashboard/settings"
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={18} color="var(--success)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Update Security & Password</span>
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </Link>

            <Link
              href="/dashboard/support"
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Key size={18} color="var(--brand-accent)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Read Developer Integration Guide</span>
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </Link>
          </div>
        </Card>

        {/* Activity placeholder */}
        <Card style={{ padding: '1.75rem' }}>
          <CardTitle style={{ marginBottom: '0.35rem' }}>Workspace activity</CardTitle>
          <CardDescription style={{ marginBottom: '1.5rem' }}>
            An activity feed has not been connected to this starter.
          </CardDescription>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Connect your product events or audit-log source to display account activity here.
          </p>
        </Card>
      </div>
    </div>
  );
}
