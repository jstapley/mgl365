import { notFound } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import { updateActivity } from '../../actions'

const CATEGORIES = ['Spa', 'Boat Tours', 'Transport', 'Chef', 'Wine', 'Other']

async function getActivity(id: string) {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase.from('activities').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return data
}

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const a = await getActivity(id)
  const action = updateActivity.bind(null, id)

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Edit Activity</h1>

      <form action={action} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Name *</label>
          <input name="name" required defaultValue={a.name} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
          <textarea name="description" rows={3} defaultValue={a.description ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Category</label>
            <select name="category" defaultValue={a.category ?? 'Other'} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
            <select name="active" defaultValue={String(a.active)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Price (USD)</label>
            <input name="price" type="number" step="0.01" min="0" defaultValue={a.price ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Duration</label>
            <input name="duration" defaultValue={a.duration ?? ''} placeholder="e.g. Half day, 3 hours" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Max Guests</label>
            <input name="max_guests" type="number" min="1" defaultValue={a.max_guests ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={a.sort_order} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]">
            Save Changes
          </button>
          <a href="/admin/activities" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
