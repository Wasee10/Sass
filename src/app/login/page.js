'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get('redirect') || '/dashboard';
  const redirectPath = requestedRedirect.startsWith('/')
    && !requestedRedirect.startsWith('//')
    && !requestedRedirect.includes('\\')
    ? requestedRedirect
    : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await signIn({ email, password });
      if (authError) {
        setError(authError.message || 'Invalid email or password.');
      } else {
        router.push(redirectPath);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to manage your workspace"
      footer={
        <p>
          Don&apos;t have an account yet?{' '}
          <Link href="/register" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
            Sign up free
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
          label="Email address"
          id="login-email"
          type="email"
          icon={Mail}
          placeholder="name@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            id="login-password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div style={{ textAlign: 'right', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
            <Link
              href="/forgot-password"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--brand-primary)',
                fontWeight: 500,
              }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          icon={ArrowRight}
        >
          Sign In to Dashboard
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} className="spin" color="var(--brand-primary)" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
