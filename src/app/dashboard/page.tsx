'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/properties';
import { generatePortfolioHistory } from '@/lib/mockChartData';
import { EarningsChartClient as EarningsChart, AllocationChartClient as AllocationChart } from '@/components/charts/DashboardChartClients';

const holdings = [
  {
    id: 'highland-tower',
    name: 'Highland Tower',
    city: 'Boston, MA',
    image: '/images/prop1.png',
    tokens: 24,
    tokenPrice: 50,
    invested: 1200,
    currentValue: 1318,
    yield: 7.4,
    monthlyIncome: 7.40,
    totalEarned: 74.8,
    change: 9.8,
    type: 'Multifamily',
  },
  {
    id: 'azure-bay-residences',
    name: 'Azure Bay Residences',
    city: 'Miami, FL',
    image: '/images/prop2.png',
    tokens: 40,
    tokenPrice: 50,
    invested: 2000,
    currentValue: 2290,
    yield: 6.8,
    monthlyIncome: 11.34,
    totalEarned: 110.4,
    change: 14.5,
    type: 'Multifamily',
  },
  {
    id: 'centrepoint-plaza',
    name: 'Centrepoint Plaza',
    city: 'Chicago, IL',
    image: '/images/prop3.png',
    tokens: 16,
    tokenPrice: 50,
    invested: 800,
    currentValue: 880,
    yield: 8.1,
    monthlyIncome: 5.40,
    totalEarned: 43.2,
    change: 10.0,
    type: 'Mixed-Use',
  },
];

const activity = [
  { type: 'distribution', label: 'Rental Income — Azure Bay Residences',    amount: '+$11.34', date: 'Apr 15' },
  { type: 'distribution', label: 'Rental Income — Highland Tower',           amount: '+$7.40',  date: 'Apr 15' },
  { type: 'distribution', label: 'Rental Income — Centrepoint Plaza',        amount: '+$5.40',  date: 'Apr 15' },
  { type: 'purchase',     label: 'Purchased 16 tokens — Centrepoint Plaza',  amount: '-$800',   date: 'Mar 2'  },
  { type: 'purchase',     label: 'Purchased 40 tokens — Azure Bay',          amount: '-$2,000', date: 'Jan 14' },
  { type: 'purchase',     label: 'Purchased 24 tokens — Highland Tower',     amount: '-$1,200', date: 'Nov 1'  },
];

const totalInvested = holdings.reduce((a, h) => a + h.invested, 0);
const totalValue    = holdings.reduce((a, h) => a + h.currentValue, 0);
const totalEarned   = holdings.reduce((a, h) => a + h.totalEarned, 0);
const totalMonthly  = holdings.reduce((a, h) => a + h.monthlyIncome, 0);
const totalGain     = totalValue - totalInvested;
const gainPct       = ((totalGain / totalInvested) * 100).toFixed(1);

const ALLOCATION_SLICES = [
  { name: 'Azure Bay',       value: 51, amount: holdings[1].currentValue, color: 'oklch(0.52 0.22 278)' },
  { name: 'Highland Tower',  value: 29, amount: holdings[0].currentValue, color: 'oklch(0.65 0.18 148)' },
  { name: 'Centrepoint',     value: 20, amount: holdings[2].currentValue, color: 'oklch(0.65 0.2 45)'   },
];

