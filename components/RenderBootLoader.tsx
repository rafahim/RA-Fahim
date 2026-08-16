'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Fixed minimum time the boot animation runs before it's allowed to
// finish, so it never feels like a jarring instant flash even when
// content resolves immediately (e.g. Supabase not configured). Kept
// short so it never feels like it's stalling the site.
const MIN_DURATION_MS = 550;
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

/**
 * A simple first-impression reveal: a plain background briefly fades in
 * and out before unveiling the page. No text, no motion tricks, no HUD
 * chrome -- just a calm, ordinary fade.
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
          className="fixed inset-0 z-[100] bg-[var(--void)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  );
}
