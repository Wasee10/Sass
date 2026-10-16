'use client';

import { useState } from 'react';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Send,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const DOC_TOPICS = [
  {
    icon: BookOpen,
    title: 'Getting Started Guide',
    description: 'Learn how to configure your workspace, invite team members, and navigate the platform.',
    link: '#',
  },
  {
    icon: ShieldCheck,
    title: 'Authentication & Security',
    description: 'Understand Supabase Auth integration, session persistence, and Row Level Security.',
    link: '#',
  },
  {
    icon: MessageSquare,
    title: 'Billing & Subscriptions FAQ',
    description: 'Answers regarding upgrade cycles, prorated billing, and tax invoice generation.',
    link: '#',
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Inquiry');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setTicketLoading(true);
    setTimeout(() => {
      setTicketLoading(false);
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketMessage('');
      setTimeout(() => setTicketSuccess(false), 5000);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Help & Support
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Explore knowledge base guides or submit a support ticket to our engineering team.
        </p>
      </div>

      {/* Search Header */}
      <Card style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          How can we assist you today?
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Search guides, technical documentation, and common resolution paths.
        </p>

        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <Input
            id="kb-search"
            icon={Search}
            placeholder="Search documentation, guides, or billing queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Recommended Documentation Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {DOC_TOPICS.map((topic, idx) => {
          const Icon = topic.icon;
          return (
            <Card key={idx} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--brand-primary-light)',
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <Icon size={20} />
                </div>
                <CardTitle style={{ fontSize: '1.0625rem', marginBottom: '0.35rem' }}>
                  {topic.title}
                </CardTitle>
                <CardDescription style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                  {topic.description}
                </CardDescription>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <span
                  style={{
                    color: 'var(--brand-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  Read Documentation
                  <ExternalLink size={13} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Support Ticket Submission Form */}
      <Card style={{ padding: '2rem' }}>
        <CardTitle style={{ marginBottom: '0.35rem' }}>Submit a Support Ticket</CardTitle>
        <CardDescription style={{ marginBottom: '1.5rem' }}>
          Our engineering support team monitors inquiries around the clock.
        </CardDescription>

        {ticketSuccess && (
          <div className="alert alert-success animate-fade-in">
            <CheckCircle2 size={18} />
            <span>Support ticket submitted! Ticket reference #TK-84920 has been opened.</span>
          </div>
        )}

        <form onSubmit={handleTicketSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Ticket Subject"
              id="ticket-subject"
              placeholder="e.g. Issue connecting PostgreSQL webhook"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
            />

            <div className="form-group">
              <label htmlFor="ticket-category" className="form-label">
                Category
              </label>
              <select
                id="ticket-category"
                className="form-input"
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
              >
                <option>General Inquiry</option>
                <option>Billing & Subscriptions</option>
                <option>Authentication & Accounts</option>
                <option>API & Integration</option>
                <option>Bug Report</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ticket-details" className="form-label">
              Detailed Description <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="ticket-details"
              required
              rows={4}
              placeholder="Describe what occurred, any error codes received, and steps to reproduce..."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button
              type="submit"
              variant="primary"
              loading={ticketLoading}
              icon={Send}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
