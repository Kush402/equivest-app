'use client';

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

const LEAD = {
  name: 'Marcus Rivera',
  initials: 'MR',
  location: 'Austin, TX',
  score: 94,
};

type ChatMessage = {
  from: 'ai' | 'lead' | 'system';
  text: string;
  time: string;
};

type OutreachContact = {
  time: string;
  lead: string;
  property: string;
  address: string;
  intent: 'Hot' | 'Warm' | 'Cold' | string;
  reason: string;
  consent_status: string;
  messages: ChatMessage[];
};

function renderWithLinks(text: string, isOnViolet: boolean) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all ${isOnViolet ? 'text-white' : 'text-violet-600 hover:text-violet-700'}`}
          style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function initials(name: string) {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function nowLabel() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function mapsUrl(property: string, address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property} ${address}`)}`;
}

type TriggerAutoTextDetail = {
  showings: Array<{
    time: string;
    lead: string;
    property: string;
    address: string;
    intent: string;
    reason: string;
    consent_status: string;
  }>;
};

const CHAT_HISTORY: ChatMessage[] = [
  {
    from: 'ai',
    text: 'Hey Marcus! This is Alex from Vick\'s Real Estate. I saw you\'ve been checking out our Highland Tower listing — just wanted to reach out and see if you had any questions. It\'s one of our top picks right now.',
    time: '9:14 AM',
  },
  {
    from: 'lead',
    text: 'Hey Alex, yeah I\'ve been looking at it. Really like the location. What kind of returns are investors seeing on it?',
    time: '9:16 AM',
  },
  {
    from: 'ai',
    text: 'Great question! Highland Tower is currently yielding around 7.4% annually. We\'ve got investors getting monthly distributions — it\'s been one of our more consistent performers. You can get started with as little as $50, so the barrier to entry is pretty low.',
    time: '9:17 AM',
  },
  {
    from: 'lead',
    text: 'That\'s solid. I\'m a bit cautious about locking up capital though — what if I need to get out early?',
    time: '9:19 AM',
  },
  {
    from: 'ai',
    text: 'Totally understandable — that\'s actually one of the things people love about our platform. You can list your shares on our secondary market anytime. Typically clears within 48 hours. Your money\'s not trapped. Would you be open to a quick call so I can walk you through the full deal and answer anything else?',
    time: '9:20 AM',
  },
  {
    from: 'lead',
    text: 'Yeah that actually sounds good. I\'m free right now if you want to connect.',
    time: '9:21 AM',
  },
];

type CallState = 'idle' | 'connecting' | 'active' | 'ended' | 'error';

interface AppointmentInfo {
  date: string;
  time: string;
}

interface CallSummary {
  needs: string;
  budget: string;
  timeline: string;
  sentiment: 'Hot' | 'Warm' | 'Cold';
  objections: string;
  nextSteps: string;
}

const DEMO_SUMMARY: CallSummary = {
  needs: 'Passive income, coastal multifamily assets, low management overhead.',
  budget: '$2,000 – $5,000 initial investment',
  timeline: 'Ready to invest within 1–2 weeks',
  sentiment: 'Hot',
  objections: 'Liquidity concern addressed — secondary market explained.',
  nextSteps: 'Send Highland Tower deck + schedule portfolio review call.',
};

const DRAFT_MESSAGES = [
  {
    label: 'Email',
    icon: '✉️',
    body: `Hi Marcus,

Great chatting today! As discussed, Highland Tower is yielding 7.4% annually with monthly distributions and secondary market liquidity within 48 hours.

I've attached the full investment deck. You can get started with as little as $50 — no lock-up.

Looking forward to our call on April 25 at 2:00 PM.

