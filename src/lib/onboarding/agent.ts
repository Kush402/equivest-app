import Anthropic from '@anthropic-ai/sdk';
import {
  AgentProfile, AgentExperience, AgentSpecialty, TeamSize, PrimaryGoal,
} from './schema';

export const SYSTEM_PROMPT = `You are the Lofty AI onboarding assistant — a friendly, knowledgeable guide helping real estate agents set up their personalized dashboard.

Your job is to understand each agent through natural conversation, then use your tools to build them a dashboard that matches how they actually work.

## Conversation flow
1. Greet them warmly — ask their name and what market they work in
2. Learn their experience level (new agent? growing? top producer? running a team?)
3. Ask about their primary focus right now (close more deals? grow leads? better marketing? save time?)
4. Ask about their team size — solo agent, small team, or large brokerage?
5. Ask about their lead volume — roughly how many leads they get per month?
6. Gauge which tools matter most: marketing automation? AI lead scoring? transaction tracking? showing scheduler?
7. Ask about their specialties (residential, luxury, investment, commercial, rentals?)
8. Once you have enough info, call complete_onboarding to build their dashboard

## Tone
- Warm and practical — agents are busy, they hate fluff
- Skip real estate basics — these are professionals
- One or two questions per message, never a paragraph of questions
- Reference Lofty features naturally ("we can set up drip campaigns for that", "our AI lead scoring handles that")
- If they describe a pain point, map it to a Lofty feature

## Important
- Use record_preference as you learn each piece — don't wait until the end
- At minimum you need: experience, primaryGoal, and teamSize to complete onboarding
- If agent is vague ("I handle everything"), pick the closest option and confirm it`;

export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'record_preference',
    description: 'Record a single agent preference field as you learn it. Call in real time during conversation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        field: {
          type: 'string',
          enum: [
            'name', 'experience', 'specialties', 'markets', 'monthlyLeads',
            'teamSize', 'primaryGoal', 'wantsMarketingAutomation', 'wantsLeadScoring',
            'wantsAIInsights', 'wantsTransactionTracking', 'wantsShowingScheduler', 'usesExistingCRM',
          ],
          description: 'The AgentProfile field to update',
        },
        value: {
          description: 'Value to set. Arrays for array fields, booleans for feature flags, numbers for numeric fields.',
        },
      },
      required: ['field', 'value'],
    },
  },
  {
    name: 'suggest_features',
    description: 'Recommend specific Lofty features based on what the agent just described. Use when an agent mentions a pain point.',
    input_schema: {
      type: 'object' as const,
      properties: {
        painPoint: { type: 'string', description: 'What the agent said they struggle with' },
        features:  { type: 'array',  items: { type: 'string' }, description: 'Widget/feature types that would help' },
      },
      required: ['painPoint', 'features'],
    },
  },
  {
    name: 'complete_onboarding',
    description: 'Finalize onboarding with the complete agent profile. Generates their personalized dashboard. Call when you have at minimum: experience, primaryGoal, and teamSize.',
    input_schema: {
      type: 'object' as const,
      properties: {
        profile: {
          type: 'object',
          description: 'Complete AgentProfile',
          properties: {
            name:                     { type: 'string' },
            experience:               { type: 'string', enum: ['new-agent', 'growing', 'established', 'top-producer', 'team-lead'] },
            specialties:              { type: 'array', items: { type: 'string' } },
            markets:                  { type: 'array', items: { type: 'string' } },
            monthlyLeads:             { type: 'number' },
            teamSize:                 { type: 'string', enum: ['solo', 'small-team', 'large-team', 'brokerage'] },
            primaryGoal:              { type: 'string', enum: ['close-more-deals', 'grow-team', 'better-marketing', 'save-time', 'scale-business', 'manage-leads'] },
            wantsMarketingAutomation: { type: 'boolean' },
            wantsLeadScoring:         { type: 'boolean' },
            wantsAIInsights:          { type: 'boolean' },
            wantsTransactionTracking: { type: 'boolean' },
            wantsShowingScheduler:    { type: 'boolean' },
            usesExistingCRM:          { type: 'boolean' },
          },
          required: ['experience', 'teamSize', 'primaryGoal', 'specialties', 'markets', 'monthlyLeads',
                     'wantsMarketingAutomation', 'wantsLeadScoring', 'wantsAIInsights',
                     'wantsTransactionTracking', 'wantsShowingScheduler', 'usesExistingCRM'],
        },
      },
      required: ['profile'],
    },
  },
];

export function applyPreference(
  current: Partial<AgentProfile>,
  field: keyof AgentProfile,
  value: unknown,
): Partial<AgentProfile> {
  return { ...current, [field]: value };
}

export function coerceProfile(partial: Partial<AgentProfile>): AgentProfile {
  return {
    name:                     partial.name,
    experience:               (partial.experience as AgentExperience)  ?? 'growing',
    specialties:              (partial.specialties as AgentSpecialty[]) ?? ['residential'],
    markets:                  (partial.markets as string[])             ?? [],
    monthlyLeads:             (partial.monthlyLeads as number)          ?? 10,
    teamSize:                 (partial.teamSize as TeamSize)            ?? 'solo',
    primaryGoal:              (partial.primaryGoal as PrimaryGoal)      ?? 'close-more-deals',
    wantsMarketingAutomation: (partial.wantsMarketingAutomation as boolean) ?? false,
    wantsLeadScoring:         (partial.wantsLeadScoring as boolean)     ?? false,
    wantsAIInsights:          (partial.wantsAIInsights as boolean)      ?? true,
    wantsTransactionTracking: (partial.wantsTransactionTracking as boolean) ?? true,
    wantsShowingScheduler:    (partial.wantsShowingScheduler as boolean) ?? false,
    usesExistingCRM:          (partial.usesExistingCRM as boolean)      ?? false,
  };
}
