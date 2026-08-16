'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useTestimonials } from '../../hooks/useContent';
import { deleteTestimonial, updateTestimonial } from '../../services/testimonials.service';
import type { TestimonialContent } from '../../types/content.types';
import { Spinner, ErrorState, EmptyState, ConfirmDialog, useToast } from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/env';
import { logError } from '../../utils/errors';
import TestimonialFormModal from '../components/testimonials/TestimonialFormModal';

/**
 * Manages the client quotes shown in the public "What clients say"
 * section. There's no draft/published split -- like Marquee, an admin's
 * list here is exactly what visitors see. Modeled directly on
 * ServicesAdminPage.
 */
export default function TestimonialsAdminPage() {
  const { data, loading, error, refetch } = useTestimonials();
  const { showSuccess, showError } = useToast();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialContent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TestimonialContent | null>(null);

  const sorted = data ? [...data].sort((a, b) => a.displayOrder - b.displayOrder) : [];
  const nextDisplayOrder = sorted.reduce((max, t) => Math.max(max, t.displayOrder), -1) + 1;

  function openAddForm() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEditForm(testimonial: TestimonialContent) {
    setEditTarget(testimonial);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditTarget(null);
    refetch();
  }

  async function handleMove(testimonial: TestimonialContent, direction: -1 | 1) {
    const index = sorted.findIndex((t) => t.id === testimonial.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const neighbor = sorted[targetIndex];

    setPendingId(testimonial.id);
    const [a, b] = await Promise.all([
      updateTestimonial(testimonial.id, { display_order: neighbor.displayOrder }),
      updateTestimonial(neighbor.id, { display_order: testimonial.displayOrder }),
    ]);
    setPendingId(null);

    if (a.error || b.error) {
      const message = a.error?.message ?? b.error?.message ?? 'Could not reorder testimonials.';
      logError('TestimonialsAdminPage.reorder', message);
      showError(message);
      return;
    }
    refetch();
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteTestimonial(deleteTarget.id);
    setDeleting(false);
    if (result.error) {
      logError('TestimonialsAdminPage.delete', result.error);
      showError(result.error.message);
      return;
    }
    showSuccess('Testimonial deleted.');
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-medium">Testimonials</h1>
          <p className="text-sm text-white/50">
            Manage the client quotes shown in the &quot;What clients say&quot; section.
            There&apos;s no publish step -- every quote here is live on the site, in this
            order.
          </p>
        </div>
        {isSupabaseConfigured() && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#4C8DFF] px-5 py-2.5 text-sm font-medium tracking-wide text-white outline outline-1 -outline-offset-1 outline-white/20 transition-colors duration-200 hover:bg-[#4C8DFF]/90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add testimonial
          </button>
        )}
      </div>

      {!isSupabaseConfigured() && (
        <EmptyState
          title="Supabase isn't configured"
          description="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to manage testimonials."
        />
      )}

      {isSupabaseConfigured() && (
        <>
          {loading && <Spinner label="Loading testimonials..." className="py-12" />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && sorted.length === 0 && (
            <EmptyState
              title="No testimonials yet"
              description="Click “Add testimonial” to create the first quote for the &quot;What clients say&quot; section."
            />
          )}

          {!loading && !error && sorted.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-widest text-white/40">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Quote</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((testimonial) => (
                    <tr
                      key={testimonial.id}
                      className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(testimonial, -1)}
                            disabled={pendingId === testimonial.id}
                            aria-label="Move up"
                            title="Move up"
                            className="rounded p-0.5 text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(testimonial, 1)}
                            disabled={pendingId === testimonial.id}
                            aria-label="Move down"
                            title="Move down"
                            className="rounded p-0.5 text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <p className="truncate text-white/70">&ldquo;{testimonial.quote}&rdquo;</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{testimonial.clientName}</p>
                        <p className="text-xs text-white/40">{testimonial.clientRole || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(testimonial)}
                            aria-label="Edit testimonial"
                            title="Edit"
                            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(testimonial)}
                            disabled={pendingId === testimonial.id}
                            aria-label="Delete testimonial"
                            title="Delete"
                            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <TestimonialFormModal
        open={formOpen}
        initialTestimonial={editTarget}
        defaultDisplayOrder={nextDisplayOrder}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete testimonial from “${deleteTarget?.clientName}”?`}
        description="This permanently removes the quote from the public site. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
