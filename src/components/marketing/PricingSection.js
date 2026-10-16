'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLANS, COMPARISON_FEATURES } from '@/lib/mock-data';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingSection({ showComparisonDefault = false }) {
  const [billingInterval, setBillingInterval] = useState('month');
  const [showComparison, setShowComparison] = useState(showComparisonDefault);

  return (
    <section id="pricing" style={{ padding: '5rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
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
            Transparent Plans
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            Predictable pricing for every stage
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
            Plan details and prices are placeholders. Payment processing and subscription changes are not enabled.
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
                background: billingInterval === 'year' ? 'rgba(255,255,255,0.25)' : 'var(--success-bg)',
                color: billingInterval === 'year' ? '#ffffff' : 'var(--success)',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              SAVE 17%
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

            let targetHref = plan.href;
            if (plan.id.includes('pro')) {
              targetHref = `/checkout?plan=${billingInterval === 'year' ? 'pro-yearly' : 'pro-monthly'}`;
            }

            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '2rem',
                  borderRadius: 'var(--radius-xl)',
                  position: 'relative',
                  border: isHighlighted ? '2px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                  boxShadow: isHighlighted ? 'var(--shadow-xl)' : 'var(--shadow-md)',
                  background: 'var(--bg-card)',
                  transform: isHighlighted ? 'scale(1.02)' : 'none',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Badge variant="brand">{plan.badge}</Badge>
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
                  className={`btn ${isHighlighted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
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
                  <tbody key={catIdx}>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
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
                    {category.items.map((row, rowIdx) => (
                      <tr key={rowIdx} style={{ borderBottom: '1px solid var(--border-primary)' }}>
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
                    ))}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
