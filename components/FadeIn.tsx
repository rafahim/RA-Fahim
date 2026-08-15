'use client';

import { motion, type Target } from 'framer-motion';
import type { ReactNode, ElementType } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  as?: ElementType;
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  as = 'div',
}: FadeInProps) {
  const MotionComponent = motion.create(as);

  const initial: Target = { opacity: 0, x, y };
  const animate: Target = { opacity: 1, x: 0, y: 0 };

  return (
    <MotionComponent
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionComponent>
  );
}
