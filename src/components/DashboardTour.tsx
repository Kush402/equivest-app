'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TourStep {
  widgetId: string;
  title: string;
  description: string;
}

export const ALL_TOUR_STEPS: TourStep[] = [
  { widgetId: 'portfolio-stats',       title: 'Portfolio Overview',            description: 'Your total investment snapshot — value, earnings, and monthly income all in one card.' },
  { widgetId: 'new-updates',           title: 'New Updates & Announcements',   description: 'Platform news, new property launches, distribution announcements, and sponsored listings.' },
  { widgetId: 'today-new-investments', title: "Today's New Investments",        description: 'Your active token holdings with quick access to each property\'s yield and performance.' },
  { widgetId: 'todays-opportunities',  title: "Today's Opportunities",          description: 'AI-surfaced high-yield and top-gaining properties matched to your investment profile.' },
  { widgetId: 'transactions',          title: 'Transactions',                   description: 'A full log of rental income distributions and token purchases for your records.' },
  { widgetId: 'todays-tasks',          title: "Today's Tasks",                  description: 'Quick-action shortcuts: invest, withdraw earnings, browse properties, or refer friends.' },
  { widgetId: 'my-listings',           title: 'My Holdings',                    description: 'Every tokenized property you own, with current valuation and token count at a glance.' },
  { widgetId: 'market-pulse',          title: 'Market Pulse',                   description: 'Live platform metrics — new listings, average yields, total AUM, and trending cities.' },
  { widgetId: 'ai-recommendations',    title: 'AI Recommendations',             description: 'Personalized property picks generated from your portfolio, goals, and investment history.' },
  { widgetId: 'portfolio-performance', title: 'Portfolio Performance',          description: '12-month chart plotting your portfolio value, invested capital baseline, and ROI trend.' },
  { widgetId: 'asset-allocation',      title: 'Asset Allocation',               description: 'Donut chart showing how your capital is spread across each property by percentage.' },
];

const TOOLTIP_W = 400;
const SPOTLIGHT_PAD = 10;
const TOOLTIP_HEIGHT_ESTIMATE = 240;

interface DashboardTourProps {
  onDone: () => void;
}

