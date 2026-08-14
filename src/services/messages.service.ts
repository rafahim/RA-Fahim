import { requireSupabase } from '../lib/supabase';
import { ok, fail, toServiceError, type ServiceResult } from '../types/api.types';
import type { MessageContent, NewMessageInput } from '../types/content.types';
import type { Tables } from '../types/database.types';

function toMessageContent(row: Tables<'messages'>): MessageContent {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

/** Public contact form submission. Write-only for anonymous visitors — see RLS. */
export async function submitMessage(input: NewMessageInput): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('messages').insert({
      name: input.name,
      email: input.email,
      message: input.message,
    });
    if (error) return fail({ message: error.message, code: error.code });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not send your message.'));
  }
}

export async function fetchMessages(): Promise<ServiceResult<MessageContent[]>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return fail({ message: error.message, code: error.code });
    return ok(data.map(toMessageContent));
  } catch (err) {
    return fail(toServiceError(err, 'Could not load messages.'));
  }
}

export async function markMessageRead(
  id: string,
  isRead = true
): Promise<ServiceResult<MessageContent>> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('messages')
      .update({ is_read: isRead })
      .eq('id', id)
      .select()
      .single();
    if (error) return fail({ message: error.message, code: error.code });
    return ok(toMessageContent(data));
  } catch (err) {
    return fail(toServiceError(err, 'Could not update message.'));
  }
}

export async function deleteMessage(id: string): Promise<ServiceResult<null>> {
  try {
    const client = requireSupabase();
    const { error } = await client.from('messages').delete().eq('id', id);
    if (error) return fail({ message: error.message, code: error.code });
    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not delete message.'));
  }
}
