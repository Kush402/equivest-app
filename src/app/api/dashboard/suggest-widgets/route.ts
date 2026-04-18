import { NextRequest } from 'next/server';
import { suggestWidgetsForProfile } from '@/lib/onboarding/personalize';
import { AgentProfile, WidgetType, WIDGET_CATALOG } from '@/lib/onboarding/schema';

export const runtime = 'nodejs';

// POST /api/dashboard/suggest-widgets
// Body: { profile: AgentProfile; currentWidgets: WidgetType[] }
// Returns: { suggestions: WidgetSuggestion[]; catalog: typeof WIDGET_CATALOG }
export async function POST(req: NextRequest) {
  try {
    const { profile, currentWidgets } = await req.json() as {
      profile: AgentProfile;
      currentWidgets: WidgetType[];
    };

    if (!profile) {
      return Response.json({ error: 'Profile required.' }, { status: 400 });
    }

    const suggestions = suggestWidgetsForProfile(profile, currentWidgets ?? []);

    // Also return the full catalog so the client can render the widget picker
    return Response.json({ suggestions, catalog: WIDGET_CATALOG });
  } catch {
    return Response.json({ error: 'Failed to generate suggestions.' }, { status: 500 });
  }
}
