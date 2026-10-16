import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Our privacy policy and data governance practices.',
};

export default function PrivacyPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            Last updated: October 16, 2026
          </p>

          <Card style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <p style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--text-primary)' }}>
              This is a launch template, not legal advice. Replace the contact details and verify this policy against your actual data practices and applicable law before publishing.
            </p>
            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                1. Information and purposes
              </h2>
              <p>
                The service processes information you provide, such as your name, email address, and workspace details, to create and operate your account, provide support, and protect the service. Supabase Auth handles authentication credentials. Configure your hosting and database providers to document any operational logs or telemetry they retain.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                2. Payments
              </h2>
              <p>
                No payment provider is connected in this build. Checkout does not collect card details and no payment is processed. If a provider is connected later, update this policy to identify the provider, data shared, and applicable retention practices.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                3. Cookies and storage
              </h2>
              <p>
                Essential Supabase session cookies support sign-in and session security. A first-party cookie remembers that this notice was dismissed. This starter does not include advertising or analytics cookies.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                4. Data security and retention
              </h2>
              <p>
                Database access is protected with Supabase Row Level Security policies. Account data is retained while the account is active and deleted when the account is removed, subject to backups or other legal retention requirements set by the service operator and its providers.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                5. Your choices and contact
              </h2>
              <p>
                You can update profile details or request account deletion in account settings. For privacy questions or requests, contact <a href="mailto:privacy@yourdomain.com" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>privacy@yourdomain.com</a> after replacing it with an address operated by your organization.
              </p>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
