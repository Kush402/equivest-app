'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/properties';
import { useOnboardingComplete, type OnboardingProfile } from '@/components/OnboardingModal';
import DashboardTour from '@/components/DashboardTour';
import LoftyAISetupWidget from '@/components/LoftyAISetupWidget';
import LeadChatWidget from '@/components/LeadChatWidget';

const WIDGETS_KEY  = 'lofty_widgets_v1';
const TOUR_DONE_KEY = 'lofty_tour_complete_v1';

type WidgetId =
  | 'pipeline-overview'
  | 'new-updates'
  | 'lead-activity'
  | 'ai-lead-scoring'
  | 'need-keep-in-touch'
  | 'my-listings-crm'
  | 'todays-tasks'
  | 'appointments'
  | 'hot-sheets';

const WIDGET_META: Record<WidgetId, { title: string; description: string }> = {
  'pipeline-overview':  { title: 'Pipeline Overview',     description: 'Lead pipeline stages: new leads, contacted, nurturing, under contract' },
  'new-updates':        { title: 'New Updates',           description: 'Platform news, announcements, and agent tips' },
  'lead-activity':      { title: 'Lead Activity Feed',    description: 'Real-time feed of lead actions: views, form fills, email opens' },
  'ai-lead-scoring':    { title: 'AI Lead Scoring',       description: 'AI-ranked priority leads based on engagement and intent signals' },
  'need-keep-in-touch': { title: 'Need Keep In Touch',    description: 'Contacts overdue for follow-up with last-contact dates' },
  'my-listings-crm':    { title: 'My Listings',           description: 'Your active MLS listings with views, inquiries, and days on market' },
  'todays-tasks':       { title: "Today's Tasks",         description: 'Quick actions: follow up, send listing, schedule showing, refer' },
  'appointments':       { title: 'Appointments',          description: 'AI-optimized showing schedules and proactive lead outreach' },
  'hot-sheets':         { title: 'Hot Sheets',            description: 'Market-wide: new listings, price reductions, open houses, expired' },
};

const ALWAYS_ON: WidgetId[] = [
  'pipeline-overview', 'new-updates', 'lead-activity', 'my-listings-crm',
  'todays-tasks', 'hot-sheets', 'ai-lead-scoring',
];

function deriveDefaultWidgets(profile: OnboardingProfile | null): WidgetId[] {
  const ids = new Set<WidgetId>(ALWAYS_ON);
  if (!profile) return [...ids];

  if (['close-more-deals', 'manage-leads'].includes(profile.primaryGoal)) {
    ids.add('need-keep-in-touch');
    ids.add('ai-lead-scoring');
  }
  if (['grow-team', 'scale-business', 'better-marketing'].includes(profile.primaryGoal)) {
    ids.add('need-keep-in-touch');
    ids.add('lead-activity');
  }
  if (profile.wantsShowingScheduler) ids.add('appointments');
  if (profile.wantsAIInsights) {
    ids.add('ai-lead-scoring');
    ids.add('need-keep-in-touch');
  }
  if (profile.wantsLeadScoring) ids.add('ai-lead-scoring');

  return [...ids];
}

const pipeline = [
  { stage: 'New Leads',      count: 14, color: 'text-violet-600', bg: 'bg-violet-50'  },
  { stage: 'Contacted',      count: 31, color: 'text-sky-600',    bg: 'bg-sky-50'     },
  { stage: 'Nurturing',      count: 18, color: 'text-amber-600',  bg: 'bg-amber-50'   },
  { stage: 'Under Contract', count: 5,  color: 'text-emerald-600',bg: 'bg-emerald-50' },
];
const closedThisMonth = 3;

const leadActivity = [
  { lead: 'Sarah Jenkins',   action: 'Viewed listing 4×',           property: '4821 E Camelback Rd', time: '2m ago',  intent: 'Hot'  },
  { lead: 'Marcus Chen',     action: 'Submitted contact form',       property: '5102 E Camelback Rd', time: '18m ago', intent: 'Hot'  },
  { lead: 'David Torres',    action: 'Opened email campaign',        property: '3850 E Camelback Rd', time: '1h ago',  intent: 'Warm' },
  { lead: 'Priya Kapoor',    action: 'Saved listing to favorites',   property: '1900 W Bell Rd',      time: '2h ago',  intent: 'Warm' },
  { lead: 'James Patterson', action: 'Revisited price-reduced page', property: '7201 N Scottsdale Rd',time: '4h ago',  intent: 'Cold' },
];

