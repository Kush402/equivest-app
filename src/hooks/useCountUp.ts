'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number; // ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  easing?: (t: number) => number;
}

// Ease out cubic
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function useCountUp({
  start = 0,
  end,
  duration = 800,
  decimals = 0,
  prefix = '',
  suffix = '',
  easing = easeOutCubic,
}: UseCountUpOptions) {
  const [value, setValue] = useState(start);
  const [displayValue, setDisplayValue] = useState(`${prefix}${start.toFixed(decimals)}${suffix}`);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevEndRef = useRef<number>(start);

  useEffect(() => {
    const from = prevEndRef.current;
    const to = end;
    prevEndRef.current = end;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const current = from + (to - from) * easedProgress;

      setValue(current);
      setDisplayValue(`${prefix}${current.toFixed(decimals)}${suffix}`);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [end, duration, decimals, prefix, suffix]);

  return { value, displayValue };
}

export function useCountUpNumber(end: number, duration = 800, decimals = 0) {
  return useCountUp({ end, duration, decimals });
}

export { easeOutCubic, easeOutExpo };
