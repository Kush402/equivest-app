'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Property, formatCurrency } from '@/lib/properties';

// Lightweight count-up inline (no external dependency for this component)
function CountUp({ to, prefix = '', suffix = '', decimals = 0, duration = 600 }: {
  to: number; prefix?: string; suffix?: string; decimals?: number; duration?: number
}) {
  const [display, setDisplay] = useState(`${prefix}${(0).toFixed(decimals)}${suffix}`);
  const rafRef = useRef<number | null>(null);
  const prevTo = useRef(0);

  useEffect(() => {
    const from = prevTo.current;
    prevTo.current = to;
    let start: number | null = null;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const cur = from + (to - from) * ease(p);
      setDisplay(`${prefix}${cur.toFixed(decimals)}${suffix}`);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [to]);

  return <span>{display}</span>;
}

export default function InvestmentPanel({ property }: { property: Property }) {
  const [tokens, setTokens] = useState(1);
  const [invested, setInvested] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const investment = tokens * property.tokenPrice;
  const annualReturn = (investment * property.yield) / 100;
  const monthlyReturn = annualReturn / 12;
  const ownershipPct = (investment / property.marketCap) * 100;
  // Break-even: how many months until cumulative distributions = investment
  const breakEvenMonths = Math.ceil(investment / monthlyReturn);
  const breakEvenYears = (breakEvenMonths / 12).toFixed(1);

  // Market average yield = 5.2%
  const MARKET_AVG_YIELD = 5.2;
  const yieldAdvantage = (property.yield - MARKET_AVG_YIELD).toFixed(1);

  const urgencyPct = property.funded;
  const remainingPct = 100 - urgencyPct;
  const isAlmostDone = urgencyPct >= 80;

  const handleTokenChange = (n: number) => {
    setIsAnimating(true);
    setTokens(Math.max(1, Math.min(n, 1000)));
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">

      {/* ─── Urgency Banner ─── */}
      {isAlmostDone && !invested && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <p className="text-[11px] font-bold text-amber-700">
            Only {remainingPct}% remaining — selling fast
          </p>
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="gradient-brand p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-2xl" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="relative">
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mb-1">Token Price</p>
          <p className="text-white text-4xl font-bold leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
            {formatCurrency(property.tokenPrice)}
            <span className="text-white/50 text-base font-normal ml-1">/ token</span>
          </p>

          {/* Market comparison badge */}
          <div className="flex items-center gap-2 mt-3">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-white/15 text-white border border-white/20">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M7 17l9.293-9.293M17 17V7H7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              +{yieldAdvantage}% vs market avg
            </span>
            <span className="text-[10px] text-white/40">({MARKET_AVG_YIELD}% avg)</span>
          </div>
        </div>
      </div>

      {/* ─── Funding Progress ─── */}
      {!invested && (
        <div className="px-5 pt-4 pb-2">
          <div className="flex justify-between text-[10px] font-semibold mb-1.5">
            <span className={isAlmostDone ? 'text-amber-600' : 'text-violet-600'}>
              {urgencyPct}% funded
            </span>
            <span className="text-gray-400">{property.investors.toLocaleString()} investors</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isAlmostDone ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'gradient-brand'}`}
              style={{ width: `${urgencyPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {!invested ? (
          <>
            {/* ─── Token Stepper ─── */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Number of Tokens
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTokenChange(tokens - 1)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-violet-100 hover:text-violet-700 flex items-center justify-center font-bold text-gray-600 transition-all text-lg"
                >−</button>
                <input
                  type="number"
                  value={tokens}
                  min={1}
                  onChange={e => handleTokenChange(+e.target.value || 1)}
                  className="flex-1 text-center h-10 border border-gray-200 rounded-xl font-bold text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                />
                <button
                  onClick={() => handleTokenChange(tokens + 1)}
                  className="w-10 h-10 rounded-xl gradient-brand text-white flex items-center justify-center font-bold shadow-md shadow-violet-500/25 transition-all hover:scale-105 text-lg"
                >+</button>
              </div>

              {/* Quick picks */}
              <div className="flex gap-1.5 mt-2">
                {[1, 5, 10, 25, 50].map(n => (
                  <button
                    key={n}
                    onClick={() => handleTokenChange(n)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      tokens === n
                        ? 'gradient-brand text-white shadow-sm shadow-violet-500/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-violet-50 hover:text-violet-600'
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Financial Summary ─── */}
            <div
              className={`bg-gray-50 rounded-2xl p-4 space-y-2 transition-all duration-200 ${
                isAnimating ? 'opacity-70 scale-[0.99]' : 'opacity-100 scale-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Total Investment</span>
                <span className="font-bold text-gray-900 text-sm">
                  <CountUp to={investment} prefix="$" decimals={0} />
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Monthly Income Est.</span>
                <span className="font-bold text-emerald-600 text-sm">
                  +<CountUp to={monthlyReturn} prefix="$" decimals={2} />
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Annual Return</span>
                <span className="font-bold text-violet-600 text-sm">
                  +<CountUp to={annualReturn} prefix="$" decimals={0} />
                  <span className="text-gray-400 text-xs font-normal ml-1">({property.yield}%)</span>
                </span>
              </div>

              <div className="border-t border-gray-200 pt-2 mt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Ownership %</span>
                  <span className="font-bold text-gray-800 text-sm">
                    <CountUp to={ownershipPct} suffix="%" decimals={4} />
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Break-even Timeline</span>
                <span className="font-bold text-gray-800 text-sm">
                  ~{breakEvenYears} years ({breakEvenMonths} mo.)
                </span>
              </div>
            </div>

            {/* ─── Total Return Preview ─── */}
            <div className="bg-violet-50 rounded-xl p-3 flex items-center gap-3 border border-violet-100">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-violet-500 font-medium">5-Year Projected Return</p>
                <p className="text-sm font-bold text-violet-800">
                  ~{formatCurrency(investment * Math.pow(1 + property.totalReturn / 100, 5))}
                  <span className="text-violet-500 text-[11px] font-normal ml-1">({(property.totalReturn * 5).toFixed(0)}% gain)</span>
                </p>
              </div>
            </div>

            {/* ─── CTA ─── */}
            <Button
              onClick={() => setInvested(true)}
              disabled={property.status === 'Coming Soon'}
              className="w-full h-13 gradient-brand text-white border-0 font-bold text-sm shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {property.status === 'Coming Soon'
                ? '🔔 Join Waitlist'
                : `Invest ${formatCurrency(investment)} →`
              }
            </Button>

            <p className="text-center text-[10px] text-gray-400 leading-relaxed">
              SEC Qualified · Reg CF · Funds held in escrow until fully funded.
              <br />
              <span className="font-medium">Past performance does not guarantee future results.</span>
            </p>
          </>
        ) : (
          /* ─── Success State ─── */
          <div className="text-center py-3">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/35">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Investment Confirmed</p>
            <h3 className="font-bold text-gray-900 text-xl mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              You&apos;re now an owner
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              <span className="font-semibold text-violet-600">{formatCurrency(investment)}</span> invested in{' '}
              <span className="font-semibold">{property.name}</span>. First distribution expected within 30 days.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: 'Monthly', value: `$${monthlyReturn.toFixed(2)}`, sub: 'est. income' },
                { label: 'Annual', value: `$${annualReturn.toFixed(0)}`, sub: 'est. return' },
                { label: 'Ownership', value: `${ownershipPct.toFixed(4)}%`, sub: 'of property' },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">{m.label}</p>
                  <p className="text-sm font-bold text-gray-900">{m.value}</p>
                  <p className="text-[9px] text-gray-400">{m.sub}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full text-violet-600 border-violet-200 hover:bg-violet-50" asChild>
              <Link href="/dashboard">View in Dashboard →</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
