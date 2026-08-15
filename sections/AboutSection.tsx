'use client';

import FadeIn from '../components/FadeIn';
import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import { useAbout } from '../hooks/useContent';

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

  const heading = data?.aboutHeading || 'About me';
  const description = data?.aboutDescription || ABOUT_COPY;
  const experience = data?.experience;
  const additionalInfo = data?.additionalInfo;

  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10 py-20"
    >
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] w-[120px] sm:w-[160px] md:w-[210px]"
      >
        <img src={MOON_ICON} alt="" className="w-full h-auto" />
      </FadeIn>

      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] w-[100px] sm:w-[140px] md:w-[180px]"
      >
        <img src={P59_OBJECT} alt="" className="w-full h-auto" />
      </FadeIn>

      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] w-[120px] sm:w-[160px] md:w-[210px]"
      >
        <img src={LEGO_ICON} alt="" className="w-full h-auto" />
      </FadeIn>

      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] w-[130px] sm:w-[170px] md:w-[220px]"
      >
        <img src={GROUP_134} alt="" className="w-full h-auto" />
      </FadeIn>

      <div className="flex flex-col items-center text-center gap-10 sm:gap-14 md:gap-16">
        {experience && (
          <FadeIn delay={0} y={20}>
            <span className="text-[#CFE8FB]/70 font-medium uppercase tracking-widest text-xs sm:text-sm">
              {experience} experience
            </span>
          </FadeIn>
        )}

        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            {heading}
          </h2>
        </FadeIn>

        <div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
          <AnimatedText
            text={description}
            className="text-[#CFE8FB] font-medium text-center leading-relaxed max-w-[560px]"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />

          {additionalInfo && (
            <FadeIn delay={0.05}>
              <p
                className="text-[#CFE8FB]/60 font-light text-center leading-relaxed max-w-[560px]"
                style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.1rem)' }}
              >
                {additionalInfo}
              </p>
            </FadeIn>
          )}

          <FadeIn delay={0.1}>
            <ContactButton />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
