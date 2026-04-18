'use client';

import dynamic from 'next/dynamic';
import { PortfolioDataPoint } from '@/lib/mockChartData';

interface DashboardAllocationSlice {
  name: string;
  value: number;
  amount: number;
  color: string;
}

const EarningsChart   = dynamic(() => import('./EarningsChart'),   { ssr: false, loading: () => <div className="h-48 bg-gray-50 rounded-xl animate-pulse" /> });
const AllocationChart = dynamic(() => import('./AllocationChart'), { ssr: false, loading: () => <div className="h-52 bg-gray-50 rounded-xl animate-pulse" /> });

export function EarningsChartClient({ data }: { data: PortfolioDataPoint[] }) {
  return <EarningsChart data={data} />;
}

export function AllocationChartClient({ slices }: { slices: DashboardAllocationSlice[] }) {
  return <AllocationChart slices={slices} />;
}
