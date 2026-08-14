/**
 * Server-only environment access for Vercel serverless functions under
 * `/api`. These read UN-prefixed env vars (no `VITE_`), which Vite never
 * exposes to the browser bundle — that's what keeps them safe to use here.
 *
 * IMPORTANT: nothing in this file may be imported from `src/`.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export function getCloudinaryServerConfig() {
  return {
    cloudName: requireEnv('VITE_CLOUDINARY_CLOUD_NAME'),
    apiKey: requireEnv('CLOUDINARY_API_KEY'),
    apiSecret: requireEnv('CLOUDINARY_API_SECRET'),
  };
}

export function getSupabaseServerConfig() {
  return {
    url: requireEnv('VITE_SUPABASE_URL'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}
