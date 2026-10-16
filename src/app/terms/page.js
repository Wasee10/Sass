import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing the use of the platform.',
};

export default function TermsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Terms of Service</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            Effective date: October 16, 2026
          </p>

          <Card style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <p style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--text-primary)' }}>
              This is a launch template, not legal advice. Replace the operator, governing-law, and contact placeholders and obtain legal review before publishing.
            </p>
            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                1. Using the service
              </h2>
              <p>
                By using the service, you agree to these terms. You must provide accurate account information, protect your credentials, and use the service only as permitted by applicable law. Do not attempt to disrupt, probe, or gain unauthorized access to the service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                2. Subscriptions & Billing
              </h2>
              <p>
                Plan names and prices shown in this starter are examples only. No payment provider is connected, so checkout, paid subscriptions, and cancellation are not available and no payment is taken. Update these terms before enabling paid services.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                3. Account termination
              </h2>
              <p>
                You can request permanent account removal from account settings. We may suspend or terminate access if necessary to protect the service, comply with law, or address a material violation of these terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                4. Service availability and warranty
              </h2>
              <p>
                The service is provided on an “as available” basis. Features may change as this starter is developed. To the extent allowed by law, the operator disclaims implied warranties and is not responsible for indirect or consequential loss. Final wording requires jurisdiction-specific review.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                5. Operator and governing law
              </h2>
              <p>
                Replace this section with your organization’s legal name, notice address, governing law, and dispute process before launch. Contact: <a href="mailto:legal@yourdomain.com" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>legal@yourdomain.com</a>.
              </p>
            </section>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
