import { supabase } from '../lib/supabase';
import { toServiceError, type ServiceResult, ok, fail } from '../types/api.types';

/**
 * Secure, signed Cloudinary uploads.
 *
 * SECURITY: the Cloudinary API secret never touches the browser. Every
 * upload is authorized by a short-lived signature minted server-side (see
 * `/api/cloudinary/sign-upload.ts`), which itself requires a valid admin
 * Supabase session. The actual file bytes still go straight from the
 * browser to Cloudinary (not proxied through our server) so uploads stay
 * fast and we get real progress events — only the *authorization* is
 * server-side.
 */

/** Every place in the CMS that can hold a Cloudinary image, each scoped to its own folder. */
export const CLOUDINARY_FOLDERS = {
  profile: 'portfolio/profile',
  hero: 'portfolio/hero',
  projectFeatured: 'portfolio/projects/featured',
  projectGallery: 'portfolio/projects/gallery',
  logo: 'portfolio/logo',
  favicon: 'portfolio/favicon',
  og: 'portfolio/og',
} as const;

export type CloudinaryFolderKey = keyof typeof CLOUDINARY_FOLDERS;

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp';
export const DEFAULT_MAX_FILE_SIZE_MB = 8;

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
}

/** Validates file type and size before spending a network round-trip on it. */
export function validateImageFile(
  file: File,
  maxSizeMB: number = DEFAULT_MAX_FILE_SIZE_MB
): ServiceResult<true> {
  const isAcceptedType =
    (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!isAcceptedType) {
    return fail({ message: 'Only JPG, PNG, and WEBP images are allowed.' });
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return fail({ message: `Image must be smaller than ${maxSizeMB}MB.` });
  }

  return ok(true);
}

async function getAccessToken(): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error('You must be signed in as an admin to upload images.');
  }
  return data.session.access_token;
}

interface SignUploadResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

async function fetchUploadSignature(folder: string, accessToken: string): Promise<SignUploadResponse> {
  const response = await fetch('/api/cloudinary/sign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ folder }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || `Could not authorize upload (status ${response.status}).`);
  }

  return (await response.json()) as SignUploadResponse;
}

/**
 * Uploads `file` directly to Cloudinary using a freshly-minted signature,
 * reporting progress via `onProgress` (0–100). Validates type/size first.
 */
export function uploadImage(
  file: File,
  folderKey: CloudinaryFolderKey,
  options?: { maxSizeMB?: number; onProgress?: (percent: number) => void }
): Promise<ServiceResult<CloudinaryUploadResult>> {
  return new Promise((resolve) => {
    void (async () => {
      const validation = validateImageFile(file, options?.maxSizeMB);
      if (validation.error) {
        resolve(fail(validation.error));
        return;
      }

      try {
        const accessToken = await getAccessToken();
        const folder = CLOUDINARY_FOLDERS[folderKey];
        const sig = await fetchUploadSignature(folder, accessToken);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sig.apiKey);
        formData.append('timestamp', String(sig.timestamp));
        formData.append('signature', sig.signature);
        formData.append('folder', sig.folder);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && options?.onProgress) {
            options.onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          let data: {
            secure_url?: string;
            public_id?: string;
            width?: number;
            height?: number;
            error?: { message?: string };
          } | null = null;
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            data = null;
          }

          if (xhr.status < 200 || xhr.status >= 300 || !data?.secure_url || !data.public_id) {
            resolve(
              fail({
                message: data?.error?.message || `Upload failed with status ${xhr.status}.`,
                code: String(xhr.status),
              })
            );
            return;
          }

          resolve(
            ok({
              secureUrl: data.secure_url,
              publicId: data.public_id,
              width: data.width ?? 0,
              height: data.height ?? 0,
            })
          );
        };

        xhr.onerror = () => resolve(fail({ message: 'Network error during upload.' }));
        xhr.send(formData);
      } catch (err) {
        resolve(fail(toServiceError(err, 'Image upload failed.')));
      }
    })();
  });
}

/** Deletes a previously-uploaded image from Cloudinary via the signed server route. */
export async function deleteImage(publicId: string): Promise<ServiceResult<null>> {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      return fail({
        message: body?.error || `Delete failed with status ${response.status}.`,
        code: String(response.status),
      });
    }

    return ok(null);
  } catch (err) {
    return fail(toServiceError(err, 'Could not delete image.'));
  }
}
