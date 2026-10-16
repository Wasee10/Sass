'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  MessagesSquare,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Send,
  Star,
  ThumbsUp,
  X,
  FileText,
  User,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  HelpCircle,
  Tag,
  Paperclip,
} from 'lucide-react';

const INITIAL_TICKETS = [
  {
    id: 'TICK-8492',
    subject: 'Billing renewal cycle and automatic invoice dispatch',
    category: 'Billing & Invoicing',
    priority: 'Normal',
    status: 'In Progress',
    createdAt: 'Today at 09:14 AM',
    updatedAt: '20 mins ago',
    assignedTo: {
      name: 'Sarah Jenkins',
      role: 'Billing Specialist',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
    },
    messages: [
      {
        sender: 'user',
        author: 'Alex Thorne',
        time: 'Today at 09:14 AM',
        content: 'Hi Support, I noticed our subscription was updated. Could you confirm whether the upcoming invoice will reflect our tax ID US-EIN 84-2940219 and send automated receipts to billing@stratum.io?',
      },
      {
        sender: 'agent',
        author: 'Sarah Jenkins (Stratum Billing)',
        time: 'Today at 09:32 AM',
        content: 'Hello Alex! Yes, absolutely. Your registered tax ID is now locked into your active billing profile and will appear on all future PDF receipts. I have also enabled automated receipt dispatches to billing@stratum.io.',
      },
    ],
  },
  {
    id: 'TICK-8310',
    subject: 'High-throughput webhook latency optimization',
    category: 'API & Webhooks',
    priority: 'High',
    status: 'Open',
    createdAt: 'Yesterday at 4:20 PM',
    updatedAt: '2 hours ago',
    assignedTo: {
      name: 'David Chen',
      role: 'Platform Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
    },
    messages: [
      {
        sender: 'user',
        author: 'Alex Thorne',
        time: 'Yesterday at 4:20 PM',
        content: 'We are processing bursts of 5,000 req/s. We noticed average webhook payload validation takes 38ms. Is it possible to enable dedicated compute clustering on our endpoint?',
      },
      {
        sender: 'agent',
        author: 'David Chen (Stratum Engineering)',
        time: 'Yesterday at 5:05 PM',
        content: 'Hi Alex, thanks for reaching out. We have reviewed your cluster telemetry. We can route your tenant endpoints to our ultra-low latency compute pool. Running benchmark checks now.',
      },
    ],
  },
  {
    id: 'TICK-8204',
    subject: 'Custom domain SSL auto-provisioning confirmation',
    category: 'Infrastructure',
    priority: 'Normal',
    status: 'Resolved',
    createdAt: 'Oct 14, 2026',
    updatedAt: 'Oct 15, 2026',
    assignedTo: {
      name: 'Elena Rostova',
      role: 'DevOps Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
    },
    messages: [
      {
        sender: 'user',
        author: 'Alex Thorne',
        time: 'Oct 14, 2026',
        content: 'We pointed our CNAME to stratum-ingress.net. Could you verify if the Let’s Encrypt wildcard certificate provisioned smoothly?',
      },
      {
        sender: 'agent',
        author: 'Elena Rostova (DevOps)',
        time: 'Oct 15, 2026',
        content: 'All green! The certificate is active, verified with HTTP/3 support, and will auto-renew 30 days prior to expiry.',
      },
    ],
  },
  {
    id: 'TICK-7988',
    subject: 'Single Sign-On (SAML/Okta) federation configuration',
    category: 'Authentication',
    priority: 'Urgent',
    status: 'Resolved',
    createdAt: 'Oct 02, 2026',
    updatedAt: 'Oct 03, 2026',
    assignedTo: {
      name: 'Marcus Vance',
      role: 'Security Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
    },
    messages: [
      {
        sender: 'user',
        author: 'Alex Thorne',
        time: 'Oct 02, 2026',
        content: 'We need the ACS URL and Entity ID for our Okta workspace.',
      },
      {
        sender: 'agent',
        author: 'Marcus Vance (Security)',
        time: 'Oct 03, 2026',
        content: 'ACS URL is https://auth.stratum.io/saml/acs and Audience URI is https://auth.stratum.io/saml/metadata. Tested and working!',
      },
    ],
  },
];

