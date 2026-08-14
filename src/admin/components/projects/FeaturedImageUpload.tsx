import CloudinaryUploader, { type CloudinaryImageValue } from '../uploads/CloudinaryUploader';

interface FeaturedImageUploadProps {
  value: CloudinaryImageValue | null;
  onChange: (value: CloudinaryImageValue | null) => void;
  onError: (message: string) => void;
}

/** A project's featured image, uploaded securely to Cloudinary via `CloudinaryUploader`. */
export default function FeaturedImageUpload({ value, onChange, onError }: FeaturedImageUploadProps) {
  return (
    <CloudinaryUploader
      label="Featured image"
      value={value}
      onChange={onChange}
      onError={onError}
      folder="projectFeatured"
      previewClassName="aspect-video rounded-xl"
      containerClassName="max-w-xs"
      helperText="JPG, PNG, or WEBP, up to 8MB."
    />
  );
}
