'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Link2,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import FadeIn from '../components/FadeIn';
import AuroraField from '../components/AuroraField';
import { useContactSettings } from '../hooks/useContent';
import { submitMessage } from '../services/messages.service';
import { isSupabaseConfigured } from '../lib/env';
import { logError } from '../utils/errors';

const FIELD_CLASS =
  'w-full rounded-xl border border-white/15 bg-white/[0.04] pl-11 pr-5 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors duration-200 ease-out focus:border-[#8B7CF6] focus:bg-white/[0.07]';

const ICON_BY_LABEL: Record<string, LucideIcon> = {
  Email: Mail,
  Phone: Phone,
  WhatsApp: MessageCircle,
  Facebook: Facebook,
  Instagram: Instagram,
  LinkedIn: Linkedin,
};

interface ContactLinkProps {
  label: string;
  value: string;
  href: string;
}

function ContactLink({ label, value, href }: ContactLinkProps) {
  const Icon = ICON_BY_LABEL[label] ?? Link2;

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#8B7CF6]/40 hover:bg-white/[0.06] active:translate-y-0 active:duration-100"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-[#B9AEFF] transition-colors duration-300 group-hover:bg-[#4C8DFF]/20">
        <Icon size={17} strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-hud text-[9px] uppercase tracking-widest text-white/40">{label}</span>
        <span className="truncate text-sm text-[#F3F1EA]">{value}</span>
      </span>
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
      className="bg-grain relative overflow-hidden px-5 sm:px-8 md:px-10 py-24 sm:py-28 md:py-36"
      style={{ background: 'linear-gradient(180deg, var(--navy) 0%, var(--void) 45%)' }}
    >
      <AuroraField variant="panel" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(243,241,234,0.2), transparent)' }}
      />

      <div className="relative z-10">
        <FadeIn className="flex flex-col items-center gap-4">
          <span className="font-hud text-[10px] sm:text-xs text-[#F3F1EA]/45">{"// LET'S TALK"}</span>
          <h2
            className="hero-heading font-black uppercase text-center leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Contact
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mb-16 sm:mb-20 mt-6 max-w-xl text-center text-[#F3F1EA]/60 leading-relaxed">
            Have a project in mind? Tell me about it below, or reach out directly — I&apos;m usually quick to reply.
          </p>
        </FadeIn>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:gap-10">
          <FadeIn delay={0.15} x={-40} y={0}>
            <form onSubmit={handleSubmit} className="glass-panel flex h-full flex-col gap-4 rounded-3xl p-6 sm:p-8">
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={FIELD_CLASS}
                />
              </div>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className={FIELD_CLASS}
                />
              </div>
              <div className="relative">
                <MessageSquare size={16} className="pointer-events-none absolute left-4 top-4 text-white/30" />
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me about your project"
                  className={`${FIELD_CLASS} resize-y pt-3.5`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full px-8 py-3 text-sm font-medium uppercase tracking-widest text-white border border-white/15 transition-all duration-300 ease-out hover:border-white/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
                style={{
                  background: 'linear-gradient(123deg, #0a0a12 7%, #3b6fe0 37%, #6f5fe0 72%, #8b7cf6 100%)',
                  boxShadow: '0 8px 30px -8px rgba(76,141,255,0.45)',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <Send size={15} />
                  </>
                )}
              </button>

              <AnimatePresence>
                {status !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
                      status === 'success'
                        ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                        : 'border-red-400/25 bg-red-400/10 text-red-300'
                    }`}
                  >
                    {status === 'success' ? (
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    )}
                    <span>{statusMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </FadeIn>

          <FadeIn delay={0.2} x={40} y={0}>
            <div className="flex h-full flex-col gap-3">
              {links.length > 0 ? (
                links.map((link) => <ContactLink key={link.label} {...link} />)
              ) : (
                <p className="text-sm text-white/40">Contact details coming soon.</p>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
