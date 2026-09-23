import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import type { Client } from '@/types'

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

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nationality</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Since</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No clients yet.</td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.nationality ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/clients/${c.id}`} className="text-[#1f5772] hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
