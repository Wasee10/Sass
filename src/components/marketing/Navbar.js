'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Layers,
  Menu,
  X,
  ArrowRight,
  User,
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, profile, subscription, signOut } = useAuth();
  const toast = useToast();

  const displayName = user?.displayName || profile?.full_name || user?.email?.split('@')[0] || 'Member';
  const email = user?.email || 'user@example.com';
  const isGmail = email.toLowerCase().endsWith('@gmail.com') || user?.providerData?.some((p) => p?.providerId === 'google.com');

  // Preferred avatar image: photoURL -> profile avatar_url -> dynamic ui-avatars
  const avatarUrl =
    user?.photoURL ||
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3161F8&color=fff&bold=true`;

  const initial = (displayName || 'U').charAt(0).toUpperCase();

  const planName = subscription?.plan_name || (subscription?.plan_id?.includes('pro') ? 'Professional' : 'Starter');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    toast.info('Signed Out', 'You have been safely signed out.');
    await signOut();
  };

  return (
    <header
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Layers size={20} />
          </div>
          <span>Stratum</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="desktop-nav"
        >
          <Link
            href="/#features"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            Features
          </Link>
          <Link
            href="/#roadmap"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            Roadmap
          </Link>
          <Link
            href="/#benefits"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            Benefits
          </Link>
          <Link
            href="/pricing"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'color 0.15s ease',
            }}
          >
            FAQ
          </Link>
        </nav>

        {/* Right Actions: User Profile / Gmail Avatar + Theme Toggle + Auth buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
          className="desktop-nav"
        >
          {/* USER GMAIL / PROFILE AVATAR WHEN LOGGED IN */}
          {user && (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="Open profile menu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '3px 6px 3px 3px',
                  borderRadius: '9999px',
                  background: 'var(--bg-secondary)',
                  border: userDropdownOpen ? '1px solid var(--brand-primary)' : '1px solid var(--border-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Avatar Circle Container */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span
                    style={{
                      position: 'absolute',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      zIndex: 0,
                    }}
                  >
                    {initial}
                  </span>
                </div>

                {/* Gmail indicator badge */}
                {isGmail && (
                  <span
                    title="Connected with Google"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '14px',
                      height: '14px',
                      marginLeft: '-2px',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  </span>
                )}

                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {/* Profile Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="card animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '260px',
                    padding: '0.65rem',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 60,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-card)',
                  }}
                >
                  {/* User Profile Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.6rem 0.5rem 0.75rem',
                      borderBottom: '1px solid var(--border-primary)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        position: 'relative',
                        background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          referrerPolicy="no-referrer"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : null}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {displayName}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {email}
                      </div>
                      <div style={{ marginTop: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '9999px',
                            background: 'rgba(49, 97, 248, 0.12)',
                            color: '#3161F8',
                          }}
                        >
                          {planName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links in Menu */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <LayoutDashboard size={16} color="#3161F8" />
                      <span>Workspace Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/billing"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <CreditCard size={16} color="var(--text-muted)" />
                      <span>Billing & License</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Settings size={16} color="var(--text-muted)" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-primary)', margin: '0.4rem 0' }} />

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      width: '100%',
                      padding: '0.55rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
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
          )}

          <ThemeToggle />

          {user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              <User size={16} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get Started
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div
          className="mobile-toggle"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer animate-fade-in"
          style={{
            position: 'absolute',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-primary)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  flexShrink: 0,
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {email}
                </div>
              </div>
            </div>
          )}

          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Features
          </Link>
          <Link
            href="/#roadmap"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Roadmap
          </Link>
          <Link
            href="/#benefits"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Benefits
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            FAQ
          </Link>

          <hr style={{ borderColor: 'var(--border-primary)' }} />

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link
                href="/dashboard"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: '100%' }}
              >
                Open Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-secondary"
                style={{ width: '100%', color: 'var(--danger)' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                href="/login"
                className="btn btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: '100%' }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: '100%' }}
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.desktop-nav) {
            display: none !important;
          }
          :global(.mobile-toggle) {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
