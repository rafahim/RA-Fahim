'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Fixed minimum time the boot animation runs before it's allowed to
// finish, so it never feels like a jarring instant flash even when
// content resolves immediately (e.g. Supabase not configured). Kept
// short so it never feels like it's stalling the site.
const MIN_DURATION_MS = 900;
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
 * A first-impression reveal overlay: the name settles gently into view
 * with a soft rise + scale, a thin line draws itself underneath, then
 * the whole mark and background dissolve to unveil the page. Calm and
 * simple by design -- no HUD chrome, no progress text -- just a quiet,
 * confident intro. Only ever seen for ~0.9-1.4s (content usually
 * resolves well within the safety-net window).
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
    const timer = setTimeout(() => setDone(true), 150);
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
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <div
            className="absolute inset-0 bg-viewport-grid opacity-[0.12]"
            style={{ maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)' }}
            aria-hidden
          />

          <motion.div
            className="relative flex flex-col items-center gap-4"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <motion.span
              className="font-display text-[13vw] leading-none tracking-tight text-[var(--paper,#f3f1ea)] sm:text-[6.5vw]"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.85,
                ease: EASE_OUT,
              }}
            >
              RA FAHIM
            </motion.span>

            <motion.div
              className="h-[2px] rounded-full bg-[var(--render-amber)]"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: prefersReducedMotion ? 64 : [0, 64], opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.45,
                ease: EASE_OUT,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
