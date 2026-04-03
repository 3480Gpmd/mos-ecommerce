'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

function formatNumber(value: number, decimals: number, prefix: string, suffix: string): string {
  const formatted = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${prefix}${formatted}${suffix}`;
}

export function CountUp({
  end,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [displayValue, setDisplayValue] = useState(formatNumber(0, decimals, prefix, suffix));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    (async () => {
      try {
        const gsapModule = await import('gsap');
        const scrollTriggerModule = await import('gsap/ScrollTrigger');

        if (cancelled) return;

        const gsap = gsapModule.default;
        const { ScrollTrigger } = scrollTriggerModule;
        gsap.registerPlugin(ScrollTrigger);

        const obj = { val: 0 };

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom-=60',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: end,
              duration,
              ease: 'power2.out',
              onUpdate: () => {
                setDisplayValue(formatNumber(obj.val, decimals, prefix, suffix));
              },
            });
          },
        });

        cleanupRef.current = () => {
          st.kill();
        };
      } catch {
        // If GSAP fails, show final value
        if (!cancelled) {
          setDisplayValue(formatNumber(end, decimals, prefix, suffix));
        }
      }
    })();

    // Safety: show final value after 3s
    const safetyTimer = setTimeout(() => {
      setDisplayValue(formatNumber(end, decimals, prefix, suffix));
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
      cleanupRef.current?.();
    };
  }, [end, duration, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
