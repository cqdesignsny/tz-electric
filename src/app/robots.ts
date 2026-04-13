import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/test-signup'],
      },
    ],
    sitemap: 'https://tzelectricinc.com/sitemap.xml',
  }
}
