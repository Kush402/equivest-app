'use client';

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

const LEAD = {
  name: 'Marcus Rivera',
  initials: 'MR',
  location: 'Austin, TX',
  score: 94,
};

const CHAT_HISTORY = [
  { from: 'ai', text: "👋 Hi Marcus! I noticed you've been viewing Highland Tower 3 times this week. Based on your investment profile, our AI rates you as a high-intent lead.", time: '9:14 AM' },
  { from: 'lead', text: "Yes, I'm seriously considering it. What's the minimum investment?", time: '9:16 AM' },
  { from: 'ai', text: "The minimum is just $50 (1 token). Given your goal of 7%+ yield, I'd recommend 20–30 tokens to see meaningful monthly income. Highland Tower yields 7.4%.", time: '9:16 AM' },
  { from: 'lead', text: "That sounds reasonable. What about liquidity if I need to exit?", time: '9:19 AM' },
  { from: 'ai', text: "Tokens trade on our secondary market with typically 48-hour settlement. Your capital isn't locked up. Want to hop on a quick call to walk through the full deal?", time: '9:20 AM' },
  { from: 'lead', text: "Sure, I'm free now actually.", time: '9:21 AM' },
];

type CallState = 'idle' | 'connecting' | 'active' | 'ended' | 'error';
type Panel = 'none' | 'chat' | 'call';

