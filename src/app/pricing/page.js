import Navbar from '@/components/marketing/Navbar';
import PricingSection from '@/components/marketing/PricingSection';
import FaqSection from '@/components/marketing/FaqSection';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Pricing Plans & Subscriptions | SaaS Core',
  description: 'Explore flexible monthly and yearly subscription plans with full feature comparisons.',
};

export default function PricingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '2rem' }}>
        <PricingSection showComparisonDefault={true} />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
