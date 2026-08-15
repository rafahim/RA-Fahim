import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/server/auth';
import { destroyAsset } from '../../../../lib/server/cloudinaryAdmin';

/**
 * POST /api/cloudinary/delete
 * Body: { publicId: string }
 *
 * Deletes an image asset from Cloudinary. Requires a valid admin
 * Supabase session — this is a privileged, destructive operation and
 * must never be callable from unauthenticated code.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as { publicId?: unknown } | null;
  const publicId = body?.publicId;

  if (typeof publicId !== 'string' || !publicId.trim()) {
    return NextResponse.json({ error: 'Missing publicId.' }, { status: 400 });
  }

  // Defense in depth: only ever allow deleting assets this app itself
  // uploaded, i.e. ones living under the `portfolio/` folder prefix.
  if (!publicId.startsWith('portfolio/')) {
    return NextResponse.json(
      { error: 'Refusing to delete an asset outside portfolio/.' },
      { status: 400 }
    );
  }

  try {
    const result = await destroyAsset(publicId);
    if (!result.ok) {
      return NextResponse.json({ error: result.message ?? 'Cloudinary delete failed.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not delete image.' },
      { status: 500 }
    );
  }
}
