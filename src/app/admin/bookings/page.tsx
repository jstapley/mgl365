import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import type { Booking } from '@/types'
import BookingsClient from './BookingsClient'

async function getBookings(): Promise<Booking[]> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, villa:villas(id,name), client:clients(id,name)')
    .order('check_in', { ascending: false })
  if (error) throw error
  return (data ?? []) as Booking[]
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <Link
          href="/admin/bookings/new"
          className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
        >
          Add Booking
        </Link>
      </div>
      <BookingsClient bookings={bookings} />
    </div>
  )
}
