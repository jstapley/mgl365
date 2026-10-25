import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import CalendarView from '@/components/admin/CalendarViewMulti'
import type { Villa, Booking } from '@/types'

export interface MaintenanceEvent {
  id: string
  villa_id: string | null
  label: string
  date: string          // YYYY-MM-DD
  assigned_to: string | null
  type: 'schedule_due' | 'schedule_log' | 'issue'
  href: string
}

async function getData() {
  const supabase = getServiceSupabase()
  const [
    { data: villas },
    { data: bookings },
    { data: schedules },
    { data: logs },
    { data: issues },
  ] = await Promise.all([
    supabase.from('villas').select('*').eq('active', true).order('name'),
    supabase.from('bookings').select('*, client:clients(id, name)').order('check_in'),
    supabase.from('maintenance_schedules').select('id, villa_id, name, next_due').eq('active', true),
    supabase.from('maintenance_logs').select('id, schedule_id, completed_date, maintenance_schedules(villa_id, name)'),
    supabase.from('maintenance_issues').select('id, villa_id, description, scheduled_date, assigned_to').not('scheduled_date', 'is', null),
  ])

  const events: MaintenanceEvent[] = []

  // Upcoming schedule due dates
  for (const s of schedules ?? []) {
    if (!s.next_due) continue
    events.push({
      id:          `due-${s.id}`,
      villa_id:    s.villa_id,
      label:       s.name,
      date:        s.next_due,
      assigned_to: null,
      type:        'schedule_due',
      href:        `/admin/maintenance/${s.id}`,
    })
  }

  // Historical completion logs
  for (const l of logs ?? []) {
    const sched = (l as any).maintenance_schedules
    events.push({
      id:          `log-${l.id}`,
      villa_id:    sched?.villa_id ?? null,
      label:       sched?.name ?? 'Maintenance',
      date:        l.completed_date,
      assigned_to: null,
      type:        'schedule_log',
      href:        `/admin/maintenance/${l.schedule_id}`,
    })
  }

  // Ad-hoc issues with a scheduled date — link to villa tab (no issue detail page)
  for (const i of issues ?? []) {
    events.push({
      id:          `issue-${i.id}`,
      villa_id:    i.villa_id,
      label:       i.description,
      date:        i.scheduled_date!,
      assigned_to: i.assigned_to,
      type:        'issue',
      href:        `/admin/maintenance?villa=${i.villa_id}`,
    })
  }

  return {
    villas:   (villas   ?? []) as Villa[],
    bookings: (bookings ?? []) as Booking[],
    maintenanceEvents: events,
  }
}

export default async function CalendarPage() {
  const { villas, bookings, maintenanceEvents } = await getData()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
        <Link
          href="/admin/bookings/new"
          className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
        >
          Add Booking
        </Link>
      </div>
      <CalendarView villas={villas} bookings={bookings} maintenanceEvents={maintenanceEvents} />
    </div>
  )
}
