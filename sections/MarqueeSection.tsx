'use client';

import { useEffect, useRef, useState } from 'react';
import { marqueeRow1, marqueeRow2 } from '../lib/data';

function tripled(arr: string[]) {
  return [...arr, ...arr, ...arr];
}

interface RowProps {
  images: string[];
  direction: 1 | -1;
  offset: number;
}

function MarqueeRow({ images, direction, offset }: RowProps) {
  const translate = direction === 1 ? offset - 200 : -(offset - 200);

  return (
    <div
      className="flex gap-3"
      style={{
        transform: `translateX(${translate}px)`,
        willChange: 'transform',
      }}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          loading="lazy"
          className="rounded-2xl object-cover flex-shrink-0"
          style={{ width: 420, height: 270 }}
        />
      ))}
    </div>
  );
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const value =
        (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      setOffset(value);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#071B33] overflow-hidden pt-24 sm:pt-32 md:pt-40 pb-10"
    >
      <div className="flex flex-col gap-3">
        <MarqueeRow images={tripled(marqueeRow1)} direction={1} offset={offset} />
        <MarqueeRow images={tripled(marqueeRow2)} direction={-1} offset={offset} />
      </div>
    </section>
  );
}
