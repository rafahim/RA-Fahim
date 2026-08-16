'use client';

import { useEffect, useState } from 'react';
import { createSkill, updateSkill } from '../../../services/skills.service';
import type { SkillContent } from '../../../types/content.types';
import type { SkillLevelValue } from '../../../types/database.types';
import { Input, Select, Button, useToast } from '../../../components/ui';
import { logError } from '../../../utils/errors';

interface SkillFormModalProps {
  open: boolean;
  /** Present when editing an existing skill; omitted when creating one. */
  initialSkill?: SkillContent | null;
  /** Suggested display order for a brand-new skill (typically max existing + 1). Ignored when editing. */
  defaultDisplayOrder?: number;
  onClose: () => void;
  onSaved: () => void;
}

const LEVEL_OPTIONS: SkillLevelValue[] = ['Intermediate', 'Advanced', 'Expert'];

interface FormErrors {
  name?: string;
  value?: string;
}

/**
 * Add/Edit form for a skill (a "Tool Proficiency" meter shown in the
 * About section), shown as a modal so /admin/skills stays a single route
 * (list + create + edit + delete all live there) -- same pattern as
 * ServiceFormModal.
 */
export default function SkillFormModal({
  open,
  initialSkill,
  defaultDisplayOrder = 0,
  onClose,
  onSaved,
}: SkillFormModalProps) {
  const isEdit = Boolean(initialSkill);
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [level, setLevel] = useState<SkillLevelValue>('Intermediate');
  const [value, setValue] = useState('50');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the modal opens (new "add" or a different "edit" target).
  useEffect(() => {
    if (!open) return;
    setName(initialSkill?.name ?? '');
    setLevel(initialSkill?.level ?? 'Intermediate');
    setValue(initialSkill?.value != null ? String(initialSkill.value) : '50');
    setDisplayOrder(
      initialSkill?.displayOrder != null ? String(initialSkill.displayOrder) : String(defaultDisplayOrder)
    );
    setErrors({});
  }, [open, initialSkill, defaultDisplayOrder]);

  if (!open) return null;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Name is required.';
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 100) {
      next.value = 'Enter a number between 0 and 100.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const payload = {
      name: name.trim(),
      level,
      value: Number(value),
      display_order: Number(displayOrder) || 0,
    };

    const result = initialSkill
      ? await updateSkill(initialSkill.id, payload)
      : await createSkill(payload);

    setSaving(false);

    if (result.error) {
      logError('SkillFormModal.save', result.error);
      showError(result.error.message);
      return;
    }

    showSuccess(isEdit ? 'Skill updated.' : 'Skill added.');
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
        aria-labelledby="skill-form-title"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B2340] p-6 shadow-2xl animate-[toast-in_0.2s_ease-out]"
      >
        <h2 id="skill-form-title" className="mb-1 text-lg font-medium text-white">
          {isEdit ? 'Edit skill' : 'Add skill'}
        </h2>
        <p className="mb-6 text-sm text-white/50">
          {isEdit
            ? 'Update this tool proficiency meter.'
            : 'Add a new tool to the About section\u2019s Tool Proficiency panel.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            id="skillName"
            label="Tool name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Blender"
            error={errors.name}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="skillLevel"
              label="Level label"
              value={level}
              onChange={(e) => setLevel(e.target.value as SkillLevelValue)}
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Input
              id="skillValue"
              label="Proficiency (0-100)"
              type="number"
              min={0}
              max={100}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={errors.value}
            />
          </div>

          <Input
            id="skillDisplayOrder"
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
              {isEdit ? 'Save changes' : 'Add skill'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
