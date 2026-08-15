'use client';

interface LiveProjectButtonProps {
  className?: string;
  /** When provided, renders as a link to the live project instead of an inert button. */
  href?: string | null;
}

export default function LiveProjectButton({ className = '', href }: LiveProjectButtonProps) {
  const sharedClassName = `rounded-full border border-white/25 px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-medium uppercase tracking-widest text-[#F3F1EA] transition-all duration-200 hover:border-[#8B7CF6]/60 hover:bg-white/[0.06] ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={`inline-block ${sharedClassName}`}>
        Live Project
      </a>
    );
  }

  return <button className={sharedClassName}>Live Project</button>;
}
