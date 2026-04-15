import type { MetadataRoute } from 'next';

import { getPageRoutes } from '../lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://playdominionnexus.com';

  return getPageRoutes().map((route) => ({
    url: `${base}${route.href}`,
    lastModified: new Date(),
  }));
}
