/**
 * Centralized, validated access to client-safe environment variables.
 *
 * IMPORTANT: Only variables prefixed with `VITE_` are ever readable here —
 * that's a Vite guarantee, not just a convention. Server-only secrets
 * (Supabase service-role key, Cloudinary API secret) must never be added
 * to this file or referenced anywhere under `src/`. See `.env.example`
 * for the full list and where each secret is allowed to live.
 */

interface ClientEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  cloudinaryCloudName: string;
}

function readEnvVar(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

function buildEnv(): ClientEnv {
  return {
    supabaseUrl: readEnvVar('VITE_SUPABASE_URL'),
    supabaseAnonKey: readEnvVar('VITE_SUPABASE_ANON_KEY'),
    cloudinaryCloudName: readEnvVar('VITE_CLOUDINARY_CLOUD_NAME'),
  };
}

export const env: ClientEnv = buildEnv();

/**
 * Human-readable list of which required variables are missing, empty when
 * everything needed is configured. Callers decide what to do with this
 * (e.g. show a friendly "CMS not configured" state instead of crashing).
 */
export function getMissingEnvVars(): string[] {
  const missing: string[] = [];

  if (!env.supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!env.supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  return missing;
}

export const isSupabaseConfigured = (): boolean =>
  Boolean(env.supabaseUrl && env.supabaseAnonKey);

/**
 * Only checks that the client-safe cloud name is present. The actual
 * upload capability also depends on server-side secrets
 * (`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`) which the browser can't
 * see — if those are missing, upload attempts fail gracefully with a
 * clear error from `/api/cloudinary/sign-upload` instead of pretending
 * to be unconfigured here.
 */
export const isCloudinaryConfigured = (): boolean => Boolean(env.cloudinaryCloudName);
