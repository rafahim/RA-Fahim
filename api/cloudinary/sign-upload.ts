import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth';
import { createUploadSignature, isValidUploadFolder } from '../_lib/cloudinaryAdmin';

/**
 * POST /api/cloudinary/sign-upload
 * Body: { folder: string }
 *
 * Returns the params an admin's browser needs to upload a file DIRECTLY
 * to Cloudinary (bypassing this server for the actual bytes) while still
 * being cryptographically authorized by it. The Cloudinary API secret
 * never leaves this function — only the resulting signature does.
 *
 * Requires a valid admin Supabase session (Authorization: Bearer <token>).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.message });
  }

  const folder = (req.body as { folder?: unknown } | null)?.folder;
  if (!isValidUploadFolder(folder)) {
    return res.status(400).json({ error: 'Invalid or missing upload folder.' });
  }

  try {
    const signature = createUploadSignature(folder);
    return res.status(200).json(signature);
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Could not create upload signature.',
    });
  }
}
