'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import FitText from '../components/FitText';
import Magnet from '../components/Magnet';
import ContactButton from '../components/ContactButton';
import CornerBrackets from '../components/CornerBrackets';
import AuroraField from '../components/AuroraField';
import Viewport3D from '../components/Viewport3D';
import HudTelemetry from '../components/HudTelemetry';
import { useAbout, useWebsiteSettings } from '../hooks/useContent';

const NAV_LINKS = ['About', 'Price', 'Projects', 'Contact'];

const PORTRAIT_URL =
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png';

export default function HeroSection() {
  const { data, loading: aboutLoading } = useAbout();
  const { data: siteSettings } = useWebsiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const name = data?.name?.trim() || 'ra fahim';
  const professionalTitle =
    data?.professionalTitle || 'a 3d creator driven by crafting striking and unforgettable projects';
  const availabilityStatus =
    data?.availabilityStatus?.trim() || 'Available for new projects — 3D Creator';
  // While the CMS profile image is still loading, don't fall back to the
  // static placeholder portrait -- that causes a visible "wrong photo"
  // flash right before the real one swaps in. Show nothing (skeleton)
  // until we know for sure whether a custom image exists.
  const portraitUrl = aboutLoading ? null : data?.profileImageUrl || PORTRAIT_URL;

  // Lock background scroll while the mobile menu is open so the open
  // panel doesn't fight the page underneath it.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <section
      className="bg-grain relative h-screen flex flex-col"
      style={{ overflowX: 'clip', background: 'var(--void)' }}
    >
      <AuroraField variant="hero" />
      <div
        className="absolute inset-0 bg-viewport-grid opacity-[0.35]"
        style={{ maskImage: 'radial-gradient(circle at 50% 30%, black, transparent 70%)' }}
        aria-hidden
      />
      <CornerBrackets className="m-4 sm:m-6 hidden sm:block" size={26} color="rgba(243,241,234,0.35)" />
      <HudTelemetry className="hidden md:block" />

      <FadeIn delay={0} y={-20} as="nav" className="relative z-30">
        <div className="mx-3 mt-3 sm:mx-6 sm:mt-6 flex items-center justify-between gap-4 rounded-full glass-panel px-5 py-3 md:px-8 md:py-4">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- intentional: a real full reload, not a soft client-side nav */}
          <a
            href="/"
            aria-label="Go to homepage"
            onClick={(e) => {
              // Always do a real, full page reload -- not a soft Next.js
              // navigation -- so the logo/name reliably resets the whole
              // page state (including the boot intro) no matter where
              // we're clicking from.
              e.preventDefault();
              window.location.href = '/';
            }}
            className="flex min-w-0 items-center gap-2.5 rounded-full transition-opacity duration-200 hover:opacity-80 focus-visible:opacity-80"
          >
            {siteSettings?.logoUrl && (
              <img
                src={siteSettings.logoUrl}
                alt=""
                loading="eager"
                decoding="async"
                className="h-7 w-auto flex-shrink-0 sm:h-8 md:h-9"
              />
            )}
            <span className="truncate font-hud text-[10px] sm:text-xs text-[#F3F1EA]/70">
              {siteSettings?.websiteTitle?.trim()
                ? siteSettings.websiteTitle.trim().toUpperCase()
                : `${String(name).trim().toUpperCase() || 'RA FAHIM'}.3D`}
            </span>
          </a>

          {/* Desktop / tablet nav */}
          <div className="hidden sm:flex items-center gap-5 md:gap-9">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="glitch-hover group relative text-[#F3F1EA] font-medium uppercase tracking-wider text-sm md:text-base"
              >
                {link}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--render-amber)] transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Mobile menu toggle -- a real hamburger/close control rather than
              shrinking the desktop link row, so tap targets stay comfortable
              and the links don't compete for space with the logo. */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex sm:hidden h-10 w-10 items-center justify-center rounded-full text-[#F3F1EA] transition-colors duration-200 active:bg-white/10"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav panel */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-nav-panel"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="sm:hidden glass-panel mx-3 mt-2 flex flex-col overflow-hidden rounded-3xl"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[52px] items-center border-b border-white/5 px-6 text-base font-medium uppercase tracking-wider text-[#F3F1EA] transition-colors duration-200 last:border-b-0 active:bg-white/5"
                >
                  {link}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </FadeIn>

      {/* Live 3D viewport widget -- the first hand-built thing a visitor
          sees, steering toward the cursor and flipping from wireframe to
          a flat-shaded render on hover, exactly like switching viewport
          shading modes in Blender/C4D. */}
      <FadeIn
        delay={0.45}
        y={0}
        x={0}
        className="pointer-events-auto absolute right-4 top-20 z-20 hidden md:block sm:right-6 sm:top-24"
      >
        <div className="glass-panel relative rounded-3xl p-3">
          <span className="absolute left-4 top-3 font-hud text-[9px] text-[#F3F1EA]/40">
            {'// LIVE VIEWPORT'}
          </span>
          <div className="mt-6 flex items-center justify-center">
            <Viewport3D size={150} />
          </div>
          <span className="absolute bottom-3 right-4 font-hud text-[9px] text-[#F3F1EA]/30">
            HOVER TO SHADE
          </span>
        </div>
      </FadeIn>

      <FadeIn delay={0.1} y={20} className="relative z-10 mt-8 sm:mt-10 md:mt-12 px-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-[var(--render-amber)]"
              style={{ animation: 'pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite' }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--render-amber)]" />
          </span>
          <span className="font-hud text-[10px] sm:text-xs text-[#F3F1EA]/60">
            {availabilityStatus.toUpperCase()}
          </span>
        </div>
      </FadeIn>

      <FadeIn
        delay={0.2}
        y={40}
        // Reserve room on the right for the "LIVE VIEWPORT" widget (only
        // shown from md up) so FitText shrinks the name to fit beside it
        // instead of running underneath and becoming unreadable.
        className="relative z-10 mt-3 sm:mt-3 md:-mt-2 px-6 md:px-10 md:pr-52 lg:pr-64"
      >
        <FitText
          as="h1"
          className="hero-heading font-black uppercase tracking-tight leading-none text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]"
        >
          Hi, i&apos;m {name}
        </FitText>
      </FadeIn>

      <div className="relative z-10 order-3 flex flex-1 items-center justify-center px-6 sm:absolute sm:inset-auto sm:left-1/2 sm:top-auto sm:order-none sm:flex-none sm:-translate-x-1/2 sm:bottom-0 sm:px-0">
        <FadeIn
          delay={0.6}
          y={30}
          className="relative w-[64vw] max-w-[300px] sm:w-[360px] md:w-[440px] lg:w-[520px]"
        >
          <div
            aria-hidden
            className="absolute inset-x-[8%] bottom-0 top-[12%] rounded-full"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(139,124,246,0.32) 0%, rgba(139,124,246,0) 68%)',
              filter: 'blur(28px)',
            }}
          />
          <Magnet padding={150} strength={3}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- intentional: a real full reload, not a soft client-side nav */}
            <a
              href="/"
              aria-label="Go to homepage"
              onClick={(e) => {
                // Same as the logo/name -- always a real full page
                // reload, not a soft navigation.
                e.preventDefault();
                window.location.href = '/';
              }}
              className="relative block aspect-[3/4] w-full"
            >
              {portraitUrl ? (
                <img
                  src={portraitUrl}
                  alt={`${name}, 3D creator portrait`}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="relative h-full w-full select-none object-contain"
                  draggable={false}
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0 animate-pulse rounded-3xl bg-white/[0.04]"
                />
              )}
            </a>
          </Magnet>
        </FadeIn>
      </div>

      <div className="relative z-10 order-4 mt-auto flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <p
            className="text-[#F3F1EA] font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[280px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            {professionalTitle}
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20} className="flex items-center gap-3 sm:gap-4">
          <a
            href="#projects"
            className="hidden sm:inline-block rounded-full border border-[#F3F1EA]/25 px-6 py-3.5 sm:px-7 md:px-8 text-xs sm:text-sm font-medium uppercase tracking-widest text-[#F3F1EA]/80 transition-all duration-300 ease-out hover:border-[#F3F1EA]/60 hover:text-[#F3F1EA] active:scale-[0.97]"
          >
            View Work
          </a>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}
