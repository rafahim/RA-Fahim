import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchProjectById, fetchAllProjects } from '../../services/projects.service';
import { fetchImagesForProject } from '../../services/project-images.service';
import type { ProjectContent, ProjectImageContent } from '../../types/content.types';
import { Spinner, ErrorState, EmptyState } from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/env';
import { logError } from '../../utils/errors';
import ProjectForm from '../components/projects/ProjectForm';

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [project, setProject] = useState<ProjectContent | null>(null);
  const [images, setImages] = useState<ProjectImageContent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [nextDisplayOrder, setNextDisplayOrder] = useState(0);
  const [orderReady, setOrderReady] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Category + next-order suggestions are best-effort — they never block
      // edit mode (which doesn't use `defaultDisplayOrder`), but create mode
      // waits for this so a new project doesn't lock in a stale default of 0
      // before the real max display_order has loaded.
      fetchAllProjects().then((result) => {
        if (cancelled) return;
        if (!result.error) {
          setCategories(Array.from(new Set(result.data.map((p) => p.category))).sort());
          const maxOrder = result.data.reduce((max, p) => Math.max(max, p.displayOrder), -1);
          setNextDisplayOrder(maxOrder + 1);
        }
        setOrderReady(true);
      });

      if (!id) return;

      setLoading(true);
      setError(null);

      const projectResult = await fetchProjectById(id);
      if (cancelled) return;
      if (projectResult.error) {
        logError('ProjectFormPage.load', projectResult.error);
        setError(projectResult.error.message);
        setLoading(false);
        return;
      }

      const imagesResult = await fetchImagesForProject(id);
      if (cancelled) return;
      if (imagesResult.error) {
        logError('ProjectFormPage.loadImages', imagesResult.error);
        setError(imagesResult.error.message);
        setLoading(false);
        return;
      }

      setProject(projectResult.data);
      setImages(imagesResult.data);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div>
      <Link
        to="/admin/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to projects
      </Link>

      <h1 className="mb-1 text-2xl font-medium">{isEdit ? 'Edit project' : 'Add project'}</h1>
      <p className="mb-8 text-sm text-white/50">
        {isEdit
          ? 'Update this project and its images.'
          : 'Add a new project to the portfolio.'}
      </p>

      {!isSupabaseConfigured() && (
        <EmptyState
          title="Supabase isn't configured"
          description="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to create or edit projects."
        />
      )}

      {isSupabaseConfigured() && isEdit && loading && (
        <Spinner label="Loading project…" className="py-12" />
      )}

      {isSupabaseConfigured() && isEdit && !loading && error && (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      )}

      {isSupabaseConfigured() && !isEdit && !orderReady && (
        <Spinner label="Preparing form…" className="py-12" />
      )}

      {isSupabaseConfigured() &&
        ((!isEdit && orderReady) || (isEdit && !loading && !error && project)) && (
          <ProjectForm
            initialProject={project ?? undefined}
            initialImages={images}
            existingCategories={categories}
            defaultDisplayOrder={nextDisplayOrder}
          />
        )}
    </div>
  );
}
