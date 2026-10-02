'use client'

import { useState, useTransition } from 'react'
import { deleteBooking } from '../actions'

export default function DeleteBookingButton({ id, clientName }: { id: string; clientName: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    if (!confirm(`Delete booking for "${clientName}"? This cannot be undone.`)) return
    setError(null)
    startTransition(async () => {
      const err = await deleteBooking(id)
      if (err) setError(err)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? 'Deleting…' : 'Delete Booking'}
      </button>
    </div>
  )
}
