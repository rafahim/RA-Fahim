import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { ServiceContent } from '../types/content.types';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

function toServiceContent(row: Tables<'services'>): ServiceContent {
  return {
    id: row.id,
    serviceNumber: row.service_number,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchPublishedServices(): Promise<ServiceResult<ServiceContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('services')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toServiceContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load services.'));
  }
}

export async function fetchAllServices(): Promise<ServiceResult<ServiceContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toServiceContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load services.'));
  }
}

export async function createService(
  input: TablesInsert<'services'>
): Promise<ServiceResult<ServiceContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.from('services').insert(input).select().single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toServiceContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not create service.'));
  }
}

export async function updateService(
  id: string,
  input: TablesUpdate<'services'>
): Promise<ServiceResult<ServiceContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('services')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toServiceContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update service.'));
  }
}

export async function deleteService(id: string): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('services').delete().eq('id', id);
    if (error) return fail({ message: error.message, code: error.code });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not delete service.'));
  }
}
