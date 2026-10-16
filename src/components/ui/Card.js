export default function Card({ children, className = '', style = {}, ...props }) {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', style = {} }) {
  return (
    <h3
      className={className}
      style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        ...style,
      }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', style = {} }) {
  return (
    <p
      className={className}
      style={{
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', style = {} }) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
