'use client';

import dynamic from 'next/dynamic';
import HeroSection from '../sections/HeroSection';
import RenderBootLoader from '../components/RenderBootLoader';
import { useSiteMeta } from '../hooks/useSiteMeta';
import { useAbout, useWebsiteSettings } from '../hooks/useContent';

// Everything below the fold (and the purely-cosmetic custom cursor) is
// code-split into its own chunk instead of the initial bundle. The Hero
// still renders/paints immediately; these hydrate a beat later, which
// keeps first paint + time-to-interactive fast without changing what's
// on the page. `ssr: true` (the default) is kept so content is still
// present in the HTML for SEO -- only the client JS is deferred.
const CustomCursor = dynamic(() => import('../components/CustomCursor'), { ssr: false });
const MarqueeSection = dynamic(() => import('../sections/MarqueeSection'));
const AboutSection = dynamic(() => import('../sections/AboutSection'));
const ServicesSection = dynamic(() => import('../sections/ServicesSection'));
const ProjectsSection = dynamic(() => import('../sections/ProjectsSection'));
const TestimonialsSection = dynamic(() => import('../sections/TestimonialsSection'));
const ContactSection = dynamic(() => import('../sections/ContactSection'));

/**
 * The public portfolio homepage. Design, section order, and animations
 * are unchanged from the Vite app's HomePage.tsx — only the routing
 * mechanism (App Router page instead of a React Router route) changed.
 */
export default function HomePage() {
  useSiteMeta();

  // The Hero/nav render CMS-driven name, title, portrait, and logo text.
  // Until that data actually arrives, they'd otherwise show the
  // hardcoded defaults ("RA Fahim", the sample portrait) for a beat before
  // swapping to the real content — a visible flash. Waiting for both
  // fetches here (each resolves near-instantly when Supabase isn't
  // configured, since the hooks skip the network call entirely) lets
  // RenderBootLoader hold its cover until the real content is ready.
  const { loading: aboutLoading } = useAbout();
  const { loading: siteSettingsLoading } = useWebsiteSettings();
  const contentReady = !aboutLoading && !siteSettingsLoading;

  return (
    <div className="bg-[#0A0A0D]" style={{ overflowX: 'clip' }}>
      <RenderBootLoader contentReady={contentReady} />
      <CustomCursor />
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
}
