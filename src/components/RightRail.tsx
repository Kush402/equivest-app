'use client';

function RailIcon({ children, badge, label }: { children: React.ReactNode; badge?: number; label: string }) {
  return (
    <button
      title={label}
      aria-label={label}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--lofty-bg-muted)]"
      style={{ color: 'var(--lofty-fg-3)' }}
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
  return (
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
      <RailIcon label="Phone">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </RailIcon>
      <RailIcon label="Messages">
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
  );
}
