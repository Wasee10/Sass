import './globals.css';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
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
    default: 'SaaS Core | Your workspace, made clearer',
    template: '%s | SaaS Core',
  },
  description: 'A calm, secure workspace for teams to manage projects, accounts, and subscriptions.',
  keywords: ['SaaS starter', 'Next.js SaaS', 'Supabase Auth', 'Subscription billing'],
  openGraph: {
    type: 'website',
    siteName: 'SaaS Core',
    title: 'SaaS Core | Your workspace, made clearer',
    description: 'A calm, secure workspace for teams to manage projects, accounts, and subscriptions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaS Core | Your workspace, made clearer',
    description: 'A calm, secure workspace for teams to manage projects, accounts, and subscriptions.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <CookieNotice />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
