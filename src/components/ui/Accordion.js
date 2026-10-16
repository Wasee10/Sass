'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div
            key={idx}
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              cursor: 'pointer',
              borderColor: isOpen ? 'var(--brand-primary)' : 'var(--border-primary)',
            }}
            onClick={() => toggleItem(idx)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: isOpen ? 'var(--brand-primary)' : 'var(--text-primary)',
                  textAlign: 'left',
                }}
              >
                {item.question}
              </h4>
              <span
                style={{
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <ChevronDown size={20} />
              </span>
            </div>

            {isOpen && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '0.85rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-primary)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  textAlign: 'left',
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
