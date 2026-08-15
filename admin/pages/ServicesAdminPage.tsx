'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { useAllServices } from '../../hooks/useContent';
import { deleteService, updateService } from '../../services/services.service';
import type { ServiceContent } from '../../types/content.types';
import { Spinner, ErrorState, EmptyState, ConfirmDialog, useToast } from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/env';
import { logError } from '../../utils/errors';
import ServiceFormModal from '../components/services/ServiceFormModal';

function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        published ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/10 text-white/50'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? 'bg-emerald-400' : 'bg-white/40'}`} />
      {published ? 'Published' : 'Disabled'}
    </span>
  );
}

export default function ServicesAdminPage() {
  const { data, loading, error, refetch } = useAllServices();
  const { showSuccess, showError } = useToast();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceContent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceContent | null>(null);

  const sorted = data ? [...data].sort((a, b) => a.displayOrder - b.displayOrder) : [];
  const nextDisplayOrder = sorted.reduce((max, s) => Math.max(max, s.displayOrder), -1) + 1;

  function openAddForm() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEditForm(service: ServiceContent) {
    setEditTarget(service);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditTarget(null);
    refetch();
  }

  async function handleTogglePublish(service: ServiceContent) {
    setPendingId(service.id);
    const result = await updateService(service.id, { published: !service.published });
    setPendingId(null);
    if (result.error) {
      logError('ServicesAdminPage.togglePublish', result.error);
      showError(result.error.message);
      return;
    }
    showSuccess(result.data.published ? 'Service published.' : 'Service disabled.');
    refetch();
  }

  async function handleMove(service: ServiceContent, direction: -1 | 1) {
    const index = sorted.findIndex((s) => s.id === service.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const neighbor = sorted[targetIndex];

    setPendingId(service.id);
    const [a, b] = await Promise.all([
      updateService(service.id, { display_order: neighbor.displayOrder }),
      updateService(neighbor.id, { display_order: service.displayOrder }),
    ]);
    setPendingId(null);

    if (a.error || b.error) {
      const message = a.error?.message ?? b.error?.message ?? 'Could not reorder services.';
      logError('ServicesAdminPage.reorder', message);
      showError(message);
      return;
    }
    refetch();
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteService(deleteTarget.id);
    setDeleting(false);
    if (result.error) {
      logError('ServicesAdminPage.delete', result.error);
      showError(result.error.message);
      return;
    }
    showSuccess('Service deleted.');
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-medium">Services</h1>
          <p className="text-sm text-white/50">
            Manage the offerings shown in the portfolio&apos;s Services section.
          </p>
        </div>
        {isSupabaseConfigured() && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0077C2] px-5 py-2.5 text-sm font-medium tracking-wide text-white outline outline-1 -outline-offset-1 outline-white/20 transition-colors duration-200 hover:bg-[#0077C2]/90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add service
          </button>
        )}
      </div>

      {!isSupabaseConfigured() && (
        <EmptyState
          title="Supabase isn't configured"
          description="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to manage services."
        />
      )}

      {isSupabaseConfigured() && (
        <>
          {loading && <Spinner label="Loading services..." className="py-12" />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && sorted.length === 0 && (
            <EmptyState
              title="No services yet"
              description="Click “Add service” to create the first entry for the portfolio&apos;s Services section."
            />
          )}

          {!loading && !error && sorted.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-widest text-white/40">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Number</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(service, -1)}
                            disabled={pendingId === service.id}
                            aria-label="Move up"
                            title="Move up"
                            className="rounded p-0.5 text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(service, 1)}
                            disabled={pendingId === service.id}
                            aria-label="Move down"
                            title="Move down"
                            className="rounded p-0.5 text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-white/70">{service.serviceNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{service.name}</p>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-white/50">{service.description || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <PublishedBadge published={service.published} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(service)}
                            disabled={pendingId === service.id}
                            aria-label={service.published ? 'Disable' : 'Enable'}
                            title={service.published ? 'Disable' : 'Enable'}
                            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
                          >
                            {service.published ? (
                              <EyeOff className="h-4 w-4" aria-hidden />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(service)}
                            aria-label="Edit service"
                            title="Edit"
                            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(service)}
                            disabled={pendingId === service.id}
                            aria-label="Delete service"
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

      <ServiceFormModal
        open={formOpen}
        initialService={editTarget}
        defaultDisplayOrder={nextDisplayOrder}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete “${deleteTarget?.name}”?`}
        description="This permanently deletes the service. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
