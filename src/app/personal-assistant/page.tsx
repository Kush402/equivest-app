'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  cards?: ActionCard[];
  callCard?: boolean;
  timestamp: Date;
}

interface ActionCard {
  type: 'lead' | 'campaign' | 'listing' | 'cma' | 'showing';
  title: string;
  subtitle: string;
  meta: string;
  badge?: string;
  badgeColor?: string;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  due: string;
  source: string;
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'paused';
  runs: number;
  createdAt: string;
}

// ─── Scripted AI Responses ────────────────────────────────────────────────────

interface ScriptedResponse {
  text: string;
  cards?: ActionCard[];
  tasks?: Omit<Task, 'id'>[];
  automations?: Omit<Automation, 'id'>[];
  triggerCallDemo?: boolean;
}

function getAIResponse(input: string): ScriptedResponse {
  const q = input.toLowerCase();

  if (q.match(/hot.?lead|positive.?intent|auto.?call|call.*repl|outreach.*auto|auto.*outreach.*call|text.*email.*call|smart.*outreach/)) {
    return {
      text: `Automation deployed. I'm now monitoring **4 hot leads** (score >85) and sending personalized text + email outreach within 30 seconds. The moment a lead replies with buying intent, I'll automatically route a live voice call directly to you — no manual action needed.\n\nHere are the leads I'm targeting:`,
      cards: [
        { type: 'lead', title: 'Marcus Rivera', subtitle: 'Austin, TX · Score 94', meta: 'Viewed Highland Tower 3x · Inquiry 48h ago', badge: 'Hot 🔥', badgeColor: '#EF4444' },
        { type: 'lead', title: 'Sarah Chen', subtitle: 'Tempe, AZ · Score 88', meta: 'Pre-approved $480K · Viewed 6 listings', badge: 'Hot 🔥', badgeColor: '#EF4444' },
        { type: 'lead', title: 'David Okafor', subtitle: 'Tempe, AZ · Score 85', meta: 'Motivated seller · Listed 90+ days', badge: 'Warm', badgeColor: '#F59E0B' },
      ],
      automations: [
        {
          name: 'Hot Lead → Outreach → Auto-Call',
          trigger: 'Lead score >85 + inactive 7+ days',
          actions: [
            'Send personalized text within 30s',
            'Send tailored email within 2 min',
            'Monitor reply for positive intent (AI)',
            'Auto-initiate voice call on positive intent',
          ],
          status: 'active',
          runs: 0,
          createdAt: 'Just now',
        },
      ],
      tasks: [
        { title: 'Review hot lead outreach results', status: 'pending', priority: 'high', due: 'Today', source: 'AI Automation' },
      ],
      triggerCallDemo: true,
    };
  }

  if (q.match(/lead|contact|prospect|85281|zip|area|find/)) {
    return {
      text: `I found **23 high-intent leads** in the 85281 zip code (Tempe, AZ). I've scored them by engagement and motivated-seller signals. Here are the top prospects:`,
      cards: [
        { type: 'lead', title: 'Sarah Chen', subtitle: 'Tempe, AZ 85281 · Buyer', meta: 'Viewed 6 listings · Pre-approved $480K', badge: 'Score 97', badgeColor: 'var(--lofty-success-500)' },
        { type: 'lead', title: 'David Okafor', subtitle: 'Tempe, AZ 85281 · Seller', meta: 'Motivated seller · Listed 90+ days', badge: 'Score 91', badgeColor: 'var(--lofty-success-500)' },
        { type: 'lead', title: 'Maria Gonzalez', subtitle: 'Tempe, AZ 85281 · Renter→Buyer', meta: 'Lease ending in 45 days · Inquiry 3x', badge: 'Score 88', badgeColor: 'var(--lofty-brand-500)' },
        { type: 'lead', title: 'James Whitfield', subtitle: 'Tempe, AZ 85281 · Investor', meta: 'Looking for 6%+ yield · Cash buyer', badge: 'Score 84', badgeColor: 'var(--lofty-brand-500)' },
      ],
      tasks: [
        { title: 'Review 85281 lead list (23 contacts)', status: 'pending', priority: 'high', due: 'Today', source: 'AI Lead Search' },
        { title: 'Call Sarah Chen — Score 97', status: 'pending', priority: 'high', due: 'Today', source: 'AI Lead Search' },
        { title: 'Follow up with David Okafor (motivated seller)', status: 'pending', priority: 'high', due: 'Tomorrow', source: 'AI Lead Search' },
      ],
    };
  }

  if (q.match(/outreach|campaign|email|text|sms|message|market/)) {
    return {
      text: `Done. I've created a **5-step drip campaign** targeting your 85281 leads. It's personalized to each contact's behavior — buyers get property alerts, the seller gets a CMA offer, and the renter gets first-time buyer content. First messages go out at 9 AM tomorrow.`,
      cards: [
        { type: 'campaign', title: '85281 Buyer Nurture Sequence', subtitle: '5 emails · 14 days', meta: 'Personalized to search history & pre-approval', badge: 'Active', badgeColor: 'var(--lofty-success-500)' },
        { type: 'campaign', title: '85281 Seller Outreach', subtitle: '3 emails + 2 SMS · 7 days', meta: 'CMA offer + market stats for Tempe', badge: 'Scheduled', badgeColor: 'var(--lofty-warning-500)' },
        { type: 'campaign', title: 'Renter-to-Buyer Conversion', subtitle: '4 emails · 21 days', meta: 'First-time buyer guide + affordability calc', badge: 'Scheduled', badgeColor: 'var(--lofty-warning-500)' },
      ],
      tasks: [
        { title: 'Approve outreach copy before send', status: 'pending', priority: 'high', due: 'Today', source: 'AI Campaign Builder' },
        { title: 'Review personalization tokens for 23 leads', status: 'in-progress', priority: 'medium', due: 'Today', source: 'AI Campaign Builder' },
      ],
      automations: [
        { name: '85281 Buyer Nurture', trigger: 'Lead created with zip 85281 + buyer tag', actions: ['Send intro email', 'Wait 3 days', 'Send property alert', 'Wait 4 days', 'Schedule call task'], status: 'active', runs: 0, createdAt: 'Just now' },
        { name: '85281 Seller CMA Offer', trigger: 'Lead created with zip 85281 + seller tag', actions: ['Send CMA offer email', 'Wait 2 days', 'Send market report SMS', 'Create follow-up task'], status: 'active', runs: 0, createdAt: 'Just now' },
      ],
    };
  }

  if (q.match(/showing|appointment|schedule|book|visit|tour/)) {
    return {
      text: `I've scheduled **4 showings** for this week based on lead availability and your calendar. I also set 15-minute prep reminders and sent confirmation texts to each contact.`,
      cards: [
        { type: 'showing', title: '142 W Elm St, Tempe', subtitle: 'Sarah Chen · Tue 10:00 AM', meta: '3bd/2ba · $389K · MLS #AZ4821', badge: 'Confirmed', badgeColor: 'var(--lofty-success-500)' },
        { type: 'showing', title: '887 S Mill Ave #4, Tempe', subtitle: 'James Whitfield · Wed 2:30 PM', meta: 'Condo · $299K · 6.1% cap rate', badge: 'Confirmed', badgeColor: 'var(--lofty-success-500)' },
      ],
      tasks: [
        { title: 'Showing prep: 142 W Elm St (Tue 10 AM)', status: 'pending', priority: 'high', due: 'Monday', source: 'AI Scheduler' },
        { title: 'Send showing recap to Sarah Chen', status: 'pending', priority: 'medium', due: 'Tue PM', source: 'AI Scheduler' },
        { title: 'Post-showing follow-up: James Whitfield', status: 'pending', priority: 'medium', due: 'Wed PM', source: 'AI Scheduler' },
      ],
      automations: [
        { name: 'Showing Confirmation Flow', trigger: 'Showing booked via AI Assistant', actions: ['Send confirmation SMS to lead', 'Add 15-min prep reminder', 'Create post-showing follow-up task'], status: 'active', runs: 4, createdAt: 'Just now' },
      ],
    };
  }

  if (q.match(/cma|analysis|comparable|price|value|worth/)) {
    return {
      text: `I pulled comps for the Tempe 85281 area. Based on 14 recent sales within 0.5 miles, here's the CMA summary. I can generate a branded PDF report to send to your seller clients.`,
      cards: [
        { type: 'cma', title: 'CMA: Tempe 85281', subtitle: '14 comps · Last 90 days', meta: 'Avg sold: $387K · Avg DOM: 22 days · List-to-sale: 98.7%', badge: 'Ready', badgeColor: 'var(--lofty-brand-500)' },
      ],
      tasks: [
        { title: 'Send CMA PDF to David Okafor', status: 'pending', priority: 'high', due: 'Today', source: 'AI CMA Tool' },
        { title: 'Schedule listing consultation with Okafor', status: 'pending', priority: 'high', due: 'This week', source: 'AI CMA Tool' },
      ],
    };
  }

  if (q.match(/listing|property|mls|post|syndicate|publish/)) {
    return {
      text: `I've drafted a listing description using the property details and optimized it for search. I can syndicate to Zillow, Realtor.com, and 40+ portals with one click. AI-generated photos are also queued.`,
      cards: [
        { type: 'listing', title: '142 W Elm St, Tempe AZ 85281', subtitle: '3bd/2ba · 1,420 sqft · $389,000', meta: 'Draft ready · SEO score 94/100', badge: 'Draft', badgeColor: 'var(--lofty-warning-500)' },
      ],
      tasks: [
        { title: 'Review and approve listing copy', status: 'pending', priority: 'high', due: 'Today', source: 'AI Listing Builder' },
        { title: 'Upload professional photos', status: 'pending', priority: 'high', due: 'Tomorrow', source: 'AI Listing Builder' },
        { title: 'Syndicate to Zillow, Realtor.com, MLS', status: 'pending', priority: 'medium', due: 'This week', source: 'AI Listing Builder' },
      ],
      automations: [
        { name: 'New Listing Alert Blast', trigger: 'Listing published to MLS', actions: ['Alert matching buyer leads via email', 'Post to social media', 'Create open house task', 'Notify investor contacts'], status: 'active', runs: 0, createdAt: 'Just now' },
      ],
    };
  }

  if (q.match(/follow.?up|reminder|task|check.?in|touch|reach/)) {
    return {
      text: `I've set up a smart follow-up sequence for all active contacts. The AI will automatically reach out at the right time based on engagement signals — no manual tracking needed.`,
      tasks: [
        { title: 'Call Marcus Rivera — 7-day no response', status: 'pending', priority: 'high', due: 'Today', source: 'AI Follow-up Engine' },
        { title: 'Check in with Sarah Chen post-showing', status: 'pending', priority: 'high', due: 'Today', source: 'AI Follow-up Engine' },
        { title: 'Send monthly market update to 85281 list', status: 'pending', priority: 'medium', due: 'Friday', source: 'AI Follow-up Engine' },
        { title: 'Re-engage cold leads (last contact 30+ days)', status: 'pending', priority: 'low', due: 'Next week', source: 'AI Follow-up Engine' },
      ],
      automations: [
        { name: 'Smart Follow-up Cadence', trigger: 'Lead inactive for 7 days', actions: ['Check last touchpoint', 'Send personalized check-in', 'Create call task if no response in 48h'], status: 'active', runs: 12, createdAt: 'Just now' },
      ],
    };
  }

  if (q.match(/report|insight|stats|performance|metric|dashboard/)) {
    return {
      text: `Here's your **performance snapshot** for the week. You're outperforming the market average on response time and lead conversion. I've also identified 3 pipeline gaps worth addressing.`,
      tasks: [
        { title: 'Address 5 stale leads (>14 days cold)', status: 'pending', priority: 'high', due: 'Today', source: 'AI Insights' },
        { title: 'Update pipeline stage for 8 contacts', status: 'pending', priority: 'medium', due: 'Tomorrow', source: 'AI Insights' },
      ],
    };
  }

  return {
    text: `Got it. I'm processing your request and will take action across the Lofty CRM. I can search leads, create campaigns, schedule showings, build CMAs, manage listings, and automate follow-ups — all from this chat. What would you like me to do first?`,
  };
}

