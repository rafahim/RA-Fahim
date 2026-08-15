import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/server/auth';
import { createUploadSignature, isValidUploadFolder } from '../../../../lib/server/cloudinaryAdmin';

/**
 * POST /api/cloudinary/sign-upload
 * Body: { folder: string }
 *
 * Returns the params an admin's browser needs to upload a file DIRECTLY
 * to Cloudinary (bypassing this server for the actual bytes) while still
 * being cryptographically authorized by it. The Cloudinary API secret
 * never leaves this route handler — only the resulting signature does.
 *
 * Requires a valid admin Supabase session (Authorization: Bearer <token>).
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = (await request.json().catch(() => null)) as { folder?: unknown } | null;
  const folder = body?.folder;

  if (!isValidUploadFolder(folder)) {
    return NextResponse.json({ error: 'Invalid or missing upload folder.' }, { status: 400 });
  }

  try {
    const signature = createUploadSignature(folder);
    return NextResponse.json(signature, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not create upload signature.' },
      { status: 500 }
    );
  }
}
