'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useContactSettings } from '../../hooks/useContent';
import { updateContactSettings } from '../../services/contact.service';
import type { SocialLink } from '../../types/content.types';
import { ErrorState, EmptyState, Skeleton, Input, Button, useToast } from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/env';
import { logError } from '../../utils/errors';

export default function ContactAdminPage() {
  const { data, loading, error, refetch } = useContactSettings();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [behance, setBehance] = useState('');
  const [otherLinks, setOtherLinks] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState(false);

  // Sync local edit state whenever fresh data arrives (initial load or refetch).
  useEffect(() => {
    if (!data) return;
    setEmail(data.email ?? '');
    setPhone(data.phone ?? '');
    setWhatsapp(data.whatsapp ?? '');
    setFacebook(data.facebook ?? '');
    setInstagram(data.instagram ?? '');
    setLinkedin(data.linkedin ?? '');
    setBehance(data.behance ?? '');
    setOtherLinks(data.otherLinks ?? []);
  }, [data]);

  function addOtherLink() {
    setOtherLinks((prev) => [...prev, { label: '', url: '' }]);
  }

  function updateOtherLink(index: number, patch: Partial<SocialLink>) {
    setOtherLinks((prev) => prev.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  }

  function removeOtherLink(index: number) {
    setOtherLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Drop any blank rows left over from "Add link" so we never persist an
    // empty label/url pair.
    const cleanedLinks = otherLinks
      .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
      .filter((link) => link.label || link.url);

    const result = await updateContactSettings({
      email: email.trim() || null,
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      facebook: facebook.trim() || null,
      instagram: instagram.trim() || null,
      linkedin: linkedin.trim() || null,
      behance: behance.trim() || null,
      other_links: cleanedLinks,
    });

    setSaving(false);

    if (result.error) {
      logError('ContactAdminPage.save', result.error);
      showError(result.error.message);
      return;
    }

    showSuccess('Contact settings updated.');
    refetch();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">Contact</h1>
      <p className="mb-8 text-sm text-white/50">
        Manage the contact details and social links shown in the portfolio&apos;s Contact section.
      </p>

      {!isSupabaseConfigured() && (
        <EmptyState
          title="Supabase isn't configured"
          description="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load and edit contact settings."
        />
      )}

      {isSupabaseConfigured() && loading && (
        <div className="flex max-w-md flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      )}

      {isSupabaseConfigured() && !loading && error && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {isSupabaseConfigured() && !loading && !error && data && (
        <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              id="contactEmail"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
            />
            <Input
              id="contactPhone"
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
            />
          </div>

          <Input
            id="contactWhatsapp"
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+1 555 123 4567 or a wa.me link"
          />

          <div className="grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
            <Input
              id="contactFacebook"
              label="Facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/…"
            />
            <Input
              id="contactInstagram"
              label="Instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/…"
            />
            <Input
              id="contactLinkedin"
              label="LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/…"
            />
            <Input
              id="contactBehance"
              label="Behance"
              value={behance}
              onChange={(e) => setBehance(e.target.value)}
              placeholder="https://behance.net/…"
            />
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-white/50">
                Other social links
              </span>
              <button
                type="button"
                onClick={addOtherLink}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/70 outline outline-1 -outline-offset-1 outline-white/20 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add link
              </button>
            </div>

            {otherLinks.length === 0 && (
              <p className="text-xs text-white/30">No additional links yet.</p>
            )}

            <div className="flex flex-col gap-3">
              {otherLinks.map((link, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    aria-label="Link label"
                    value={link.label}
                    onChange={(e) => updateOtherLink(index, { label: e.target.value })}
                    placeholder="Label (e.g. Dribbble)"
                    className="w-40 shrink-0"
                  />
                  <Input
                    aria-label="Link URL"
                    value={link.url}
                    onChange={(e) => updateOtherLink(index, { url: e.target.value })}
                    placeholder="https://…"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeOtherLink(index)}
                    aria-label="Remove link"
                    title="Remove link"
                    className="rounded-lg p-2.5 text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-6">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
