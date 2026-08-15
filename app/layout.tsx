import type { Metadata } from 'next';
import ErrorBoundary from '../components/ErrorBoundary';
import './globals.css';

/**
 * Static fallback metadata (used before/without the admin-managed
 * website settings from Supabase, and as the base <head> for crawlers
 * that don't execute JS). `useSiteMeta` (see app/page.tsx) then updates
 * title/description/favicon/OG image live from the CMS once loaded,
 * exactly like `index.html` + `useSiteMeta` did in the Vite app.
 */
export const metadata: Metadata = {
  title: 'Jack — Creative Developer & 3D Artist',
  description:
    'Jack is a creative developer and 3D artist crafting striking, unforgettable digital work.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#07070a' }}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
