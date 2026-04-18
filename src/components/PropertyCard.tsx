import Image from 'next/image';
import Link from 'next/link';
import { Property, formatCurrency } from '@/lib/properties';

interface PropertyCardProps {
  property: Property;
}

const STATUS_STYLES: Record<Property['status'], string> = {
  'Funding':     'bg-violet-100 text-violet-700 border-violet-200',
  'Funded':      'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Coming Soon': 'bg-amber-100 text-amber-700 border-amber-200',
};

function getTags(property: Property): { label: string; style: string }[] {
  const tags: { label: string; style: string }[] = [];
  if (property.funded >= 85) tags.push({ label: '🔥 Almost Sold Out', style: 'bg-red-100 text-red-700 border-red-200' });
  if (property.yield >= 8.5) tags.push({ label: '⚡ High Yield', style: 'bg-amber-100 text-amber-700 border-amber-200' });
  if (property.investors >= 400 && property.funded < 100) tags.push({ label: '📈 Trending', style: 'bg-blue-100 text-blue-700 border-blue-200' });
  if (property.totalReturn >= 14) tags.push({ label: '🏆 Top Return', style: 'bg-violet-100 text-violet-700 border-violet-200' });
  return tags.slice(0, 2);
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const tags = getTags(property);
  const MARKET_AVG = 5.2;
  const yieldAdv = (property.yield - MARKET_AVG).toFixed(1);

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 hover:border-violet-100">

        {/* ─── Image ─── */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={property.image}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          {/* Status */}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[property.status]}`}>
              {property.status}
            </span>
          </div>

          {/* Yield badge */}
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20">
              {property.yield}% yield
            </span>
          </div>

          {/* ─── Hover overlay: Quick stats ─── */}
          <div className="absolute inset-0 bg-violet-900/85 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3 px-6 w-full">
              {[
                { label: 'Total Return', value: `${property.totalReturn}%` },
                { label: 'Occupancy', value: `${property.occupancy}%` },
                { label: 'Sq Footage', value: `${(property.sqft / 1000).toFixed(0)}k sqft` },
                { label: 'Built', value: property.yearBuilt },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">{s.label}</p>
                  <p className="text-white font-bold text-sm">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C5.2 0 3 2.2 3 5c0 4.3 5 11 5 11s5-6.7 5-11c0-2.8-2.2-5-5-5zm0 7.5C6.6 7.5 5.5 6.4 5.5 5S6.6 2.5 8 2.5 10.5 3.6 10.5 5 9.4 7.5 8 7.5z"/>
            </svg>
            {property.city}, {property.state}
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="p-4">
          {/* Title + value */}
          <div className="flex items-start justify-between mb-2 gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-[15px] leading-tight group-hover:text-violet-700 transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                {property.name}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{property.type}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-gray-400">Value</p>
              <p className="font-bold text-gray-900 text-sm">{formatCurrency(property.price, true)}</p>
            </div>
          </div>

          {/* Dynamic tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map(t => (
                <span key={t.label} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${t.style}`}>
                  {t.label}
                </span>
              ))}
            </div>
          )}

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="text-center">
              <p className="text-[9px] text-gray-400 mb-0.5">Yield</p>
              <p className="text-sm font-bold text-emerald-600">{property.yield}%</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-[9px] text-gray-400 mb-0.5">Appreciation</p>
              <p className="text-sm font-bold text-violet-600">{property.appreciation}%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-400 mb-0.5">Total</p>
              <p className="text-sm font-bold text-gray-900">{property.totalReturn}%</p>
            </div>
          </div>

          {/* vs market comparison */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              +{yieldAdv}% vs market avg
            </span>
          </div>

          {/* Funding bar */}
          {property.status !== 'Coming Soon' && (
            <div className="mb-3">
              <div className="flex justify-between text-[9px] text-gray-400 mb-1 font-medium">
                <span>{property.funded}% funded</span>
                <span>{property.investors.toLocaleString()} investors</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    property.funded >= 85
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'gradient-brand'
                  }`}
                  style={{ width: `${Math.min(property.funded, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-gray-400">Min. investment</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(property.minInvestment)}</p>
            </div>
            <div className="flex items-center gap-1 text-violet-600 text-xs font-bold group-hover:gap-2 transition-all duration-200">
              View deal
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
