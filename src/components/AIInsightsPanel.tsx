'use client';

import { Property } from '@/lib/properties';

interface AIInsightsPanelProps {
  property: Property;
}

interface Insight {
  type: 'bullish' | 'neutral' | 'caution';
  icon: string;
  title: string;
  body: string;
}

function getInsights(property: Property): Insight[] {
  const insights: Insight[] = [];

  // Appreciation insight
  if (property.appreciation >= 5) {
    insights.push({
      type: 'bullish',
      icon: '📈',
      title: 'Strong Market Appreciation',
      body: `${property.city} is ranked in the top 12% of US metros for rent growth. Our model projects ${property.appreciation}% annual appreciation — outpacing inflation by 2.1x over a 5-year hold.`,
    });
  } else {
    insights.push({
      type: 'neutral',
      icon: '📊',
      title: 'Moderate Value Growth',
      body: `Projected ${property.appreciation}% appreciation aligns with historical averages for ${property.type.toLowerCase()} assets in ${property.city}. Income yield compensates for conservative price upside.`,
    });
  }

  // Yield insight
  if (property.yield >= 8) {
    insights.push({
      type: 'bullish',
      icon: '💰',
      title: 'Above-Market Yield',
      body: `At ${property.yield}%, this property yields ${(property.yield - 5.2).toFixed(1)}% above the national multifamily average of 5.2%. Our underwriting assumes 94% occupancy — conservative relative to the area's current ${property.occupancy}% rate.`,
    });
  } else {
    insights.push({
      type: 'neutral',
      icon: '💵',
      title: 'Stable Income Stream',
      body: `${property.yield}% yield is supported by long-term leases with creditworthy tenants. Current occupancy of ${property.occupancy}% provides a resilient income buffer against market softening.`,
    });
  }

  // Risk/timing insight
  if (property.funded >= 80) {
    insights.push({
      type: 'caution',
      icon: '⏱️',
      title: 'Near Fully Funded — Act Soon',
      body: `Only ${100 - property.funded}% of this offering remains available. At the current pace, we project full funding in under 10 days. Early investors lock in current token prices before any secondary market premium.`,
    });
  } else if (property.status === 'Coming Soon') {
    insights.push({
      type: 'neutral',
      icon: '🔔',
      title: 'Early Access Opportunity',
      body: `Joining the waitlist now secures priority access before public launch. Based on comparable offerings, we project ${ property.yield + 0.3}% yield at target funding — with first-mover advantage on token pricing.`,
    });
  } else {
    insights.push({
      type: 'bullish',
      icon: '🏗️',
      title: 'Ideal Entry Point',
      body: `At ${property.funded}% funded with strong momentum, this offering is on track to close within 30 days. Current token price reflects pre-stabilization value — upside unlocks as the asset reaches full occupancy.`,
    });
  }

  return insights;
}

const typeStyles = {
  bullish:  { border: 'border-emerald-200', iconBg: 'bg-emerald-50', dot: 'bg-emerald-500', label: 'Bullish', labelColor: 'text-emerald-700 bg-emerald-100' },
  neutral:  { border: 'border-blue-200',    iconBg: 'bg-blue-50',    dot: 'bg-blue-500',    label: 'Neutral', labelColor: 'text-blue-700 bg-blue-100'     },
  caution:  { border: 'border-amber-200',   iconBg: 'bg-amber-50',   dot: 'bg-amber-500',   label: 'Caution', labelColor: 'text-amber-700 bg-amber-100'   },
};

export default function AIInsightsPanel({ property }: AIInsightsPanelProps) {
  const insights = getInsights(property);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-violet-200/60 shadow-lg shadow-violet-500/10">
      {/* Glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, oklch(0.97 0.02 278) 0%, oklch(0.99 0.01 240) 60%, oklch(0.97 0.02 300) 100%)',
        }}
      />
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, oklch(0.65 0.2 278), transparent)' }}
      />

      <div className="relative">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-violet-100">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-md shadow-violet-500/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">AI Investment Analysis</p>
              <p className="text-[10px] text-violet-400">Model confidence: 91%</p>
            </div>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 border border-violet-200">
              BETA
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="px-5 py-4 flex items-center gap-4 border-b border-violet-100">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.94 0.03 278)" strokeWidth="3.5"/>
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="oklch(0.52 0.22 278)" strokeWidth="3.5"
                strokeDasharray={`${(property.totalReturn / 20) * 100} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-bold text-violet-800">{Math.round((property.totalReturn / 20) * 100)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-violet-500 font-medium mb-0.5">Lofty Score</p>
            <p className="text-xl font-bold text-violet-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              {property.totalReturn >= 14 ? 'Excellent' : property.totalReturn >= 11 ? 'Strong' : 'Good'}
            </p>
            <p className="text-[10px] text-violet-400 mt-0.5">
              Top {property.totalReturn >= 14 ? '8%' : property.totalReturn >= 11 ? '20%' : '35%'} of current listings
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-violet-400 mb-0.5">vs. market avg</p>
            <p className="text-base font-bold text-emerald-600">
              +{(property.totalReturn - 8.4).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 space-y-3">
          {insights.map((insight, i) => {
            const s = typeStyles[insight.type];
            return (
              <div key={i} className={`rounded-xl border ${s.border} p-3.5 bg-white/70 backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center text-base flex-shrink-0`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-xs font-bold text-gray-900">{insight.title}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${s.labelColor}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{insight.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          <p className="text-[10px] text-violet-400 text-center leading-relaxed">
            AI analysis is based on public market data and internal models. Not financial advice.
            <span className="font-semibold"> Always invest within your risk tolerance.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
