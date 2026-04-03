'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
  end: number;
  /** Duration in seconds (default 2) */
  duration?: number;
  /** Prefix (e.g. "+" or "€") */
  prefix?: string;
  /** Suffix (e.g. "+" or "k") */
  suffix?: string;
  /** Decimal places (default 0) */
  decimals?: number;
  className?: string;
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
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasPlayed) return;

    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom-=60',
      once: true,
      onEnter: () => {
        setHasPlayed(true);
        gsap.to(obj, {
          val: end,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${prefix}${obj.val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${suffix}`;
          },
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger: { trigger: Element | null; kill: () => void }) => {
        if (trigger.trigger === el) trigger.kill();
      });
    };
  }, [end, duration, prefix, suffix, decimals, hasPlayed]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
