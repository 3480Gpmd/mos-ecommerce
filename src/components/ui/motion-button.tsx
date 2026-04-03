'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface MotionButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

const variants = {
  primary: 'bg-mos-red hover:bg-mos-red-hover text-white font-bold',
  secondary: 'bg-dark hover:bg-dark-soft text-white font-bold',
  outline: 'border border-gray-300 text-dark hover:border-dark font-medium',
};

export function MotionButton({
  href,
  children,
  variant = 'primary',
  className = '',
}: MotionButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="inline-block"
    >
      <Link
        href={href}
        className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-lg transition-colors duration-300 ${variants[variant]} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
