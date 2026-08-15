interface ContactButtonProps {
  className?: string;
}

// No hooks or browser APIs here -- this can render as a Server Component,
// keeping it out of the client JS bundle entirely.
export default function ContactButton({ className = '' }: ContactButtonProps) {
  return (
    <a
      href="#contact"
      className={`inline-block rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base font-medium uppercase tracking-widest text-white border border-white/15 transition-all duration-300 ease-out hover:border-white/30 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 ${className}`}
      style={{
        background: 'linear-gradient(123deg, #0a0a12 7%, #3b6fe0 37%, #6f5fe0 72%, #8b7cf6 100%)',
        boxShadow: '0 8px 30px -8px rgba(76,141,255,0.45)',
      }}
    >
      Contact Me
    </a>
  );
}
