import { NextRequest } from 'next/server';
import { generateDashboardConfig } from '@/lib/onboarding/personalize';
import { AgentProfile } from '@/lib/onboarding/schema';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json() as { profile: AgentProfile };

    if (!profile || !profile.experience || !profile.primaryGoal) {
      return Response.json({ error: 'Invalid profile — experience and primaryGoal are required.' }, { status: 400 });
    }

    const dashboardConfig = generateDashboardConfig(profile);
    return Response.json(dashboardConfig);
  } catch {
    return Response.json({ error: 'Failed to generate dashboard config.' }, { status: 500 });
  }
}
