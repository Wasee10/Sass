import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      className="container"
      style={{
        minHeight: '70vh',
        display: 'grid',
        placeContent: 'center',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      <p style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>404 · Page not found</p>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>This page isn’t here.</h1>
      <p style={{ color: 'var(--text-secondary)' }}>The link may be outdated, or the page may have moved.</p>
      <div>
        <Link href="/" className="btn btn-primary">Back to homepage</Link>
      </div>
    </main>
  );
}
