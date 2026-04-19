'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/properties';
import { generatePortfolioHistory } from '@/lib/mockChartData';
import { EarningsChartClient as EarningsChart, AllocationChartClient as AllocationChart } from '@/components/charts/DashboardChartClients';
import { useOnboardingComplete, type OnboardingProfile } from '@/components/OnboardingModal';
import DashboardTour from '@/components/DashboardTour';
import LoftyAISetupWidget from '@/components/LoftyAISetupWidget';
import LeadChatWidget from '@/components/LeadChatWidget';

const WIDGETS_KEY  = 'lofty_widgets_v1';
const TOUR_DONE_KEY = 'lofty_tour_complete_v1';

type WidgetId =
  | 'portfolio-stats'
  | 'new-updates'
  | 'today-new-investments'
  | 'todays-opportunities'
  | 'need-keep-in-touch'
  | 'transactions'
  | 'todays-tasks'
  | 'appointments'
  | 'my-listings'
  | 'hot-sheets'
  | 'market-pulse'
  | 'ai-recommendations';

const WIDGET_META: Record<WidgetId, { title: string; description: string }> = {
  'portfolio-stats':        { title: 'Portfolio Overview',        description: 'Total invested, current value, earnings, and monthly income at a glance' },
  'new-updates':            { title: 'New Updates',               description: 'Platform news, announcements, and sponsored listings' },
  'today-new-investments':  { title: "Today's New Investments",   description: 'Your holdings and recent token purchases' },
  'todays-opportunities':   { title: "Today's Opportunities",     description: 'High-yield and top-gaining properties' },
  'need-keep-in-touch':     { title: 'Need Keep In Touch',        description: 'Upcoming distributions and follow-up reminders' },
  'transactions':           { title: 'Transactions',              description: 'Recent purchases and rental income activity' },
  'todays-tasks':           { title: "Today's Tasks",             description: 'Quick actions: invest, withdraw, browse, refer' },
  'appointments':           { title: 'Appointments',              description: 'AI-optimized showing schedules and proactive lead outreach.' },
  'my-listings':            { title: 'My Holdings',               description: 'All your tokenized property investments' },
  'hot-sheets':             { title: 'Hot Sheets',                description: 'Market-wide: new listings, price reductions, high yields' },
  'market-pulse':           { title: 'Market Pulse',              description: 'Live platform metrics: listings, average yield, AUM, trending cities' },
  'ai-recommendations':     { title: 'AI Recommendations',        description: 'Personalized property picks based on your portfolio and goals' },
};

const ALWAYS_ON: WidgetId[] = [
  'portfolio-stats', 'new-updates', 'transactions', 'my-listings',
  'todays-tasks', 'market-pulse', 'ai-recommendations',
];

function deriveDefaultWidgets(profile: OnboardingProfile | null): WidgetId[] {
  const ids = new Set<WidgetId>(ALWAYS_ON);
  if (!profile) return [...ids];

  ids.add('today-new-investments');

  if (['close-more-deals', 'manage-leads'].includes(profile.primaryGoal)) {
    ids.add('todays-opportunities');
    ids.add('hot-sheets');
  }
  if (['grow-team', 'scale-business', 'better-marketing'].includes(profile.primaryGoal)) {
    ids.add('todays-opportunities');
    ids.add('hot-sheets');
    ids.add('need-keep-in-touch');
  }
  if (profile.wantsShowingScheduler) ids.add('appointments');
  if (profile.wantsAIInsights) {
    ids.add('todays-opportunities');
    ids.add('need-keep-in-touch');
  }
  if (profile.wantsLeadScoring) ids.add('todays-opportunities');

  return [...ids];
}

const holdings = [
  {
    id: 'highland-tower',
    name: 'Highland Tower',
    city: 'Boston, MA',
    image: '/images/prop1.png',
    tokens: 24,
    tokenPrice: 50,
    invested: 1200,
    currentValue: 1318,
    yield: 7.4,
    monthlyIncome: 7.40,
    totalEarned: 74.8,
    change: 9.8,
    type: 'Multifamily',
  },
  {
    id: 'azure-bay-residences',
    name: 'Azure Bay Residences',
    city: 'Miami, FL',
    image: '/images/prop2.png',
    tokens: 40,
    tokenPrice: 50,
    invested: 2000,
    currentValue: 2290,
    yield: 6.8,
    monthlyIncome: 11.34,
    totalEarned: 110.4,
    change: 14.5,
    type: 'Multifamily',
  },
  {
    id: 'centrepoint-plaza',
    name: 'Centrepoint Plaza',
    city: 'Chicago, IL',
    image: '/images/prop3.png',
    tokens: 16,
    tokenPrice: 50,
    invested: 800,
    currentValue: 880,
    yield: 8.1,
    monthlyIncome: 5.40,
    totalEarned: 43.2,
    change: 10.0,
    type: 'Mixed-Use',
  },
];

const activity = [
  { type: 'distribution', label: 'Rental Income — Azure Bay Residences',    amount: '+$11.34', date: 'Apr 15' },
  { type: 'distribution', label: 'Rental Income — Highland Tower',           amount: '+$7.40',  date: 'Apr 15' },
  { type: 'distribution', label: 'Rental Income — Centrepoint Plaza',        amount: '+$5.40',  date: 'Apr 15' },
  { type: 'purchase',     label: 'Purchased 16 tokens — Centrepoint Plaza',  amount: '-$800',   date: 'Mar 2'  },
  { type: 'purchase',     label: 'Purchased 40 tokens — Azure Bay',          amount: '-$2,000', date: 'Jan 14' },
  { type: 'purchase',     label: 'Purchased 24 tokens — Highland Tower',     amount: '-$1,200', date: 'Nov 1'  },
];

