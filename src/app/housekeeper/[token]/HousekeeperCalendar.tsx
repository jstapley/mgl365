'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { BookingRow } from './page'

// ── Constants ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const REGULAR_HOUSES: { name: string; dayOfWeek: number }[] = [
  { name: "Jamie's House",  dayOfWeek: 1 },
  { name: "Michel's House", dayOfWeek: 4 },
]

// ── Types ──────────────────────────────────────────────────────────────────────

type TaskType = 'checkin' | 'checkout' | 'checkin_checkout' | 'midstay' | 'regular'
type BT = 'guest' | 'owner'

interface Task {
  date: string
  villaName: string
  type: TaskType
  bookingType: BT
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0') }

function monthBounds(year: number, month: number) {
  const first = `${year}-${pad(month)}-01`
  const last  = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`
  return { first, last }
}

function formatShort(dateStr: string) {
  const [, m, d] = dateStr.split('-').map(Number)
  return `${SHORT_MONTHS[m - 1]} ${d}`
}

function taskLabel(task: Task): string {
  let base: string
  if (task.type === 'checkin')          base = `Check In – ${task.villaName}`
  else if (task.type === 'checkout')    base = `Check Out – ${task.villaName}`
  else if (task.type === 'checkin_checkout') base = `Check Out / Check In – ${task.villaName}`
  else if (task.type === 'regular')     return task.villaName
  else                                  base = `Maid Service – ${task.villaName}`
  return task.bookingType === 'owner' ? `${base} (Owners)` : base
}

function deriveTasks(bookings: BookingRow[], year: number, month: number): Task[] {
  const { first, last } = monthBounds(year, month)
  const tasks: Task[] = []
  const coMap = new Map<string, { checkin: BT | null; checkout: BT | null }>()

  function getEntry(date: string, villa: string) {
    const k = `${date}|${villa}`
    if (!coMap.has(k)) coMap.set(k, { checkin: null, checkout: null })
    return coMap.get(k)!
  }

  for (const b of bookings) {
    const bt = (b.booking_type || 'guest') as BT
    const v = b.villa_name
    if (!v) continue
    if (b.midstay_clean_date && b.midstay_clean_date >= first && b.midstay_clean_date <= last) {
      tasks.push({ date: b.midstay_clean_date, villaName: v, type: 'midstay', bookingType: bt })
    }
    if (b.check_in >= first && b.check_in <= last) getEntry(b.check_in, v).checkin = bt
    if (b.check_out >= first && b.check_out <= last) getEntry(b.check_out, v).checkout = bt
  }

  for (const [key, { checkin, checkout }] of coMap) {
    const pipeIdx = key.indexOf('|')
    const date = key.slice(0, pipeIdx)
    const villaName = key.slice(pipeIdx + 1)
    if (checkin && checkout) tasks.push({ date, villaName, type: 'checkin_checkout', bookingType: checkin })
    else if (checkin)        tasks.push({ date, villaName, type: 'checkin',          bookingType: checkin })
    else if (checkout)       tasks.push({ date, villaName, type: 'checkout',         bookingType: checkout })
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  for (const { name, dayOfWeek } of REGULAR_HOUSES) {
    for (let day = 1; day <= daysInMonth; day++) {
      if (new Date(year, month - 1, day).getDay() === dayOfWeek) {
        tasks.push({ date: `${year}-${pad(month)}-${pad(day)}`, villaName: name, type: 'regular', bookingType: 'guest' })
      }
    }
  }

  return tasks.sort((a, b) =>
    a.date !== b.date ? a.date.localeCompare(b.date) : a.villaName.localeCompare(b.villaName)
  )
}

// ── Styling ────────────────────────────────────────────────────────────────────

const CHIP_COLORS: Record<TaskType, string> = {
  checkin:          'bg-green-100 text-green-800',
  checkout:         'bg-red-100 text-red-800',
  checkin_checkout: 'bg-purple-100 text-purple-800',
  midstay:          'bg-blue-100 text-blue-800',
  regular:          'bg-gray-100 text-gray-700',
}

const DOT_COLORS: Record<TaskType, string> = {
  checkin:          'bg-green-500',
  checkout:         'bg-red-500',
  checkin_checkout: 'bg-purple-500',
  midstay:          'bg-blue-500',
  regular:          'bg-gray-400',
}

const TASK_LABELS: Record<TaskType, string> = {
  checkin:          'Check In',
  checkout:         'Check Out',
  checkin_checkout: 'Check Out / Check In',
  midstay:          'Maid Service',
  regular:          'Regular Clean',
}

function chipText(task: Task): string {
  const villa = task.villaName.split(' ')[0]
  if (task.type === 'regular')          return task.villaName.split("'")[0]
  if (task.type === 'checkin')          return `CI ${villa}`
  if (task.type === 'checkout')         return `CO ${villa}`
  if (task.type === 'checkin_checkout') return `CO/CI ${villa}`
  return `Maid ${villa}`
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function HousekeeperCalendar({ bookings }: { bookings: BookingRow[] }) {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [view, setView]   = useState<'calendar' | 'list'>('calendar')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const tasks = deriveTasks(bookings, year, month)
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month

  const byDay = new Map<number, Task[]>()
  for (const task of tasks) {
    const day = parseInt(task.date.split('-')[2], 10)
    const arr = byDay.get(day) ?? []
    arr.push(task)
    byDay.set(day, arr)
  }

  const firstDay    = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedTasks = selectedDay ? (byDay.get(selectedDay) ?? []) : []

  return (
    <div className="space-y-3">
      {/* Month nav */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <button onClick={prevMonth} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-gray-800">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button onClick={nextMonth} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* View tabs */}
      <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => setView('calendar')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            view === 'calendar' ? 'bg-[#1f5772] text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            view === 'list' ? 'bg-[#1f5772] text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          List
        </button>
      </div>

      {view === 'calendar' ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAY_NAMES.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
            {cells.map((day, i) => {
              const dayTasks = day ? (byDay.get(day) ?? []) : []
              const isToday  = isCurrentMonth && day === now.getDate()
              const isSelected = day === selectedDay
              return (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() => day && setSelectedDay(prev => prev === day ? null : day)}
                  className={`min-h-[72px] p-1 text-left transition-colors ${
                    !day        ? 'bg-gray-50/50 cursor-default'
                    : isSelected ? 'bg-[#1f5772]/5'
                    : 'hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  {day && (
                    <>
                      <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday ? 'bg-[#1f5772] text-white' : isSelected ? 'text-[#1f5772]' : 'text-gray-500'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayTasks.map((task, ti) => (
                          <div
                            key={ti}
                            className={`flex items-center gap-0.5 rounded px-0.5 py-0.5 text-xs leading-tight ${CHIP_COLORS[task.type]}`}
                          >
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[task.type]}`} />
                            <span className="truncate font-medium">{chipText(task)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-gray-100 px-4 py-3">
            {(Object.entries(TASK_LABELS) as [TaskType, string][]).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`h-2 w-2 rounded-full ${DOT_COLORS[type]}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {tasks.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400 italic">No tasks this month.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tasks.map((task, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-14 shrink-0">
                    <p className="text-xs font-semibold text-gray-800">{formatShort(task.date)}</p>
                    <p className="text-xs text-gray-400">{new Date(task.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  </div>
                  <div className={`h-8 w-1 shrink-0 rounded-full ${DOT_COLORS[task.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{task.villaName}</p>
                    <p className={`text-xs ${CHIP_COLORS[task.type].split(' ')[1]}`}>
                      {TASK_LABELS[task.type]}
                      {task.bookingType === 'owner' ? ' — Owners' : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Day detail panel (calendar view) */}
      {view === 'calendar' && selectedDay && selectedTasks.length > 0 && (
        <div className="rounded-xl border border-[#1f5772]/20 bg-[#1f5772]/5 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f5772]/10">
            <p className="text-sm font-semibold text-[#1f5772]">
              {new Date(year, month - 1, selectedDay).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
          <ul className="divide-y divide-[#1f5772]/10">
            {selectedTasks.map((task, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`h-8 w-1 shrink-0 rounded-full ${DOT_COLORS[task.type]}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{task.villaName}</p>
                  <p className="text-xs text-gray-500">
                    {TASK_LABELS[task.type]}
                    {task.bookingType === 'owner' ? ' — Owners' : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
