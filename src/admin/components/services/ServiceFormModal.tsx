import { useEffect, useState } from 'react';
import { createService, updateService } from '../../../services/services.service';
import type { ServiceContent } from '../../../types/content.types';
import { Input, Textarea, Button, useToast } from '../../../components/ui';
import { logError } from '../../../utils/errors';

interface ServiceFormModalProps {
  open: boolean;
  /** Present when editing an existing service; omitted when creating one. */
  initialService?: ServiceContent | null;
  /** Suggested display order for a brand-new service (typically max existing + 1). Ignored when editing. */
  defaultDisplayOrder?: number;
  onClose: () => void;
  onSaved: () => void;
}

interface FormErrors {
  serviceNumber?: string;
  name?: string;
}

/**
 * Add/Edit form for a service, shown as a modal so /admin/services stays a
 * single route (list + create + edit + delete all live there).
 */
export default function ServiceFormModal({
  open,
  initialService,
  defaultDisplayOrder = 0,
  onClose,
  onSaved,
}: ServiceFormModalProps) {
  const isEdit = Boolean(initialService);
  const { showSuccess, showError } = useToast();

  const [serviceNumber, setServiceNumber] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [published, setPublished] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the modal opens (new "add" or a different "edit" target).
  useEffect(() => {
    if (!open) return;
    setServiceNumber(initialService?.serviceNumber ?? '');
    setName(initialService?.name ?? '');
    setDescription(initialService?.description ?? '');
    setDisplayOrder(
      initialService?.displayOrder != null ? String(initialService.displayOrder) : String(defaultDisplayOrder)
    );
    setPublished(initialService?.published ?? true);
    setErrors({});
  }, [open, initialService, defaultDisplayOrder]);

  if (!open) return null;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!serviceNumber.trim()) next.serviceNumber = 'Number is required.';
    if (!name.trim()) next.name = 'Name is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const payload = {
      service_number: serviceNumber.trim(),
      name: name.trim(),
      description: description.trim() || null,
      display_order: Number(displayOrder) || 0,
      published,
    };

    const result = initialService
      ? await updateService(initialService.id, payload)
      : await createService(payload);

    setSaving(false);

    if (result.error) {
      logError('ServiceFormModal.save', result.error);
      showError(result.error.message);
      return;
    }

    showSuccess(isEdit ? 'Service updated.' : 'Service added.');
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
        aria-labelledby="service-form-title"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B2340] p-6 shadow-2xl animate-[toast-in_0.2s_ease-out]"
      >
        <h2 id="service-form-title" className="mb-1 text-lg font-medium text-white">
          {isEdit ? 'Edit service' : 'Add service'}
        </h2>
        <p className="mb-6 text-sm text-white/50">
          {isEdit ? 'Update this service offering.' : 'Add a new offering to the Services section.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="serviceNumber"
              label="Number"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              placeholder="01"
              error={errors.serviceNumber}
            />
            <Input
              id="displayOrder"
              label="Display order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </div>

          <Input
            id="serviceName"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="3D Modeling"
            error={errors.name}
          />

          <Textarea
            id="serviceDescription"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What this service includes."
          />

          <label className="flex items-center gap-2.5 text-sm text-white/70">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#0077C2]"
            />
            Published (visible on the public site)
          </label>

          <div className="mt-2 flex justify-end gap-3 border-t border-white/10 pt-5">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {isEdit ? 'Save changes' : 'Add service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
