'use client';

import { useState } from 'react';
import FadeIn from '../components/FadeIn';
import { useContactSettings } from '../hooks/useContent';
import { submitMessage } from '../services/messages.service';
import { isSupabaseConfigured } from '../lib/env';
import { logError } from '../utils/errors';

const FIELD_CLASS =
  'w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#29ABE2]';

interface ContactLinkProps {
  label: string;
  value: string;
  href: string;
}

function ContactLink({ label, value, href }: ContactLinkProps) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:border-white/25 hover:bg-white/[0.06]"
    >
      <span className="text-xs uppercase tracking-widest text-white/40">{label}</span>
      <span className="truncate text-sm text-[#CFE8FB]">{value}</span>
    </a>
  );
}

export default function ContactSection() {
  const { data } = useContactSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const links: ContactLinkProps[] = [];
  if (data?.email) links.push({ label: 'Email', value: data.email, href: `mailto:${data.email}` });
  if (data?.phone) links.push({ label: 'Phone', value: data.phone, href: `tel:${data.phone}` });
  if (data?.whatsapp) {
    const digits = data.whatsapp.replace(/[^\d+]/g, '');
    links.push({ label: 'WhatsApp', value: data.whatsapp, href: `https://wa.me/${digits.replace('+', '')}` });
  }
  if (data?.facebook) links.push({ label: 'Facebook', value: data.facebook, href: data.facebook });
  if (data?.instagram) links.push({ label: 'Instagram', value: data.instagram, href: data.instagram });
  if (data?.linkedin) links.push({ label: 'LinkedIn', value: data.linkedin, href: data.linkedin });
  if (data?.behance) links.push({ label: 'Behance', value: data.behance, href: data.behance });
  for (const link of data?.otherLinks ?? []) {
    if (link.label && link.url) links.push({ label: link.label, value: link.url, href: link.url });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setStatus('error');
      setStatusMessage('This form is not available right now — please reach out directly instead.');
      return;
    }

    setSubmitting(true);
    setStatus('idle');

    const result = await submitMessage({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    setSubmitting(false);

    if (result.error) {
      logError('ContactSection.submit', result.error);
      setStatus('error');
      setStatusMessage(result.error.message);
      return;
    }

    setStatus('success');
    setStatusMessage("Thanks for reaching out — I'll get back to you soon.");
    setName('');
    setEmail('');
    setMessage('');
  }

  return (
    <section
      id="contact"
      className="relative bg-[#071B33] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
    >
      <FadeIn>
        <h2
          className="hero-heading font-black uppercase text-center leading-none tracking-tight mb-6"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Contact
        </h2>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="mx-auto mb-16 max-w-xl text-center text-[#CFE8FB]/70">
          Got a project in mind? Send a message below or reach out directly.
        </p>
      </FadeIn>

      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <FadeIn delay={0.15} x={-40} y={0}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={FIELD_CLASS}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className={FIELD_CLASS}
            />
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell me about your project"
              className={`${FIELD_CLASS} resize-y`}
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 self-start rounded-full px-8 py-3 text-sm font-medium uppercase tracking-widest text-white outline outline-2 -outline-offset-[3px] outline-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: 'linear-gradient(123deg, #001B3D 7%, #0077C2 37%, #29ABE2 72%, #7FDBFF 100%)',
                boxShadow: '0px 4px 4px rgba(0, 119, 194, 0.3), 4px 4px 12px #1CA7EC inset',
              }}
            >
              {submitting ? 'Sending…' : 'Send message'}
            </button>

            {status !== 'idle' && (
              <p className={`text-sm ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {statusMessage}
              </p>
            )}
          </form>
        </FadeIn>

        <FadeIn delay={0.2} x={40} y={0}>
          <div className="grid gap-3 sm:grid-cols-2">
            {links.length > 0 ? (
              links.map((link) => <ContactLink key={link.label} {...link} />)
            ) : (
              <p className="text-sm text-white/40">Contact details coming soon.</p>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
