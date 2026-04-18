import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { SYSTEM_PROMPT, TOOLS, applyPreference, coerceProfile } from '@/lib/onboarding/agent';
import { generateDashboardConfig } from '@/lib/onboarding/personalize';
import { AgentProfile } from '@/lib/onboarding/schema';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const runtime = 'nodejs';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

type SSEPayload = { type: string } & Record<string, unknown>;

function sse(payload: SSEPayload): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    messages: ChatCompletionMessageParam[];
    profile?: Partial<AgentProfile>;
  };

  let collectedProfile: Partial<AgentProfile> = body.profile ?? {};
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: SSEPayload) =>
        controller.enqueue(encoder.encode(sse(payload)));

      try {
        let currentMessages: ChatCompletionMessageParam[] = [...body.messages];

        // Agentic loop — runs until DeepSeek stops calling tools (max 10 turns)
        for (let turn = 0; turn < 10; turn++) {
          const toolCallAccumulator: Record<number, { id: string; name: string; arguments: string }> = {};
          let assistantText = '';

          const streamResponse = await client.chat.completions.create({
            model: 'deepseek-chat',
            max_tokens: 1024,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...currentMessages,
            ],
            tools: TOOLS,
            stream: true,
          });

          for await (const chunk of streamResponse) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
              assistantText += delta.content;
              send({ type: 'text', delta: delta.content });
            }

            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (!toolCallAccumulator[tc.index]) {
                  toolCallAccumulator[tc.index] = { id: tc.id ?? '', name: tc.function?.name ?? '', arguments: '' };
                  if (tc.function?.name) send({ type: 'tool_start', name: tc.function.name });
                }
                toolCallAccumulator[tc.index].arguments += tc.function?.arguments ?? '';
              }
            }
          }

          const toolCalls = Object.values(toolCallAccumulator);

          // No tool calls — model finished the conversation turn
          if (toolCalls.length === 0) break;

          const assistantMessage: ChatCompletionMessageParam = {
            role: 'assistant',
            content: assistantText || null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: tc.arguments },
            })),
          };

          const toolResults: ChatCompletionMessageParam[] = [];
          let onboardingCompleted = false;

          for (const tool of toolCalls) {
            const input = JSON.parse(tool.arguments) as Record<string, unknown>;

            if (tool.name === 'record_preference') {
              const field = input.field as keyof AgentProfile;
              collectedProfile = applyPreference(collectedProfile, field, input.value);
              send({ type: 'preference_recorded', field, value: input.value, profile: collectedProfile });
              toolResults.push({ role: 'tool', tool_call_id: tool.id, content: 'Preference saved.' });
            }

            else if (tool.name === 'suggest_features') {
              send({ type: 'feature_suggestion', painPoint: input.painPoint, features: input.features });
              toolResults.push({ role: 'tool', tool_call_id: tool.id, content: 'Feature suggestions sent to client.' });
            }

            else if (tool.name === 'complete_onboarding') {
              const finalProfile = coerceProfile({
                ...collectedProfile,
                ...(input.profile as Partial<AgentProfile>),
              });
              const dashboardConfig = generateDashboardConfig(finalProfile);
              send({ type: 'onboarding_complete', profile: finalProfile, dashboardConfig });
              toolResults.push({
                role: 'tool',
                tool_call_id: tool.id,
                content: 'Dashboard configured. Give a brief, warm summary of what you set up and what they can do first.',
              });
              onboardingCompleted = true;
            }
          }

          currentMessages = [
            ...currentMessages,
            assistantMessage,
            ...toolResults,
          ];

          // After onboarding completes, allow one final turn for the goodbye message
          if (onboardingCompleted) {
            const goodbyeStream = await client.chat.completions.create({
              model: 'deepseek-chat',
              max_tokens: 400,
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...currentMessages,
              ],
              tools: TOOLS,
              stream: true,
            });
            for await (const chunk of goodbyeStream) {
              const delta = chunk.choices[0]?.delta;
              if (delta?.content) send({ type: 'text', delta: delta.content });
            }
            break;
          }
        }

        send({ type: 'done' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        send({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  });
}
