'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { label: 'People',        href: '/dashboard',            caret: true  },
  { label: 'Transactions',  href: '/dashboard',            caret: false },
  { label: 'Calendar',      href: '/dashboard',            caret: true  },
  { label: 'Listings',      href: '/marketplace',          caret: false },
  { label: 'Marketing',     href: '/dashboard',            caret: false },
  { label: 'Reporting',     href: '/dashboard',            caret: false },
  { label: 'Website',       href: '/dashboard',            caret: false },
  { label: 'Marketplace',   href: '/marketplace',          caret: false },
  { label: 'AI Assistant',  href: '/personal-assistant',   caret: false },
  { label: 'Settings',      href: '/dashboard',            caret: false },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [active, setActive] = useState(() => {
    const match = navItems.find(i => i.href !== '/dashboard' && pathname?.startsWith(i.href));
    return match?.label ?? 'People';
  });

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-6 px-5"
      style={{
        height: 'var(--lofty-nav-h)',
        background: 'var(--lofty-bg-surface)',
        borderBottom: '1px solid var(--lofty-border)',
      }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
        <Image src="/lofty/logo-lofty.svg" alt="Lofty" width={84} height={25} priority />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-5 flex-1">
        {navItems.map((i) => {
          const isActive = active === i.label;
          return (
            <Link
              key={i.label}
              href={i.href}
              onClick={() => setActive(i.label)}
              className="relative py-[20px] text-[13px] transition-colors"
              style={{
                color: isActive ? 'var(--lofty-fg-1)' : 'var(--lofty-fg-2)',
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? 'inset 0 -2px 0 0 var(--lofty-brand-500)' : 'none',
              }}
            >
              {i.label}
              {i.caret && <span className="ml-1 opacity-60 text-[9px]">▾</span>}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="hidden md:flex items-center gap-3.5 flex-shrink-0">
        <button
          aria-label="Search"
          className="p-1.5 rounded-md hover:bg-[var(--lofty-bg-muted)] transition-colors"
          style={{ color: 'var(--lofty-fg-3)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <Link
          href="/dashboard"
          className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-[#3C5BFF] to-[#16B47C] block"
          aria-label="Profile"
        />
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden ml-auto"
        onClick={() => setMobileOpen(!mobileOpen)}
        id="mobile-menu-btn"
        style={{ color: 'var(--lofty-fg-2)' }}
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileOpen
            ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
            : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>}
        </svg>
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 py-2 space-y-1"
          style={{ background: 'var(--lofty-bg-surface)', borderBottom: '1px solid var(--lofty-border)' }}
        >
          {navItems.map((i) => (
            <Link
              key={i.label}
              href={i.href}
              onClick={() => { setActive(i.label); setMobileOpen(false); }}
              className="block px-5 py-2 text-sm"
              style={{ color: 'var(--lofty-fg-2)' }}
            >
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
