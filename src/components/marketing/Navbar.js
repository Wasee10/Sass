'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Layers, Menu, X, ArrowRight, User } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Layers size={20} />
          </div>
          <span>SaaS<span style={{ color: 'var(--brand-primary)' }}>Core</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="desktop-nav"
        >
          <Link
            href="/#features"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            Features
          </Link>
          <Link
            href="/#benefits"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            Benefits
          </Link>
          <Link
            href="/pricing"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            FAQ
          </Link>
        </nav>

        {/* Right Actions: Theme Toggle + Auth buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
          className="desktop-nav"
        >
          <ThemeToggle />

          {user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              <User size={16} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get Started
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div
          className="mobile-toggle"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer animate-fade-in"
          style={{
            position: 'absolute',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-primary)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Features
          </Link>
          <Link
            href="/#benefits"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Benefits
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Pricing Plans
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            FAQ
          </Link>

          <hr style={{ borderColor: 'var(--border-primary)' }} />

          {user ? (
            <Link
              href="/dashboard"
              className="btn btn-primary"
              onClick={() => setMobileMenuOpen(false)}
              style={{ width: '100%' }}
            >
              Open Dashboard
            </Link>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                href="/login"
                className="btn btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: '100%' }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: '100%' }}
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.desktop-nav) {
            display: none !important;
          }
          :global(.mobile-toggle) {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
