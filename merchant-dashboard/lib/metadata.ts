import { Metadata } from 'next';

export const SITE_URL = 'https://merchant-dashboard-rosy.vercel.app';

export const defaultMetadata: Metadata = {
  title: {
    default: 'Merchant Dashboard | Global Micro-Remittance Bridge',
    template: '%s | Global Micro-Remittance Bridge',
  },
  description:
    'Accept instant, low-cost international payments powered by Stellar and Soroban smart contracts.',
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Merchant Dashboard | Global Micro-Remittance Bridge',
    description: 'Accept instant, low-cost international payments powered by Stellar.',
    type: 'website',
    url: SITE_URL,
    siteName: 'Global Micro-Remittance Bridge',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merchant Dashboard | Global Micro-Remittance Bridge',
    description: 'Accept instant, low-cost international payments powered by Stellar.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};
