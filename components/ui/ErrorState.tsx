'use client';

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center ${className}`}
      role="alert"
    >
      <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden />
      <p className="text-sm text-white/70">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-widest text-white/80 transition-colors hover:border-white/40 hover:text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}
