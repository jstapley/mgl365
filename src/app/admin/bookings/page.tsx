import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import BookingStatusBadge from '@/components/admin/BookingStatusBadge'
import type { Booking, BookingStatus } from '@/types'

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

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Villa</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Check-in</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Check-out</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No bookings yet.</td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{b.client?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{b.villa?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{b.check_in}</td>
                <td className="px-4 py-3 text-gray-600">{b.check_out}</td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={b.status as BookingStatus} />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {b.total_amount != null ? `$${b.total_amount.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/bookings/${b.id}`} className="text-[#1f5772] hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
