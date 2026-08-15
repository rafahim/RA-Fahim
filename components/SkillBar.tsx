'use client';

import { motion } from 'framer-motion';

interface SkillBarProps {
  name: string;
  level: string;
  value: number;
  delay?: number;
}

/** A single tool + proficiency meter, styled like a render-engine parameter slider (tick marks, amber fill). */
export default function SkillBar({ name, level, value, delay = 0 }: SkillBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[#F3F1EA] font-medium uppercase tracking-wide text-sm sm:text-base">
          {name}
        </span>
        <span className="font-hud text-[9px] sm:text-[10px] text-[var(--render-amber)]/80 flex-shrink-0">
          {level.toUpperCase()} · {value}%
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--render-amber) 0%, #ffd08a 100%)' }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Tick marks -- the graduated marks on a real parameter slider. */}
        <div className="pointer-events-none absolute inset-0 flex justify-between px-[2%]" aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="w-px bg-black/25" />
          ))}
        </div>
      </div>
    </div>
  );
}
