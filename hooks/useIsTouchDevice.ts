'use client';

import { useEffect, useState } from 'react';

/**
 * True when the primary input has no fine pointer (touch/coarse pointer
 * devices) — used to disable mouse-only interactions like the magnetic
 * hover effect, which have no meaningful equivalent on touch and can
 * otherwise leave elements visually offset after a tap.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    setIsTouch(query.matches);

    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return isTouch;
}