// ─── Suggested Prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  'Smart outreach automation: text + email hot leads, auto-call on positive intent',
  'Find me leads around the 85281 zip code',
  'Create outreach campaigns for these leads targeting 142 W Elm St',
  'Schedule showings with my top prospects this week',
  'Pull a CMA for Tempe 85281',
  'Publish my new listing and syndicate it everywhere',
  'Set up smart follow-ups for all active contacts',
  'Show me my performance report for this week',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  high: 'var(--lofty-danger-500)',
  medium: 'var(--lofty-warning-500)',
  low: 'var(--lofty-fg-3)',
};

const PRIORITY_BG: Record<Task['priority'], string> = {
  high: 'var(--lofty-danger-050)',
  medium: 'var(--lofty-warning-050)',
  low: 'var(--lofty-bg-muted)',
};

// ─── Card Components ──────────────────────────────────────────────────────────

function LeadCard({ card }: { card: ActionCard }) {
  return (
    <div className="rounded-lg border p-3 bg-white" style={{ borderColor: 'var(--lofty-border)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'var(--lofty-brand-500)' }}>
            {card.title.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--lofty-fg-1)' }}>{card.title}</p>
            <p className="text-[11px]" style={{ color: 'var(--lofty-fg-3)' }}>{card.subtitle}</p>
          </div>
        </div>
        {card.badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0"
            style={{ background: card.badgeColor }}>
            {card.badge}
          </span>
        )}
      </div>
      <p className="text-[11px] mt-2 pl-10" style={{ color: 'var(--lofty-fg-3)' }}>{card.meta}</p>
    </div>
  );
}

function CampaignCard({ card }: { card: ActionCard }) {
  return (
    <div className="rounded-lg border p-3 bg-white" style={{ borderColor: 'var(--lofty-border)' }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--lofty-brand-050)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lofty-brand-500)" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--lofty-fg-1)' }}>{card.title}</p>
            <p className="text-[11px]" style={{ color: 'var(--lofty-fg-3)' }}>{card.subtitle}</p>
          </div>
        </div>
        {card.badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0"
            style={{ background: card.badgeColor }}>
            {card.badge}
          </span>
        )}
      </div>
      <p className="text-[11px] mt-2 pl-9" style={{ color: 'var(--lofty-fg-3)' }}>{card.meta}</p>
    </div>
  );
}

