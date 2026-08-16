'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Fixed minimum time the boot animation runs before it's allowed to
// finish, so it never feels like a jarring instant flash even when
// content resolves immediately (e.g. Supabase not configured). Kept
// short so it never feels like it's stalling the site.
const MIN_DURATION_MS = 350;
// If content still isn't ready by this point, dismiss anyway rather than
// hold the loader indefinitely (e.g. a slow/failed network request). Kept
// tight so a slow connection never makes the site feel stuck behind the
// intro -- the real Hero content keeps loading underneath regardless.
const MAX_WAIT_MS = 1400;

interface RenderBootLoaderProps {
  /** True once the real CMS-driven content (name, portrait, etc.) has
   * actually loaded. The overlay holds until both the minimum-time
   * animation has played AND this flips true, then dismisses -- so the
   * loader never uncovers hardcoded placeholder content underneath it. */
  contentReady?: boolean;
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * A simple first-impression reveal: a soft glow quietly blooms at the
 * center of a plain background, then the whole overlay dissolves to
 * unveil the page. No text, no HUD chrome, no busy motion -- just a
 * calm, understated intro.
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
    const timer = setTimeout(() => setDone(true), 100);
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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          <motion.div
            className="h-[28vh] w-[28vh] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,138,61,0.32) 0%, rgba(255,138,61,0.06) 55%, transparent 75%)',
              filter: 'blur(6px)',
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.85, 0.5], scale: [0.6, 1.1, 1] }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 1.1,
              ease: EASE_OUT,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
