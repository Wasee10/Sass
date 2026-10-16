'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PLANS, COMPARISON_FEATURES } from '@/lib/mock-data';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Check, X, ArrowRight, HelpCircle, CreditCard, Smartphone, ShieldCheck, Zap } from 'lucide-react';

export default function PricingSection({ showComparisonDefault = false }) {
  const { user } = useAuth();
  const [billingInterval, setBillingInterval] = useState('month');
  const [showComparison, setShowComparison] = useState(showComparisonDefault);

  return (
    <section id="pricing" style={{ padding: '5rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--brand-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              display: 'inline-block',
              marginBottom: '0.75rem',
              background: 'var(--brand-primary-light)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
            }}
          >
            Transparent Plans
          </span>
          <h2 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Predictable pricing for every stage
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.6 }}>
            Start with our flexible free tier, or unlock complete production capabilities with our Pro plan.
          </p>
        </div>

        {/* Billing Interval Toggle (Monthly / Yearly) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-primary)',
            marginBottom: '3.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <button
            onClick={() => setBillingInterval('month')}
            style={{
              border: 'none',
              background: billingInterval === 'month' ? 'var(--brand-primary)' : 'transparent',
              color: billingInterval === 'month' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            style={{
              border: 'none',
              background: billingInterval === 'year' ? 'var(--brand-primary)' : 'transparent',
              color: billingInterval === 'year' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>Annual Billing</span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                background: billingInterval === 'year' ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.15)',
                color: billingInterval === 'year' ? '#ffffff' : '#10b981',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              SAVE 20%
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            textAlign: 'left',
            marginBottom: '3.5rem',
          }}
        >
          {PLANS.map((plan) => {
            const isHighlighted = plan.highlight;
            const price = billingInterval === 'year' ? plan.priceYearly : plan.priceMonthly;
            const periodText = billingInterval === 'year' ? '/yr' : '/mo';

            const isEnterprise = plan.id.includes('enterprise');
            const isFree = plan.id === 'free';
            const planSlug = isFree
              ? 'free'
              : plan.id.includes('pro')
              ? (billingInterval === 'year' ? 'pro-yearly' : 'pro-monthly')
              : (billingInterval === 'year' ? 'enterprise-yearly' : 'enterprise');

            const checkoutUrl = `/checkout?plan=${planSlug}&interval=${billingInterval}`;
            const targetHref = isFree
              ? (user ? '/dashboard' : '/register?plan=free')
              : user
              ? checkoutUrl
              : `/register?plan=${planSlug}&interval=${billingInterval}&redirect=${encodeURIComponent(checkoutUrl)}`;

            const handlePlanSelect = () => {
              if (typeof window !== 'undefined') {
                const pkgData = {
                  id: planSlug,
                  planId: planSlug,
                  name: plan.name,
                  price,
                  interval: isFree ? 'forever' : billingInterval === 'year' ? 'year' : 'month',
                  billingInterval: isFree ? 'forever' : billingInterval === 'year' ? 'year' : 'month',
                };
                localStorage.setItem('stratum_chosen_package', JSON.stringify(pkgData));
                document.cookie = `stratum_chosen_plan=${planSlug}; path=/; max-age=2592000; SameSite=Lax`;
                document.cookie = `stratum_chosen_interval=${billingInterval}; path=/; max-age=2592000; SameSite=Lax`;
              }
            };

            return (
              <div
                key={plan.id}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '2.25rem',
                  borderRadius: 'var(--radius-xl)',
                  position: 'relative',
                  border: isHighlighted ? '2px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                  boxShadow: isHighlighted ? '0 20px 40px -15px rgba(79, 70, 229, 0.35)' : 'var(--shadow-sm)',
                  background: 'var(--bg-card)',
                  transform: isHighlighted ? 'scale(1.02)' : 'none',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, var(--brand-primary), #06b6d4)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.3rem 0.9rem',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    ★ {plan.badge}
                  </div>
                )}

                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <CardTitle style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription style={{ minHeight: '42px' }}>
                      {plan.description}
                    </CardDescription>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ${price}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>
                      {price === 0 ? 'forever' : periodText}
                    </span>
                  </div>

                  <hr style={{ borderColor: 'var(--border-primary)', marginBottom: '1.5rem' }} />

                  {/* Included features list */}
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.85rem' }}>
                      What&apos;s Included:
                    </span>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem' }}>
                          <Check size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-primary)' }}>{feat}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feat, idx) => (
                        <li key={`not-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', opacity: 0.5 }}>
                          <X size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-muted)' }}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href={targetHref}
                  onClick={handlePlanSelect}
                  className={`btn ${isHighlighted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                >
                  <span>
                    {isFree
                      ? (user ? 'Go to Dashboard' : plan.cta)
                      : user
                      ? '⚡ Checkout & Pay Now'
                      : '⚡ Register & Purchase'}
                  </span>
                  <ArrowRight size={16} />
                </Link>

                {!isFree && (
                  <div style={{ textAlign: 'center', marginTop: '0.65rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {user ? '⚡ Pay via UddoktaPay (bKash/Nagad/Cards)' : '🔒 Account registration/login required before payment'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* UddoktaPay Supported Payment Channels Ribbon */}
        <div
          style={{
            maxWidth: '920px',
            margin: '0 auto 3rem auto',
            padding: '1.25rem 1.75rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(79, 70, 229, 0.15))',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e11d48',
                flexShrink: 0,
              }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span>Global & Local Payment Channels</span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    background: 'rgba(225, 29, 72, 0.1)',
                    color: '#e11d48',
                    border: '1px solid rgba(225, 29, 72, 0.25)',
                    letterSpacing: '0.04em',
                  }}
                >
                  ⚡ UDDOKTAPAY GATEWAY
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Pay directly with bKash, Nagad, Rocket, Upay, Visa, MasterCard, or Bank Transfer. Instant activation.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {[
              { name: 'bKash', color: '#e2136e', bg: 'rgba(226, 19, 110, 0.12)' },
              { name: 'Nagad', color: '#f7931e', bg: 'rgba(247, 147, 30, 0.12)' },
              { name: 'Rocket', color: '#8c3494', bg: 'rgba(140, 52, 148, 0.12)' },
              { name: 'Upay', color: '#00a3e0', bg: 'rgba(0, 163, 224, 0.12)' },
              { name: 'Visa & MC', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
              { name: 'Bank Wire', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
            ].map((method, idx) => (
              <span
                key={idx}
                style={{
                  padding: '0.35rem 0.7rem',
                  borderRadius: '6px',
                  background: method.bg,
                  color: method.color,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: `1px solid ${method.color}33`,
                }}
              >
                {method.name}
              </span>
            ))}
          </div>
        </div>

        {/* Toggle Detailed Comparison Table */}
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="btn btn-ghost"
            style={{ fontWeight: 600 }}
          >
            <span>{showComparison ? 'Hide Feature Comparison Matrix' : 'Compare All Plan Features in Detail'}</span>
            <ArrowRight size={16} style={{ transform: showComparison ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s ease' }} />
          </button>
        </div>

        {/* Feature Comparison Table */}
        {showComparison && (
          <div
            className="card animate-fade-in"
            style={{
              marginTop: '2.5rem',
              overflowX: 'auto',
              padding: '2rem',
              textAlign: 'left',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)', width: '40%' }}>
                    Features & Specifications
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', width: '20%' }}>
                    Free Starter
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--brand-primary)', width: '20%' }}>
                    Professional
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', width: '20%' }}>
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((category, catIdx) => (
                  <tr key={`cat-${catIdx}`} style={{ background: 'var(--bg-secondary)' }}>
                    <td
                      colSpan={4}
                      style={{
                        padding: '0.75rem 1rem',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--brand-primary)',
                      }}
                    >
                      {category.category}
                    </td>
                  </tr>
                )).flatMap((catRow, catIdx) => [
                  catRow,
                  ...COMPARISON_FEATURES[catIdx].items.map((row, rowIdx) => (
                    <tr key={`row-${catIdx}-${rowIdx}`} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)' }}>
                        {row.name}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {typeof row.free === 'boolean' ? (
                          row.free ? <Check size={18} color="var(--success)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                        ) : (
                          row.free
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? <Check size={18} color="var(--success)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                        ) : (
                          row.pro
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {typeof row.enterprise === 'boolean' ? (
                          row.enterprise ? <Check size={18} color="var(--success)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                        ) : (
                          row.enterprise
                        )}
                      </td>
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