// Withdraw mock flow states
type WithdrawStep = 'idle' | 'selecting' | 'confirm' | 'done';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'holdings' | 'earnings' | 'activity'>('holdings');
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>('idle');
  const [withdrawAmount, setWithdrawAmount] = useState(totalMonthly.toFixed(2));
  const portfolioHistory = generatePortfolioHistory(12);

  const hasHoldings = holdings.length > 0;

  return (
    <main className="min-h-screen bg-gray-50 pt-16">

      {/* ─── Header ─── */}
      <div className="gradient-hero py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, oklch(0.52 0.22 278), transparent)' }} />

        <div className="max-w-7xl mx-auto relative flex items-center justify-between">
          <div>
            <p className="text-white/40 text-sm mb-1 font-medium">Welcome back,</p>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Alex Johnson 👋
            </h1>
            <p className="text-white/40 text-xs mt-1">Last login: today at 9:41 AM</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setWithdrawStep('selecting')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm"
            >
              Withdraw Funds
            </Button>
            <Button className="gradient-brand text-white border-0 shadow-lg shadow-violet-500/30 hover:scale-[1.02] transition-all" asChild>
              <Link href="/marketplace" id="dashboard-invest-btn">+ Invest More</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Withdraw Flow ─── */}
      {withdrawStep !== 'idle' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setWithdrawStep('idle')}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            {withdrawStep === 'selecting' && (
              <>
                <h3 className="font-bold text-xl text-gray-900 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Withdraw Earnings</h3>
                <p className="text-xs text-gray-400 mb-5">Available balance: <span className="font-bold text-gray-700">{formatCurrency(parseFloat(totalEarned.toFixed(2)))}</span></p>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/40 mb-4"
                />
                <div className="flex gap-2 mb-4">
                  {['25%', '50%', '75%', '100%'].map(p => {
                    const pct = parseInt(p) / 100;
                    return (
                      <button key={p} onClick={() => setWithdrawAmount((totalEarned * pct).toFixed(2))}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-violet-100 hover:text-violet-700 transition-colors text-gray-600">
                        {p}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mb-4">Funds arrive in 1–3 business days via ACH transfer.</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setWithdrawStep('idle')}>Cancel</Button>
                  <Button className="flex-1 gradient-brand text-white border-0 shadow-md shadow-violet-500/25" onClick={() => setWithdrawStep('confirm')}>Review →</Button>
                </div>
              </>
            )}

            {withdrawStep === 'confirm' && (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Confirm Withdrawal</h3>
                <p className="text-xs text-gray-400 mb-5">Please review before submitting.</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-5">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold">${withdrawAmount}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Method</span><span className="font-bold">ACH · Chase ••••4821</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Arrival</span><span className="font-bold">1–3 business days</span></div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-2"><span className="text-gray-500">Fee</span><span className="font-bold text-emerald-600">$0.00</span></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setWithdrawStep('selecting')}>← Back</Button>
                  <Button className="flex-1 gradient-brand text-white border-0 shadow-md shadow-violet-500/25" onClick={() => setWithdrawStep('done')}>Confirm</Button>
                </div>
              </>
            )}

            {withdrawStep === 'done' && (
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Withdrawal Submitted!</h3>
                <p className="text-sm text-gray-500 mb-5">${withdrawAmount} will arrive in 1–3 business days to your Chase account ending in 4821.</p>
                <Button className="w-full gradient-brand text-white border-0" onClick={() => setWithdrawStep('idle')}>Done</Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── Summary Cards ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Portfolio Value',  value: formatCurrency(totalValue),   sub: `↑ ${gainPct}% all-time`,       subColor: 'text-emerald-400', icon: '💼', dark: true  },
            { label: 'Total Invested',   value: formatCurrency(totalInvested), sub: `${holdings.length} properties`, subColor: 'text-violet-200',  icon: '📈', dark: true  },
            { label: 'Total Earned',     value: formatCurrency(totalEarned),   sub: 'Lifetime distributions',        subColor: 'text-emerald-600', icon: '💰', dark: false },
            { label: 'Monthly Income',   value: formatCurrency(totalMonthly),  sub: 'Projected this month',          subColor: 'text-gray-400',    icon: '📅', dark: false },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl p-5 border shadow-sm ${card.dark ? 'gradient-brand border-violet-600' : 'bg-white border-gray-100'}`}>
              <div className="flex items-start justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${card.dark ? 'text-white/50' : 'text-gray-400'}`}>{card.label}</p>
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className={`text-2xl font-bold mb-1 ${card.dark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Syne, sans-serif' }}>
                {card.value}
              </p>
              <p className={`text-xs font-medium ${card.subColor}`}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ─── Main Grid ─── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Holdings/Earnings/Activity Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['holdings', 'earnings', 'activity'] as const).map(tab => (
                  <button
                    key={tab}
                    id={`dashboard-tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-wider capitalize transition-all border-b-2 ${
                      activeTab === tab
                        ? 'border-violet-600 text-violet-700 bg-violet-50/40'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Holdings */}
              {activeTab === 'holdings' && (
                <>
                  {hasHoldings ? (
                    <div className="divide-y divide-gray-50">
                      {holdings.map(h => (
                        <div key={h.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                            <Image src={h.image} alt={h.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link href={`/properties/${h.id}`} className="font-bold text-sm text-gray-900 hover:text-violet-700 transition-colors block truncate">
                                  {h.name}
                                </Link>
                                <p className="text-[10px] text-gray-400 font-medium">{h.city} · {h.tokens} tokens · {h.yield}% yield</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-gray-900 text-sm">{formatCurrency(h.currentValue)}</p>
                                <p className="text-[11px] text-emerald-500 font-bold">+{h.change}%</p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full gradient-brand rounded-full"
                                  style={{ width: `${Math.min((h.currentValue / 3000) * 100, 100)}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-gray-400 font-medium">${h.monthlyIncome.toFixed(2)}/mo</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-gray-50/50">
                        <Button variant="outline" size="sm" className="w-full border-violet-200 text-violet-600 hover:bg-violet-50 font-semibold" asChild>
                          <Link href="/marketplace">+ Add Property to Portfolio</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Empty state */
                    <div className="py-20 text-center px-6">
                      <div className="w-20 h-20 rounded-3xl gradient-brand flex items-center justify-center mx-auto mb-5 shadow-xl shadow-violet-500/30 opacity-60">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No investments yet</h3>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">Start building your real estate portfolio today. Invest in premium properties from $50.</p>
                      <Button className="gradient-brand text-white border-0 shadow-lg shadow-violet-500/25 hover:scale-[1.02] transition-all" asChild>
                        <Link href="/marketplace">Browse Properties →</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Earnings chart */}
              {activeTab === 'earnings' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5 font-medium">Portfolio performance (12 months)</p>
                      <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>{formatCurrency(totalValue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5 font-medium">ROI</p>
                      <p className="text-2xl font-bold text-emerald-600">+{gainPct}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded-full bg-violet-600" /> Portfolio Value</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded-full border-t-2 border-dashed border-gray-400" /> Invested</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded-full bg-emerald-500" /> ROI %</span>
                  </div>

                  <EarningsChart data={portfolioHistory} />

                  {/* Per-property breakdown */}
                  <div className="mt-6 space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly income by property</p>
                    {holdings.map(h => (
                      <div key={h.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                            <span className="font-semibold">{h.name}</span>
                            <span className="font-bold text-emerald-600">+${h.monthlyIncome.toFixed(2)}/mo</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full gradient-brand rounded-full transition-all duration-700" style={{ width: `${(h.monthlyIncome / totalMonthly) * 100}%` }} />
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 w-10 text-right font-medium">{((h.monthlyIncome / totalMonthly) * 100).toFixed(0)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity */}
              {activeTab === 'activity' && (
                <div className="divide-y divide-gray-50">
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                        a.type === 'distribution' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'
                      }`}>
                        {a.type === 'distribution' ? '💸' : '🏠'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{a.date}</p>
                      </div>
                      <p className={`text-sm font-bold flex-shrink-0 ${
                        a.type === 'distribution' ? 'text-emerald-600' : 'text-violet-600'
                      }`}>
                        {a.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 1/3 */}
          <div className="space-y-5">

            {/* Asset Allocation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Asset Allocation</h2>
              <AllocationChart slices={ALLOCATION_SLICES} />
              <div className="space-y-2 mt-3">
                {ALLOCATION_SLICES.map(slice => (
                  <div key={slice.name} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: slice.color }} />
                    <div className="flex-1 flex justify-between text-xs">
                      <span className="text-gray-600 font-medium">{slice.name}</span>
                      <span className="font-bold text-gray-900">{formatCurrency(slice.amount)}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium w-8 text-right">{slice.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance metrics */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>Performance</h2>
              {[
                { label: 'All-time gain',     value: formatCurrency(totalGain), color: 'text-emerald-600' },
                { label: 'Return %',          value: `+${gainPct}%`,            color: 'text-violet-600'  },
                { label: 'Avg. Yield',        value: '7.4%',                   color: 'text-gray-900'    },
                { label: 'Total Distributions', value: formatCurrency(totalEarned), color: 'text-gray-900' },
                { label: 'Properties',        value: `${holdings.length}`,     color: 'text-gray-900'    },
              ].map(m => (
                <div key={m.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Next distribution */}
            <div className="gradient-brand rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: 'white', transform: 'translate(20%, -20%)' }} />
              <div className="relative">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">Next Distribution</p>
                <p className="text-white text-3xl font-bold mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {formatCurrency(totalMonthly)}
                </p>
                <p className="text-white/50 text-xs mb-4">Estimated · May 15, 2025</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/70 rounded-full" style={{ width: '73%' }} />
                  </div>
                  <p className="text-white/50 text-[10px] font-medium">73% of month complete</p>
                </div>
                <button
                  onClick={() => setWithdrawStep('selecting')}
                  className="w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all"
                >
                  Withdraw earnings →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
