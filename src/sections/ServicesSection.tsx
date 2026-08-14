import FadeIn from '../components/FadeIn';
import { services as fallbackServices } from '../lib/data';
import { useServices } from '../hooks/useContent';

export default function ServicesSection() {
  const { data, loading } = useServices();

  // Fall back to the static list while loading, or when Supabase isn't
  // configured / has no published rows yet, so the section is never empty.
  const services =
    !loading && data && data.length > 0
      ? data.map((s) => ({ number: s.serviceNumber, name: s.name, description: s.description ?? '' }))
      : fallbackServices;

  return (
    <section
      id="price"
      className="bg-[#EAF6FF] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
    >
      <FadeIn>
        <h2
          className="text-[#071B33] font-black uppercase text-center mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Services
        </h2>
      </FadeIn>

      <div className="max-w-5xl mx-auto">
        {services.map((service, i) => (
          <FadeIn key={service.number} delay={i * 0.1}>
            <div
              className="flex items-start gap-6 sm:gap-10 md:gap-14 py-8 sm:py-10 md:py-12"
              style={{ borderBottom: '1px solid rgba(7, 27, 51, 0.15)' }}
            >
              <span
                className="font-black text-[#071B33] leading-none flex-shrink-0"
                style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
              >
                {service.number}
              </span>
              <div className="flex flex-col gap-3 sm:gap-4 pt-2">
                <h3
                  className="text-[#071B33] font-medium uppercase"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  {service.name}
                </h3>
                <p
                  className="text-[#071B33] font-light leading-relaxed max-w-2xl"
                  style={{
                    fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)',
                    opacity: 0.6,
                  }}
                >
                  {service.description}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
