'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Gauge,
  CreditCard,
  MessagesSquare,
  Settings,
  HelpCircle,
  Layers,
  ArrowUpRight,
  Shield,
  X,
  ChevronDown,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Gauge,
  },
  {
    name: 'Billing & License',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
  {
    name: 'Tickets & Feedback',
    href: '/dashboard#tickets',
    icon: MessagesSquare,
  },
  {
    name: 'Account Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    name: 'Help & Support',
    href: '/dashboard/support',
    icon: HelpCircle,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, profile, subscription } = useAuth();

  const isEnterprise = subscription?.plan_id?.includes('enterprise') || subscription?.plan_name?.toLowerCase().includes('enterprise');
  const isYearly = subscription?.billing_interval === 'year' || subscription?.plan_id?.includes('yearly');
  const isFree = subscription?.plan_id === 'free' || subscription?.plan_name?.toLowerCase().includes('free');

  const planName = isEnterprise
    ? (isYearly ? 'Enterprise Yearly' : 'Enterprise')
    : isFree
    ? 'Free Starter'
    : (isYearly ? 'Pro Yearly' : 'Pro Monthly');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
              }}
            >
              <Layers size={18} />
            </div>
            <span>Stratum<span style={{ color: 'var(--brand-primary)' }}>Cloud</span></span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Workspace Profile Card (VisActor Style) */}
        <div style={{ padding: '0.875rem 1rem 0.5rem 1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3161F8, #60C2FB)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                {(profile?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {profile?.full_name || 'Alex Thorne'}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Agent Admin
                </span>
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: '1.25rem 0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 0.75rem 0.5rem 0.75rem',
            }}
          >
            Workspace
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9375rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--brand-primary-light)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon
                  size={19}
                  color={isActive ? 'var(--brand-primary)' : 'var(--text-muted)'}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Subscription Card in Sidebar */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-primary)' }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Current Plan</span>
              <Badge variant={subscription?.plan_id === 'free' ? 'neutral' : 'brand'}>
                {planName}
              </Badge>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
              {subscription?.plan_id === 'free'
                ? 'Upgrade to Pro for high volume limits and priority features.'
                : 'Your subscription is active with full tier perks.'}
            </p>

            <Link
              href="/dashboard/billing"
              onClick={onClose}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '0.8125rem' }}
            >
              <span>{subscription?.plan_id === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Powered by VisActor & Apex Badge */}
        <div
          style={{
            padding: '0.65rem 1rem 1.25rem',
            textAlign: 'center',
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span style={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.625rem' }}>
            Powered by
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <span style={{ color: '#3161F8' }}>◆</span> Stratum Intelligence
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
          }
          .dashboard-sidebar.open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
