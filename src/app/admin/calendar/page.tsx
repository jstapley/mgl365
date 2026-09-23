import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import CalendarView from '@/components/admin/CalendarView'
import type { Villa, Booking } from '@/types'

async function getData() {
  const supabase = getServiceSupabase()
  const [{ data: villas }, { data: bookings }] = await Promise.all([
    supabase
      .from('villas')
      .select('*')
      .eq('active', true)
      .order('name'),
    supabase
      .from('bookings')
      .select('*, client:clients(id, name)')
      .order('check_in'),
  ])
  return {
    villas: (villas ?? []) as Villa[],
    bookings: (bookings ?? []) as Booking[],
  }
}

export default async function CalendarPage() {
  const { villas, bookings } = await getData()

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
      <CalendarView villas={villas} bookings={bookings} />
    </div>
  )
}
