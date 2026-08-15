'use client';

import { useEffect, useRef, useState } from 'react';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]';

/**
 * A small crosshair + trailing ring cursor, styled like a 3D-software
 * viewport gizmo, replacing the system arrow on fine-pointer devices.
 * The real cursor is only hidden (via `.custom-cursor-active` on
 * <html>) once this has actually mounted and confirmed a fine pointer,
 * so nothing goes missing if JS fails or the device is touch-only.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const [ready, setReady] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);

  useEffect(() => {
    if (isTouch) return;
    // Confirm a fine pointer actually exists before hiding the system
    // cursor (matchMedia, not just "not touch") -- keyboard-only or
    // odd input setups shouldn't lose their cursor.
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    setReady(true);
    document.documentElement.classList.add('custom-cursor-active');

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: pos.x, y: pos.y };
    let raf = 0;

    const handleMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = e.target as Element | null;
      setHoveringInteractive(!!target?.closest(INTERACTIVE_SELECTOR));
    };

    const animate = () => {
      ring.x += (pos.x - ring.x) * 0.25;
      ring.y += (pos.y - ring.y) * 0.25;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handleMove);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, [isTouch]);

  if (!ready) return null;

  return (
    <>
      {/* Center crosshair dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[200] will-change-transform"
        aria-hidden
      >
        <div
          className="flex items-center justify-center transition-transform duration-150"
          style={{ transform: hoveringInteractive ? 'scale(1.4)' : 'scale(1)' }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: hoveringInteractive ? 'var(--render-amber)' : '#F3F1EA' }}
          />
        </div>
      </div>

      {/* Trailing gizmo ring with tick marks, like a transform gizmo */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[199] will-change-transform"
        aria-hidden
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          className="transition-[opacity,transform] duration-200"
          style={{
            opacity: hoveringInteractive ? 0.9 : 0.45,
            transform: hoveringInteractive ? 'rotate(45deg) scale(1.15)' : 'rotate(0deg) scale(1)',
          }}
        >
          <circle
            cx="17"
            cy="17"
            r="14"
            fill="none"
            stroke={hoveringInteractive ? 'var(--render-amber)' : '#F3F1EA'}
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <line x1="17" y1="0" x2="17" y2="6" stroke="#F3F1EA" strokeWidth="1" />
          <line x1="17" y1="28" x2="17" y2="34" stroke="#F3F1EA" strokeWidth="1" />
          <line x1="0" y1="17" x2="6" y2="17" stroke="#F3F1EA" strokeWidth="1" />
          <line x1="28" y1="17" x2="34" y2="17" stroke="#F3F1EA" strokeWidth="1" />
        </svg>
      </div>
    </>
  );
}
