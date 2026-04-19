'use client';

import { useState, useRef, useEffect } from 'react';

type Stage = 'idle' | 'analyzing' | 'followup' | 'results';
interface Msg { role: 'ai' | 'user'; text: string; id: string }

const STARTERS = [
  "I'm a solo agent focused on managing leads and closing more deals",
  "I manage a team and need to track pipeline, showings, and follow-ups",
  "I want AI to help me prioritize leads and automate outreach",
  "I'm new to Lofty and want a simple CRM setup to get started",
];

const WIDGET_META: Record<string, { icon: string; title: string; desc: string }> = {
  'pipeline-overview':  { icon: '📊', title: 'Pipeline Overview',    desc: 'Lead stages: new, contacted, nurturing, under contract' },
  'new-updates':        { icon: '📢', title: 'New Updates',          desc: 'Platform news & agent tips' },
  'lead-activity':      { icon: '⚡', title: 'Lead Activity Feed',   desc: 'Real-time feed: views, form fills, email opens' },
  'ai-lead-scoring':    { icon: '🤖', title: 'AI Lead Scoring',      desc: 'AI-ranked priority leads by intent signals' },
  'need-keep-in-touch': { icon: '📞', title: 'Keep In Touch',        desc: 'Contacts overdue for follow-up' },
  'my-listings-crm':    { icon: '🏢', title: 'My Listings',          desc: 'Active MLS listings with views & inquiries' },
  'todays-tasks':       { icon: '✅', title: "Today's Tasks",        desc: 'Follow-ups, send listings, showings, referrals' },
  'appointments':       { icon: '📅', title: 'Appointments',         desc: 'AI-optimized showing schedules' },
  'hot-sheets':         { icon: '🔥', title: 'Hot Sheets',           desc: 'New listings, price reductions, open houses' },
};

function analyzeMessages(texts: string[]): string[] {
  const combined = texts.join(' ');
  const result = new Set<string>();

  result.add('pipeline-overview');
  result.add('todays-tasks');
  result.add('new-updates');

  if (/lead|client|contact|follow|crm|manage|prospect/i.test(combined)) {
    ['lead-activity', 'need-keep-in-touch', 'ai-lead-scoring'].forEach(w => result.add(w));
  }
  if (/market|listing|hot|price|trend|data|mls/i.test(combined)) {
    result.add('hot-sheets');
    result.add('my-listings-crm');
  }
  if (/schedule|appointment|showing|tour|visit/i.test(combined)) {
    result.add('appointments');
  }
  if (/ai|insight|smart|automate|intelligence|score|priorit/i.test(combined)) {
    result.add('ai-lead-scoring');
    result.add('lead-activity');
  }
  if (/listing|property|mls|seller|buyer/i.test(combined)) {
    result.add('my-listings-crm');
    result.add('hot-sheets');
  }
  if (/update|news|announcement|latest/i.test(combined)) {
    result.add('new-updates');
  }
  if (/new|start|begin|first|learn|simple/i.test(combined)) {
    ['new-updates', 'pipeline-overview', 'todays-tasks'].forEach(w => result.add(w));
  }
  if (/team|broker|scale|grow|expand/i.test(combined)) {
    ['lead-activity', 'ai-lead-scoring', 'appointments', 'hot-sheets'].forEach(w => result.add(w));
  }

  return [...result];
}

function getFollowUp(initialMsg: string): { question: string; options: string[] } {
  if (/team|broker|scale|manage/i.test(initialMsg)) {
    return {
      question: "To tune your team tools — what's your team size?",
      options: ['Solo agent', 'Small team (2–5)', 'Large team (6+)', 'Full brokerage'],
    };
  }
  if (/lead|crm|prospect|follow/i.test(initialMsg)) {
    return {
      question: "What's your biggest lead management challenge?",
      options: ['Prioritizing who to call first', 'Keeping up with follow-ups', 'Automating outreach', 'Tracking deal stages'],
    };
  }
  if (/listing|seller|buyer|showing/i.test(initialMsg)) {
    return {
      question: "Which side of the transaction do you focus on?",
      options: ['Mostly buyer clients', 'Mostly seller listings', 'Equal mix', 'New construction / investment'],
    };
  }
  return {
    question: "One last thing — which best describes you?",
    options: ['Solo agent', 'Team lead / Broker', 'New agent getting started', 'Tech-forward agent scaling fast'],
  };
}

interface Props {
  onActivate: (widgetIds: string[]) => void;
}

