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
  const gsapReady = useRef(false);
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

        gsapReady.current = true;

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

    // Safety timeout: if GSAP animation hasn't played after 3s, force show
    // This also clears GSAP inline styles on children so they become visible
    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        const el2 = containerRef.current;
        if (el2 && gsapReady.current) {
          // GSAP set opacity:0 on children — clear those inline styles
          const targets = single ? [el2] : Array.from(el2.children);
          targets.forEach((t) => {
            if (t instanceof HTMLElement) {
              t.style.opacity = '1';
              t.style.transform = 'translateY(0px)';
            }
          });
        }
        setRevealed(true);
      }
    }, 3000);

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
