'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';
import { verifyInvoice } from '@/client/payment';
import { saveChosenPackage, saveCustomInvoice } from '@/client/services';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Download,
  Receipt,
  RefreshCw,
  Home,
  Check,
  Zap,
} from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = searchParams.get('invoice_id');

  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!invoiceId) {
      setError('No invoice ID was provided in the return URL.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Call backend API to verify payment & persist to PostgreSQL
    const verifyTransaction = async () => {
      try {
        const result = await verifyInvoice(invoiceId);

        if (!isMounted) return;

        if (result.success && result.data) {
          setVerificationData(result.data);

          const metadata = result.data.metadata || {};
          const planId = metadata.planId || metadata.plan_id || 'pro-monthly';
          const planName = metadata.planName || metadata.plan_name || 'Professional';
          const interval = metadata.billingInterval || metadata.billing_interval || 'month';

          saveChosenPackage({
            id: planId,
            planId: planId,
            name: planName,
            price: parseFloat(result.data.amount) || 29,
            interval: interval,
            billingInterval: interval,
          });

          saveCustomInvoice({
            id: invoiceId,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            description: `Stratum Cloud ${planName} Plan (UddoktaPay Payment)`,
            amount: `$${result.data.amount} USD`,
            customerLegal: result.data.full_name || 'Stratum Customer',
            customerEmail: result.data.email || 'customer@stratum.io',
            customerAddress: '535 Mission St, 14th Floor',
            customerCity: 'San Francisco, CA',
            taxId: 'US-EIN 84-2940219',
            paymentMethod: `UddoktaPay (${result.data.payment_method || 'bKash/Nagad'})`,
            status: 'Paid',
            notes: `Verified transaction by UddoktaPay Gateway. Transaction ID: ${result.data.transaction_id || 'TXN-UDDOKTAPAY'}`,
            isCustom: true,
          });
        } else {
          setError(result.error || 'Payment verification could not be completed.');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Network error verifying payment with backend service.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, padding: '4rem 1.5rem', maxWidth: '720px' }}>
        <Card style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
          {loading ? (
            <div style={{ padding: '3rem 1rem' }}>
              <RefreshCw size={44} className="spin-animation" style={{ color: 'var(--brand-primary)', margin: '0 auto 1.5rem auto' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Verifying Your Payment...
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '420px', margin: '0 auto' }}>
                Contacting UddoktaPay to confirm invoice <code>{invoiceId}</code> and provision your subscription.
              </p>
            </div>
          ) : error ? (
            <div style={{ padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <AlertCircle size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Verification Issue
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                {error}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/checkout" className="btn btn-secondary btn-sm">
                  Back to Checkout
                </Link>
                <Link href="/dashboard/billing" className="btn btn-primary btn-sm">
                  View Billing Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Green Success Badge */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
                }}
              >
                <CheckCircle2 size={40} />
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#10b981',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  display: 'inline-block',
                  marginBottom: '0.75rem',
                }}
              >
                PAYMENT CONFIRMED
              </span>

              <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Thank You for Your Order!
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto 2rem auto' }}>
                Your payment was received and verified. Your Stratum subscription is now active with immediate access.
              </p>

              {/* Receipt Details Box */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-primary)',
                  padding: '1.5rem',
                  textAlign: 'left',
                  marginBottom: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.65rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Invoice Number:</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{verificationData?.invoice_id}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.65rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Plan Subscribed:</span>
                  <strong style={{ color: 'var(--brand-primary)' }}>
                    {verificationData?.metadata?.planName || verificationData?.metadata?.plan_name || 'Professional Tier'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.65rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {verificationData?.payment_method || 'bKash'} (Mobile Wallet)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.65rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {verificationData?.transaction_id || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: '0.65rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Sender Account:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {verificationData?.sender_number || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem', fontSize: '1.125rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Amount Paid:</strong>
                  <strong style={{ color: '#10b981' }}>
                    ${verificationData?.amount} USD <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>(৳{Math.round(parseFloat(verificationData?.amount || 0) * 120).toLocaleString()} BDT)</span>
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  href="/dashboard/billing"
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                    padding: '0.75rem 1.5rem',
                  }}
                >
                  <span>Go to Billing Dashboard</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/dashboard"
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                    padding: '0.75rem 1.5rem',
                  }}
                >
                  <Home size={16} />
                  <span>Main Dashboard</span>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>Loading payment confirmation...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
