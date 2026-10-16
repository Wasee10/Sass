'use client';

import { useState } from 'react';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Get in Touch</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              Have questions regarding enterprise tiers, integrations, or custom setups? We are here to help.
            </p>
          </div>

          <Card style={{ padding: '2.5rem' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--success-bg)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <CardTitle style={{ marginBottom: '0.5rem' }}>Message Received</CardTitle>
                <CardDescription style={{ marginBottom: '1.5rem' }}>
                  Thank you for reaching out! Our team has received your inquiry and will respond to {formData.email} within 24 business hours.
                </CardDescription>
                <Button variant="secondary" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Input
                  label="Your Full Name"
                  id="contact-name"
                  placeholder="e.g. Sarah Connor"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Work Email Address"
                  id="contact-email"
                  type="email"
                  icon={Mail}
                  placeholder="you@company.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Subject"
                  id="contact-subject"
                  placeholder="Inquiry about Enterprise plan or custom integration"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">
                    Message Details <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    placeholder="Tell us about your team size, workflow requirements, or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  icon={Send}
                  style={{ marginTop: '1rem' }}
                >
                  Send Inquiry
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
