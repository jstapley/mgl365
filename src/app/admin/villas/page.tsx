import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { deleteVilla } from './actions'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Villa } from '@/types'

async function getVillas(): Promise<Villa[]> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('villas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export default async function VillasPage() {
  const villas = await getVillas()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Villas</h1>
        <Link
          href="/admin/villas/new"
          className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
        >
          Add Villa
        </Link>
      </div>

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Bedrooms</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Guests</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Price/Night</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {villas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No villas yet.
                </td>
              </tr>
            )}
            {villas.map((villa) => (
              <tr key={villa.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{villa.name}</td>
                <td className="px-4 py-3 text-gray-600">{villa.bedrooms ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{villa.max_guests ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {villa.price_per_night != null ? `$${villa.price_per_night}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${villa.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {villa.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/villas/${villa.id}/edit`}
                    className="mr-3 text-[#1f5772] hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton action={deleteVilla.bind(null, villa.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
