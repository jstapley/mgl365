import { getServiceSupabase } from '@/lib/supabase'
import { createSchedule } from '../actions'
import type { Villa } from '@/types'

async function getVillas() {
  const supabase = getServiceSupabase()
  const { data } = await supabase.from('villas').select('id, name').eq('active', true).order('name')
  return (data ?? []) as Pick<Villa, 'id' | 'name'>[]
}

export default async function NewMaintenancePage() {
  const villas = await getVillas()
  const today  = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Add Maintenance Schedule</h1>

      <form action={createSchedule} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Villa</label>
          <select name="villa_id" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— All Villas / General —</option>
            {villas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Task Name *</label>
          <input name="name" required placeholder="e.g. Air Conditioning Service" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
          <textarea name="description" rows={2} placeholder="Optional notes about this task" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Frequency (days) *</label>
            <input name="frequency_days" type="number" min="1" defaultValue="90" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
            <p className="mt-1 text-[10px] text-gray-400">e.g. 90 = every 3 months</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Next Due Date</label>
            <input name="next_due" type="date" defaultValue={today} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Last Completed (if known)</label>
          <input name="last_completed" type="date" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>

        <div className="rounded border border-[#1f5772]/20 bg-[#1f5772]/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-[#1f5772]">Email Reminder Settings</p>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Notify Email</label>
            <input name="notify_email" type="email" placeholder="manager@mgl365.com" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Send Reminder (days before due)</label>
            <input name="notify_days_before" type="number" min="1" defaultValue="7" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
            <p className="mt-1 text-[10px] text-gray-400">e.g. 7 = reminder sent 1 week before due date</p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
          <select name="active" defaultValue="true" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="true">Active</option>
            <option value="false">Paused</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]">
            Create Schedule
          </button>
          <a href="/admin/maintenance" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
