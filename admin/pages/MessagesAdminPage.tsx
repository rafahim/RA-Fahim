'use client';

import { useState } from 'react';
import { Eye, MailOpen, Mail, Trash2 } from 'lucide-react';
import { useMessages } from '../../hooks/useContent';
import { markMessageRead, deleteMessage } from '../../services/messages.service';
import type { MessageContent } from '../../types/content.types';
import { ErrorState, EmptyState, Skeleton, ConfirmDialog, useToast } from '../../components/ui';
import { logError } from '../../utils/errors';
import MessageDetailModal from '../components/messages/MessageDetailModal';

function ReadStatusBadge({ isRead }: { isRead: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isRead ? 'bg-white/10 text-white/50' : 'bg-[#8B7CF6]/10 text-[#8B7CF6]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isRead ? 'bg-white/40' : 'bg-[#8B7CF6]'}`} />
      {isRead ? 'Read' : 'Unread'}
    </span>
  );
}

export default function MessagesAdminPage() {
  const { data, loading, error, refetch } = useMessages();
  const { showSuccess, showError } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openMessage, setOpenMessage] = useState<MessageContent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MessageContent | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleToggleRead(message: MessageContent) {
    setPendingId(message.id);
    const result = await markMessageRead(message.id, !message.isRead);
    setPendingId(null);
    if (result.error) {
      logError('MessagesAdminPage.toggleRead', result.error);
      showError(result.error.message);
      return;
    }
    showSuccess(!message.isRead ? 'Marked as read.' : 'Marked as unread.');
    // Keep the open modal (if any) in sync with the row it was opened from.
    setOpenMessage((prev) => (prev && prev.id === message.id ? result.data : prev));
    refetch();
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteMessage(deleteTarget.id);
    setDeleting(false);
    if (result.error) {
      logError('MessagesAdminPage.delete', result.error);
      showError(result.error.message);
      return;
    }
    showSuccess('Message deleted.');
    setDeleteTarget(null);
    setOpenMessage((prev) => (prev && prev.id === deleteTarget.id ? null : prev));
    refetch();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">Messages</h1>
      <p className="mb-8 text-sm text-white/50">Contact form submissions from your portfolio.</p>

      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-full max-w-md" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && data && data.length === 0 && (
        <EmptyState
          title="No messages yet"
          description="Submissions from the portfolio's contact form will show up here."
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((message) => (
            <li
              key={message.id}
              className={`rounded-lg border px-4 py-3.5 text-sm transition-colors ${
                message.isRead
                  ? 'border-white/10 bg-white/[0.03]'
                  : 'border-[#8B7CF6]/30 bg-[#8B7CF6]/[0.06]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setOpenMessage(message)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{message.name}</span>
                    <span className="truncate text-white/40">{message.email}</span>
                    <ReadStatusBadge isRead={message.isRead} />
                  </div>
                  <p className="mt-1.5 line-clamp-2 break-words text-white/70">{message.message}</p>
                  <p className="mt-1.5 text-xs text-white/30">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </button>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOpenMessage(message)}
                    aria-label="Open message"
                    title="Open"
                    className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Eye className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={pendingId === message.id}
                    onClick={() => handleToggleRead(message)}
                    aria-label={message.isRead ? 'Mark as unread' : 'Mark as read'}
                    title={message.isRead ? 'Mark as unread' : 'Mark as read'}
                    className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
                  >
                    {message.isRead ? (
                      <Mail className="h-4 w-4" aria-hidden />
                    ) : (
                      <MailOpen className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={pendingId === message.id}
                    onClick={() => setDeleteTarget(message)}
                    aria-label="Delete message"
                    title="Delete"
                    className="rounded-lg p-2 text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <MessageDetailModal
        message={openMessage}
        pending={pendingId === openMessage?.id}
        onClose={() => setOpenMessage(null)}
        onToggleRead={handleToggleRead}
        onDelete={(message) => setDeleteTarget(message)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete message from “${deleteTarget?.name}”?`}
        description="This permanently deletes the message. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
