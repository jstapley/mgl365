import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/housekeeper/'],
      },
    ],
    sitemap: 'https://www.mgl365antigua.com/sitemap.xml',
  }
}
