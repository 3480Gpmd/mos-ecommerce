'use client';

import { motion } from 'framer-motion';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  /** Scale factor on hover (default 1.02) */
  hoverScale?: number;
}

export function MotionCard({
  children,
  className = '',
  hoverScale = 1.02,
}: MotionCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: hoverScale,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
