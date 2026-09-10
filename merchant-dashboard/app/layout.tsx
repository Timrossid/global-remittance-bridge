import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { PHProvider } from '@/components/posthog-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { NetworkStatus } from '@/components/network-status';
import { ScrollToTop } from '@/components/scroll-to-top';
import { CookieConsent } from '@/components/cookie-consent';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Merchant Dashboard | Global Micro-Remittance Bridge',
    template: '%s | Global Micro-Remittance Bridge',
  },
  description:
    'Accept instant, low-cost international payments powered by Stellar and Soroban smart contracts.',
  metadataBase: new URL('https://merchant-dashboard-rosy.vercel.app'),
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Merchant Dashboard | Global Micro-Remittance Bridge',
    description: 'Accept instant, low-cost international payments powered by Stellar.',
    type: 'website',
    url: 'https://merchant-dashboard-rosy.vercel.app',
    siteName: 'Global Micro-Remittance Bridge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merchant Dashboard | Global Micro-Remittance Bridge',
    description: 'Accept instant, low-cost international payments powered by Stellar.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <PHProvider>
            <NetworkStatus />
            {children}
            <ScrollToTop />
            <CookieConsent />
            <Analytics />
          </PHProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
