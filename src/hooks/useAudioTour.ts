'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface AudioTourStep {
  id: string;
  text: string;          // narration text — also shown as caption
  highlightSelector?: string; // CSS selector to highlight during this step
  durationMs?: number;   // how long before auto-advancing (0 = manual only)
}

interface AudioTourOptions {
  rate?: number;         // speech rate (default 1.0)
  pitch?: number;        // pitch (default 1.0)
  voice?: string;        // voice name — defaults to first English voice
  autoAdvance?: boolean; // auto-advance after durationMs (default true)
}

export function useAudioTour(steps: AudioTourStep[], options: AudioTourOptions = {}) {
  const [currentStep, setCurrentStep] = useState(-1);   // -1 = not started
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { rate = 1, pitch = 1, autoAdvance = true } = options;

  // Wait for voices to load (browsers load them async)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const check = () => {
      if (speechSynthesis.getVoices().length > 0) setVoiceReady(true);
    };
    check();
    speechSynthesis.addEventListener('voiceschanged', check);
    return () => speechSynthesis.removeEventListener('voiceschanged', check);
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setIsSpeaking(false);
  }, []);

  const speakStep = useCallback((index: number) => {
    if (!voiceReady || index < 0 || index >= steps.length) return;
    stopSpeech();

    const step = steps[index];
    const utterance = new SpeechSynthesisUtterance(step.text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick an English voice if available
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && !v.name.includes('Google'));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (autoAdvance && step.durationMs !== 0) {
        const delay = step.durationMs ?? 800;
        autoAdvanceTimer.current = setTimeout(() => {
          setCurrentStep(i => {
            const next = i + 1;
            if (next < steps.length) {
              speakStep(next);
              return next;
            } else {
              setIsPlaying(false);
              return i;
            }
          });
        }, delay);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [voiceReady, steps, rate, pitch, autoAdvance, stopSpeech]);

  const start = useCallback(() => {
    setIsPlaying(true);
    setCurrentStep(0);
    speakStep(0);
  }, [speakStep]);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.pause();
    }
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.resume();
    }
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
    setIsPlaying(false);
    setCurrentStep(-1);
  }, [stopSpeech]);

  const goToStep = useCallback((index: number) => {
    setCurrentStep(index);
    speakStep(index);
  }, [speakStep]);

  const next = useCallback(() => {
    const next = currentStep + 1;
    if (next < steps.length) goToStep(next);
    else stop();
  }, [currentStep, steps.length, goToStep, stop]);

  const prev = useCallback(() => {
    const prev = currentStep - 1;
    if (prev >= 0) goToStep(prev);
  }, [currentStep, goToStep]);

  // Cleanup on unmount
  useEffect(() => () => { stopSpeech(); }, [stopSpeech]);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const activeStep = currentStep >= 0 ? steps[currentStep] : null;

  return {
    currentStep,
    activeStep,
    isPlaying,
    isSpeaking,
    isSupported,
    voiceReady,
    totalSteps: steps.length,
    start,
    pause,
    resume,
    stop,
    next,
    prev,
    goToStep,
  };
}

// Pre-built dashboard tour steps
export const DASHBOARD_TOUR_STEPS: AudioTourStep[] = [
  {
    id: 'welcome',
    text: 'Welcome to your personalized Lofty dashboard! I\'ve set this up based on how you work. Let me walk you through what\'s here.',
    durationMs: 1000,
  },
  {
    id: 'leads',
    text: 'At the top left, you\'ll see today\'s new leads. These are fresh contacts that need immediate attention — the ones most likely to convert if you reach out in the next few hours.',
    highlightSelector: '[data-widget="today-new-leads"]',
    durationMs: 800,
  },
  {
    id: 'opportunities',
    text: 'Next to it, Today\'s Opportunities shows your high-intent contacts — people who just revisited a listing, or are showing strong buying signals. These are your warm leads.',
    highlightSelector: '[data-widget="todays-opportunities"]',
    durationMs: 800,
  },
  {
    id: 'tasks',
    text: 'Today\'s Tasks keeps you on track — calls, texts, and emails due today are all here so nothing falls through the cracks.',
    highlightSelector: '[data-widget="todays-tasks"]',
    durationMs: 800,
  },
  {
    id: 'campaigns',
    text: 'Your Outreach Campaigns widget lets you set up automated drip sequences — so your leads keep getting touched even when you\'re busy closing deals.',
    highlightSelector: '[data-widget="outreach-campaigns"]',
    durationMs: 800,
  },
  {
    id: 'ai',
    text: 'The AI Insights card is your secret weapon. It tells you exactly who to call today, what to say, and which listings to send — all personalized to each contact.',
    highlightSelector: '[data-widget="ai-insights"]',
    durationMs: 800,
  },
  {
    id: 'add-widget',
    text: 'See the plus button in the corner? Click it anytime to add more widgets. Lofty\'s AI will suggest which ones make sense for your workflow.',
    durationMs: 800,
  },
  {
    id: 'done',
    text: 'That\'s your dashboard! Everything here was chosen based on your goals. You can rearrange, add, or remove widgets anytime. Let\'s close some deals.',
    durationMs: 0,
  },
];
