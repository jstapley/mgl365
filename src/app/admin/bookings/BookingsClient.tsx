'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Booking, BookingStatus } from '@/types'

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
  imported:  'bg-blue-100 text-blue-600',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function sortBookings(list: Booking[]): Booking[] {
  const today = new Date().toISOString().slice(0, 10)
  return [...list].sort((a, b) => {
    const aUpcoming = a.check_in >= today
    const bUpcoming = b.check_in >= today
    if (aUpcoming && !bUpcoming) return -1
    if (!aUpcoming && bUpcoming) return 1
    if (aUpcoming && bUpcoming) return a.check_in.localeCompare(b.check_in) // soonest first
    return b.check_in.localeCompare(a.check_in) // most recent past first
  })
}

export default function BookingsClient({ bookings }: { bookings: Booking[] }) {
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = sortBookings(
    q
      ? bookings.filter(b =>
          b.client?.name.toLowerCase().includes(q) ||
          b.villa?.name.toLowerCase().includes(q) ||
          b.check_in.includes(q) ||
          b.check_out.includes(q)
        )
      : bookings
  )

  return (
    <>
      <div className="mb-4 relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by guest, villa or date…"
          className="w-full rounded border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#1f5772]"
        />
      </div>

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Guest</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Villa</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Check-in</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Check-out</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {query ? `No bookings matching "${query}".` : 'No bookings yet.'}
                </td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{b.client?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{b.villa?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(b.check_in)}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(b.check_out)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[b.status]}`}>
                    {b.status}
                  </span>
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
      {query && filtered.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">{filtered.length} of {bookings.length} bookings</p>
      )}
    </>
  )
}
