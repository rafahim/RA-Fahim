interface ContactButtonProps {
  className?: string;
}

export default function ContactButton({ className = '' }: ContactButtonProps) {
  return (
    <a
      href="#contact"
      className={`inline-block rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base font-medium uppercase tracking-widest text-white outline outline-2 -outline-offset-[3px] outline-white transition-opacity duration-200 hover:opacity-90 ${className}`}
      style={{
        background:
          'linear-gradient(123deg, #001B3D 7%, #0077C2 37%, #29ABE2 72%, #7FDBFF 100%)',
        boxShadow:
          '0px 4px 4px rgba(0, 119, 194, 0.3), 4px 4px 12px #1CA7EC inset',
      }}
    >
      Contact Me
    </a>
  );
}
