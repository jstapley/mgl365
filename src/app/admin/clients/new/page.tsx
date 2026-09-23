import { createClient } from '../actions'

export default function NewClientPage() {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Add Client</h1>

      <form action={createClient} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Name *</label>
          <input name="name" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
          <input name="email" type="email" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
          <input name="phone" type="tel" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Nationality</label>
          <input name="nationality" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
          <textarea name="notes" rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]">
            Create Client
          </button>
          <a href="/admin/clients" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
