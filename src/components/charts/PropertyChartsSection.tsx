'use client';

import dynamic from 'next/dynamic';
import { MonthlyDataPoint } from '@/lib/mockChartData';

const IncomeChart      = dynamic(() => import('./IncomeChart'),      { ssr: false, loading: () => <div className="h-52 bg-gray-50 rounded-xl animate-pulse" /> });
const ValueGrowthChart = dynamic(() => import('./ValueGrowthChart'), { ssr: false, loading: () => <div className="h-44 bg-gray-50 rounded-xl animate-pulse" /> });

interface PropertyChartsSectionProps {
  data: MonthlyDataPoint[];
  purchasePrice: number;
}

export default function PropertyChartsSection({ data, purchasePrice }: PropertyChartsSectionProps) {
  return (
    <>
      <div>
        <h2 className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Income Over Time</h2>
        <p className="text-xs text-gray-400 mb-4">Monthly gross rent, expenses, and net income (last 12 months)</p>
        <div className="flex items-center gap-4 mb-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-1 rounded-full inline-block bg-violet-600" /> Gross Rent</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 rounded-full inline-block bg-emerald-500" /> Net Income</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 rounded-full inline-block bg-gray-400" /> Expenses</span>
        </div>
        <IncomeChart data={data} />
      </div>

      <div>
        <h2 className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Property Value Growth</h2>
        <p className="text-xs text-gray-400 mb-4">Projected value vs. purchase price over 12 months</p>
        <ValueGrowthChart data={data} purchasePrice={purchasePrice} />
      </div>
    </>
  );
}
