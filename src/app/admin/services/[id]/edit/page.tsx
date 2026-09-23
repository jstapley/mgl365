import { notFound } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import { updateService } from '../../actions'
import type { Service } from '@/types'

async function getService(id: string): Promise<Service> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase.from('services').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return data
}

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await getService(id)
  const action = updateService.bind(null, id)

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Edit Service</h1>

      <form action={action} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Name *</label>
          <input name="name" required defaultValue={service.name} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
          <textarea name="description" rows={3} defaultValue={service.description ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Package</label>
          <select name="package" defaultValue={service.package ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— None —</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Sort Order</label>
          <input name="sort_order" type="number" defaultValue={service.sort_order} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
          <select name="active" defaultValue={String(service.active)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]">
            Save Changes
          </button>
          <a href="/admin/services" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
