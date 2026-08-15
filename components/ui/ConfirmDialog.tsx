'use client';

import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A blocking confirmation modal. Used anywhere an action can't be undone
 * (e.g. deleting a project) instead of the native `window.confirm`, so the
 * styling matches the rest of the admin panel and a loading state can be
 * shown while the action is in flight.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0B2340] p-6 shadow-2xl animate-[toast-in_0.2s_ease-out]"
      >
        <div
          className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${
            destructive ? 'bg-red-500/10 text-red-400' : 'bg-[#4C8DFF]/10 text-[#8B7CF6]'
          }`}
        >
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <h2 id="confirm-dialog-title" className="text-base font-medium text-white">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-white/60">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            className={destructive ? 'bg-red-600 outline-red-500/30 hover:bg-red-600/90' : ''}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
