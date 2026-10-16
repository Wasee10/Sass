'use client';

import Accordion from '@/components/ui/Accordion';
import { FAQS } from '@/lib/mock-data';
import Link from 'next/link';

export default function FaqSection() {
  return (
    <section id="faq" style={{ padding: '5rem 0' }}>
      <div className="container">
        <div style={{ maxWidth: '640px', margin: '0 auto 3rem auto', textAlign: 'center' }}>
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
            Clear Answers
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
            Everything you need to know about subscriptions, authentication, security, and setup.
          </p>
        </div>

        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <Accordion items={FAQS} />

          <div
            style={{
              marginTop: '3rem',
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              Still have questions or need a custom solution?
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Our support team is available to assist you with architecture questions and onboarding.
            </p>
            <Link href="/contact" className="btn btn-secondary btn-sm">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
