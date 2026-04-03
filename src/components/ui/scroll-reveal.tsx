'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  distance?: number;
  duration?: number;
  start?: string;
  single?: boolean;
}

export function ScrollReveal({
  children,
  className = '',
  stagger = 0.15,
  distance = 40,
  duration = 0.7,
  start = 'top bottom-=80',
  single = false,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = containerRef.current;
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

        const targets = single ? [el] : Array.from(el.children);

        gsap.set(targets, { y: distance, opacity: 0 });

        const tween = gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration,
          stagger: single ? 0 : stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: 'play none none none',
          },
        });

        cleanupRef.current = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      } catch {
        if (!cancelled) {
          setRevealed(true);
        }
      }
    })();

    // Safety timeout: if GSAP hasn't revealed content after 2s, force show
    const safetyTimer = setTimeout(() => {
      setRevealed(true);
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
      cleanupRef.current?.();
    };
  }, [distance, duration, stagger, start, single]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={revealed ? { opacity: 1, transform: 'translateY(0)' } : undefined}
    >
      {children}
    </div>
  );
}