const INITIAL_FEEDBACK_IDEAS = [
  {
    id: 'FB-101',
    title: 'Native ClickHouse ingestion connector for analytics',
    category: 'Integrations',
    votes: 48,
    status: 'In Development',
    submittedBy: 'Alex Thorne',
    description: 'Provide an out-of-the-box stream connector that pipes telemetry events directly to customer ClickHouse clusters with zero pipeline maintenance.',
  },
  {
    id: 'FB-102',
    title: 'Automated Slack alert digest for critical anomalies',
    category: 'Notification & Alerts',
    votes: 35,
    status: 'Planned',
    submittedBy: 'DevOps Team',
    description: 'Send instantaneous Slack notifications with embedded charts whenever API error rates exceed 0.5% over a 5-minute rolling window.',
  },
  {
    id: 'FB-103',
    title: 'Multi-region PostgreSQL read-replica failover controls',
    category: 'Database & Storage',
    votes: 29,
    status: 'Under Review',
    submittedBy: 'Infrastructure Lead',
    description: 'Allow toggling automatic read-replica promotion directly from the dashboard settings without CLI intervention.',
  },
];

export default function TicketsAndFeedbackPage() {
  const { user, profile, subscription } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'feedback'
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [feedbackList, setFeedbackList] = useState(INITIAL_FEEDBACK_IDEAS);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ticket Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Create Ticket Modal
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Billing & Invoicing');
  const [newPriority, setNewPriority] = useState('Normal');
  const [newDescription, setNewDescription] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Feedback Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Idea');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('stratum_tickets_list');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTickets(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveTickets = (updatedList) => {
    setTickets(updatedList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('stratum_tickets_list', JSON.stringify(updatedList));
      } catch {
        // ignore
      }
    }
  };

  const displayName = profile?.full_name || user?.displayName || 'Alex Thorne';
  const displayEmail = profile?.email || user?.email || 'alex@stratum.io';

  const isEnterprise = subscription?.plan_id?.includes('enterprise');
  const isYearly = subscription?.billing_interval === 'year' || subscription?.plan_id?.includes('yearly');

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus =
      statusFilter === 'all' ||
      t.status.toLowerCase().replace(' ', '-') === statusFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const openCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) {
      toast.warning('Fields Required', 'Please provide a ticket subject and description.');
      return;
    }

    setCreatingTicket(true);
    const newId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicketObj = {
      id: newId,
      subject: newSubject.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'Open',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      assignedTo: {
        name: 'Sarah Jenkins',
        role: 'Stratum Senior Support',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
      },
      messages: [
        {
          sender: 'user',
          author: displayName,
          time: 'Just now',
          content: newDescription.trim(),
        },
      ],
    };

    setTimeout(() => {
      const updated = [newTicketObj, ...tickets];
      saveTickets(updated);
      setCreatingTicket(false);
      setCreateTicketOpen(false);
      setNewSubject('');
      setNewDescription('');

      toast.success(
        'Ticket Created Successfully',
        `Ticket ${newId} submitted. Support team SLA timer is running.`
      );
    }, 400);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    const newMsg = {
      sender: 'user',
      author: displayName,
      time: 'Just now',
      content: replyMessage.trim(),
    };

    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'In Progress',
          updatedAt: 'Just now',
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });

    saveTickets(updatedTickets);
    setSelectedTicket((prev) => ({
      ...prev,
      status: 'In Progress',
      updatedAt: 'Just now',
      messages: [...prev.messages, newMsg],
    }));

    setReplyMessage('');
    toast.success('Reply Sent', 'Your response has been dispatched to the assigned engineer.');
  };

  const handleVoteFeedback = (id) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item))
    );
    toast.success('Vote Recorded', 'Thank you for prioritizing this product capability.');
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackComment.trim()) {
      toast.warning('Required Fields', 'Please fill in both title and details.');
      return;
    }

    setSubmittingFeedback(true);
    const newFb = {
      id: `FB-${Math.floor(100 + Math.random() * 900)}`,
      title: feedbackTitle.trim(),
      category: feedbackCategory,
      votes: 1,
      status: 'Under Review',
      submittedBy: displayName,
      description: feedbackComment.trim(),
    };

    setTimeout(() => {
      setFeedbackList([newFb, ...feedbackList]);
      setSubmittingFeedback(false);
      setFeedbackModalOpen(false);
      setFeedbackTitle('');
      setFeedbackComment('');
      toast.success(
        'Feedback Submitted',
        'Your suggestion has been added to our public product roadmap board.'
      );
    }, 400);
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* ================= HEADER & BREADCRUMBS ================= */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          padding: '1.75rem 2rem 0 2rem',
          margin: '-2rem -2rem 2.5rem -2rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8125rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)',
                  marginBottom: '0.35rem',
                }}
              >
                <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>
                  Dashboard
                </Link>
                <span>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  Tickets &amp; Feedback
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <h1
                  style={{
                    fontSize: '1.875rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.025em',
                  }}
                >
                  Tickets &amp; Feedback
                </h1>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10b981',
                    }}
                  />
                  <span>
                    {isEnterprise
                      ? 'Enterprise 15m SLA Active'
                      : 'Priority 4h Support SLA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCreateTicketOpen(true)}
                className="btn btn-primary"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <PlusCircle size={17} />
                <span>Create New Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(true)}
                className="btn btn-secondary"
                style={{
                  padding: '0.65rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Star size={16} color="#f59e0b" />
                <span>Share Feedback</span>
              </button>
            </div>
          </div>

          {/* Subnav Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'tickets' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'tickets' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderTop: activeTab === 'tickets' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                borderLeft: activeTab === 'tickets' ? '1px solid var(--border-primary)' : '1px solid transparent',
                borderRight: activeTab === 'tickets' ? '1px solid var(--border-primary)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <MessagesSquare size={16} />
              <span>Support Tickets ({tickets.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'feedback' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'feedback' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderTop: activeTab === 'feedback' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                borderLeft: activeTab === 'feedback' ? '1px solid var(--border-primary)' : '1px solid transparent',
                borderRight: activeTab === 'feedback' ? '1px solid var(--border-primary)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Sparkles size={16} />
              <span>Product Feedback &amp; Ideas ({feedbackList.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* ================= METRICS COUNTERS (ROW 1) ================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Open / Active Tickets
              </span>
              <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {openCount} <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: 600 }}>in queue</span>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Resolved Tickets
              </span>
              <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {resolvedCount} <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>100% resolved</span>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Avg Response Time
              </span>
              <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                14 mins <span style={{ fontSize: '0.875rem', color: '#6366f1', fontWeight: 600 }}>SLA guaranteed</span>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
              }}
            >
              <Star size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                CSAT Satisfaction
              </span>
              <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                99.4% <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TAB CONTENT 1: TICKETS LIST ================= */}
        {activeTab === 'tickets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Filter & Search Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background: 'var(--bg-card)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
              }}
            >
              {/* Left: Search input */}
              <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by ticket ID, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Center / Right: Status Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['all', 'open', 'in-progress', 'resolved'].map((st) => {
                  const label = st === 'all' ? 'All Tickets' : st === 'in-progress' ? 'In Progress' : st.charAt(0).toUpperCase() + st.slice(1);
                  const isSelected = statusFilter === st;

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '9999px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                        background: isSelected ? 'var(--brand-primary-light)' : 'transparent',
                        color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tickets Table / List */}
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {filteredTickets.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <HelpCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    No matching support tickets found
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Try clearing your search query or submit a new inquiry.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreateTicketOpen(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <PlusCircle size={15} />
                    <span>Create Ticket</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredTickets.map((ticket, idx) => {
                    const isResolved = ticket.status === 'Resolved';
                    const isInProgress = ticket.status === 'In Progress';

                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1.25rem 1.5rem',
                          borderBottom: idx === filteredTickets.length - 1 ? 'none' : '1px solid var(--border-primary)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          gap: '1.25rem',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Left: ID & Subject & Category */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-primary)',
                              color: 'var(--brand-primary)',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            {ticket.id}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '0.9375rem',
                                  fontWeight: 700,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {ticket.subject}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '9999px',
                                  background: 'var(--bg-tertiary)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {ticket.category}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span>Opened: {ticket.createdAt}</span>
                              <span>•</span>
                              <span>Last update: {ticket.updatedAt}</span>
                              <span>•</span>
                              <span>{ticket.messages.length} message(s)</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Assigned Agent & Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                          {ticket.assignedTo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img
                                src={ticket.assignedTo.avatar}
                                alt={ticket.assignedTo.name}
                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {ticket.assignedTo.name}
                                </span>
                                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                                  {ticket.assignedTo.role}
                                </span>
                              </div>
                            </div>
                          )}

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.3rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isResolved
                                ? 'rgba(16, 185, 129, 0.12)'
                                : isInProgress
                                ? 'rgba(59, 130, 246, 0.12)'
                                : 'rgba(245, 158, 11, 0.12)',
                              color: isResolved ? '#10b981' : isInProgress ? '#3b82f6' : '#f59e0b',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: isResolved ? '#10b981' : isInProgress ? '#3b82f6' : '#f59e0b',
                              }}
                            />
                            <span>{ticket.status}</span>
                          </span>

                          <ChevronRight size={18} color="var(--text-muted)" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB CONTENT 2: FEEDBACK & IDEAS ================= */}
        {activeTab === 'feedback' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background: 'var(--bg-card)',
                padding: '1.5rem 1.75rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Public Roadmap &amp; Feature Requests
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Upvote features you need or submit suggestions. Our core engineering team reviews top-voted proposals weekly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)' }}
              >
                <PlusCircle size={16} />
                <span>Submit Feature Proposal</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="card"
                  style={{
                    padding: '1.75rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          background: 'var(--brand-primary-light)',
                          color: 'var(--brand-primary)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {fb.category}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: fb.status === 'In Development' ? '#10b981' : '#f59e0b',
                        }}
                      >
                        ● {fb.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {fb.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {fb.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-primary)', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Proposed by {fb.submittedBy}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVoteFeedback(fb.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem' }}
                    >
                      <ThumbsUp size={14} />
                      <span>{fb.votes} votes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= TICKET DETAIL MODAL / DRAWER ================= */}
      {selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedTicket(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    background: 'var(--brand-primary)',
                    color: '#ffffff',
                  }}
                >
                  {selectedTicket.id}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedTicket.subject}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Category: <strong>{selectedTicket.category}</strong></span>
                    <span>•</span>
                    <span>Priority: <strong>{selectedTicket.priority}</strong></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conversation Thread */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {selectedTicket.messages.map((msg, idx) => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.35rem',
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: isUser ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {msg.author}
                      </span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isUser ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                        color: isUser ? '#ffffff' : 'var(--text-primary)',
                        fontSize: '0.875rem',
                        lineHeight: 1.55,
                        boxShadow: 'var(--shadow-sm)',
                        border: isUser ? 'none' : '1px solid var(--border-primary)',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Bar */}
            <form
              onSubmit={handleSendReply}
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <input
                type="text"
                placeholder="Type your response to support..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!replyMessage.trim()}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= CREATE TICKET MODAL ================= */}
      {createTicketOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setCreateTicketOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <PlusCircle size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Create Support Ticket
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateTicketOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                  Ticket Subject / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoicing details for annual plan renewal"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="Billing & Invoicing">Billing &amp; Invoicing</option>
                    <option value="API & Webhooks">API &amp; Webhooks</option>
                    <option value="Infrastructure">Infrastructure &amp; SSL</option>
                    <option value="Authentication">Authentication (Auth &amp; SSO)</option>
                    <option value="General Support">General Support</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="Normal">Normal (Standard 4h SLA)</option>
                    <option value="High">High (2h SLA)</option>
                    <option value="Urgent">Urgent (15m SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue, endpoint URL, or questions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-primary)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setCreateTicketOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 1.15rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.35rem' }}
                >
                  {creatingTicket ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SHARE FEEDBACK MODAL ================= */}
      {feedbackModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setFeedbackModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-primary)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Star size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Submit Product Feedback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                  How satisfied are you with Stratum?
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <Star
                        size={26}
                        color={star <= feedbackRating ? '#f59e0b' : 'var(--text-muted)'}
                        fill={star <= feedbackRating ? '#f59e0b' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                  Category
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="Feature Idea">Feature Idea</option>
                  <option value="UI/UX Design">UI / UX Design</option>
                  <option value="Integrations">Integrations &amp; Connectors</option>
                  <option value="Billing & Pricing">Billing &amp; Pricing</option>
                  <option value="Performance">Performance &amp; Speed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                  Proposal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Export analytical charts as high-res SVGs"
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
                  Details &amp; Suggestions *
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us what you'd love to see or how we can improve..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-primary)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 1.15rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.35rem' }}
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
