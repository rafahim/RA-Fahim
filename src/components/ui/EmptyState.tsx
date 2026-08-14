interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ title, description, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-white/10 p-8 text-center ${className}`}
    >
      <p className="text-sm font-medium text-white/80">{title}</p>
      {description && <p className="text-xs text-white/50">{description}</p>}
    </div>
  );
}
