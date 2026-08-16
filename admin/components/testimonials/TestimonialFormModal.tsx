'use client';

import { useEffect, useState } from 'react';
import { createTestimonial, updateTestimonial } from '../../../services/testimonials.service';
import type { TestimonialContent } from '../../../types/content.types';
import { Input, Textarea, Button, useToast } from '../../../components/ui';
import { logError } from '../../../utils/errors';

interface TestimonialFormModalProps {
  open: boolean;
  /** Present when editing an existing testimonial; omitted when creating one. */
  initialTestimonial?: TestimonialContent | null;
  /** Suggested display order for a brand-new testimonial (typically max existing + 1). Ignored when editing. */
  defaultDisplayOrder?: number;
  onClose: () => void;
  onSaved: () => void;
}

interface FormErrors {
  quote?: string;
  clientName?: string;
}

/**
 * Add/Edit form for a testimonial (a client quote shown in "What clients
 * say"), shown as a modal so /admin/testimonials stays a single route --
 * same pattern as ServiceFormModal.
 */
export default function TestimonialFormModal({
  open,
  initialTestimonial,
  defaultDisplayOrder = 0,
  onClose,
  onSaved,
}: TestimonialFormModalProps) {
  const isEdit = Boolean(initialTestimonial);
  const { showSuccess, showError } = useToast();

  const [quote, setQuote] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientRole, setClientRole] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the modal opens (new "add" or a different "edit" target).
  useEffect(() => {
    if (!open) return;
    setQuote(initialTestimonial?.quote ?? '');
    setClientName(initialTestimonial?.clientName ?? '');
    setClientRole(initialTestimonial?.clientRole ?? '');
    setDisplayOrder(
      initialTestimonial?.displayOrder != null
        ? String(initialTestimonial.displayOrder)
        : String(defaultDisplayOrder)
    );
    setErrors({});
  }, [open, initialTestimonial, defaultDisplayOrder]);

  if (!open) return null;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!quote.trim()) next.quote = 'Quote is required.';
    if (!clientName.trim()) next.clientName = 'Client name is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const payload = {
      quote: quote.trim(),
      client_name: clientName.trim(),
      client_role: clientRole.trim() || null,
      display_order: Number(displayOrder) || 0,
    };

    const result = initialTestimonial
      ? await updateTestimonial(initialTestimonial.id, payload)
      : await createTestimonial(payload);

    setSaving(false);

    if (result.error) {
      logError('TestimonialFormModal.save', result.error);
      showError(result.error.message);
      return;
    }

    showSuccess(isEdit ? 'Testimonial updated.' : 'Testimonial added.');
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimonial-form-title"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B2340] p-6 shadow-2xl animate-[toast-in_0.2s_ease-out]"
      >
        <h2 id="testimonial-form-title" className="mb-1 text-lg font-medium text-white">
          {isEdit ? 'Edit testimonial' : 'Add testimonial'}
        </h2>
        <p className="mb-6 text-sm text-white/50">
          {isEdit
            ? 'Update this client quote.'
            : 'Add a new quote to the "What clients say" section.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Textarea
            id="testimonialQuote"
            label="Quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={4}
            placeholder="RA Fahim turned a vague brief into a render that sold the product..."
            error={errors.quote}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="testimonialClientName"
              label="Client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Jane Doe"
              error={errors.clientName}
            />
            <Input
              id="testimonialClientRole"
              label="Role / company"
              value={clientRole}
              onChange={(e) => setClientRole(e.target.value)}
              placeholder="Founder, Studio Name"
            />
          </div>

          <Input
            id="testimonialDisplayOrder"
            label="Display order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />

          <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-5">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {isEdit ? 'Save changes' : 'Add testimonial'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