function GenericCard({ card }: { card: ActionCard }) {
  const icons: Record<ActionCard['type'], React.ReactNode> = {
    listing: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lofty-brand-500)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    cma: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lofty-brand-500)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    showing: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lofty-brand-500)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    lead: null,
    campaign: null,
  };

  return (
    <div className="rounded-lg border p-3 bg-white" style={{ borderColor: 'var(--lofty-border)' }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--lofty-brand-050)' }}>
            {icons[card.type]}
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--lofty-fg-1)' }}>{card.title}</p>
            <p className="text-[11px]" style={{ color: 'var(--lofty-fg-3)' }}>{card.subtitle}</p>
          </div>
        </div>
        {card.badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0"
            style={{ background: card.badgeColor }}>
            {card.badge}
          </span>
        )}
      </div>
      <p className="text-[11px] mt-2 pl-9" style={{ color: 'var(--lofty-fg-3)' }}>{card.meta}</p>
    </div>
  );
}

function CardRenderer({ card }: { card: ActionCard }) {
  if (card.type === 'lead') return <LeadCard card={card} />;
  if (card.type === 'campaign') return <CampaignCard card={card} />;
  return <GenericCard card={card} />;
}

// ─── Call Card ────────────────────────────────────────────────────────────────

function formatDuration(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function CallCard({
  callState,
  callDuration,
  callError,
  calendarAdded,
  appointment,
  onAddCalendar,
  onReset,
}: {
  callState: CallStatus;
  callDuration: number;
  callError: string | null;
  calendarAdded: boolean;
  appointment: { date: string; time: string } | null;
  onAddCalendar: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border p-3 bg-white space-y-2" style={{ borderColor: 'var(--lofty-border)' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
          MR
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--lofty-fg-1)' }}>Marcus Rivera</p>
          <p className="text-[11px]" style={{ color: 'var(--lofty-fg-3)' }}>Austin, TX · Score 94 🔥</p>
        </div>
        {callState === 'active' && (
          <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: '#ECFDF5', color: '#16B47C' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16B47C] animate-pulse" />
            Live {formatDuration(callDuration)}
          </span>
        )}
      </div>

      {callState === 'connecting' && (
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: 'var(--lofty-bg-muted)' }}>
          <span className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-[12px] font-medium" style={{ color: 'var(--lofty-fg-2)' }}>Connecting call to your phone…</span>
        </div>
      )}

      {callState === 'active' && (
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16B47C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.1A16 16 0 0 0 14 15.18l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
          </svg>
          <span className="text-[12px] font-medium text-[#16B47C]">Call ringing on your phone — pick up to speak with Marcus!</span>
        </div>
      )}

      {callState === 'error' && callError && (
        <div className="py-2 px-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-[11px] text-amber-700">{callError}</p>
        </div>
      )}

      {callState === 'ended' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'var(--lofty-bg-muted)' }}>
            <span className="text-[12px] font-medium" style={{ color: 'var(--lofty-fg-2)' }}>Call ended · {formatDuration(callDuration)}</span>
            <button onClick={onReset} className="text-[11px] font-semibold hover:underline" style={{ color: 'var(--lofty-brand-500)' }}>
              Reset
            </button>
          </div>
          {appointment && !calendarAdded && (
            <button
              onClick={onAddCalendar}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ background: 'var(--lofty-brand-050)', color: 'var(--lofty-brand-500)', border: '1px solid var(--lofty-brand-200)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Add {appointment.date} {appointment.time} to Calendar
            </button>
          )}
          {calendarAdded && (
            <p className="text-center text-[11px] font-semibold" style={{ color: '#16B47C' }}>✓ Added to calendar</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  msg: Message;
  callState?: CallStatus;
  callDuration?: number;
  callError?: string | null;
  calendarAdded?: boolean;
  appointment?: { date: string; time: string } | null;
  onAddCalendar?: () => void;
  onResetCall?: () => void;
}

function MessageBubble({ msg, callState, callDuration = 0, callError = null, calendarAdded = false, appointment = null, onAddCalendar, onResetCall }: MessageBubbleProps) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  function renderText(text: string) {
    return text.split('\n').map((line, li) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={li}>
          {parts.map((p, i) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={i}>{p.slice(2, -2)}</strong>
              : p
          )}
          {li < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  }

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-xl px-4 py-2.5 text-[12px] font-medium max-w-[90%]"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#92400E' }}>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
          style={{ background: 'var(--lofty-brand-500)' }}>
          AI
        </div>
      )}
      <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className="rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed"
          style={isUser
            ? { background: 'var(--lofty-brand-500)', color: 'var(--brand-foreground)' }
            : { background: 'var(--lofty-bg-muted)', color: 'var(--lofty-fg-1)', border: '1px solid var(--lofty-border)' }
          }
        >
          {renderText(msg.text)}
        </div>
        {msg.cards && msg.cards.length > 0 && (
          <div className="space-y-2 w-full">
            {msg.cards.map((card, i) => <CardRenderer key={i} card={card} />)}
          </div>
        )}
        {msg.callCard && callState && callState !== 'idle' && (
          <div className="w-full">
            <CallCard
              callState={callState}
              callDuration={callDuration}
              callError={callError}
              calendarAdded={calendarAdded}
              appointment={appointment}
              onAddCalendar={onAddCalendar ?? (() => {})}
              onReset={onResetCall ?? (() => {})}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
        style={{ background: 'var(--lofty-brand-500)' }}>
        AI
      </div>
      <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
        style={{ background: 'var(--lofty-bg-muted)', border: '1px solid var(--lofty-border)' }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full typing-dot"
            style={{ background: 'var(--lofty-fg-3)', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PersonalAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your Lofty AI Assistant. I can handle everything in your CRM through conversation — finding leads, building outreach campaigns, scheduling showings, pulling CMAs, managing listings, and automating follow-ups. Just tell me what you need.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'tasks' | 'automations'>('tasks');
  const [callState, setCallState] = useState<CallStatus>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callId, setCallId] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [appointment, setAppointment] = useState<{ date: string; time: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (callPollRef.current) clearInterval(callPollRef.current);
    };
  }, []);

  function startCallPolling(id: string) {
    let attempts = 0;
    callPollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/vapi/status?id=${id}`);
        const data = await res.json();
        if (data.status === 'ended' || data.status === 'failed' || attempts > 60) {
          if (callPollRef.current) clearInterval(callPollRef.current);
          if (callTimerRef.current) clearInterval(callTimerRef.current);
          setCallState('ended');
          if (data.structuredData?.appointmentDate) {
            setAppointment({ date: data.structuredData.appointmentDate, time: data.structuredData.appointmentTime ?? '' });
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);
  }

  async function triggerVapiCall() {
    setCallState('connecting');
    setCallDuration(0);
    setCallError(null);
    setCalendarAdded(false);
    setAppointment(null);
    try {
      const res = await fetch('/api/vapi/call', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setCallState('error');
        setCallError(data?.error ?? 'Failed to start call. Check VAPI env vars in .env.local.');
        return;
      }
      setCallId(data.callId);
      setCallState('active');
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
      startCallPolling(data.callId);
    } catch (err) {
      setCallState('error');
      setCallError(err instanceof Error ? err.message : 'Failed to start call.');
    }
  }

  function resetCall() {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (callPollRef.current) clearInterval(callPollRef.current);
    setCallState('idle');
    setCallDuration(0);
    setCallId(null);
    setCallError(null);
    setCalendarAdded(false);
    setAppointment(null);
  }

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: uid(), role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(text);
      const aiMsg: Message = {
        id: uid(),
        role: 'assistant',
        text: response.text,
        cards: response.cards,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      if (response.tasks) {
        const newTasks: Task[] = response.tasks.map(t => ({ ...t, id: uid() }));
        setTasks(prev => [...newTasks, ...prev]);
        setSidebarTab('tasks');
      }
      if (response.automations) {
        const newAutos: Automation[] = response.automations.map(a => ({ ...a, id: uid() }));
        setAutomations(prev => [...newAutos, ...prev]);
        if (!response.tasks) setSidebarTab('automations');
      }

      if (response.triggerCallDemo) {
        // Step 2: Marcus replies ~3s after automation fires
        setTimeout(() => {
          const replyMsg: Message = {
            id: uid(),
            role: 'system',
            text: '📱 Marcus Rivera replied: "Hey yeah, I\'ve been looking at that Highland Tower listing seriously. Honestly really interested — when can we hop on a call?"',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, replyMsg]);

          // Step 3: AI detects intent + triggers call ~1.5s later
          setTimeout(() => {
            const callMsg: Message = {
              id: uid(),
              role: 'assistant',
              text: '🔥 High buying intent detected from Marcus Rivera. Initiating voice call to your phone now...',
              callCard: true,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, callMsg]);
            triggerVapiCall();
          }, 1500);
        }, 3000);
      }
    }, 1400);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function toggleTaskStatus(id: string) {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'done' ? 'pending' : 'done' }
        : t
    ));
  }

  function toggleAutomation(id: string) {
    setAutomations(prev => prev.map(a =>
      a.id === id
        ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
        : a
    ));
  }

  const pendingCount = tasks.filter(t => t.status !== 'done').length;
  const activeAutoCount = automations.filter(a => a.status === 'active').length;

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'var(--lofty-nav-h)',
        height: '100vh',
        background: 'var(--lofty-bg-page)',
      }}
    >
      {/* Page Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between"
        style={{ background: 'var(--lofty-bg-surface)', borderColor: 'var(--lofty-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'var(--lofty-brand-500)' }}>
            AI
          </div>
          <div>
            <h1 className="text-[15px] font-bold" style={{ color: 'var(--lofty-fg-1)' }}>Personal Assistant</h1>
            <p className="text-[12px]" style={{ color: 'var(--lofty-fg-3)' }}>Control your entire CRM through conversation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[12px] px-3 py-1 rounded-full"
            style={{ background: 'var(--lofty-success-050)', color: 'var(--lofty-success-500)', fontWeight: 600 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lofty-success-500)] animate-pulse" />
            AI Online
          </span>
        </div>
      </div>

      {/* Body: Chat + Sidebar */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Chat Panel ────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Suggested Prompts (only when minimal messages) */}
            {messages.length === 1 && (
              <div className="pb-2">
                <p className="text-[12px] mb-3 font-medium" style={{ color: 'var(--lofty-fg-3)' }}>Try asking...</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-[12px] px-3 py-1.5 rounded-full border transition-colors hover:border-[var(--lofty-brand-500)]"
                      style={{
                        background: 'var(--lofty-bg-surface)',
                        borderColor: 'var(--lofty-border)',
                        color: 'var(--lofty-fg-2)',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                callState={msg.callCard ? callState : undefined}
                callDuration={callDuration}
                callError={callError}
                calendarAdded={calendarAdded}
                appointment={appointment}
                onAddCalendar={() => setCalendarAdded(true)}
                onResetCall={resetCall}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t" style={{ background: 'var(--lofty-bg-surface)', borderColor: 'var(--lofty-border)' }}>
            <div className="flex items-end gap-3 rounded-xl border px-4 py-3 transition-shadow focus-within:ring-2"
              style={{
                borderColor: 'var(--lofty-border-strong)',
                background: 'var(--lofty-bg-surface)',
                '--tw-ring-color': 'var(--lofty-brand-500)',
              } as React.CSSProperties}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your AI assistant anything… find leads, create campaigns, schedule showings…"
                rows={1}
                className="flex-1 resize-none bg-transparent outline-none text-[13px] leading-relaxed"
                style={{ color: 'var(--lofty-fg-1)', maxHeight: 120 }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || isTyping}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-40"
                style={{ background: 'var(--lofty-brand-500)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p className="text-[11px] mt-2 text-center" style={{ color: 'var(--lofty-fg-4)' }}>
              Press <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--lofty-bg-muted)', border: '1px solid var(--lofty-border)' }}>Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'var(--lofty-bg-muted)', border: '1px solid var(--lofty-border)' }}>Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>

        {/* ── Sidebar Panel ─────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col border-l"
          style={{ width: 340, background: 'var(--lofty-bg-surface)', borderColor: 'var(--lofty-border)' }}
        >
          {/* Sidebar Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--lofty-border)' }}>
            {(['tasks', 'automations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className="flex-1 py-3 text-[13px] font-medium transition-colors relative"
                style={{
                  color: sidebarTab === tab ? 'var(--lofty-brand-500)' : 'var(--lofty-fg-3)',
                  background: 'transparent',
                }}
              >
                {tab === 'tasks' ? `Tasks${pendingCount > 0 ? ` (${pendingCount})` : ''}` : `Automations${activeAutoCount > 0 ? ` (${activeAutoCount})` : ''}`}
                {sidebarTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--lofty-brand-500)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {sidebarTab === 'tasks' && (
              <>
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                      style={{ background: 'var(--lofty-bg-muted)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--lofty-fg-4)" strokeWidth="1.5">
                        <polyline points="9 11 12 14 22 4"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--lofty-fg-2)' }}>No tasks yet</p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--lofty-fg-4)' }}>AI-created tasks will appear here as you chat</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="rounded-xl border p-3"
                      style={{ borderColor: 'var(--lofty-border)', background: task.status === 'done' ? 'var(--lofty-bg-muted)' : 'white' }}>
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="w-4.5 h-4.5 mt-0.5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors"
                          style={{
                            borderColor: task.status === 'done' ? 'var(--lofty-success-500)' : 'var(--lofty-border-strong)',
                            background: task.status === 'done' ? 'var(--lofty-success-500)' : 'transparent',
                          }}
                        >
                          {task.status === 'done' && (
                            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                              <polyline points="2 6 5 9 10 3"/>
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium leading-tight"
                            style={{
                              color: task.status === 'done' ? 'var(--lofty-fg-4)' : 'var(--lofty-fg-1)',
                              textDecoration: task.status === 'done' ? 'line-through' : 'none',
                            }}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[11px] px-1.5 py-0.5 rounded"
                              style={{
                                background: PRIORITY_BG[task.priority],
                                color: PRIORITY_COLORS[task.priority],
                                fontWeight: 600,
                              }}>
                              {task.priority}
                            </span>
                            <span className="text-[11px]" style={{ color: 'var(--lofty-fg-3)' }}>Due {task.due}</span>
                          </div>
                          <p className="text-[11px] mt-1" style={{ color: 'var(--lofty-fg-4)' }}>via {task.source}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {sidebarTab === 'automations' && (
              <>
                {automations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                      style={{ background: 'var(--lofty-bg-muted)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--lofty-fg-4)" strokeWidth="1.5">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--lofty-fg-2)' }}>No automations yet</p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--lofty-fg-4)' }}>Ask the AI to create campaigns or workflows</p>
                  </div>
                ) : (
                  automations.map(auto => (
                    <div key={auto.id} className="rounded-xl border p-3"
                      style={{ borderColor: 'var(--lofty-border)', background: 'white' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--lofty-fg-1)' }}>
                              {auto.name}
                            </p>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--lofty-fg-3)' }}>
                            Trigger: {auto.trigger}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleAutomation(auto.id)}
                          className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
                          style={auto.status === 'active'
                            ? { background: 'var(--lofty-success-050)', color: 'var(--lofty-success-500)' }
                            : { background: 'var(--lofty-bg-muted)', color: 'var(--lofty-fg-3)' }
                          }
                        >
                          {auto.status === 'active' ? 'Active' : 'Paused'}
                        </button>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        {auto.actions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                              style={{ background: 'var(--lofty-brand-500)' }}>{i + 1}</span>
                            <span className="text-[11px]" style={{ color: 'var(--lofty-fg-2)' }}>{action}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t" style={{ borderColor: 'var(--lofty-border)' }}>
                        <span className="text-[11px]" style={{ color: 'var(--lofty-fg-4)' }}>{auto.runs} runs · {auto.createdAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