const priorityLeads = [
  { name: 'Sarah Jenkins',       score: 94, intent: 'Hot',  signals: 'Viewed 4× in 24h · Pre-approved $500K', lastContact: '2 days ago' },
  { name: 'Marcus Chen',         score: 87, intent: 'Hot',  signals: 'Submitted form · Called office',         lastContact: 'Today'      },
  { name: 'David & Emma Torres', score: 71, intent: 'Warm', signals: 'Lease ending in 3 weeks · Pre-approved', lastContact: '5 days ago' },
  { name: 'Priya Kapoor',        score: 58, intent: 'Warm', signals: 'Multiple saves · Budget match',          lastContact: '1 week ago' },
];

const touchLeads = [
  { name: 'Robert Kim',   lastContact: '12 days ago', type: 'Seller Lead', note: 'Requested CMA'      },
  { name: 'Lisa Nguyen',  lastContact: '8 days ago',  type: 'Buyer Lead',  note: 'Needs 3BD Phoenix'  },
  { name: 'Carlos Reyes', lastContact: '6 days ago',  type: 'Past Client', note: 'Referred 2 friends' },
];

const myListings = [
  { id: 'prop1', address: '4821 E Camelback Rd', city: 'Phoenix, AZ', price: 485000, beds: 3, baths: 2, dom: 8,  views: 214, inquiries: 7, image: '/images/prop1.png' },
  { id: 'prop2', address: '5102 E Camelback Rd', city: 'Phoenix, AZ', price: 620000, beds: 4, baths: 3, dom: 15, views: 189, inquiries: 4, image: '/images/prop2.png' },
  { id: 'prop3', address: '3850 E Camelback Rd', city: 'Phoenix, AZ', price: 395000, beds: 2, baths: 2, dom: 3,  views: 87,  inquiries: 2, image: '/images/prop3.png' },
];

const hotSheets = [
  { label: 'New Listings',        count: '27,309 Listings', updates: '4,677 Updates' },
  { label: 'Price Reduced',       count: '43,952 Listings', updates: '2,766 Updates' },
  { label: 'Upcoming Open House', count: '7,437 Listings',  updates: '1,981 Updates' },
  { label: 'Back on Market',      count: '3,218 Listings',  updates: '891 Updates'   },
  { label: 'Coming Soon',         count: '2,109 Listings',  updates: '437 Updates'   },
  { label: 'Expired',             count: '1,844 Listings',  updates: ''              },
];

const announcements = [
  { title: 'Lofty AI Webinar — May 1',  body: 'Join us live to see the new AI Lead Scorer and Smart Route in action.' },
  { title: 'MLS Data Refresh — Apr 20', body: 'Lofty syncs MLS data every 15 minutes. Hot sheets now update in real-time.' },
];

