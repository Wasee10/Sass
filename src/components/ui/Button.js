'use client';

import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const widthStyle = fullWidth ? { width: '100%' } : {};

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      style={widthStyle}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="spin" />
      ) : (
        Icon && <Icon size={18} />
      )}
      {children}
    </button>
  );
}