interface AppointmentInfo {
  date: string;
  time: string;
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function RailIcon({
  children,
  badge,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  badge?: number;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--lofty-bg-muted)]"
      style={{
        color: active ? 'var(--lofty-brand-500)' : 'var(--lofty-fg-3)',
        background: active ? 'var(--lofty-lead-blue-bg)' : undefined,
      }}
    >
      {children}
      {badge != null && (
        <span
          className="absolute top-1 right-1 min-w-[14px] h-[14px] px-[3px] rounded-full text-[9px] font-bold flex items-center justify-center text-white"
          style={{
            background: 'var(--lofty-danger-500)',
            border: '2px solid var(--lofty-bg-surface)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export default function RightRail() {
  const [panel, setPanel] = useState<Panel>('none');
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [vapiError, setVapiError] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [panel, liveTranscript]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      vapiRef.current?.stop();
    };
  }, []);

  function togglePanel(p: Panel) {
    setPanel(prev => (prev === p ? 'none' : p));
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
          setTimeout(() => setCalendarAdded(true), 800);
        }
      } catch {
        // silent — keep polling
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

      setCallId(data.callId);
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
      setTimeout(() => setCalendarAdded(true), 800);
    }
  }

  function toggleMute() {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  }

  const isInCall = callState === 'active' || callState === 'connecting';

  return (
    <>
      {/* Slide-out panel */}
      {panel !== 'none' && (
        <div
          className="hidden md:flex flex-col fixed z-39 shadow-xl overflow-hidden"
          style={{
            width: 340,
            right: 'var(--lofty-rail-w)',
            top: 'var(--lofty-nav-h)',
            bottom: 0,
            background: 'var(--lofty-bg-surface)',
            borderLeft: '1px solid var(--lofty-border)',
          }}
        >
          {/* Panel header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {LEAD.initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">{LEAD.name}</p>
              <p className="text-white/70 text-[10px]">{LEAD.location}</p>
            </div>
            <button
              onClick={() => setPanel('none')}
              className="text-white/70 hover:text-white transition-colors ml-1"
              aria-label="Close panel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* AI Lead Score Banner */}
          <div className="bg-violet-50 border-b border-violet-100 px-4 py-2 flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white">AI</span>
            <p className="text-[11px] text-violet-700 font-medium">
              Lead score <span className="font-bold text-violet-900">{LEAD.score}/100</span> — high engagement, ready to convert
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-[var(--lofty-border)] flex-shrink-0">
            <button
              onClick={() => setPanel('chat')}
              className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${panel === 'chat' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-[var(--lofty-fg-3)] hover:text-[var(--lofty-fg-1)]'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setPanel('call')}
              className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${panel === 'call' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-[var(--lofty-fg-3)] hover:text-[var(--lofty-fg-1)]'}`}
            >
              Voice Call {isInCall && <span className="ml-1 w-1.5 h-1.5 inline-block rounded-full bg-emerald-500 animate-pulse" />}
            </button>
          </div>

          {/* Chat tab */}
          {panel === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#f8f8fc]" style={{ minHeight: 0 }}>
                {CHAT_HISTORY.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'lead' ? 'justify-end' : 'justify-start'}`}>
                    {msg.from === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-[9px] font-bold mr-1.5 flex-shrink-0 mt-0.5">
                        AI
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                      msg.from === 'lead'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.from === 'lead' ? 'text-violet-200' : 'text-gray-400'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setPanel('call')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-violet-300/40 hover:opacity-90 transition-opacity"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72 12.6 12.6 0 00.67 2.68 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.4-1.4a2 2 0 012.11-.45 12.6 12.6 0 002.68.67A2 2 0 0122 16.92z" />
                  </svg>
                  Start Voice AI Call
                </button>
              </div>
            </>
          )}

          {/* Call tab */}
          {panel === 'call' && (
            <div className="flex-1 flex flex-col px-4 py-4 gap-3 overflow-y-auto bg-[#f8f8fc]" style={{ minHeight: 0 }}>
              {vapiError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-700">
                  {vapiError}
                </div>
              )}

              {callState === 'idle' || callState === 'error' ? (
                <button
                  onClick={startCall}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-violet-300/40 hover:opacity-90 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72 12.6 12.6 0 00.67 2.68 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.4-1.4a2 2 0 012.11-.45 12.6 12.6 0 002.68.67A2 2 0 0122 16.92z" />
                  </svg>
                  Start Voice AI Call
                </button>
              ) : callState === 'connecting' ? (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold">
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
                        <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" strokeLinecap="round" />
                        <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 20v4M8 20h8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" strokeLinecap="round" />
                        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={endCall}
                    className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="End call"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-3 py-2">
                  <p className="text-[12px] text-gray-500 font-medium">Call ended · {formatDuration(callDuration)}</p>
                  <button
                    onClick={() => { setCallState('idle'); setLiveTranscript([]); setAppointment(null); setCalendarAdded(false); setCallId(null); }}
                    className="text-[11px] text-violet-600 font-semibold hover:underline"
                  >
                    Call Again
                  </button>
                </div>
              )}

              {/* Appointment structured output card */}
              {appointment && (
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 space-y-2">
                  <p className="text-[10px] text-violet-500 font-semibold uppercase tracking-wider">Appointment Booked</p>
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 flex-shrink-0">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <p className="text-[12px] font-semibold text-violet-900">{appointment.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 flex-shrink-0">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className="text-[12px] font-semibold text-violet-900">{appointment.time}</p>
                  </div>
                </div>
              )}

              {/* Fake calendar confirmation */}
              {calendarAdded && appointment && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 flex-shrink-0 mt-0.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Added appointment to your calendar on {appointment.date} at {appointment.time}
                  </p>
                </div>
              )}

              {liveTranscript.length > 0 && (
                <div className="border border-violet-100 rounded-xl bg-white p-3 space-y-1">
                  <p className="text-[10px] text-violet-500 font-semibold uppercase tracking-wider mb-1">Live Transcript</p>
                  {liveTranscript.map((line, i) => (
                    <p key={i} className="text-[11px] text-gray-600 leading-relaxed">{line}</p>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rail icons */}
      <aside
        className="hidden md:flex flex-col items-center gap-1 py-3 fixed right-0 z-40"
        style={{
          width: 'var(--lofty-rail-w)',
          top: 'var(--lofty-nav-h)',
          bottom: 0,
          background: 'var(--lofty-bg-surface)',
          borderLeft: '1px solid var(--lofty-border)',
        }}
      >
        <RailIcon label="Lofty AI">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 6.4L21 10l-5 4.6L17.2 22 12 18.3 6.8 22 8 14.6 3 10l6.6-1.6L12 2z" />
          </svg>
        </RailIcon>
        <RailIcon
          label="Voice Call"
          active={panel === 'call'}
          onClick={() => togglePanel('call')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </RailIcon>
        <RailIcon
          label="Messages"
          badge={1}
          active={panel === 'chat'}
          onClick={() => togglePanel('chat')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </RailIcon>
        <RailIcon label="Notifications" badge={2}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </RailIcon>
        <RailIcon label="Help">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </RailIcon>
      </aside>
    </>
  );
}
