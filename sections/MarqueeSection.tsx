'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { marqueeRow1, marqueeRow2 } from '../lib/data';
import { useMarqueeImages } from '../hooks/useContent';
import { isSupabaseConfigured } from '../lib/env';

// Fixed tile size (see the <img> style below) -- used to work out the
// exact pixel width of one un-repeated set of images, so the scroll
// offset can be wrapped (modulo) into that width. Without wrapping, the
// raw scroll-linked offset grows without bound as the page gets taller,
// which eventually pushes the whole strip past the end of its repeated
// tiles -- the row runs dry, the animation stalls/jumps, and moving the
// page (or even just resizing) makes it visibly judder. Wrapping keeps
// the same three-tile buffer looping forever, however far the page
// scrolls, so the motion stays smooth and never runs out of images.
const TILE_WIDTH = 420;
const TILE_GAP = 12;

function rowSetWidth(uniqueCount: number) {
  return uniqueCount * TILE_WIDTH + Math.max(uniqueCount - 1, 0) * TILE_GAP;
}

function wrap(value: number, width: number) {
  if (width <= 0) return value;
  const mod = ((value % width) + width) % width;
  return mod - width; // always in (-width, 0]
}

function repeated(arr: string[], times: number) {
  return Array.from({ length: times }, () => arr).flat();
}

/** Splits a flat, admin-ordered image list into two roughly-even rows for the two-row marquee layout. */
function toRows(urls: string[]): [string[], string[]] {
  const mid = Math.ceil(urls.length / 2);
  return [urls.slice(0, mid), urls.slice(mid)];
}

interface RowProps {
  images: string[];
  uniqueCount: number;
  direction: 1 | -1;
  offset: ReturnType<typeof useMotionValue<number>>;
}

function MarqueeRow({ images, uniqueCount, direction, offset }: RowProps) {
  const setWidth = rowSetWidth(uniqueCount);
  const translate = useTransform(offset, (v) => {
    const raw = direction === 1 ? v - 200 : -(v - 200);
    return wrap(raw, setWidth);
  });

  return (
    <div className="overflow-hidden">
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
            style={{ width: TILE_WIDTH, height: 270 }}
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
        <MarqueeRow
          images={repeated(row1, repeatCount)}
          uniqueCount={row1.length}
          direction={1}
          offset={offset}
        />
        <MarqueeRow
          images={repeated(row2, repeatCount)}
          uniqueCount={row2.length}
          direction={-1}
          offset={offset}
        />
      </div>
    </section>
  );
}
