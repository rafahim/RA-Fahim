'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}

/**
 * Magnetic hover effect: the wrapped element eases toward the pointer
 * whenever the pointer is within `padding` of its bounds (not just
 * directly over it), and springs back once it leaves. Pointer tracking
 * writes straight to framer-motion values instead of React state, so it
 * never triggers a re-render — only a transform update on the compositor
 * thread, which keeps it smooth even on a busy page.
 *
 * Automatically inert on touch/coarse-pointer devices (there's no hover
 * to track, and a stray offset could otherwise linger after a tap) and
 * skipped entirely when the user prefers reduced motion.
 */
export default function Magnet({ children, padding = 150, strength = 3, className }: MagnetProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const prefersReducedMotion = useReducedMotion();
  const disabled = isTouch || prefersReducedMotion;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Snappy-but-soft spring reads as "magnetic weight" rather than lag —
  // higher stiffness with matched damping keeps it responsive without
  // overshoot/wobble.
  const x = useSpring(rawX, { stiffness: 220, damping: 22, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 220, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (disabled) return;

    let frame = 0;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const withinX = e.clientX >= rect.left - padding && e.clientX <= rect.right + padding;
        const withinY = e.clientY >= rect.top - padding && e.clientY <= rect.bottom + padding;

        if (withinX && withinY) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          rawX.set((e.clientX - centerX) / strength);
          rawY.set((e.clientY - centerY) / strength);
        } else {
          rawX.set(0);
          rawY.set(0);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, [padding, strength, rawX, rawY, disabled]);

  if (disabled) {
    return (
      <div ref={wrapperRef} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={wrapperRef} className={className} style={{ x, y, willChange: 'transform' }}>
      {children}
    </motion.div>
  );
}
