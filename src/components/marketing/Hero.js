'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  CreditCard,
  Users,
  TrendingUp,
  BarChart3,
  Check,
  Search,
  Bell,
} from 'lucide-react';

export default function Hero() {
  return (
    <section
      style={{
        paddingTop: '6rem',
        paddingBottom: '5.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Background Mesh Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.18), rgba(6, 182, 212, 0.08), transparent 70%)',
          filter: 'blur(70px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Top Announcement Pill */}
        <div style={{ display: 'inline-flex', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Next.js 16 + Supabase</span>
            <span style={{ color: 'var(--border-secondary)' }}>|</span>
            <span style={{ color: 'var(--text-secondary)' }}>Production-Ready SaaS Template</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.2vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            marginBottom: '1.5rem',
            maxWidth: '920px',
            marginLeft: 'auto',
            marginRight: 'auto',
            color: 'var(--text-primary)',
          }}
        >
          Ship your SaaS product in days,{' '}
          <span className="gradient-text">
            not months of repetitive plumbing
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(1.0625rem, 1.8vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
          }}
        >
          Engineered with clean Next.js 16 App Router, Supabase Auth with secure cookies,
          PostgreSQL Row Level Security, subscription billing UI, and adaptive themes.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3.5rem',
          }}
        >
          <Link
            href="/register"
            className="btn btn-primary btn-lg"
            style={{
              padding: '0.875rem 2rem',
              fontSize: '1rem',
              borderRadius: '9999px',
              boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)',
            }}
          >
            Start Free Starter
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="btn btn-secondary btn-lg"
            style={{
              padding: '0.875rem 1.75rem',
              fontSize: '1rem',
              borderRadius: '9999px',
            }}
          >
            <LayoutDashboard size={18} />
            Live Dashboard Preview
          </Link>
        </div>

        {/* Trust & Proof Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
            flexWrap: 'wrap',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '4.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} color="#10b981" strokeWidth={3} />
            </div>
            <span>100% Full Code Ownership</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={12} color="var(--brand-primary)" strokeWidth={3} />
            </div>
            <span>Supabase PostgreSQL + RLS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={12} color="#f59e0b" strokeWidth={3} />
            </div>
            <span>&lt; 5 Min Vercel Deploy</span>
          </div>
        </div>

        {/* Ultra-Premium Interactive SaaS Dashboard Preview Mockup */}
        <div
          style={{
            maxWidth: '1060px',
            margin: '0 auto',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-card)',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          {/* macOS Browser Chrome */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            </div>

            {/* Address Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.3rem 1rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                width: '100%',
                maxWidth: '480px',
              }}
            >
              <span style={{ color: '#10b981' }}>🔒</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>app.stratum.io</span>
              <span style={{ color: 'var(--text-muted)' }}>/dashboard</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                JD
              </div>
            </div>
          </div>

          {/* App Layout: Left Mini-Nav + Main Dashboard Body */}
          <div style={{ display: 'flex', minHeight: '380px' }}>
            {/* Mini Sidebar */}
            <div
              style={{
                width: '180px',
                borderRight: '1px solid var(--border-primary)',
                background: 'var(--bg-subtle)',
                padding: '1.25rem 0.75rem',
                display: 'none',
              }}
              className="desktop-sidebar-preview"
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.5rem', marginBottom: '0.75rem' }}>
                WORKSPACE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.8125rem' }}>
                  <LayoutDashboard size={15} />
                  Overview
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  <TrendingUp size={15} />
                  Analytics
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  <CreditCard size={15} />
                  Subscriptions
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  <Users size={15} />
                  Members
                </div>
              </div>
            </div>

            {/* Main Dashboard Area */}
            <div style={{ flex: 1, padding: '1.75rem', background: 'var(--bg-card)' }}>
              {/* Header Title inside Dashboard */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Acme Corp Workspace
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Real-time metrics connected via Supabase PostgreSQL
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                    ● Production Live
                  </span>
                </div>
              </div>

              {/* 3 Metric KPI Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.75rem',
                }}
              >
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Recurring</span>
                    <TrendingUp size={16} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    $24,850
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                    ↑ +22.4% vs last month
                  </span>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Subscribers</span>
                    <Users size={16} color="var(--brand-primary)" />
                  </div>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    1,842
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                    ↑ +128 new this week
                  </span>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Auth & API Health</span>
                    <ShieldCheck size={16} color="#06b6d4" />
                  </div>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    99.98%
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Zero session drops
                  </span>
                </div>
              </div>

              {/* Recent Activity Table Preview */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  <span>RECENT TRANSACTIONS &amp; SUBSCRIPTIONS</span>
                  <span style={{ color: 'var(--brand-primary)', cursor: 'pointer' }}>View All →</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid var(--border-primary)', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Alex Morgan (Scale Plan)</span>
                    <span style={{ color: 'var(--text-muted)' }}>2 minutes ago</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>+$99.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sarah Lin (Pro Plan)</span>
                    <span style={{ color: 'var(--text-muted)' }}>14 minutes ago</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>+$49.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
