import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { ProjectImageContent } from '../types/content.types';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

function toProjectImageContent(row: Tables<'project_images'>): ProjectImageContent {
  return {
    id: row.id,
    projectId: row.project_id,
    imageUrl: row.image_url,
    cloudinaryPublicId: row.cloudinary_public_id,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

export async function fetchImagesForProject(
  projectId: string
): Promise<ServiceResult<ProjectImageContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toProjectImageContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load project images.'));
  }
}

/**
 * Batched gallery fetch for the public site: one query for every image
 * belonging to `projectIds`, instead of one query per project. Callers
 * group the flat result by `projectId` themselves (see
 * `fetchPublishedProjectsWithImages` in `projects.service.ts`).
 */
export async function fetchImagesForProjects(
  projectIds: string[]
): Promise<ServiceResult<ProjectImageContent[]>> {
  if (projectIds.length === 0) return ok([]);

  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('project_images')
      .select('*')
      .in('project_id', projectIds)
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toProjectImageContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load project images.'));
  }
}

export async function addProjectImage(
  input: TablesInsert<'project_images'>
): Promise<ServiceResult<ProjectImageContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('project_images')
      .insert(input)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toProjectImageContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not add project image.'));
  }
}

export async function updateProjectImage(
  id: string,
  input: TablesUpdate<'project_images'>
): Promise<ServiceResult<ProjectImageContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('project_images')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toProjectImageContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update project image.'));
  }
}

export async function deleteProjectImage(id: string): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('project_images').delete().eq('id', id);
    if (error) return fail({ message: error.message, code: error.code });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not delete project image.'));
  }
}
