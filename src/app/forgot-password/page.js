'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your account email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (res?.error) {
        setError(res.error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email to receive recovery instructions"
      footer={
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      }
    >
      {error && (
        <div className="alert alert-error animate-fade-in">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {sent ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Check your inbox</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            We&apos;ve dispatched password reset instructions to <strong>{email}</strong>. If an account exists with this address, you&apos;ll receive the email shortly.
          </p>
          <Button variant="secondary" fullWidth onClick={() => setSent(false)}>
            Re-send Email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Input
            label="Email address"
            id="reset-email"
            type="email"
            icon={Mail}
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            style={{ marginTop: '0.5rem' }}
          >
            Send Password Reset Link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
