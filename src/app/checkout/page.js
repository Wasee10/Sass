'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { initiateCheckout } from '@/client/payment';
import { saveChosenPackage } from '@/client/services';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Zap,
  CreditCard,
  Smartphone,
  Building,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronRight,
  Info,
  Sparkles,
  UserCheck,
  LogIn,
} from 'lucide-react';

const PLAN_DEFINITIONS = {
  'pro-monthly': {
    id: 'pro-monthly',
    name: 'Professional',
    tierKey: 'pro',
    interval: 'month',
    price: 29,
    description: 'Complete workspace power for growing teams, creators, and scale-ups.',
    features: [
      'Up to 25 team members',
      'Comprehensive real-time analytics',
      '100,000 monthly API calls',
      'Priority email & live chat support',
    ],
  },
  'pro-yearly': {
    id: 'pro-yearly',
    name: 'Professional Annual',
    tierKey: 'pro',
    interval: 'year',
    price: 290,
    description: 'Complete workspace power billed annually (Save 20%).',
    features: [
      'Up to 25 team members',
      'Comprehensive real-time analytics',
      '100,000 monthly API calls',
      'Priority email & live chat support',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tierKey: 'enterprise',
    interval: 'month',
    price: 99,
    description: 'Maximum security, custom volume, and bespoke integration for large teams.',
    features: [
      'Unlimited team members',
      'Custom data processing volume',
      'Dedicated account manager',
      '99.99% uptime guarantee SLA',
    ],
  },
  'enterprise-yearly': {
    id: 'enterprise-yearly',
    name: 'Enterprise Annual',
    tierKey: 'enterprise',
    interval: 'year',
    price: 990,
    description: 'Maximum enterprise power billed annually (Save 20%).',
    features: [
      'Unlimited team members',
      'Custom data processing volume',
      'Dedicated account manager',
      '99.99% uptime guarantee SLA',
    ],
  },
};

const PAYMENT_METHODS = [
  {
    id: 'uddoktapay',
    name: 'UddoktaPay Payment Gateway (Recommended)',
    badge: 'INSTANT ACTIVATION',
    badgeColor: '#10b981',
    description: 'Pay securely using Bangladeshi Mobile Banking (bKash, Nagad, Rocket, Upay), Cards, or Net Banking.',
    channels: [
      { name: 'bKash', color: '#e2136e', bg: 'rgba(226, 19, 110, 0.12)' },
      { name: 'Nagad', color: '#f7931e', bg: 'rgba(247, 147, 30, 0.12)' },
      { name: 'Rocket', color: '#8c3494', bg: 'rgba(140, 52, 148, 0.12)' },
      { name: 'Upay', color: '#00a3e0', bg: 'rgba(0, 163, 224, 0.12)' },
      { name: 'Visa', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
      { name: 'MasterCard', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)' },
    ],
  },
  {
    id: 'card',
    name: 'International Credit or Debit Card',
    badge: 'STRIPE SECURE',
    badgeColor: '#3b82f6',
    description: 'Direct payment with Visa, Mastercard, American Express, or UnionPay.',
    channels: [
      { name: 'Visa', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
      { name: 'MasterCard', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)' },
      { name: 'Amex', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' },
    ],
  },
  {
    id: 'bank',
    name: 'Corporate Bank Wire / Tax Invoice',
    badge: 'ENTERPRISE',
    badgeColor: '#8b5cf6',
    description: 'Manual wire transfer or automated invoicing for procurement and finance departments.',
    channels: [{ name: 'SWIFT / ACH Wire', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' }],
  },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading: authLoading, loginAsDemo } = useAuth();
  const toast = useToast();

  // Selected Plan resolution
  const planParam = searchParams.get('plan') || 'pro-monthly';
  const intervalParam = searchParams.get('interval') || (planParam.includes('yearly') ? 'year' : 'month');

  const [activePlanKey, setActivePlanKey] = useState(
    PLAN_DEFINITIONS[planParam] ? planParam : 'pro-monthly'
  );
  const [billingInterval, setBillingInterval] = useState(intervalParam);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('uddoktapay');

  // Customer Contact Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync user defaults when available
  useEffect(() => {
    if (user || profile) {
      setFullName(profile?.full_name || user?.displayName || '');
      setEmail(profile?.email || user?.email || '');
    } else {
      setFullName('');
      setEmail('');
    }
  }, [user, profile]);

  // When interval changes, update active plan key accordingly
  const handleIntervalChange = (newInterval) => {
    setBillingInterval(newInterval);
    const isEnt = activePlanKey.includes('enterprise');
    if (newInterval === 'year') {
      setActivePlanKey(isEnt ? 'enterprise-yearly' : 'pro-yearly');
    } else {
      setActivePlanKey(isEnt ? 'enterprise' : 'pro-monthly');
    }
  };

  const currentPlan = PLAN_DEFINITIONS[activePlanKey] || PLAN_DEFINITIONS['pro-monthly'];
  const bdtExchangeRate = 120; // 1 USD ≈ 120 BDT
  const bdtAmount = Math.round(currentPlan.price * bdtExchangeRate);

  // URLs for auth redirect back to this exact plan & interval
  const currentCheckoutUrl = `/checkout?plan=${activePlanKey}&interval=${billingInterval}`;
  const loginUrl = `/login?redirect=${encodeURIComponent(currentCheckoutUrl)}&plan=${activePlanKey}&interval=${billingInterval}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(currentCheckoutUrl)}&plan=${activePlanKey}&interval=${billingInterval}`;

  // Trigger Checkout via UddoktaPay
  const handleProceedToPayment = async (e) => {
    e?.preventDefault();
    setError(null);

    // Mandatory Authentication Check: User MUST be logged in or registered before purchasing
    if (!user) {
      setError('You must log in or register before completing your purchase.');
      toast.warning('Account Required', 'Please log in or register before completing payment.');
      router.push(loginUrl);
      return;
    }

    const payerName = fullName.trim() || user?.displayName || profile?.full_name || 'Stratum Member';
    const payerEmail = email.trim() || user?.email;

    if (!payerEmail) {
      setError('Please provide your email address.');
      toast.error('Missing Email', 'Email address is required to generate invoice.');
      return;
    }

    if (selectedPaymentMethod === 'uddoktapay') {
      setLoading(true);
      try {
        toast.info('Connecting Gateway', 'Creating UddoktaPay Sandbox charge session...');

        const data = await initiateCheckout({
          fullName: payerName,
          email: payerEmail,
          amount: String(currentPlan.price),
          planId: currentPlan.id,
          planName: currentPlan.name,
          interval: currentPlan.interval,
          userId: user.uid,
        });

        if (data.success && data.paymentUrl) {
          toast.success('Redirecting...', 'Forwarding to UddoktaPay Sandbox Portal...');
          saveChosenPackage({
            id: currentPlan.id,
            planId: currentPlan.id,
            name: currentPlan.name,
            price: currentPlan.price,
            interval: currentPlan.interval,
            billingInterval: currentPlan.interval,
          });

          // Forward to UddoktaPay payment gateway URL
          window.location.href = data.paymentUrl;
        } else {
          setError(data.error || 'Could not initiate UddoktaPay checkout session.');
          toast.error('Checkout Error', data.error || 'Gateway error');
        }
      } catch (err) {
        console.error('Checkout network error:', err);
        setError('Failed to reach payment gateway service. Please check your network.');
        toast.error('Connection Error', 'Failed to reach payment service.');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback for demo cards or bank wire
      toast.info(
        'UddoktaPay is Active',
        'Please select UddoktaPay to experience the live sandbox payment method (bKash/Nagad/Cards).'
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, padding: '3.5rem 1.5rem', maxWidth: '1100px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '2rem' }}>
          <Link
            href="/pricing"
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Pricing Plans</span>
          </Link>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--brand-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'var(--brand-primary-light)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '0.5rem',
            }}
          >
            Secure Checkout
          </span>
          <h1 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
            Choose Your Payment Method
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>
            Complete your subscription with local mobile banking (bKash, Nagad, Rocket, Upay) or international cards via UddoktaPay.
          </p>
        </div>

        {/* Main 2-Column Checkout Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="checkout-grid"
        >
          {/* ================= LEFT COLUMN: CUSTOMER & PAYMENT METHODS ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Step 1: Customer Authentication & Details Card */}
            <Card style={{ padding: '2rem' }}>
              {!user ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e11d48, #be123c)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                      }}
                    >
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Step 1: Account Required Before Purchase
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        You must log in or register so your subscription and workspace license are linked to your account.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.05), rgba(79, 70, 229, 0.04))',
                      border: '1.5px dashed rgba(225, 29, 72, 0.35)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.75rem 1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.85rem',
                        borderRadius: '9999px',
                        background: 'rgba(225, 29, 72, 0.12)',
                        color: '#e11d48',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        marginBottom: '0.85rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      <AlertCircle size={14} /> Log In or Register First
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Please Authenticate to Continue
                    </h4>
                    <p style={{ margin: '0 auto 1.5rem auto', maxWidth: '440px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      Stratum requires all purchases to be authenticated so your invoice, payment receipts, and team member quota are permanently tied to your profile.
                    </p>

                    {/* Primary Auth CTAs */}
                    <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Link
                        href={loginUrl}
                        className="btn btn-primary"
                        style={{
                          padding: '0.75rem 1.5rem',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#e11d48',
                          borderColor: '#e11d48',
                          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
                        }}
                      >
                        <LogIn size={16} />
                        <span>Sign In with Existing Account</span>
                      </Link>
                      <Link
                        href={registerUrl}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.75rem 1.5rem',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'var(--bg-card)',
                        }}
                      >
                        <Sparkles size={16} color="var(--brand-primary)" />
                        <span>Create New Account</span>
                      </Link>
                    </div>

                    {/* Quick Demo Login Option for Instant Testing */}
                    <div style={{ marginTop: '1.35rem', paddingTop: '1rem', borderTop: '1px solid var(--border-primary)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (loginAsDemo) {
                            loginAsDemo({
                              id: activePlanKey,
                              planId: activePlanKey,
                              name: currentPlan.name,
                              price: currentPlan.price,
                              interval: billingInterval,
                              billingInterval,
                            });
                            toast.success('Demo Account Activated', 'Signed in as Alex Thorne. You can now complete your checkout!');
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--brand-primary)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          textDecoration: 'underline',
                        }}
                      >
                        <Zap size={14} />
                        <span>Need instant sandbox testing? Click here for 1-Click Demo Login</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Authenticated User Display */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Step 1: Account Verified
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          Your purchase and subscription will be registered under this account.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={loginUrl}
                      style={{
                        fontSize: '0.78125rem',
                        color: 'var(--brand-primary)',
                        textDecoration: 'underline',
                        fontWeight: 600,
                      }}
                    >
                      Switch Account
                    </Link>
                  </div>

                  {/* User Profile Card */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--brand-primary)',
                        flexShrink: 0,
                        background: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {user?.photoURL || profile?.avatar_url ? (
                        <img
                          src={user.photoURL || profile.avatar_url}
                          alt={user.displayName || profile?.full_name || 'User'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || profile?.full_name || user?.email || 'User')}&background=3161F8&color=fff&bold=true`}
                          alt="Avatar"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                          {user.displayName || profile?.full_name || 'Stratum Developer'}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Check size={11} /> Authenticated
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                        {user.email} · <span style={{ color: 'var(--text-muted)' }}>UID: {user.uid?.slice(0, 14)}...</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer details input fields */}
                  <div className="customer-fields-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                        Billing Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Name for invoice receipt"
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                        Contact Phone (for bKash / SMS receipt)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 01700000000 (optional)"
                        style={{
                          width: '100%',
                          height: '42px',
                          padding: '0 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Step 2: Payment Method Selection */}
            <Card style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#e11d48',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                  }}
                >
                  2
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Select Payment Method
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Choose your preferred payment gateway channel.
                  </p>
                </div>
              </div>

              {/* Payment Methods List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedPaymentMethod === method.id;
                  const isUddokta = method.id === 'uddoktapay';

                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected
                          ? '2px solid #e11d48'
                          : '1px solid var(--border-primary)',
                        background: isSelected ? 'rgba(225, 29, 72, 0.03)' : 'var(--bg-card)',
                        boxShadow: isSelected ? '0 8px 24px -6px rgba(225, 29, 72, 0.2)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                            style={{ width: '18px', height: '18px', accentColor: '#e11d48', cursor: 'pointer' }}
                          />
                          <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                            {method.name}
                          </strong>
                        </div>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            background: `${method.badgeColor}1a`,
                            color: method.badgeColor,
                            border: `1px solid ${method.badgeColor}33`,
                            letterSpacing: '0.04em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {method.badge}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 0.85rem 1.85rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {method.description}
                      </p>

                      {/* Channel Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginLeft: '1.85rem' }}>
                        {method.channels.map((chan, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              background: chan.bg,
                              color: chan.color,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              border: `1px solid ${chan.color}33`,
                            }}
                          >
                            {chan.name}
                          </span>
                        ))}
                      </div>

                      {/* Sandbox Testing Guide inside UddoktaPay Card */}
                      {isSelected && isUddokta && (
                        <div
                          style={{
                            marginTop: '1.25rem',
                            marginLeft: '1.85rem',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '0.8125rem',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Zap size={14} /> 🧪 Sandbox Test Instructions:
                          </strong>
                          <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-secondary)' }}>
                            On the UddoktaPay portal, choose <strong>bKash</strong> or <strong>Nagad</strong>. Use any phone number (e.g. <code>01700000000</code>), OTP <code>123456</code>, and PIN <code>1234</code> to simulate an instant payment.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ================= RIGHT COLUMN: ORDER SUMMARY & CHECKOUT BUTTON ================= */}
          <div style={{ position: 'sticky', top: '5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, margin: '0 0 1.25rem 0', color: 'var(--text-primary)' }}>
                Order Summary
              </h3>

              {/* Plan Switcher Pills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Select Subscription Plan:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const newKey = billingInterval === 'year' ? 'pro-yearly' : 'pro-monthly';
                      setActivePlanKey(newKey);
                    }}
                    style={{
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: activePlanKey.includes('pro') ? '2px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                      background: activePlanKey.includes('pro') ? 'var(--brand-primary-light)' : 'transparent',
                      color: activePlanKey.includes('pro') ? 'var(--brand-primary)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    Professional
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newKey = billingInterval === 'year' ? 'enterprise-yearly' : 'enterprise';
                      setActivePlanKey(newKey);
                    }}
                    style={{
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      border: activePlanKey.includes('enterprise') ? '2px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                      background: activePlanKey.includes('enterprise') ? 'var(--brand-primary-light)' : 'transparent',
                      color: activePlanKey.includes('enterprise') ? 'var(--brand-primary)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    Enterprise
                  </button>
                </div>
              </div>

              {/* Billing Interval Toggle (Monthly / Annual) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Billing Cadence:
                </label>
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--bg-secondary)',
                    padding: '0.3rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleIntervalChange('month')}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: billingInterval === 'month' ? 'var(--bg-card)' : 'transparent',
                      color: billingInterval === 'month' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      padding: '0.45rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      boxShadow: billingInterval === 'month' ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIntervalChange('year')}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: billingInterval === 'year' ? 'var(--bg-card)' : 'transparent',
                      color: billingInterval === 'year' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      padding: '0.45rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: billingInterval === 'year' ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <span>Annual</span>
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Details Box */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Stratum {currentPlan.name}
                  </strong>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${currentPlan.price}.00
                  </span>
                </div>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {currentPlan.description}
                </p>

                {/* Features checklist */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {currentPlan.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <Check size={14} color="#10b981" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Breakdown Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Subtotal:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${currentPlan.price}.00 USD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Gateway Fee:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>$0.00 (Waived)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Approx. Currency:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    ≈ ৳{bdtAmount.toLocaleString()} BDT
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderTop: '2px dashed var(--border-primary)',
                    paddingTop: '0.85rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <strong style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                    Total Due:
                  </strong>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#e11d48' }}>
                      ${currentPlan.price}.00 USD
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      (≈ ৳{bdtAmount.toLocaleString()} BDT)
                    </div>
                  </div>
                </div>
              </div>

              {/* Error banner if any */}
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Primary Action Button */}
              {!user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(225, 29, 72, 0.08)',
                      border: '1px solid rgba(225, 29, 72, 0.25)',
                      color: '#e11d48',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Lock size={15} />
                    <span>Please log in or register before completing payment.</span>
                  </div>

                  <Link
                    href={loginUrl}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.25rem',
                      fontSize: '0.9375rem',
                      fontWeight: 800,
                      background: '#e11d48',
                      borderColor: '#e11d48',
                      boxShadow: '0 8px 25px -4px rgba(225, 29, 72, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Lock size={18} />
                    <span>🔒 Log In or Register to Purchase (${currentPlan.price})</span>
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    fontSize: '0.9375rem',
                    fontWeight: 800,
                    background: '#e11d48',
                    borderColor: '#e11d48',
                    boxShadow: '0 8px 25px -4px rgba(225, 29, 72, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="spin-animation" />
                      <span>Connecting to UddoktaPay Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Pay ${currentPlan.price} via UddoktaPay (bKash/Nagad/Card)</span>
                    </>
                  )}
                </button>
              )}

              {/* Trust Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span>256-bit SSL Encrypted</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Zap size={14} color="#f59e0b" />
                  <span>Instant Account Activation</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media (max-width: 960px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.75rem !important;
          }
        }
        @media (max-width: 640px) {
          .customer-fields-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>Loading checkout gateway...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
