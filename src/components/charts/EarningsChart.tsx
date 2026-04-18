'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart
} from 'recharts';
import { PortfolioDataPoint } from '@/lib/mockChartData';

interface EarningsChartProps {
  data: PortfolioDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-gray-900 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {entry.name === 'ROI' ? `${entry.value}%` : `$${entry.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function EarningsChart({ data }: EarningsChartProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="oklch(0.52 0.22 278)" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="oklch(0.52 0.22 278)" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="value"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `$${v.toLocaleString()}`}
            width={48}
          />
          <YAxis
            yAxisId="roi"
            orientation="right"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="value"
            type="monotone"
            dataKey="value"
            name="Portfolio Value"
            stroke="oklch(0.52 0.22 278)"
            strokeWidth={2.5}
            fill="url(#portfolioGrad)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            yAxisId="value"
            type="monotone"
            dataKey="invested"
            name="Invested"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            yAxisId="roi"
            type="monotone"
            dataKey="roi"
            name="ROI"
            stroke="oklch(0.65 0.18 148)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
