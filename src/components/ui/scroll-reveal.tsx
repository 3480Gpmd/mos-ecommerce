'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay for direct children (default 0.15s) */
  stagger?: number;
  /** Distance from bottom in px (default 40) */
  distance?: number;
  /** Animation duration in seconds (default 0.7) */
  duration?: number;
  /** Trigger offset from bottom of viewport (default "bottom-=80") */
  start?: string;
  /** Animate as a single element rather than staggering children */
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const targets = single ? el : el.children;

    gsap.set(targets, { y: distance, opacity: 0 });

    gsap.to(targets, {
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

    return () => {
      ScrollTrigger.getAll().forEach((trigger: { trigger: Element | null; kill: () => void }) => {
        if (trigger.trigger === el) trigger.kill();
      });
    };
  }, [distance, duration, stagger, start, single]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