export default function LoftyAISetupWidget({ onActivate }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [followUp, setFollowUp] = useState<{ question: string; options: string[] } | null>(null);
  const [suggestedWidgets, setSuggestedWidgets] = useState<string[]>([]);
  const [collectedTexts, setCollectedTexts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stage]);

  function addMsg(role: 'ai' | 'user', text: string) {
    setMessages(prev => [...prev, { role, text, id: Math.random().toString(36).slice(2) }]);
  }

  function runAnalysis(texts: string[], phase: 'first' | 'second') {
    setStage('analyzing');
    setProgress(0);
    let p = 0;
    const step = phase === 'first' ? 4 : 6;
    const delay = phase === 'first' ? 55 : 35;
    const interval = setInterval(() => {
      p = Math.min(p + step, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        if (phase === 'first') {
          const fup = getFollowUp(texts[0] ?? '');
          setFollowUp(fup);
          setTimeout(() => {
            addMsg('ai', fup.question);
            setStage('followup');
          }, 150);
        } else {
          const widgets = analyzeMessages(texts);
          setSuggestedWidgets(widgets);
          setTimeout(() => {
            addMsg('ai', `Based on everything you've shared, I've curated ${widgets.length} widgets for your dashboard:`);
            setStage('results');
          }, 150);
        }
      }
    }, delay);
  }

  function sendInitial(text: string) {
    const t = text.trim();
    if (!t) return;
    setInput('');
    addMsg('user', t);
    const updated = [t];
    setCollectedTexts(updated);
    runAnalysis(updated, 'first');
  }

  function answerFollowUp(answer: string) {
    addMsg('user', answer);
    const updated = [...collectedTexts, answer];
    setCollectedTexts(updated);
    runAnalysis(updated, 'second');
  }

  return (
    <section
      data-widget-id="lofty-ai-setup"
      className="md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-violet-200 shadow-[0_2px_16px_rgba(139,92,246,0.13)] overflow-hidden"
    >
      {/* Header */}
      <div className="gradient-brand px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-[16px]">Lofty AI Setup</p>
          <p className="text-white/75 text-[12px]">Describe your workflow and I'll build your personalized dashboard</p>
        </div>
      </div>

      <div className="p-6">

        {/* ── IDLE ── */}
        {stage === 'idle' && (
          <>
            <p className="text-[13px] text-gray-500 font-medium mb-4">Start with one of these or describe it yourself:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
              {STARTERS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendInitial(s)}
                  className="text-left px-4 py-3 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-xl transition-all text-[13px] text-gray-700 hover:text-violet-700 leading-snug"
                >
                  <span className="text-violet-400 font-bold mr-1.5">✦</span>{s}
                </button>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); sendInitial(input); }} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Or describe your workflow in your own words..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2.5 gradient-brand text-white font-semibold rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                →
              </button>
            </form>
          </>
        )}

        {/* ── CHAT AREA (all post-idle states) ── */}
        {stage !== 'idle' && (
          <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
            {messages.map(msg =>
              msg.role === 'ai' ? (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                    <p className="text-[13px] text-gray-700 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex justify-end">
                  <div className="gradient-brand rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] shadow-sm">
                    <p className="text-[13px] text-white leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              )
            )}

            {stage === 'analyzing' && (
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 animate-pulse">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="flex-1 max-w-[220px]">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-brand rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Analyzing your preferences… {progress}%</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── FOLLOW-UP CHIPS ── */}
        {stage === 'followup' && followUp && (
          <div className="grid grid-cols-2 gap-2">
            {followUp.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answerFollowUp(opt)}
                className="text-left px-3 py-2.5 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-xl text-[13px] text-gray-700 hover:text-violet-700 transition-all font-medium"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        {stage === 'results' && suggestedWidgets.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              {suggestedWidgets.map(id => {
                const meta = WIDGET_META[id];
                if (!meta) return null;
                return (
                  <div key={id} className="flex items-center gap-2.5 px-3 py-2.5 bg-violet-50 border border-violet-200 rounded-xl">
                    <span className="text-lg flex-shrink-0">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-900 leading-tight">{meta.title}</p>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{meta.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => onActivate(suggestedWidgets)}
              className="w-full py-3 gradient-brand text-white font-semibold rounded-xl shadow-sm hover:opacity-90 transition-opacity text-[14px]"
            >
              Activate My Dashboard ({suggestedWidgets.length} widgets) →
            </button>
          </>
        )}

      </div>
    </section>
  );
}
