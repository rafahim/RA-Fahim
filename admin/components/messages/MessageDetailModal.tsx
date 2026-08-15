'use client';

import { Mail, MailOpen, Trash2 } from 'lucide-react';
import type { MessageContent } from '../../../types/content.types';
import { Button } from '../../../components/ui';

interface MessageDetailModalProps {
  message: MessageContent | null;
  pending: boolean;
  onClose: () => void;
  onToggleRead: (message: MessageContent) => void;
  onDelete: (message: MessageContent) => void;
}

/**
 * Full-detail view of a single message ("Open message"), with the same
 * mark read/unread and delete actions available from the list row.
 */
export default function MessageDetailModal({
  message,
  pending,
  onClose,
  onToggleRead,
  onDelete,
}: MessageDetailModalProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-detail-title"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B2340] p-6 shadow-2xl animate-[toast-in_0.2s_ease-out]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="message-detail-title" className="truncate text-lg font-medium text-white">
              {message.name}
            </h2>
            <p className="truncate text-sm text-white/50">{message.email}</p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              message.isRead ? 'bg-white/10 text-white/50' : 'bg-[#29ABE2]/10 text-[#29ABE2]'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${message.isRead ? 'bg-white/40' : 'bg-[#29ABE2]'}`}
            />
            {message.isRead ? 'Read' : 'Unread'}
          </span>
        </div>

        <p className="mb-4 text-xs text-white/30">{new Date(message.createdAt).toLocaleString()}</p>

        <p className="mb-6 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/80">
          {message.message}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => onToggleRead(message)}
          >
            {message.isRead ? (
              <>
                <Mail className="h-4 w-4" aria-hidden />
                Mark as unread
              </>
            ) : (
              <>
                <MailOpen className="h-4 w-4" aria-hidden />
                Mark as read
              </>
            )}
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="text-red-400 hover:bg-red-500/10"
              disabled={pending}
              onClick={() => onDelete(message)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete
            </Button>
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
