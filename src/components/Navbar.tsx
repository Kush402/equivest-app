'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8" style={{ background: 'oklch(0.1 0.02 270 / 85%)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" fillOpacity="0.9"/>
                <path d="M8 5L11 7V10L8 12L5 10V7L8 5Z" fill="white" fillOpacity="0.4"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Equivest
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/marketplace" className="text-sm text-white/60 hover:text-white transition-colors font-medium">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors font-medium">
              Dashboard
            </Link>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors font-medium">
              How it works
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10" asChild>
              <Link href="/dashboard">Sign In</Link>
            </Button>
            <Button size="sm" className="gradient-brand text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all" asChild>
              <Link href="/marketplace">Get Started</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white/70 hover:text-white transition-colors" onClick={() => setMobileOpen(!mobileOpen)} id="mobile-menu-btn">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/marketplace" className="block px-3 py-2 text-white/70 hover:text-white text-sm transition-colors">Marketplace</Link>
            <Link href="/dashboard" className="block px-3 py-2 text-white/70 hover:text-white text-sm transition-colors">Dashboard</Link>
            <a href="#how-it-works" className="block px-3 py-2 text-white/70 hover:text-white text-sm transition-colors">How it works</a>
            <div className="pt-2 border-t border-white/10 flex gap-3">
              <Button variant="ghost" size="sm" className="text-white/70 flex-1" asChild>
                <Link href="/dashboard">Sign In</Link>
              </Button>
              <Button size="sm" className="gradient-brand text-white border-0 flex-1" asChild>
                <Link href="/marketplace">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
