'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
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

// ── Types ──────────────────────────────────────────────────────────────────────

type TaskType = 'checkin' | 'checkout' | 'checkin_checkout' | 'midstay'
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

  return tasks.sort((a, b) =>
    a.date !== b.date ? a.date.localeCompare(b.date) : a.villaName.localeCompare(b.villaName)
  )
}

function buildWhatsApp(bookings: BookingRow[], tasks: Task[], year: number, month: number): string {
  const { first, last } = monthBounds(year, month)

  // Villa summary — bookings overlapping the month
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

// ── Task badge ─────────────────────────────────────────────────────────────────

const TASK_COLORS: Record<TaskType, string> = {
  checkin: 'bg-green-100 text-green-700',
  checkout: 'bg-red-100 text-red-700',
  checkin_checkout: 'bg-purple-100 text-purple-700',
  midstay: 'bg-blue-100 text-blue-700',
}

const TASK_LABELS: Record<TaskType, string> = {
  checkin: 'Check In',
  checkout: 'Check Out',
  checkin_checkout: 'Check Out / Check In',
  midstay: 'Maid Service',
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function HousekeepingClient({ bookings }: { bookings: BookingRow[] }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [copied, setCopied] = useState(false)

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

  // Villa summary for display
  const villaBookings = VILLA_ORDER.map(villa => {
    const bks = bookings.filter(b => b.villa_name === villa && b.check_out >= first && b.check_in <= last)
      .sort((a, b) => a.check_in.localeCompare(b.check_in))
    return { villa, bks }
  }).filter(v => v.bks.length > 0)

  async function handleCopy() {
    const text = buildWhatsApp(bookings, tasks, year, month)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Month nav */}
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

      {/* Task list */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Schedule
            {tasks.length > 0 && <span className="ml-1.5 font-normal normal-case text-gray-400">({tasks.length} task{tasks.length !== 1 ? 's' : ''})</span>}
          </p>
          {tasks.length > 0 && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-[#1f5772] hover:text-[#1f5772] transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy for WhatsApp'}
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400 italic">No housekeeping tasks this month.</p>
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
