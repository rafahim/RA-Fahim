'use client';

import { useEffect, useRef, useState } from 'react';

interface HudTelemetryProps {
  className?: string;
  /** Shown bottom-right, e.g. "OCTANE X · RTX 4090". */
  engineLabel?: string;
  sampleTarget?: number;
}

/**
 * Turns the site's existing corner-bracket/HUD-font decoration into
 * something that reads as a live render-viewport readout: a sample
 * counter that climbs like a progressive render, and live cursor
 * coordinates in the corner -- both purely cosmetic, both borrowed
 * straight from Blender/Cinema 4D/Octane viewport overlays.
 */
export default function HudTelemetry({
  className = '',
  engineLabel = 'OCTANE X · GPU',
  sampleTarget = 2048,
}: HudTelemetryProps) {
  const [samples, setSamples] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Climbs toward the target and loops -- like a viewport that keeps
    // refining, resetting whenever the "render" completes.
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setSamples((prev) => {
        const next = prev + dt * 0.9;
        return next > sampleTarget ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sampleTarget]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const handleMove = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      setCoords({
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top),
      });
    };
    wrapper.addEventListener('pointermove', handleMove);
    return () => wrapper.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div ref={wrapperRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col items-end gap-0.5">
        <span className="font-hud text-[9px] sm:text-[10px] text-[#F3F1EA]/40">
          SAMPLES: {Math.floor(samples).toString().padStart(4, '0')}/{sampleTarget}
        </span>
        <div className="h-px w-16 sm:w-20 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[var(--render-amber)]"
            style={{ width: `${Math.min(100, (samples / sampleTarget) * 100)}%` }}
          />
        </div>
      </div>

      <span className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 font-hud text-[9px] sm:text-[10px] text-[#F3F1EA]/35">
        {engineLabel}
      </span>

      <span className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 font-hud text-[9px] sm:text-[10px] text-[#F3F1EA]/35 hidden md:block">
        X:{coords.x.toString().padStart(4, '0')} Y:{coords.y.toString().padStart(4, '0')}
      </span>

      <span className="absolute top-4 left-1/2 -translate-x-1/2 font-hud text-[9px] sm:text-[10px] text-[#F3F1EA]/30 hud-blink hidden sm:block">
        ● REC — VIEWPORT LIVE
      </span>
    </div>
  );
}
