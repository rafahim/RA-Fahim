import { createHash } from 'node:crypto';
import { getCloudinaryServerConfig } from './env';

/**
 * The only folders the upload signer will ever sign for. Keeping this as
 * a fixed whitelist (rather than trusting an arbitrary folder string from
 * the client) stops a malicious client from writing uploads into an
 * unrelated part of the Cloudinary account.
 */
export const CLOUDINARY_UPLOAD_FOLDERS = [
  'portfolio/profile',
  'portfolio/hero',
  'portfolio/projects/featured',
  'portfolio/projects/gallery',
  'portfolio/logo',
  'portfolio/favicon',
  'portfolio/og',
  'portfolio/marquee',
] as const;

export type CloudinaryUploadFolder = (typeof CLOUDINARY_UPLOAD_FOLDERS)[number];

export function isValidUploadFolder(value: unknown): value is CloudinaryUploadFolder {
  return typeof value === 'string' && (CLOUDINARY_UPLOAD_FOLDERS as readonly string[]).includes(value);
}

/**
 * Cloudinary's signing algorithm: take every param that will be sent
 * EXCEPT `file`, `cloud_name`, `resource_type`, and `api_key`; sort them
 * alphabetically by key; join as `key=value&key=value…`; append the API
 * secret; SHA-1 hash the result. See:
 * https://cloudinary.com/documentation/signatures
 */
function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: CloudinaryUploadFolder;
}

/** Produces a short-lived signature authorizing a direct-to-Cloudinary upload into `folder`. */
export function createUploadSignature(folder: CloudinaryUploadFolder): UploadSignature {
  const { cloudName, apiKey, apiSecret } = getCloudinaryServerConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ folder, timestamp }, apiSecret);
  return { cloudName, apiKey, timestamp, signature, folder };
}

export interface DestroyResult {
  ok: boolean;
  result?: string;
  message?: string;
}

/** Deletes an asset from Cloudinary by public_id, using a signed admin request. */
export async function destroyAsset(publicId: string): Promise<DestroyResult> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryServerConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ public_id: publicId, timestamp }, apiSecret);

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const data = (await response.json().catch(() => null)) as { result?: string } | null;

  if (!response.ok || !data) {
    return { ok: false, message: `Cloudinary destroy failed with status ${response.status}.` };
  }

  // Cloudinary returns { result: "ok" } on success, "not found" if it
  // was already gone (treated as success — the end state is what matters).
  if (data.result === 'ok' || data.result === 'not found') {
    return { ok: true, result: data.result };
  }

  return { ok: false, result: data.result, message: `Unexpected destroy result: ${data.result}` };
}
