'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function CookieNotice() {
  const noticeRef = useRef(null);

  useEffect(() => {
    const dismissed = document.cookie.split('; ').some((cookie) => cookie.startsWith('site-cookie-notice=seen'));
    if (!dismissed && noticeRef.current) noticeRef.current.hidden = false;
  }, []);

  const dismiss = () => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `site-cookie-notice=seen; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    if (noticeRef.current) noticeRef.current.hidden = true;
  };

  return (
    <aside
      ref={noticeRef}
      hidden
      role="region"
      aria-label="Cookie notice"
      style={{
        position: 'fixed',
        zIndex: 100,
        bottom: '1rem',
        left: '1rem',
        width: 'min(31rem, calc(100vw - 2rem))',
        padding: '1rem',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Essential cookies
          </strong>
          <p style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
            Sign-in and security cookies keep your account working. We do not use optional advertising cookies.{' '}
            <Link href="/privacy" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>
              Privacy details
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss cookie notice"
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-start', padding: '0.25rem' }}
        >
          <X size={17} />
        </button>
      </div>
      <button type="button" className="btn btn-secondary btn-sm" onClick={dismiss} style={{ marginTop: '0.75rem' }}>
        Got it
      </button>
    </aside>
  );
}
