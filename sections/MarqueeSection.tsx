'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { marqueeRow1, marqueeRow2 } from '../lib/data';

function repeated(arr: string[], times: number) {
  return Array.from({ length: times }, () => arr).flat();
}

interface RowProps {
  images: string[];
  direction: 1 | -1;
  offset: ReturnType<typeof useMotionValue<number>>;
}

function MarqueeRow({ images, direction, offset }: RowProps) {
  const translate = useTransform(offset, (v) => (direction === 1 ? v - 200 : -(v - 200)));

  return (
    <motion.div className="flex gap-3" style={{ x: translate, willChange: 'transform' }}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="rounded-2xl object-cover flex-shrink-0"
          style={{ width: 420, height: 270 }}
        />
      ))}
    </motion.div>
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
        <MarqueeRow images={repeated(marqueeRow1, repeatCount)} direction={1} offset={offset} />
        <MarqueeRow images={repeated(marqueeRow2, repeatCount)} direction={-1} offset={offset} />
      </div>
    </section>
  );
}
