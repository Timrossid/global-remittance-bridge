import { Metadata } from 'next';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Global Remittance Bridge',
  description: 'Cross-border remittance platform powered by Stellar and Soroban',
  url: 'https://merchant-dashboard-rosy.vercel.app',
  logo: 'https://merchant-dashboard-rosy.vercel.app/logo.png',
  sameAs: [
    'https://github.com/Timrossid/global-remittance-bridge',
  ],
};

export const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Global Remittance Bridge',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description: 'Accept instant, low-cost international payments powered by Stellar and Soroban smart contracts',
  url: 'https://merchant-dashboard-rosy.vercel.app',
};

export function generateStructuredData() {
  return [organizationSchema, softwareSchema];
}
