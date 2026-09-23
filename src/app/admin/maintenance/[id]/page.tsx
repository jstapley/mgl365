import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { updateSchedule, markComplete } from '../actions'
import type { Villa } from '@/types'

interface Log {
  id: string
  completed_date: string
  notes: string | null
  cost: number | null
  created_at: string
}

async function getSchedule(id: string) {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('maintenance_schedules')
    .select('*, villa:villas(id, name)')
    .eq('id', id)
    .single()
  if (error || !data) notFound()
  return data
}

async function getLogs(scheduleId: string): Promise<Log[]> {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('schedule_id', scheduleId)
    .order('completed_date', { ascending: false })
  return data ?? []
}

async function getVillas() {
  const supabase = getServiceSupabase()
  const { data } = await supabase.from('villas').select('id, name').order('name')
  return (data ?? []) as Pick<Villa, 'id' | 'name'>[]
}

function getStatus(nextDue: string | null, notifyDaysBefore: number) {
  if (!nextDue) return { label: 'Not scheduled', color: 'bg-gray-100 text-gray-500' }
  const today = new Date(); today.setHours(0,0,0,0)
  const due   = new Date(nextDue + 'T00:00:00')
  const days  = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0)  return { label: `${Math.abs(days)} day(s) overdue`, color: 'bg-red-100 text-red-700' }
  if (days <= notifyDaysBefore) return { label: `Due in ${days} day(s)`, color: 'bg-yellow-100 text-yellow-700' }
  return { label: `Due in ${days} day(s)`, color: 'bg-green-100 text-green-700' }
}

export default async function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [schedule, logs, villas] = await Promise.all([getSchedule(id), getLogs(id), getVillas()])
  const status    = getStatus(schedule.next_due, schedule.notify_days_before)
  const editAction = updateSchedule.bind(null, id)
  const completeAction = markComplete.bind(null, id)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/maintenance" className="text-sm text-gray-500 hover:text-gray-700">← Maintenance</Link>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-gray-900">{schedule.name}</h1>
      <p className="mb-6 text-sm text-gray-500">{schedule.villa?.name ?? 'No villa assigned'} · Every {schedule.frequency_days} days</p>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Mark Complete */}
        <div className="rounded border border-green-200 bg-green-50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-700">Mark as Completed</p>
          <form action={completeAction} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Completed Date</label>
              <input name="completed_date" type="date" defaultValue={today} required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
              <textarea name="notes" rows={2} placeholder="Technician name, work done, etc." className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Cost (USD)</label>
              <input name="cost" type="number" step="0.01" min="0" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500" />
            </div>
            <button type="submit" className="w-full rounded bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">
              ✓ Mark Complete & Reschedule
            </button>
          </form>
          <p className="mt-2 text-[10px] text-gray-400">
            Next due will automatically be set to completed date + {schedule.frequency_days} days.
          </p>
        </div>

        {/* Edit Schedule */}
        <form action={editAction} className="space-y-3 rounded border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Edit Schedule</p>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Villa</label>
            <select name="villa_id" defaultValue={schedule.villa_id ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
              <option value="">— General —</option>
              {villas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Task Name *</label>
            <input name="name" required defaultValue={schedule.name} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Description</label>
            <textarea name="description" rows={2} defaultValue={schedule.description ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Frequency (days)</label>
              <input name="frequency_days" type="number" min="1" defaultValue={schedule.frequency_days} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Next Due</label>
              <input name="next_due" type="date" defaultValue={schedule.next_due ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Notify Email</label>
            <input name="notify_email" type="email" defaultValue={schedule.notify_email ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Remind (days before)</label>
            <input name="notify_days_before" type="number" min="1" defaultValue={schedule.notify_days_before} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
            <select name="active" defaultValue={String(schedule.active)} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
              <option value="true">Active</option>
              <option value="false">Paused</option>
            </select>
          </div>

          <button type="submit" className="w-full rounded bg-[#1f5772] py-2 text-sm font-medium text-white hover:bg-[#174560]">
            Save Changes
          </button>
        </form>
      </div>

      {/* Completion History */}
      <div className="mt-6 rounded border border-gray-200 bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Completion History</p>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">No completions logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="pb-2 text-left font-medium text-gray-500">Date</th>
                <th className="pb-2 text-left font-medium text-gray-500">Notes</th>
                <th className="pb-2 text-left font-medium text-gray-500">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2 text-gray-700">{log.completed_date}</td>
                  <td className="py-2 text-gray-500">{log.notes ?? '—'}</td>
                  <td className="py-2 text-gray-500">{log.cost != null ? `$${log.cost}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
