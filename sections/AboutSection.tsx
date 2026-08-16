'use client';

import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import SkillBar from '../components/SkillBar';
import { useAbout, useSkills } from '../hooks/useContent';
import { skillLevels as fallbackSkillLevels } from '../lib/data';

const MOON_ICON =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png';
const P59_OBJECT =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png';
const LEGO_ICON =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png';
const GROUP_134 =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png';

const ABOUT_COPY =
  "With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!";

export default function AboutSection() {
  const { data } = useAbout();
  const { data: skillsData, loading: skillsLoading } = useSkills();

  const heading = data?.aboutHeading || 'About me';
  const description = data?.aboutDescription || ABOUT_COPY;
  const experience = data?.experience;
  const additionalInfo = data?.additionalInfo;

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

      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={1.1}
        className="absolute top-[6%] left-[1%] sm:left-[2%] md:left-[4%] w-[100px] sm:w-[140px] md:w-[180px] opacity-70"
        style={{ animation: 'float-slow 7s ease-in-out infinite' }}
      >
        <img src={MOON_ICON} alt="" className="w-full h-auto" />
      </FadeIn>

      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={1.1}
        className="absolute bottom-[10%] left-[3%] sm:left-[6%] md:left-[10%] w-[85px] sm:w-[120px] md:w-[155px] opacity-70"
        style={{ animation: 'float-slow 8.5s ease-in-out infinite 0.5s' }}
      >
        <img src={P59_OBJECT} alt="" className="w-full h-auto" />
      </FadeIn>

      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={1.1}
        className="absolute top-[6%] right-[1%] sm:right-[2%] md:right-[4%] w-[100px] sm:w-[140px] md:w-[180px] opacity-70"
        style={{ animation: 'float-slow 7.5s ease-in-out infinite 0.2s' }}
      >
        <img src={LEGO_ICON} alt="" className="w-full h-auto" />
      </FadeIn>

      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={1.1}
        className="absolute bottom-[10%] right-[3%] sm:right-[6%] md:right-[10%] w-[110px] sm:w-[145px] md:w-[190px] opacity-70"
        style={{ animation: 'float-slow 8s ease-in-out infinite 0.7s' }}
      >
        <img src={GROUP_134} alt="" className="w-full h-auto" />
      </FadeIn>

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
