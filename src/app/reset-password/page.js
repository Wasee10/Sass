'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updated, setUpdated] = useState(false);

  const { updatePassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword(password);
      if (res?.error) {
        setError(res.error.message);
      } else {
        setUpdated(true);
      }
    } catch (err) {
      setError('Failed to update password. Please try again or request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create new password"
      subtitle="Enter and confirm your new secure account password"
      footer={
        <p>
          Remembered your password?{' '}
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

      {updated ? (
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
          <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Password Updated!</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your account password has been successfully updated. You can now access your dashboard.
          </p>
          <Button variant="primary" fullWidth onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Input
            label="New password"
            id="new-password"
            type="password"
            icon={Lock}
            placeholder="At least 6 characters"
            required
            hint="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm new password"
            id="confirm-new-password"
            type="password"
            icon={Lock}
            placeholder="Repeat new password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            style={{ marginTop: '0.5rem' }}
          >
            Update Password
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
