import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const FALLBACKS: Record<string, string> = {
  'portfolio-stats':        'Your Portfolio Overview card aggregates all your tokenized property investments into one glance: total capital deployed, current market value, cumulative rental income earned, and your estimated monthly cashflow. The gain percentage updates as property valuations change.',
  'new-updates':            'New Updates & Announcements is your real-time news feed. Platform announcements (new property launches, distribution schedules, regulatory updates) appear here first. The Sponsored tab shows operator-placed listings — swipe past anything irrelevant.',
  'today-new-investments':  "Today's New Investments tracks your recent token purchases. Each row shows the property, your token count, and current yield. Click any row to open the full property detail page with charts and documents.",
  'todays-opportunities':   "Today's Opportunities is AI-curated: it surfaces properties that match your stated yield target and risk profile. High Yield shows properties paying 7%+, Top Gainers are appreciating fastest, Back to Site lists re-tokenized assets.",
  'transactions':           'Transactions logs every financial event — rental income distributions hitting your account and token purchases you\'ve made. Distributions (green) are recurring monthly; purchases (gray) are one-time. Use this to reconcile your tax reporting.',
  'todays-tasks':           "Today's Tasks is your action shortcut bar. Invest takes you straight to the marketplace filtered to new listings. Withdraw opens the earnings withdrawal flow. Browse shows all properties. Refer copies your referral link for sharing.",
  'my-listings':            'My Holdings lists every property you own tokens in, with city, current valuation, and token count. Click any property to see its financial projections, lease documents, and tokenomics breakdown.',
  'market-pulse':           'Market Pulse shows platform-wide activity: how many new properties tokenized this week, the average yield across all active listings, total assets under management, and which cities are seeing the most investor activity.',
  'ai-recommendations':     'AI Recommendations are generated fresh each session by analyzing your existing portfolio allocation, preferred yield range, and investment history. Each pick includes a one-line reason so you understand the logic, not just the suggestion.',
  'portfolio-performance':  'The Portfolio Performance chart plots your total portfolio value over the last 12 months alongside your invested capital baseline and ROI percentage. Hover any point to see the exact value and gain on that date.',
  'asset-allocation':       'Asset Allocation breaks down what percentage of your portfolio each property represents. A diversified portfolio typically spreads across 4–6 properties. The donut chart updates automatically as you invest in new properties or existing valuations shift.',
};

export async function POST(req: NextRequest) {
  const { widgetId, widgetTitle, message } = await req.json() as {
    widgetId: string;
    widgetTitle: string;
    message: string;
  };

  if (!message || !widgetId) {
    return Response.json({ error: 'widgetId and message are required.' }, { status: 400 });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY ?? '',
      baseURL: 'https://api.deepseek.com',
    });

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are an expert guide for Lofty, a tokenized real estate investment platform.
You explain dashboard widgets clearly to investors of all experience levels.
Keep answers concise (2–4 sentences max), practical, and jargon-free.
The widget being discussed is: "${widgetTitle}".`,
        },
        { role: 'user', content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? FALLBACKS[widgetId] ?? 'I can help explain this widget! Try asking a specific question about it.';
    return Response.json({ reply });
  } catch {
    const fallback = FALLBACKS[widgetId] ?? `The ${widgetTitle} widget helps you track your investment activity on Lofty. Ask a specific question and I'll do my best to help!`;
    return Response.json({ reply: fallback });
  }
}
