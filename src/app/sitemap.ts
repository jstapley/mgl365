import type { MetadataRoute } from 'next'
import { getServiceSupabase } from '@/lib/supabase'

const BASE_URL = 'https://www.mgl365antigua.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getServiceSupabase()
  const { data: villas } = await supabase
    .from('villas')
    .select('slug, updated_at')
    .eq('active', true)
    .order('created_at', { ascending: true })

  const villaUrls: MetadataRoute.Sitemap = (villas ?? []).map((v) => ({
    url: `${BASE_URL}/our-villas/${v.slug}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/our-villas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...villaUrls,
  ]
}
