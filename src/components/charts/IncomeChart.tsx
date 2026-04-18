'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { MonthlyDataPoint } from '@/lib/mockChartData';

interface IncomeChartProps {
  data: MonthlyDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-gray-900 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-500 capitalize">{entry.name}:</span>
          <span className="font-semibold text-gray-900">${entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function IncomeChart({ data }: IncomeChartProps) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="oklch(0.52 0.22 278)" stopOpacity={0.18}/>
              <stop offset="95%" stopColor="oklch(0.52 0.22 278)" stopOpacity={0.01}/>
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="oklch(0.72 0.14 148)" stopOpacity={0.18}/>
              <stop offset="95%" stopColor="oklch(0.72 0.14 148)" stopOpacity={0.01}/>
            </linearGradient>
            <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="oklch(0.58 0.2 200)" stopOpacity={0.18}/>
              <stop offset="95%" stopColor="oklch(0.58 0.2 200)" stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="income"    name="Gross Rent"  stroke="oklch(0.52 0.22 278)" strokeWidth={2} fill="url(#incomeGrad)"  dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          <Area type="monotone" dataKey="expenses"  name="Expenses"    stroke="oklch(0.72 0.14 148)" strokeWidth={2} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          <Area type="monotone" dataKey="netIncome" name="Net Income"  stroke="oklch(0.58 0.2 200)"  strokeWidth={2} fill="url(#netGrad)"     dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
