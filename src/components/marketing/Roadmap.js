'use client';

import { useState } from 'react';
import { Sparkles, Check, Rocket, Zap, BookOpen } from 'lucide-react';
import styles from './Roadmap.module.css';

// Primary Dataset: Exact matching copy from the reference image
const REFERENCE_DATA = {
  id: 'playbook',
  eyebrow: '... and reuse the skills for every future project.',
  stats: ['9 video lessons', '9 agent skills', 'you approve every step'],
  phases: [
    {
      num: 1,
      title: '1 · RESEARCH',
      color: '#d97706',
      nodes: [
        {
          id: 'r1',
          title: 'Customer research',
          subtitle1: 'Who buys, what hurts,',
          subtitle2: 'their exact words',
          detail: 'Uncover your ideal customer profile, extract their exact emotional pain points, and validate their willingness to pay before writing any code.',
          deliverable: 'Voice of Customer Canvas',
        },
        {
          id: 'r2',
          title: 'Brand story',
          subtitle1: 'Make your customer',
          subtitle2: 'the hero',
          detail: 'Position your user as the hero on a quest, and position your product as the indispensable guide that helps them triumph over obstacles.',
          deliverable: 'Core Narrative Framework',
        },
        {
          id: 'r3',
          title: 'SEO research',
          subtitle1: 'Find keywords your',
          subtitle2: 'page can rank for',
          detail: 'Identify high-intent search queries that potential customers type into Google right before buying, ensuring organic compound growth.',
          deliverable: 'High-Intent Keyword Matrix',
        },
      ],
      approval: 'YOU APPROVE',
    },
    {
      num: 2,
      title: '2 · WRITE',
      color: '#0d9488',
      nodes: [
        {
          id: 'r4',
          title: 'Page structure',
          subtitle1: 'Plan your sections and',
          subtitle2: 'their purpose',
          detail: 'Architect a high-converting page layout: Hero clarity, proof elements, problem agitation, solution walkthrough, and objection handling.',
          deliverable: 'Wireframe Section Flow',
        },
        {
          id: 'r5',
          title: 'Page copy',
          subtitle1: 'Write your headlines,',
          subtitle2: 'copy, and CTAs',
          detail: 'Draft punchy headlines, benefit-first bullet points, and frictionless call-to-actions that build unstoppable momentum towards conversion.',
          deliverable: 'Full Conversion Sales Copy',
        },
      ],
      approval: 'YOU APPROVE',
    },
    {
      num: 3,
      title: '3 · DESIGN',
      color: '#6366f1',
      nodes: [
        {
          id: 'r6',
          title: 'Wireframe',
          subtitle1: 'Lay out your page',
          subtitle2: 'before the polish',
          detail: 'Structure component hierarchy, scan lines, visual density, and responsive breakpoints before diving into final decorative styling.',
          deliverable: 'Approved Layout Scaffold',
        },
        {
          id: 'r7',
          title: 'Final design',
          subtitle1: 'Pick a direction and',
          subtitle2: 'build your page',
          detail: 'Apply modern typography, tailored HSL color palettes, dark/light themes, and accessible contrast for a stunning first impression.',
          deliverable: 'Production UI Design System',
        },
        {
          id: 'r8',
          title: 'Page visuals',
          subtitle1: 'Create visuals that',
          subtitle2: 'explain your product',
          detail: 'Craft authentic product UI mockups, interactive feature previews, and micro-animations that immediately communicate product value.',
          deliverable: 'Interactive Product Visuals',
        },
      ],
      endBadge: '★ SHIPPED',
    },
  ],
};