const newUpdates = [
  { title: 'Lofty AI Feature Update', tag: 'Product',
    body: '✨ NEW — AI Smart Route now supports bulk outreach to all showing leads simultaneously.' },
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
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeGenerating, setRouteGenerating] = useState(false);
  const [outreachSent, setOutreachSent] = useState(false);

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

  return (
    <main className="min-h-screen bg-[var(--lofty-bg-muted)] pt-16">

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
          <h1 className="text-[28px] leading-none font-extrabold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">👋</span>
            Good Morning, {agentName}
            <span className="text-2xl">💼</span>
            <span className="text-gray-900">!</span>
          </h1>
          <span className="h-5 w-px bg-gray-300" />
          <button className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 font-medium">
            My Pipeline
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="var(--brand)" />
                  <path d="M3 9l.7 1.3L5 11l-1.3.7L3 13l-.7-1.3L1 11l1.3-.7z" fill="var(--brand)" />
                  <path d="M11 9l5 5" />
                </svg>
                <h2 className="text-lg font-semibold text-[var(--lofty-fg-1)]">AI Smart Route</h2>
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
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.property} ${s.address}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-[var(--lofty-fg-4)] hover:text-[var(--lofty-brand-500)] inline-flex items-center gap-1 underline-offset-2 hover:underline"
                      >
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0">
                          <path d="M8 0C5.2 0 3 2.2 3 5c0 4.3 5 11 5 11s5-6.7 5-11c0-2.8-2.2-5-5-5zm0 7.5C6.6 7.5 5.5 6.4 5.5 5S6.6 2.5 8 2.5 10.5 3.6 10.5 5 9.4 7.5 8 7.5z"/>
                        </svg>
                        {s.property}
                      </a>
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
                    window.dispatchEvent(
                      new CustomEvent('trigger-auto-text', { detail: { showings: aiClusteredShowings } })
                    );
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

        {/* Widget: Pipeline Overview */}
        {show('pipeline-overview') && (
          <section data-widget-id="pipeline-overview" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-gray-900">Pipeline Overview</h2>
              <div className="flex items-center gap-1.5 text-gray-300">
                <CardToolIcons />
                <button onClick={() => removeWidget('pipeline-overview')} className="hover:text-red-400" aria-label="Remove widget">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {pipeline.map(s => (
                <div key={s.stage} className={`${s.bg} rounded-lg p-3`}>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{s.stage}</p>
                  <p className={`text-[24px] font-extrabold leading-none ${s.color}`}>{s.count}</p>
                  <p className="text-[10px] text-gray-400 mt-1">leads</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-gray-400">Closed this month: <span className="font-bold text-emerald-600">{closedThisMonth} deals</span></span>
              <Link href="#" className="font-semibold text-violet-600 hover:text-violet-800">View CRM →</Link>
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

              <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 rounded-md bg-violet-50 flex items-center justify-center flex-shrink-0">
                  🚀
                </div>
                <p className="text-sm text-gray-700 group-hover:text-violet-700">Check Lofty&apos;s latest AI feature updates!</p>
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

        {/* Widget: Lead Activity Feed */}
        {show('lead-activity') && <section data-widget-id="lead-activity" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-gray-900">Lead Activity Feed</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons />
              <button onClick={() => removeWidget('lead-activity')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="space-y-2.5">
            {leadActivity.map((a, i) => {
              const intentColor = a.intent === 'Hot' ? 'bg-red-500' : a.intent === 'Warm' ? 'bg-amber-400' : 'bg-gray-300';
              return (
                <div key={i} className="flex items-start gap-2.5 pb-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${intentColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{a.lead}</p>
                    <p className="text-[11px] text-gray-500 truncate">{a.action} · {a.property}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{a.time}</span>
                </div>
              );
            })}
          </div>
          <Link href="#" className="block text-center text-xs font-semibold text-violet-600 hover:text-violet-800 pt-3">View all activity →</Link>
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
          <div className="grid grid-cols-2 gap-2 bg-[var(--lofty-bg-muted)] rounded-lg p-3 mb-4">
            <div className="text-center">
              <p className="text-[11px] text-gray-500">Overdue</p>
              <p className="text-xl font-extrabold text-red-500 mt-0.5">{touchLeads.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-gray-500">Due This Week</p>
              <p className="text-xl font-extrabold text-amber-500 mt-0.5">7</p>
            </div>
          </div>
          <div className="space-y-3">
            {touchLeads.map(l => (
              <div key={l.name} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">{l.name}</p>
                  <span className="text-[10px] text-red-500 font-semibold flex-shrink-0">{l.lastContact}</span>
                </div>
                <p className="text-[11px] text-gray-500">{l.type} · {l.note}</p>
              </div>
            ))}
          </div>
          <Link href="#" className="block text-center text-xs font-semibold text-violet-600 hover:text-violet-800 pt-3">View all →</Link>
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
              { label: 'Follow-Up', value: 8,  bg: 'bg-violet-50',  color: 'text-violet-700'  },
              { label: 'Send List', value: 3,  bg: 'bg-sky-50',     color: 'text-sky-700'     },
              { label: 'Showings',  value: 3,  bg: 'bg-emerald-50', color: 'text-emerald-700' },
              { label: 'Refer',     value: 1,  bg: 'bg-amber-50',   color: 'text-amber-700'   },
            ].map(t => (
              <div key={t.label} className={`rounded-md ${t.bg} p-2.5 text-center`}>
                <p className={`text-[10px] font-semibold ${t.color}`}>{t.label}</p>
                <p className={`text-lg font-extrabold mt-0.5 ${t.color}`}>{t.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50 hover:bg-gray-50/60 rounded px-1">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Call Sarah Jenkins — Hot lead</p>
                <p className="text-[10px] text-gray-400">Pre-approved $500K · Viewed 4× today</p>
              </div>
              <p className="text-[11px] font-semibold text-violet-600">Today</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50 hover:bg-gray-50/60 rounded px-1">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Send listings to Marcus Chen</p>
                <p className="text-[10px] text-gray-400">3BD under $600K · Phoenix area</p>
              </div>
              <p className="text-[11px] font-semibold text-violet-600">Today</p>
            </div>
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
                <p className="text-sm font-semibold text-gray-900">Buyer Consultation — David Torres</p>
                <p className="text-[11px] text-gray-500">Today, 10:00 AM · Pre-approved buyer, lease ending soon</p>
              </div>
              <div className="pb-3 border-b border-gray-50 last:border-0">
                <p className="text-sm font-semibold text-gray-900">Listing Presentation — Kim & Park</p>
                <p className="text-[11px] text-gray-500">Tomorrow, 2:00 PM · Seller lead, requested CMA</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-[var(--lofty-fg-4)] mb-3">
                AI has identified a high-efficiency showing cluster in the Camelback Corridor for today. 3 leads, ~0.8 mi apart.
              </p>
              <div className="space-y-2">
                {aiClusteredShowings.map((s, i) => {
                  const badgeBg =
                    s.intent === 'Hot' ? 'var(--lofty-danger-500)' :
                    s.intent === 'Warm' ? 'var(--lofty-warning-500)' :
                    'var(--lofty-fg-4)';
                  return (
                    <div
                      key={i}
                      className="py-2 flex items-start justify-between gap-2"
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
                className="gradient-brand text-white border-0 shadow-md mt-3 w-full"
              >
                {routeGenerating ? 'Analyzing leads...' : '✨ Generate AI Smart Route'}
              </Button>
            </div>
          )}
        </section>}

        {/* Widget: My Listings */}
        {show('my-listings-crm') && <section data-widget-id="my-listings-crm" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-gray-900">My Listings</h2>
            <div className="flex items-center gap-1.5 text-gray-300">
              <CardToolIcons />
              <button onClick={() => removeWidget('my-listings-crm')} className="hover:text-red-400" aria-label="Remove widget">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {myListings.map(l => (
              <div key={l.id} className="flex items-center gap-3 group">
                <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={l.image} alt={l.address} fill sizes="56px" className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{l.address}</p>
                  <p className="text-[11px] text-gray-500 truncate">{l.city} · {l.beds}bd/{l.baths}ba · {formatCurrency(l.price)}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                    <span className="text-sky-600 font-semibold">{l.views} views</span>
                    <span>{l.inquiries} inquiries</span>
                    <span>{l.dom} DOM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="#" className="block text-center text-xs font-semibold text-violet-600 hover:text-violet-800 pt-3">View all →</Link>
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

        {/* Widget: AI Lead Scoring */}
        {show('ai-lead-scoring') && (
          <section data-widget-id="ai-lead-scoring" className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5 min-h-[320px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-gray-900">AI Lead Scoring</h2>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md gradient-brand text-white">AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <CardToolIcons />
                <button onClick={() => removeWidget('ai-lead-scoring')} className="hover:text-red-400" aria-label="Remove widget">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mb-3">AI-ranked by engagement signals and buying intent</p>
            <div className="space-y-3">
              {priorityLeads.map(lead => {
                const intentBg = lead.intent === 'Hot' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600';
                const barColor = lead.intent === 'Hot' ? 'bg-red-500' : 'bg-amber-400';
                return (
                  <div key={lead.name} className="pb-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{lead.name}</p>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded flex-shrink-0 ${intentBg}`}>{lead.intent}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${lead.score}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">{lead.score}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">{lead.signals}</p>
                    <p className="text-[10px] text-gray-400">Last contact: {lead.lastContact}</p>
                  </div>
                );
              })}
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
                <h2 className="text-[17px] font-bold text-gray-900">Customize Dashboard</h2>
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
                className="w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Lead Chat Widget ─── */}
      <LeadChatWidget />

      {/* ─── Bottom CTA: Monthly Goal ─── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="gradient-brand rounded-xl p-5 relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: 'white', transform: 'translate(20%, -20%)' }} />
          <div className="relative">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Close Rate Goal · April 2026</p>
            <p className="text-white text-2xl font-extrabold">
              {closedThisMonth} of 5 deals closed <span className="text-white/60 text-sm font-medium">· {5 - closedThisMonth} remaining</span>
            </p>
          </div>
          <div className="relative flex items-center gap-3">
            <Link href="#">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">View Pipeline</Button>
            </Link>
            <Link href="#">
              <Button className="bg-white text-violet-700 border-0 shadow-lg hover:scale-[1.02] transition-transform font-semibold">+ Add Lead</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
