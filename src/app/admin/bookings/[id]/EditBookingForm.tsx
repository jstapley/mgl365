'use client'

import { useActionState } from 'react'
import { updateBooking } from '../actions'
import type { Booking, Villa, Client } from '@/types'

interface Props {
  booking: Booking
  villas: Pick<Villa, 'id' | 'name'>[]
  clients: Pick<Client, 'id' | 'name'>[]
}

export default function EditBookingForm({ booking, villas, clients }: Props) {
  const boundAction = updateBooking.bind(null, booking.id)
  const [error, action, isPending] = useActionState(boundAction, null)

  return (
    <>
      {error && (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={action} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Client</label>
          <select name="client_id" defaultValue={booking.client_id ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— Select client —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Villa</label>
          <select name="villa_id" defaultValue={booking.villa_id ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— Select villa —</option>
            {villas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Check-in *</label>
            <input name="check_in" type="date" required defaultValue={booking.check_in} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Check-out *</label>
            <input name="check_out" type="date" required defaultValue={booking.check_out} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Guests</label>
            <input name="guests" type="number" min="1" defaultValue={booking.guests ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Total Amount (USD)</label>
            <input name="total_amount" type="number" step="0.01" defaultValue={booking.total_amount ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Package</label>
          <select name="package" defaultValue={booking.package ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="">— None —</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
          <select name="status" defaultValue={booking.status} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
          <textarea name="notes" rows={3} defaultValue={booking.notes ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560] disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <a href="/admin/bookings" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </>
  )
}