— Alex | Vick's Real Estate`,
  },
  {
    label: 'Text',
    icon: '💬',
    body: `Hey Marcus! Great talking. Just sent over the Highland Tower deck 📄 — 7.4% yield, monthly payouts, and easy liquidity. Excited to connect on Apr 25 at 2 PM. Let me know if any Qs come up! – Alex`,
  },
  {
    label: 'Follow-up Sequence',
    icon: '🔄',
    body: `Day 1: Send deck (done ✓)\nDay 3: Check-in text — "Any questions on Highland Tower?"\nDay 7: Market update email — "Austin yield up 0.3% this week"\nDay 14: Final nudge — "Funding at 87%, locking early price"`,
  },
];

const intentColor = (intent: string) =>
  intent === 'Hot' ? '#EF4444' : intent === 'Warm' ? '#F59E0B' : '#9CA3AF';

export default function LeadChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_HISTORY);
  // null = Marcus Rivera main chat; number = outreach contact index
  const [activeContact, setActiveContact] = useState<null | number>(null);
  const [outreachContacts, setOutreachContacts] = useState<OutreachContact[]>([]);
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [vapiError, setVapiError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [summaryTab, setSummaryTab] = useState<'notes' | 'draft'>('notes');
  const [activeDraft, setActiveDraft] = useState(0);
  const [draftCopied, setDraftCopied] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, liveTranscript, messages, activeContact]);

  useEffect(() => {
    function onTriggerAutoText(e: Event) {
      const ev = e as CustomEvent<TriggerAutoTextDetail>;
      const showings = ev.detail?.showings ?? [];
      if (showings.length === 0) return;

      const contacts: OutreachContact[] = showings.map(s => {
        const url = mapsUrl(s.property, s.address);
        const firstMsg: ChatMessage = {
          from: 'ai',
          text: s.consent_status === 'opted_in'
            ? `Hey ${s.lead.split(' ')[0]}! This is Alex from Vick's Real Estate — your showing at ${s.property} is confirmed for ${s.time} today.\n\nAddress: ${s.address}\nMap: ${url}\n\nSee you there! 🏠`
            : `Outreach pending — ${s.lead} has not opted in to automated SMS. Manual follow-up recommended.`,
          time: nowLabel(),
        };
        return {
          ...s,
          intent: s.intent as OutreachContact['intent'],
          messages: [firstMsg],
        };
      });

      setOutreachContacts(contacts);
      setOpen(true);

      // Add system reminder messages after delay for opted-in contacts
      contacts.forEach((contact, idx) => {
        if (contact.consent_status === 'opted_in') {
          setTimeout(() => {
            const reminder: ChatMessage = {
              from: 'system',
              text: `System: Automated 30-min reminder SMS successfully delivered to ${contact.lead} (Buyer), the Listing Agent, and your mobile device (Agent) for the ${contact.time} showing at ${contact.property}.`,
              time: nowLabel(),
            };
            setOutreachContacts(prev =>
              prev.map((c, i) => i === idx ? { ...c, messages: [...c.messages, reminder] } : c)
            );
          }, 3000 + idx * 800);
        }
      });

      // Also add outreach summary message to Marcus Rivera chat
      const scheduleText = showings
        .slice(0, 2)
        .map(s => `${s.time} - ${s.property}`)
        .join('\n');
      const outreach: ChatMessage = {
        from: 'ai',
        text: `Hey Marcus, I used our AI routing to optimize your showings today! Schedule:\n${scheduleText}\nSee you there!`,
        time: nowLabel(),
      };
      setMessages(prev => [...prev, outreach]);
    }

    window.addEventListener('trigger-auto-text', onTriggerAutoText);
    return () => window.removeEventListener('trigger-auto-text', onTriggerAutoText);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      vapiRef.current?.stop();
    };
  }, []);

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function startPolling(id: string) {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/vapi/status?id=${id}`);
        const data = await res.json();
        if (data.status === 'ended' || data.status === 'failed' || attempts > 60) {
          if (pollRef.current) clearInterval(pollRef.current);
          setCallState('ended');
          if (timerRef.current) clearInterval(timerRef.current);
          const sd = data.structuredData as { appointmentDate?: string; appointmentTime?: string } | null;
          const appt: AppointmentInfo = {
            date: sd?.appointmentDate ?? 'April 25, 2026',
            time: sd?.appointmentTime ?? '2:00 PM',
          };
          setAppointment(appt);
          setCallSummary(DEMO_SUMMARY);
          setTimeout(() => setCalendarAdded(true), 800);
        }
      } catch {
        // silent
      }
    }, 5000);
  }

  async function startCall() {
    setVapiError(null);
    setCallState('connecting');
    setCallDuration(0);
    setAppointment(null);
    setCalendarAdded(false);

    try {
      const res = await fetch('/api/vapi/call', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setCallState('error');
        setVapiError(data?.error ?? 'Failed to start call. Check VAPI_PRIVATE_KEY and VAPI_PHONE_NUMBER_ID in .env.local.');
        return;
      }

      setCallState('active');
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
      startPolling(data.callId);
    } catch (err: unknown) {
      setCallState('error');
      setVapiError(err instanceof Error ? err.message : 'Failed to start call.');
    }
  }

  function endCall() {
    if (pollRef.current) clearInterval(pollRef.current);
    vapiRef.current?.stop();
    setCallState('ended');
    if (timerRef.current) clearInterval(timerRef.current);
    if (!appointment) {
      setAppointment({ date: 'April 25, 2026', time: '2:00 PM' });
      setCallSummary(DEMO_SUMMARY);
      setTimeout(() => setCalendarAdded(true), 800);
    }
  }

  function copyDraft() {
    navigator.clipboard.writeText(DRAFT_MESSAGES[activeDraft].body).catch(() => {});
    setDraftCopied(true);
    setTimeout(() => setDraftCopied(false), 2000);
  }

  function toggleMute() {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  }

  const isInCall = callState === 'active' || callState === 'connecting';
  const totalContacts = 1 + outreachContacts.length;
  const totalUnread = outreachContacts.reduce((acc, c) => acc + (c.messages.length > 0 ? 1 : 0), 0);

  const activeOutreach = activeContact !== null ? outreachContacts[activeContact] : null;

  return (
    <>
      {/* Floating chat bubble */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        {/* Chat panel */}
        {open && (
          <div className="w-[calc(100vw-2.5rem)] max-w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            style={{ maxHeight: 'min(580px, calc(100vh - 6rem))' }}>

            {/* Header */}
            <div className="bg-[var(--brand)] px-4 py-3 flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {activeOutreach ? initials(activeOutreach.lead) : LEAD.initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">
                  {activeOutreach ? activeOutreach.lead : LEAD.name}
                </p>
                <p className="text-white/70 text-[10px]">
                  {activeOutreach ? `${activeOutreach.property} · ${activeOutreach.time}` : LEAD.location}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-white/70 hover:text-white transition-colors w-10 h-10 -mr-2 inline-flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Contacts strip — shown when outreach contacts exist */}
            {outreachContacts.length > 0 && (
              <div className="bg-white border-b border-gray-100 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {/* Marcus Rivera */}
                <button
                  onClick={() => setActiveContact(null)}
                  className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${activeContact === null ? 'bg-violet-100' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${activeContact === null ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {LEAD.initials}
                  </div>
                  <span className="text-[9px] text-gray-600 font-medium leading-tight text-center" style={{ maxWidth: '52px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Marcus R.</span>
                </button>

                {outreachContacts.map((c, i) => (
                  <button
                    key={c.lead}
                    onClick={() => setActiveContact(i)}
                    className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${activeContact === i ? 'bg-violet-100' : 'hover:bg-gray-50'}`}
                  >
                    <div className="relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${activeContact === i ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        {initials(c.lead)}
                      </div>
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white"
                        style={{ backgroundColor: intentColor(c.intent) }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-600 font-medium leading-tight text-center" style={{ maxWidth: '52px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.lead.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* AI Lead Score Banner — shown for Marcus or outreach contacts */}
            {activeOutreach ? (
              <div className="bg-violet-50 border-b border-violet-100 px-4 py-2 flex items-center gap-2">
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: intentColor(activeOutreach.intent) }}
                >
                  {activeOutreach.intent.toUpperCase()}
                </span>
                <p className="text-[11px] text-violet-700 font-medium truncate">{activeOutreach.reason}</p>
              </div>
            ) : (
              <div className="bg-violet-50 border-b border-violet-100 px-4 py-2 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white">ALEX</span>
                <p className="text-[11px] text-violet-700 font-medium">
                  Lead score <span className="font-bold text-violet-900">{LEAD.score}/100</span> — high intent, ready to schedule a call
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[var(--lofty-bg-muted)]" style={{ minHeight: 0 }}>
              {activeOutreach ? (
                // Outreach contact messages
                activeOutreach.messages.map((msg, i) => {
                  if (msg.from === 'system') {
                    return (
                      <div
                        key={i}
                        className="bg-gray-100 text-gray-500 text-[10px] italic rounded-full px-3 py-1 mx-auto my-2 text-center w-fit max-w-[90%] leading-snug"
                      >
                        {msg.text}
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-[8px] font-bold mr-1.5 flex-shrink-0 mt-0.5">
                        VRE
                      </div>
                      <div className="max-w-[78%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm" style={{ minWidth: 0, overflow: 'hidden' }}>
                        <p className="whitespace-pre-line" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          {renderWithLinks(msg.text, false)}
                        </p>
                        <p className="text-[10px] mt-1 text-gray-400">{msg.time}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Marcus Rivera chat
                messages.map((msg, i) => {
                  if (msg.from === 'system') {
                    return (
                      <div
                        key={i}
                        className="bg-gray-100 text-gray-500 text-[10px] italic rounded-full px-3 py-1 mx-auto my-2 text-center w-fit max-w-[90%] leading-snug"
                      >
                        {msg.text}
                      </div>
                    );
                  }
                  return (
                    <div key={i} className={`flex ${msg.from === 'lead' ? 'justify-end' : 'justify-start'}`}>
                      {msg.from === 'ai' && (
                        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-[8px] font-bold mr-1.5 flex-shrink-0 mt-0.5">
                          VRE
                        </div>
                      )}
                      <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                        msg.from === 'lead'
                          ? 'bg-violet-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-line">{renderWithLinks(msg.text, msg.from === 'lead')}</p>
                        <p className={`text-[10px] mt-1 ${msg.from === 'lead' ? 'text-violet-200' : 'text-gray-400'}`}>{msg.time}</p>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Live call transcript (Marcus only) */}
              {!activeOutreach && liveTranscript.length > 0 && (
                <div className="border-t border-violet-200 pt-2 space-y-1">
                  <p className="text-[10px] text-violet-500 font-semibold uppercase tracking-wider">Live Call Transcript</p>
                  {liveTranscript.map((line, i) => (
                    <p key={i} className="text-[11px] text-gray-600 leading-relaxed">{line}</p>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Call / Error area — Marcus Rivera only */}
            {!activeOutreach && (
              <div className="px-4 py-3 bg-white border-t border-gray-100">
                {vapiError && (
                  <div className="mb-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-700">
                    {vapiError}
                  </div>
                )}

                {callState === 'idle' || callState === 'error' ? (
                  <button
                    onClick={startCall}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--brand)] text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72 12.6 12.6 0 00.67 2.68 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.4-1.4a2 2 0 012.11-.45 12.6 12.6 0 002.68.67A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Start Voice AI Call
                  </button>
                ) : callState === 'connecting' ? (
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold">
                    <span className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    Connecting…
                  </div>
                ) : callState === 'active' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[12px] font-semibold text-emerald-700">Live {formatDuration(callDuration)}</span>
                    </div>
                    <button
                      onClick={toggleMute}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${isMuted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" strokeLinecap="round"/>
                          <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 20v4M8 20h8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" strokeLinecap="round"/>
                          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={endCall}
                      className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      aria-label="End call"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-gray-500 font-medium">Call ended · {formatDuration(callDuration)}</p>
                    <button
                      onClick={() => { setCallState('idle'); setLiveTranscript([]); setAppointment(null); setCalendarAdded(false); setCallSummary(null); setSummaryTab('notes'); }}
                      className="text-[11px] text-violet-600 font-semibold hover:underline"
                    >
                      Call Again
                    </button>
                  </div>
                )}

                {/* AI Call Summary */}
                {callSummary && (
                  <div className="mt-2 rounded-xl border border-violet-200 bg-violet-50 overflow-hidden">
                    {/* Tab header */}
                    <div className="flex border-b border-violet-200">
                      <button
                        onClick={() => setSummaryTab('notes')}
                        className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${summaryTab === 'notes' ? 'bg-violet-100 text-violet-800' : 'text-violet-500 hover:text-violet-700'}`}
                      >
                        ✦ AI Call Notes
                      </button>
                      <button
                        onClick={() => setSummaryTab('draft')}
                        className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${summaryTab === 'draft' ? 'bg-violet-100 text-violet-800' : 'text-violet-500 hover:text-violet-700'}`}
                      >
                        ✉️ Draft Follow-up
                      </button>
                    </div>

                    {summaryTab === 'notes' && (
                      <div className="p-3 space-y-2">
                        {[
                          { label: 'Client Needs', value: callSummary.needs },
                          { label: 'Budget', value: callSummary.budget },
                          { label: 'Timeline', value: callSummary.timeline },
                          { label: 'Objections', value: callSummary.objections },
                          { label: 'Next Steps', value: callSummary.nextSteps },
                        ].map(row => (
                          <div key={row.label}>
                            <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">{row.label}</p>
                            <p className="text-[11px] text-gray-700 leading-snug">{row.value}</p>
                          </div>
                        ))}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${callSummary.sentiment === 'Hot' ? 'bg-red-500' : callSummary.sentiment === 'Warm' ? 'bg-amber-500' : 'bg-gray-400'}`}>
                            {callSummary.sentiment}
                          </span>
                          <span className="text-[10px] text-violet-500">Intent Signal</span>
                        </div>
                        {appointment && (
                          <div className="flex items-center gap-2 pt-1 border-t border-violet-100">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500">
                              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span className="text-[11px] font-semibold text-violet-900">{appointment.date} · {appointment.time}</span>
                            {calendarAdded && <span className="text-[9px] font-bold text-emerald-600 ml-auto">✓ Calendar</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {summaryTab === 'draft' && (
                      <div className="p-3 space-y-2">
                        <div className="flex gap-1.5">
                          {DRAFT_MESSAGES.map((d, i) => (
                            <button
                              key={i}
                              onClick={() => { setActiveDraft(i); setDraftCopied(false); }}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors ${activeDraft === i ? 'bg-violet-600 text-white' : 'bg-white text-violet-600 border border-violet-200 hover:bg-violet-50'}`}
                            >
                              {d.icon} {d.label}
                            </button>
                          ))}
                        </div>
                        <div className="bg-white rounded-lg border border-violet-100 p-2.5">
                          <pre className="text-[10px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{DRAFT_MESSAGES[activeDraft].body}</pre>
                        </div>
                        <button
                          onClick={copyDraft}
                          className={`w-full py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${draftCopied ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                        >
                          {draftCopied ? '✓ Copied!' : 'Copy to Clipboard'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Outreach contact footer */}
            {activeOutreach && (
              <div className="px-4 py-2.5 bg-white border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  {activeOutreach.consent_status === 'opted_in'
                    ? 'Automated outreach active — opted in ✓'
                    : 'No auto-text — consent pending'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat bubble button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="relative w-14 h-14 rounded-full bg-[var(--brand)] text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
          aria-label="Open lead chat"
        >
          {!open ? (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* Contact count badge when outreach active, otherwise unread badge */}
              {outreachContacts.length > 0 ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {totalContacts}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  1
                </span>
              )}
            </>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
