import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { AboutContent } from '../types/content.types';
import type { Tables, TablesUpdate } from '../types/database.types';

function toAboutContent(row: Tables<'about'>): AboutContent {
  return {
    name: row.name,
    professionalTitle: row.professional_title,
    experience: row.experience,
    aboutHeading: row.about_heading,
    aboutDescription: row.about_description,
    additionalInfo: row.additional_info,
    profileImageUrl: row.profile_image_url,
    profileImagePublicId: row.profile_image_public_id,
    updatedAt: row.updated_at,
  };
}

export async function fetchAbout(): Promise<ServiceResult<AboutContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.from('about').select('*').eq('id', 1).single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toAboutContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load about content.'));
  }
}

export async function updateAbout(
  input: TablesUpdate<'about'>
): Promise<ServiceResult<AboutContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('about')
      .update(input)
      .eq('id', 1)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toAboutContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update about content.'));
  }
}
