'use client';

import { useState, useEffect, useRef } from 'react';
import { AgentExperience, AgentSpecialty, PrimaryGoal, TeamSize } from '@/lib/onboarding/schema';

const STORAGE_KEY = 'lofty_onboarding_v2';

interface OnboardingProfile {
  name: string;
  experience: AgentExperience;
  specialties: AgentSpecialty[];
  primaryGoal: PrimaryGoal;
  teamSize: TeamSize;
  wantsAIInsights: boolean;
  wantsLeadScoring: boolean;
  wantsMarketingAutomation: boolean;
  wantsShowingScheduler: boolean;
}

interface OnboardingModalProps {
  onComplete: (profile: OnboardingProfile) => void;
}

type Step =
  | 'welcome'
  | 'name'
  | 'experience'
  | 'goal'
  | 'team'
  | 'features'
  | 'completing'
  | 'done';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </span>
  );
}

function AIBubble({ text, isTyping }: { text: string; isTyping?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-400/30">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="white" stroke="none"/>
        </svg>
      </div>
      <div className="max-w-[82%] bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
        {isTyping ? <TypingDots /> : (
          <p className="text-[14px] text-gray-700 leading-relaxed">{text}</p>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[72%] gradient-brand rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm shadow-violet-400/20">
        <p className="text-[14px] text-white leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

const AI_MESSAGES: Record<Step, string> = {
  welcome: "Hi there! 👋 I'm your Lofty AI assistant. I'll personalize your dashboard in about 60 seconds — asking a few quick questions to tailor everything to how you work. Ready to get started?",
  name: "Awesome! What's your name?",
  experience: "Great to meet you, {name}! How long have you been in real estate?",
  goal: "Perfect. What's your #1 focus right now?",
  team: "Got it! Are you working solo or with a team?",
  features: "Almost done! Which AI features would you like enabled on your dashboard?",
  completing: "Personalizing your dashboard now...",
  done: '',
};

const EXPERIENCE_OPTIONS: { value: AgentExperience; label: string; emoji: string }[] = [
  { value: 'new-agent',    label: 'Just starting out (< 1 yr)',    emoji: '🌱' },
  { value: 'growing',      label: 'Building momentum (1–3 yrs)',   emoji: '📈' },
  { value: 'established',  label: 'Well established (3–7 yrs)',    emoji: '🏆' },
  { value: 'top-producer', label: 'Top producer (7+ yrs)',         emoji: '💎' },
  { value: 'team-lead',    label: 'Team leader / Broker',          emoji: '👑' },
];

const GOAL_OPTIONS: { value: PrimaryGoal; label: string; emoji: string }[] = [
  { value: 'close-more-deals',    label: 'Close more deals',        emoji: '🤝' },
  { value: 'manage-leads',        label: 'Manage leads better',     emoji: '📋' },
  { value: 'better-marketing',    label: 'Improve marketing',       emoji: '📣' },
  { value: 'save-time',           label: 'Save time & automate',    emoji: '⚡' },
  { value: 'grow-team',           label: 'Grow my team',            emoji: '👥' },
  { value: 'scale-business',      label: 'Scale my business',       emoji: '🚀' },
];

const TEAM_OPTIONS: { value: TeamSize; label: string; emoji: string }[] = [
  { value: 'solo',        label: 'Just me',             emoji: '🙋' },
  { value: 'small-team',  label: 'Small team (2–5)',    emoji: '👫' },
  { value: 'large-team',  label: 'Large team (6–20)',   emoji: '👥' },
  { value: 'brokerage',   label: 'Full brokerage',      emoji: '🏢' },
];

const FEATURE_OPTIONS = [
  { key: 'wantsAIInsights',           label: 'AI Insights',              desc: 'Who to call, what to send',     emoji: '🧠' },
  { key: 'wantsLeadScoring',          label: 'Lead Scoring',             desc: 'Rank leads by intent & fit',    emoji: '🎯' },
  { key: 'wantsMarketingAutomation',  label: 'Marketing Automation',     desc: 'Drip campaigns & auto-replies', emoji: '📧' },
  { key: 'wantsShowingScheduler',     label: 'Showing Scheduler',        desc: 'Smart property tour booking',   emoji: '📅' },
] as const;

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState<Partial<OnboardingProfile>>({
    wantsAIInsights: true,
    wantsLeadScoring: false,
    wantsMarketingAutomation: false,
    wantsShowingScheduler: false,
  });
  const [nameInput, setNameInput] = useState('');
  const [features, setFeatures] = useState({
    wantsAIInsights: true,
    wantsLeadScoring: false,
    wantsMarketingAutomation: false,
    wantsShowingScheduler: false,
  });
  const [completingProgress, setCompletingProgress] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addAIMessage = (text: string, afterMs = 600) => {
    setIsTyping(true);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(m => [...m, { id: crypto.randomUUID(), role: 'ai', text }]);
        resolve();
      }, afterMs);
    });
  };

  const addUserMessage = (text: string) => {
    setMessages(m => [...m, { id: crypto.randomUUID(), role: 'user', text }]);
  };

  // Show first message on mount
  useEffect(() => {
    addAIMessage(AI_MESSAGES.welcome, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleWelcome = () => {
    addUserMessage("Let's do it!");
    setTimeout(() => {
      setStep('name');
      addAIMessage(AI_MESSAGES.name, 700);
    }, 300);
  };

  const handleName = () => {
    const name = nameInput.trim() || 'there';
    addUserMessage(name);
    setProfile(p => ({ ...p, name }));
    setTimeout(() => {
      setStep('experience');
      addAIMessage(AI_MESSAGES.experience.replace('{name}', name), 700);
    }, 300);
  };

  const handleExperience = (value: AgentExperience, label: string) => {
    addUserMessage(label);
    setProfile(p => ({ ...p, experience: value }));
    setTimeout(() => {
      setStep('goal');
      addAIMessage(AI_MESSAGES.goal, 700);
    }, 300);
  };

  const handleGoal = (value: PrimaryGoal, label: string) => {
    addUserMessage(label);
    setProfile(p => ({ ...p, primaryGoal: value }));
    setTimeout(() => {
      setStep('team');
      addAIMessage(AI_MESSAGES.team, 700);
    }, 300);
  };

  const handleTeam = (value: TeamSize, label: string) => {
    addUserMessage(label);
    setProfile(p => ({ ...p, teamSize: value }));
    setTimeout(() => {
      setStep('features');
      addAIMessage(AI_MESSAGES.features, 700);
    }, 300);
  };

  const handleFeatureToggle = (key: string) => {
    setFeatures(f => ({ ...f, [key]: !f[key as keyof typeof f] }));
  };

  const handleFeaturesConfirm = () => {
    const selected = FEATURE_OPTIONS.filter(f => features[f.key]).map(f => f.label);
    addUserMessage(selected.length > 0 ? selected.join(', ') : 'Just the core features for now');
    setStep('completing');
    addAIMessage(AI_MESSAGES.completing, 500).then(() => {
      const interval = setInterval(() => {
        setCompletingProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 4;
        });
      }, 60);
    });
  };

  useEffect(() => {
    if (completingProgress >= 100 && step === 'completing') {
      const finalProfile: OnboardingProfile = {
        name: profile.name || 'Alex',
        experience: profile.experience || 'growing',
        specialties: ['residential'],
        primaryGoal: profile.primaryGoal || 'close-more-deals',
        teamSize: profile.teamSize || 'solo',
        ...features,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ complete: true, profile: finalProfile }));
      onComplete(finalProfile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completingProgress, step]);

  const STEP_ORDER: Step[] = ['welcome', 'name', 'experience', 'goal', 'team', 'features'];
  const stepIndex = STEP_ORDER.indexOf(step);
  const progressPct = stepIndex < 0 ? 100 : Math.round((stepIndex / (STEP_ORDER.length - 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f5f6f8] rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-sm shadow-violet-400/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-gray-900">Lofty AI Setup</p>
            <p className="text-[11px] text-gray-400">Personalizing your dashboard</p>
          </div>
          {step !== 'completing' && (
            <div className="text-right">
              <p className="text-[11px] font-bold text-violet-600">{stepIndex >= 0 ? stepIndex + 1 : STEP_ORDER.length}/{STEP_ORDER.length}</p>
              <p className="text-[10px] text-gray-400">steps</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full gradient-brand transition-all duration-500"
            style={{ width: step === 'completing' ? `${completingProgress}%` : `${progressPct}%` }}
          />
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.map(msg =>
            msg.role === 'ai'
              ? <AIBubble key={msg.id} text={msg.text} />
              : <UserBubble key={msg.id} text={msg.text} />
          )}
          {isTyping && <AIBubble text="" isTyping />}

          {/* Completing progress overlay in chat */}
          {step === 'completing' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
                <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-[200px]">
                <div
                  className="h-2 gradient-brand rounded-full transition-all duration-200"
                  style={{ width: `${completingProgress}%` }}
                />
              </div>
              <p className="text-[12px] text-gray-500 font-medium">{completingProgress}% complete</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Action area */}
        {!isTyping && step !== 'completing' && (
          <div className="bg-white border-t border-gray-100 px-4 py-4">

            {step === 'welcome' && (
              <button
                onClick={handleWelcome}
                className="w-full py-3 gradient-brand text-white font-semibold rounded-xl shadow-sm shadow-violet-400/25 hover:opacity-90 transition-opacity text-[14px]"
              >
                Let&apos;s get started →
              </button>
            )}

            {step === 'name' && (
              <form onSubmit={e => { e.preventDefault(); handleName(); }} className="flex gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Your first name..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 gradient-brand text-white font-semibold rounded-xl shadow-sm shadow-violet-400/25 hover:opacity-90 transition-opacity text-[14px]"
                >
                  →
                </button>
              </form>
            )}

            {step === 'experience' && (
              <div className="grid grid-cols-1 gap-2">
                {EXPERIENCE_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => handleExperience(o.value, `${o.emoji} ${o.label}`)}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-xl transition-all text-left group"
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className="text-[14px] font-medium text-gray-700 group-hover:text-violet-700">{o.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 'goal' && (
              <div className="grid grid-cols-2 gap-2">
                {GOAL_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => handleGoal(o.value, `${o.emoji} ${o.label}`)}
                    className="flex flex-col items-center gap-1.5 px-3 py-4 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-xl transition-all text-center group"
                  >
                    <span className="text-2xl">{o.emoji}</span>
                    <span className="text-[12px] font-semibold text-gray-700 group-hover:text-violet-700 leading-tight">{o.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 'team' && (
              <div className="grid grid-cols-2 gap-2">
                {TEAM_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => handleTeam(o.value, `${o.emoji} ${o.label}`)}
                    className="flex flex-col items-center gap-1.5 px-3 py-4 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-xl transition-all text-center group"
                  >
                    <span className="text-2xl">{o.emoji}</span>
                    <span className="text-[12px] font-semibold text-gray-700 group-hover:text-violet-700">{o.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 'features' && (
              <div className="space-y-2">
                {FEATURE_OPTIONS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => handleFeatureToggle(f.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      features[f.key]
                        ? 'bg-violet-50 border-violet-300 text-violet-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="text-[13px] font-semibold">{f.label}</p>
                      <p className="text-[11px] opacity-70">{f.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      features[f.key] ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white'
                    }`}>
                      {features[f.key] && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
                <button
                  onClick={handleFeaturesConfirm}
                  className="w-full mt-2 py-3 gradient-brand text-white font-semibold rounded-xl shadow-sm shadow-violet-400/25 hover:opacity-90 transition-opacity text-[14px]"
                >
                  Build my dashboard →
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export type { OnboardingProfile };

export function useOnboardingComplete() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setIsComplete(parsed.complete === true);
        setProfile(parsed.profile ?? null);
      } else {
        setIsComplete(false);
      }
    } catch {
      setIsComplete(false);
    }
  }, []);

  return { isComplete, setIsComplete, profile, setProfile };
}
