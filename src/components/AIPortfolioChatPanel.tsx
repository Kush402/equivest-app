'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  typing?: boolean;
}

const PORTFOLIO = {
  totalInvested: 4000,
  totalValue: 4488,
  totalEarned: 228.4,
  monthlyIncome: 24.14,
  gainPct: 12.2,
  holdings: [
    { name: 'Highland Tower',     city: 'Boston, MA',   yield: 7.4, change: 9.8,  tokens: 24, value: 1318 },
    { name: 'Azure Bay Residences', city: 'Miami, FL',  yield: 6.8, change: 14.5, tokens: 40, value: 2290 },
    { name: 'Centrepoint Plaza',  city: 'Chicago, IL',  yield: 8.1, change: 10.0, tokens: 16, value: 880  },
  ],
};

const SUGGESTED = [
  'Which property has the highest yield?',
  'How is my portfolio performing vs the market?',
  'Should I diversify into more cities?',
  'What would $500 more in Highland Tower return?',
  'When is my next distribution?',
];

function getAIResponse(query: string): string {
  const q = query.toLowerCase();

  if (/highest yield|best yield|most yield/i.test(q)) {
    return `**Centrepoint Plaza (Chicago, IL)** leads your portfolio at **8.1% yield** — earning you $5.40/month on your 16 tokens. It's 0.9% above your portfolio average of 7.2% and 2.9% above the national multifamily average.`;
  }
  if (/perform|market|vs|compared|platform/i.test(q)) {
    return `Your portfolio is up **+${PORTFOLIO.gainPct}%** — outperforming the platform average of +7.4% by 4.8 percentage points. Your blended yield of **7.2%** also beats the Lofty platform average of 5.2%. Best performer: Azure Bay Residences at +14.5%.`;
  }
  if (/diversif|more cit|spread|geographic/i.test(q)) {
    return `You're currently in 3 markets: Boston, Miami, and Chicago. **Miami (51% of portfolio)** is over-weighted. I'd suggest looking at Austin or Nashville — both trending 7%+ yield this month — to reduce geographic concentration risk.`;
  }
  if (/500|invest more|highland tower|what if/i.test(q)) {
    return `If you invested **$500 more into Highland Tower** (10 additional tokens at $50 each):\n• Monthly income: +$3.08/mo → $10.48/mo total\n• Projected 1-year gain: +$49 at current 7.4% yield\n• Portfolio value would grow to ~$4,988\n\nHighland Tower is currently at 62% funded — room to add before it closes.`;
  }
  if (/distribution|next payout|when.*pay|earn/i.test(q)) {
    return `Your next distribution is **May 15, 2026** — estimated **$${PORTFOLIO.monthlyIncome.toFixed(2)}** across all 3 properties:\n• Azure Bay: $11.34\n• Highland Tower: $7.40\n• Centrepoint: $5.40\n\nDistributions arrive via ACH within 1 business day.`;
  }
  if (/risk|safe|danger|volatile/i.test(q)) {
    return `Your portfolio has **moderate risk** overall. Azure Bay (51% allocation) has the highest concentration risk. Centrepoint Plaza has the most defensive profile — 8.1% yield, long-term commercial leases, 94% occupancy. Recommend capping any single asset below 40% of portfolio.`;
  }
  if (/sell|exit|liquidity|get out/i.test(q)) {
    return `All 3 properties have active secondary markets. Typical clearing time is **24–48 hours**. Highland Tower had 3 buy orders last week at token par. If you need to exit, Azure Bay has the highest daily volume on the secondary market right now.`;
  }
  if (/recommend|suggest|add|buy|next/i.test(q)) {
    return `Based on your 7%+ yield preference and coastal focus, I'd recommend looking at **Marina View Lofts (San Diego)** at 8.3% yield. It complements your Boston and Miami holdings with a West Coast position. Currently 34% funded — early entry before any secondary market premium.`;
  }

  return `Great question. Based on your portfolio of $${PORTFOLIO.totalInvested.toLocaleString()} invested across ${PORTFOLIO.holdings.length} properties, your total value is **$${PORTFOLIO.totalValue.toLocaleString()}** (+${PORTFOLIO.gainPct}% gain). You've earned **$${PORTFOLIO.totalEarned.toFixed(2)}** in cumulative distributions. Anything specific you'd like to dig into — yield, market trends, or rebalancing?`;
}

export default function AIPortfolioChatPanel({ onRemove }: { onRemove?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: `Hi! I'm your portfolio AI. I have full context on your **3 holdings** ($${PORTFOLIO.totalValue.toLocaleString()} value, +${PORTFOLIO.gainPct}% gain). Ask me anything about your investments.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function formatMarkdown(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    setInput('');

    const userMsg: Message = { id: Math.random().toString(36), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const delay = 600 + Math.random() * 700;
    setTimeout(() => {
      const aiMsg: Message = {
        id: Math.random().toString(36),
        role: 'ai',
        text: getAIResponse(trimmed),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  }

  return (
    <section
      data-widget-id="ai-portfolio-chat"
      className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col overflow-hidden"
      style={{ minHeight: '380px' }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-sm shadow-violet-400/30">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-900 leading-tight">Ask My Portfolio</p>
          <p className="text-[10px] text-gray-400">AI with full context on your holdings</p>
        </div>
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded gradient-brand text-white">AI</span>
        {onRemove && (
          <button onClick={onRemove} className="text-gray-300 hover:text-red-400 ml-1" aria-label="Remove widget">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#f8f8fc]">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center text-white text-[8px] font-bold mr-1.5 flex-shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
              }`}
              dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
            />
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center mr-1.5 flex-shrink-0 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTED.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-3 pt-2 border-t border-gray-100 flex-shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your portfolio..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-3 py-2 gradient-brand text-white text-sm font-bold rounded-xl shadow-sm shadow-violet-400/25 hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            →
          </button>
        </form>
      </div>
    </section>
  );
}
