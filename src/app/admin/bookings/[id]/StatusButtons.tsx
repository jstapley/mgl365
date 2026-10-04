'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBookingStatus } from '../actions'
import type { BookingStatus } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
  imported:  'bg-blue-100 text-blue-600',
}

export default function StatusButtons({ bookingId, currentStatus }: { bookingId: string; currentStatus: BookingStatus }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<string | null>(null)

  function handleClick(status: BookingStatus) {
    setError(null)
    setActive(status)
    startTransition(async () => {
      try {
        await updateBookingStatus(bookingId, status)
        router.refresh()
      } catch (e: any) {
        setError(e?.message ?? 'Something went wrong')
      } finally {
        setActive(null)
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(['pending', 'confirmed', 'cancelled', 'completed'] as BookingStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleClick(s)}
            disabled={isPending || currentStatus === s}
            className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-40 ${STATUS_STYLES[s]} border border-transparent`}
          >
            {isPending && active === s ? 'Saving…' : `Mark ${s}`}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-600">Error: {error}</p>
      )}
    </div>
  )
}
