'use client';

import { useMemo } from 'react';
import { isSupabaseConfigured } from '../lib/env';
import {
  fetchPublishedProjects,
  fetchAllProjects,
  fetchPublishedProjectsWithImages,
} from '../services/projects.service';
import { fetchPublishedServices, fetchAllServices } from '../services/services.service';
import { fetchDashboardStats, type DashboardStats } from '../services/dashboard.service';
import { fetchAbout } from '../services/about.service';
import { fetchContactSettings } from '../services/contact.service';
import { fetchWebsiteSettings } from '../services/website.service';
import { fetchMarqueeImages } from '../services/marquee.service';
import { ok } from '../types/api.types';
import { useAsync, type AsyncState } from './useAsync';
import type {
  ProjectContent,
  ProjectWithImages,
  ServiceContent,
  AboutContent,
  ContactSettingsContent,
  WebsiteSettingsContent,
  MarqueeImageContent,
} from '../types/content.types';

/**
 * Loads CMS-driven projects. When Supabase isn't configured yet (e.g.
 * local dev without `.env.local`), resolves to an empty list instead of
 * erroring, so the public site can fall back to the static data in
 * `src/lib/data.ts`.
 */
export function useProjects(): AsyncState<ProjectContent[]> & { refetch: () => void } {
  const fetcher = useMemo(
    () => () => (isSupabaseConfigured() ? fetchPublishedProjects() : Promise.resolve(ok([]))),
    []
  );
  return useAsync(fetcher, []);
}

/**
 * Public Projects section: published projects with their gallery images
 * attached, ready for the sticky project cards. Empty (not an error) when
 * Supabase isn't configured, so the section can fall back to static
 * sample content instead of breaking.
 */
export function useProjectCards(): AsyncState<ProjectWithImages[]> & { refetch: () => void } {
  const fetcher = useMemo(
    () => () =>
      isSupabaseConfigured() ? fetchPublishedProjectsWithImages() : Promise.resolve(ok([])),
    []
  );
  return useAsync(fetcher, []);
}

export function useServices(): AsyncState<ServiceContent[]> & { refetch: () => void } {
  const fetcher = useMemo(
    () => () => (isSupabaseConfigured() ? fetchPublishedServices() : Promise.resolve(ok([]))),
    []
  );
  return useAsync(fetcher, []);
}

/** Admin-only: every project regardless of status, for the Projects admin page. */
export function useAllProjects(): AsyncState<ProjectContent[]> & { refetch: () => void } {
  const fetcher = useMemo(
    () => () => (isSupabaseConfigured() ? fetchAllProjects() : Promise.resolve(ok([]))),
    []
  );
  return useAsync(fetcher, []);
}

/** Admin-only: every service regardless of published state, for the Services admin page. */
export function useAllServices(): AsyncState<ServiceContent[]> & { refetch: () => void } {
  const fetcher = useMemo(
    () => () => (isSupabaseConfigured() ? fetchAllServices() : Promise.resolve(ok([]))),
    []
  );
  return useAsync(fetcher, []);
}

/** Admin dashboard counters (total/published projects, services). */
export function useDashboardStats(): AsyncState<DashboardStats> & { refetch: () => void } {
  const fetcher = useMemo(
    () => () =>
      isSupabaseConfigured()
        ? fetchDashboardStats()
        : Promise.resolve(
            ok({
              totalProjects: 0,
              publishedProjects: 0,
              totalServices: 0,
            })
          ),
    []
  );
  return useAsync(fetcher, []);
}

export function useAbout(): AsyncState<AboutContent> & { refetch: () => void } {
  const fetcher = useMemo(() => () => fetchAbout(), []);
  return useAsync(fetcher, []);
}

export function useContactSettings(): AsyncState<ContactSettingsContent> & {
  refetch: () => void;
} {
  const fetcher = useMemo(() => () => fetchContactSettings(), []);
  return useAsync(fetcher, []);
}

export function useWebsiteSettings(): AsyncState<WebsiteSettingsContent> & {
  refetch: () => void;
} {
  const fetcher = useMemo(() => () => fetchWebsiteSettings(), []);
  return useAsync(fetcher, []);
}

/**
 * The marquee image strip shown below the Hero section. Same function
 * serves both the public site and the admin management page — there's no
 * draft/published split, an admin's list IS the public list. Empty (not
 * an error) when Supabase isn't configured, so the section can fall back
 * to the bundled placeholder images instead of breaking.
 */
export function useMarqueeImages(): AsyncState<MarqueeImageContent[]> & { refetch: () => void } {
  const fetcher = useMemo(
    () => () => (isSupabaseConfigured() ? fetchMarqueeImages() : Promise.resolve(ok([]))),
    []
  );
  return useAsync(fetcher, []);
}
