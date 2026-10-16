export const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    description: 'Essential toolkit to kick off your projects and explore the foundation.',
    priceMonthly: 0,
    priceYearly: 0,
    badge: null,
    highlight: false,
    cta: 'Get Started Free',
    href: '/register',
    features: [
      'Up to 3 team members',
      'Basic dashboard analytics',
      '1,000 monthly API calls',
      'Community forum support',
      'Standard 48h response time',
      'Standard SSL security',
    ],
    notIncluded: [
      'Advanced role-based permissions',
      'Custom domain support',
      'Priority 24/7 dedicated support',
      'Unlimited export & audit logs',
    ],
  },
  {
    id: 'pro-monthly',
    yearlyId: 'pro-yearly',
    name: 'Professional',
    description: 'Complete workspace power for growing teams, creators, and scale-ups.',
    priceMonthly: 29,
    priceYearly: 290, // $24.16/mo, saves 2 months
    badge: 'Most Popular',
    highlight: true,
    cta: 'Preview Checkout',
    href: '/checkout?plan=pro',
    features: [
      'Up to 25 team members',
      'Comprehensive real-time analytics',
      '100,000 monthly API calls',
      'Priority email & live chat support',
      'Fast 4h response time SLA',
      'Advanced role-based permissions',
      'Custom domains & branding',
      'Automated daily backups',
    ],
    notIncluded: [
      'Dedicated account manager',
      'Custom enterprise SLAs',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Maximum security, custom volume, and bespoke integration for large teams.',
    priceMonthly: 99,
    priceYearly: 990,
    badge: 'Enterprise',
    highlight: false,
    cta: 'Contact Sales',
    href: '/contact',
    features: [
      'Unlimited team members',
      'Custom data processing volume',
      'Dedicated account manager',
      '99.99% uptime guarantee SLA',
      'Single Sign-On (SAML & SSO)',
      'Custom contract & invoicing',
      'SOC2 & HIPAA compliance assistance',
      'Quarterly security audits',
    ],
    notIncluded: [],
  },
];

export const COMPARISON_FEATURES = [
  {
    category: 'Core Platform',
    items: [
      { name: 'Team Members', free: '3 users', pro: '25 users', enterprise: 'Unlimited' },
      { name: 'Projects / Workspaces', free: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Data Storage', free: '500 MB', pro: '50 GB', enterprise: 'Custom' },
      { name: 'API Rate Limits', free: '60 req/min', pro: '600 req/min', enterprise: 'Custom SLA' },
    ],
  },
  {
    category: 'Security & Access',
    items: [
      { name: 'Two-Factor Authentication', free: true, pro: true, enterprise: true },
      { name: 'Role-Based Access Control', free: false, pro: true, enterprise: true },
      { name: 'SAML / SSO Authentication', free: false, pro: false, enterprise: true },
      { name: 'Audit Logs & Activity History', free: '7 days', pro: '90 days', enterprise: 'Unlimited' },
    ],
  },
  {
    category: 'Support & SLAs',
    items: [
      { name: 'Community Support', free: true, pro: true, enterprise: true },
      { name: 'Priority Chat & Email', free: false, pro: true, enterprise: true },
      { name: 'Dedicated Account Manager', free: false, pro: false, enterprise: true },
      { name: 'Guaranteed SLA Uptime', free: 'Best effort', pro: '99.9%', enterprise: '99.99%' },
    ],
  },
];

export const FAQS = [
  {
    question: 'How do subscriptions and billing work?',
    answer: 'Billing is not configured in this starter. Monthly and annual prices are examples only, and no subscription changes or payments can be made yet.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Cancellation is unavailable until a payment provider is connected. No paid subscription is created by this starter.',
  },
  {
    question: 'Can I subscribe to a paid plan?',
    answer: 'Not yet. The checkout page is a placeholder, does not collect card information, and cannot create paid subscriptions.',
  },
  {
    question: 'How secure is user authentication and payment data?',
    answer: 'Authentication uses Supabase and database access is protected by Row Level Security. No payment provider is connected and this app does not collect card information.',
  },
  {
    question: 'Can I change my team or account details later?',
    answer: 'Absolutely. You can update your profile name, email, company credentials, security settings, and notification preferences anytime inside the user dashboard.',
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer: 'We will notify you before any limits are reached. Your services will continue uninterrupted, and our billing interface will guide you through smooth tier adjustments.',
  },
];

export const DEMO_USER = {
  id: 'demo-user-12345',
  email: 'alex.demo@example.com',
  user_metadata: {
    full_name: 'Alex Johnson',
    company_name: 'Acme Technologies',
    avatar_url: null,
  },
  subscription: {
    plan_id: 'free',
    plan_name: 'Free Starter',
    status: 'active',
    billing_interval: 'month',
    current_period_end: null,
    cancel_at_period_end: false,
  },
};
