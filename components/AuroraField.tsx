interface AuroraFieldProps {
  className?: string;
  variant?: 'hero' | 'panel';
}

/**
 * Two soft, slow-drifting radial-gradient blobs. Kept subtle and slow so it
 * reads as ambient atmosphere (an "arctic sky") rather than a moving effect
 * competing with content. Respects prefers-reduced-motion globally.
 */
export default function AuroraField({ className = '', variant = 'hero' }: AuroraFieldProps) {
  const opacity = variant === 'hero' ? 0.5 : 0.3;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="aurora-blob-1 absolute rounded-full"
        style={{
          width: '55vw',
          height: '55vw',
          maxWidth: 720,
          maxHeight: 720,
          top: '-18%',
          left: '-12%',
          background:
            'radial-gradient(circle, rgba(76,141,255,0.42) 0%, rgba(76,141,255,0) 70%)',
          filter: 'blur(44px)',
          opacity,
          willChange: 'transform',
        }}
      />
      <div
        className="aurora-blob-2 absolute rounded-full"
        style={{
          width: '45vw',
          height: '45vw',
          maxWidth: 600,
          maxHeight: 600,
          bottom: '-15%',
          right: '-10%',
          background:
            'radial-gradient(circle, rgba(139,124,246,0.32) 0%, rgba(139,124,246,0) 70%)',
          filter: 'blur(52px)',
          opacity,
          willChange: 'transform',
        }}
      />
    </div>
  );
}
