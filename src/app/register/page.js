'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { signUp, signInWithGoogle, resendVerification, isConfigured } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the terms of service to continue.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp({ email, password, fullName });
      if (res?.error) {
        setError(res.error.message);
      } else {
        if (!isConfigured) {
          // In demo mode, redirect straight into the dashboard
          router.push('/dashboard');
        } else {
          // Check if session exists or confirmation email was sent
          if (res?.data?.session) {
            router.push('/dashboard');
          } else {
            setSuccess(true);
          }
        }
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) setError(authError.message || 'Google sign-in failed.');
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage(null);
    try {
      const result = await resendVerification(email);
      setResendMessage(result?.error?.message || 'A new verification email has been sent.');
    } catch {
      setResendMessage('Could not resend the verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <AuthCard
        title="Verify your email"
        subtitle="We sent an activation link to your inbox"
        footer={
          <p>
            Already verified?{' '}
            <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
              Sign in now
            </Link>
          </p>
        }
      >
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
              margin: '0 auto 1.5rem auto',
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            We&apos;ve sent an activation link to <strong>{email}</strong>. Please click the link inside to confirm your email and activate your account.
          </p>
          {resendMessage && (
            <div className={`alert ${resendMessage.startsWith('A new') ? 'alert-success' : 'alert-error'}`} role="status">
              <span>{resendMessage}</span>
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            fullWidth
            loading={resending}
            onClick={handleResendVerification}
            style={{ marginBottom: '0.75rem' }}
          >
            Resend verification email
          </Button>
          <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }}>
            Return to Sign In
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start building with a robust SaaS foundation"
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div className="alert alert-error animate-fade-in">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Full name"
          id="register-name"
          icon={User}
          placeholder="e.g. Alex Johnson"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Work email address"
          id="register-email"
          type="email"
          icon={Mail}
          placeholder="name@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          id="register-password"
          type="password"
          icon={Lock}
          placeholder="At least 6 characters"
          required
          hint="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Confirm password"
          id="register-confirm-password"
          type="password"
          icon={Lock}
          placeholder="Repeat password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <input
            id="register-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            style={{ marginTop: '0.25rem', cursor: 'pointer' }}
          />
          <label htmlFor="register-terms" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
            I agree to the{' '}
            <Link href="/terms" target="_blank" style={{ color: 'var(--brand-primary)' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" style={{ color: 'var(--brand-primary)' }}>
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          icon={ArrowRight}
        >
          Create Free Account
        </Button>
      </form>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        <span style={{ height: '1px', flex: 1, background: 'var(--border-primary)' }} />
        or continue with
        <span style={{ height: '1px', flex: 1, background: 'var(--border-primary)' }} />
      </div>
      <Button
        variant="secondary"
        fullWidth
        loading={googleLoading}
        icon={ArrowRight}
        onClick={handleGoogleSignIn}
      >
        Continue with Google
      </Button>
    </AuthCard>
  );
}
