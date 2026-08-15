'use client';

import HeroSection from '../sections/HeroSection';
import MarqueeSection from '../sections/MarqueeSection';
import AboutSection from '../sections/AboutSection';
import ServicesSection from '../sections/ServicesSection';
import ProjectsSection from '../sections/ProjectsSection';
import TestimonialsSection from '../sections/TestimonialsSection';
import ContactSection from '../sections/ContactSection';
import RenderBootLoader from '../components/RenderBootLoader';
import CustomCursor from '../components/CustomCursor';
import { useSiteMeta } from '../hooks/useSiteMeta';
import { useAbout, useWebsiteSettings } from '../hooks/useContent';

/**
 * The public portfolio homepage. Design, section order, and animations
 * are unchanged from the Vite app's HomePage.tsx — only the routing
 * mechanism (App Router page instead of a React Router route) changed.
 */
export default function HomePage() {
  useSiteMeta();

  // The Hero/nav render CMS-driven name, title, portrait, and logo text.
  // Until that data actually arrives, they'd otherwise show the
  // hardcoded defaults ("jack", the sample portrait) for a beat before
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
