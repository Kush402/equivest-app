import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProperty, formatCurrency } from '@/lib/properties';
import InvestmentPanel from '@/components/InvestmentPanel';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import PropertyChartsSection from '@/components/charts/PropertyChartsSection';
import {
  generatePropertyFinancials,
  getFinancialBreakdown,
  getRiskProfile,
} from '@/lib/mockChartData';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = getProperty(id);
  if (!property) notFound();

  const chartData   = generatePropertyFinancials(property.monthlyRent, property.price, 12);
  const financials  = getFinancialBreakdown(property.monthlyRent, property.price);
  const riskProfile = getRiskProfile(property.occupancy, property.funded, property.yield, property.yearBuilt);

  const metrics = [
    { label: 'Annual Yield',  value: `${property.yield}%`,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Appreciation',  value: `${property.appreciation}%`, color: 'text-violet-600',  bg: 'bg-violet-50'  },
    { label: 'Total Return',  value: `${property.totalReturn}%`,  color: 'text-gray-900',    bg: 'bg-gray-50'    },
    { label: 'Occupancy',     value: `${property.occupancy}%`,    color: 'text-blue-600',    bg: 'bg-blue-50'    },
  ];

  const overviewDetails = [
    { label: 'Location',      value: `${property.city}, ${property.state}` },
    { label: 'Type',          value: property.type           },
    { label: 'Year Built',    value: property.yearBuilt      },
    { label: 'Square Footage',value: `${property.sqft.toLocaleString()} sq ft` },
    ...(property.beds ? [{ label: 'Total Units', value: property.beds }] : []),
    { label: 'Occupancy',     value: `${property.occupancy}%` },
    { label: 'Hold Period',   value: property.holdPeriod     },
    { label: 'Min. Investment', value: formatCurrency(property.minInvestment) },
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-16">

      {/* ─── Hero ─── */}
      <div className="relative h-80 md:h-[420px] w-full overflow-hidden">
        <Image src={property.image} alt={property.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute top-4 left-4">
          <a href="/marketplace" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors border border-white/20 bg-black/30 backdrop-blur-md hover:bg-black/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Marketplace
          </a>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  property.status === 'Funded'   ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  property.status === 'Funding'  ? 'bg-violet-100 text-violet-700 border-violet-200' :
                                                   'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {property.status}
                </span>
                <span className="text-white/50 text-xs">{property.type}</span>
                {/* Risk badge inline */}
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${riskProfile.bgColor} ${riskProfile.color}`}>
                  {riskProfile.level} Risk
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                {property.name}
              </h1>
              <p className="text-white/60 mt-1.5 flex items-center gap-1 text-sm">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C5.2 0 3 2.2 3 5c0 4.3 5 11 5 11s5-6.7 5-11c0-2.8-2.2-5-5-5zm0 7.5C6.6 7.5 5.5 6.4 5.5 5S6.6 2.5 8 2.5 10.5 3.6 10.5 5 9.4 7.5 8 7.5z"/>
                </svg>
                {property.city}, {property.state}
              </p>
            </div>
            <div className="hidden md:block text-right flex-shrink-0">
              <p className="text-white/50 text-xs mb-1">Property Value</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(property.price)}</p>
              <p className="text-white/40 text-xs">{formatCurrency(property.tokenPrice)} / token</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: Info column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Metric pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metrics.map(m => (
                <div key={m.label} className={`${m.bg} rounded-2xl p-4 text-center`}>
                  <p className={`text-2xl font-bold ${m.color}`} style={{ fontFamily: 'Inter, sans-serif' }}>{m.value}</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Funding progress */}
            {property.status !== 'Coming Soon' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Funding Progress</p>
                    <p className="text-xs text-gray-400">{property.investors.toLocaleString()} investors committed</p>
                  </div>
                  <p className="text-3xl font-bold text-violet-600" style={{ fontFamily: 'Inter, sans-serif' }}>{property.funded}%</p>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${
                      property.funded >= 85 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'gradient-brand'
                    }`}
                    style={{ width: `${property.funded}%` }}
                  >
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                      animation: 'shimmerSlide 2s infinite',
                    }} />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                  <span>{formatCurrency(property.price * property.funded / 100, true)} raised</span>
                  <span>{formatCurrency(property.price, true)} goal</span>
                </div>
              </div>
            )}

            {/* ─── Deep Tabs ─── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full rounded-none border-b border-gray-100 bg-gray-50/50 h-12 p-0 flex">
                  {['overview', 'financials', 'charts', 'highlights'].map(tab => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="flex-1 h-full rounded-none text-[11px] font-bold capitalize border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:text-violet-700 data-[state=active]:bg-white transition-all"
                    >
                      {tab === 'charts' ? '📊 Charts' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="p-6">
                  <h2 className="font-bold text-gray-900 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>About this property</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{property.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    {overviewDetails.map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 mb-0.5 font-medium">{item.label}</p>
                        <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Risk indicator */}
                  <div className={`mt-5 rounded-2xl border p-4 ${riskProfile.bgColor}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-1.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-full ${
                                i < Math.round(riskProfile.score / 2)
                                  ? riskProfile.level === 'Low'    ? 'bg-emerald-500'
                                  : riskProfile.level === 'Medium' ? 'bg-amber-500'
                                  : 'bg-red-500'
                                  : 'bg-gray-200'
                              }`}
                              style={{ width: 20 }}
                            />
                          ))}
                          <span className={`text-xs font-bold ml-2 ${riskProfile.color}`}>{riskProfile.level} Risk</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{riskProfile.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {riskProfile.factors.map(f => (
                        <span key={f.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          f.positive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200'
                        }`}>
                          {f.positive ? '✓' : '!'} {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Financials — full breakdown */}
                <TabsContent value="financials" className="p-6">
                  <h2 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Financial Breakdown</h2>

                  {/* Annual P&L */}
                  <div className="space-y-1 mb-6">
                    <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Gross Rent (annual)</p>
                        <p className="text-[10px] text-gray-400">Before vacancies or deductions</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(financials.grossRent)}</p>
                    </div>
                    {[
                      { label: 'Vacancy Allowance (4%)', sub: 'Conservative estimate', value: -financials.vacancy },
                      { label: 'Property Management (8%)', sub: 'Institutional manager fee', value: -financials.managementFee },
                      { label: 'Maintenance & CapEx (12%)', sub: 'Reserves + ongoing repairs', value: -financials.maintenance },
                      { label: 'Insurance (4%)', sub: 'Property & liability', value: -financials.insurance },
                      { label: 'Property Taxes (10%)', sub: 'Local jurisdiction rate', value: -financials.taxes },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-gray-50">
                        <div>
                          <p className="text-sm text-gray-700">{item.label}</p>
                          <p className="text-[10px] text-gray-400">{item.sub}</p>
                        </div>
                        <p className="text-sm font-semibold text-red-500">−{formatCurrency(Math.abs(item.value))}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-3 bg-emerald-50 px-3 rounded-xl mt-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">Net Operating Income</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Cap Rate: {financials.capRate}%</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(financials.netOperatingIncome)}</p>
                    </div>
                  </div>

                  {/* Return breakdown bars */}
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Return Components</p>
                    {[
                      { label: 'Rental Yield',    value: property.yield,          max: 15, color: 'bg-emerald-500' },
                      { label: 'Appreciation',    value: property.appreciation,   max: 15, color: 'bg-violet-500'  },
                      { label: 'Total Return',    value: property.totalReturn,    max: 20, color: 'gradient-brand'  },
                    ].map(item => (
                      <div key={item.label} className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                          <span className="font-medium">{item.label}</span>
                          <span className="font-bold">{item.value}% / yr</span>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all duration-700`}
                            style={{ width: `${(item.value / item.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Charts */}
                <TabsContent value="charts" className="p-6 space-y-6">
                  <PropertyChartsSection data={chartData} purchasePrice={property.price} />
                </TabsContent>

                {/* Highlights */}
                <TabsContent value="highlights" className="p-6">
                  <h2 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Property Highlights</h2>
                  <ul className="space-y-3">
                    {property.highlights.map(h => (
                      <li key={h} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-violet-500/20">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>

            {/* AI Insights */}
            <AIInsightsPanel property={property} />

            {/* Live Activity */}
            <LiveActivityFeed propertyId={property.id} refreshInterval={8000} />
          </div>

          {/* ── Right: Sticky panel ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <InvestmentPanel property={property} />

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: '🔒', label: 'SEC Qualified' },
                  { icon: '🏛️', label: 'Reg CF' },
                  { icon: '⚡', label: 'Instant' },
                ].map(b => (
                  <div key={b.label} className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                    <p className="text-lg mb-0.5">{b.icon}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{b.label}</p>
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
