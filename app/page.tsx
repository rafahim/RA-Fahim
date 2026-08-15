'use client';

import HeroSection from '../sections/HeroSection';
import MarqueeSection from '../sections/MarqueeSection';
import AboutSection from '../sections/AboutSection';
import ServicesSection from '../sections/ServicesSection';
import ProjectsSection from '../sections/ProjectsSection';
import ContactSection from '../sections/ContactSection';
import { useSiteMeta } from '../hooks/useSiteMeta';

/**
 * The public portfolio homepage. Design, section order, and animations
 * are unchanged from the Vite app's HomePage.tsx — only the routing
 * mechanism (App Router page instead of a React Router route) changed.
 */
export default function HomePage() {
  useSiteMeta();

  return (
    <div className="bg-[#0A0A0D]" style={{ overflowX: 'clip' }}>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
