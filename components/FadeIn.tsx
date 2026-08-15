'use client';

import { motion, useReducedMotion, type Target } from 'framer-motion';
import { useMemo, type CSSProperties, type ReactNode, type ElementType } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

// A gentle "decelerate" curve -- quick to get moving, then settles softly
// with no overshoot. Reads as premium/intentional rather than mechanical
// linear-ish easing.
const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  style,
  as = 'div',
}: FadeInProps) {
  // motion.create() builds a brand-new component type each time it's
  // called. Calling it directly in the render body meant every re-render
  // (e.g. once CMS content finishes loading and a parent re-renders)
  // produced a *new* component identity, which forces React to unmount
  // and remount the underlying DOM node -- resetting any in-progress
  // animation, re-triggering whileInView, and occasionally causing a
  // visible flash. Memoizing per instance (re-created only if `as`
  // itself changes, which it practically never does) keeps identity
  // stable across re-renders.
  const MotionComponent = useMemo(() => motion.create(as), [as]);
  const prefersReducedMotion = useReducedMotion();

  const initial: Target = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x, y };
  const animate: Target = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 };

  return (
    <MotionComponent
      className={className}
      style={style}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{
        delay: prefersReducedMotion ? 0 : delay,
        duration: prefersReducedMotion ? 0.3 : duration,
        ease: PREMIUM_EASE,
      }}
    >
      {children}
    </MotionComponent>
  );
}
