'use client';

import { useRef, useState } from 'react';
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
  ArrowUpRight,
} from 'lucide-react';
import FadeIn from '../components/FadeIn';
import AuroraField from '../components/AuroraField';
import { useContactSettings } from '../hooks/useContent';
import { logError } from '../utils/errors';

const FIELD_CLASS =
  'w-full rounded-xl border border-white/15 bg-white/[0.04] pl-11 pr-5 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors duration-200 ease-out focus:border-[var(--render-amber)] focus:bg-white/[0.07]';

const PROJECT_TYPES = ['3D Modeling', 'Rendering', 'Motion Design', 'Branding', 'Web / UI', 'Other'];
const BUDGET_RANGES = ['< $500', '$500 – $1.5k', '$1.5k – $5k', '$5k+'];
const TIMELINES = ['ASAP', '2–4 weeks', '1–2 months', 'Flexible'];

interface PillGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

/** A row of selectable pill options -- a structured-quote question rendered in the site's own visual voice instead of a native <select>. */
function PillGroup({ label, options, value, onChange }: PillGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-hud text-[9px] text-[#F3F1EA]/40">{label.toUpperCase()}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-all duration-200 ease-out ${
              value === option
                ? 'border-[var(--render-amber)] bg-[var(--render-amber-dim)] text-[#F3F1EA]'
                : 'border-white/15 text-[#F3F1EA]/50 hover:border-white/30 hover:text-[#F3F1EA]/80'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const ICON_BY_LABEL: Record<string, LucideIcon> = {
  Email: Mail,
  Phone: Phone,
  WhatsApp: MessageCircle,
  Facebook: Facebook,
  Instagram: Instagram,
  LinkedIn: Linkedin,
};

// Clear, action-oriented CTA copy per platform, instead of just restating
// the raw contact value (which is shown as smaller supporting text).
const CTA_LABEL_BY_LABEL: Record<string, string> = {
  Email: 'Send an Email',
  Phone: 'Call Me',
  WhatsApp: 'Chat on WhatsApp',
  Facebook: 'Visit Facebook',
  Instagram: 'Follow on Instagram',
  LinkedIn: 'Connect on LinkedIn',
  Behance: 'View on Behance',
};

interface ContactLinkProps {
  label: string;
  value: string;
  href: string;
}

/** A premium, unmistakably-clickable CTA button for a single contact channel. */
function ContactCTAButton({ label, value, href }: ContactLinkProps) {
  const Icon = ICON_BY_LABEL[label] ?? Link2;
  const ctaLabel = CTA_LABEL_BY_LABEL[label] ?? `Visit ${label}`;

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] px-5 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#8B7CF6]/50 hover:bg-white/[0.07] hover:shadow-[0_16px_40px_-16px_rgba(76,141,255,0.35)] active:translate-y-0 active:duration-100"
    >
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 group-hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(76,141,255,0.35), rgba(139,124,246,0.35))',
          border: '1px solid rgba(185,174,255,0.35)',
        }}
      >
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold uppercase tracking-wide text-[#F3F1EA]">{ctaLabel}</span>
        <span className="truncate text-xs text-[#F3F1EA]/45">{value}</span>
      </span>
      <ArrowUpRight
        size={18}
        className="flex-shrink-0 text-[#B9AEFF]/70 transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#B9AEFF]"
      />
    </a>
  );
}

export default function ContactSection() {
  const { data } = useContactSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const quoteFieldsComplete = !!projectType && !!budgetRange && !!timeline;

  // Belt-and-braces duplicate-submit guard: the submit button is already
  // `disabled` while `submitting` is true, but a ref check here also
  // covers the brief window before that re-render commits (e.g. a fast
  // double Enter-key press) and survives across re-renders/remounts.
  const isSubmittingRef = useRef(false);

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

    if (isSubmittingRef.current) return;
    if (!quoteFieldsComplete) {
      setStatus('error');
      setStatusMessage('Please pick a project type, budget range, and timeline first.');
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setStatus('idle');

    // Fold the structured quote fields into the message body so the
    // existing /api/contact endpoint (name/email/message) doesn't need
    // a schema change -- the recipient still sees them clearly labelled.
    const structuredMessage = `Project type: ${projectType}\nBudget range: ${budgetRange}\nTimeline: ${timeline}\n\n${message.trim()}`;
    const payload = { name: name.trim(), email: email.trim(), message: structuredMessage };

    // Send the message directly to the site owner's inbox via SMTP.
    // Nothing is stored anywhere else — this is the only place the
    // submission goes.
    let response: Response | null = null;
    let requestError: unknown = null;
    try {
      response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      requestError = err;
    }

    isSubmittingRef.current = false;
    setSubmitting(false);

    if (!response || !response.ok) {
      let serverMessage: string | undefined;
      if (response) {
        const data = await response.json().catch(() => null);
        serverMessage = data?.error;
      }
      logError('ContactSection.submit', requestError ?? serverMessage ?? `HTTP ${response?.status}`);
      setStatus('error');
      setStatusMessage(serverMessage || 'Could not send your message. Please try again.');
      return;
    }

    const data = await response.json().catch(() => null);
    if (data?.sent === false) {
      // Route handler accepted the request but email isn't configured
      // server-side (e.g. missing SMTP env vars).
      logError('ContactSection.submit', data?.reason ?? 'Email not sent');
      setStatus('error');
      setStatusMessage('This form is not available right now — please reach out directly instead.');
      return;
    }

    setStatus('success');
    setStatusMessage("Thanks for reaching out — I'll get back to you soon.");
    setName('');
    setEmail('');
    setMessage('');
    setProjectType('');
    setBudgetRange('');
    setTimeline('');
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
            Have a project in mind? Send a quick quote request below, or reach out directly —
            I&apos;m usually quick to reply.
          </p>
        </FadeIn>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:gap-10">
          <FadeIn delay={0.15} x={-40} y={0}>
            <form onSubmit={handleSubmit} className="glass-panel flex h-full flex-col gap-5 rounded-3xl p-6 sm:p-8">
              <PillGroup label="Project type" options={PROJECT_TYPES} value={projectType} onChange={setProjectType} />
              <PillGroup label="Budget range" options={BUDGET_RANGES} value={budgetRange} onChange={setBudgetRange} />
              <PillGroup label="Timeline" options={TIMELINES} value={timeline} onChange={setTimeline} />

              <div className="h-px w-full bg-white/10" aria-hidden />

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
                disabled={submitting || !quoteFieldsComplete}
                className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full px-8 py-3 text-sm font-medium uppercase tracking-widest text-white border border-white/15 transition-all duration-300 ease-out hover:border-white/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
                style={{
                  background: 'linear-gradient(123deg, #0a0a12 7%, #d0722f 45%, #ff8a3d 100%)',
                  boxShadow: '0 8px 30px -8px rgba(255,138,61,0.4)',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send quote request
                    <Send size={15} />
                  </>
                )}
              </button>

              <AnimatePresence>
                {status !== 'idle' && (
                  <motion.div
                    role="status"
                    aria-live="polite"
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
            <div className="flex h-full flex-col">
              {links.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                  {links.map((link) => (
                    <ContactCTAButton key={link.label} {...link} />
                  ))}
                </div>
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
