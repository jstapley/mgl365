import { getServiceSupabase } from '@/lib/supabase'
import TrackingClient from './TrackingClient'

export default async function TrackingPage() {
  const supabase = getServiceSupabase()
  const [{ data: links }, { data: clicks }, { data: villas }] = await Promise.all([
    supabase
      .from('tracking_links')
      .select('*, villas(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('tracking_clicks')
      .select('id, link_id, clicked_at, referrer, device_type')
      .order('clicked_at', { ascending: false }),
    supabase
      .from('villas')
      .select('id, name')
      .eq('active', true)
      .order('name'),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Link Tracker</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track clicks from Instagram, Facebook, and WhatsApp.
        </p>
      </div>
      <TrackingClient
        links={(links ?? []) as any[]}
        clicks={(clicks ?? []) as any[]}
        villas={(villas ?? []) as any[]}
      />
    </div>
  )
}
