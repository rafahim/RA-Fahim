import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { SkillContent } from '../types/content.types';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

function toSkillContent(row: Tables<'skills'>): SkillContent {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    value: row.value,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Every skill, in display order. There's no draft/published split here
 * (unlike projects/services) — the list an admin sees is exactly the
 * list shown in the About section's "Tool Proficiency" panel.
 */
export async function fetchSkills(): Promise<ServiceResult<SkillContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toSkillContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load skills.'));
  }
}

export async function createSkill(
  input: TablesInsert<'skills'>
): Promise<ServiceResult<SkillContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.from('skills').insert(input).select().single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toSkillContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not create skill.'));
  }
}

export async function updateSkill(
  id: string,
  input: TablesUpdate<'skills'>
): Promise<ServiceResult<SkillContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('skills')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toSkillContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update skill.'));
  }
}

export async function deleteSkill(id: string): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('skills').delete().eq('id', id);
    if (error) return fail({ message: error.message, code: error.code });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not delete skill.'));
  }
}
