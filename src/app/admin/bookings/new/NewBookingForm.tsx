'use client'

import { useActionState } from 'react'
import { createBooking } from '../actions'

interface Props {
  villas: { id: string; name: string }[]
  clients: { id: string; name: string }[]
}

export default function NewBookingForm({ villas, clients }: Props) {
  const [error, action, isPending] = useActionState(createBooking, null)

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Add Booking</h1>

      {error && (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={action} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Client</label>
          <select name="client_id" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— Select client —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Villa</label>
          <select name="villa_id" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— Select villa —</option>
            {villas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Check-in *</label>
            <input name="check_in" type="date" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Check-out *</label>
            <input name="check_out" type="date" required className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Guests</label>
            <input name="guests" type="number" min="1" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Total Amount (USD)</label>
            <input name="total_amount" type="number" step="0.01" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Package</label>
          <select name="package" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— None —</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
          <select name="status" defaultValue="pending" className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
          <textarea name="notes" rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560] disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Create Booking'}
          </button>
          <a href="/admin/bookings" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
