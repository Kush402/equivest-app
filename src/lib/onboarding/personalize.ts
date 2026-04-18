import {
  AgentProfile, DashboardConfig, DashboardWidget,
  WidgetSuggestion, WidgetType, WIDGET_CATALOG,
} from './schema';

// Core widgets every agent gets — mirrors the existing 9-card dashboard
const CORE_WIDGETS: WidgetType[] = [
  'new-updates',
  'today-new-leads',
  'todays-opportunities',
  'need-keep-in-touch',
  'transactions',
  'todays-tasks',
  'appointments',
  'my-listings',
  'hot-sheets',
];

function selectWidgets(profile: AgentProfile): WidgetType[] {
  const selected = new Set<WidgetType>(CORE_WIDGETS);

  // Primary goal drives main additions
  if (profile.primaryGoal === 'close-more-deals') {
    selected.add('pipeline-overview');
    selected.add('ai-insights');
    selected.add('document-center');
  }
  if (profile.primaryGoal === 'manage-leads') {
    selected.add('leads');
    selected.add('lead-scoring');
    selected.add('ai-insights');
  }
  if (profile.primaryGoal === 'better-marketing') {
    selected.add('outreach-campaigns');
    selected.add('market-intelligence');
    selected.add('property-alerts');
  }
  if (profile.primaryGoal === 'save-time') {
    selected.add('outreach-campaigns');
    selected.add('showing-scheduler');
    selected.add('ai-insights');
  }
  if (profile.primaryGoal === 'grow-team' || profile.primaryGoal === 'scale-business') {
    selected.add('team-activity');
    selected.add('pipeline-overview');
    selected.add('commission-tracker');
    selected.add('referral-tracker');
  }

  // Explicit opt-ins from onboarding
  if (profile.wantsMarketingAutomation) {
    selected.add('outreach-campaigns');
    selected.add('property-alerts');
  }
  if (profile.wantsLeadScoring) {
    selected.add('lead-scoring');
    selected.add('leads');
  }
  if (profile.wantsAIInsights) {
    selected.add('ai-insights');
    selected.add('market-intelligence');
  }
  if (profile.wantsTransactionTracking) {
    selected.add('pipeline-overview');
    selected.add('commission-tracker');
  }
  if (profile.wantsShowingScheduler) {
    selected.add('showing-scheduler');
  }

  // Team size
  if (profile.teamSize === 'large-team' || profile.teamSize === 'brokerage') {
    selected.add('team-activity');
    selected.add('referral-tracker');
    selected.add('commission-tracker');
  }

  // Experience level
  if (profile.experience === 'new-agent') {
    selected.add('ai-insights');       // needs more guidance
    selected.delete('team-activity'); // irrelevant for solo new agent
  }
  if (profile.experience === 'top-producer' || profile.experience === 'team-lead') {
    selected.add('market-intelligence');
    selected.add('pipeline-overview');
    selected.add('commission-tracker');
  }

  // Lead volume
  if (profile.monthlyLeads >= 30) {
    selected.add('lead-scoring');
    selected.add('outreach-campaigns');
  }

  // Specialties
  if (profile.specialties.includes('luxury')) {
    selected.add('market-intelligence');
  }
  if (profile.specialties.includes('investment')) {
    selected.add('market-intelligence');
    selected.add('commission-tracker');
  }

  return Array.from(selected);
}

const WIDGET_PRIORITY: Partial<Record<WidgetType, number>> = {
  'new-updates':          0,
  'today-new-leads':      1,
  'todays-opportunities': 2,
  'need-keep-in-touch':   3,
  'transactions':         4,
  'todays-tasks':         5,
  'appointments':         6,
  'my-listings':          7,
  'hot-sheets':           8,
  'pipeline-overview':    9,
  'leads':                10,
  'lead-scoring':         11,
  'outreach-campaigns':   12,
  'ai-insights':          13,
  'market-intelligence':  14,
  'showing-scheduler':    15,
  'team-activity':        16,
  'commission-tracker':   17,
  'property-alerts':      18,
  'referral-tracker':     19,
  'document-center':      20,
  'announcements':        21,
};

function buildWidgets(profile: AgentProfile): DashboardWidget[] {
  const types = selectWidgets(profile);
  return types
    .map(type => {
      const meta = WIDGET_CATALOG[type];
      return {
        id: type,
        type,
        priority: WIDGET_PRIORITY[type] ?? 99,
        title: meta.title,
        description: meta.description,
        size: meta.defaultSize,
      } satisfies DashboardWidget;
    })
    .sort((a, b) => a.priority - b.priority);
}

function buildSuggestions(profile: AgentProfile, currentTypes: WidgetType[]): WidgetSuggestion[] {
  const has = (t: WidgetType) => currentTypes.includes(t);
  const suggestions: WidgetSuggestion[] = [];

  if (!has('outreach-campaigns')) {
    suggestions.push({
      type: 'outreach-campaigns',
      title: WIDGET_CATALOG['outreach-campaigns'].title,
      reason: `With ${profile.monthlyLeads} leads/month, automated drip campaigns could save you hours each week.`,
      priority: 'high',
    });
  }
  if (!has('lead-scoring') && profile.monthlyLeads >= 10) {
    suggestions.push({
      type: 'lead-scoring',
      title: WIDGET_CATALOG['lead-scoring'].title,
      reason: 'AI ranks your leads by intent so you always call the most likely-to-close first.',
      priority: 'high',
    });
  }
  if (!has('pipeline-overview')) {
    suggestions.push({
      type: 'pipeline-overview',
      title: WIDGET_CATALOG['pipeline-overview'].title,
      reason: 'See every deal\'s stage at a glance — never miss a deadline again.',
      priority: 'medium',
    });
  }
  if (!has('showing-scheduler')) {
    suggestions.push({
      type: 'showing-scheduler',
      title: WIDGET_CATALOG['showing-scheduler'].title,
      reason: 'Auto-schedule showings based on buyer and agent availability — no back-and-forth.',
      priority: 'medium',
    });
  }
  if (!has('market-intelligence')) {
    suggestions.push({
      type: 'market-intelligence',
      title: WIDGET_CATALOG['market-intelligence'].title,
      reason: `Stay sharp on trends in ${profile.markets[0] ?? 'your market'} to give clients better advice.`,
      priority: 'low',
    });
  }

  return suggestions.slice(0, 5);
}

export function generateDashboardConfig(profile: AgentProfile): DashboardConfig {
  const widgets = buildWidgets(profile);
  return {
    widgets,
    widgetSuggestions: buildSuggestions(profile, widgets.map(w => w.type)),
    onboardingComplete: true,
    profile,
  };
}

export function suggestWidgetsForProfile(
  profile: AgentProfile,
  currentWidgetTypes: WidgetType[],
): WidgetSuggestion[] {
  return buildSuggestions(profile, currentWidgetTypes);
}
