/**
 * Server-only environment access for Next.js Route Handlers under
 * `app/api`. These read UN-prefixed env vars (no `NEXT_PUBLIC_`), which
 * Next.js never exposes to the browser bundle — that's what keeps them
 * safe to use here.
 *
 * IMPORTANT: nothing in this file may be imported from a "use client"
 * component.
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
    cloudName: requireEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    apiKey: requireEnv('CLOUDINARY_API_KEY'),
    apiSecret: requireEnv('CLOUDINARY_API_SECRET'),
  };
}

export function getSupabaseServerConfig() {
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

/**
 * SMTP config for the contact-form email notification
 * (see `app/api/contact/route.ts`). Read only from Route Handlers —
 * never imported into a "use client" component — so the SMTP password
 * never reaches the browser bundle.
 */
export function getSmtpServerConfig() {
  const port = Number(requireEnv('SMTP_PORT'));
  if (!Number.isFinite(port)) {
    throw new Error('SMTP_PORT must be a number.');
  }

  return {
    host: requireEnv('SMTP_HOST'),
    port,
    // 465 is implicit TLS; anything else (587, 25, ...) uses STARTTLS.
    // Can still be forced explicitly with SMTP_SECURE=true/false.
    secure: (process.env.SMTP_SECURE ?? (port === 465 ? 'true' : 'false')) === 'true',
    user: requireEnv('SMTP_USER'),
    password: requireEnv('SMTP_PASSWORD'),
    // Where the notification email is delivered — the site owner's inbox.
    // Falls back to the SMTP account itself if not set separately.
    toEmail: process.env.CONTACT_TO_EMAIL?.trim() || requireEnv('SMTP_USER'),
  };
}

/** True only when every SMTP env var needed to send mail is present. */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
  );
}
