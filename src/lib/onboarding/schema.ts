// Agent profile — the core data the onboarding AI collects
export type AgentExperience = 'new-agent' | 'growing' | 'established' | 'top-producer' | 'team-lead';
export type AgentSpecialty = 'residential' | 'commercial' | 'luxury' | 'investment' | 'rentals' | 'new-construction';
export type TeamSize = 'solo' | 'small-team' | 'large-team' | 'brokerage';
export type PrimaryGoal = 'close-more-deals' | 'grow-team' | 'better-marketing' | 'save-time' | 'scale-business' | 'manage-leads';

export interface AgentProfile {
  name?: string;
  experience: AgentExperience;
  specialties: AgentSpecialty[];
  markets: string[];              // cities / regions they work in
  monthlyLeads: number;           // approx leads per month
  teamSize: TeamSize;
  primaryGoal: PrimaryGoal;
  wantsMarketingAutomation: boolean;
  wantsLeadScoring: boolean;
  wantsAIInsights: boolean;
  wantsTransactionTracking: boolean;
  wantsShowingScheduler: boolean;
  usesExistingCRM: boolean;       // migrating from another CRM?
}

// All dashboard widget types — maps to the cards teammates built
export type WidgetType =
  | 'new-updates'
  | 'announcements'
  | 'today-new-leads'
  | 'need-keep-in-touch'
  | 'todays-opportunities'
  | 'transactions'
  | 'todays-tasks'
  | 'appointments'
  | 'my-listings'
  | 'hot-sheets'
  | 'outreach-campaigns'
  | 'leads'
  | 'ai-insights'
  | 'market-intelligence'
  | 'referral-tracker'
  | 'document-center'
  | 'lead-scoring'
  | 'pipeline-overview'
  | 'showing-scheduler'
  | 'team-activity'
  | 'commission-tracker'
  | 'property-alerts';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  priority: number;             // lower = higher on page
  title: string;
  description: string;
  size: 'normal' | 'wide';
  config?: Record<string, unknown>;
}

export interface WidgetSuggestion {
  type: WidgetType;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardConfig {
  widgets: DashboardWidget[];
  widgetSuggestions: WidgetSuggestion[];
  onboardingComplete: boolean;
  profile: AgentProfile;
}

export const DEFAULT_PROFILE: AgentProfile = {
  experience: 'growing',
  specialties: ['residential'],
  markets: [],
  monthlyLeads: 10,
  teamSize: 'solo',
  primaryGoal: 'close-more-deals',
  wantsMarketingAutomation: false,
  wantsLeadScoring: false,
  wantsAIInsights: true,
  wantsTransactionTracking: true,
  wantsShowingScheduler: false,
  usesExistingCRM: false,
};

export const WIDGET_CATALOG: Record<WidgetType, { title: string; description: string; defaultSize: 'normal' | 'wide' }> = {
  'new-updates':           { title: 'New Updates',           description: 'Latest platform news and sponsored listings',               defaultSize: 'normal' },
  'announcements':         { title: 'Announcements',          description: 'Important market and brokerage announcements',             defaultSize: 'normal' },
  'today-new-leads':       { title: "Today's New Leads",      description: 'Fresh leads that need immediate attention',                defaultSize: 'normal' },
  'need-keep-in-touch':    { title: 'Need Keep In Touch',     description: 'Contacts due for follow-up: birthdays, check-ins',        defaultSize: 'normal' },
  'todays-opportunities':  { title: "Today's Opportunities",  description: 'High-intent leads, likely sellers, back-to-site visits',  defaultSize: 'normal' },
  'transactions':          { title: 'Transactions',           description: 'Active deals: deadlines, pending tasks, status',          defaultSize: 'normal' },
  'todays-tasks':          { title: "Today's Tasks",          description: 'Calls, texts, emails, and follow-ups due today',          defaultSize: 'normal' },
  'appointments':          { title: 'Appointments & Showings', description: 'Scheduled meetings and property tours',                  defaultSize: 'normal' },
  'my-listings':           { title: 'My Listings',            description: 'Active listings with engagement and price history',       defaultSize: 'normal' },
  'hot-sheets':            { title: 'Hot Sheets',             description: 'Market-wide: new listings, price reductions, open houses', defaultSize: 'normal' },
  'outreach-campaigns':    { title: 'Outreach Campaigns',     description: 'Automated email, SMS, and drip campaigns',               defaultSize: 'normal' },
  'leads':                 { title: 'Current Leads',          description: 'Full lead list with source, score, and status',          defaultSize: 'wide'   },
  'ai-insights':           { title: 'AI Insights',            description: 'AI-powered recommendations: who to call, what to send',  defaultSize: 'normal' },
  'market-intelligence':   { title: 'Market Intelligence',    description: 'Local trends: days-on-market, price/sqft, absorption',   defaultSize: 'normal' },
  'referral-tracker':      { title: 'Referral Tracker',       description: 'Track agent-to-agent referrals and commissions',         defaultSize: 'normal' },
  'document-center':       { title: 'Document Center',        description: 'Contracts, disclosures, and e-signatures in one place',  defaultSize: 'normal' },
  'lead-scoring':          { title: 'Lead Scoring',           description: 'AI-ranked leads by intent, timeline, and fit',           defaultSize: 'normal' },
  'pipeline-overview':     { title: 'Pipeline Overview',      description: 'Visual funnel: prospect → contract → closed',            defaultSize: 'wide'   },
  'showing-scheduler':     { title: 'Showing Scheduler',      description: 'Auto-schedule property tours with smart availability',   defaultSize: 'normal' },
  'team-activity':         { title: 'Team Activity',          description: 'Live feed of what your team is working on',              defaultSize: 'normal' },
  'commission-tracker':    { title: 'Commission Tracker',     description: 'YTD earnings, pending commissions, projections',         defaultSize: 'normal' },
  'property-alerts':       { title: 'Property Alerts',        description: 'Instant alerts when listings match your buyers\' criteria', defaultSize: 'normal' },
};
