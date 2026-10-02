'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Villa, Booking } from '@/types'

interface Props {
  villas: Villa[]
  bookings: Booking[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Match the Google Calendar colors from the screenshot
const VILLA_COLORS: Record<string, { bg: string; bar: string; dot: string; text: string }> = {
  'Cool House':            { bg: 'bg-red-100',    bar: 'bg-red-500',    dot: 'bg-red-500',    text: 'text-red-700'    },
  'Starfish House Lower':  { bg: 'bg-purple-100', bar: 'bg-purple-700', dot: 'bg-purple-700', text: 'text-purple-800' },
  'Starfish House Upper':  { bg: 'bg-violet-100', bar: 'bg-violet-400', dot: 'bg-violet-400', text: 'text-violet-700' },
  'Water Edge':            { bg: 'bg-blue-100',   bar: 'bg-blue-600',   dot: 'bg-blue-600',   text: 'text-blue-800'  },
}

const FALLBACK_COLORS = [
  { bg: 'bg-emerald-100', bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  { bg: 'bg-orange-100',  bar: 'bg-orange-500',  dot: 'bg-orange-500',  text: 'text-orange-700'  },
]

function getColor(villaName: string, index: number) {
  return VILLA_COLORS[villaName] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export default function CalendarViewMulti({ villas, bookings }: Props) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = new Date(year, month, 1).getDay()
  const todayStr = new Date().toISOString().slice(0, 10)

  function pad(n: number) { return String(n).padStart(2, '0') }
  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  // For each villa, map dateStr → booking
  const villaBookingMaps = useMemo(() => {
    return villas.map(villa => {
      const map = new Map<string, Booking>()
      const vb = bookings.filter(b => b.villa_id === villa.id && b.status !== 'cancelled')
      for (const b of vb) {
        const start = new Date(b.check_in + 'T00:00:00')
        const end   = new Date(b.check_out + 'T00:00:00')
        const cur   = new Date(start)
        while (cur < end) {
          map.set(cur.toISOString().slice(0, 10), b)
          cur.setDate(cur.getDate() + 1)
        }
      }
      return map
    })
  }, [villas, bookings])

  // For each day, collect which villas have bookings and their metadata
  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
      const dayOfWeek = new Date(year, month, day).getDay() // 0 = Sun
      const villaEntries = villas.map((villa, idx) => {
        const booking = villaBookingMaps[idx].get(dateStr)
        if (!booking) return null
        const isBookingStart = booking.check_in === dateStr
        // First day this booking is visible in the current month view
        const firstVisibleDate = booking.check_in > `${year}-${pad(month + 1)}-01`
          ? booking.check_in
          : `${year}-${pad(month + 1)}-01`
        const isFirstVisible = dateStr === firstVisibleDate
        // Show label on first visible day OR start of each new week row
        const showLabel = isFirstVisible || dayOfWeek === 0
        const isLast  = (() => {
          const [y, m, d] = booking.check_out.split('-').map(Number)
          const prevDay = new Date(y, m - 1, d - 1).toISOString().slice(0, 10)
          return prevDay === dateStr
        })()
        return { villa, booking, isBookingStart, showLabel, isLast, color: getColor(villa.name, idx) }
      }).filter(Boolean) as { villa: Villa; booking: Booking; isBookingStart: boolean; showLabel: boolean; isLast: boolean; color: (typeof VILLA_COLORS)[string] }[]

      return { day, dateStr, dayOfWeek, villaEntries }
    })
  }, [daysInMonth, year, month, villas, villaBookingMaps])

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
          ← Prev
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{monthLabel}</h2>
        <button onClick={nextMonth} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
          Next →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {/* Empty cells before month start */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] border-b border-r border-gray-100 bg-gray-50/40" />
          ))}

          {days.map(({ day, dateStr, villaEntries }) => {
            const isToday = dateStr === todayStr
            return (
              <div key={day} className="relative min-h-[110px] border-b border-r border-gray-100 p-1.5">
                {/* Day number */}
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday ? 'bg-[#1f5772] text-white' : 'text-gray-500'
                }`}>
                  {day}
                </span>

                {/* Booking bars — one per villa */}
                <div className="mt-1 space-y-0.5">
                  {villas.map((villa, idx) => {
                    const entry = villaEntries.find(e => e.villa.id === villa.id)
                    if (!entry) return <div key={villa.id} className="h-6" />
                    const { booking, isBookingStart, showLabel, isLast, color } = entry
                    return (
                      <Link
                        key={villa.id}
                        href={`/admin/bookings/${booking.id}`}
                        title={`${villa.name} — ${booking.client?.name ?? 'Guest'} (${booking.status})`}
                        className={`flex h-6 items-center gap-1 overflow-hidden leading-none transition-opacity hover:opacity-80
                          ${color.bar} text-white
                          ${isBookingStart ? 'rounded-l-full pl-2' : 'pl-1.5'}
                          ${isLast        ? 'rounded-r-full pr-1' : 'pr-0'}
                        `}
                      >
                        {showLabel && (
                          <span className="flex items-baseline gap-1 truncate whitespace-nowrap">
                            <span className="text-[10px] font-semibold truncate">
                              {booking.client?.name ?? 'Guest'}
                            </span>
                            <span className="text-[9px] opacity-75 capitalize shrink-0">
                              · {booking.status}
                            </span>
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        {villas.map((villa, idx) => {
          const color = getColor(villa.name, idx)
          return (
            <div key={villa.id} className="flex items-center gap-1.5">
              <div className={`h-3 w-6 rounded-full ${color.bar}`} />
              <span>{villa.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
