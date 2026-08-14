import FadeIn from '../components/FadeIn';
import Magnet from '../components/Magnet';
import ContactButton from '../components/ContactButton';
import { useAbout, useWebsiteSettings } from '../hooks/useContent';

const NAV_LINKS = ['About', 'Price', 'Projects', 'Contact'];

const PORTRAIT_URL =
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png';

export default function HeroSection() {
  const { data } = useAbout();
  const { data: siteSettings } = useWebsiteSettings();

  const name = data?.name || 'jack';
  const professionalTitle =
    data?.professionalTitle || 'a 3d creator driven by crafting striking and unforgettable projects';
  const portraitUrl = data?.profileImageUrl || PORTRAIT_URL;

  return (
    <section
      className="relative h-screen flex flex-col"
      style={{ overflowX: 'clip' }}
    >
      <FadeIn delay={0} y={-20} as="nav">
        <div className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8">
          {siteSettings?.logoUrl && (
            <img
              src={siteSettings.logoUrl}
              alt={siteSettings.websiteTitle || 'Logo'}
              className="h-7 w-auto sm:h-8 md:h-9"
            />
          )}
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-[#CFE8FB] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] transition-opacity duration-200 hover:opacity-70"
            >
              {link}
            </a>
          ))}
        </div>
      </FadeIn>

      <FadeIn
        delay={0.15}
        y={40}
        className="overflow-hidden mt-6 sm:mt-4 md:-mt-5"
      >
        <h1 className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]">
          Hi, i&apos;m {name}
        </h1>
      </FadeIn>

      <div className="mt-auto flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <p
            className="text-[#CFE8FB] font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            {professionalTitle}
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <ContactButton />
        </FadeIn>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px]"
      >
        <FadeIn delay={0.6} y={30}>
          <Magnet
            padding={150}
            strength={3}
            activeTransition="transform 0.3s ease-out"
            inactiveTransition="transform 0.6s ease-in-out"
          >
            <img
              src={portraitUrl}
              alt={`${name}, 3D creator portrait`}
              className="w-full h-auto select-none"
              draggable={false}
            />
          </Magnet>
        </FadeIn>
      </div>
    </section>
  );
}
