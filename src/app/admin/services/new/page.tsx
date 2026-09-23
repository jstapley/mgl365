import { createService } from '../actions'

export default function NewServicePage() {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Add Service</h1>

      <form action={createService} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Name *</label>
          <input name="name" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
          <textarea name="description" rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Package</label>
          <select name="package" defaultValue="" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— None —</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Sort Order</label>
          <input name="sort_order" type="number" defaultValue="0" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
          <select name="active" defaultValue="true" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]">
            Create Service
          </button>
          <a href="/admin/services" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
