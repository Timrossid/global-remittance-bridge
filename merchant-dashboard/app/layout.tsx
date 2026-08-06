import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Merchant Dashboard | Global Micro-Remittance Bridge',
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
    <html lang="en">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
