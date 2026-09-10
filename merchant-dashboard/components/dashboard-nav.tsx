'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ArrowLeftRight, Wallet, Shield, Settings, MessageSquare, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/(dashboard)', label: 'Dashboard', icon: Home },
  { href: '/(dashboard)/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/(dashboard)/wallet', label: 'Wallet', icon: Wallet },
  { href: '/(dashboard)/escrow', label: 'Escrow', icon: Shield },
  { href: '/(dashboard)/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/(dashboard)/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/(dashboard)/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Dashboard navigation">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
