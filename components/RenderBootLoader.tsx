'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const TOTAL_FRAMES = 24;
// Fixed minimum time the boot animation runs before it's allowed to
// finish, so it never feels like a jarring instant flash even when
// content resolves immediately (e.g. Supabase not configured). Kept
// short so it never feels like it's stalling the site.
const MIN_DURATION_MS = 500;
// If content still isn't ready by this point, dismiss anyway rather than
// hold the loader indefinitely (e.g. a slow/failed network request).
const MAX_WAIT_MS = 2200;

interface RenderBootLoaderProps {
  /** True once the real CMS-driven content (name, portrait, etc.) has
   * actually loaded. The bar animates to 99% and holds there until this
   * flips true, then finishes to 100% and dismisses -- so the loader
   * never uncovers hardcoded placeholder content underneath it. Omit to
   * just run the fixed-time animation. */
  contentReady?: boolean;
}

/**
 * A first-impression loading screen styled like a render-engine progress
 * bar ("RENDERING… 100% · FRAME 24/24") instead of a generic spinner --
 * on-theme for a 3D artist's site and only ever seen for ~0.5-0.7s
 * (content usually resolves well within the safety-net window).
 */
export default function RenderBootLoader({ contentReady = true }: RenderBootLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reachedCapRef = useRef(false);

  // Phase 1: animate 0 -> 99% once, on mount, regardless of content
  // state -- this is the part that always plays so the loader never
  // feels frozen at 0. Short (500ms) so it never outstays its welcome.
  useEffect(() => {
    if (prefersReducedMotion) {
      reachedCapRef.current = true;
      setProgress(99);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const duration = MIN_DURATION_MS;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 99));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        reachedCapRef.current = true;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  // Phase 2: once content is actually ready AND the phase-1 animation
  // has reached its cap, finish out to 100% and dismiss. Polls briefly
  // instead of restarting phase 1's animation from scratch.
  useEffect(() => {
    if (!contentReady) return;
    const interval = setInterval(() => {
      if (reachedCapRef.current) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setDone(true), 180);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [contentReady]);

  // Safety net: never block the page forever on a slow/failed fetch.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(100);
      setDone(true);
    }, MAX_WAIT_MS);
    return () => clearTimeout(timeout);
  }, []);

  const frame = Math.min(TOTAL_FRAMES, Math.max(1, Math.round((progress / 100) * TOTAL_FRAMES)));

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--void)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(6px)', scale: 1.03 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute inset-0 bg-viewport-grid opacity-[0.25]"
            style={{ maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)' }}
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-5 px-6">
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-hud text-[10px] sm:text-xs tracking-[0.3em] text-[#F3F1EA]/50"
            >
              RENDERING PREVIEW
            </motion.span>
            <span
              className="hero-heading font-black leading-none tabular-nums"
              style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
            >
              {progress}%
            </span>
            <div className="h-[3px] w-[60vw] max-w-[320px] overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background:
                    'linear-gradient(90deg, var(--render-amber) 0%, #ffd08a 100%)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
            <span className="font-hud text-[9px] sm:text-[10px] text-[#F3F1EA]/35">
              FRAME {String(frame).padStart(2, '0')}/{TOTAL_FRAMES} · SAMPLES{' '}
              {(frame * 128).toString().padStart(4, '0')}/3072
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
