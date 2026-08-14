interface SkeletonProps {
  className?: string;
}

/** A pulsing placeholder block, used while content is loading. */
export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} aria-hidden />;
}
