'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { BookingRow } from './page'

// ── Constants ──────────────────────────────────────────────────────────────────

const VILLA_ORDER = ['Cool House', 'Water Edge', 'Starfish Lower', 'Starfish Upper']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const WHATSAPP_NUMBER = '12687726084'

// Regular house cleanings: name → day of week (0=Sun, 1=Mon … 6=Sat)
const REGULAR_HOUSES: { name: string; dayOfWeek: number }[] = [
  { name: "Jamie's House",  dayOfWeek: 1 }, // every Monday
  { name: "Michel's House", dayOfWeek: 4 }, // every Thursday
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

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function monthBounds(year: number, month: number) {
  const first = `${year}-${pad(month)}-01`
  const last = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`
  return { first, last }
}

function formatShort(dateStr: string) {
  const [, m, d] = dateStr.split('-').map(Number)
  return `${SHORT_MONTHS[m - 1]} ${d}`
}

function taskLabel(task: Task): string {
  let base: string
  if (task.type === 'checkin') base = `Check In ${task.villaName}`
  else if (task.type === 'checkout') base = `Check Out ${task.villaName}`
  else if (task.type === 'checkin_checkout') base = `Check Out / Check In ${task.villaName}`
  else if (task.type === 'regular') return task.villaName
  else base = `Maid Service ${task.villaName}`
  return task.bookingType === 'owner' ? `${base} — Owners` : base
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
    if (b.check_in >= first && b.check_in <= last) {
      getEntry(b.check_in, v).checkin = bt
    }
    if (b.check_out >= first && b.check_out <= last) {
      getEntry(b.check_out, v).checkout = bt
    }
  }

  for (const [key, { checkin, checkout }] of coMap) {
    const pipeIdx = key.indexOf('|')
    const date = key.slice(0, pipeIdx)
    const villaName = key.slice(pipeIdx + 1)
    if (checkin && checkout) {
      tasks.push({ date, villaName, type: 'checkin_checkout', bookingType: checkin })
    } else if (checkin) {
      tasks.push({ date, villaName, type: 'checkin', bookingType: checkin })
    } else if (checkout) {
      tasks.push({ date, villaName, type: 'checkout', bookingType: checkout })
    }
  }

  // Regular house cleanings
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

function buildWhatsAppText(bookings: BookingRow[], tasks: Task[], year: number, month: number): string {
  const { first, last } = monthBounds(year, month)

  const villaMap = new Map<string, BookingRow[]>()
  for (const b of bookings) {
    if (b.check_out < first || b.check_in > last) continue
    const arr = villaMap.get(b.villa_name) ?? []
    arr.push(b)
    villaMap.set(b.villa_name, arr)
  }

  const summaryLines: string[] = []
  for (const villa of VILLA_ORDER) {
    const bks = villaMap.get(villa)
    if (!bks || bks.length === 0) continue
    const ranges = [...bks]
      .sort((a, b) => a.check_in.localeCompare(b.check_in))
      .map(b => `${formatShort(b.check_in)}–${formatShort(b.check_out)}`)
      .join(' · ')
    summaryLines.push(`${villa}: ${ranges}`)
  }

  const taskLines = tasks.map(t => `${formatShort(t.date)} — ${taskLabel(t)}`)

  return [
    `${MONTH_NAMES[month - 1].toUpperCase()} ${year}`,
    '',
    ...summaryLines,
    '',
    ...taskLines,
  ].join('\n')
}

// ── Badge styling ──────────────────────────────────────────────────────────────

const TASK_COLORS: Record<TaskType, string> = {
  checkin:          'bg-green-100 text-green-700',
  checkout:         'bg-red-100 text-red-700',
  checkin_checkout: 'bg-purple-100 text-purple-700',
  midstay:          'bg-blue-100 text-blue-700',
  regular:          'bg-gray-100 text-gray-600',
}

const TASK_LABELS: Record<TaskType, string> = {
  checkin:          'Check In',
  checkout:         'Check Out',
  checkin_checkout: 'Check Out / Check In',
  midstay:          'Maid Service',
  regular:          'Regular Clean',
}

// Calendar cell dot colors (smaller indicator)
const DOT_COLORS: Record<TaskType, string> = {
  checkin:          'bg-green-500',
  checkout:         'bg-red-500',
  checkin_checkout: 'bg-purple-500',
  midstay:          'bg-blue-500',
  regular:          'bg-gray-400',
}

// ── WhatsApp icon ──────────────────────────────────────────────────────────────

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ── Calendar view ──────────────────────────────────────────────────────────────

function CalendarView({ tasks, year, month }: { tasks: Task[]; year: number; month: number }) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  // Group tasks by day number
  const byDay = new Map<number, Task[]>()
  for (const task of tasks) {
    const day = parseInt(task.date.split('-')[2], 10)
    const arr = byDay.get(day) ?? []
    arr.push(task)
    byDay.set(day, arr)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAY_NAMES.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
        {cells.map((day, i) => {
          const dayTasks = day ? (byDay.get(day) ?? []) : []
          const isToday = isCurrentMonth && day === today.getDate()
          return (
            <div
              key={i}
              className={`min-h-[90px] p-1.5 ${day ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              {day && (
                <>
                  <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday ? 'bg-[#1f5772] text-white' : 'text-gray-500'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayTasks.map((task, ti) => (
                      <div
                        key={ti}
                        className={`flex items-center gap-1 rounded px-1 py-0.5 text-xs leading-tight ${TASK_COLORS[task.type]}`}
                        title={taskLabel(task)}
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[task.type]}`} />
                        <span className="truncate">
                          {task.type === 'regular'
                            ? task.villaName.split("'")[0]
                            : task.type === 'checkin_checkout'
                            ? `CO/CI ${task.villaName.split(' ')[0]}`
                            : task.type === 'checkin'
                            ? `CI ${task.villaName.split(' ')[0]}`
                            : task.type === 'checkout'
                            ? `CO ${task.villaName.split(' ')[0]}`
                            : `Maid ${task.villaName.split(' ')[0]}`}
                          {task.bookingType === 'owner' ? ' (O)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 border-t border-gray-100 px-4 py-3">
        {(Object.entries(TASK_LABELS) as [TaskType, string][]).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-2 w-2 rounded-full ${DOT_COLORS[type]}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function HousekeepingClient({ bookings }: { bookings: BookingRow[] }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const tasks = deriveTasks(bookings, year, month)
  const { first, last } = monthBounds(year, month)

  const villaBookings = VILLA_ORDER.map(villa => {
    const bks = bookings
      .filter(b => b.villa_name === villa && b.check_out >= first && b.check_in <= last)
      .sort((a, b) => a.check_in.localeCompare(b.check_in))
    return { villa, bks }
  }).filter(v => v.bks.length > 0)

  function handleWhatsApp() {
    const text = buildWhatsAppText(bookings, tasks, year, month)
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4">
      {/* Month nav + WhatsApp */}
      <div className="flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-3">
        <button onClick={prevMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-gray-800">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button onClick={nextMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Villa summary */}
      {villaBookings.length > 0 && (
        <div className="rounded border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bookings This Month</p>
          </div>
          <div className="divide-y divide-gray-50">
            {villaBookings.map(({ villa, bks }) => (
              <div key={villa} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5">
                <span className="text-sm font-medium text-gray-800 shrink-0">{villa}</span>
                <span className="text-xs text-gray-400">
                  {bks.map(b => `${formatShort(b.check_in)}–${formatShort(b.check_out)}`).join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule card with tabs */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4">
          <div className="flex">
            <button
              onClick={() => setView('calendar')}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                view === 'calendar'
                  ? 'border-[#1f5772] text-[#1f5772]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                view === 'list'
                  ? 'border-[#1f5772] text-[#1f5772]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              List
            </button>
          </div>
          {tasks.length > 0 && (
            <button
              onClick={handleWhatsApp}
              title="Send via WhatsApp"
              className="flex items-center gap-1.5 rounded px-2 py-1 text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
            >
              <WhatsAppIcon size={20} />
              <span className="text-xs font-medium">Send</span>
            </button>
          )}
        </div>

        {tasks.length === 0 && view === 'list' ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400 italic">No housekeeping tasks this month.</p>
        ) : view === 'calendar' ? (
          <CalendarView tasks={tasks} year={year} month={month} />
        ) : (
          <ul className="divide-y divide-gray-50">
            {tasks.map((task, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-16 shrink-0 text-xs font-medium text-gray-500">
                  {formatShort(task.date)}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TASK_COLORS[task.type]}`}>
                  {TASK_LABELS[task.type]}
                </span>
                <span className="text-sm text-gray-800">{task.villaName}</span>
                {task.bookingType === 'owner' && (
                  <span className="ml-auto text-xs text-amber-600 font-medium shrink-0">Owners</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
