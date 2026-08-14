import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth';
import { destroyAsset } from '../_lib/cloudinaryAdmin';

/**
 * POST /api/cloudinary/delete
 * Body: { publicId: string }
 *
 * Deletes an image asset from Cloudinary. Requires a valid admin
 * Supabase session — this is a privileged, destructive operation and
 * must never be callable from unauthenticated code.
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

  const publicId = (req.body as { publicId?: unknown } | null)?.publicId;
  if (typeof publicId !== 'string' || !publicId.trim()) {
    return res.status(400).json({ error: 'Missing publicId.' });
  }

  // Defense in depth: only ever allow deleting assets this app itself
  // uploaded, i.e. ones living under the `portfolio/` folder prefix.
  if (!publicId.startsWith('portfolio/')) {
    return res.status(400).json({ error: 'Refusing to delete an asset outside portfolio/.' });
  }

  try {
    const result = await destroyAsset(publicId);
    if (!result.ok) {
      return res.status(502).json({ error: result.message ?? 'Cloudinary delete failed.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Could not delete image.',
    });
  }
}
