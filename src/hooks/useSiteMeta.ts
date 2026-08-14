import { useEffect } from 'react';
import { useWebsiteSettings } from './useContent';

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setFavicon(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'icon');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Applies the admin-managed website settings (title, SEO description,
 * favicon, Open Graph image) to the live document head. Falls back to
 * whatever's already in `index.html` when Supabase isn't configured or a
 * field hasn't been set yet, so the public site never ends up blank.
 */
export function useSiteMeta() {
  const { data } = useWebsiteSettings();

  useEffect(() => {
    if (!data) return;

    const title = data.seoTitle || data.websiteTitle;
    if (title) document.title = title;

    const description = data.seoDescription || data.websiteDescription;
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
    }

    if (title) setMetaTag('property', 'og:title', title);
    if (data.ogImageUrl) setMetaTag('property', 'og:image', data.ogImageUrl);
    if (data.faviconUrl) setFavicon(data.faviconUrl);
  }, [data]);
}
