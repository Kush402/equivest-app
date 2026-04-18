'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ActivityEntry,
  generateActivity,
  getInitialActivities,
  formatTimeAgo,
} from '@/lib/activity';

interface LiveActivityFeedProps {
  refreshInterval?: number; // ms
  maxItems?: number;
  compact?: boolean;
  propertyId?: string; // filter to specific property
}

export default function LiveActivityFeed({
  refreshInterval = 7000,
  maxItems = 8,
  compact = false,
  propertyId,
}: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>(() =>
    getInitialActivities(maxItems)
  );
  const [newId, setNewId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inject new activity periodically
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = generateActivity();
      setNewId(next.id);
      setActivities(prev => [next, ...prev].slice(0, maxItems));
      // Clear highlight after animation
      setTimeout(() => setNewId(null), 1500);
    }, refreshInterval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [refreshInterval, maxItems]);

  // Tick seconds
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const shown = propertyId
    ? activities.filter(a => a.propertyId === propertyId || Math.random() > 0.5)
    : activities;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Live Activity</p>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">Updates every {refreshInterval / 1000}s</p>
      </div>

      {/* Feed */}
      <div className="divide-y divide-gray-50">
        {shown.map((activity, i) => (
          <div
            key={activity.id}
            className={`flex items-center gap-3 px-4 py-2.5 transition-all duration-500 ${
              activity.id === newId
                ? 'bg-violet-50/60 border-l-2 border-violet-400'
                : 'border-l-2 border-transparent'
            }`}
            style={{
              animation: activity.id === newId ? 'slideInActivity 0.4s ease-out' : undefined,
            }}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activity.avatarColor} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm`}>
              {activity.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-900 truncate">{activity.name}</span>
                {!compact && (
                  <span className="text-[10px] text-gray-400 hidden sm:inline">· {activity.location}</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-gray-500">invested in</span>
                <Link href={`/properties/${activity.propertyId}`} className="text-[10px] font-semibold text-violet-600 hover:text-violet-800 transition-colors truncate">
                  {activity.propertyName}
                </Link>
              </div>
            </div>

            {/* Amount + time */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-emerald-600">
                +${activity.amount.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400" key={tick}>
                {formatTimeAgo(activity.secondsAgo)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer pulse */}
      <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-50">
        <p className="text-[10px] text-gray-400 text-center">
          <span className="font-semibold text-violet-600">42,318</span> investors active today
        </p>
      </div>

      <style jsx>{`
        @keyframes slideInActivity {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
