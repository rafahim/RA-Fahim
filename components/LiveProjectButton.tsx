'use client';

interface LiveProjectButtonProps {
  className?: string;
  /** When provided, renders as a link to the live project instead of an inert button. */
  href?: string | null;
}

export default function LiveProjectButton({ className = '', href }: LiveProjectButtonProps) {
  const sharedClassName = `rounded-full border-2 border-[#CFE8FB] px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-medium uppercase tracking-widest text-[#CFE8FB] transition-colors duration-200 hover:bg-[#CFE8FB]/10 ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={`inline-block ${sharedClassName}`}>
        Live Project
      </a>
    );
  }

  return <button className={sharedClassName}>Live Project</button>;
}