export default function DashboardTour({ onDone }: DashboardTourProps) {
  const [stepIdx, setStepIdx]   = useState(0);
  const [steps, setSteps]       = useState<TourStep[]>([]);
  const [rect, setRect]         = useState<DOMRect | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [aiReply, setAiReply]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build active steps once on mount (only steps whose element exists in DOM)
  useEffect(() => {
    const active = ALL_TOUR_STEPS.filter(s =>
      document.querySelector(`[data-widget-id="${s.widgetId}"]`) !== null
    );
    setSteps(active);
  }, []);

  const measureRect = useCallback((idx: number, stepList: TourStep[]) => {
    const step = stepList[idx];
    if (!step) return;
    const el = document.querySelector(`[data-widget-id="${step.widgetId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Wait for scroll to settle before measuring
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setRect(el.getBoundingClientRect());
    }));
  }, []);

  // Measure on step change
  useEffect(() => {
    if (steps.length > 0) measureRect(stepIdx, steps);
    setAiReply('');
    setShowChat(false);
    setChatInput('');
  }, [stepIdx, steps, measureRect]);

  // Update rect on scroll (widget moves relative to viewport)
  useEffect(() => {
    const step = steps[stepIdx];
    if (!step) return;
    const onScroll = () => {
      const el = document.querySelector(`[data-widget-id="${step.widgetId}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [stepIdx, steps]);

  const askAI = useCallback(async (question: string) => {
    const step = steps[stepIdx];
    if (!step || !question.trim()) return;
    setIsLoading(true);
    setAiReply('');
    try {
      const res = await fetch('/api/tour/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetId: step.widgetId, widgetTitle: step.title, message: question }),
      });
      const data = await res.json() as { reply?: string };
      setAiReply(data.reply ?? '');
    } catch {
      setAiReply('Sorry, I couldn\'t fetch an explanation right now. Try again!');
    } finally {
      setIsLoading(false);
    }
  }, [steps, stepIdx]);

  const handleExplainMore = () => {
    setShowChat(true);
    const step = steps[stepIdx];
    if (step) askAI(`Explain the "${step.title}" widget in detail — what data does it show, and how should I use it?`);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setShowChat(true);
    askAI(chatInput);
    setChatInput('');
  };

  const goNext = () => {
    if (stepIdx < steps.length - 1) setStepIdx(s => s + 1);
    else onDone();
  };

  const goPrev = () => {
    if (stepIdx > 0) setStepIdx(s => s - 1);
  };

  if (steps.length === 0 || !rect) return null;

  const step = steps[stepIdx];
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1400;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;

  // Tooltip horizontal position: centered on widget, clamped to viewport
  const centerX = rect.left + rect.width / 2;
  const tooltipLeft = Math.max(12, Math.min(centerX - TOOLTIP_W / 2, vw - TOOLTIP_W - 12));

  // Tooltip vertical: below widget if space, otherwise above
  const spaceBelow = vh - rect.bottom;
  const showAbove = spaceBelow < TOOLTIP_HEIGHT_ESTIMATE + 60;
  const tooltipTop = showAbove
    ? Math.max(12, rect.top - TOOLTIP_HEIGHT_ESTIMATE - 20)
    : rect.bottom + 16;

  // SVG spotlight dimensions
  const sx = rect.left - SPOTLIGHT_PAD;
  const sy = rect.top - SPOTLIGHT_PAD;
  const sw = rect.width + SPOTLIGHT_PAD * 2;
  const sh = rect.height + SPOTLIGHT_PAD * 2;

  return (
    <>
      {/* Dark overlay with spotlight hole */}
      <svg
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
        aria-hidden="true"
      >
        <defs>
          <mask id="equivest-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={sx} y={sy} width={sw} height={sh} fill="black" rx="14" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.62)" mask="url(#equivest-tour-mask)" />
        {/* Violet glow ring around target */}
        <rect x={sx - 1} y={sy - 1} width={sw + 2} height={sh + 2}
          fill="none" stroke="rgba(139,92,246,0.75)" strokeWidth="2.5" rx="15" />
      </svg>

      {/* Tooltip card */}
      <div
        className="fixed z-[61] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
        style={{ left: tooltipLeft, top: tooltipTop, width: TOOLTIP_W, maxHeight: '70vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient top bar */}
        <div className="gradient-brand h-1.5 w-full flex-shrink-0" />

        <div className="p-5 flex-1 overflow-y-auto min-h-0">
          {/* Step counter + title */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mb-0.5">
                Step {stepIdx + 1} of {steps.length}
              </p>
              <h3 className="text-[17px] font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                {step.title}
              </h3>
            </div>
            <button
              onClick={onDone}
              className="text-gray-300 hover:text-gray-500 flex-shrink-0 transition-colors mt-0.5"
              aria-label="Skip tour"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-[14px] text-gray-600 leading-relaxed mb-3">{step.description}</p>

          {/* AI response area */}
          {(showChat || aiReply || isLoading) && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <p className="text-[11px] font-semibold text-violet-700">AI Assistant</p>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-gray-700 leading-relaxed">{aiReply}</p>
              )}
            </div>
          )}

          {/* AI chat input */}
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask AI anything about this widget..."
              className="flex-1 text-[13px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="px-3 py-2 rounded-lg gradient-brand text-white text-[13px] font-semibold disabled:opacity-40 transition-opacity flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>

        {/* Navigation footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50 flex-shrink-0">
          {/* Explain More */}
          {!showChat && (
            <button
              onClick={handleExplainMore}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-violet-600 hover:text-violet-800 transition-colors mr-auto"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" />
                <path d="M12 17h.01" strokeLinecap="round" />
              </svg>
              Explain More
            </button>
          )}
          {showChat && <div className="mr-auto" />}

          {/* Step dots */}
          <div className="flex items-center gap-1 mr-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIdx(i)}
                className={`rounded-full transition-all ${i === stepIdx ? 'w-4 h-1.5 bg-violet-600' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>

          {stepIdx > 0 && (
            <button
              onClick={goPrev}
              className="px-3 py-1.5 text-[13px] font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-all"
            >
              ← Back
            </button>
          )}
          <button
            onClick={goNext}
            className="px-4 py-1.5 text-[13px] font-semibold text-white rounded-lg gradient-brand shadow-sm shadow-violet-400/25 hover:opacity-90 transition-opacity"
          >
            {stepIdx === steps.length - 1 ? 'Done ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </>
  );
}
