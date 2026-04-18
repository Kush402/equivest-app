import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { SYSTEM_PROMPT, TOOLS, applyPreference, coerceProfile } from '@/lib/onboarding/agent';
import { generateDashboardConfig } from '@/lib/onboarding/personalize';
import { AgentProfile } from '@/lib/onboarding/schema';

export const runtime = 'nodejs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type SSEPayload = { type: string } & Record<string, unknown>;

function sse(payload: SSEPayload): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    messages: Anthropic.MessageParam[];
    profile?: Partial<AgentProfile>;
  };

  let collectedProfile: Partial<AgentProfile> = body.profile ?? {};
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: SSEPayload) =>
        controller.enqueue(encoder.encode(sse(payload)));

      try {
        let currentMessages: Anthropic.MessageParam[] = [...body.messages];

        // Agentic loop — runs until Claude stops calling tools (max 10 turns)
        for (let turn = 0; turn < 10; turn++) {
          const toolUseBlocks: Anthropic.ToolUseBlock[] = [];

          const anthropicStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            tools: TOOLS,
            messages: currentMessages,
          });

          // Stream text tokens to client in real time
          anthropicStream.on('text', (text) => {
            send({ type: 'text', delta: text });
          });

          // Notify client when a tool call starts
          anthropicStream.on('contentBlock', (block) => {
            if (block.type === 'tool_use') {
              send({ type: 'tool_start', name: block.name });
            }
          });

          const finalMessage = await anthropicStream.finalMessage();

          for (const block of finalMessage.content) {
            if (block.type === 'tool_use') toolUseBlocks.push(block);
          }

          // No tool calls — Claude finished the conversation turn
          if (toolUseBlocks.length === 0) break;

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          let onboardingCompleted = false;

          for (const tool of toolUseBlocks) {
            const input = tool.input as Record<string, unknown>;

            if (tool.name === 'record_preference') {
              const field = input.field as keyof AgentProfile;
              collectedProfile = applyPreference(collectedProfile, field, input.value);
              send({ type: 'preference_recorded', field, value: input.value, profile: collectedProfile });
              toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Preference saved.' });
            }

            else if (tool.name === 'suggest_features') {
              send({ type: 'feature_suggestion', painPoint: input.painPoint, features: input.features });
              toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Feature suggestions sent to client.' });
            }

            else if (tool.name === 'complete_onboarding') {
              const finalProfile = coerceProfile({
                ...collectedProfile,
                ...(input.profile as Partial<AgentProfile>),
              });
              const dashboardConfig = generateDashboardConfig(finalProfile);
              send({ type: 'onboarding_complete', profile: finalProfile, dashboardConfig });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: tool.id,
                content: 'Dashboard configured. Give a brief, warm summary of what you set up and what they can do first.',
              });
              onboardingCompleted = true;
            }
          }

          currentMessages = [
            ...currentMessages,
            { role: 'assistant', content: finalMessage.content },
            { role: 'user',      content: toolResults },
          ];

          // After onboarding completes, allow one final turn for Claude's goodbye, then stop
          if (onboardingCompleted) {
            const goodbyeStream = client.messages.stream({
              model: 'claude-sonnet-4-6',
              max_tokens: 400,
              system: SYSTEM_PROMPT,
              tools: TOOLS,
              messages: currentMessages,
            });
            goodbyeStream.on('text', (text) => send({ type: 'text', delta: text }));
            await goodbyeStream.finalMessage();
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
