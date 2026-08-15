'use client';

import { useLayoutEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

interface FitTextProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  /** Smallest the text is allowed to shrink to, as a fraction of its natural (CSS-driven) size. */
  minScale?: number;
}

/**
 * Wraps a single-line, large-display heading (e.g. the hero name) and
 * measures its rendered width against its container on mount and on
 * resize. If the natural CSS font-size (driven by the `hero-heading`
 * classes / clamp() in `style`) would make the text wider than the
 * space available, this shrinks the *actual* font-size just enough to
 * fit — so the full text is always visible instead of being clipped by
 * the section's `overflow-hidden` entrance-animation wrapper.
 *
 * It only ever shrinks (never grows past the natural CSS/clamp size),
 * so short text still renders exactly as large/dramatic as the
 * original design intended. Because this sets a real `font-size`
 * (rather than a CSS transform), the element's layout box shrinks in
 * step with what's visually shown, so no extra blank space is left
 * behind.
 */
export default function FitText({ children, className = '', style, as: Tag = 'h1', minScale = 0.32 }: FitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    function measure() {
      if (!container || !text) return;
      // Reset any previous override so we measure the true, CSS-driven
      // natural size (which may itself change across breakpoints via clamp()).
      text.style.fontSize = '';
      const naturalFontSize = parseFloat(window.getComputedStyle(text).fontSize);
      const containerWidth = container.clientWidth;
      const textWidth = text.scrollWidth;
      if (!naturalFontSize || containerWidth <= 0 || textWidth <= 0) return;

      if (textWidth > containerWidth) {
        const ratio = containerWidth / textWidth;
        const nextFontSize = Math.max(naturalFontSize * minScale, naturalFontSize * ratio);
        text.style.fontSize = `${nextFontSize}px`;
      }
    }

    measure();

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(container);

    window.addEventListener('resize', measure);
    // Web fonts loading in after first paint can change the measured width.
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [children, minScale]);

  return (
    <div ref={containerRef} className="w-full">
      <Tag ref={textRef as never} className={className} style={{ ...style, whiteSpace: 'nowrap', display: 'inline-block' }}>
        {children}
      </Tag>
    </div>
  );
}
