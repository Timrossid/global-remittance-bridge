import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Merchant Dashboard | Global Micro-Remittance Bridge',
  description: 'Manage your global remittances and treasury.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
