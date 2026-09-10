import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Global Micro-Remittance Bridge',
  description: 'Instant, low-cost international payments powered by Stellar and Soroban smart contracts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
