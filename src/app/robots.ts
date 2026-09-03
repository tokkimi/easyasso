import type { MetadataRoute } from 'next';
import { appBaseUrl } from '@/lib/utils';

const BASE_URL = appBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private/app areas out of search results.
        disallow: ['/dashboard', '/admin', '/api/', '/onboarding', '/checkout', '/verify-email', '/reset-password', '/forgot-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
