'use client';

import { useState, useEffect, useRef } from 'react';

type ChatMessage = {
  from: 'ai' | 'system';
  text: string;
  time: string;
};

type Showing = {
  time: string;
  lead: string;
  property: string;
  address: string;
  intent: string;
  reason: string;
  consent_status: string;
};

interface Props {
  showing: Showing;
  offsetRight: number;
  onClose: () => void;
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

export default function LeadOutreachChatWindow({ showing, offsetRight, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${showing.property} ${showing.address}`)}`;
    const outreachMsg: ChatMessage = {
      from: 'ai',
      text: showing.consent_status === 'opted_in'
        ? `Hey ${showing.lead.split(' ')[0]}! This is Alex from Vick's Real Estate — just a heads-up that your showing at ${showing.property} is confirmed for ${showing.time} today.\n\nAddress: ${showing.address}\nMap: ${mapsUrl}\n\nSee you there! 🏠`
        : `Outreach pending — ${showing.lead} has not opted in to automated SMS. Manual follow-up recommended.`,
      time: nowLabel(),
    };

    setMessages([outreachMsg]);

    if (showing.consent_status === 'opted_in') {
      const t = setTimeout(() => {
        const reminderMsg: ChatMessage = {
          from: 'system',
          text: `System: Automated 30-min reminder SMS successfully delivered to ${showing.lead} (Buyer), the Listing Agent, and your mobile device (Agent) for the ${showing.time} showing at ${showing.property}.`,
          time: nowLabel(),
        };
        setMessages(prev => [...prev, reminderMsg]);
      }, 3000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0) {
      setUnread(messages.length);
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open]);

  const intentColor =
    showing.intent === 'Hot' ? '#EF4444' :
    showing.intent === 'Warm' ? '#F59E0B' :
    '#9CA3AF';

  return (
    <div
      className="fixed bottom-6 z-40 flex flex-col items-end gap-2"
      style={{ right: `${offsetRight}px` }}
    >
      {/* Chat panel */}
      {open && (
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ width: '300px', maxHeight: 'min(420px, calc(100vh - 6rem))' }}
        >
          {/* Header */}
          <div className="bg-[var(--brand)] px-3 py-2.5 flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                {initials(showing.lead)}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">{showing.lead}</p>
              <p className="text-white/70 text-[10px]">{showing.property} · {showing.time}</p>
            </div>
            <button
              onClick={() => { setOpen(false); onClose(); }}
              aria-label="Close chat"
              className="text-white/70 hover:text-white transition-colors w-8 h-8 -mr-1 inline-flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Intent badge */}
          <div className="bg-violet-50 border-b border-violet-100 px-3 py-1.5 flex items-center gap-2">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: intentColor }}
            >
              {showing.intent.toUpperCase()}
            </span>
            <p className="text-[10px] text-violet-700 font-medium truncate">{showing.reason}</p>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-[var(--lofty-bg-muted)]"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, i) => {
              if (msg.from === 'system') {
                return (
                  <div
                    key={i}
                    className="bg-gray-100 text-gray-500 text-[10px] italic rounded-full px-3 py-1 mx-auto my-1 text-center w-fit max-w-[95%] leading-snug"
                  >
                    {msg.text}
                  </div>
                );
              }
              return (
                <div key={i} className="flex justify-start">
                  <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-[7px] font-bold mr-1.5 flex-shrink-0 mt-0.5">
                    VRE
                  </div>
                  <div className="max-w-[82%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm">
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <p className="text-[9px] mt-1 text-gray-400">{msg.time}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="px-3 py-2.5 bg-white border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              {showing.consent_status === 'opted_in'
                ? 'Automated outreach active — opted in ✓'
                : 'No auto-text — consent pending'}
            </div>
          </div>
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center relative transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'var(--brand)' }}
        aria-label={`Open chat with ${showing.lead}`}
      >
        <span className="text-white font-bold text-xs">{initials(showing.lead)}</span>
        {unread > 0 && !open && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
