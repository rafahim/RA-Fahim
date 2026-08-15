'use client';

import { useEffect, useRef, useState } from 'react';

export interface ProcessStage {
  src: string | null;
  label: string;
}

interface ProcessRevealProps {
  stages: ProcessStage[];
  alt: string;
  className: string;
  style?: React.CSSProperties;
}

/**
 * Cycles through a project's available preview images on hover (desktop)
 * or tap (touch), labelled as production stages, so a card shows *how*
 * a piece was made and not just the final frame. Uses whichever images
 * the project already has in its gallery -- for the strongest effect,
 * upload an actual wireframe/clay-render pass alongside the final image
 * in the project's gallery; otherwise this still reads as a believable
 * multi-pass preview using the existing shots.
 */
export default function ProcessReveal({ stages, alt, className, style }: ProcessRevealProps) {
  const usable = stages.filter((s) => !!s.src);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active && usable.length > 1) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % usable.length);
      }, 850);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, usable.length]);

  if (usable.length === 0) {
    return <div className={`${className} bg-[#15151B] border border-[#F3F1EA]/10`} style={style} aria-hidden />;
  }

  const handleEnter = () => {
    setActive(true);
    setIndex(0);
  };
  const handleLeave = () => {
    setActive(false);
    setIndex(usable.length - 1);
  };
  const handleTap = () => {
    if (usable.length <= 1) return;
    setActive(true);
    setIndex((i) => (i + 1) % usable.length);
  };

  const current = usable[Math.min(index, usable.length - 1)];

  return (
    <div
      className={`chroma-hover ${className} overflow-hidden`}
      style={style}
      onPointerEnter={(e) => e.pointerType !== 'touch' && handleEnter()}
      onPointerLeave={(e) => e.pointerType !== 'touch' && handleLeave()}
      onClick={handleTap}
    >
      {usable.map((stage, i) => (
        <img
          key={stage.src}
          src={stage.src ?? undefined}
          alt={i === index ? `${alt} — ${stage.label}` : ''}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}

      {usable.length > 1 && (
        <div
          className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between transition-opacity duration-300"
          style={{ opacity: active ? 1 : 0 }}
        >
          <span className="font-hud text-[9px] tracking-[0.15em] text-[#F3F1EA]/80 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
            {current.label.toUpperCase()} · {index + 1}/{usable.length}
          </span>
          <div className="flex gap-1">
            {usable.map((s, i) => (
              <span
                key={s.src}
                className="h-1 w-1 rounded-full transition-colors duration-300"
                style={{ background: i === index ? 'var(--render-amber)' : 'rgba(243,241,234,0.35)' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
