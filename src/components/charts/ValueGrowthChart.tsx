'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { MonthlyDataPoint } from '@/lib/mockChartData';
import { formatCurrency } from '@/lib/properties';

interface ValueGrowthChartProps {
  data: MonthlyDataPoint[];
  purchasePrice: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-gray-900 mb-1">{label}</p>
      <p className="text-violet-600 font-semibold">{formatCurrency(val)}</p>
    </div>
  );
};

export default function ValueGrowthChart({ data, purchasePrice }: ValueGrowthChartProps) {
  return (
    <div className="h-44 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={176}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="oklch(0.52 0.22 278)" stopOpacity={0.22}/>
              <stop offset="95%" stopColor="oklch(0.52 0.22 278)" stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `$${(v/1_000_000).toFixed(1)}M`}
            width={42}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={purchasePrice}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{ value: 'Purchase price', position: 'insideTopRight', fill: '#94a3b8', fontSize: 9 }}
          />
          <Area
            type="monotone"
            dataKey="propertyValue"
            name="Property Value"
            stroke="oklch(0.52 0.22 278)"
            strokeWidth={2.5}
            fill="url(#valueGrad)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
