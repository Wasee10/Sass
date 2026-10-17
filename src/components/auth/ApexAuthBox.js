'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Layers,
  ShieldCheck,
  Database,
  CreditCard,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Server,
  Zap,
} from 'lucide-react';

function getFriendlyAuthError(err) {
  const msg = typeof err === 'string' ? err : err?.message || '';
  if (msg.includes('auth/invalid-credential') || msg.includes('INVALID_LOGIN_CREDENTIALS')) {
    return 'Invalid email or password. If you do not have an account yet, switch to "Create account" or click "⚡ Instant Demo Access".';
  }
  if (msg.includes('auth/user-not-found')) {
    return 'No Stratum account found with this email. Switch to "Create account" tab to register in 10 seconds.';
  }
  if (msg.includes('auth/wrong-password')) {
    return 'Incorrect password. Please verify and try again.';
  }
  if (msg.includes('auth/email-already-in-use')) {
    return 'This email address is already registered. Please sign in instead.';
  }
  if (msg.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (msg.includes('auth/popup-closed-by-user')) {
    return 'Google sign-in popup was closed before completion.';
  }
  if (msg.includes('auth/popup-blocked')) {
    return 'Google popup was blocked. Please enable popups for localhost.';
  }
  if (msg.includes('auth/network-request-failed')) {
    return 'Network connection issue. Please check your internet connection.';
  }
  return msg || 'Authentication error. Please verify your details.';
}

const AVAILABLE_PACKAGES = [
  {
    id: 'free',
    name: 'Free Starter',
    priceMonthly: 0,
    priceYearly: 0,
    interval: 'forever',
    badge: 'Starter',
    highlight: false,
    description: 'Essential toolkit to kick off your projects and explore the foundation.',
    features: ['Up to 3 team members', 'Basic dashboard analytics', '1,000 monthly API calls', 'Community forum support'],
  },
  {
    id: 'pro-monthly',
    yearlyId: 'pro-yearly',
    name: 'Professional',
    priceMonthly: 29,
    priceYearly: 290,
    interval: 'mo',
    badge: 'Most Popular',
    highlight: true,
    description: 'Complete workspace power for growing teams, creators, and scale-ups.',
    features: ['Up to 25 team members', 'Comprehensive real-time analytics', '100,000 monthly API calls', 'Priority email & live chat support'],
  },
  {
    id: 'enterprise',
    yearlyId: 'enterprise-yearly',
    name: 'Enterprise',
    priceMonthly: 99,
    priceYearly: 990,
    interval: 'mo',
    badge: 'Enterprise',
    highlight: false,
    description: 'Maximum security, custom volume, and bespoke integration for large teams.',
    features: ['Unlimited team members', 'Custom data processing volume', 'Dedicated account manager', '99.99% uptime guarantee SLA'],
  },
];

export default function ApexAuthBox({ initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode); // 'signin' or 'register'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [pgStatusNotice, setPgStatusNotice] = useState(null);

  const { signIn, signUp, signInWithGoogle, loginAsDemo, updateSubscriptionPlan } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/dashboard';

  // Package & Interval Selection State
  const planParam = searchParams?.get('plan');
  const intervalParam = searchParams?.get('interval') || (planParam?.includes('yearly') ? 'year' : 'month');
  const [selectedInterval, setSelectedInterval] = useState(intervalParam === 'year' ? 'year' : 'month');

  const matchedFromParam = AVAILABLE_PACKAGES.find(
    (p) => p.id === planParam || (planParam && (p.id.startsWith(planParam) || (p.yearlyId && p.yearlyId === planParam)))
  );

  const [selectedPackage, setSelectedPackage] = useState(matchedFromParam || null);
  const [showPackagePicker, setShowPackagePicker] = useState(!matchedFromParam);

  // Restore package from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stratum_chosen_package');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const found = AVAILABLE_PACKAGES.find(
            (p) => p.id === parsed.id || p.id === parsed.planId || p.yearlyId === parsed.id || p.name === parsed.name
          );
          if (found) {
            const isYearly = parsed.interval === 'year' || parsed.billingInterval === 'year' || parsed.id?.includes('yearly');
            setSelectedPackage({
              ...found,
              price: found.id === 'free' ? 0 : isYearly ? found.priceYearly : found.priceMonthly,
              interval: found.id === 'free' ? 'forever' : isYearly ? 'yr' : 'mo',
            });
            setSelectedInterval(isYearly ? 'year' : 'month');
            setShowPackagePicker(false);
          }
        } catch {
          // ignore error
        }
      }
    }
  }, []);

  const handleSelectPackage = (pkg, interval = selectedInterval) => {
    const isYearly = interval === 'year';
    const resolvedPrice = pkg.id === 'free' ? 0 : isYearly ? pkg.priceYearly : pkg.priceMonthly;
    const resolvedInterval = pkg.id === 'free' ? 'forever' : isYearly ? 'year' : 'month';
    const resolvedPlanId = pkg.id === 'free'
      ? 'free'
      : isYearly
      ? (pkg.yearlyId || (pkg.id.includes('enterprise') ? 'enterprise-yearly' : 'pro-yearly'))
      : (pkg.id.includes('enterprise') ? 'enterprise' : 'pro-monthly');
    const resolvedPlanName = pkg.id === 'free'
      ? 'Free Starter'
      : pkg.id.includes('enterprise')
      ? (isYearly ? 'Enterprise Annual' : 'Enterprise')
      : (isYearly ? 'Pro Yearly' : 'Professional');

    const pkgData = {
      ...pkg,
      id: resolvedPlanId,
      planId: resolvedPlanId,
      name: resolvedPlanName,
      price: resolvedPrice,
      interval: resolvedInterval,
      billingInterval: resolvedInterval,
    };
    setSelectedPackage(pkgData);
    setSelectedInterval(isYearly ? 'year' : 'month');
    setShowPackagePicker(false);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stratum_chosen_package', JSON.stringify(pkgData));
      document.cookie = `stratum_chosen_plan=${resolvedPlanId}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `stratum_chosen_interval=${resolvedInterval}; path=/; max-age=2592000; SameSite=Lax`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('npx create-stratum-app@latest my-platform');
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Helper to persist chosen package to PostgreSQL
  const recordPackageInPostgres = async (authUserData) => {
    if (!selectedPackage) return;
    const isYearly = selectedInterval === 'year' || selectedPackage.billingInterval === 'year' || selectedPackage.interval === 'yr';
    const isFree = selectedPackage.id === 'free';
    const resolvedPrice = isFree ? 0 : isYearly ? (selectedPackage.priceYearly || 290) : (selectedPackage.priceMonthly || 29);
    const resolvedPlanId = isFree
      ? 'free'
      : isYearly
      ? (selectedPackage.yearlyId || (selectedPackage.id?.includes('enterprise') ? 'enterprise-yearly' : 'pro-yearly'))
      : (selectedPackage.id?.includes('enterprise') ? 'enterprise' : 'pro-monthly');
    const resolvedInterval = isFree ? 'forever' : isYearly ? 'year' : 'month';

    try {
      const response = await fetch('/api/user/package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authUserData.uid || 'demo-user-id',
          email: authUserData.email || email,
          fullName: authUserData.displayName || fullName || 'Member',
          planId: resolvedPlanId,
          planName: selectedPackage.name,
          price: resolvedPrice,
          billingInterval: resolvedInterval,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setPgStatusNotice(`Saved in PostgreSQL: ${selectedPackage.name} (${resolvedInterval})`);
      }
    } catch (err) {
      console.warn('PostgreSQL sync error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Enforcement: User must choose a package before login/signup
    if (!selectedPackage) {
      setError('Please choose a package (Free, Professional, or Enterprise) to continue.');
      setShowPackagePicker(true);
      toast.warning('Package Required', 'Please select a package before authenticating.');
      return;
    }

    if (!email || !password) {
      setError('Please provide your work email and password.');
      return;
    }

    const isYearly = selectedInterval === 'year' || selectedPackage.billingInterval === 'year';
    const resolvedPlanId = selectedPackage.id === 'free'
      ? 'free'
      : isYearly
      ? (selectedPackage.yearlyId || (selectedPackage.id?.includes('enterprise') ? 'enterprise-yearly' : 'pro-yearly'))
      : (selectedPackage.id?.includes('enterprise') ? 'enterprise' : 'pro-monthly');
    const resolvedInterval = selectedPackage.id === 'free' ? 'forever' : isYearly ? 'year' : 'month';

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { data, error: authError } = await signIn({ email, password });
        if (authError) {
          const friendly = getFriendlyAuthError(authError);
          setError(friendly);
          toast.error('Sign In Failed', friendly);
        } else {
          // Ensure cookie is synchronously set
          if (typeof document !== 'undefined') {
            document.cookie = `saas_demo_user=${encodeURIComponent(data?.user?.email || email)}; path=/; max-age=604800; SameSite=Lax`;
          }

          // Persistent flash toast for dashboard
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              'stratum_pending_toast',
              JSON.stringify({
                type: 'success',
                title: 'Login Successful!',
                message: `Welcome back to Stratum! Your ${selectedPackage.name} dashboard is ready.`
              })
            );
          }

          // Immediate toast on screen
          toast.success('Login Successful!', 'Welcome back to Stratum. Redirecting to your dashboard...');

          // Non-blocking background sync
          if (data?.user) {
            recordPackageInPostgres(data.user).catch(() => {});
            updateSubscriptionPlan(resolvedPlanId, resolvedInterval).catch(() => {});
          }

          // Directly go to dashboard
          window.location.href = redirectPath;
        }
      } else {
        const { data, error: authError } = await signUp({ email, password, fullName });
        if (authError) {
          const friendly = getFriendlyAuthError(authError);
          setError(friendly);
          toast.error('Registration Notice', friendly);
        } else {
          if (typeof document !== 'undefined') {
            document.cookie = `saas_demo_user=${encodeURIComponent(data?.user?.email || email)}; path=/; max-age=604800; SameSite=Lax`;
          }

          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              'stratum_pending_toast',
              JSON.stringify({
                type: 'success',
                title: 'Account Created Successfully!',
                message: `Welcome to Stratum, ${fullName || 'Developer'}! Your ${selectedPackage.name} environment is ready.`
              })
            );
          }

          toast.success('Account Created Successfully!', 'Welcome to Stratum! Redirecting to your dashboard...');

          if (data?.user) {
            recordPackageInPostgres(data.user).catch(() => {});
            updateSubscriptionPlan(resolvedPlanId, resolvedInterval).catch(() => {});
          }

          const finalRedirect = (!isFree && (!redirectPath || redirectPath === '/dashboard'))
            ? `/checkout?plan=${resolvedPlanId}&interval=${resolvedInterval}`
            : (redirectPath || '/dashboard');

          window.location.href = finalRedirect;
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      toast.error('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!selectedPackage) {
      setError('Please choose a package before signing in with Google.');
      setShowPackagePicker(true);
      toast.warning('Package Required', 'Please select a package before signing in with Google.');
      return;
    }

    const isYearly = selectedInterval === 'year' || selectedPackage.billingInterval === 'year';
    const resolvedPlanId = selectedPackage.id === 'free'
      ? 'free'
      : isYearly
      ? (selectedPackage.yearlyId || (selectedPackage.id?.includes('enterprise') ? 'enterprise-yearly' : 'pro-yearly'))
      : (selectedPackage.id?.includes('enterprise') ? 'enterprise' : 'pro-monthly');
    const resolvedInterval = selectedPackage.id === 'free' ? 'forever' : isYearly ? 'year' : 'month';

    setError(null);
    setGoogleLoading(true);
    try {
      const { data, error: authError } = await signInWithGoogle();
      if (authError) {
        const friendly = getFriendlyAuthError(authError);
        setError(friendly);
        toast.error('Google Sign-In', friendly);
      } else {
        if (typeof document !== 'undefined') {
          document.cookie = `saas_demo_user=${encodeURIComponent(data?.user?.email || 'google_user')}; path=/; max-age=604800; SameSite=Lax`;
        }

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'stratum_pending_toast',
            JSON.stringify({
              type: 'success',
              title: 'Login Successful!',
              message: `Welcome back, ${data?.user?.displayName || 'Developer'}! Redirecting to dashboard...`
            })
          );
        }

        toast.success('Login Successful!', 'Signed in with Google. Redirecting to your dashboard...');

        if (data?.user) {
          recordPackageInPostgres(data.user).catch(() => {});
          updateSubscriptionPlan(resolvedPlanId, resolvedInterval).catch(() => {});
        }

        window.location.href = redirectPath;
      }
    } catch {
      setError('Google sign-in encountered an error.');
      toast.error('Google Sign-In', 'Google sign-in encountered an error.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    const rawPkg = selectedPackage || AVAILABLE_PACKAGES[1]; // default to Professional
    const isYearly = selectedInterval === 'year' || rawPkg.billingInterval === 'year';
    const isFree = rawPkg.id === 'free';
    const resolvedPlanId = isFree
      ? 'free'
      : isYearly
      ? (rawPkg.yearlyId || (rawPkg.id?.includes('enterprise') ? 'enterprise-yearly' : 'pro-yearly'))
      : (rawPkg.id?.includes('enterprise') ? 'enterprise' : 'pro-monthly');
    const resolvedInterval = isFree ? 'forever' : isYearly ? 'year' : 'month';
    const resolvedPrice = isFree ? 0 : isYearly ? (rawPkg.priceYearly || 290) : (rawPkg.priceMonthly || 29);
    const resolvedName = isFree
      ? 'Free Starter'
      : rawPkg.id?.includes('enterprise')
      ? (isYearly ? 'Enterprise Annual' : 'Enterprise')
      : (isYearly ? 'Pro Yearly' : 'Professional');

    const pkgToUse = {
      ...rawPkg,
      id: resolvedPlanId,
      planId: resolvedPlanId,
      name: resolvedName,
      price: resolvedPrice,
      interval: resolvedInterval,
      billingInterval: resolvedInterval,
    };

    setSelectedPackage(pkgToUse);
    loginAsDemo(pkgToUse);

    if (typeof document !== 'undefined') {
      document.cookie = 'saas_demo_user=alex%40stratum.io; path=/; max-age=604800; SameSite=Lax';
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'stratum_pending_toast',
        JSON.stringify({
          type: 'success',
          title: 'Login Successful!',
          message: `Logged in as Alex Thorne (${resolvedName}). Loading dashboard...`
        })
      );
    }

    toast.success('Login Successful!', 'Demo session activated. Redirecting to your dashboard...');

    recordPackageInPostgres({
      uid: 'stratum_demo_user_id',
      email: 'alex@stratum.io',
      displayName: 'Alex Thorne',
    }).catch(() => {});

    // DIRECTLY GO TO redirectPath OR /dashboard
    window.location.href = redirectPath || '/dashboard';
  };

  return (
    <div
      className="apex-auth-container"
      style={{
        width: '100%',
        maxWidth: '1160px',
        minHeight: '680px',
        margin: '2rem auto',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
      }}
    >
      {/* ================= LEFT COLUMN: HERO BRANDING PANEL ================= */}
      <div
        className="apex-auth-branding-panel"
        style={{
          flex: '1 1 440px',
          background: '#0e1424',
          color: '#ffffff',
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Aurora Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '-15%',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.45) 0%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            right: '-15%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top: Brand Header & Value Proposition */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand Logo & Name */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
              }}
            >
              <Layers size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Stratum
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ENTERPRISE STACK
              </div>
            </div>
          </Link>

          {/* Pill Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '1.25rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a5b4fc', boxShadow: '0 0 6px #a5b4fc' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c7d2fe' }}>v3.4 Production Ready</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.025em', marginBottom: '1rem', color: '#ffffff' }}>
            Start building in minutes.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '2.25rem' }}>
            Everything your team needs to launch enterprise applications with Firebase Auth, Cloud Firestore, and live PostgreSQL synchronization.
          </p>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                <Server size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.2rem' }}>PostgreSQL Sync</h4>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.4 }}>Selected packages and subscriptions automatically record to PostgreSQL database.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.2rem' }}>Commercial License</h4>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.4 }}>Instant generation of cryptographically signed enterprise license tokens.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Terminal Widget */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: '2.5rem' }}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.25rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#64748b', textTransform: 'uppercase' }}>Terminal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#f8fafc', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#818cf8', marginRight: '0.5rem' }}>$</span>
                npx create-stratum-app@latest my-platform
              </div>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedSnippet ? '#10b981' : '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title="Copy command"
              >
                {copiedSnippet ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.6875rem', fontFamily: 'monospace', color: '#64748b' }}>
            <span>Latency: ~18ms</span>
            <span>Global Edge Network</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: INTERACTIVE AUTH BOX ================= */}
      <div
        className="apex-auth-form-panel"
        style={{
          flex: '1 1 480px',
          padding: '2.5rem 2.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          {/* Header & Segmented Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                {mode === 'signin' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {mode === 'signin'
                  ? 'Sign in to access your Stratum workspace'
                  : 'Select your package and start building'}
              </p>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <Lock size={18} />
            </div>
          </div>

          {/* Checkout Auth Requirement Notice */}
          {redirectPath?.includes('/checkout') && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(225, 29, 72, 0.08)',
                border: '1px solid rgba(225, 29, 72, 0.25)',
                color: '#e11d48',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.25rem',
              }}
            >
              <Lock size={16} />
              <span>
                Please {mode === 'signin' ? 'sign in' : 'register'} first to complete your subscription purchase. You will be redirected right back to checkout!
              </span>
            </div>
          )}

          {/* ================= PACKAGE ENFORCEMENT & SELECTION BANNER ================= */}
          {selectedPackage && !showPackagePicker ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(49, 97, 248, 0.08)',
                border: '1px solid rgba(49, 97, 248, 0.25)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <CheckCircle2 size={18} color="#3161F8" />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedPackage.name} (${selectedPackage.price}/{selectedPackage.id === 'free' ? 'forever' : selectedInterval === 'year' ? 'year' : 'month'})
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#3161F8', fontWeight: 600 }}>
                    ✓ Package Selected · {selectedInterval === 'year' ? 'Annual Billing (-20%)' : 'Monthly Billing'} · Syncs to PostgreSQL
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPackagePicker(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Change
              </button>
            </div>
          ) : (
            /* STEP 1: PACKAGE SELECTOR (MANDATORY REQUIREMENT) */
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Zap size={15} color="#3161F8" />
                  Step 1: Choose Your Package (Required)
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Stored in PostgreSQL
                </span>
              </div>

              {/* Monthly / Annual Billing Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-primary)',
                  padding: '3px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  marginBottom: '0.75rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedInterval('month')}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: selectedInterval === 'month' ? 'var(--brand-primary)' : 'transparent',
                    color: selectedInterval === 'month' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInterval('year')}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: selectedInterval === 'year' ? 'var(--brand-primary)' : 'transparent',
                    color: selectedInterval === 'year' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>Annual Billing</span>
                  <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem', borderRadius: '9999px', background: selectedInterval === 'year' ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.15)', color: selectedInterval === 'year' ? '#ffffff' : '#10b981', fontWeight: 800 }}>-20%</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {AVAILABLE_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const priceToShow = pkg.id === 'free' ? 0 : selectedInterval === 'year' ? (pkg.priceYearly ? Math.round(pkg.priceYearly / 12) : pkg.priceMonthly) : pkg.priceMonthly;
                  const intervalLabel = pkg.id === 'free' ? 'forever' : selectedInterval === 'year' ? 'mo (billed $ ' + pkg.priceYearly + '/yr)' : 'mo';
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg, selectedInterval)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--bg-card)' : 'transparent',
                        border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {pkg.name}
                          </span>
                          {pkg.badge && (
                            <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem', borderRadius: '9999px', background: 'rgba(49, 97, 248, 0.15)', color: '#3161F8', fontWeight: 700 }}>
                              {pkg.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {pkg.description}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '0.5rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ${priceToShow}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          /{intervalLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Segmented Switcher Tab */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg-secondary)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              gap: '0.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: mode === 'signin' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'signin' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: mode === 'signin' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: mode === 'register' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'register' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Create account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.28)',
                color: '#ef4444',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 500, lineHeight: 1.45 }}>{error}</span>
              </div>
              {mode === 'signin' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Switch to Create Account →
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoAccess}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Use Instant Demo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Social Auth Providers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {googleLoading ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError('GitHub OAuth can be configured in your Firebase Console.');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-primary)' }} />
            <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-primary)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {mode === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Elena Rostova"
                  required
                  style={{
                    height: '42px',
                    padding: '0 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@stratum.io"
                required
                style={{
                  height: '42px',
                  padding: '0 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
                {mode === 'signin' && (
                  <Link
                    href="/forgot-password"
                    style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600 }}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 2.5rem 0 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--brand-primary)', width: '16px', height: '16px' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                borderRadius: 'var(--radius-md)',
                height: '44px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              }}
            >
              {loading ? (
                <Loader2 size={18} className="spin" />
              ) : mode === 'signin' ? (
                `Sign in with ${selectedPackage ? selectedPackage.name : 'Package'}`
              ) : (
                `Register with ${selectedPackage ? selectedPackage.name : 'Package'}`
              )}
            </button>

            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleDemoAccess}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px dashed var(--brand-primary)',
                  padding: '0.625rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>⚡ Instant Demo Access (Preselects Professional & Syncs)</span>
              </button>
            </div>
          </form>

          {/* PostgreSQL status notification */}
          {pgStatusNotice && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#10b981', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} />
              <span>{pgStatusNotice}</span>
            </div>
          )}

          {/* Footer note */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            By continuing, you agree to Stratum Platform{' '}
            <Link href="/terms" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>.
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .apex-auth-container {
            flex-direction: column !important;
            margin: 1rem auto !important;
          }
          .apex-auth-branding-panel {
            padding: 2rem 1.5rem !important;
            min-height: auto !important;
          }
          .apex-auth-form-panel {
            padding: 2rem 1.5rem !important;
          }
        }
        @media (max-width: 640px) {
          .apex-auth-branding-panel {
            display: none !important;
          }
          .apex-auth-form-panel {
            padding: 1.5rem 1rem !important;
          }
          .apex-auth-container {
            border-radius: var(--radius-lg) !important;
            box-shadow: var(--shadow-md) !important;
          }
        }
      `}</style>
    </div>
  );
}
