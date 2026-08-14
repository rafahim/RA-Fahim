/**
 * Domain-facing content types.
 *
 * These are the shapes components/services consume, in camelCase, mapped
 * from the snake_case rows in `database.types.ts`. Keeping this layer
 * separate means a database column rename doesn't ripple through every
 * component.
 */

import type { ProjectStatus, SocialLinkJson } from './database.types';

export interface ProjectContent {
  id: string;
  name: string;
  category: string;
  clientType: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  projectUrl: string | null;
  year: number | null;
  featuredImage: string | null;
  featuredImagePublicId: string | null;
  status: ProjectStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectImageContent {
  id: string;
  projectId: string;
  imageUrl: string;
  cloudinaryPublicId: string | null;
  displayOrder: number;
  createdAt: string;
}

/** A published project plus its ordered gallery, as consumed by the public Projects section. */
export interface ProjectWithImages extends ProjectContent {
  images: ProjectImageContent[];
}

export interface ServiceContent {
  id: string;
  serviceNumber: string;
  name: string;
  description: string | null;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AboutContent {
  name: string | null;
  professionalTitle: string | null;
  experience: string | null;
  aboutHeading: string | null;
  aboutDescription: string | null;
  additionalInfo: string | null;
  profileImageUrl: string | null;
  profileImagePublicId: string | null;
  updatedAt: string;
}

export type SocialLink = SocialLinkJson;

export interface ContactSettingsContent {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  behance: string | null;
  otherLinks: SocialLink[];
  updatedAt: string;
}

export interface WebsiteSettingsContent {
  websiteTitle: string | null;
  websiteDescription: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  faviconUrl: string | null;
  faviconPublicId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  ogImagePublicId: string | null;
  updatedAt: string;
}

export interface MessageContent {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/** Payload for the public contact form — deliberately narrower than MessageContent. */
export interface NewMessageInput {
  name: string;
  email: string;
  message: string;
}
