import HeroSection from '../sections/HeroSection';
import MarqueeSection from '../sections/MarqueeSection';
import AboutSection from '../sections/AboutSection';
import ServicesSection from '../sections/ServicesSection';
import ProjectsSection from '../sections/ProjectsSection';
import ContactSection from '../sections/ContactSection';
import { useSiteMeta } from '../hooks/useSiteMeta';

/**
 * The public portfolio homepage. This is exactly what `App.tsx` rendered
 * before routing was introduced — extracted as-is so the design,
 * animations, and content are untouched.
 */
export default function HomePage() {
  useSiteMeta();

  return (
    <div className="bg-[#071B33]" style={{ overflowX: 'clip' }}>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
