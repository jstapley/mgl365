'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Villa, Booking } from '@/types'

interface CalendarViewProps {
  villas: Villa[]
  bookings: Booking[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_BG: Record<string, string> = {
  confirmed:  'bg-[#1f5772] text-white',
  pending:    'bg-yellow-100 text-yellow-800',
  completed:  'bg-gray-200 text-gray-600',
  cancelled:  'bg-red-50 text-red-400 line-through opacity-60',
}

export default function CalendarView({ villas, bookings }: CalendarViewProps) {
  const [selectedVillaId, setSelectedVillaId] = useState(villas[0]?.id ?? '')
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const villaBookings = useMemo(
    () => bookings.filter((b) => b.villa_id === selectedVillaId),
    [bookings, selectedVillaId]
  )

  // Build a map of dateStr → booking for quick lookup
  // Confirmed/pending/completed take priority over cancelled
  const bookedMap = useMemo(() => {
    const map = new Map<string, Booking>()
    // Insert cancelled first so active bookings can overwrite them
    const sorted = [...villaBookings].sort((a, b) =>
      a.status === 'cancelled' ? -1 : b.status === 'cancelled' ? 1 : 0
    )
    for (const b of sorted) {
      const start = new Date(b.check_in + 'T00:00:00')
      const end   = new Date(b.check_out + 'T00:00:00')
      const cur   = new Date(start)
      while (cur < end) {
        const key = cur.toISOString().slice(0, 10)
        map.set(key, b)
        cur.setDate(cur.getDate() + 1)
      }
    }
    return map
  }, [villaBookings])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().slice(0, 10)

  function pad(n: number) { return String(n).padStart(2, '0') }
  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  // Only count non-cancelled nights as "booked"
  const bookedThisMonth = Array.from({ length: daysInMonth }, (_, i) => {
    const b = bookedMap.get(`${year}-${pad(month + 1)}-${pad(i + 1)}`)
    return b && b.status !== 'cancelled'
  }).filter(Boolean).length

  return (
    <div>
      {/* Villa tabs */}
      <div className="mb-6 flex border-b border-gray-200">
        {villas.map((villa) => (
          <button
            key={villa.id}
            onClick={() => setSelectedVillaId(villa.id)}
            className={`-mb-px border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
              selectedVillaId === villa.id
                ? 'border-[#1f5772] text-[#1f5772]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {villa.name}
          </button>
        ))}
      </div>

      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
          ← Prev
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">{monthLabel}</h2>
          <p className="text-xs text-gray-400">{bookedThisMonth} of {daysInMonth} nights booked</p>
        </div>
        <button onClick={nextMonth} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
          Next →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50/50" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
            const booking = bookedMap.get(dateStr)
            const isToday = dateStr === todayStr
            const isCheckIn = booking?.check_in === dateStr

            return (
              <div
                key={day}
                className={`relative min-h-[80px] border-b border-r border-gray-100 p-1.5 ${
                  booking ? STATUS_BG[booking.status] ?? 'bg-gray-100' : ''
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday ? 'bg-white text-[#1f5772] ring-2 ring-[#1f5772]' : 'text-inherit'
                }`}>
                  {day}
                </span>

                {booking && isCheckIn && (
                  <div className="mt-1">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="block truncate text-[10px] leading-tight hover:underline underline-offset-1"
                    >
                      {booking.client?.name ?? 'Guest'}
                    </Link>
                    <span className="text-[9px] opacity-70 capitalize">{booking.status}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-[#1f5772]" />Confirmed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-yellow-300 bg-yellow-100" />Pending
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-gray-200" />Completed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-50 border border-red-200" />Cancelled
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-white border border-gray-200" />Available
        </div>
      </div>
    </div>
  )
}
