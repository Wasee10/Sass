import Navbar from '@/components/marketing/Navbar';
import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import Roadmap from '@/components/marketing/Roadmap';
import Benefits from '@/components/marketing/Benefits';
import PricingSection from '@/components/marketing/PricingSection';
import FaqSection from '@/components/marketing/FaqSection';
import Footer from '@/components/marketing/Footer';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <Features />
        <Roadmap />
        <Benefits />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
