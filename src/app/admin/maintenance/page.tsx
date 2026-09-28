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

interface Issue {
  id: string
  villa_id: string
  description: string
  notes: string | null
  created_at: string
  resolved_at: string | null
}

// Display order for villa tabs
const VILLA_ORDER = ['Cool House', 'Water Edge', 'Starfish Lower', 'Starfish Upper']

function getStatus(nextDue: string | null, notifyDaysBefore: number) {
  if (!nextDue) return { label: 'Not scheduled', color: 'bg-gray-100 text-gray-500', days: null }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(nextDue + 'T00:00:00')
  const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: 'bg-red-100 text-red-700', days }
  if (days <= notifyDaysBefore) return { label: `Due in ${days}d`, color: 'bg-yellow-100 text-yellow-700', days }
  return { label: `Due in ${days}d`, color: 'bg-green-100 text-green-700', days }
}

async function getData() {
  const supabase = getServiceSupabase()
  const [{ data: scheduleData, error }, { data: issueData }, { data: villaData }] = await Promise.all([
    supabase.from('maintenance_schedules').select('*, villa:villas(id, name)').order('next_due', { ascending: true, nullsFirst: false }),
    supabase.from('maintenance_issues').select('*').order('created_at', { ascending: false }),
    supabase.from('villas').select('id, name').eq('active', true).order('name'),
  ])
  if (error) throw error
  return {
    schedules: (scheduleData ?? []) as Schedule[],
    issues: (issueData ?? []) as Issue[],
    villas: (villaData ?? []) as { id: string; name: string }[],
  }
}

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ villa?: string }>
}) {
  const { villa: activeVillaId } = await searchParams
  const { schedules, issues, villas } = await getData()

  // Build per-villa data
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

  // Sort villa tabs by defined order, unknown villas go to the end alphabetically
  const villaList = Object.values(byVilla).sort((a, b) => {
    const ai = VILLA_ORDER.indexOf(a.villaName)
    const bi = VILLA_ORDER.indexOf(b.villaName)
    if (ai === -1 && bi === -1) return a.villaName.localeCompare(b.villaName)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  // Active tab — default to first villa
  const currentId = activeVillaId && byVilla[activeVillaId] ? activeVillaId : villaList[0]?.villaId
  const current = currentId ? byVilla[currentId] : null

  // Summary stats (across all villas)
  const overdue = schedules.filter(s => s.next_due && new Date(s.next_due + 'T00:00:00') < new Date())
  const openIssues = issues.filter(i => !i.resolved_at)
  const dueThisWeek = schedules.filter(s => {
    const d = s.next_due ? Math.ceil((new Date(s.next_due + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000) : null
    return d !== null && d >= 0 && d <= 7
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">Maintenance</h1>
        <div className="flex items-center gap-2">
          <a
            href="/api/maintenance/check"
            target="_blank"
            className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 md:px-4 md:py-2 md:text-sm"
          >
            Send Reminders
          </a>
          <Link
            href={`/admin/maintenance/new${currentId ? `?villa_id=${currentId}` : ''}`}
            className="rounded bg-[#1f5772] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#174560] md:px-4 md:py-2 md:text-sm"
          >
            Add Schedule
          </Link>
        </div>
      </div>

      {/* Summary stats — 2×2 on mobile, 4-col on desktop */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { label: 'Total Schedules', value: schedules.filter(s => s.active).length, color: 'text-gray-900' },
          { label: 'Overdue',         value: overdue.length,      color: overdue.length > 0 ? 'text-red-600' : 'text-gray-900' },
          { label: 'Due This Week',   value: dueThisWeek.length,  color: 'text-yellow-600' },
          { label: 'Open Issues',     value: openIssues.length,   color: openIssues.length > 0 ? 'text-red-600' : 'text-gray-900' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded border border-gray-200 bg-white px-4 py-3 md:px-5 md:py-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Villa tabs — scrollable on mobile */}
      {villaList.length > 0 && (
        <div className="mb-0 flex gap-0 overflow-x-auto border-b border-gray-200">
          {villaList.map(({ villaId, villaName, schedules: vs, issues: vi }) => {
            const isActive = villaId === currentId
            const villaOverdue = vs.filter(s => s.next_due && new Date(s.next_due + 'T00:00:00') < new Date()).length
            const villaOpenIssues = vi.filter(i => !i.resolved_at).length
            const alertCount = villaOverdue + villaOpenIssues
            return (
              <Link
                key={villaId}
                href={`/admin/maintenance?villa=${villaId}`}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#1f5772] text-[#1f5772]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {villaName}
                {alertCount > 0 && (
                  <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                    {alertCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* Active villa panel */}
      {current ? (
        <div className="overflow-hidden rounded-b rounded-tr border border-t-0 border-gray-200 bg-white">

          {/* Scheduled maintenance header */}
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Scheduled Maintenance</p>
          </div>

          {current.schedules.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-400 italic">No scheduled maintenance tasks for this villa.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
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
                    {current.schedules.map((s) => {
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
                          <td className="px-4 py-3 text-xs text-gray-500">{s.notify_email ?? '—'}</td>
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
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {current.schedules.map((s) => {
                  const status = getStatus(s.next_due, s.notify_days_before)
                  return (
                    <div key={s.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        <span>Every {s.frequency_days}d</span>
                        <span>Last: {s.last_completed ?? '—'}</span>
                        <span>Due: {s.next_due ?? '—'}</span>
                      </div>
                      <div className="mt-2 flex gap-3">
                        <Link href={`/admin/maintenance/${s.id}`} className="text-xs text-[#1f5772] hover:underline">
                          View
                        </Link>
                        <DeleteButton action={deleteSchedule.bind(null, s.id)} label="Delete" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Ad-hoc issues */}
          <IssuePanel villaId={current.villaId} initialIssues={current.issues} />
        </div>
      ) : (
        <div className="rounded border border-gray-200 bg-white px-4 py-12 text-center text-gray-400">
          No active villas found.
        </div>
      )}
    </div>
  )
}
