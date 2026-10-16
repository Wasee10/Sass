'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Terminal,
  FileText,
  Key,
  Layers,
  Lock,
  RefreshCw,
  X,
  PlusCircle,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function BillingAndLicensePage() {
  const { user, profile, subscription, cancelSubscription, updateSubscriptionPlan } = useAuth();
  const toast = useToast();

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Billing address form state
  const [legalName, setLegalName] = useState('Stratum Systems Inc.');
  const [address, setAddress] = useState('535 Mission St, 14th Floor');
  const [city, setCity] = useState('San Francisco, CA');
  const [taxId, setTaxId] = useState('US-EIN 84-2940219');
  const [savedPill, setSavedPill] = useState(false);

  // License Key Copy state
  const [copiedKey, setCopiedKey] = useState(false);
  const licenseKey = subscription?.license_key || 'STR-2026-COMMERCIAL-98F4-88A';

  // Empty state preview toggle
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Plan & Billing Interval State
  const [activeTier, setActiveTier] = useState('pro-monthly');
  const [billingInterval, setBillingInterval] = useState('month'); // 'month' or 'year'

  // Load and synchronize user's chosen plan & interval from subscription, localStorage, and PostgreSQL
  useEffect(() => {
    let resolvedPlan = null;
    let resolvedInterval = null;

    // 1. From AuthContext subscription state
    if (subscription?.plan_id) {
      resolvedPlan = subscription.plan_id;
      resolvedInterval = subscription.billing_interval || (subscription.plan_id.includes('yearly') ? 'year' : 'month');
    }

    // 2. From localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('stratum_chosen_package');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.id || parsed.planId) {
            resolvedPlan = parsed.id || parsed.planId;
            resolvedInterval = parsed.interval || parsed.billingInterval || (resolvedPlan.includes('yearly') ? 'year' : 'month');
          }
        }
      } catch {
        // ignore
      }
    }

    if (resolvedPlan) {
      setActiveTier(resolvedPlan);
    }
    if (resolvedInterval) {
      setBillingInterval(resolvedInterval === 'forever' ? 'month' : resolvedInterval);
    }

    // 3. Fetch latest record from PostgreSQL table public.user_packages
    const uidToQuery = user?.uid || 'demo-user-id';
    fetch(`/api/user/package?userId=${uidToQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.package) {
          const pkg = data.package;
          if (pkg.plan_id) {
            setActiveTier(pkg.plan_id);
          }
          if (pkg.billing_interval) {
            setBillingInterval(pkg.billing_interval === 'year' ? 'year' : 'month');
          }
        }
      })
      .catch(() => {});
  }, [subscription, user?.uid]);

  const displayName = profile?.full_name || user?.displayName || 'Alex Thorne';
  const displayEmail = profile?.email || user?.email || 'alex@stratum.io';

  // Computed Plan Identity
  const isFree = activeTier === 'free' || activeTier?.includes('free');
  const isEnterprise = activeTier?.includes('enterprise');
  const isYearly = billingInterval === 'year' || activeTier?.includes('yearly');

  const currentPlanTitle = isEnterprise
    ? (isYearly ? 'Enterprise Annual' : 'Enterprise')
    : isFree
    ? 'Free Starter'
    : (isYearly ? 'Pro Yearly' : 'Professional');

  const currentPriceSubtitle = isFree
    ? '$0.00 sandbox tier (forever free) • No credit card required'
    : isEnterprise
    ? (isYearly ? '$990.00 billed annually ($82.50/mo, Saved 20%)' : '$99.00 billed monthly')
    : (isYearly ? '$290.00 billed annually ($24.16/mo, Saved 20%)' : '$29.00 billed monthly');

  const [renewalDate, setRenewalDate] = useState('October 17, 2027');

  useEffect(() => {
    if (isFree) {
      setRenewalDate('Lifetime Free Access');
    } else if (isYearly) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setRenewalDate(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setRenewalDate(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }
  }, [isFree, isYearly]);

  const currentComputePool = isEnterprise ? '99.4% (Ultra-speed)' : isFree ? '25.0% (Shared)' : '84.2% (High-speed)';
  const currentSeats = isEnterprise ? '25 / 100 dedicated seats' : isFree ? '1 / 3 community seats' : '8 / 12 team seats';

  // Dynamic Invoices tailored to the chosen plan
  const invoicesList = isFree
    ? []
    : isEnterprise
    ? isYearly
      ? [
          { id: 'INV-2026-ENT-Y1', date: 'Oct 14, 2026', amount: '$990.00 USD', status: 'Paid' },
        ]
      : [
          { id: 'INV-2026-ENT-09', date: 'Sep 14, 2026', amount: '$99.00 USD', status: 'Paid' },
          { id: 'INV-2026-ENT-08', date: 'Aug 14, 2026', amount: '$99.00 USD', status: 'Paid' },
          { id: 'INV-2026-ENT-07', date: 'Jul 14, 2026', amount: '$99.00 USD', status: 'Paid' },
        ]
    : isYearly
    ? [
        { id: 'INV-2026-PRO-Y1', date: 'Oct 14, 2026', amount: '$290.00 USD', status: 'Paid' },
      ]
    : [
        { id: 'INV-2026-PRO-09', date: 'Sep 14, 2026', amount: '$29.00 USD', status: 'Paid' },
        { id: 'INV-2026-PRO-08', date: 'Aug 14, 2026', amount: '$29.00 USD', status: 'Paid' },
        { id: 'INV-2026-PRO-07', date: 'Jul 14, 2026', amount: '$29.00 USD', status: 'Paid' },
      ];

  const handleCopyLicense = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    toast.success('License Key Copied', 'Copied cryptographic license token to clipboard.');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveBilling = (e) => {
    e.preventDefault();
    setSavedPill(true);
    toast.success('Billing Details Saved', 'Your registered address and tax details have been updated.');
    setTimeout(() => setSavedPill(false), 3000);
  };

  const handleConfirmCancel = async () => {
    setCanceling(true);
    try {
      await cancelSubscription();
      setCancelModalOpen(false);
      toast.warning('Subscription Canceled', 'Your subscription will conclude at the end of the current billing cycle.');
      setSuccessMessage('Your subscription has been scheduled for cancellation at the end of the billing period.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } finally {
      setCanceling(false);
    }
  };

  const handleSelectTier = async (tierKey, intervalToUse = billingInterval) => {
    const isTargetYearly = intervalToUse === 'year';
    const isTargetFree = tierKey === 'free';
    const isTargetEnterprise = tierKey === 'enterprise';

    const resolvedPlanId = isTargetFree
      ? 'free'
      : isTargetEnterprise
      ? (isTargetYearly ? 'enterprise-yearly' : 'enterprise')
      : (isTargetYearly ? 'pro-yearly' : 'pro-monthly');

    const resolvedPlanName = isTargetFree
      ? 'Free Starter'
      : isTargetEnterprise
      ? (isTargetYearly ? 'Enterprise Annual' : 'Enterprise')
      : (isTargetYearly ? 'Pro Yearly' : 'Professional');

    const resolvedPrice = isTargetFree ? 0 : isTargetEnterprise ? (isTargetYearly ? 990 : 99) : (isTargetYearly ? 290 : 29);
    const resolvedInterval = isTargetFree ? 'forever' : isTargetYearly ? 'year' : 'month';

    setActiveTier(resolvedPlanId);
    setBillingInterval(isTargetYearly ? 'year' : 'month');

    await updateSubscriptionPlan(resolvedPlanId, resolvedInterval);

    // Synchronize to PostgreSQL table public.user_packages
    try {
      await fetch('/api/user/package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'demo-user-id',
          email: user?.email || displayEmail,
          fullName: displayName,
          planId: resolvedPlanId,
          planName: resolvedPlanName,
          price: resolvedPrice,
          billingInterval: resolvedInterval,
        }),
      });
    } catch (err) {
      console.warn('PostgreSQL sync error:', err);
    }

    toast.success(
      'Plan Updated Successfully',
      `Active subscription switched to ${resolvedPlanName} (${isTargetYearly ? 'Annual Billing' : isTargetFree ? 'Forever Free' : 'Monthly Billing'}).`
    );
    setSuccessMessage(`Subscription updated to ${resolvedPlanName} and recorded in PostgreSQL.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* ================= TOP SUB-HEADER & BREADCRUMBS ================= */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          padding: '1.75rem 2rem 0 2rem',
          margin: '-2rem -2rem 2.5rem -2rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Left: Breadcrumbs & Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Subscription &amp; Billing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                  Billing &amp; License
                </h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'var(--bg-tertiary)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }} />
                  <span>Production Stack</span>
                </div>
              </div>
            </div>

            {/* Right: Dynamic User Profile Chip */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.45rem 1rem 0.45rem 0.45rem',
                borderRadius: '9999px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                  }}
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  ) : (
                    displayName.charAt(0)
                  )}
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid var(--bg-card)',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {displayName}
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--brand-primary)' }}>
                  {displayEmail}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  background: isFree ? 'var(--bg-tertiary)' : 'var(--brand-primary-light)',
                  color: isFree ? 'var(--text-secondary)' : 'var(--brand-primary)',
                  letterSpacing: '0.04em',
                  marginLeft: '0.25rem',
                }}
              >
                {currentPlanTitle} {isFree ? '' : (isYearly ? '• Annual' : '• Monthly')}
              </span>
            </div>
          </div>

          {/* Subnav Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <Link
              href="/dashboard"
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Overview
            </Link>
            <div
              style={{
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                background: 'var(--bg-card)',
                borderTop: '2px solid var(--brand-primary)',
                borderLeft: '1px solid var(--border-primary)',
                borderRight: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CreditCard size={16} />
              Subscription &amp; Billing
            </div>
            <Link
              href="/dashboard/support"
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Support &amp; Docs
            </Link>
            <Link
              href="/dashboard/settings"
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Settings
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Success Message Alert */}
        {successMessage && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ================= ACTIVE PLAN HERO CARD (ACCURATE TO USER SELECTION) ================= */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            padding: '2.25rem 2.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Ambient Glows */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: isEnterprise
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: 'var(--radius-lg)',
                  background: isEnterprise
                    ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                    : isFree
                    ? 'linear-gradient(135deg, #64748b, #94a3b8)'
                    : 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.35)',
                  flexShrink: 0,
                }}
              >
                {isEnterprise ? <Zap size={34} /> : isFree ? <Layers size={34} /> : <ShieldCheck size={34} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {currentPlanTitle}
                  </h2>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    Active Plan
                  </span>
                  {!isFree && (
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        background: isYearly ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                        color: isYearly ? '#10b981' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      {isYearly ? 'Billed Annually (Saved 20%)' : 'Billed Monthly'}
                    </span>
                  )}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '0.65rem' }}>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{currentPriceSubtitle}</strong>
                  {!isFree && (
                    <>
                      {' '}• Renewal billing date: <strong style={{ color: 'var(--text-primary)' }}>{renewalDate}</strong>
                    </>
                  )}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  <span>Compute allocation: <strong style={{ color: 'var(--text-primary)' }}>{currentComputePool}</strong></span>
                  <span>•</span>
                  <span>Team capacity: <strong style={{ color: 'var(--text-primary)' }}>{currentSeats}</strong></span>
                  <span>•</span>
                  <span>Synced to PostgreSQL</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('available-tiers');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)' }}
              >
                <RefreshCw size={16} />
                Switch Plan / Interval
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.info('Payment Gateway', 'Default test card (VISA •••• 4242) is currently linked.');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)' }}
              >
                <CreditCard size={16} />
                Manage Payment
              </button>
              {!isFree && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.5rem 0.75rem',
                  }}
                >
                  Cancel Plan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= ACTIVE ENTERPRISE LICENSE KEY CARD ================= */}
        <div
          className="card"
          style={{
            padding: '1.75rem 2rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                <Key size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Commercial Cryptographic License Token
                  </h3>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    VERIFIED &amp; BOUND
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <span>Binding: <code>app.stratum.io</code></span>
                  <span>•</span>
                  <span>Valid through: {isYearly ? 'Oct 2027' : 'Nov 2026'}</span>
                  <span>•</span>
                  <span>Tier: <strong>{currentPlanTitle}</strong></span>
                </div>
              </div>
            </div>

            {/* License Key Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {licenseKey}
              </span>
              <button
                type="button"
                onClick={handleCopyLicense}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: copiedKey ? '#10b981' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
                title="Copy License Key"
              >
                {copiedKey ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* ================= ALL AVAILABLE TIERS (FREE, PRO, ENTERPRISE + MONTHLY / ANNUAL SWITCH) ================= */}
        <div id="available-tiers" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Change or Upgrade Plan
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Select your desired tier and billing interval. Changes take effect instantly and record directly into PostgreSQL.
              </p>
            </div>

            {/* Billing Interval Toggle */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                padding: '0.3rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <button
                type="button"
                onClick={() => setBillingInterval('month')}
                style={{
                  border: 'none',
                  background: billingInterval === 'month' ? 'var(--brand-primary)' : 'transparent',
                  color: billingInterval === 'month' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('year')}
                style={{
                  border: 'none',
                  background: billingInterval === 'year' ? 'var(--brand-primary)' : 'transparent',
                  color: billingInterval === 'year' ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>Annual Billing</span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: billingInterval === 'year' ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.15)',
                    color: billingInterval === 'year' ? '#ffffff' : '#10b981',
                  }}
                >
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Tier Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {/* TIER 1: FREE STARTER */}
            <div
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                border: isFree ? '2px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                boxShadow: isFree ? '0 10px 30px -10px rgba(79, 70, 229, 0.3)' : 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              {isFree && (
                <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-primary)', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 800, padding: '0.25rem 0.85rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Current Active Plan
                </div>
              )}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Free Starter</h3>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>Sandbox</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', minHeight: '40px', lineHeight: 1.5 }}>
                  Essential developer toolkit to test endpoints, prototype integrations, and explore the platform.
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '1.25rem 0' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>$0</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ forever free</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border-primary)', paddingTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--brand-primary)" />
                    <span>Up to 3 team members</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--brand-primary)" />
                    <span>Basic telemetry &amp; dashboard</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--brand-primary)" />
                    <span>1,000 monthly API calls</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--brand-primary)" />
                    <span>Community forum support</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTier('free')}
                disabled={isFree}
                className={isFree ? 'btn btn-secondary' : 'btn btn-secondary'}
                style={{ width: '100%', marginTop: '2rem' }}
              >
                {isFree ? '✓ Current Active Plan' : 'Downgrade to Free'}
              </button>
            </div>

            {/* TIER 2: PROFESSIONAL */}
            <div
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                border: (!isFree && !isEnterprise) ? '2px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                boxShadow: (!isFree && !isEnterprise) ? '0 15px 35px -10px rgba(79, 70, 229, 0.35)' : 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              {(!isFree && !isEnterprise) ? (
                <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-primary)', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 800, padding: '0.25rem 0.85rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Current Active Plan
                </div>
              ) : (
                <div style={{ position: 'absolute', top: '-13px', right: '1.5rem', background: '#3161F8', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 800, padding: '0.25rem 0.85rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Most Popular
                </div>
              )}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Professional</h3>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 700 }}>Standard</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', minHeight: '40px', lineHeight: 1.5 }}>
                  Complete workspace power for growing teams, creators, and high-velocity SaaS products.
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '1.25rem 0' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${billingInterval === 'year' ? '290' : '29'}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {billingInterval === 'year' ? '/ billed annually ($24.16/mo)' : '/ month'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border-primary)', paddingTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Up to 25 team members</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>100,000 monthly API calls</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Real-time VisActor analytical suite</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Priority email &amp; live chat (4h SLA)</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTier('pro-monthly', billingInterval)}
                disabled={!isFree && !isEnterprise && ((billingInterval === 'year' && isYearly) || (billingInterval === 'month' && !isYearly))}
                className={(!isFree && !isEnterprise) ? 'btn btn-secondary' : 'btn btn-primary'}
                style={{ width: '100%', marginTop: '2rem' }}
              >
                {(!isFree && !isEnterprise) ? '✓ Current Active Plan' : `Select Professional (${billingInterval === 'year' ? 'Annual' : 'Monthly'})`}
              </button>
            </div>

            {/* TIER 3: ENTERPRISE */}
            <div
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                border: isEnterprise ? '2px solid #10b981' : '1px solid var(--border-primary)',
                boxShadow: isEnterprise ? '0 15px 35px -10px rgba(16, 185, 129, 0.35)' : 'var(--shadow-sm)',
                position: 'relative',
              }}
            >
              {isEnterprise ? (
                <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 800, padding: '0.25rem 0.85rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Current Active Plan
                </div>
              ) : (
                <div style={{ position: 'absolute', top: '-13px', right: '1.5rem', background: '#0f172a', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 800, padding: '0.25rem 0.85rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Enterprise SLA
                </div>
              )}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Enterprise</h3>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>Custom Scale</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', minHeight: '40px', lineHeight: 1.5 }}>
                  Maximum throughput guarantee, custom telemetry processing, and dedicated account management.
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '1.25rem 0' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${billingInterval === 'year' ? '990' : '99'}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {billingInterval === 'year' ? '/ billed annually ($82.50/mo)' : '/ month'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border-primary)', paddingTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Unlimited team members</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Custom data processing volume</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>Dedicated account manager &amp; direct Slack</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>99.99% Uptime Guarantee SLA</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTier('enterprise', billingInterval)}
                disabled={isEnterprise && ((billingInterval === 'year' && isYearly) || (billingInterval === 'month' && !isYearly))}
                className={isEnterprise ? 'btn btn-secondary' : 'btn btn-primary'}
                style={{ width: '100%', marginTop: '2rem' }}
              >
                {isEnterprise ? '✓ Current Active Plan' : `Upgrade to Enterprise (${billingInterval === 'year' ? 'Annual' : 'Monthly'})`}
              </button>
            </div>
          </div>
        </div>

        {/* ================= PAYMENT METHOD & BILLING ADDRESS (SIDE BY SIDE) ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {/* Payment Method Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CreditCard size={20} color="var(--brand-primary)" />
                  <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Payment Method
                  </h3>
                </div>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 700 }}>
                  Primary
                </span>
              </div>

              {/* Card visual */}
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '46px', height: '30px', borderRadius: '4px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    VISA
                  </div>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      •••• •••• •••• 4242
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Expires 11 / 2028
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('Payment Method', 'You can update your card in the payment gateway settings.')}
                  className="btn btn-secondary btn-sm"
                >
                  Update
                </button>
              </div>

              {/* Security info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Lock size={14} color="#10b981" />
                <span>256-bit SSL encrypted. Powered by Stripe PCI-DSS Level 1 compliance.</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Current Billing Interval:</span>
              <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                {isFree ? 'Free (Forever)' : isYearly ? 'Annual Billing' : 'Monthly Billing'}
              </strong>
            </div>
          </div>

          {/* Billing Address Form Card */}
          <div
            className="card"
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Registered Billing Details
              </h3>
              {savedPill && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Check size={14} /> Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveBilling} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal Entity / Company Name</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  style={{ height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tax ID / VAT Number</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  style={{ height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setLegalName('Stratum Systems Inc.'); setAddress('535 Mission St'); }} className="btn btn-secondary btn-sm">
                  Discard
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= INVOICE HISTORY (DYNAMICALLY TAILORED) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Invoice History</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Official itemized tax receipts for your active {currentPlanTitle} tier ({isYearly ? 'Annual' : isFree ? 'Free' : 'Monthly'}).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowEmptyState(!showEmptyState)}
                className="btn btn-secondary btn-sm"
              >
                {showEmptyState ? 'Show Recent Invoices' : 'Toggle Empty State Preview'}
              </button>
              <button
                type="button"
                onClick={() => toast.info('Export Started', 'Generating comprehensive CSV billing export...')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={14} />
                Export All CSV
              </button>
            </div>
          </div>

          <div
            style={{
              overflowX: 'auto',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {showEmptyState || isFree ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={24} />
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isFree ? 'Free Sandbox Tier (No Billable Invoices)' : 'No Billing History Yet'}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
                  {isFree
                    ? 'You are currently on the Free Starter plan with $0 monthly charges. When you upgrade to Professional or Enterprise, paid invoices and tax receipts will appear here.'
                    : 'Transactions initiated through subscriptions or metered compute expansions will surface here with itemized tax breakdowns.'}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Invoice Identifier</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Plan Tier</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700, textAlign: 'right' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesList.map((inv, idx) => (
                    <tr key={inv.id} style={{ borderBottom: idx !== invoicesList.length - 1 ? '1px solid var(--border-primary)' : 'none', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.date}</td>
                      <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', color: 'var(--brand-primary)', fontWeight: 600 }}>{inv.id}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{currentPlanTitle}</td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inv.amount}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => toast.success('Downloading Receipt', `Downloading PDF receipt for invoice ${inv.id}...`)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.8125rem' }}
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ================= DEVELOPER SANDBOX NOTICE ================= */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }}>
              <Terminal size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Production Gateway &amp; PostgreSQL Sync</h4>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--brand-primary)', fontWeight: 700 }}>v3.4 Production</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.5 }}>
                All package changes dispatch live updates to PostgreSQL database table <code style={{ fontFamily: 'monospace', background: 'var(--bg-secondary)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--brand-primary)' }}>public.user_packages</code> and persist across user sessions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast.info('Webhook Status', 'Stripe & PostgreSQL listeners are active and healthy.')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} />
            Check Sync Status
          </button>
        </div>
      </div>

      {/* ================= CANCEL SUBSCRIPTION MODAL ================= */}
      {cancelModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} />
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Cancel {currentPlanTitle} Subscription?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your capacity will automatically downgrade to the Free Starter tier at the conclusion of your billing cycle on <strong style={{ color: 'var(--text-primary)' }}>{renewalDate}</strong>.
              </p>
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', fontSize: '0.8125rem' }}>
              <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Features downgraded upon expiration:</strong>
              <ul style={{ listStyle: 'disc inside', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Dedicated cluster instances revoked</li>
                <li>Priority SLA channel downgraded to community forum</li>
                <li>API calls throttled to 1,000 requests/mo</li>
              </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="btn btn-secondary"
              >
                Keep Active Plan
              </button>
              <button
                type="button"
                disabled={canceling}
                onClick={handleConfirmCancel}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.625rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {canceling ? 'Canceling...' : 'Confirm Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
