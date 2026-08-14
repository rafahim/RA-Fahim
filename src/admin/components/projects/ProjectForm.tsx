import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, updateProject } from '../../../services/projects.service';
import {
  addProjectImage,
  deleteProjectImage,
  updateProjectImage,
} from '../../../services/project-images.service';
import type { ProjectContent, ProjectImageContent } from '../../../types/content.types';
import type { TablesInsert, TablesUpdate } from '../../../types/database.types';
import { Input, Textarea, Select, Button, useToast } from '../../../components/ui';
import { logError } from '../../../utils/errors';
import FeaturedImageUpload from './FeaturedImageUpload';
import GalleryImagesManager, { type GalleryItem } from './GalleryImagesManager';
import type { CloudinaryImageValue } from '../uploads/CloudinaryUploader';

interface ProjectFormProps {
  /** Present when editing an existing project; omitted when creating one. */
  initialProject?: ProjectContent;
  initialImages?: ProjectImageContent[];
  /** Distinct categories from other projects, offered as datalist suggestions. */
  existingCategories?: string[];
  /** Suggested display order for a brand-new project (typically max existing + 1). Ignored when editing. */
  defaultDisplayOrder?: number;
}

interface FormErrors {
  name?: string;
  category?: string;
}

function toGalleryItems(images: ProjectImageContent[]): GalleryItem[] {
  return images
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((img) => ({
      key: img.id,
      id: img.id,
      imageUrl: img.imageUrl,
      cloudinaryPublicId: img.cloudinaryPublicId,
      displayOrder: img.displayOrder,
    }));
}

/**
 * Reusable project form. Handles all project fields plus the featured
 * image and gallery images, and persists everything (project row +
 * project_images rows) to Supabase on submit. Used by both the "new
 * project" and "edit project" admin pages.
 */
