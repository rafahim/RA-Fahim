'use client';

import { Quote } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import CornerBrackets from '../components/CornerBrackets';
import { testimonials as fallbackTestimonials } from '../lib/data';
import { useTestimonials } from '../hooks/useContent';

/**
 * Client quotes, placed right before Contact -- the point in the page
 * where a visitor is deciding whether to reach out, so social proof
 * does the most work here. CMS-driven via the `testimonials` table
 * (managed from /admin/testimonials); falls back to the static list in
 * lib/data.ts while loading or when Supabase isn't configured/empty.
 */
export default function TestimonialsSection() {
  const { data, loading } = useTestimonials();

  const testimonials =
    !loading && data && data.length > 0
      ? data.map((t) => ({ quote: t.quote, name: t.clientName, role: t.clientRole ?? '' }))
      : fallbackTestimonials;

  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="relative bg-[#0A0A0D] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-28"
    >
      <FadeIn className="flex flex-col items-center gap-4 mb-14 sm:mb-16 md:mb-20">
        <h2
          className="hero-heading font-black uppercase text-center leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.25rem, 9vw, 110px)' }}
        >
          What clients say
        </h2>
      </FadeIn>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {testimonials.map((t, i) => (
          <FadeIn key={`${t.name}-${i}`} delay={i * 0.08} y={26} className="h-full">
            <div className="group relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-sm px-6 py-7 sm:px-7 sm:py-8 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--render-amber-soft)] hover:bg-white/[0.06]">
              <CornerBrackets
                size={16}
                color="rgba(255,138,61,0.35)"
                className="m-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <Quote size={22} strokeWidth={1.5} className="mb-4 text-[var(--render-amber)]/70" />
              <p className="text-[#F3F1EA]/75 font-light leading-relaxed text-sm sm:text-base mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium uppercase tracking-wide text-[#F3F1EA]">
                  {t.name}
                </span>
                <span className="font-hud text-[10px] text-[#F3F1EA]/40">{t.role}</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
