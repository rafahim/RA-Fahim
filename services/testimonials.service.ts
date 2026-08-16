import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { TestimonialContent } from '../types/content.types';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

function toTestimonialContent(row: Tables<'testimonials'>): TestimonialContent {
  return {
    id: row.id,
    quote: row.quote,
    clientName: row.client_name,
    clientRole: row.client_role,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Every testimonial, in display order. There's no draft/published split
 * here (unlike projects/services) — the list an admin sees is exactly
 * the list shown in the public "What clients say" section.
 */
export async function fetchTestimonials(): Promise<ServiceResult<TestimonialContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toTestimonialContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load testimonials.'));
  }
}

export async function createTestimonial(
  input: TablesInsert<'testimonials'>
): Promise<ServiceResult<TestimonialContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.from('testimonials').insert(input).select().single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toTestimonialContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not create testimonial.'));
  }
}

export async function updateTestimonial(
  id: string,
  input: TablesUpdate<'testimonials'>
): Promise<ServiceResult<TestimonialContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('testimonials')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toTestimonialContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update testimonial.'));
  }
}

export async function deleteTestimonial(id: string): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('testimonials').delete().eq('id', id);
    if (error) return fail({ message: error.message, code: error.code });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not delete testimonial.'));
  }
}
