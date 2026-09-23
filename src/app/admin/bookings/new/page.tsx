import { getServiceSupabase } from '@/lib/supabase'
import type { Villa, Client } from '@/types'
import NewBookingForm from './NewBookingForm'

async function getOptions() {
  const supabase = getServiceSupabase()
  const [{ data: villas }, { data: clients }] = await Promise.all([
    supabase.from('villas').select('id, name').eq('active', true).order('name'),
    supabase.from('clients').select('id, name').order('name'),
  ])
  return {
    villas: (villas ?? []) as Pick<Villa, 'id' | 'name'>[],
    clients: (clients ?? []) as Pick<Client, 'id' | 'name'>[],
  }
}

export default async function NewBookingPage() {
  const { villas, clients } = await getOptions()
  return <NewBookingForm villas={villas} clients={clients} />
}
