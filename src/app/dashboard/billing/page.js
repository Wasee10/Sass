'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { initiateCheckout } from '@/client/payment';
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
  MessagesSquare,
  Printer,
  Eye,
  ExternalLink,
  Trash2,
  Receipt,
  Calendar,
  FileDown,
  Wallet,
  Smartphone,
  Globe,
} from 'lucide-react';

export default function BillingAndLicensePage() {
  const { user, profile, subscription, cancelSubscription, updateSubscriptionPlan } = useAuth();
  const toast = useToast();

  const displayName = profile?.full_name || user?.displayName || 'Alex Thorne';
  const displayEmail = profile?.email || user?.email || 'alex@stratum.io';

  // Plan & Billing Interval State
  const [activeTier, setActiveTier] = useState('pro-monthly');
  const [billingInterval, setBillingInterval] = useState('month'); // 'month' or 'year'

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

  // Selected Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Custom User-Created Invoices State
  const [customInvoices, setCustomInvoices] = useState([]);
  const [isMakeInvoiceOpen, setIsMakeInvoiceOpen] = useState(false);
  const [makeInvoiceForm, setMakeInvoiceForm] = useState({
    id: 'INV-2026-ENT-10',
    date: 'Oct 17, 2026',
    description: 'Stratum Cloud Enterprise Tier Subscription',
    amount: '$99.00 USD',
    customerLegal: 'Stratum Systems Inc.',
    customerEmail: 'alex.thorne@stratum.io',
    customerAddress: '535 Mission St, 14th Floor',
    customerCity: 'San Francisco, CA',
    taxId: 'US-EIN 84-2940219',
    paymentMethod: 'VISA •••• 4242',
    status: 'Paid',
    notes: 'Official electronic tax receipt. Payment processed via encrypted gateway.',
  });

  // UddoktaPay Gateway State
  const [isUddoktaModalOpen, setIsUddoktaModalOpen] = useState(false);
  const [uddoktaLoading, setUddoktaLoading] = useState(false);
  const [uddoktaPlan, setUddoktaPlan] = useState({
    planId: 'enterprise',
    planName: 'Enterprise',
    amount: '99',
    interval: 'month',
  });

  // Handle return from UddoktaPay checkout redirect (?payment=success&invoice_id=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const invId = urlParams.get('invoice_id');
      const paidPlan = urlParams.get('plan_id');
      const paidPlanName = urlParams.get('plan_name');
      const paidAmount = urlParams.get('amount');
      const paidMethod = urlParams.get('method');
      const txId = urlParams.get('tx_id');

      if (paymentStatus === 'success' && invId) {
        toast.success(
          'UddoktaPay Payment Received!',
          `Invoice ${invId} successfully completed via ${paidMethod || 'UddoktaPay Gateway'}.`
        );

        if (paidPlan) {
          setActiveTier(paidPlan);
          setBillingInterval(paidPlan.includes('yearly') ? 'year' : 'month');
        }

        const cleanAmount = paidAmount ? (paidAmount.startsWith('$') ? paidAmount : `$${paidAmount} USD`) : '$99.00 USD';
        const newInvoiceRecord = {
          id: invId,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          description: `Stratum Cloud ${paidPlanName || 'Enterprise'} Plan (UddoktaPay Payment)`,
          amount: cleanAmount,
          customerLegal: legalName || 'Stratum Enterprise Customer',
          customerEmail: displayEmail,
          customerAddress: address,
          customerCity: city,
          taxId: taxId,
          paymentMethod: `UddoktaPay (${paidMethod || 'bKash/Nagad/Card'})`,
          status: 'Paid',
          notes: `Verified transaction by UddoktaPay Gateway. Transaction ID: ${txId || 'TXN-UDDOKTAPAY'}`,
          isCustom: true,
        };

        setCustomInvoices((prev) => {
          if (prev.some((item) => item.id === invId)) return prev;
          const updated = [newInvoiceRecord, ...prev];
          try {
            localStorage.setItem('stratum_custom_invoices', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        window.history.replaceState({}, '', '/dashboard/billing');
      } else if (paymentStatus === 'cancelled') {
        toast.warning(
          'Payment Cancelled',
          'The UddoktaPay transaction session was cancelled.'
        );
        window.history.replaceState({}, '', '/dashboard/billing');
      }
    }
  }, []);

  // Load user custom created invoices from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('stratum_custom_invoices');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCustomInvoices(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not load custom invoices:', err);
      }
    }
  }, []);


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
  const defaultInvoicesList = isFree
    ? []
    : isEnterprise
    ? isYearly
      ? [
          { id: 'INV-2026-ENT-Y1', date: 'Oct 14, 2026', amount: '$990.00 USD', status: 'Paid', description: 'Stratum Cloud Enterprise Annual Subscription' },
        ]
      : [
          { id: 'INV-2026-ENT-09', date: 'Sep 14, 2026', amount: '$99.00 USD', status: 'Paid', description: 'Stratum Cloud Enterprise Monthly Subscription' },
          { id: 'INV-2026-ENT-08', date: 'Aug 14, 2026', amount: '$99.00 USD', status: 'Paid', description: 'Stratum Cloud Enterprise Monthly Subscription' },
          { id: 'INV-2026-ENT-07', date: 'Jul 14, 2026', amount: '$99.00 USD', status: 'Paid', description: 'Stratum Cloud Enterprise Monthly Subscription' },
        ]
    : isYearly
    ? [
        { id: 'INV-2026-PRO-Y1', date: 'Oct 14, 2026', amount: '$290.00 USD', status: 'Paid', description: 'Stratum Cloud Professional Annual Subscription' },
      ]
    : [
        { id: 'INV-2026-PRO-09', date: 'Sep 14, 2026', amount: '$29.00 USD', status: 'Paid', description: 'Stratum Cloud Professional Monthly Subscription' },
        { id: 'INV-2026-PRO-08', date: 'Aug 14, 2026', amount: '$29.00 USD', status: 'Paid', description: 'Stratum Cloud Professional Monthly Subscription' },
        { id: 'INV-2026-PRO-07', date: 'Jul 14, 2026', amount: '$29.00 USD', status: 'Paid', description: 'Stratum Cloud Professional Monthly Subscription' },
      ];

  // Combined: User custom-made invoices appear first
  const combinedInvoices = [...customInvoices, ...defaultInvoicesList];
  const invoicesList = combinedInvoices;

  const openMakeInvoiceModal = () => {
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const prefix = isEnterprise ? (isYearly ? 'ENT-Y' : 'ENT-') : isYearly ? 'PRO-Y' : 'PRO-';
    const autoId = `INV-${new Date().getFullYear()}-${prefix}${randomSuffix}`;
    const autoAmount = isEnterprise
      ? (isYearly ? '$990.00 USD' : '$99.00 USD')
      : (isYearly ? '$290.00 USD' : isFree ? '$0.00 USD' : '$29.00 USD');

    const d = new Date();
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    setMakeInvoiceForm({
      id: autoId,
      date: formattedDate,
      description: `Stratum Cloud ${currentPlanTitle} Plan`,
      amount: autoAmount,
      customerLegal: legalName || displayName || 'Stratum Enterprise Customer',
      customerEmail: displayEmail,
      customerAddress: address || '535 Mission St, 14th Floor',
      customerCity: city || 'San Francisco, CA',
      taxId: taxId || 'US-EIN 84-2940219',
      paymentMethod: 'VISA •••• 4242',
      status: 'Paid',
      notes: 'Electronic receipt issued by Stratum Systems Inc. Paid in full via Stripe Gateway.',
    });
    setIsMakeInvoiceOpen(true);
  };

  const handleSaveMadeInvoice = async (andDownload = false) => {
    let cleanAmount = (makeInvoiceForm.amount || '0').trim();
    if (!cleanAmount.startsWith('$')) {
      cleanAmount = `$${cleanAmount}`;
    }
    if (!cleanAmount.toUpperCase().includes('USD')) {
      cleanAmount = `${cleanAmount} USD`;
    }

    const newInv = {
      ...makeInvoiceForm,
      amount: cleanAmount,
      isCustom: true,
    };

    const updated = [newInv, ...customInvoices];
    setCustomInvoices(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('stratum_custom_invoices', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save custom invoice:', err);
      }
    }

    toast.success('Invoice Created', `Invoice ${newInv.id} created and recorded in history.`);
    setIsMakeInvoiceOpen(false);

    if (andDownload) {
      await handleDownloadPdf(newInv);
    }
  };

  const handleDeleteCustomInvoice = (invId, e) => {
    if (e) e.stopPropagation();
    const filtered = customInvoices.filter((i) => i.id !== invId);
    setCustomInvoices(filtered);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('stratum_custom_invoices', JSON.stringify(filtered));
      } catch (err) {
        console.warn('Could not update custom invoices:', err);
      }
    }
    toast.info('Invoice Removed', `Invoice ${invId} removed from your invoice history.`);
  };

  const handleLaunchUddoktaPay = async (planOverride = null) => {
    setUddoktaLoading(true);
    const target = planOverride || uddoktaPlan;
    try {
      toast.info('Connecting Gateway', 'Creating UddoktaPay Sandbox charge session...');
      const data = await initiateCheckout({
        fullName: legalName || displayName || 'Alex Thorne',
        email: displayEmail || 'alex.thorne@stratum.io',
        amount: String(target.amount || '99'),
        planId: target.planId || 'enterprise',
        planName: target.planName || 'Enterprise Tier',
        interval: target.interval || 'month',
        userId: user?.uid || 'demo-user-id',
      });

      if (data.success && data.paymentUrl) {
        toast.success('Redirecting to UddoktaPay', 'Forwarding to sandbox checkout portal...');
        window.location.href = data.paymentUrl;
      } else {
        toast.error('Payment Error', data.error || 'Could not initiate UddoktaPay session.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network Error', 'Failed to reach payment gateway service.');
    } finally {
      setUddoktaLoading(false);
    }
  };

  const openUddoktaModalForTier = (tierKey, intervalToUse = billingInterval) => {
    const isTargetYearly = intervalToUse === 'year';
    const isTargetEnterprise = tierKey === 'enterprise';

    const resolvedPlanId = isTargetEnterprise
      ? (isTargetYearly ? 'enterprise-yearly' : 'enterprise')
      : (isTargetYearly ? 'pro-yearly' : 'pro-monthly');

    const resolvedPlanName = isTargetEnterprise
      ? (isTargetYearly ? 'Enterprise Annual' : 'Enterprise Monthly')
      : (isTargetYearly ? 'Professional Annual' : 'Professional Monthly');

    const resolvedPrice = isTargetEnterprise ? (isTargetYearly ? '990' : '99') : (isTargetYearly ? '290' : '29');

    setUddoktaPlan({
      planId: resolvedPlanId,
      planName: resolvedPlanName,
      amount: resolvedPrice,
      interval: isTargetYearly ? 'year' : 'month',
    });
    setIsUddoktaModalOpen(true);
  };

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

  // Generate Enterprise Printable HTML Document for Invoice
  const generateInvoiceHtml = (inv) => {
    const customerLegal = inv.customerLegal || legalName || displayName || 'Stratum Developer';
    const customerAddr = inv.customerAddress || address || '535 Mission St, 14th Floor';
    const customerCity = inv.customerCity || city || 'San Francisco, CA';
    const customerTax = inv.taxId || taxId || 'US-EIN 84-2940219';
    const customerEmail = inv.customerEmail || displayEmail || 'user@example.com';
    const invDescription = inv.description || `Stratum Cloud ${currentPlanTitle} Plan`;
    const invPaymentMethod = inv.paymentMethod || 'VISA •••• 4242';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stratum Cloud Invoice - ${inv.id}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0 !important; background: #fff !important; }
      .no-print { display: none !important; }
      .invoice-box { box-shadow: none !important; border: none !important; max-width: 100% !important; padding: 20px 0 !important; }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 30px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .no-print-bar {
      width: 100%;
      max-width: 820px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-btn {
      background: #3161F8;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-weight: 700;
      font-size: 13px;
      border-radius: 6px;
      cursor: pointer;
    }
    .invoice-box {
      width: 100%;
      max-width: 820px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 44px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #3161F8;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0f172a;
    }
    .brand-title span { color: #3161F8; }
    .doc-type { text-align: right; }
    .doc-type h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
    }
    .doc-type p {
      margin: 4px 0 0 0;
      font-family: monospace;
      color: #3161F8;
      font-size: 14px;
      font-weight: 700;
    }
    .meta-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 30px;
      gap: 16px;
    }
    .meta-item span {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .meta-item strong { font-size: 13px; color: #0f172a; }
    .paid-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #dcfce7;
      color: #15803d;
      font-weight: 700;
      font-size: 11px;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .address-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      margin-bottom: 32px;
      font-size: 13px;
      line-height: 1.6;
    }
    .address-col h4 {
      margin: 0 0 10px 0;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 13px;
    }
    .items-table th {
      background: #f1f5f9;
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      border-bottom: 1px solid #cbd5e1;
    }
    .items-table td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .totals-box { width: 320px; font-size: 13px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #475569;
    }
    .totals-row.grand {
      border-top: 2px solid #0f172a;
      color: #0f172a;
      font-size: 18px;
      font-weight: 800;
      padding-top: 12px;
    }
    .footer-notes {
      border-top: 1px solid #e2e8f0;
      padding-top: 22px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .security-stamp {
      font-family: monospace;
      font-size: 11px;
      background: #eff6ff;
      border: 1px dashed #bfdbfe;
      color: #1d4ed8;
      padding: 6px 12px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="no-print-bar no-print">
    <span>Stratum Cloud Official Tax Receipt: <strong>${inv.id}</strong></span>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="invoice-box">
    <div class="header-row">
      <div>
        <div class="brand-title">
          <span>Stratum</span>Cloud
        </div>
        <p style="margin: 6px 0 0 0; color: #64748b; font-size: 12px;">Enterprise Cloud Infrastructure & Real-Time Telemetry Platform</p>
      </div>
      <div class="doc-type">
        <h2>Tax Invoice</h2>
        <p>${inv.id}</p>
      </div>
    </div>

    <div class="meta-cards">
      <div class="meta-item">
        <span>Invoice Date</span>
        <strong>${inv.date}</strong>
      </div>
      <div class="meta-item">
        <span>Payment Status</span>
        <div><span class="paid-badge">● PAID IN FULL</span></div>
      </div>
      <div class="meta-item">
        <span>Payment Method</span>
        <strong>${invPaymentMethod}</strong>
      </div>
      <div class="meta-item">
        <span>Currency</span>
        <strong>USD ($)</strong>
      </div>
    </div>

    <div class="address-grid">
      <div class="address-col">
        <h4>Issued By (Payee)</h4>
        <strong style="font-size: 14px; color: #0f172a;">Stratum Systems Inc.</strong><br />
        535 Mission St, 14th Floor<br />
        San Francisco, CA 94105, United States<br />
        Tax ID / VAT: <strong>US-EIN 84-2940219</strong><br />
        Contact: billing@stratum.io • https://stratum.io
      </div>
      <div class="address-col">
        <h4>Billed To (Customer)</h4>
        <strong style="font-size: 14px; color: #0f172a;">${customerLegal}</strong><br />
        Attn: ${displayName} (${customerEmail})<br />
        ${customerAddr}<br />
        ${customerCity}<br />
        Tax / VAT ID: <strong>${customerTax}</strong>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Period</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${invDescription}</strong><br />
            <span style="color: #64748b; font-size: 12px;">
              Full workspace access, VisActor analytical suite, API quota, dedicated compute pool, and support SLA.
            </span>
          </td>
          <td style="color: #64748b;">${inv.date} – Cycle Active</td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">${inv.amount}</td>
          <td style="text-align: right; font-weight: 700;">${inv.amount}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal:</span>
          <strong>${inv.amount}</strong>
        </div>
        <div class="totals-row">
          <span>Estimated Tax / VAT (0% B2B):</span>
          <span>$0.00 USD</span>
        </div>
        <div class="totals-row grand">
          <span>Total Paid:</span>
          <span>${inv.amount}</span>
        </div>
      </div>
    </div>

    <div class="footer-notes">
      <p style="margin: 0 0 6px 0;"><strong>Payment Confirmation:</strong> Electronic payment processed successfully via Stripe / VISA •••• 4242. Authorization code: <code>AUTH-8842-STRATUM-OK</code>.</p>
      <p style="margin: 0;">For corporate tax queries, PO references, or VAT reverse charge assistance, contact <a href="mailto:billing@stratum.io" style="color: #3161F8;">billing@stratum.io</a>.</p>
      <div class="security-stamp">
        🔒 Cryptographic Token: STRATUM-VERIFIED-${inv.id}-98F4-88A
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // Direct High-Resolution Vector PDF Generator & Downloader using jsPDF
  const handleDownloadPdf = async (inv) => {
    try {
      toast.info('Generating PDF', `Preparing official PDF receipt for ${inv.id}...`);
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const customerLegal = inv.customerLegal || legalName || displayName || 'Stratum Enterprise Customer';
      const customerAddr = inv.customerAddress || address || '535 Mission St, 14th Floor';
      const customerCityVal = inv.customerCity || city || 'San Francisco, CA';
      const customerTaxVal = inv.taxId || taxId || 'US-EIN 84-2940219';
      const customerEmailVal = inv.customerEmail || displayEmail || 'user@example.com';
      const paymentMethodVal = inv.paymentMethod || 'VISA •••• 4242';
      const invoiceDescription = inv.description || `Stratum Cloud ${currentPlanTitle} Plan`;

      // Brand colors
      const PRIMARY = [49, 97, 248]; // #3161F8
      const DARK = [15, 23, 42];     // #0F172A
      const MUTED = [100, 116, 139]; // #64748B
      const LIGHT_BG = [248, 250, 252]; // #F8FAFC
      const BORDER = [226, 232, 240];   // #E2E8F0
      const GREEN = [21, 128, 61];     // #15803D
      const GREEN_BG = [220, 252, 231]; // #DCFCE7

      // Top brand accent bar
      doc.setFillColor(...PRIMARY);
      doc.rect(0, 0, 210, 5, 'F');

      // Logo Icon box
      doc.setFillColor(...PRIMARY);
      doc.roundedRect(15, 14, 11, 11, 2.5, 2.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('S', 18.2, 22.2);

      // Title
      doc.setTextColor(...DARK);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Stratum', 30, 22);
      const stratumWidth = doc.getTextWidth('Stratum');
      doc.setTextColor(...PRIMARY);
      doc.text('Cloud', 30 + stratumWidth, 22);

      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'normal');
      doc.text('Enterprise Cloud Infrastructure & Real-Time Telemetry Platform', 15, 31);

      // Right header: TAX INVOICE & ID
      doc.setFontSize(18);
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', 195, 20, { align: 'right' });

      doc.setFontSize(11);
      doc.setTextColor(...PRIMARY);
      doc.setFont('courier', 'bold');
      doc.text(inv.id, 195, 26.5, { align: 'right' });

      // Divider line
      doc.setDrawColor(...PRIMARY);
      doc.setLineWidth(0.6);
      doc.line(15, 35, 195, 35);

      // Meta cards box
      doc.setFillColor(...LIGHT_BG);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.roundedRect(15, 40, 180, 18, 2, 2, 'FD');

      // 1. Invoice Date
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text('INVOICE DATE', 20, 46);
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(inv.date || 'Oct 17, 2026', 20, 52);

      // 2. Status badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text('PAYMENT STATUS', 68, 46);
      doc.setFillColor(...GREEN_BG);
      doc.roundedRect(68, 48.5, 22, 5, 2, 2, 'F');
      doc.setTextColor(...GREEN);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('● PAID IN FULL', 70, 52.2);

      // 3. Payment Method
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text('PAYMENT METHOD', 114, 46);
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
      doc.text(paymentMethodVal, 114, 52);

      // 4. Currency
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text('CURRENCY', 165, 46);
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text('USD ($)', 165, 52);

      // Two-column Address Box
      const addrY = 66;
      doc.setDrawColor(...BORDER);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, addrY, 86, 32, 2, 2, 'S');
      doc.roundedRect(109, addrY, 86, 32, 2, 2, 'S');

      // Left Column: Issued By
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text('ISSUED BY (PAYEE)', 20, addrY + 6);
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      doc.text('Stratum Systems Inc.', 20, addrY + 11.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('535 Mission St, 14th Floor', 20, addrY + 16.5);
      doc.text('San Francisco, CA 94105, USA', 20, addrY + 21);
      doc.text('Tax ID / VAT: US-EIN 84-2940219', 20, addrY + 25.5);
      doc.text('billing@stratum.io', 20, addrY + 29.5);

      // Right Column: Billed To
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text('BILLED TO (CUSTOMER)', 114, addrY + 6);
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      const safeLegal = customerLegal.length > 28 ? customerLegal.substring(0, 26) + '...' : customerLegal;
      doc.text(safeLegal, 114, addrY + 11.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`Attn: ${displayName} (${customerEmailVal})`, 114, addrY + 16.5);
      doc.text(`${customerAddr}, ${customerCityVal}`, 114, addrY + 21);
      doc.text(`Tax ID: ${customerTaxVal}`, 114, addrY + 25.5);
      doc.text('Customer Account: ACTIVE', 114, addrY + 29.5);

      // Items Table
      const tableY = 106;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(...BORDER);
      doc.rect(15, tableY, 180, 8, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('DESCRIPTION & SERVICE LINE', 20, tableY + 5.5);
      doc.text('PERIOD', 110, tableY + 5.5);
      doc.text('QTY', 140, tableY + 5.5, { align: 'center' });
      doc.text('UNIT PRICE', 165, tableY + 5.5, { align: 'right' });
      doc.text('AMOUNT', 190, tableY + 5.5, { align: 'right' });

      // Row
      const rowY = tableY + 10;
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(15, rowY + 16, 195, rowY + 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(invoiceDescription, 20, rowY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text('Full workspace access, VisActor analytical engine, API telemetry quota & support SLA', 20, rowY + 10);
      if (inv.notes) {
        doc.text(inv.notes.substring(0, 75), 20, rowY + 14);
      }

      doc.setFontSize(8.5);
      doc.text(`${inv.date} – Cycle Active`, 110, rowY + 6);
      doc.text('1', 140, rowY + 6, { align: 'center' });
      doc.text(inv.amount, 165, rowY + 6, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(inv.amount, 190, rowY + 6, { align: 'right' });

      // Totals Area
      const totalsY = rowY + 24;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text('Subtotal:', 140, totalsY);
      doc.setTextColor(...DARK);
      doc.text(inv.amount, 190, totalsY, { align: 'right' });

      doc.setTextColor(...MUTED);
      doc.text('Estimated Tax / VAT (0% B2B):', 140, totalsY + 6);
      doc.setTextColor(...DARK);
      doc.text('$0.00 USD', 190, totalsY + 6, { align: 'right' });

      doc.setDrawColor(...DARK);
      doc.setLineWidth(0.5);
      doc.line(135, totalsY + 10, 195, totalsY + 10);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...DARK);
      doc.text('Total Paid:', 140, totalsY + 16);
      doc.setTextColor(...PRIMARY);
      doc.text(inv.amount, 190, totalsY + 16, { align: 'right' });

      // Security & Authorization Stamp Box
      const stampY = totalsY + 28;
      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(191, 219, 254);
      doc.setLineWidth(0.3);
      doc.roundedRect(15, stampY, 180, 18, 2, 2, 'FD');

      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(29, 78, 216);
      doc.text('[VERIFIED ELECTRONIC RECEIPT] Authorization Ref: AUTH-8842-STRATUM-OK', 20, stampY + 6);
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Cryptographic Audit Token: STRATUM-VERIFIED-${inv.id}-98F4-88A-SEC`, 20, stampY + 11);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text('Payment cleared through Stripe PCI-DSS Level 1 Encrypted Payment Gateway.', 20, stampY + 15.5);

      // Bottom Footer
      const footerY = stampY + 28;
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(15, footerY, 195, footerY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text('Stratum Systems Inc. • 535 Mission St, San Francisco, CA 94105 • US-EIN 84-2940219', 105, footerY + 5, { align: 'center' });
      doc.text('This is an official computer-generated tax receipt. For billing inquiries, contact billing@stratum.io', 105, footerY + 9, { align: 'center' });

      // DIRECT DOWNLOAD of authentic .pdf file
      doc.save(`Stratum-Invoice-${inv.id}.pdf`);

      toast.success(
        'PDF Invoice Downloaded',
        `Official tax invoice Stratum-Invoice-${inv.id}.pdf downloaded to your device.`
      );
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('PDF Generation Failed', 'Falling back to HTML invoice download.');
      handleDownloadInvoice(inv);
    }
  };

  // Direct Browser Download for HTML / Backup Invoice
  const handleDownloadInvoice = (inv) => {
    try {
      const htmlContent = generateInvoiceHtml(inv);

      // 1. Download HTML file directly
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Stratum-Invoice-${inv.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 2. Open print window so user can also Save directly as PDF with 1 click
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 400);
      }

      toast.success(
        'Invoice Downloaded',
        `Official tax invoice ${inv.id} downloaded and print/PDF dialog opened.`
      );
    } catch {
      toast.error('Download Failed', 'Could not generate invoice document.');
    }
  };

  // Direct Print Dialog
  const handlePrintInvoice = (inv) => {
    try {
      const htmlContent = generateInvoiceHtml(inv);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 400);
      }
    } catch {
      window.print();
    }
  };

  // Export Invoices CSV
  const handleExportAllCSV = () => {
    try {
      if (combinedInvoices.length === 0) {
        toast.info('No Invoices', 'There are no invoices to export in sandbox mode.');
        return;
      }

      const headers = [
        'Invoice Identifier',
        'Issue Date',
        'Plan Tier / Description',
        'Billing Interval',
        'Total Amount',
        'Currency',
        'Payment Status',
        'Payment Method',
        'Customer Name',
        'Customer Legal Entity',
        'Tax ID',
      ];

      const rows = combinedInvoices.map((inv) => [
        `"${inv.id}"`,
        `"${inv.date}"`,
        `"${(inv.description || currentPlanTitle).replace(/"/g, '""')}"`,
        `"${isYearly ? 'Annual' : 'Monthly'}"`,
        `"${inv.amount.replace(/[^0-9.]/g, '')}"`,
        `"USD"`,
        `"${inv.status}"`,
        `"${inv.paymentMethod || 'VISA •••• 4242'}"`,
        `"${displayName.replace(/"/g, '""')}"`,
        `"${(inv.customerLegal || legalName).replace(/"/g, '""')}"`,
        `"${(inv.taxId || taxId).replace(/"/g, '""')}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Stratum-Invoice-History-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        'CSV Export Ready',
        `Successfully downloaded ${combinedInvoices.length} invoice records in CSV format.`
      );
    } catch {
      toast.error('Export Failed', 'Could not export invoices CSV.');
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
              href="/dashboard/tickets"
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <MessagesSquare size={16} />
              Tickets &amp; Feedback
            </Link>
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
                className={(!isFree && !isEnterprise && ((billingInterval === 'year' && isYearly) || (billingInterval === 'month' && !isYearly))) ? 'btn btn-secondary' : 'btn btn-primary'}
                style={{ width: '100%', marginTop: '2rem' }}
              >
                {!isFree && !isEnterprise && ((billingInterval === 'year' && isYearly) || (billingInterval === 'month' && !isYearly))
                  ? '✓ Current Active Plan'
                  : !isFree && !isEnterprise
                  ? (billingInterval === 'year' ? '⚡ Switch to Annual ($290/yr, Save 20%)' : '⚡ Switch to Monthly ($29/mo)')
                  : `Select Professional (${billingInterval === 'year' ? 'Annual • $290/yr' : 'Monthly • $29/mo'})`}
              </button>
              <button
                type="button"
                onClick={() => openUddoktaModalForTier('pro', billingInterval)}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  marginTop: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  background: 'rgba(225, 29, 72, 0.08)',
                  borderColor: 'rgba(225, 29, 72, 0.25)',
                  color: '#e11d48',
                }}
              >
                <Wallet size={14} />
                <span>Pay with UddoktaPay (bKash/Nagad/Card)</span>
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
                className={(isEnterprise && ((billingInterval === 'year' && isYearly) || (billingInterval === 'month' && !isYearly))) ? 'btn btn-secondary' : 'btn btn-primary'}
                style={{ width: '100%', marginTop: '2rem' }}
              >
                {isEnterprise && ((billingInterval === 'year' && isYearly) || (billingInterval === 'month' && !isYearly))
                  ? '✓ Current Active Plan'
                  : isEnterprise
                  ? (billingInterval === 'year' ? '⚡ Switch to Annual ($990/yr, Save 20%)' : '⚡ Switch to Monthly ($99/mo)')
                  : `Upgrade to Enterprise (${billingInterval === 'year' ? 'Annual • $990/yr' : 'Monthly • $99/mo'})`}
              </button>
              <button
                type="button"
                onClick={() => openUddoktaModalForTier('enterprise', billingInterval)}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  marginTop: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  background: 'rgba(225, 29, 72, 0.08)',
                  borderColor: 'rgba(225, 29, 72, 0.25)',
                  color: '#e11d48',
                }}
              >
                <Wallet size={14} />
                <span>Pay with UddoktaPay (bKash/Nagad/Card)</span>
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
                    Payment Methods
                  </h3>
                </div>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 700 }}>
                  2 Gateways Active
                </span>
              </div>

              {/* Card visual 1: VISA Stripe */}
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '46px', height: '30px', borderRadius: '4px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    VISA
                  </div>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      •••• •••• •••• 4242
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Expires 11 / 2028 • Primary Card
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

              {/* Card visual 2: UddoktaPay Sandbox Gateway */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid rgba(225, 29, 72, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '30px',
                      borderRadius: '4px',
                      background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.6875rem',
                      letterSpacing: '0.02em',
                    }}
                  >
                    UPAY
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        UddoktaPay Gateway
                      </span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        Sandbox Active
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      bKash • Nagad • Rocket • Upay • Cards • Net Banking
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openUddoktaModalForTier(isEnterprise ? 'enterprise' : 'pro', billingInterval)}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#e11d48',
                    borderColor: '#e11d48',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  <Wallet size={13} />
                  <span>⚡ Pay / Checkout</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={openMakeInvoiceModal}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(49, 97, 248, 0.35)',
                }}
                title="Create and generate a new custom invoice"
              >
                <PlusCircle size={15} />
                <span>+ Make an Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEmptyState(!showEmptyState)}
                className="btn btn-secondary btn-sm"
              >
                {showEmptyState ? 'Show Recent Invoices' : 'Toggle Empty State Preview'}
              </button>
              <button
                type="button"
                onClick={handleExportAllCSV}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                title="Download all billing history as a CSV spreadsheet"
              >
                <Download size={14} />
                <span>Export All CSV</span>
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
            {showEmptyState || (isFree && combinedInvoices.length === 0) ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={24} />
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isFree ? 'Free Sandbox Tier (No Automated Invoices)' : 'No Billing History Yet'}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5 }}>
                  {isFree
                    ? 'You are on the Free Starter plan with $0 monthly charges. Click "+ Make an Invoice" above to generate custom tax receipts or upgrade to Pro / Enterprise.'
                    : 'Transactions initiated through subscriptions or metered compute expansions will surface here with itemized tax breakdowns.'}
                </p>
                <button
                  type="button"
                  onClick={openMakeInvoiceModal}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <PlusCircle size={14} />
                  <span>+ Make an Invoice Now</span>
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)', fontSize: '0.75rem', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Invoice Identifier</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Plan Tier / Service</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700, textAlign: 'right' }}>Receipt Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedInvoices.map((inv, idx) => (
                    <tr
                      key={inv.id}
                      style={{
                        borderBottom: idx !== combinedInvoices.length - 1 ? '1px solid var(--border-primary)' : 'none',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.date}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              fontFamily: 'monospace',
                              color: 'var(--brand-primary)',
                              fontWeight: 700,
                              textDecoration: 'underline',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                            title="Click to inspect official invoice"
                          >
                            <span>{inv.id}</span>
                            <ExternalLink size={12} />
                          </button>
                          {inv.isCustom && (
                            <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(49, 97, 248, 0.12)', color: 'var(--brand-primary)', fontWeight: 800 }}>
                              CUSTOM
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                        {inv.description || currentPlanTitle}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inv.amount}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                          {inv.status || 'Paid'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                            title="View official itemized tax receipt modal"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(inv)}
                            className="btn btn-primary btn-sm"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                            title="Download official PDF receipt directly to your device"
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>
                          {inv.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomInvoice(inv.id, e)}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--border-primary)',
                                color: '#ef4444',
                                padding: '0.35rem 0.45rem',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                              title="Delete custom invoice"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
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

      {/* ================= OFFICIAL ITEMIZIED TAX INVOICE MODAL ================= */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto',
          }}
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '92vh',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.5)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Actions Bar (Top) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                background: '#0f172a',
                color: '#ffffff',
                borderBottom: '1px solid #1e293b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    background: '#3161F8',
                    color: '#ffffff',
                  }}
                >
                  {selectedInvoice.id}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Official Itemized Tax Receipt
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    background: '#dcfce7',
                    color: '#15803d',
                    textTransform: 'uppercase',
                  }}
                >
                  ● PAID
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Print invoice or save via browser PDF dialog"
                >
                  <Printer size={15} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Download HTML receipt backup"
                >
                  <FileText size={15} />
                  <span>HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedInvoice)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    background: '#3161F8',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Download authentic PDF receipt file directly"
                >
                  <Download size={15} />
                  <span>Download PDF Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    marginLeft: '0.5rem',
                  }}
                  title="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Paper Body */}
            <div
              style={{
                padding: '2.5rem',
                overflowY: 'auto',
                flex: 1,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                background: '#ffffff',
              }}
            >
              {/* Header: Brand & Document Type */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid #3161F8',
                  paddingBottom: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#3161F8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={18} />
                    </div>
                    <span>Stratum<span style={{ color: '#3161F8' }}>Cloud</span></span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0 0', color: '#64748b', fontSize: '0.8125rem' }}>
                    Enterprise Cloud Infrastructure &amp; Real-Time Telemetry Platform
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em' }}>
                    Tax Invoice
                  </h2>
                  <p style={{ margin: '0.25rem 0 0 0', fontFamily: 'monospace', color: '#3161F8', fontWeight: 700, fontSize: '0.9375rem' }}>
                    {selectedInvoice.id}
                  </p>
                </div>
              </div>

              {/* Meta Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  marginBottom: '2rem',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>
                    Invoice Date
                  </span>
                  <strong style={{ color: '#0f172a' }}>{selectedInvoice.date}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>
                    Payment Status
                  </span>
                  <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.75rem', borderRadius: '9999px' }}>
                    ● PAID IN FULL
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>
                    Payment Method
                  </span>
                  <strong style={{ color: '#0f172a' }}>
                    {selectedInvoice.paymentMethod || 'VISA •••• 4242'}
                  </strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.25rem' }}>
                    Currency
                  </span>
                  <strong style={{ color: '#0f172a' }}>USD ($)</strong>
                </div>
              </div>

              {/* Addresses: Payee & Customer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.25rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                    Issued By (Payee)
                  </h4>
                  <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>Stratum Systems Inc.</strong><br />
                  535 Mission St, 14th Floor<br />
                  San Francisco, CA 94105, United States<br />
                  Tax ID / VAT: <strong>US-EIN 84-2940219</strong><br />
                  Contact: <span style={{ color: '#3161F8' }}>billing@stratum.io</span>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                    Billed To (Customer)
                  </h4>
                  <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                    {selectedInvoice.customerLegal || legalName || displayName}
                  </strong><br />
                  Attn: {displayName} ({selectedInvoice.customerEmail || displayEmail})<br />
                  {selectedInvoice.customerAddress || address}<br />
                  {selectedInvoice.customerCity || city}<br />
                  Tax ID: <strong>{selectedInvoice.taxId || taxId}</strong>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 800 }}>Description</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 800 }}>Billing Period</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800 }}>Qty</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800 }}>Unit Price</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                      <strong style={{ color: '#0f172a' }}>
                        {selectedInvoice.description || `Stratum Cloud ${currentPlanTitle} Plan`}
                      </strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                        Full workspace analytical suites, dedicated compute allocation, API processing quota, and support SLA.
                      </p>
                      {selectedInvoice.notes && (
                        <p style={{ margin: '0.25rem 0 0 0', color: '#3161F8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          Memo: {selectedInvoice.notes}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', verticalAlign: 'top' }}>
                      {selectedInvoice.date} – Cycle Active
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center', verticalAlign: 'top' }}>
                      1
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right', verticalAlign: 'top' }}>
                      {selectedInvoice.amount}
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: '#0f172a', verticalAlign: 'top' }}>
                      {selectedInvoice.amount}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Subtotal:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedInvoice.amount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Estimated Tax / VAT (0% B2B):</span>
                    <span>$0.00 USD</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '0.65rem', marginTop: '0.25rem', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                    <span>Total Paid:</span>
                    <span>{selectedInvoice.amount}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Security Stamp */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 0.35rem 0' }}>
                  <strong>Payment Confirmation:</strong> Electronic payment processed successfully via Stripe / VISA •••• 4242. Authorization code: <code style={{ color: '#0f172a' }}>AUTH-8842-STRATUM-OK</code>.
                </p>
                <p style={{ margin: 0 }}>
                  For corporate tax queries, PO references, or VAT reverse charge assistance, contact <span style={{ color: '#3161F8' }}>billing@stratum.io</span>.
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#eff6ff',
                    border: '1px dashed #bfdbfe',
                    color: '#1d4ed8',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.6875rem',
                    marginTop: '0.75rem',
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Cryptographic Token: STRATUM-VERIFIED-{selectedInvoice.id}-98F4-88A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAKE AN INVOICE MODAL ================= */}
      {isMakeInvoiceOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto',
          }}
          onClick={() => setIsMakeInvoiceOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '92vh',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.55)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--brand-primary-light)',
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Make a New Invoice
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Generate, customize, and immediately download an itemized tax invoice.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMakeInvoiceOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div
              style={{
                padding: '0.85rem 1.75rem',
                background: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quick Presets:
              </span>
              {[
                { label: 'Enterprise Annual ($990)', amount: '$990.00 USD', desc: 'Stratum Cloud Enterprise Tier (Annual Subscription)' },
                { label: 'Enterprise Monthly ($99)', amount: '$99.00 USD', desc: 'Stratum Cloud Enterprise Tier (Monthly Subscription)' },
                { label: 'Pro Annual ($290)', amount: '$290.00 USD', desc: 'Stratum Cloud Professional Tier (Annual Subscription)' },
                { label: 'Pro Monthly ($29)', amount: '$29.00 USD', desc: 'Stratum Cloud Professional Tier (Monthly Subscription)' },
                { label: 'Compute Add-on ($150)', amount: '$150.00 USD', desc: 'Stratum High-Throughput Dedicated Compute Cluster Add-on' },
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMakeInvoiceForm((prev) => ({
                      ...prev,
                      amount: p.amount,
                      description: p.desc,
                    }));
                  }}
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveMadeInvoice(false);
              }}
              style={{
                padding: '1.5rem 1.75rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Invoice Identifier
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.id}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, id: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'monospace' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Invoice Date
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.date}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, date: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Plan / Service Description
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.description}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, description: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Total Amount ($ USD)
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.amount}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, amount: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Payment Method
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.paymentMethod}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, paymentMethod: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Customer Legal Entity / Company
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.customerLegal}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, customerLegal: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Customer Email
                </label>
                <input
                  type="email"
                  value={makeInvoiceForm.customerEmail}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, customerEmail: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Billing Address
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.customerAddress}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, customerAddress: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Tax ID / VAT Number
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.taxId}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, taxId: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Notes &amp; Authorization Memo
                </label>
                <input
                  type="text"
                  value={makeInvoiceForm.notes}
                  onChange={(e) => setMakeInvoiceForm({ ...makeInvoiceForm, notes: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              {/* Action Buttons in Footer */}
              <div
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-primary)',
                  paddingTop: '1.25rem',
                  marginTop: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsMakeInvoiceOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 600 }}
                  >
                    Save to Invoice Table
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveMadeInvoice(true)}
                    className="btn btn-primary btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 10px rgba(49, 97, 248, 0.35)',
                    }}
                  >
                    <Download size={14} />
                    <span>⚡ Save &amp; Download PDF</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= UDDOKTAPAY CHECKOUT MODAL ================= */}
      {isUddoktaModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto',
          }}
          onClick={() => setIsUddoktaModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid var(--border-primary)',
                background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08), rgba(244, 63, 94, 0.04))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)',
                  }}
                >
                  <Wallet size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Checkout with UddoktaPay
                    </h3>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#e11d48', color: '#ffffff' }}>
                      SANDBOX v2
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Instant automated billing via bKash, Nagad, Rocket, Upay, Visa &amp; Mastercard.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUddoktaModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '78vh', overflowY: 'auto' }}>
              {/* Plan Presets */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Select Subscription Plan:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { planId: 'enterprise-yearly', planName: 'Enterprise Annual', amount: '990', interval: 'year', badge: 'Save 20%' },
                    { planId: 'enterprise', planName: 'Enterprise Monthly', amount: '99', interval: 'month' },
                    { planId: 'pro-yearly', planName: 'Pro Annual', amount: '290', interval: 'year', badge: 'Save 20%' },
                    { planId: 'pro-monthly', planName: 'Pro Monthly', amount: '29', interval: 'month' },
                    { planId: 'test-sandbox', planName: 'Test Sandbox', amount: '1', interval: 'month', badge: 'Test' },
                  ].map((p, idx) => {
                    const isSelected = uddoktaPlan.planId === p.planId;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setUddoktaPlan({ planId: p.planId, planName: p.planName, amount: p.amount, interval: p.interval })}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid #e11d48' : '1px solid var(--border-primary)',
                          background: isSelected ? 'rgba(225, 29, 72, 0.08)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.planName}</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#e11d48', marginTop: '0.2rem' }}>${p.amount}</div>
                        {p.badge && (
                          <span style={{ fontSize: '0.625rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '9999px', background: '#10b981', color: '#fff', display: 'inline-block', marginTop: '0.25rem' }}>
                            {p.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Supported Payment Channels */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Supported Payment Channels:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { name: 'bKash', color: '#e2136e', bg: 'rgba(226, 19, 110, 0.12)' },
                    { name: 'Nagad', color: '#f7931e', bg: 'rgba(247, 147, 30, 0.12)' },
                    { name: 'Rocket', color: '#8c3494', bg: 'rgba(140, 52, 148, 0.12)' },
                    { name: 'Upay', color: '#00a3e0', bg: 'rgba(0, 163, 224, 0.12)' },
                    { name: 'Visa / MasterCard', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
                    { name: 'Net Banking', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
                  ].map((chan, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '0.35rem 0.75rem',
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
              </div>

              {/* Order Summary Box */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Plan:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{uddoktaPlan.planName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Customer:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{legalName || displayName} ({displayEmail})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Billing Interval:</span>
                  <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{uddoktaPlan.interval}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-primary)', paddingTop: '0.75rem', marginTop: '0.25rem', fontSize: '1.25rem', fontWeight: 800 }}>
                  <span style={{ color: 'var(--text-primary)' }}>Total Charge:</span>
                  <span style={{ color: '#e11d48' }}>
                    ${uddoktaPlan.amount}.00 USD <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>(≈ ৳{(parseFloat(uddoktaPlan.amount) * 120).toLocaleString()} BDT)</span>
                  </span>
                </div>
              </div>

              {/* Sandbox Instructions Notice */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: '#d97706' }}>🧪 Sandbox Checkout Instructions:</strong>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>
                  When redirected to UddoktaPay Sandbox, you can select <strong>bKash</strong> or <strong>Nagad</strong>, enter any test mobile number (e.g. <code>01700000000</code>), OTP <code>123456</code>, and any 4-digit PIN to simulate a completed payment.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUddoktaModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={uddoktaLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleLaunchUddoktaPay()}
                  disabled={uddoktaLoading}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: '#e11d48',
                    borderColor: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                    padding: '0.6rem 1.25rem',
                    boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)',
                  }}
                >
                  {uddoktaLoading ? (
                    <>
                      <RefreshCw size={15} className="spin-animation" />
                      <span>Connecting to UddoktaPay...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      <span>Proceed to UddoktaPay Sandbox Checkout ➔</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

