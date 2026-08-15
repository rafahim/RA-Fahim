import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { ProjectContent, ProjectImageContent, ProjectWithImages } from '../types/content.types';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types';
import { fetchImagesForProjects } from './project-images.service';

function toProjectContent(row: Tables<'projects'>): ProjectContent {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    clientType: row.client_type,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    projectUrl: row.project_url,
    year: row.year,
    featuredImage: row.featured_image,
    featuredImagePublicId: row.featured_image_public_id,
    status: row.status,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchPublishedProjects(): Promise<ServiceResult<ProjectContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toProjectContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load projects.'));
  }
}

export async function fetchAllProjects(): Promise<ServiceResult<ProjectContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toProjectContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load projects.'));
  }
}

/**
 * Public site: published projects with their gallery images attached,
 * in a single round trip after the initial projects query (one batched
 * `IN` query for all galleries, not one query per project).
 */
export async function fetchPublishedProjectsWithImages(): Promise<
  ServiceResult<ProjectWithImages[]>
> {
  const projectsResult = await fetchPublishedProjects();
  if (projectsResult.error) return projectsResult;

  const publishedProjects = projectsResult.data;
  if (publishedProjects.length === 0) return ok([]);

  const imagesResult = await fetchImagesForProjects(publishedProjects.map((p) => p.id));
  if (imagesResult.error) return imagesResult;

  const imagesByProject = new Map<string, ProjectImageContent[]>();
  for (const image of imagesResult.data) {
    const existing = imagesByProject.get(image.projectId);
    if (existing) {
      existing.push(image);
    } else {
      imagesByProject.set(image.projectId, [image]);
    }
  }

  return ok(
    publishedProjects.map((project) => ({
      ...project,
      images: imagesByProject.get(project.id) ?? [],
    }))
  );
}

/** Admin-only: a single project by id, for the edit form. */
export async function fetchProjectById(id: string): Promise<ServiceResult<ProjectContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.from('projects').select('*').eq('id', id).single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toProjectContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load project.'));
  }
}

export async function createProject(
  input: TablesInsert<'projects'>
): Promise<ServiceResult<ProjectContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.from('projects').insert(input).select().single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toProjectContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not create project.'));
  }
}

export async function updateProject(
  id: string,
  input: TablesUpdate<'projects'>
): Promise<ServiceResult<ProjectContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('projects')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toProjectContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update project.'));
  }
}

export async function deleteProject(id: string): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) return fail({ message: error.message, code: error.code });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not delete project.'));
  }
}
