import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { MarqueeImageContent } from '../types/content.types';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

function toMarqueeImageContent(row: Tables<'marquee_images'>): MarqueeImageContent {
  return {
    id: row.id,
    imageUrl: row.image_url,
    cloudinaryPublicId: row.cloudinary_public_id,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

/**
 * Every marquee image, in display order. There's no draft/published
 * split here (unlike projects/services) — the list an admin sees is
 * exactly the list visitors see, so this one function serves both the
 * public MarqueeSection and the admin management page.
 */
export async function fetchMarqueeImages(): Promise<ServiceResult<MarqueeImageContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('marquee_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toMarqueeImageContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load marquee images.'));
  }
}

export async function createMarqueeImage(
  input: TablesInsert<'marquee_images'>
): Promise<ServiceResult<MarqueeImageContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('marquee_images')
      .insert(input)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toMarqueeImageContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not add marquee image.'));
  }
}

export async function updateMarqueeImage(
  id: string,
  input: TablesUpdate<'marquee_images'>
): Promise<ServiceResult<MarqueeImageContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('marquee_images')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toMarqueeImageContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update marquee image.'));
  }
}

export async function deleteMarqueeImage(id: string): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('marquee_images').delete().eq('id', id);
    if (error) return fail({ message: error.message, code: error.code });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not delete marquee image.'));
  }
}
