'use client';

import type { LucideIcon } from 'lucide-react';
import { Box, Sparkles, Film, PenTool, Layout, Wand2 } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { services as fallbackServices } from '../lib/data';
import { useServices } from '../hooks/useContent';

const ICON_RULES: [RegExp, LucideIcon][] = [
  [/model/i, Box],
  [/render/i, Sparkles],
  [/motion|animat/i, Film],
  [/brand/i, PenTool],
  [/web|ui|ux/i, Layout],
];

function iconFor(name: string): LucideIcon {
  const match = ICON_RULES.find(([pattern]) => pattern.test(name));
  return match ? match[1] : Wand2;
}

export default function ServicesSection() {
  const { data, loading } = useServices();

  // Fall back to the static list while loading, or when Supabase isn't
  // configured / has no published rows yet, so the section is never empty.
  const services =
    !loading && data && data.length > 0
      ? data.map((s) => ({ number: s.serviceNumber, name: s.name, description: s.description ?? '' }))
      : fallbackServices;

  return (
    <section
      id="services"
      className="bg-grain relative overflow-hidden rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ background: 'linear-gradient(180deg, var(--navy) 0%, var(--void) 100%)' }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(243,241,234,0.2), transparent)' }}
      />

      <FadeIn className="relative z-10 flex flex-col items-center gap-4 mb-16 sm:mb-20 md:mb-24">
        <h2
          className="hero-heading font-black uppercase text-center leading-none tracking-tight"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Services
        </h2>
      </FadeIn>

      <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {services.map((service, i) => {
          const Icon = iconFor(service.name);
          return (
            <FadeIn key={service.number} delay={i * 0.08} y={26} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-sm px-7 py-8 sm:px-8 sm:py-9 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#4C8DFF]/30 hover:bg-white/[0.06] hover:shadow-[0_20px_50px_-20px_rgba(76,141,255,0.25)] active:translate-y-0 active:duration-100">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-6 font-black leading-none text-white/[0.05] transition-colors duration-300 group-hover:text-[#4C8DFF]/[0.14]"
                  style={{ fontSize: 'clamp(4rem, 9vw, 8rem)' }}
                >
                  {service.number}
                </span>

                <div
                  className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-2xl text-[#8FB2FF] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(76,141,255,0.18), rgba(139,124,246,0.10))',
                  }}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </div>

                <div className="relative flex flex-col gap-3">
                  <h3
                    className="font-display text-[#F3F1EA] font-medium uppercase tracking-wide"
                    style={{ fontSize: 'clamp(1.05rem, 2vw, 1.5rem)' }}
                  >
                    {service.name}
                  </h3>
                  <p
                    className="text-[#F3F1EA]/55 font-light leading-relaxed"
                    style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1rem)' }}
                  >
                    {service.description}
                  </p>
                </div>

                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-[#4C8DFF] to-[#8B7CF6] transition-all duration-500 group-hover:w-full"
                />
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
