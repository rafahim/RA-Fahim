import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { ContactSettingsContent } from '../types/content.types';
import type { Tables, TablesUpdate } from '../types/database.types';

function toContactSettingsContent(row: Tables<'contact_settings'>): ContactSettingsContent {
  return {
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    facebook: row.facebook,
    instagram: row.instagram,
    linkedin: row.linkedin,
    behance: row.behance,
    otherLinks: row.other_links,
    updatedAt: row.updated_at,
  };
}

export async function fetchContactSettings(): Promise<ServiceResult<ContactSettingsContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('contact_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toContactSettingsContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load contact settings.'));
  }
}

export async function updateContactSettings(
  input: TablesUpdate<'contact_settings'>
): Promise<ServiceResult<ContactSettingsContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('contact_settings')
      .update(input)
      .eq('id', 1)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toContactSettingsContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update contact settings.'));
  }
}