const hotSheets = [
  { label: 'New Listings',        count: '27,309 Listings', updates: '4,677 Updates' },
  { label: 'Price Reduced',       count: '43,952 Listings', updates: '2,766 Updates' },
  { label: 'Upcoming Open House', count: '7,437 Listings',  updates: '1,981 Updates' },
  { label: 'High Yield (7%+)',    count: '6,332 Listings',  updates: '1,690 Updates' },
  { label: 'Newly Tokenized',     count: '3,527 Listings',  updates: '918 Updates'   },
  { label: 'Back on Market',      count: '0 Listing',       updates: ''              },
];

const announcements = [
  { title: 'Q2 Distribution Scheduled',   body: 'Rental income payouts post May 15. Review your breakdown.' },
  { title: 'New Property Live',           body: 'Marina View Lofts (San Diego) is now open for investment.' },
];

const newUpdates = [
  { title: 'Lofty Real Estate Service', tag: 'Sponsored',
    body: '🏡 NEW LISTING — NOW AVAILABLE! Be the first to invest in 1133 W 9th St, Cleveland, OH.' },
];

const aiClusteredShowings = [
  {
    time: '1:00 PM',
    lead: 'Sarah Jenkins',
    property: 'Azure Bay Residences',
    address: '4821 E Camelback Rd, Phoenix AZ 85251',
    intent: 'Hot',
    reason: 'Viewed listing 4 times in 24h, requested showing',
    consent_status: 'opted_in',
  },
  {
    time: '1:45 PM',
    lead: 'Marcus Chen',
    property: 'Marina View Lofts',
    address: '5102 E Camelback Rd, Phoenix AZ 85018',
    intent: 'Warm',
    reason: 'Geographic overlap (0.8 mi from previous stop)',
    consent_status: 'opted_in',
  },
  {
    time: '2:30 PM',
    lead: 'David & Emma Torres',
    property: 'Highland Tower',
    address: '3850 E Camelback Rd, Phoenix AZ 85018',
    intent: 'Hot',
    reason: 'Pre-approved buyer, lease ending in 3 weeks',
    consent_status: 'pending',
  },
];

const totalInvested = holdings.reduce((a, h) => a + h.invested, 0);
const totalValue    = holdings.reduce((a, h) => a + h.currentValue, 0);
const totalEarned   = holdings.reduce((a, h) => a + h.totalEarned, 0);
const totalMonthly  = holdings.reduce((a, h) => a + h.monthlyIncome, 0);
const totalGain     = totalValue - totalInvested;
const gainPct       = ((totalGain / totalInvested) * 100).toFixed(1);

const ALLOCATION_SLICES = [
  { name: 'Azure Bay',       value: 51, amount: holdings[1].currentValue, color: 'oklch(0.52 0.22 278)' },
  { name: 'Highland Tower',  value: 29, amount: holdings[0].currentValue, color: 'oklch(0.65 0.18 148)' },
  { name: 'Centrepoint',     value: 20, amount: holdings[2].currentValue, color: 'oklch(0.65 0.2 45)'   },
];

type WithdrawStep = 'idle' | 'selecting' | 'confirm' | 'done';

/* Lofty-style empty state illustration (re-used across cards) */
function EmptyIllustration({ label = 'Nothing on your to-do list yet — Enjoy your day!' }: { label?: string }) {
  return (
    <div className="py-6 flex flex-col items-center justify-center">
      <svg width="120" height="90" viewBox="0 0 200 150" fill="none" className="opacity-80">
        <ellipse cx="100" cy="130" rx="70" ry="6" fill="#EEF2F6" />
        <path d="M40 45 Q55 30 75 40 Q90 25 110 35 Q130 30 145 45 Z" fill="#F1F4F8" />
        <rect x="70" y="70" width="50" height="50" fill="#E8ECF2" />
        <path d="M70 70 L95 55 L120 70 Z" fill="#D9DEE8" />
        <rect x="85" y="90" width="12" height="20" fill="#FFFFFF" />
        <circle cx="60" cy="95" r="10" fill="#D9DEE8" />
        <path d="M55 95 L60 90 L65 95 L65 105 L55 105 Z" fill="#C8CFDB" />
      </svg>
      <p className="text-[11px] text-gray-400 mt-1 text-center max-w-[220px]">{label}</p>
    </div>
  );
}

