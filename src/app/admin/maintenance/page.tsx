import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { deleteSchedule } from './actions'
import DeleteButton from '@/components/admin/DeleteButton'
import IssuePanel from './IssuePanel'

interface Schedule {
  id: string
  name: string
  description: string | null
  frequency_days: number
  last_completed: string | null
  next_due: string | null
  notify_email: string | null
  notify_days_before: number
  active: boolean
  villa: { id: string; name: string } | null
}

function getStatus(nextDue: string | null, notifyDaysBefore: number) {
  if (!nextDue) return { label: 'Not scheduled', color: 'bg-gray-100 text-gray-500', days: null }
  const today = new Date(); today.setHours(0,0,0,0)
  const due   = new Date(nextDue + 'T00:00:00')
  const days  = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0)  return { label: `${Math.abs(days)}d overdue`, color: 'bg-red-100 text-red-700', days }
  if (days <= notifyDaysBefore) return { label: `Due in ${days}d`, color: 'bg-yellow-100 text-yellow-700', days }
  return { label: `Due in ${days}d`, color: 'bg-green-100 text-green-700', days }
}

interface Issue {
  id: string
  villa_id: string
  description: string
  notes: string | null
  created_at: string
  resolved_at: string | null
}

async function getSchedules(): Promise<Schedule[]> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('maintenance_schedules')
    .select('*, villa:villas(id, name)')
    .order('next_due', { ascending: true, nullsFirst: false })
  if (error) throw error
  return (data ?? []) as Schedule[]
}

async function getIssues(): Promise<Issue[]> {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('maintenance_issues')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Issue[]
}

async function getVillas() {
  const supabase = getServiceSupabase()
  const { data } = await supabase.from('villas').select('id, name').eq('active', true).order('name')
  return (data ?? []) as { id: string; name: string }[]
}

export default async function MaintenancePage() {
  const [schedules, issues, villas] = await Promise.all([getSchedules(), getIssues(), getVillas()])

  const overdue  = schedules.filter(s => s.next_due && new Date(s.next_due + 'T00:00:00') < new Date())
  const active   = schedules.filter(s => s.active)
  const openIssues = issues.filter(i => !i.resolved_at)

  // Build villa map — include all active villas so issues show even without schedules
  const byVilla: Record<string, { villaId: string; villaName: string; schedules: Schedule[]; issues: Issue[] }> = {}

  for (const v of villas) {
    byVilla[v.id] = { villaId: v.id, villaName: v.name, schedules: [], issues: [] }
  }
  for (const s of schedules) {
    const key = s.villa?.id ?? 'none'
    if (!byVilla[key]) byVilla[key] = { villaId: key, villaName: s.villa?.name ?? 'No Villa', schedules: [], issues: [] }
    byVilla[key].schedules.push(s)
  }
  for (const i of issues) {
    if (byVilla[i.villa_id]) byVilla[i.villa_id].issues.push(i)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Maintenance Schedules</h1>
          {overdue.length > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              {overdue.length} overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/maintenance/check"
            target="_blank"
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Send Reminders Now
          </a>
          <Link
            href="/admin/maintenance/new"
            className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
          >
            Add Schedule
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Total Schedules', value: active.length,    color: 'text-gray-900' },
          { label: 'Overdue',         value: overdue.length,   color: overdue.length > 0 ? 'text-red-600' : 'text-gray-900' },
          { label: 'Due This Week',   value: schedules.filter(s => { const d = s.next_due ? Math.ceil((new Date(s.next_due+'T00:00:00').getTime()-new Date().setHours(0,0,0,0))/(86400000)) : null; return d !== null && d >= 0 && d <= 7 }).length, color: 'text-yellow-600' },
          { label: 'Open Issues',     value: openIssues.length, color: openIssues.length > 0 ? 'text-red-600' : 'text-gray-900' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded border border-gray-200 bg-white px-5 py-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Grouped by villa */}
      <div className="space-y-6">
        {Object.values(byVilla).map(({ villaId, villaName, schedules: vs, issues: vi }) => (
          <div key={villaId} className="overflow-hidden rounded border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-semibold text-gray-700">{villaName}</p>
            </div>

            {/* Scheduled maintenance */}
            {vs.length > 0 && (
              <>
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Scheduled Maintenance</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Task</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Frequency</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Last Done</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Next Due</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-500">Notify</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vs.map((s) => {
                      const status = getStatus(s.next_due, s.notify_days_before)
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                          <td className="px-4 py-3 text-gray-600">Every {s.frequency_days}d</td>
                          <td className="px-4 py-3 text-gray-600">{s.last_completed ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{s.next_due ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{s.notify_email ?? '—'}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <Link href={`/admin/maintenance/${s.id}`} className="mr-3 text-[#1f5772] hover:underline">
                              View
                            </Link>
                            <DeleteButton action={deleteSchedule.bind(null, s.id)} label="Delete" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            )}

            {/* Ad-hoc issues */}
            <IssuePanel villaId={villaId} initialIssues={vi} />
          </div>
        ))}

        {villas.length === 0 && (
          <div className="rounded border border-gray-200 bg-white px-4 py-12 text-center text-gray-400">
            No active villas found.
          </div>
        )}
      </div>
    </div>
  )
}