export default function ProjectForm({
  initialProject,
  initialImages = [],
  existingCategories = [],
  defaultDisplayOrder = 0,
}: ProjectFormProps) {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    initialProject?.id ?? null
  );
  const isEdit = Boolean(initialProject);

  const [name, setName] = useState(initialProject?.name ?? '');
  const [category, setCategory] = useState(initialProject?.category ?? '');
  const [clientType, setClientType] = useState(initialProject?.clientType ?? '');
  const [shortDescription, setShortDescription] = useState(
    initialProject?.shortDescription ?? ''
  );
  const [fullDescription, setFullDescription] = useState(initialProject?.fullDescription ?? '');
  const [projectUrl, setProjectUrl] = useState(initialProject?.projectUrl ?? '');
  const [year, setYear] = useState(
    initialProject?.year ? String(initialProject.year) : String(new Date().getFullYear())
  );
  const [status, setStatus] = useState(initialProject?.status ?? 'draft');
  const [displayOrder, setDisplayOrder] = useState(
    initialProject?.displayOrder != null ? String(initialProject.displayOrder) : String(defaultDisplayOrder)
  );
  const [featuredImage, setFeaturedImage] = useState<CloudinaryImageValue | null>(
    initialProject?.featuredImage
      ? { url: initialProject.featuredImage, publicId: initialProject.featuredImagePublicId }
      : null
  );

  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>(
    toGalleryItems(initialImages)
  );
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Project name is required.';
    if (!category.trim()) next.category = 'Category is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleAddImages(items: GalleryItem[]) {
    setGalleryImages((prev) => [...prev, ...items]);
  }

  function handleRemoveImage(key: string) {
    setGalleryImages((prev) => {
      const target = prev.find((img) => img.key === key);
      if (target?.id) setDeletedImageIds((ids) => [...ids, target.id!]);
      return prev.filter((img) => img.key !== key).map((img, i) => ({ ...img, displayOrder: i }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    const payload: TablesInsert<'projects'> & TablesUpdate<'projects'> = {
      name: name.trim(),
      category: category.trim(),
      client_type: clientType.trim() || null,
      short_description: shortDescription.trim() || null,
      full_description: fullDescription.trim() || null,
      project_url: projectUrl.trim() || null,
      year: year.trim() ? Number(year) : null,
      featured_image: featuredImage?.url ?? null,
      featured_image_public_id: featuredImage?.publicId ?? null,
      status,
      display_order: Number(displayOrder) || 0,
    };

    let projectId = currentProjectId;

    if (projectId) {
      const result = await updateProject(projectId, payload);
      if (result.error) {
        logError('ProjectForm.updateProject', result.error);
        showError(result.error.message);
        setSaving(false);
        return;
      }
    } else {
      const result = await createProject(payload);
      if (result.error) {
        logError('ProjectForm.createProject', result.error);
        showError(result.error.message);
        setSaving(false);
        return;
      }
      projectId = result.data.id;
      setCurrentProjectId(projectId);
    }

    const galleryErrors: string[] = [];

    for (const id of deletedImageIds) {
      const result = await deleteProjectImage(id);
      if (result.error) galleryErrors.push(result.error.message);
    }

    for (const item of galleryImages) {
      if (item.id) {
        const original = initialImages.find((img) => img.id === item.id);
        if (original && original.displayOrder !== item.displayOrder) {
          const result = await updateProjectImage(item.id, { display_order: item.displayOrder });
          if (result.error) galleryErrors.push(result.error.message);
        }
      } else {
        const result = await addProjectImage({
          project_id: projectId,
          image_url: item.imageUrl,
          cloudinary_public_id: item.cloudinaryPublicId,
          display_order: item.displayOrder,
        });
        if (result.error) galleryErrors.push(result.error.message);
      }
    }

    setSaving(false);

    if (galleryErrors.length > 0) {
      logError('ProjectForm.gallerySync', galleryErrors.join('; '));
      showError(`Project saved, but some gallery images failed: ${galleryErrors[0]}`);
      return;
    }

    setDeletedImageIds([]);
    showSuccess(isEdit ? 'Project updated.' : 'Project created.');
    navigate('/admin/projects');
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          id="name"
          label="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="e.g. Skyline Residences"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs uppercase tracking-widest text-white/50">
            Category
          </label>
          <input
            id="category"
            list="project-category-suggestions"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Interior Design"
            required
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#29ABE2]"
          />
          <datalist id="project-category-suggestions">
            {existingCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.category && <p className="text-xs text-red-400">{errors.category}</p>}
        </div>

        <Select
          id="clientType"
          label="Client / Personal"
          value={clientType ?? ''}
          onChange={(e) => setClientType(e.target.value)}
        >
          <option value="">— Not specified —</option>
          <option value="Client">Client</option>
          <option value="Personal">Personal</option>
        </Select>

        <Input
          id="year"
          type="number"
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="2026"
        />

        <Input
          id="projectUrl"
          type="url"
          label="Project URL"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          placeholder="https://…"
        />

        <Select
          id="status"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>

        <Input
          id="displayOrder"
          type="number"
          label="Display order"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          helperText="Lower numbers appear first."
        />
      </div>

      <Textarea
        id="shortDescription"
        label="Short description"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
        rows={2}
        placeholder="One or two sentences shown in project previews."
      />

      <Textarea
        id="fullDescription"
        label="Full description"
        value={fullDescription}
        onChange={(e) => setFullDescription(e.target.value)}
        rows={6}
        placeholder="The full project write-up shown on the project detail view."
      />

      <FeaturedImageUpload
        value={featuredImage}
        onChange={setFeaturedImage}
        onError={showError}
      />

      <GalleryImagesManager
        images={galleryImages}
        onAddImages={handleAddImages}
        onRemoveImage={handleRemoveImage}
        onReorder={setGalleryImages}
        onError={showError}
      />

      <div className="flex items-center gap-3 border-t border-white/10 pt-6">
        <Button type="submit" loading={saving}>
          {isEdit ? 'Save changes' : 'Create project'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/admin/projects')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
