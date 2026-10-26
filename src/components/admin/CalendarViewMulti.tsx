'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Villa, Booking } from '@/types'
import type { MaintenanceEvent } from '@/app/admin/calendar/page'

interface Props {
  villas: Villa[]
  bookings: Booking[]
  maintenanceEvents: MaintenanceEvent[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const VILLA_COLORS: Record<string, string> = {
  'Cool House':           'bg-red-500',
  'Starfish House Lower': 'bg-purple-700',
  'Starfish House Upper': 'bg-violet-400',
  'Water Edge':           'bg-blue-600',
}
const FALLBACKS = ['bg-emerald-500', 'bg-orange-500']

function getColor(villaName: string, idx: number) {
  return VILLA_COLORS[villaName] ?? FALLBACKS[idx % FALLBACKS.length]
}

function pad(n: number) { return String(n).padStart(2, '0') }


export default function CalendarViewMulti({ villas, bookings, maintenanceEvents }: Props) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthLabel  = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = new Date(year, month, 1).getDay()
  const todayStr    = new Date().toISOString().slice(0, 10)

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  // Map villa index → dateStr → booking
  const villaBookingMaps = useMemo(() => {
    return villas.map(villa => {
      const map = new Map<string, Booking>()
      for (const b of bookings) {
        if (b.villa_id !== villa.id || b.status === 'cancelled') continue
        const cur = new Date(b.check_in + 'T00:00:00')
        const end = new Date(b.check_out + 'T00:00:00')
        while (cur < end) {
          map.set(cur.toISOString().slice(0, 10), b)
          cur.setDate(cur.getDate() + 1)
        }
      }
      return map
    })
  }, [villas, bookings])

  // Map villa_id → dateStr → MaintenanceEvent[]
  const maintMap = useMemo(() => {
    const map = new Map<string, Map<string, MaintenanceEvent[]>>()
    for (const evt of maintenanceEvents) {
      const vKey = evt.villa_id ?? '__global__'
      if (!map.has(vKey)) map.set(vKey, new Map())
      const dMap = map.get(vKey)!
      if (!dMap.has(evt.date)) dMap.set(evt.date, [])
      dMap.get(evt.date)!.push(evt)
    }
    return map
  }, [maintenanceEvents])

  function getMaintEvents(villaId: string, dateStr: string): MaintenanceEvent[] {
    return [
      ...(maintMap.get(villaId)?.get(dateStr) ?? []),
      ...(maintMap.get('__global__')?.get(dateStr) ?? []),
    ]
  }

  // Build flat list of cells
  const cells = useMemo(() => {
    const all: { day: number | null; dateStr: string | null }[] = []
    for (let i = 0; i < startOffset; i++) all.push({ day: null, dateStr: null })
    for (let d = 1; d <= daysInMonth; d++) {
      all.push({ day: d, dateStr: `${year}-${pad(month + 1)}-${pad(d)}` })
    }
    while (all.length % 7 !== 0) all.push({ day: null, dateStr: null })
    return all
  }, [startOffset, daysInMonth, year, month])

  // Split into weeks
  const weeks = useMemo(() => {
    const ws = []
    for (let i = 0; i < cells.length; i += 7) ws.push(cells.slice(i, i + 7))
    return ws
  }, [cells])

  // For a given villa + week, compute bar segments
  function getWeekSegments(villaIdx: number, week: typeof weeks[0]) {
    const map = villaBookingMaps[villaIdx]
    const segments: {
      booking: Booking | null
      span: number
      isStart: boolean
      isEnd: boolean
      showLabel: boolean
      colStart: number
    }[] = []

    let i = 0
    while (i < 7) {
      const cell = week[i]
      const booking = cell.dateStr ? (map.get(cell.dateStr) ?? null) : null

      if (!booking) {
        let span = 1
        while (i + span < 7) {
          const next = week[i + span]
          const nb = next.dateStr ? (map.get(next.dateStr) ?? null) : null
          if (nb) break
          span++
        }
        segments.push({ booking: null, span, isStart: false, isEnd: false, showLabel: false, colStart: i + 1 })
        i += span
        continue
      }

      let span = 1
      while (i + span < 7) {
        const next = week[i + span]
        const nb = next.dateStr ? (map.get(next.dateStr) ?? null) : null
        if (nb?.id !== booking.id) break
        span++
      }

      const isStart  = booking.check_in === cell.dateStr
      const lastDate = week[i + span - 1].dateStr
      const [ey, em, ed] = booking.check_out.split('-').map(Number)
      const dayBeforeCheckout = new Date(ey, em - 1, ed - 1).toISOString().slice(0, 10)
      const isEnd    = lastDate === dayBeforeCheckout
      const showLabel = isStart || i === 0

      segments.push({ booking, span, isStart, isEnd, showLabel, colStart: i + 1 })
      i += span
    }
    return segments
  }

  return (
    <div>
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
          ← Prev
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{monthLabel}</h2>
        <button onClick={nextMonth} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
          Next →
        </button>
      </div>

      {/* Calendar */}
      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => (
          <div key={wi} className="border-b border-gray-100">
            {/* Day numbers */}
            <div className="grid grid-cols-7">
              {week.map((cell, ci) => (
                <div key={ci} className="h-8 border-r border-gray-100 p-1.5 last:border-r-0">
                  {cell.day && (
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      cell.dateStr === todayStr ? 'bg-[#1f5772] text-white' : 'text-gray-500'
                    }`}>
                      {cell.day}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* One row per villa: booking bar + maintenance dots */}
            {villas.map((villa, vidx) => {
              const segments = getWeekSegments(vidx, week)
              const color = getColor(villa.name, vidx)

              return (
                <div key={villa.id}>
                  {/* Booking bar */}
                  <div className="grid grid-cols-7 h-7 px-0.5 mb-0.5">
                    {segments.map((seg, si) => {
                      const colSpanStyle = { gridColumn: `span ${seg.span}` }
                      if (!seg.booking) return <div key={si} style={colSpanStyle} />
                      return (
                        <Link
                          key={si}
                          href={`/admin/bookings/${seg.booking.id}`}
                          title={`${villa.name} — ${seg.booking.client?.name ?? 'Guest'} (${seg.booking.status})`}
                          style={colSpanStyle}
                          className={`flex h-6 items-center overflow-hidden px-2 text-white transition-opacity hover:opacity-80
                            ${color}
                            ${seg.isStart ? 'rounded-l-full ml-0.5' : ''}
                            ${seg.isEnd   ? 'rounded-r-full mr-0.5' : ''}
                          `}
                        >
                          {seg.showLabel && (
                            <span className="truncate whitespace-nowrap text-[10px] font-semibold">
                              {seg.booking.client?.name ?? 'Guest'}
                              <span className="ml-1 font-normal opacity-80 capitalize">· {seg.booking.status}</span>
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>

                  {/* Maintenance dots row — only rendered if this villa has any events this week */}
                  {(() => {
                    const weekEvts = week.map(cell =>
                      cell.dateStr ? getMaintEvents(villa.id, cell.dateStr) : []
                    )
                    const hasAny = weekEvts.some(e => e.length > 0)
                    if (!hasAny) return null
                    return (
                      <div className="grid grid-cols-7 h-5 mb-0.5">
                        {weekEvts.map((evts, ci) => {
                          if (evts.length === 0) return <div key={ci} />
                          return (
                            <div key={ci} className="flex items-center justify-center gap-0.5 overflow-hidden">
                              {evts.slice(0, 3).map(evt => (
                                <Link
                                  key={evt.id}
                                  href={evt.href}
                                  title={`${villa.name} · ${evt.label}${evt.assigned_to ? ` · ${evt.assigned_to}` : ''}`}
                                  className={`h-3 w-3 shrink-0 rounded-full ${color} hover:opacity-70 transition-opacity`}
                                />
                              ))}
                              {evts.length > 3 && (
                                <span className="text-[9px] text-gray-400">+{evts.length - 3}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        {villas.map((villa, idx) => (
          <div key={villa.id} className="flex items-center gap-1.5">
            <div className={`h-3 w-6 rounded-full ${getColor(villa.name, idx)}`} />
            <span>{villa.name}</span>
          </div>
        ))}
        <div className="ml-2 flex items-center gap-1.5 border-l border-gray-200 pl-3">
          <div className="h-3 w-3 rounded-full bg-gray-400" />
          <span>Maintenance / issue dot</span>
        </div>
      </div>
    </div>
  )
}
