'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
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

    const st = ScrollTrigger.create({
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
      st.kill();
    };
  }, [end, duration, prefix, suffix, decimals, hasPlayed]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
