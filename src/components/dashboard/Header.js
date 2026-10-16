'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import Badge from '@/components/ui/Badge';
import { Menu, LogOut, User, Sparkles, ChevronDown } from 'lucide-react';

export default function Header({ onMenuClick }) {
  const { user, profile, signOut, isConfigured } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'user@example.com';

  return (
    <header
      className="glass"
      style={{
        height: 'var(--header-height)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {/* Left: Menu toggle (mobile) + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
          className="menu-button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '0.4rem',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontWeight: 600, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
            Workspace
          </span>
          {!isConfigured && (
            <Badge variant="warning" icon={Sparkles}>
              Demo Session
            </Badge>
          )}
        </div>
      </div>

      {/* Right: Actions, ThemeToggle, User Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ThemeToggle />

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'left', display: 'none' }} className="user-details">
              <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.2 }}>
                {displayName}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="card animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '240px',
                padding: '0.5rem',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 50,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--border-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {email}
                </div>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <User size={16} />
                <span>Account Profile</span>
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--danger)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .menu-button {
            display: flex !important;
          }
        }
        @media (min-width: 640px) {
          .user-details {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
