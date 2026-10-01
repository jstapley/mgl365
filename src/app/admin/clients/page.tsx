import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import type { Client } from '@/types'
import ClientsClient from './ClientsClient'

async function getClients(): Promise<Client[]> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <Link
          href="/admin/clients/new"
          className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
        >
          Add Client
        </Link>
      </div>
      <ClientsClient clients={clients} />
    </div>
  )
}
