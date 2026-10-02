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
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatDateShort(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

function sortBookings(list: Booking[]): Booking[] {
  const today = new Date().toISOString().slice(0, 10)
  return [...list].sort((a, b) => {
    const aUpcoming = a.check_in >= today
    const bUpcoming = b.check_in >= today
    if (aUpcoming && !bUpcoming) return -1
    if (!aUpcoming && bUpcoming) return 1
    if (aUpcoming && bUpcoming) return a.check_in.localeCompare(b.check_in)
    return b.check_in.localeCompare(a.check_in)
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

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
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
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            {query ? `No bookings matching "${query}".` : 'No bookings yet.'}
          </p>
        )}
        {filtered.map((b) => (
          <Link key={b.id} href={`/admin/bookings/${b.id}`}
            className="block rounded border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">{b.client?.name ?? '—'}</p>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">{b.villa?.name ?? '—'}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatDateShort(b.check_in)} → {formatDateShort(b.check_out)}
                </p>
              </div>
              <span className="shrink-0 text-sm text-[#1f5772]">View →</span>
            </div>
          </Link>
        ))}
      </div>

      {query && filtered.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">{filtered.length} of {bookings.length} bookings</p>
      )}
    </>
  )
}
