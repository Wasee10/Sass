'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Check for any flash toast stored in sessionStorage (e.g. across page redirects)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('stratum_pending_toast');
        if (stored) {
          sessionStorage.removeItem('stratum_pending_toast');
          const toastData = JSON.parse(stored);
          showToast(toastData);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'success', title, message, duration = 4500 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((title, message, duration) => {
    return showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const error = useCallback((title, message, duration) => {
    return showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const info = useCallback((title, message, duration) => {
    return showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  const warning = useCallback((title, message, duration) => {
    return showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '420px',
        width: 'calc(100vw - 2.5rem)',
        pointerEvents: 'none',
      }}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const { type, title, message } = toast;

  const config = {
    success: {
      borderColor: 'rgba(16, 185, 129, 0.4)',
      bg: 'rgba(15, 23, 42, 0.94)',
      icon: <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />,
      glow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
    },
    error: {
      borderColor: 'rgba(239, 68, 68, 0.4)',
      bg: 'rgba(15, 23, 42, 0.94)',
      icon: <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />,
      glow: '0 10px 25px -5px rgba(239, 68, 68, 0.25)',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
    },
    warning: {
      borderColor: 'rgba(245, 158, 11, 0.4)',
      bg: 'rgba(15, 23, 42, 0.94)',
      icon: <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />,
      glow: '0 10px 25px -5px rgba(245, 158, 11, 0.25)',
      badgeColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
    },
    info: {
      borderColor: 'rgba(49, 97, 248, 0.4)',
      bg: 'rgba(15, 23, 42, 0.94)',
      icon: <Info size={20} color="#3161F8" style={{ flexShrink: 0 }} />,
      glow: '0 10px 25px -5px rgba(49, 97, 248, 0.25)',
      badgeColor: '#3161F8',
      badgeBg: 'rgba(49, 97, 248, 0.15)',
    },
  }[type] || {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    bg: 'rgba(15, 23, 42, 0.94)',
    icon: <Info size={20} color="#94a3b8" style={{ flexShrink: 0 }} />,
    glow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    badgeColor: '#94a3b8',
    badgeBg: 'rgba(255, 255, 255, 0.1)',
  };

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: config.bg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${config.borderColor}`,
        borderRadius: '14px',
        padding: '0.875rem 1rem',
        boxShadow: `${config.glow}, 0 20px 30px rgba(0, 0, 0, 0.4)`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        animation: 'stratumToastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top micro progress highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${config.badgeColor}, transparent)`,
        }}
      />

      {/* Icon */}
      <div style={{ marginTop: '0.1rem' }}>{config.icon}</div>

      {/* Text info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              marginBottom: message ? '0.2rem' : 0,
              color: '#f8fafc',
            }}
          >
            {title}
          </div>
        )}
        {message && (
          <div
            style={{
              fontSize: '0.8125rem',
              color: '#94a3b8',
              lineHeight: 1.45,
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onRemove}
        aria-label="Close notification"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          padding: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          transition: 'color 0.15s ease',
        }}
      >
        <X size={15} />
      </button>

      <style jsx global>{`
        @keyframes stratumToastSlideIn {
          from {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
