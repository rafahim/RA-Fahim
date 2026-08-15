import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { WebsiteSettingsContent } from '../types/content.types';
import type { Tables, TablesUpdate } from '../types/database.types';

function toWebsiteSettingsContent(row: Tables<'website_settings'>): WebsiteSettingsContent {
  return {
    websiteTitle: row.website_title,
    websiteDescription: row.website_description,
    logoUrl: row.logo_url,
    logoPublicId: row.logo_public_id,
    faviconUrl: row.favicon_url,
    faviconPublicId: row.favicon_public_id,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    ogImageUrl: row.og_image_url,
    ogImagePublicId: row.og_image_public_id,
    updatedAt: row.updated_at,
  };
}

export async function fetchWebsiteSettings(): Promise<ServiceResult<WebsiteSettingsContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('website_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toWebsiteSettingsContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load website settings.'));
  }
}

export async function updateWebsiteSettings(
  input: TablesUpdate<'website_settings'>
): Promise<ServiceResult<WebsiteSettingsContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('website_settings')
      .update(input)
      .eq('id', 1)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toWebsiteSettingsContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update website settings.'));
  }
}
