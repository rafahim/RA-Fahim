'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Fixed minimum time the boot animation runs before it's allowed to
// finish, so it never feels like a jarring instant flash even when
// content resolves immediately (e.g. Supabase not configured). Kept
// short so it never feels like it's stalling the site.
const MIN_DURATION_MS = 650;
// If content still isn't ready by this point, dismiss anyway rather than
// hold the loader indefinitely (e.g. a slow/failed network request).
const MAX_WAIT_MS = 2200;

interface RenderBootLoaderProps {
  /** True once the real CMS-driven content (name, portrait, etc.) has
   * actually loaded. The overlay holds until both the minimum-time
   * animation has played AND this flips true, then dismisses -- so the
   * loader never uncovers hardcoded placeholder content underneath it. */
  contentReady?: boolean;
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * A first-impression reveal overlay: a soft amber glow blooms behind a
 * drawing-on ring (like a camera iris / render-engine viewport gizmo),
 * then the whole thing dissolves to unveil the page. Purely animated --
 * no progress percentage or frame counter -- so it reads as a polished
 * intro rather than a literal loading bar. Only ever seen for
 * ~0.65-1s (content usually resolves well within the safety-net window).
 */
export default function RenderBootLoader({ contentReady = true }: RenderBootLoaderProps) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [done, setDone] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Phase 1: let the intro animation play for a minimum stretch of time,
  // regardless of content state, so it never feels like a flicker.
  useEffect(() => {
    const timer = setTimeout(
      () => setMinTimeElapsed(true),
      prefersReducedMotion ? 0 : MIN_DURATION_MS
    );
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Phase 2: once content is actually ready AND the minimum time has
  // elapsed, dismiss the overlay.
  useEffect(() => {
    if (!contentReady || !minTimeElapsed) return;
    const timer = setTimeout(() => setDone(true), 120);
    return () => clearTimeout(timer);
  }, [contentReady, minTimeElapsed]);

  // Safety net: never block the page forever on a slow/failed fetch.
  useEffect(() => {
    const timeout = setTimeout(() => setDone(true), MAX_WAIT_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--void)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.06 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <div
            className="absolute inset-0 bg-viewport-grid opacity-[0.2]"
            style={{ maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)' }}
            aria-hidden
          />

          {/* Soft ambient glow blooming behind the mark */}
          <motion.div
            className="absolute h-[34vh] w-[34vh] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,138,61,0.35) 0%, rgba(255,138,61,0.08) 55%, transparent 75%)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.9, 0.55], scale: [0.5, 1.2, 1] }}
            transition={{ duration: prefersReducedMotion ? 0.3 : 1.5, ease: EASE_OUT }}
            aria-hidden
          />

          {/* Drawing-on ring, like a camera iris / viewport gizmo settling into place */}
          <svg width="112" height="112" viewBox="0 0 112 112" className="relative" aria-hidden>
            <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(243,241,234,0.12)" strokeWidth="1" />
            <motion.circle
              cx="56"
              cy="56"
              r="46"
              fill="none"
              stroke="var(--render-amber)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="289"
              style={{ transformOrigin: '56px 56px' }}
              initial={{ strokeDashoffset: 289, rotate: -90 }}
              animate={{
                strokeDashoffset: prefersReducedMotion ? 0 : [289, 0],
                rotate: prefersReducedMotion ? -90 : [-90, 270],
              }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 1.15, ease: EASE_OUT }}
            />
            <motion.circle
              cx="56"
              cy="56"
              r="4"
              fill="var(--render-amber)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: prefersReducedMotion ? 0 : 1,
                ease: EASE_OUT,
              }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