// Alternate Dataset: SaaS Starter Engineering Workflow
const SAAS_DATA = {
  id: 'engineering',
  eyebrow: '... and ship your entire SaaS application in days.',
  stats: ['Next.js 16 App Router', 'Supabase Auth & RLS', 'you approve every step'],
  phases: [
    {
      num: 1,
      title: '1 · RESEARCH & ARCHITECTURE',
      color: '#d97706',
      nodes: [
        {
          id: 's1',
          title: 'Market validation',
          subtitle1: 'Validate pain points &',
          subtitle2: 'pricing willingness',
          detail: 'Identify target buyers and confirm your value proposition before writing backend code or payment integrations.',
          deliverable: 'Validated Problem Spec',
        },
        {
          id: 's2',
          title: 'Database schema',
          subtitle1: 'PostgreSQL tables and',
          subtitle2: 'Row Level Security',
          detail: 'Set up Supabase profiles, subscription states, and invoices with strict database-level security policies.',
          deliverable: 'supabase/schema.sql applied',
        },
        {
          id: 's3',
          title: 'Turnkey Auth',
          subtitle1: 'Cookie sessions, OAuth,',
          subtitle2: '& password resets',
          detail: 'Configure email/password login and Google OAuth with secure HTTP-only cookies and zero client token leaks.',
          deliverable: 'Protected Session Handlers',
        },
      ],
      approval: 'YOU APPROVE',
    },
    {
      num: 2,
      title: '2 · BUILD & MONETIZE',
      color: '#0d9488',
      nodes: [
        {
          id: 's4',
          title: 'Dashboard shell',
          subtitle1: 'Sidebar, account settings,',
          subtitle2: '& member workspace',
          detail: 'Assemble a protected app shell with responsive sidebar navigation, account profile controls, security toggles, and workspace state.',
          deliverable: 'Protected /dashboard routes',
        },
        {
          id: 's5',
          title: 'Subscription UI',
          subtitle1: 'Tiered pricing, checkout,',
          subtitle2: '& invoice management',
          detail: 'Wire up subscription cards, monthly/annual billing toggles, plan upgrade flows, and customer invoice history tables.',
          deliverable: 'Billing UI & Webhook Handlers',
        },
      ],
      approval: 'YOU APPROVE',
    },
    {
      num: 3,
      title: '3 · POLISH & SHIP',
      color: '#6366f1',
      nodes: [
        {
          id: 's6',
          title: 'Adaptive UI',
          subtitle1: 'Pixel-perfect dark theme',
          subtitle2: '& fluid layouts',
          detail: 'Tune design tokens with high-contrast light and dark modes, accessible focus rings, and micro-animations.',
          deliverable: 'Adaptive Design System',
        },
        {
          id: 's7',
          title: 'SEO & Metadata',
          subtitle1: 'OpenGraph cards, sitemap,',
          subtitle2: '& edge performance',
          detail: 'Configure dynamic metadata, social share previews, automated sitemap.js generation, and fast Turbopack delivery.',
          deliverable: 'Search & Social Ready',
        },
        {
          id: 's8',
          title: 'Live deployment',
          subtitle1: 'Custom domain, SSL,',
          subtitle2: '& Vercel production',
          detail: 'One-click deploy to Vercel with automatic CI/CD, SSL certificates, global CDN edge caching, and live logs.',
          deliverable: 'Production Deployment Live',
        },
      ],
      endBadge: '★ SHIPPED',
    },
  ],
};

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState('playbook');
  const [selectedId, setSelectedId] = useState(null);

  const currentData = activeTab === 'playbook' ? REFERENCE_DATA : SAAS_DATA;

  // Flatten nodes for active selection
  const allNodes = [
    ...currentData.phases[0].nodes,
    ...currentData.phases[1].nodes,
    ...currentData.phases[2].nodes,
  ];

  const activeNode = selectedId
    ? allNodes.find((n) => n.id === selectedId) || allNodes[0]
    : allNodes[0];

  return (
    <section id="roadmap" className={styles.section}>
      {/* Ambient background glows */}
      <div className={styles.ambientGlow1} />
      <div className={styles.ambientGlow2} />

      <div className={styles.container}>
        {/* Header - Styled precisely like the reference image */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>{currentData.eyebrow}</p>
          <div className={styles.statsBar}>
            <span>{currentData.stats[0]}</span>
            <span className={styles.statsDot}>·</span>
            <span>{currentData.stats[1]}</span>
            <span className={styles.statsDot}>·</span>
            <span className={styles.approveGreen}>{currentData.stats[2]}</span>
          </div>

          {/* Perspective toggle pill */}
          <div className={styles.toggleBox}>
            <div className={styles.togglePill}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('playbook');
                  setSelectedId(null);
                }}
                className={`${styles.toggleOption} ${activeTab === 'playbook' ? styles.toggleOptionActive : ''}`}
              >
                <BookOpen size={14} />
                Course Playbook View
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('engineering');
                  setSelectedId(null);
                }}
                className={`${styles.toggleOption} ${activeTab === 'engineering' ? styles.toggleOptionActive : ''}`}
              >
                <Zap size={14} />
                SaaS Architecture View
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Serpentine S-Curve Roadmap */}
        <div className={styles.desktopRoadmap}>
          <svg
            viewBox="0 0 1080 440"
            className={styles.svgCanvas}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Curve 1 Gradient: Amber to Teal */}
              <linearGradient id="curve1Grad" x1="915" y1="70" x2="915" y2="210" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e5a93c" />
                <stop offset="40%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>

              {/* Curve 2 Gradient: Teal to Purple */}
              <linearGradient id="curve2Grad" x1="165" y1="210" x2="165" y2="350" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="45%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              {/* Shipped Button Gradient */}
              <linearGradient id="shippedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              {/* Glowing Drop Shadow for Shipped Button */}
              <filter id="shippedGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0d9488" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* ================= TIER 1: RESEARCH (Amber) ================= */}
            <text x="145" y="38" className={`${styles.phaseLabel} ${styles.phase1}`}>
              {currentData.phases[0].title}
            </text>

            {/* Row 1 Track: X=92 to X=915, Y=70 */}
            <path
              d="M 92 70 L 915 70"
              stroke="#e5a93c"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Semicircle Curve 1: Right downward turn (Radius = 70) */}
            <path
              d="M 915 70 A 70 70 0 0 1 915 210"
              stroke="url(#curve1Grad)"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* START Badge */}
            <g className={styles.startPill}>
              <rect x="28" y="55" width="62" height="30" rx="15" />
              <text x="59" y="74" className={styles.startText}>
                START
              </text>
            </g>

            {/* Milestone Node 1 */}
            <g
              className={styles.nodeItem}
              onClick={() => setSelectedId(currentData.phases[0].nodes[0].id)}
            >
              <circle cx="210" cy="70" r="16" fill="transparent" />
              <circle cx="210" cy="70" r="6.5" className={styles.nodeDotBase} />
              <text x="210" y="103" className={styles.nodeTitle}>
                {currentData.phases[0].nodes[0].title}
              </text>
              <text x="210" y="122" className={styles.nodeSubtitle}>
                <tspan x="210">{currentData.phases[0].nodes[0].subtitle1}</tspan>
                <tspan x="210" dy="1.3em">{currentData.phases[0].nodes[0].subtitle2}</tspan>
              </text>
            </g>

            {/* Milestone Node 2 */}
            <g
              className={styles.nodeItem}
              onClick={() => setSelectedId(currentData.phases[0].nodes[1].id)}
            >
              <circle cx="460" cy="70" r="16" fill="transparent" />
              <circle cx="460" cy="70" r="6.5" className={styles.nodeDotBase} />
              <text x="460" y="103" className={styles.nodeTitle}>
                {currentData.phases[0].nodes[1].title}
              </text>
              <text x="460" y="122" className={styles.nodeSubtitle}>
                <tspan x="460">{currentData.phases[0].nodes[1].subtitle1}</tspan>
                <tspan x="460" dy="1.3em">{currentData.phases[0].nodes[1].subtitle2}</tspan>
              </text>
            </g>

            {/* Milestone Node 3 */}
            <g
              className={styles.nodeItem}
              onClick={() => setSelectedId(currentData.phases[0].nodes[2].id)}
            >
              <circle cx="710" cy="70" r="16" fill="transparent" />
              <circle cx="710" cy="70" r="6.5" className={styles.nodeDotBase} />
              <text x="710" y="103" className={styles.nodeTitle}>
                {currentData.phases[0].nodes[2].title}
              </text>
              <text x="710" y="122" className={styles.nodeSubtitle}>
                <tspan x="710">{currentData.phases[0].nodes[2].subtitle1}</tspan>
                <tspan x="710" dy="1.3em">{currentData.phases[0].nodes[2].subtitle2}</tspan>
              </text>
            </g>

            {/* YOU APPROVE Diamond 1 */}
            <g>
              <rect
                x="862"
                y="57"
                width="26"
                height="26"
                rx="4"
                transform="rotate(45 875 70)"
                className={styles.approvalDiamond}
              />
              <path
                d="M 870 70 L 873.5 73.5 L 881 66"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x="875" y="106" className={styles.approvalLabel}>
                YOU APPROVE
              </text>
            </g>

            {/* ================= TIER 2: WRITE (Teal, right-to-left) ================= */}
            <text x="780" y="178" className={`${styles.phaseLabel} ${styles.phase2}`}>
              {currentData.phases[1].title}
            </text>

            {/* Row 2 Track: X=915 to X=165, Y=210 */}
            <path
              d="M 915 210 L 165 210"
              stroke="#0d9488"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Semicircle Curve 2: Left downward turn (Radius = 70) */}
            <path
              d="M 165 210 A 70 70 0 0 0 165 350"
              stroke="url(#curve2Grad)"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Milestone Node 4 (Page structure) */}
            <g
              className={styles.nodeItem}
              onClick={() => setSelectedId(currentData.phases[1].nodes[0].id)}
            >
              <circle cx="690" cy="210" r="16" fill="transparent" />
              <circle cx="690" cy="210" r="6.5" className={styles.nodeDotBase} />
              <text x="690" y="243" className={styles.nodeTitle}>
                {currentData.phases[1].nodes[0].title}
              </text>
              <text x="690" y="262" className={styles.nodeSubtitle}>
                <tspan x="690">{currentData.phases[1].nodes[0].subtitle1}</tspan>
                <tspan x="690" dy="1.3em">{currentData.phases[1].nodes[0].subtitle2}</tspan>
              </text>
            </g>

            {/* Milestone Node 5 (Page copy) */}
            <g
              className={styles.nodeItem}
              onClick={() => setSelectedId(currentData.phases[1].nodes[1].id)}
            >
              <circle cx="440" cy="210" r="16" fill="transparent" />
              <circle cx="440" cy="210" r="6.5" className={styles.nodeDotBase} />
              <text x="440" y="243" className={styles.nodeTitle}>
                {currentData.phases[1].nodes[1].title}
              </text>
              <text x="440" y="262" className={styles.nodeSubtitle}>
                <tspan x="440">{currentData.phases[1].nodes[1].subtitle1}</tspan>
                <tspan x="440" dy="1.3em">{currentData.phases[1].nodes[1].subtitle2}</tspan>
              </text>
            </g>

            {/* YOU APPROVE Diamond 2 */}
            <g>
              <rect
                x="202"
                y="197"
                width="26"
                height="26"
                rx="4"
                transform="rotate(45 215 210)"
                className={styles.approvalDiamond}
              />
              <path
                d="M 210 210 L 213.5 213.5 L 221 206"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x="215" y="246" className={styles.approvalLabel}>
                YOU APPROVE
              </text>
            </g>

            {/* ================= TIER 3: DESIGN (Purple, left-to-right) ================= */}
            <text x="235" y="318" className={`${styles.phaseLabel} ${styles.phase3}`}>
              {currentData.phases[2].title}
            </text>

            {/* Row 3 Track: X=165 to X=860, Y=350 */}
            <path
              d="M 165 350 L 860 350"
              stroke="#6366f1"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Milestone Node 6 (Wireframe) */}
            <g
              className={styles.nodeItem}
              onClick={() => setSelectedId(currentData.phases[2].nodes[0].id)}
            >
              <circle cx="230" cy="350" r="16" fill="transparent" />
              <circle cx="230" cy="350" r="6.5" className={styles.nodeDotBase} />
              <text x="230" y="383" className={styles.nodeTitle}>
                {currentData.phases[2].nodes[0].title}
              </text>
              <text x="230" y="402" className={styles.nodeSubtitle}>
                <tspan x="230">{currentData.phases[2].nodes[0].subtitle1}</tspan>
                <tspan x="230" dy="1.3em">{currentData.phases[2].nodes[0].subtitle2}</tspan>
              </text>
            </g>

            {/* Milestone Node 7 (Final design) */}
            <g
              className={styles.nodeItem}
              onClick={() => setSelectedId(currentData.phases[2].nodes[1].id)}
            >
              <circle cx="470" cy="350" r="16" fill="transparent" />
              <circle cx="470" cy="350" r="6.5" className={styles.nodeDotBase} />
              <text x="470" y="383" className={styles.nodeTitle}>
                {currentData.phases[2].nodes[1].title}
              </text>
              <text x="470" y="402" className={styles.nodeSubtitle}>
                <tspan x="470">{currentData.phases[2].nodes[1].subtitle1}</tspan>
                <tspan x="470" dy="1.3em">{currentData.phases[2].nodes[1].subtitle2}</tspan>
              </text>
            </g>

            {/* Milestone Node 8 (Page visuals) */}
            <g
              className={styles.nodeItem}
              onClick={() => setSelectedId(currentData.phases[2].nodes[2].id)}
            >
              <circle cx="710" cy="350" r="16" fill="transparent" />
              <circle cx="710" cy="350" r="6.5" className={styles.nodeDotBase} />
              <text x="710" y="383" className={styles.nodeTitle}>
                {currentData.phases[2].nodes[2].title}
              </text>
              <text x="710" y="402" className={styles.nodeSubtitle}>
                <tspan x="710">{currentData.phases[2].nodes[2].subtitle1}</tspan>
                <tspan x="710" dy="1.3em">{currentData.phases[2].nodes[2].subtitle2}</tspan>
              </text>
            </g>

            {/* SHIPPED Capsule Badge */}
            <g
              className={styles.shippedPill}
              filter="url(#shippedGlow)"
              onClick={() => setSelectedId('shipped')}
            >
              <rect x="850" y="328" width="144" height="44" rx="22" fill="url(#shippedGrad)" />
              <text
                x="922"
                y="355"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="var(--font-heading), sans-serif"
                fontSize="14"
                fontWeight="800"
                letterSpacing="0.08em"
              >
                ★ SHIPPED
              </text>
            </g>
          </svg>
        </div>

        {/* Mobile Vertical View (< 880px) */}
        <div className={styles.mobileRoadmap}>
          {currentData.phases.map((phase, pIdx) => (
            <div key={phase.title} className={styles.mobileTier}>
              <div
                className={`${styles.mobileTierHeader} ${
                  pIdx === 0
                    ? styles.mobileTier1
                    : pIdx === 1
                    ? styles.mobileTier2
                    : styles.mobileTier3
                }`}
              >
                {phase.title}
              </div>

              <div className={styles.mobileTrack}>
                {phase.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={styles.mobileCard}
                    onClick={() => setSelectedId(node.id)}
                  >
                    <div className={styles.mobileDot} />
                    <div className={styles.mobileCardTitle}>{node.title}</div>
                    <div className={styles.mobileCardDesc}>
                      {node.subtitle1} {node.subtitle2}
                    </div>
                  </div>
                ))}

                {phase.approval && (
                  <div className={styles.mobileApprovalBadge}>
                    <Check size={14} />
                    <span>{phase.approval}</span>
                  </div>
                )}

                {phase.endBadge && (
                  <div className={styles.mobileShippedBadge}>
                    <Rocket size={18} />
                    <span>{phase.endBadge}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Active Stage Highlight Drawer */}
        <div className={styles.activeCard}>
          <div>
            <div className={styles.activeCardTitle}>
              <Sparkles size={16} color="var(--brand-primary)" />
              {selectedId === 'shipped' ? 'Mission Complete: Shipped' : activeNode.title}
            </div>
            <p className={styles.activeCardDesc}>
              {selectedId === 'shipped'
                ? 'Your project is live, accessible worldwide, optimized for conversions, and ready to welcome paying users.'
                : activeNode.detail}
            </p>
          </div>
          <div>
            <span className={styles.activeCardBadge}>
              {selectedId === 'shipped' ? 'Live on Web' : activeNode.deliverable}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
