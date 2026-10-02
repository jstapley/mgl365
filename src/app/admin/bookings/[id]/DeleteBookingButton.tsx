'use client'

import { useTransition } from 'react'
import { deleteBooking } from '../actions'

export default function DeleteBookingButton({ id, clientName }: { id: string; clientName: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Delete booking for "${clientName}"? This cannot be undone.`)) return
    startTransition(() => deleteBooking(id))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? 'Deleting…' : 'Delete Booking'}
    </button>
  )
}
