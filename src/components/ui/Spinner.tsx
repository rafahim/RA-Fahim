interface SpinnerProps {
  className?: string;
  label?: string;
}

export default function Spinner({ className = '', label = 'Loading' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      <span className="text-sm text-white/60">{label}</span>
    </div>
  );
}
