import { getServiceSupabase } from '@/lib/supabase'
import CommissionsClient from './CommissionsClient'

export interface Provider {
  id: string
  name: string
  primary_service: string
  sort_order: number
}

export interface Villa {
  id: string
  name: string
}

export interface Entry {
  id: string
  provider_id: string
  villa_id: string | null
  entry_date: string
  guest_name: string | null
  service_booked: string | null
  collected_by: string
  commission_usd: number | null
  commission_xcd: number | null
  payment_status: string
  notes: string | null
  created_at: string
}

export default async function CommissionsPage() {
  const supabase = getServiceSupabase()
  const [{ data: providers }, { data: villas }, { data: entries }] = await Promise.all([
    supabase.from('commission_providers').select('id, name, primary_service, sort_order').eq('active', true).order('sort_order'),
    supabase.from('villas').select('id, name').eq('active', true).order('name'),
    supabase.from('commission_entries').select('*').order('entry_date', { ascending: false }),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Commission Tracker</h1>
      </div>
      <CommissionsClient
        providers={(providers ?? []) as Provider[]}
        villas={(villas ?? []) as Villa[]}
        entries={(entries ?? []) as Entry[]}
      />
    </div>
  )
}
