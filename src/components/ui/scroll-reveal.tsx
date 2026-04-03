'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

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

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [distance, duration, stagger, start, single]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
