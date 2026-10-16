'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PLANS } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/client';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import {
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function BillingPage() {
  const { user, subscription, isConfigured, cancelSubscription, updateSubscriptionPlan } = useAuth();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Too expensive');
  const [successMessage, setSuccessMessage] = useState(null);
  const [operationError, setOperationError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoiceOwnerId, setInvoiceOwnerId] = useState(null);
  const [invoiceError, setInvoiceError] = useState(null);

  // Upgrade modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    if (!isConfigured || !userId) return undefined;
    let active = true;
    const supabase = createClient();

    const loadInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, amount, currency, status, pdf_url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!active) return;
      if (error) {
        console.error('Error fetching billing history:', error);
        setInvoiceError('Billing history could not be loaded.');
      } else {
        setInvoices(data || []);
        setInvoiceError(null);
      }
      setInvoiceOwnerId(userId);
    };

    loadInvoices();
    return () => {
      active = false;
    };
  }, [isConfigured, userId]);

  const planId = subscription?.plan_id || 'free';
  const isCanceled = subscription?.cancel_at_period_end || subscription?.status === 'canceled';

  const currentPlan = PLANS.find(p => p.id === planId) ||
    PLANS.find(p => planId.startsWith('pro')) ||
    PLANS[0];

  const planDisplayName = planId === 'pro-yearly'
    ? 'Professional (Annual)'
    : planId === 'pro-monthly'
    ? 'Professional (Monthly)'
    : 'Free Starter';

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never';
  const currentUserInvoices = invoiceOwnerId === userId && userId ? invoices : [];
  const currentInvoiceError = invoiceOwnerId === userId && userId ? invoiceError : null;

  const handleCancel = async () => {
    setCanceling(true);
    setOperationError(null);
    try {
      const result = await cancelSubscription();
      if (result?.error) {
        setOperationError(result.error.message);
        return;
      }
      setCancelModalOpen(false);
      setSuccessMessage('Your subscription has been scheduled for cancellation at the end of the billing cycle.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setOperationError('Cancellation could not be completed. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  const handlePlanSwitch = async (newPlanId, interval = 'month') => {
    setUpdatingPlan(true);
    setOperationError(null);
    try {
      const result = await updateSubscriptionPlan(newPlanId, interval);
      if (result?.error) {
        setOperationError(result.error.message);
        return;
      }
      setPlanModalOpen(false);
      setSuccessMessage(`Your plan has been updated to ${newPlanId.toUpperCase()}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setOperationError('Your plan could not be changed. Please try again.');
    } finally {
      setUpdatingPlan(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Subscription & Billing
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Manage your subscription plan, payment methods, and billing transaction history.
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}
      {operationError && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{operationError}</span>
        </div>
      )}
      <div className="alert alert-info" role="status">
        <AlertCircle size={18} />
        <span>Payments are not configured. Plan changes, checkout, and cancellation are unavailable until a payment provider is connected.</span>
      </div>

      {/* Current Plan Overview Card */}
      <Card style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{planDisplayName}</h2>
              <Badge variant={isCanceled ? 'warning' : subscription?.status === 'past_due' ? 'danger' : 'success'}>
                {isCanceled ? 'Canceled (Active Grace Period)' : subscription?.status || 'Active'}
              </Badge>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              {currentPlan.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {planId === 'free' ? '$0' : planId === 'pro-yearly' ? '$290 / yr' : '$29 / mo'}
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {planId === 'free' ? 'No renewal necessary' : `Next renewal: ${renewalDate}`}
            </span>
          </div>
        </div>

        {isCanceled && (
          <div className="alert alert-warning animate-fade-in" style={{ marginBottom: '1.5rem' }}>
            <AlertTriangle size={18} />
            <span>
              Your subscription is canceled and will not renew. You maintain full access to features until <strong>{renewalDate}</strong>.
            </span>
          </div>
        )}

        <hr style={{ borderColor: 'var(--border-primary)', marginBottom: '1.5rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <ShieldCheck size={18} color="var(--brand-primary)" />
            <span>Secure server-side verification and billing gateway ready</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isCanceled && planId !== 'free' && (
              <Button variant="danger" size="sm" disabled={!isConfigured} onClick={() => setCancelModalOpen(true)}>
                Cancel Subscription
              </Button>
            )}

            <Button variant="primary" size="sm" onClick={() => setPlanModalOpen(true)}>
              <span>{planId === 'free' ? 'Upgrade Plan' : 'Change Subscription Plan'}</span>
              <ArrowUpRight size={15} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Method Card */}
      <Card style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <CardTitle style={{ marginBottom: '0.25rem' }}>Payment Method</CardTitle>
            <CardDescription>
              Payment methods are managed by your payment provider. No payment provider is connected yet.
            </CardDescription>
          </div>

          <span className="btn btn-secondary btn-sm" aria-disabled="true" style={{ cursor: 'not-allowed', opacity: 0.6 }}>
            Checkout unavailable
          </span>
        </div>
      </Card>

      {/* Billing History / Invoices */}
      <Card style={{ padding: '2rem' }}>
        <CardTitle style={{ marginBottom: '0.35rem' }}>Billing History & Receipts</CardTitle>
        <CardDescription style={{ marginBottom: '1.5rem' }}>
          Download itemized statements and invoice receipts for accounting and taxes.
        </CardDescription>

        <div style={{ overflowX: 'auto' }}>
          {invoiceOwnerId !== userId && isConfigured && userId ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading billing history…</p>
          ) : currentInvoiceError ? (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={18} />
              <span>{currentInvoiceError}</span>
            </div>
          ) : currentUserInvoices.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No invoices are available.</p>
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Invoice #</th>
                <th style={{ padding: '0.75rem 1rem' }}>Plan / Description</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {currentUserInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {inv.invoice_number}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    Subscription
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: inv.currency || 'USD',
                    }).format(Number(inv.amount))}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Badge variant={inv.status === 'paid' ? 'success' : 'neutral'}>{inv.status}</Badge>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {inv.pdf_url ? (
                      <a href={inv.pdf_url} className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">
                        Receipt
                      </a>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </Card>

      {/* Plan Switch Modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Select Subscription Tier"
        description="Choose the tier that matches your team volume requirements."
        maxWidth="680px"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
          {/* Free Tier option */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderColor: planId === 'free' ? 'var(--brand-primary)' : 'var(--border-primary)',
            }}
          >
            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>Free Starter</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>$0</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Essential access for individual builders.
            </p>
            <Button
              variant={planId === 'free' ? 'secondary' : 'outline'}
              size="sm"
              fullWidth
              disabled={planId === 'free' || !isConfigured}
              onClick={() => handlePlanSwitch('free', 'month')}
              loading={updatingPlan}
            >
              {planId === 'free' ? 'Current Plan' : isConfigured ? 'Downgrade to Free' : 'Unavailable'}
            </Button>
          </div>

          {/* Pro Monthly option */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderColor: planId === 'pro-monthly' ? 'var(--brand-primary)' : 'var(--border-primary)',
            }}
          >
            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>Pro Monthly</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>$29 <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>/mo</span></div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Full power with flexible monthly billing.
            </p>
            <Button
              variant={planId === 'pro-monthly' ? 'secondary' : 'primary'}
              size="sm"
              fullWidth
              disabled={planId === 'pro-monthly' || !isConfigured}
              onClick={() => handlePlanSwitch('pro-monthly', 'month')}
              loading={updatingPlan}
            >
              {planId === 'pro-monthly' ? 'Current Plan' : isConfigured ? 'Select Monthly' : 'Unavailable'}
            </Button>
          </div>

          {/* Pro Yearly option */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderColor: planId === 'pro-yearly' ? 'var(--brand-primary)' : 'var(--border-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Pro Yearly</h4>
              <Badge variant="brand" style={{ fontSize: '0.65rem' }}>Save 17%</Badge>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>$290 <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>/yr</span></div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Best value: 2 full months free.
            </p>
            <Button
              variant={planId === 'pro-yearly' ? 'secondary' : 'primary'}
              size="sm"
              fullWidth
              disabled={planId === 'pro-yearly' || !isConfigured}
              onClick={() => handlePlanSwitch('pro-yearly', 'year')}
              loading={updatingPlan}
            >
              {planId === 'pro-yearly' ? 'Current Plan' : isConfigured ? 'Select Yearly' : 'Unavailable'}
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setPlanModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Cancel Subscription Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Your Subscription?"
        description="We're sorry to see you go. Please let us know why you are canceling."
      >
        <div style={{ margin: '1.25rem 0' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Reason for cancellation:
          </label>
          <select
            className="form-input"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          >
            <option>Too expensive</option>
            <option>Missing features I need</option>
            <option>Project completed</option>
            <option>Switching to another platform</option>
            <option>Other</option>
          </select>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.85rem', lineHeight: 1.5 }}>
            Note: Your access will remain active until the end of your billing cycle on <strong>{renewalDate}</strong>. You will not be billed again.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
            Keep Subscription
          </Button>
          <Button variant="danger" loading={canceling} disabled={!isConfigured} onClick={handleCancel}>
            Confirm Cancellation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
