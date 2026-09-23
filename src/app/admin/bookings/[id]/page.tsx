import { notFound } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import { updateBookingStatus } from '../actions'
import BookingStatusBadge from '@/components/admin/BookingStatusBadge'
import EditBookingForm from './EditBookingForm'
import type { Booking, Villa, Client, BookingStatus } from '@/types'
import Link from 'next/link'

async function getBooking(id: string): Promise<Booking> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, villa:villas(id,name), client:clients(id,name)')
    .eq('id', id)
    .single()
  if (error || !data) notFound()
  return data as Booking
}

async function getOptions() {
  const supabase = getServiceSupabase()
  const [{ data: villas }, { data: clients }] = await Promise.all([
    supabase.from('villas').select('id, name').order('name'),
    supabase.from('clients').select('id, name').order('name'),
  ])
  return {
    villas: (villas ?? []) as Pick<Villa, 'id' | 'name'>[],
    clients: (clients ?? []) as Pick<Client, 'id' | 'name'>[],
  }
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [booking, { villas, clients }] = await Promise.all([getBooking(id), getOptions()])

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/bookings" className="text-sm text-gray-500 hover:text-gray-700">← Bookings</Link>
        <BookingStatusBadge status={booking.status} />
      </div>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Booking — {booking.client?.name ?? 'Unknown'}
      </h1>

      {/* Quick status update */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['pending', 'confirmed', 'cancelled', 'completed'] as BookingStatus[]).map((s) => (
          <form key={s} action={updateBookingStatus.bind(null, id, s)}>
            <button
              type="submit"
              disabled={booking.status === s}
              className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-40 ${STATUS_STYLES[s]} border border-transparent`}
            >
              Mark {s}
            </button>
          </form>
        ))}
      </div>

      <EditBookingForm booking={booking} villas={villas} clients={clients} />
    </div>
  )
}
