import './globals.css';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import CookieNotice from '@/components/CookieNotice';

const headingFont = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Stratum | Modern Cloud Workspace & Intelligence Platform',
    template: '%s | Stratum',
  },
  description: 'High-velocity cloud workspace, developer telemetry, and subscription infrastructure powered by Next.js and Firebase.',
  keywords: ['Stratum', 'Cloud platform', 'Next.js SaaS', 'Firebase Auth', 'Firestore', 'Developer Workspace', 'Telemetry'],
  openGraph: {
    type: 'website',
    siteName: 'Stratum',
    title: 'Stratum | Modern Cloud Workspace & Intelligence Platform',
    description: 'High-velocity cloud workspace, developer telemetry, and subscription infrastructure powered by Next.js and Firebase.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stratum | Modern Cloud Workspace & Intelligence Platform',
    description: 'High-velocity cloud workspace, developer telemetry, and subscription infrastructure powered by Next.js and Firebase.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${headingFont.variable} ${bodyFont.variable}`}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <CookieNotice />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
