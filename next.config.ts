import type { NextConfig } from 'next';

/**
 * We deliberately keep using plain <img> tags (carried over from the
 * Vite app) instead of next/image everywhere, since the images come from
 * many different admin-configurable hosts (Cloudinary + arbitrary URLs
 * pasted into the CMS) and switching would risk breaking existing
 * layouts/animations. No remotePatterns config is needed as a result.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
