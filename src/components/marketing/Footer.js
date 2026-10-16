import Link from 'next/link';
import { Layers, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        paddingTop: '4rem',
        paddingBottom: '3rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}
        >
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1.5' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontWeight: 800,
                fontSize: '1.25rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Layers size={18} />
              </div>
              <span>Stratum<span style={{ color: 'var(--brand-primary)' }}>Cloud</span></span>
            </Link>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                maxWidth: '300px',
                marginBottom: '1.5rem',
              }}
            >
              The modern enterprise cloud workspace powered by Next.js & Firebase.
              Engineered for velocity, security, and scalability.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-card)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Product Navigation */}
          <div>
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
              }}
            >
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li>
                <Link href="/#features" style={{ color: 'var(--text-secondary)' }}>Features Overview</Link>
              </li>
              <li>
                <Link href="/pricing" style={{ color: 'var(--text-secondary)' }}>Subscription Pricing</Link>
              </li>
              <li>
                <Link href="/dashboard/billing" style={{ color: 'var(--text-secondary)' }}>Billing & License</Link>
              </li>
              <li>
                <Link href="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard Shell</Link>
              </li>
              <li>
                <Link href="/register" style={{ color: 'var(--text-secondary)' }}>Create Account</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
              }}
            >
              Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li>
                <Link href="/#faq" style={{ color: 'var(--text-secondary)' }}>Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/contact" style={{ color: 'var(--text-secondary)' }}>Contact Support</Link>
              </li>
              <li>
                <Link href="/dashboard/support" style={{ color: 'var(--text-secondary)' }}>Knowledge Base</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
              }}
            >
              Legal & Security
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li>
                <Link href="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>GDPR & SOC2 Ready</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
        >
          <p>© 2026 Stratum. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built with Next.js & Firebase
          </p>
        </div>
      </div>
    </footer>
  );
}
