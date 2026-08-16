'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { marqueeRow1, marqueeRow2 } from '../lib/data';
import { useMarqueeImages } from '../hooks/useContent';
import { isSupabaseConfigured } from '../lib/env';

function repeated(arr: string[], times: number) {
  return Array.from({ length: times }, () => arr).flat();
}

/** Splits a flat, admin-ordered image list into two roughly-even rows for the two-row marquee layout. */
function toRows(urls: string[]): [string[], string[]] {
  const mid = Math.ceil(urls.length / 2);
  return [urls.slice(0, mid), urls.slice(mid)];
}

/**
 * Lets a row be grabbed with the mouse and dragged to scroll horizontally
 * on desktop (touch/pen devices already get free native swipe-scrolling
 * from `overflow-x-auto`, so this only steps in for `pointerType ===
 * 'mouse'` to avoid fighting the native touch behaviour).
 */
function useHorizontalDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      el.scrollLeft = startScrollLeft - (e.clientX - startX);
    };
    const stopDragging = () => {
      dragging = false;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', stopDragging);
    el.addEventListener('pointercancel', stopDragging);
    el.addEventListener('pointerleave', stopDragging);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', stopDragging);
      el.removeEventListener('pointercancel', stopDragging);
      el.removeEventListener('pointerleave', stopDragging);
    };
  }, []);

  return ref;
}

interface RowProps {
  images: string[];
  direction: 1 | -1;
  offset: ReturnType<typeof useMotionValue<number>>;
}

function MarqueeRow({ images, direction, offset }: RowProps) {
  const translate = useTransform(offset, (v) => (direction === 1 ? v - 200 : -(v - 200)));
  const scrollRef = useHorizontalDragScroll<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar select-none overflow-x-auto overscroll-x-contain cursor-grab active:cursor-grabbing"
      style={{ scrollbarWidth: 'none', touchAction: 'pan-x' }}
    >
      <motion.div className="flex gap-3 w-max" style={{ x: translate, willChange: 'transform' }}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="rounded-2xl object-cover flex-shrink-0"
            style={{ width: 420, height: 270 }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const offset = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  // Fewer duplicated tiles on narrow viewports -- there's less width to
  // fill, so a smaller repeat count still loops seamlessly while keeping
  // the DOM (and image decode work) lighter on mobile.
  const [repeatCount, setRepeatCount] = useState(3);

  const { data: cmsImages, loading } = useMarqueeImages();

  useEffect(() => {
    const updateRepeatCount = () => setRepeatCount(window.innerWidth < 768 ? 2 : 3);
    updateRepeatCount();
    window.addEventListener('resize', updateRepeatCount, { passive: true });
    return () => window.removeEventListener('resize', updateRepeatCount);
  }, []);

  useEffect(() => {
    // Scroll-linked parallax only -- there's no autoplay to gate behind
    // reduced motion, but we skip the transform work entirely when the
    // user prefers less motion so the rows stay put.
    if (prefersReducedMotion) return;

    let frame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const value = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
        offset.set(value);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [offset, prefersReducedMotion]);

  // While loading, or when Supabase isn't configured at all, fall back to
  // the bundled placeholder images so the strip is never broken/blank on
  // first load. Once the CMS has actually responded, though, the admin's
  // list is authoritative -- including an empty one, which means the whole
  // section is hidden (an admin who deletes every image wants it gone,
  // not silently replaced by the old placeholders).
  const useFallback = loading || !isSupabaseConfigured();
  const [row1, row2] = useFallback
    ? [marqueeRow1, marqueeRow2]
    : toRows((cmsImages ?? []).map((img) => img.imageUrl));

  if (!useFallback && row1.length === 0 && row2.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0A0A0D] overflow-hidden pt-24 sm:pt-32 md:pt-40 pb-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 sm:h-40"
        style={{ background: 'linear-gradient(180deg, var(--void) 0%, rgba(3,3,5,0) 100%)' }}
      />
      <div className="flex flex-col gap-3 [&_img]:transition-transform [&_img]:duration-500 [&_img]:ease-out [&_img:hover]:scale-[1.03]">
        <MarqueeRow images={repeated(row1, repeatCount)} direction={1} offset={offset} />
        <MarqueeRow images={repeated(row2, repeatCount)} direction={-1} offset={offset} />
      </div>
      <p className="mt-4 text-center font-hud text-[9px] sm:text-[10px] text-[#F3F1EA]/30">
        {'← DRAG TO EXPLORE →'}
      </p>
    </section>
  );
}
