'use client';

import { useState, useCallback, useRef } from 'react';
import { AgentProfile, DashboardConfig } from '@/lib/onboarding/schema';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface OnboardingState {
  messages: ChatMessage[];
  profile: Partial<AgentProfile>;
  dashboardConfig: DashboardConfig | null;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
}

const STORAGE_KEY = 'lofty_onboarding';

function loadFromStorage(): { profile: Partial<AgentProfile>; config: DashboardConfig | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: {}, config: null };
    return JSON.parse(raw);
  } catch {
    return { profile: {}, config: null };
  }
}

function saveToStorage(profile: Partial<AgentProfile>, config: DashboardConfig | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, config }));
  } catch { /* storage unavailable */ }
}

export function clearOnboarding() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function useOnboarding() {
  const saved = typeof window !== 'undefined' ? loadFromStorage() : { profile: {}, config: null };

  const [state, setState] = useState<OnboardingState>({
    messages: [],
    profile: saved.profile,
    dashboardConfig: saved.config,
    isStreaming: false,
    isComplete: !!saved.config,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userText: string) => {
    // Append user message immediately
    const userMsg: ChatMessage = { role: 'user', content: userText };
    setState(s => ({ ...s, messages: [...s.messages, userMsg], isStreaming: true, error: null }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Build message history for the API
    const apiMessages = [...state.messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, profile: state.profile }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error('Stream request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      // Append placeholder for assistant message
      setState(s => ({ ...s, messages: [...s.messages, { role: 'assistant', content: '' }] }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;

          try {
            const event = JSON.parse(raw) as Record<string, unknown>;

            if (event.type === 'text') {
              assistantText += event.delta as string;
              setState(s => {
                const msgs = [...s.messages];
                msgs[msgs.length - 1] = { role: 'assistant', content: assistantText };
                return { ...s, messages: msgs };
              });
            }

            if (event.type === 'preference_recorded') {
              const field = event.field as keyof AgentProfile;
              const value = event.value;
              setState(s => {
                const profile = { ...s.profile, [field]: value };
                saveToStorage(profile, s.dashboardConfig);
                return { ...s, profile };
              });
            }

            if (event.type === 'onboarding_complete') {
              const profile = event.profile as AgentProfile;
              const dashboardConfig = event.dashboardConfig as DashboardConfig;
              saveToStorage(profile, dashboardConfig);
              setState(s => ({ ...s, profile, dashboardConfig, isComplete: true }));
            }

            if (event.type === 'done') {
              setState(s => ({ ...s, isStreaming: false }));
            }

            if (event.type === 'error') {
              setState(s => ({ ...s, isStreaming: false, error: event.message as string }));
            }
          } catch { /* ignore malformed SSE lines */ }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setState(s => ({ ...s, isStreaming: false, error: 'Connection error — please try again.' }));
    } finally {
      setState(s => ({ ...s, isStreaming: false }));
    }
  }, [state.messages, state.profile]);

  const startOnboarding = useCallback(() => {
    sendMessage('Hello, I\'d like to set up my dashboard.');
  }, [sendMessage]);

  const reset = useCallback(() => {
    clearOnboarding();
    setState({ messages: [], profile: {}, dashboardConfig: null, isStreaming: false, isComplete: false, error: null });
  }, []);

  return { ...state, sendMessage, startOnboarding, reset };
}
