'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ImageOff,
} from 'lucide-react';
import { useAllProjects } from '../../hooks/useContent';
import { deleteProject, updateProject } from '../../services/projects.service';
import { fetchImagesForProject } from '../../services/project-images.service';
import type { ProjectContent } from '../../types/content.types';
import {
  Spinner,
  ErrorState,
  EmptyState,
  Input,
  ConfirmDialog,
  useToast,
} from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/env';
import { logError } from '../../utils/errors';
import { deleteImage } from '../../utils/cloudinary';

function StatusBadge({ status }: { status: ProjectContent['status'] }) {
  const isPublished = status === 'published';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isPublished ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/10 text-white/50'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-white/40'}`}
      />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

export default function ProjectsAdminPage() {
  const { data, loading, error, refetch } = useAllProjects();
  const { showSuccess, showError } = useToast();

  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectContent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isFiltered = query.trim().length > 0;

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.clientType ?? '').toLowerCase().includes(q)
    );
  }, [data, query]);

  async function handleTogglePublish(project: ProjectContent) {
    setPendingId(project.id);
    const nextStatus = project.status === 'published' ? 'draft' : 'published';
    const result = await updateProject(project.id, { status: nextStatus });
    setPendingId(null);
    if (result.error) {
      logError('ProjectsAdminPage.togglePublish', result.error);
      showError(result.error.message);
      return;
    }
    showSuccess(nextStatus === 'published' ? 'Project published.' : 'Project unpublished.');
    refetch();
  }

  async function handleMove(project: ProjectContent, direction: -1 | 1) {
    if (!data) return;
    const sorted = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((p) => p.id === project.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const neighbor = sorted[targetIndex];

    setPendingId(project.id);
    const [a, b] = await Promise.all([
      updateProject(project.id, { display_order: neighbor.displayOrder }),
      updateProject(neighbor.id, { display_order: project.displayOrder }),
    ]);
    setPendingId(null);

    if (a.error || b.error) {
      const message = a.error?.message ?? b.error?.message ?? 'Could not reorder projects.';
      logError('ProjectsAdminPage.reorder', message);
      showError(message);
      return;
    }
    refetch();
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);

    // Best-effort Cloudinary cleanup before removing the database row, so
    // deleting a project doesn't leave orphaned assets behind (the featured
    // image and every gallery image). This never blocks the actual delete —
    // a failed asset cleanup is logged, not surfaced as a hard error, since
    // the project_images rows are removed regardless via ON DELETE CASCADE.
    if (deleteTarget.featuredImagePublicId) {
      const cleanup = await deleteImage(deleteTarget.featuredImagePublicId);
      if (cleanup.error) {
        logError('ProjectsAdminPage.delete.cleanupFeaturedImage', cleanup.error);
      }
    }
    const imagesResult = await fetchImagesForProject(deleteTarget.id);
    if (imagesResult.error) {
      logError('ProjectsAdminPage.delete.loadGalleryImages', imagesResult.error);
    } else {
      await Promise.all(
        imagesResult.data
          .filter((img) => img.cloudinaryPublicId)
          .map(async (img) => {
            const cleanup = await deleteImage(img.cloudinaryPublicId as string);
            if (cleanup.error) {
              logError('ProjectsAdminPage.delete.cleanupGalleryImage', cleanup.error);
            }
          })
      );
    }

    const result = await deleteProject(deleteTarget.id);
    setDeleting(false);
    if (result.error) {
      logError('ProjectsAdminPage.delete', result.error);
      showError(result.error.message);
      return;
    }
    showSuccess('Project deleted.');
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-medium">Projects</h1>
          <p className="text-sm text-white/50">
            Manage the projects shown in the portfolio&apos;s Projects section.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#4C8DFF] px-5 py-2.5 text-sm font-medium tracking-wide text-white outline outline-1 -outline-offset-1 outline-white/20 transition-colors duration-200 hover:bg-[#4C8DFF]/90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add project
        </Link>
      </div>

      {!isSupabaseConfigured() && (
        <EmptyState
          title="Supabase isn't configured"
          description="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to manage projects."
        />
      )}

      {isSupabaseConfigured() && (
        <>
          <div className="mb-5 max-w-sm">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search projects…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                aria-label="Search projects"
              />
            </div>
          </div>

          {loading && <Spinner label="Loading projects..." className="py-12" />}
          {!loading && error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && data && data.length === 0 && (
            <EmptyState
              title="No projects yet"
              description="Click “Add project” to create the first entry for the portfolio&apos;s Projects section."
            />
          )}

          {!loading && !error && data && data.length > 0 && filtered.length === 0 && (
            <EmptyState title="No matches" description={`No projects match “${query}”.`} />
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs uppercase tracking-widest text-white/40">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Thumbnail</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(project, -1)}
                            disabled={isFiltered || pendingId === project.id}
                            aria-label="Move up"
                            title={isFiltered ? 'Clear search to reorder' : 'Move up'}
                            className="rounded p-0.5 text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(project, 1)}
                            disabled={isFiltered || pendingId === project.id}
                            aria-label="Move down"
                            title={isFiltered ? 'Clear search to reorder' : 'Move down'}
                            className="rounded p-0.5 text-white/40 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {project.featuredImage ? (
                          <img
                            src={project.featuredImage}
                            alt={project.name}
                            className="h-12 w-16 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded-md bg-white/5 text-white/20">
                            <ImageOff className="h-4 w-4" aria-hidden />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{project.name}</p>
                        {project.clientType && (
                          <p className="text-xs text-white/40">{project.clientType}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/70">{project.category}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 text-white/50">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(project)}
                            disabled={pendingId === project.id}
                            aria-label={project.status === 'published' ? 'Unpublish' : 'Publish'}
                            title={project.status === 'published' ? 'Unpublish' : 'Publish'}
                            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
                          >
                            {project.status === 'published' ? (
                              <EyeOff className="h-4 w-4" aria-hidden />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden />
                            )}
                          </button>
                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            aria-label="Edit project"
                            title="Edit"
                            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(project)}
                            disabled={pendingId === project.id}
                            aria-label="Delete project"
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete “${deleteTarget?.name}”?`}
        description="This permanently deletes the project and all of its gallery images. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