/* Small icon-only header buttons seen in Lofty cards (help + gear) */
function CardToolIcons({ showGear = false }: { showGear?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-gray-300">
      <button className="hover:text-gray-500 transition-colors" aria-label="Help">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" />
          <path d="M12 17h.01" strokeLinecap="round" />
        </svg>
      </button>
      {showGear && (
        <button className="hover:text-gray-500 transition-colors" aria-label="Settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [updatesTab, setUpdatesTab] = useState<'new' | 'announcements'>('new');
  const [eventsTab,  setEventsTab]  = useState<'appointments' | 'showings'>('appointments');
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>('idle');
  const [withdrawAmount, setWithdrawAmount] = useState(totalMonthly.toFixed(2));
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeGenerating, setRouteGenerating] = useState(false);
  const [outreachSent, setOutreachSent] = useState(false);
  const portfolioHistory = generatePortfolioHistory(12);
  const { isComplete, setIsComplete, profile, setProfile } = useOnboardingComplete();
  const [agentName, setAgentName] = useState('Alex');
  const [visibleWidgets, setVisibleWidgets] = useState<Set<WidgetId>>(new Set());
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStartWidget, setTourStartWidget] = useState<WidgetId | undefined>(undefined);
  const [tourOnlyWidgets, setTourOnlyWidgets] = useState<WidgetId[] | undefined>(undefined);
  const [pendingTourWidgets, setPendingTourWidgets] = useState<WidgetId[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIDGETS_KEY);
      if (raw) {
        const stored = new Set(JSON.parse(raw) as WidgetId[]);
        setVisibleWidgets(stored);
      } else if (profile) {
        const defaults = deriveDefaultWidgets(profile);
        setVisibleWidgets(new Set(defaults));
        localStorage.setItem(WIDGETS_KEY, JSON.stringify(defaults));
      }
      // No data + no profile → keep empty (AI setup widget handles first-run)
    } catch { /* ignore */ }
  }, [profile]);

  useEffect(() => {
    if (profile?.name) setAgentName(profile.name);
  }, [profile]);

  function toggleWidget(id: WidgetId) {
    const isAdding = !visibleWidgets.has(id);
    setVisibleWidgets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(WIDGETS_KEY, JSON.stringify([...next]));
      return next;
    });
    if (isAdding) {
      // If the Add Widget panel is open, defer the tour until it closes
      // so the modal doesn't overlap the tour highlight.
      if (showWidgetPanel) {
        setPendingTourWidgets(prev => prev.includes(id) ? prev : [...prev, id]);
      } else {
        setTimeout(() => {
          setTourStartWidget(id);
          setTourOnlyWidgets([id]);
          setShowTour(true);
        }, 400);
      }
    }
  }

  function closeWidgetPanel() {
    setShowWidgetPanel(false);
    if (pendingTourWidgets.length > 0) {
      const ids = pendingTourWidgets;
      setPendingTourWidgets([]);
      setTimeout(() => {
        setTourStartWidget(ids[0]);
        setTourOnlyWidgets(ids);
        setShowTour(true);
      }, 400);
    }
  }

  function removeWidget(id: WidgetId) {
    setVisibleWidgets(prev => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem(WIDGETS_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function handleActivateWidgets(widgetIds: string[]) {
    setIsComplete(true);
    localStorage.setItem('lofty_onboarding_v2', JSON.stringify({ complete: true, profile: {} }));

    const ids = widgetIds as WidgetId[];
    ids.forEach((id, i) => {
      setTimeout(() => {
        setVisibleWidgets(prev => {
          const next = new Set(prev);
          next.add(id);
          if (i === ids.length - 1) {
            localStorage.setItem(WIDGETS_KEY, JSON.stringify([...next]));
          }
          return next;
        });
      }, i * 200);
    });

    // Launch full tour after all widgets are in DOM
    setTimeout(() => {
      setTourStartWidget(undefined);
      setTourOnlyWidgets(undefined);
      setShowTour(true);
    }, ids.length * 200 + 600);
  }

  const show = (id: WidgetId) => visibleWidgets.has(id);

  const hasHoldings = holdings.length > 0;

  return (
    <main className="min-h-screen bg-[#f5f6f8] pt-16">

      {/* ─── Dashboard Tour ─── */}
      {showTour && (
        <DashboardTour
          initialWidgetId={tourStartWidget}
          onlyWidgetIds={tourOnlyWidgets}
          onDone={() => {
            setShowTour(false);
            setTourStartWidget(undefined);
            setTourOnlyWidgets(undefined);
            localStorage.setItem(TOUR_DONE_KEY, '1');
          }}
        />
      )}

      {/* ─── Greeting Row ─── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[28px] leading-none font-extrabold text-gray-900 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span className="text-3xl">👋</span>
            Good Morning, {agentName}
            <span className="text-2xl">💼</span>
            <span className="text-gray-900">!</span>
          </h1>
          <span className="h-5 w-px bg-gray-300" />
          <button className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 font-medium">
            My Portfolio
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {isComplete && (
            <>
              <button
                onClick={() => { localStorage.removeItem('lofty_onboarding_v2'); localStorage.removeItem(WIDGETS_KEY); localStorage.removeItem(TOUR_DONE_KEY); setIsComplete(false); setAgentName('Alex'); setProfile(null); setVisibleWidgets(new Set()); }}
                className="text-[11px] text-gray-300 hover:text-violet-500 transition-colors font-medium border border-gray-200 hover:border-violet-300 rounded-md px-2 py-1"
                title="Re-run AI onboarding"
              >
                ✦ Re-run AI Setup
              </button>
              <button
                onClick={() => { setTourStartWidget(undefined); setTourOnlyWidgets(undefined); setShowTour(true); }}
                className="text-[11px] text-gray-300 hover:text-violet-500 transition-colors font-medium border border-gray-200 hover:border-violet-300 rounded-md px-2 py-1 flex items-center gap-1"
                title="Take a guided tour"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3" strokeLinecap="round"/>
                </svg>
                Tour
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-md py-2 pl-3 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400/40 cursor-pointer">
              <option>Today&apos;s Priorities</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <button className="w-9 h-9 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-50" aria-label="Grid view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3"  width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Withdraw Flow (preserved functionality) ─── */}
      {withdrawStep !== 'idle' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setWithdrawStep('idle')}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            {withdrawStep === 'selecting' && (
              <>
                <h3 className="font-bold text-xl text-gray-900 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Withdraw Earnings</h3>
                <p className="text-xs text-gray-400 mb-5">Available balance: <span className="font-bold text-gray-700">{formatCurrency(parseFloat(totalEarned.toFixed(2)))}</span></p>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/40 mb-4"
                />
                <div className="flex gap-2 mb-4">
                  {['25%', '50%', '75%', '100%'].map(p => {
                    const pct = parseInt(p) / 100;
                    return (
                      <button key={p} onClick={() => setWithdrawAmount((totalEarned * pct).toFixed(2))}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-violet-100 hover:text-violet-700 transition-colors text-gray-600">
                        {p}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mb-4">Funds arrive in 1–3 business days via ACH transfer.</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setWithdrawStep('idle')}>Cancel</Button>
                  <Button className="flex-1 gradient-brand text-white border-0 shadow-md shadow-violet-500/25" onClick={() => setWithdrawStep('confirm')}>Review →</Button>
                </div>
              </>
            )}

            {withdrawStep === 'confirm' && (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Confirm Withdrawal</h3>
                <p className="text-xs text-gray-400 mb-5">Please review before submitting.</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-5">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold">${withdrawAmount}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Method</span><span className="font-bold">ACH · Chase ••••4821</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Arrival</span><span className="font-bold">1–3 business days</span></div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-2"><span className="text-gray-500">Fee</span><span className="font-bold text-emerald-600">$0.00</span></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setWithdrawStep('selecting')}>← Back</Button>
                  <Button className="flex-1 gradient-brand text-white border-0 shadow-md shadow-violet-500/25" onClick={() => setWithdrawStep('done')}>Confirm</Button>
                </div>
              </>
            )}

            {withdrawStep === 'done' && (
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Withdrawal Submitted!</h3>
                <p className="text-sm text-gray-500 mb-5">${withdrawAmount} will arrive in 1–3 business days to your Chase account ending in 4821.</p>
                <Button className="w-full gradient-brand text-white border-0" onClick={() => setWithdrawStep('idle')}>Done</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── AI Smart Route Modal ─── */}
      {showRouteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setShowRouteModal(false); setOutreachSent(false); }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 overflow-y-auto max-h-[90vh] lofty-card"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#7c3aed" />
                  <path d="M3 9l.7 1.3L5 11l-1.3.7L3 13l-.7-1.3L1 11l1.3-.7z" fill="#7c3aed" />
                  <path d="M11 9l5 5" />
                </svg>
                <h2 className="text-lg text-[var(--lofty-fg-1)]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>AI Smart Route</h2>
              </div>
              <button
                onClick={() => { setShowRouteModal(false); setOutreachSent(false); }}
                className="text-[var(--lofty-fg-4)] hover:text-[var(--lofty-fg-1)]"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Summary Stats */}
            <div
              style={{
                background: 'var(--lofty-bg-muted)',
                border: '1px solid var(--lofty-border)',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px',
              }}
            >
              <div className="flex justify-between">
                {[
                  { value: `${aiClusteredShowings.length} showings clustered`, label: 'Optimized cluster' },
                  { value: '~45 min saved', label: 'Drive time' },
                  { value: '+14% close probability', label: 'AI forecast' },
                ].map((stat, i) => (
                  <div key={i} className="flex-1 text-center">
                    <p className="font-bold text-[var(--lofty-fg-1)]" style={{ fontSize: '18px' }}>{stat.value}</p>
                    <p className="text-[var(--lofty-fg-4)]" style={{ fontSize: '11px' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              <div
                className="flex items-center gap-1.5 mt-3 pt-3"
                style={{ borderTop: '1px solid var(--lofty-border)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--lofty-brand-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                <p className="text-[var(--lofty-fg-2)]" style={{ fontSize: '11px' }}>
                  <span className="font-semibold text-[var(--lofty-fg-1)]">Automations:</span> 30-min prior SMS reminders enabled for Buyers, Sellers, &amp; Agents
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-3">
              {aiClusteredShowings.map((s, i) => {
                const dotColor =
                  s.intent === 'Hot' ? 'var(--lofty-danger-500)' :
                  s.intent === 'Warm' ? 'var(--lofty-warning-500)' :
                  'var(--lofty-fg-4)';
                const isLast = i === aiClusteredShowings.length - 1;
                return (
                  <div key={i} className="flex gap-3 relative">
                    <div className="flex flex-col items-center pt-1">
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: dotColor,
                          flexShrink: 0,
                        }}
                      />
                      {!isLast && (
                        <div style={{ width: '1px', flex: 1, background: 'var(--lofty-border)', marginTop: '4px', minHeight: '32px' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-4 min-w-0">
                      <p className="text-[13px] text-[var(--lofty-fg-1)]" style={{ fontWeight: 500 }}>
                        {s.time} · {s.lead}
                      </p>
                      <p className="text-[12px] text-[var(--lofty-fg-4)]">{s.property}</p>
                      <p className="text-[var(--lofty-fg-4)]" style={{ fontSize: '11px' }}>{s.address}</p>
                      <p style={{ fontStyle: 'italic', color: 'var(--lofty-fg-4)', fontSize: '12px', marginTop: '2px' }}>
                        <span style={{ fontStyle: 'normal' }}>AI: </span>{s.reason}
                      </p>
                      {s.consent_status === 'pending' && (
                        <span
                          className="inline-block mt-1"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--lofty-warning-500) 15%, transparent)',
                            color: 'var(--lofty-warning-500)',
                            fontSize: '11px',
                            borderRadius: '4px',
                            padding: '2px 6px',
                          }}
                        >
                          No auto-text
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compliance Note */}
            <p style={{ fontSize: '11px', color: 'var(--lofty-fg-4)', marginBottom: '16px' }}>
              Automated messages will only be sent to opted-in leads. Each message includes an opt-out link per TCPA guidelines.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowRouteModal(false); setOutreachSent(false); }}
              >
                Cancel
              </Button>
              {outreachSent ? (
                <Button
                  disabled
                  className="flex-1 text-white border-0 cursor-default"
                  style={{ backgroundColor: 'var(--lofty-success-500)', opacity: 1 }}
                >
                  Outreach Sent! ✓
                </Button>
              ) : (
                <Button
                  className="flex-1 gradient-brand text-white border-0"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('trigger-auto-text', {
                      detail: { showings: aiClusteredShowings },
                    }));
                    setOutreachSent(true);
                    setTimeout(() => {
                      setShowRouteModal(false);
                      setOutreachSent(false);
                    }, 1000);
                  }}
                >
                  Confirm & Auto-Text Leads
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Widget Grid ─── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Widget: Lofty AI Setup (shown when onboarding not yet complete) */}
        {isComplete === false && (
          <LoftyAISetupWidget onActivate={handleActivateWidgets} />
        )}

        {/* Widget: Portfolio Stats */}
        {show('portfolio-stats') && (
          <section data-widget-id="portfolio-stats" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-gray-900">Portfolio Overview</h2>
              <div className="flex items-center gap-1.5 text-gray-300">
                <CardToolIcons />
                <button onClick={() => removeWidget('portfolio-stats')} className="hover:text-red-400" aria-label="Remove widget">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Total Invested',  value: formatCurrency(totalInvested), sub: 'across 3 properties', color: 'text-gray-900' },
                { label: 'Current Value',   value: formatCurrency(totalValue),    sub: `+${gainPct}% gain`,   color: 'text-emerald-600' },
                { label: 'Total Earned',    value: formatCurrency(totalEarned),   sub: 'cumulative income',   color: 'text-violet-600' },
                { label: 'Monthly Income',  value: formatCurrency(totalMonthly),  sub: 'est. next payout',    color: 'text-sky-600' },
              ].map(s => (
                <div key={s.label} className="bg-[#f5f6f8] rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{s.label}</p>
                  <p className={`text-[18px] font-extrabold leading-none ${s.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-gray-400">Total gain: <span className="font-bold text-emerald-600">+{formatCurrency(totalGain)}</span></span>
              <Link href="/marketplace" className="font-semibold text-violet-600 hover:text-violet-800">+ Invest More</Link>
            </div>
          </section>
        )}

        {/* Widget: New Updates / Announcements (tabs) */}
        {show('new-updates') && <section data-widget-id="new-updates" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setUpdatesTab('new')}
                className={`relative pb-2 text-[15px] font-semibold transition-colors ${updatesTab === 'new' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                New Updates
                {updatesTab === 'new' && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-violet-600 rounded-full" />}
              </button>
              <button
                onClick={() => setUpdatesTab('announcements')}
                className={`relative pb-2 text-[15px] font-semibold transition-colors ${updatesTab === 'announcements' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Announcements
                {updatesTab === 'announcements' && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-violet-600 rounded-full" />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <button className="hover:text-gray-500" aria-label="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="hover:text-gray-500" aria-label="Open">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button onClick={() => removeWidget('new-updates')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>

          {updatesTab === 'new' ? (
            <div className="space-y-4">
              {newUpdates.map((u, i) => (
                <div key={i} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="p-3 flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" fillOpacity="0.9" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{u.title}</p>
                      <p className="text-[10px] text-gray-400">{u.tag} · 🌐</p>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500" aria-label="Close">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 px-3 pb-2">{u.body}</p>
                  <div className="grid grid-cols-3 gap-0.5 bg-gray-100 p-0.5">
                    <div className="relative aspect-[4/3]"><Image src="/images/prop1.png" alt="" fill sizes="(max-width: 640px) 33vw, 180px" className="object-cover" /></div>
                    <div className="relative aspect-[4/3]"><Image src="/images/prop2.png" alt="" fill sizes="(max-width: 640px) 33vw, 180px" className="object-cover" /></div>
                    <div className="relative aspect-[4/3]"><Image src="/images/prop3.png" alt="" fill sizes="(max-width: 640px) 33vw, 180px" className="object-cover" /></div>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <p className="text-[11px] text-gray-600 max-w-[55%]">Maximize returns and reduce time on market</p>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-md gradient-brand text-white shadow-sm">Boost Now</button>
                  </div>
                </div>
              ))}

              <Link href="/marketplace" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 rounded-md bg-violet-50 flex items-center justify-center flex-shrink-0">
                  🚀
                </div>
                <p className="text-sm text-gray-700 group-hover:text-violet-700">Check Lofty&apos;s latest feature updates!</p>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a, i) => (
                <div key={i} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-bold text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>}

        {/* Widget: Today's New Investments */}
        {show('today-new-investments') && <section data-widget-id="today-new-investments" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-semibold text-gray-900">Today&apos;s New Investments</h2>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons showGear />
              <button onClick={() => removeWidget('today-new-investments')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full gradient-brand rounded-full" style={{ width: hasHoldings ? '62%' : '0%' }} />
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Total: <span className="font-semibold">{holdings.length}</span> ({hasHoldings ? 0 : holdings.length} untouched)
          </p>
          {hasHoldings ? (
            <div className="space-y-3">
              {holdings.slice(0, 3).map(h => (
                <Link href={`/properties/${h.id}`} key={h.id} className="flex items-center gap-3 py-1 group">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={h.image} alt={h.name} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition-colors truncate">{h.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">Buyer · {h.city} · {h.yield}% yield</p>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700">
                    {h.tokens}
                  </span>
                </Link>
              ))}
              <Link href="/marketplace" className="block text-center text-xs font-semibold text-violet-600 hover:text-violet-800 pt-2">View All &gt;</Link>
            </div>
          ) : (
            <EmptyIllustration />
          )}
        </section>}

        {/* Widget: Today's Opportunities */}
        {show('todays-opportunities') && <section data-widget-id="todays-opportunities" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Today&apos;s Opportunities</h2>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons />
              <button onClick={() => removeWidget('todays-opportunities')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-[#f5f6f8] rounded-lg p-3 mb-4">
            {[
              { label: 'High Yield',   value: holdings.filter(h => h.yield >= 7).length },
              { label: 'Top Gainers',  value: holdings.filter(h => h.change >= 10).length },
              { label: 'Back to Site', value: Math.max(0, 12 - holdings.length) },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
              </div>
            ))}
          </div>
          {hasHoldings ? (
            <div className="space-y-2.5">
              {holdings.map(h => (
                <div key={h.id} className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{h.name}</p>
                    <p className="text-[10px] text-gray-400">Buyer · {h.type}</p>
                  </div>
                  <p className="text-xs font-bold text-emerald-600">+{h.change}%</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyIllustration />
          )}
        </section>}

        {/* Widget: Need Keep In Touch */}
        {show('need-keep-in-touch') && <section data-widget-id="need-keep-in-touch" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Need Keep In Touch</h2>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons showGear />
              <button onClick={() => removeWidget('need-keep-in-touch')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-[#f5f6f8] rounded-lg p-3 mb-4">
            <div className="text-center">
              <p className="text-[11px] text-gray-500">Distributions</p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{holdings.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-gray-500">Follow-Up</p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{activity.length}</p>
            </div>
          </div>
          <div className="space-y-3">
            {holdings.map(h => (
              <div key={h.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-gray-900">{h.name}</p>
                <p className="text-[11px] text-gray-500">Buyer</p>
                <p className="text-[11px] text-gray-500">Next distribution: May 15, 2026</p>
              </div>
            ))}
          </div>
          <Link href="#" className="block text-center text-xs font-semibold text-violet-600 hover:text-violet-800 pt-3">View All &gt;</Link>
        </section>}

        {/* Widget: Transactions */}
        {show('transactions') && <section data-widget-id="transactions" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Transactions</h2>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons showGear />
              <button onClick={() => removeWidget('transactions')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-[#f5f6f8] rounded-lg p-3 mb-4">
            <div className="text-center">
              <p className="text-[11px] text-gray-500">Near Deadline</p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{activity.filter(a => a.type === 'distribution').length}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-gray-500">Expired</p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>0</p>
            </div>
          </div>
          <div className="space-y-3">
            {activity.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-2 pb-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{a.label}</p>
                  <p className="text-[10px] text-gray-400">{a.date} · {a.type === 'distribution' ? 'Income' : 'Purchase'}</p>
                </div>
                <p className={`text-xs font-bold flex-shrink-0 ${a.type === 'distribution' ? 'text-emerald-600' : 'text-gray-700'}`}>{a.amount}</p>
              </div>
            ))}
          </div>
          <Link href="#" className="block text-center text-xs font-semibold text-violet-600 hover:text-violet-800 pt-3">View All &gt;</Link>
        </section>}

        {/* Widget: Today's Tasks */}
        {show('todays-tasks') && <section data-widget-id="todays-tasks" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Today&apos;s Tasks</h2>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons />
              <button onClick={() => removeWidget('todays-tasks')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'Invest',   value: holdings.length, bg: 'bg-violet-50',   color: 'text-violet-700'  },
              { label: 'Withdraw', value: 1,               bg: 'bg-sky-50',      color: 'text-sky-700'     },
              { label: 'Browse',   value: 12,              bg: 'bg-emerald-50',  color: 'text-emerald-700' },
              { label: 'Refer',    value: 0,               bg: 'bg-amber-50',    color: 'text-amber-700'   },
            ].map(t => (
              <div key={t.label} className={`rounded-md ${t.bg} p-2.5 text-center`}>
                <p className={`text-[10px] font-semibold ${t.color}`}>{t.label}</p>
                <p className={`text-lg font-extrabold mt-0.5 ${t.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{t.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Link href="/marketplace" className="flex items-center justify-between py-2 border-b border-gray-50 hover:bg-gray-50/60 rounded px-1">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Invest in Marina View Lofts</p>
                <p className="text-[10px] text-gray-400">New listing · San Diego, CA</p>
              </div>
              <p className="text-[11px] font-semibold text-violet-600">Today</p>
            </Link>
            <button onClick={() => setWithdrawStep('selecting')} className="w-full flex items-center justify-between py-2 hover:bg-gray-50/60 rounded px-1">
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-900">Withdraw Earnings</p>
                <p className="text-[10px] text-gray-400">Available: {formatCurrency(totalEarned)}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>}

        {/* Widget: Appointments / Showings */}
        {show('appointments') && <section data-widget-id="appointments" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEventsTab('appointments')}
                className={`relative pb-2 text-[15px] font-semibold ${eventsTab === 'appointments' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Appointments
                {eventsTab === 'appointments' && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-violet-600 rounded-full" />}
              </button>
              <button
                onClick={() => setEventsTab('showings')}
                className={`relative pb-2 text-[15px] font-semibold ${eventsTab === 'showings' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Showings
                {eventsTab === 'showings' && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-violet-600 rounded-full" />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons />
              <button onClick={() => removeWidget('appointments')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: '20%' }} />
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Total: <span className="font-semibold">{eventsTab === 'appointments' ? '1' : '0'}</span> ({eventsTab === 'appointments' ? '0' : '0'} Incomplete)
          </p>
          {eventsTab === 'appointments' ? (
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-50 last:border-0">
                <p className="text-sm font-semibold text-gray-900">Next Distribution</p>
                <p className="text-[11px] text-gray-500">May 15, 2026 · {formatCurrency(totalMonthly)} expected</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-[var(--lofty-fg-4)] mb-3">
                AI has identified a high-efficiency showing cluster in the Camelback Corridor for today. 3 leads, ~0.8 mi apart.
              </p>
              <div className="space-y-2">
                {aiClusteredShowings.map((s, i) => {
                  const borderColor =
                    s.intent === 'Hot' ? 'var(--lofty-danger-500)' :
                    s.intent === 'Warm' ? 'var(--lofty-warning-500)' :
                    'var(--lofty-fg-4)';
                  const badgeBg =
                    s.intent === 'Hot' ? 'var(--lofty-danger-500)' :
                    s.intent === 'Warm' ? 'var(--lofty-warning-500)' :
                    'var(--lofty-fg-4)';
                  return (
                    <div
                      key={i}
                      className="pl-3 py-2 flex items-start justify-between gap-2"
                      style={{ borderLeft: `4px solid ${borderColor}` }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[var(--lofty-fg-1)] flex items-center gap-1.5">
                          <span>{s.lead}</span>
                          {s.consent_status === 'pending' && (
                            <span title="No outreach consent — message will be skipped" className="cursor-help">🔒</span>
                          )}
                          <span className="text-[var(--lofty-fg-4)] font-normal">·</span>
                          <span>{s.time}</span>
                        </p>
                        <p className="text-[11px] text-[var(--lofty-fg-4)] truncate">{s.property}</p>
                      </div>
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded-full text-white flex-shrink-0"
                        style={{ backgroundColor: badgeBg }}
                      >
                        {s.intent}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Button
                disabled={routeGenerating}
                onClick={() => {
                  setRouteGenerating(true);
                  setTimeout(() => {
                    setRouteGenerating(false);
                    setShowRouteModal(true);
                  }, 1800);
                }}
                className="gradient-brand text-white border-0 shadow-md shadow-violet-500/25 mt-3 w-full"
              >
                {routeGenerating ? 'Analyzing leads...' : '✨ Generate AI Smart Route'}
              </Button>
            </div>
          )}
        </section>}

        {/* Widget: My Holdings */}
        {show('my-listings') && <section data-widget-id="my-listings" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">My Holdings</h2>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons />
              <button onClick={() => removeWidget('my-listings')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {holdings.map(h => (
              <Link href={`/properties/${h.id}`} key={h.id} className="flex items-center gap-3 group">
                <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={h.image} alt={h.name} fill sizes="56px" className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 group-hover:text-violet-700 truncate">{h.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{h.city}</p>
                  <p className="text-[11px] text-violet-600 mt-0.5">{h.tokens} tokens · {formatCurrency(h.currentValue)}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/marketplace" className="block text-center text-xs font-semibold text-violet-600 hover:text-violet-800 pt-3">View All &gt;</Link>
        </section>}

        {/* Widget: Hot Sheets */}
        {show('hot-sheets') && <section data-widget-id="hot-sheets" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Hot Sheets</h2>
            <button onClick={() => removeWidget('hot-sheets')} className="text-gray-300 hover:text-red-400" aria-label="Remove widget">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {hotSheets.map(s => (
              <div key={s.label} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">{s.label}</p>
                  <p className="text-[11px] text-gray-400">{s.count}</p>
                </div>
                {s.updates && (
                  <span className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-50 text-emerald-600">{s.updates}</span>
                )}
              </div>
            ))}
          </div>
        </section>}

        {/* Widget: Market Pulse */}
        {show('market-pulse') && (
          <section data-widget-id="market-pulse" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-gray-900">Market Pulse</h2>
              <div className="flex items-center gap-1.5 text-gray-300">
                <CardToolIcons />
                <button onClick={() => removeWidget('market-pulse')} className="hover:text-red-400" aria-label="Remove widget">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-[#f5f6f8] rounded-lg p-3 mb-4">
              {[
                { label: 'New Listings',  value: '1,247',  sub: 'this week',       color: 'text-violet-600' },
                { label: 'Avg. Yield',    value: '7.2%',   sub: 'platform-wide',   color: 'text-emerald-600' },
                { label: 'Total AUM',     value: '$142M',  sub: 'managed on-chain', color: 'text-sky-600' },
                { label: 'Tokenizations', value: '38',     sub: 'new this month',  color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-xl font-extrabold mt-0.5 ${s.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Trending Cities</p>
            <div className="space-y-2">
              {[
                { city: 'Miami, FL',     yield: '8.1%', new: 214, color: 'bg-violet-500' },
                { city: 'Austin, TX',    yield: '7.6%', new: 187, color: 'bg-emerald-500' },
                { city: 'Boston, MA',    yield: '7.4%', new: 155, color: 'bg-sky-500' },
              ].map(c => (
                <div key={c.city} className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.color}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-[12px] font-semibold text-gray-900">{c.city}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="font-bold text-emerald-600">{c.yield}</span>
                      <span>{c.new} new</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Widget: AI Recommendations */}
        {show('ai-recommendations') && (
          <section data-widget-id="ai-recommendations" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-gray-900">AI Recommendations</h2>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md gradient-brand text-white">AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <CardToolIcons />
                <button onClick={() => removeWidget('ai-recommendations')} className="hover:text-red-400" aria-label="Remove widget">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mb-3">Based on your 7%+ yield preference &amp; portfolio mix</p>
            <div className="space-y-3">
              {[
                { id: 'azure-bay-residences', name: 'Marina View Lofts',   city: 'San Diego, CA', image: '/images/prop1.png', yield: 8.3, reason: 'Matches your coastal multifamily focus',         tag: 'High Yield' },
                { id: 'highland-tower',        name: 'Riverside Commons',  city: 'Austin, TX',    image: '/images/prop2.png', yield: 7.9, reason: 'Diversifies your Midwest-heavy allocation',      tag: 'Trending'   },
                { id: 'centrepoint-plaza',     name: 'Pinnacle Office Park', city: 'Nashville, TN', image: '/images/prop3.png', yield: 7.5, reason: 'Lower correlation to your existing holdings',   tag: 'Stable'     },
              ].map(rec => (
                <div key={rec.id} className="flex items-start gap-3 pb-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="relative w-11 h-11 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={rec.image} alt={rec.name} fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{rec.name}</p>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-violet-100 text-violet-700 flex-shrink-0">{rec.tag}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{rec.city} · {rec.yield}% yield</p>
                    <p className="text-[10px] text-violet-600 mt-0.5 italic truncate">{rec.reason}</p>
                  </div>
                  <Link href="/marketplace" className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg gradient-brand text-white shadow-sm flex-shrink-0">
                    Invest
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Widget: Add Card */}
        <button
          onClick={() => setShowWidgetPanel(true)}
          className="border-2 border-dashed border-gray-200 rounded-xl min-h-[120px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-violet-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold">Add Widget</span>
        </button>

      </div>

      {/* ─── Widget Panel Modal ─── */}
      {showWidgetPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm" onClick={closeWidgetPanel}>
          <div className="bg-white h-full w-full max-w-sm shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-[17px] font-bold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>Customize Dashboard</h2>
                <p className="text-xs text-gray-400 mt-0.5">Toggle widgets on or off</p>
              </div>
              <button onClick={closeWidgetPanel} className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {(Object.entries(WIDGET_META) as [WidgetId, { title: string; description: string }][]).map(([id, meta]) => (
                <div
                  key={id}
                  onClick={() => toggleWidget(id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    visibleWidgets.has(id)
                      ? 'border-violet-300 bg-violet-50'
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    visibleWidgets.has(id) ? 'border-violet-600 bg-violet-600' : 'border-gray-300 bg-white'
                  }`}>
                    {visibleWidgets.has(id) && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">{meta.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{meta.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeWidgetPanel}
                className="w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold shadow-sm shadow-violet-400/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Performance + Allocation Row (Equivest specifics kept) ─── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid lg:grid-cols-3 gap-4">

        <section data-widget-id="portfolio-performance" className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Portfolio Performance · 12 mo</p>
              <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'Syne, sans-serif' }}>{formatCurrency(totalValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">ROI</p>
              <p className="text-xl font-bold text-emerald-600">+{gainPct}%</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-3">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded-full bg-violet-600" /> Portfolio Value</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded-full border-t-2 border-dashed border-gray-400" /> Invested</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block rounded-full bg-emerald-500" /> ROI %</span>
          </div>
          <EarningsChart data={portfolioHistory} />
        </section>

        <section data-widget-id="asset-allocation" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Asset Allocation</h2>
            <CardToolIcons />
          </div>
          <AllocationChart slices={ALLOCATION_SLICES} />
          <div className="space-y-2 mt-3">
            {ALLOCATION_SLICES.map(slice => (
              <div key={slice.name} className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: slice.color }} />
                <div className="flex-1 flex justify-between text-xs">
                  <span className="text-gray-600 font-medium">{slice.name}</span>
                  <span className="font-bold text-gray-900">{formatCurrency(slice.amount)}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium w-8 text-right">{slice.value}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── Lead Chat Widget ─── */}
      <LeadChatWidget />

      {/* ─── Bottom CTA: Next Distribution (kept) ─── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="gradient-brand rounded-xl p-5 relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: 'white', transform: 'translate(20%, -20%)' }} />
          <div className="relative">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Next Distribution</p>
            <p className="text-white text-2xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
              {formatCurrency(totalMonthly)} <span className="text-white/60 text-sm font-medium">· Est. May 15, 2026</span>
            </p>
          </div>
          <div className="relative flex items-center gap-3">
            <Button
              onClick={() => setWithdrawStep('selecting')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm"
            >
              Withdraw Funds
            </Button>
            <Link href="/marketplace" id="dashboard-invest-btn">
              <Button className="bg-white text-violet-700 border-0 shadow-lg hover:scale-[1.02] transition-all font-semibold">+ Invest More</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
