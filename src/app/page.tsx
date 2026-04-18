import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import { properties } from '@/lib/properties';

const stats = [
  { value: '$284M+', label: 'Total Properties Funded' },
  { value: '42,000+', label: 'Active Investors' },
  { value: '8.4%', label: 'Avg. Annual Yield' },
  { value: '99.3%', label: 'On-Time Distributions' },
];

const steps = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21 21l-5.2-5.2M15.5 10a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Browse Properties',
    description: 'Explore institutional-grade real estate deals vetted by our expert team.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 6v12m-4-4l4 4 4-4M3 6h18" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Invest from $50',
    description: 'Buy fractional ownership tokens in any property — no minimums, no lockups.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Earn Passive Income',
    description: 'Receive monthly rental distributions directly to your wallet.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Grow Your Portfolio',
    description: 'Benefit from long-term appreciation while your portfolio compounds.',
  },
];

const testimonials = [
  {
    quote: "I started with just $200 and now earn over $400/month in passive income. Equivest completely changed how I think about wealth building.",
    name: "Marcus T.",
    role: "Software Engineer, Seattle",
    avatar: "M",
    amount: "$12,400",
    label: "Portfolio value",
  },
  {
    quote: "The transparency is what sold me. I can see exactly what properties I own, rent collected each month, and how the value has changed.",
    name: "Priya N.",
    role: "Physician, Chicago",
    avatar: "P",
    amount: "9.2%",
    label: "Annual return",
  },
  {
    quote: "As a first-time real estate investor, Equivest made it incredibly approachable. The team vets every deal thoroughly.",
    name: "Jordan K.",
    role: "Marketing Director, Austin",
    avatar: "J",
    amount: "18 mo.",
    label: "Investing since",
  },
];

export default function Home() {
  const featuredProperties = properties.filter(p => p.status === 'Funding').slice(0, 3);

  return (
    <main className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen gradient-hero flex items-center overflow-hidden" id="hero">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />

        {/* Gradient blob */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, oklch(0.52 0.22 278), transparent)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, oklch(0.62 0.2 300), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ background: 'oklch(0.52 0.22 278 / 15%)', borderColor: 'oklch(0.52 0.22 278 / 30%)', color: 'oklch(0.72 0.18 278)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                $284M+ in properties funded
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                Own a piece of{' '}
                <span className="text-gradient">premium real estate</span>
                {' '}for $50
              </h1>

              <p className="text-lg text-white/60 leading-relaxed max-w-lg">
                Equivest lets anyone invest in institutional-grade properties — multifamily, commercial, and mixed-use — and earn passive income from day one.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gradient-brand text-white border-0 h-13 px-8 text-base font-semibold shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all" asChild>
                  <Link href="/marketplace" id="hero-cta-browse">Browse Properties →</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-13 px-8 text-base font-semibold backdrop-blur-sm" asChild>
                  <a href="#how-it-works" id="hero-cta-learn">How it works</a>
                </Button>
              </div>

              {/* Quick trust signals */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                {[
                  { icon: '🔒', text: 'SEC Qualified' },
                  { icon: '⚡', text: 'Instant liquidity' },
                  { icon: '📊', text: 'Monthly payouts' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-white/50 font-medium">
                    <span>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero property card */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50" style={{ border: '1px solid oklch(1 0 0 / 10%)' }}>
                <div className="relative h-72">
                  <Image src="/images/prop1.png" alt="Featured property" fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white/70 text-xs mb-1">Featured Property</p>
                    <p className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>Highland Tower · Boston, MA</p>
                  </div>
                </div>
                {/* Stats overlay */}
                <div className="glass-dark p-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-white/50 text-[10px] mb-0.5">Annual Yield</p>
                    <p className="text-emerald-400 font-bold text-lg">7.4%</p>
                  </div>
                  <div className="text-center border-x" style={{ borderColor: 'oklch(1 0 0 / 10%)' }}>
                    <p className="text-white/50 text-[10px] mb-0.5">Min. Invest</p>
                    <p className="text-white font-bold text-lg">$50</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-[10px] mb-0.5">Funded</p>
                    <p className="text-violet-400 font-bold text-lg">78%</p>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 glass rounded-xl px-4 py-3 shadow-xl" style={{ background: 'oklch(1 0 0 / 10%)', backdropFilter: 'blur(20px)', border: '1px solid oklch(1 0 0 / 15%)' }}>
                <p className="text-white/70 text-[10px]">Monthly distribution</p>
                <p className="text-white font-bold text-base">+$26,300 <span className="text-emerald-400 text-xs">↑ 4.2%</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-white border-y border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROPERTIES ===== */}
      <section className="py-20 bg-gray-50/60" id="properties">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-violet-600 text-sm font-semibold mb-2 tracking-wide uppercase">Featured</p>
              <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>Currently Funding</h2>
              <p className="text-gray-500 mt-2">Vetted deals open for investment right now.</p>
            </div>
            <Button variant="outline" className="hidden sm:flex border-violet-200 text-violet-700 hover:bg-violet-50" asChild>
              <Link href="/marketplace" id="view-all-btn">View all →</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>

          <div className="sm:hidden mt-8 text-center">
            <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50" asChild>
              <Link href="/marketplace">View all properties →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-violet-600 text-sm font-semibold mb-2 tracking-wide uppercase">Simple process</p>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>Start earning in minutes</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">No complex paperwork. No minimums. Just straightforward real estate investing.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t-2 border-dashed border-gray-200 z-0" style={{ width: 'calc(100% - 4rem)', transform: 'translateX(2rem)' }} />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-white mb-5 shadow-lg shadow-violet-500/20 group-hover:scale-110 group-hover:shadow-violet-500/35 transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-violet-600 text-sm font-semibold mb-2 tracking-wide uppercase">Social proof</p>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>Trusted by 42,000+ investors</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>

                <blockquote className="text-gray-700 text-sm leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-violet-600">{t.amount}</p>
                    <p className="text-[10px] text-gray-400">{t.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, oklch(0.52 0.22 278), transparent)' }} />

        <div className="relative max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            Ready to earn from real estate?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Join 42,000+ investors already earning passive income from premium real estate. Start with just $50.
          </p>
          <Button size="lg" className="gradient-brand text-white border-0 h-14 px-10 text-base font-semibold shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-[1.02] transition-all" asChild>
            <Link href="/marketplace" id="bottom-cta-btn">Start Investing Today →</Link>
          </Button>
          <p className="text-white/30 text-xs mt-4">No minimums. No hidden fees. Cancel anytime.</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-950 text-white/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" fillOpacity="0.9"/>
                </svg>
              </div>
              <span className="text-white font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Equivest</span>
            </div>
            <p className="text-xs text-center">
              © 2025 Equivest Inc. · Investment in securities involves risk. · Past performance is not indicative of future results.
            </p>
            <div className="flex gap-6 text-xs">
              {['Privacy', 'Terms', 'Disclosures'].map(link => (
                <a key={link} href="#" className="hover:text-white/70 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
