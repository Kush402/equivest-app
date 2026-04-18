'use client';

import { useState, useMemo } from 'react';
import PropertyCard from '@/components/PropertyCard';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import { properties } from '@/lib/properties';
import { Input } from '@/components/ui/input';

const TYPES    = ['All', 'Multifamily', 'Commercial', 'Mixed-Use', 'Single Family'];
const STATUSES = ['All', 'Funding', 'Funded', 'Coming Soon'];
const SORT_OPTIONS = [
  { value: 'yield-desc',   label: '⚡ Highest Yield'   },
  { value: 'return-desc',  label: '📈 Highest Return'   },
  { value: 'funded-desc',  label: '🔥 Most Funded'      },
  { value: 'funded-asc',   label: '🌱 Least Funded'     },
  { value: 'price-asc',    label: '💰 Price: Low → High' },
  { value: 'price-desc',   label: '💎 Price: High → Low' },
];

const STATS = [
  { value: '$284M+', label: 'Total Funded' },
  { value: '8.4%',   label: 'Avg Yield'   },
  { value: '42K+',   label: 'Investors'   },
  { value: '99.3%',  label: 'On-Time'     },
];

export default function MarketplacePage() {
  const [search,         setSearch]         = useState('');
  const [selectedType,   setSelectedType]   = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy,         setSortBy]         = useState('yield-desc');
  const [minYield,       setMinYield]       = useState(0);

  const filtered = useMemo(() => {
    let list = [...properties];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
      );
    }
    if (selectedType   !== 'All') list = list.filter(p => p.type   === selectedType);
    if (selectedStatus !== 'All') list = list.filter(p => p.status === selectedStatus);
    if (minYield > 0)             list = list.filter(p => p.yield  >= minYield);

    switch (sortBy) {
      case 'yield-desc':  list.sort((a, b) => b.yield     - a.yield);     break;
      case 'return-desc': list.sort((a, b) => b.totalReturn - a.totalReturn); break;
      case 'funded-desc': list.sort((a, b) => b.funded    - a.funded);    break;
      case 'funded-asc':  list.sort((a, b) => a.funded    - b.funded);    break;
      case 'price-asc':   list.sort((a, b) => a.price     - b.price);     break;
      case 'price-desc':  list.sort((a, b) => b.price     - a.price);     break;
    }
    return list;
  }, [search, selectedType, selectedStatus, sortBy, minYield]);

  const hasFilters = search || selectedType !== 'All' || selectedStatus !== 'All' || minYield > 0;

  return (
    <main className="min-h-screen bg-gray-50 pt-16">

      {/* ─── Hero ─── */}
      <div className="gradient-hero py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background:'radial-gradient(circle, oklch(0.52 0.22 278), transparent)' }} />

        <div className="max-w-7xl mx-auto relative">
          <p className="text-violet-400 text-xs font-bold mb-2 tracking-widest uppercase">Marketplace</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Browse Investment Properties
          </h1>
          <p className="text-white/40 max-w-xl mb-6 text-sm">
            {properties.length} properties. Start investing from $50 — no minimums, no lockups.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 mb-6">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-white text-lg font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>{s.value}</p>
                <p className="text-white/40 text-[10px] font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-lg relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 21l-5.2-5.2M15.5 10a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Input
              id="marketplace-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by city, state, or property name…"
              className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-violet-400 focus:bg-white/15 transition-all rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ─── Filters ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 mb-8 shadow-sm">
          <div className="flex flex-wrap items-start gap-5">
            {/* Type */}
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">Property Type</p>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(type => (
                  <button
                    key={type}
                    id={`filter-type-${type.toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedType === type
                        ? 'gradient-brand text-white shadow-sm shadow-violet-500/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    id={`filter-status-${s.toLowerCase().replace(/\s/g, '-')}`}
                    onClick={() => setSelectedStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedStatus === s
                        ? 'gradient-brand text-white shadow-sm shadow-violet-500/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Min yield slider */}
            <div className="min-w-[180px]">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                Min Yield: <span className="text-violet-600">{minYield}%</span>
              </p>
              <input
                id="filter-yield-range"
                type="range" min={0} max={10} step={0.5} value={minYield}
                onChange={e => setMinYield(+e.target.value)}
                className="w-full accent-violet-600 cursor-pointer h-1.5"
              />
              <div className="flex justify-between text-[9px] text-gray-300 mt-1">
                <span>0%</span><span>10%</span>
              </div>
            </div>

            {/* Sort */}
            <div className="min-w-[200px] ml-auto">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-2">Sort by</p>
              <select
                id="marketplace-sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── Two-column: Grid + Sidebar ─── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{filtered.length}</span> {filtered.length === 1 ? 'property' : 'properties'} found
              </p>
              {hasFilters && (
                <button
                  onClick={() => { setSearch(''); setSelectedType('All'); setSelectedStatus('All'); setMinYield(0); }}
                  className="text-xs text-violet-600 hover:text-violet-800 font-bold flex items-center gap-1.5 transition-colors"
                  id="reset-filters-btn"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                  Clear filters
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {filtered.map(prop => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21 21l-5.2-5.2M15.5 10a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-gray-500 font-bold">No properties match your filters</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your criteria or clearing filters</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              <LiveActivityFeed refreshInterval={7000} maxItems={10} compact />

              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Market Snapshot</p>
                {[
                  { label: 'Avg Deal Size',  value: '$5.9M'  },
                  { label: 'Avg Yield',      value: '7.4%'   },
                  { label: 'Avg Funded',     value: '68%'    },
                  { label: 'Deals Closed YTD', value: '14'  },
                ].map(m => (
                  <div key={m.label} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{m.label}</span>
                    <span className="font-bold text-gray-900">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
