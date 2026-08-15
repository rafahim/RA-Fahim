import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSmtpServerConfig, isSmtpConfigured } from '../../../lib/server/env';

/**
 * POST /api/contact
 * Body: { name: string, email: string, message: string }
 *
 * Sends an email notification (via SMTP/nodemailer) to the site owner's
 * inbox whenever a visitor submits the public contact form. This is
 * ADDITIVE to — never a replacement for — saving the message in Supabase
 * (see `services/messages.service.ts`, called separately from
 * `ContactSection`). The message is always readable in the admin panel
 * even if this route fails or SMTP isn't configured; this route only
 * adds the email notification on top of that.
 *
 * The SMTP password lives only in server-side env vars (see
 * `lib/server/env.ts` / `.env.example`) and never reaches the browser.
 */

const MAX_LENGTHS = { name: 200, email: 320, message: 5000 } as const;

// Best-effort in-memory rate limit (per server instance) so one visitor
// can't hammer this endpoint. Not a substitute for a real rate limiter,
// but enough to stop accidental double-submits / naive spam bots.
const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 30_000;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const now = Date.now();
  const lastSubmission = recentSubmissions.get(clientKey);
  if (lastSubmission && now - lastSubmission < RATE_LIMIT_WINDOW_MS) {
    return NextResponse.json(
      { error: 'Please wait a moment before sending another message.' },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; email?: unknown; message?: unknown }
    | null;

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }
  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    message.length > MAX_LENGTHS.message
  ) {
    return NextResponse.json({ error: 'One or more fields is too long.' }, { status: 400 });
  }

  // Record this submission attempt now (once validation has passed) so the
  // rate limit applies consistently, regardless of whether SMTP happens to
  // be configured below.
  recentSubmissions.set(clientKey, now);
  if (recentSubmissions.size > 500) {
    const cutoff = now - RATE_LIMIT_WINDOW_MS;
    for (const [key, timestamp] of recentSubmissions) {
      if (timestamp < cutoff) recentSubmissions.delete(key);
    }
  }

  if (!isSmtpConfigured()) {
    // Not an error the visitor needs to see — the message is still saved
    // via Supabase separately. Just tell the caller the email step was
    // skipped so it can decide whether to mention it.
    return NextResponse.json({ sent: false, reason: 'SMTP not configured' }, { status: 200 });
  }

  try {
    const smtp = getSmtpServerConfig();
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.password },
    });

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${smtp.user}>`,
      to: smtp.toEmail,
      replyTo: `"${name}" <${email}>`,
      subject: `New portfolio message from ${name}`,
      text: `You have a new message from your portfolio contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; font-size: 15px; color: #111;">
          <p><strong>New message from your portfolio contact form.</strong></p>
          <p><strong>Name:</strong> ${escapeHtml(name)}<br/>
          <strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    return NextResponse.json({ sent: true }, { status: 200 });
  } catch (err) {
    console.error('[api/contact] Failed to send notification email:', err);
    return NextResponse.json(
      { error: 'Could not send the email notification.' },
      { status: 502 }
    );
  }
}
