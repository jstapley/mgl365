import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { deleteActivity } from './actions'
import DeleteButton from '@/components/admin/DeleteButton'

interface Activity {
  id: string
  name: string
  description: string | null
  price: number | null
  duration: string | null
  max_guests: number | null
  category: string
  active: boolean
  sort_order: number
}

const CATEGORY_COLORS: Record<string, string> = {
  'Spa':        'bg-pink-50 text-pink-700',
  'Boat Tours': 'bg-blue-50 text-blue-700',
  'Transport':  'bg-yellow-50 text-yellow-700',
  'Chef':       'bg-orange-50 text-orange-700',
  'Wine':       'bg-purple-50 text-purple-700',
  'Other':      'bg-gray-100 text-gray-600',
}

async function getActivities(): Promise<Activity[]> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export default async function ActivitiesPage() {
  const activities = await getActivities()

  // Group by category
  const grouped = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    const cat = a.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(a)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Activities</h1>
        <Link
          href="/admin/activities/new"
          className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
        >
          Add Activity
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="rounded border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-400">
          No activities yet.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="overflow-hidden rounded border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other']}`}>
                  {category}
                </span>
                <span className="ml-2 text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600">Duration</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600">Price</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600">Max Guests</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                      <td className="px-4 py-3 text-gray-600">{a.duration ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {a.price != null ? `$${a.price}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.max_guests ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {a.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/activities/${a.id}/edit`} className="mr-3 text-[#1f5772] hover:underline">
                          Edit
                        </Link>
                        <DeleteButton action={deleteActivity.bind(null, a.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
