'use client';

import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import SkillBar from '../components/SkillBar';
import { useAbout, useSkills } from '../hooks/useContent';
import { profileFallback, skillLevels as fallbackSkillLevels } from '../lib/data';

const ABOUT_COPY =
  profileFallback.aboutDescription;

export default function AboutSection() {
  const { data } = useAbout();
  const { data: skillsData, loading: skillsLoading } = useSkills();

  const heading = data?.aboutHeading || profileFallback.aboutHeading;
  const description = data?.aboutDescription || ABOUT_COPY;
  const experience = data?.experience || profileFallback.experience;
  const additionalInfo = data?.additionalInfo || profileFallback.additionalInfo;

  // Fall back to the static list while loading, or when Supabase isn't
  // configured / has no rows yet, so the panel is never empty.
  const skillLevels =
    !skillsLoading && skillsData && skillsData.length > 0
      ? skillsData.map((s) => ({ name: s.name, level: s.level, value: s.value }))
      : fallbackSkillLevels;

  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-5 sm:px-8 md:px-10 py-24 sm:py-28 md:py-36"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(243,241,234,0.25), transparent)' }}
      />

      <div aria-hidden className="pointer-events-none absolute left-[4%] top-[8%] h-24 w-24 rounded-full border border-white/10 opacity-60 sm:h-32 sm:w-32" style={{ boxShadow: '0 0 80px rgba(139,124,246,0.12)' }} />
      <div aria-hidden className="pointer-events-none absolute right-[5%] top-[12%] h-20 w-20 rounded-2xl border border-[#4C8DFF]/15 rotate-12 opacity-60 sm:h-28 sm:w-28" />
      <div aria-hidden className="pointer-events-none absolute bottom-[10%] left-[8%] h-16 w-16 rounded-full border border-[#4C8DFF]/15 opacity-50 sm:h-24 sm:w-24" />
      <div aria-hidden className="pointer-events-none absolute bottom-[12%] right-[8%] h-24 w-24 rounded-full border border-white/10 opacity-50 sm:h-32 sm:w-32" />

      <div className="relative z-10 flex flex-col items-center text-center gap-10 sm:gap-12 md:gap-14">
        <FadeIn delay={0} y={40} className="w-full max-w-full px-2">
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight break-words [overflow-wrap:anywhere]"
            style={{ fontSize: 'clamp(2.25rem, 12vw, 160px)' }}
          >
            {heading}
          </h2>
        </FadeIn>

        <div className="flex w-full flex-col items-center gap-14 sm:gap-16 md:gap-20 max-w-3xl px-1">
          <AnimatedText
            text={description}
            className="w-full text-[#F3F1EA] font-medium text-center leading-relaxed max-w-[560px] break-words [overflow-wrap:anywhere]"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />

          {(experience || additionalInfo) && (
            <FadeIn delay={0.05} className="w-full">
              <div className="glass-panel w-full max-w-full rounded-3xl px-6 py-6 sm:px-10 sm:py-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 sm:divide-x sm:divide-white/10">
                {experience && (
                  <div className="flex flex-shrink-0 flex-col items-center gap-1 sm:pr-10">
                    <span
                      className="hero-heading font-black leading-none break-words [overflow-wrap:anywhere]"
                      style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}
                    >
                      {experience}
                    </span>
                    <span className="font-hud text-[10px] text-[#F3F1EA]/45 text-center">EXPERIENCE</span>
                  </div>
                )}
                {additionalInfo && (
                  <p className="min-w-0 flex-1 text-[#F3F1EA]/60 font-light text-center sm:text-left leading-relaxed max-w-[420px] sm:pl-10 text-sm sm:text-base break-words [overflow-wrap:anywhere]">
                    {additionalInfo}
                  </p>
                )}
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.08} className="w-full max-w-lg">
            <div className="glass-panel w-full rounded-3xl px-6 py-6 sm:px-8 sm:py-7 flex flex-col gap-5">
              <span className="font-hud text-[9px] text-[#F3F1EA]/40 self-start">
                {'// TOOL PROFICIENCY'}
              </span>
              {skillLevels.map((skill, i) => (
                <SkillBar
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  value={skill.value}
                  delay={i * 0.06}
                />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ContactButton />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
