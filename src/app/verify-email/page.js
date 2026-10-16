'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { MailCheck, RefreshCw, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  const { resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState(null);

  const handleResend = async (event) => {
    event.preventDefault();
    setResending(true);
    setError(null);
    setResent(false);
    try {
      const result = await resendVerification(email);
      if (result?.error) {
        setError(result.error.message);
      } else {
        setResent(true);
      }
    } catch {
      setError('Could not resend the verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email address"
      subtitle="Complete your registration to unlock all features"
      footer={
        <p>
          Need help?{' '}
          <Link href="/contact" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
            Contact Support
          </Link>
        </p>
      }
    >
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <MailCheck size={36} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Confirmation Link Dispatched
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Please check your email inbox and click on the verification link to confirm your account.
          If you don&apos;t see it, be sure to inspect your spam or junk folder.
        </p>

        {resent && (
          <div className="alert alert-success animate-fade-in" style={{ marginBottom: '1.5rem' }}>
            <span>Verification email has been re-dispatched.</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Input
            label="Email address"
            id="verify-email-address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button
            type="submit"
            variant="secondary"
            fullWidth
            loading={resending}
            icon={RefreshCw}
          >
            Resend Verification Link
          </Button>
        </form>
        <div style={{ marginTop: '0.85rem' }}>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
            <span>Go to Login</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
