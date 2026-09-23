import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { updateClient } from '../actions'
import type { Client } from '@/types'
import { CheckCircle, XCircle, ClipboardList } from 'lucide-react'

async function getClient(id: string): Promise<Client> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return data
}

async function getClientBookings(clientId: string) {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('bookings')
    .select(`
      id, check_in, check_out, status, total_amount,
      villa:villas(id, name),
      onboarding_submissions(
        id, submitted_at, agreed_to_liability,
        liability_signed_name, liability_signed_date,
        liability_signature, liability_content_snapshot,
        interest_spa, interest_tours, interest_wine,
        interest_transport, interest_chef, interest_provisioning,
        selected_activities, num_guests, arrival_flight, arrival_datetime,
        departure_flight, departure_datetime, guest_notes
      )
    `)
    .eq('client_id', clientId)
    .order('check_in', { ascending: false })
  return data ?? []
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
}

const INTEREST_LABELS: { key: string; label: string }[] = [
  { key: 'interest_spa',          label: 'Spa Services' },
  { key: 'interest_tours',        label: 'Barefoot Tours' },
  { key: 'interest_wine',         label: 'Wine List' },
  { key: 'interest_transport',    label: 'Transport' },
  { key: 'interest_chef',         label: 'Private Chef' },
  { key: 'interest_provisioning', label: 'Provisioning' },
]

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ booking?: string }>
}) {
  const { id } = await params
  const { booking: selectedBookingId } = await searchParams

  const [client, bookings] = await Promise.all([getClient(id), getClientBookings(id)])
  const action = updateClient.bind(null, id)

  const selectedBooking = selectedBookingId
    ? (bookings as any[]).find((b) => b.id === selectedBookingId)
    : null
  const submission = selectedBooking?.onboarding_submissions?.[0] ?? null
  const selectedActivities: { id: string; name: string; notes?: string }[] =
    submission?.selected_activities ?? []

  return (
    <div className="max-w-6xl">
      <Link href="/admin/clients" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Clients
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900">{client.name}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1.4fr]">

        {/* Col 1 — Client info */}
        <form action={action} className="space-y-4 rounded border border-gray-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Client Info</p>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Name *</label>
            <input name="name" required defaultValue={client.name} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
            <input name="email" type="email" defaultValue={client.email ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
            <input name="phone" type="tel" defaultValue={client.phone ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nationality</label>
            <input name="nationality" defaultValue={client.nationality ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
            <textarea name="notes" rows={3} defaultValue={client.notes ?? ''} className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <button type="submit" className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]">
            Save Changes
          </button>
        </form>

        {/* Col 2 — Bookings */}
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Bookings</p>
            <Link href="/admin/bookings/new" className="text-xs text-[#1f5772] hover:underline">
              + Add booking
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-gray-400">No bookings yet.</p>
          ) : (
            <ul className="space-y-2">
              {(bookings as any[]).map((b) => {
                const hasSubmission = b.onboarding_submissions?.length > 0
                const isSelected = b.id === selectedBookingId
                return (
                  <li key={b.id}>
                    <Link
                      href={`/admin/clients/${id}?booking=${b.id}`}
                      className={`block rounded border p-3 transition-colors ${
                        isSelected
                          ? 'border-[#1f5772] bg-[#1f5772]/5'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {b.villa?.name ?? 'Unknown villa'}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[b.status]}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {b.check_in} → {b.check_out}
                        {b.total_amount != null && <> · ${b.total_amount.toLocaleString()}</>}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        {hasSubmission ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <ClipboardList size={11} strokeWidth={2} />
                            Onboarding submitted
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No onboarding yet</span>
                        )}
                        <span className="text-xs text-[#1f5772]">
                          {isSelected ? 'Viewing ↑' : 'View details →'}
                        </span>
                      </div>
                    </Link>
                    <div className="mt-1 text-right">
                      <Link href={`/admin/bookings/${b.id}`} className="text-xs text-gray-400 hover:text-[#1f5772] hover:underline">
                        Edit booking
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Col 3 — Onboarding submission detail */}
        <div className="rounded border border-gray-200 bg-white p-6">
          {!selectedBooking ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center text-gray-400">
              <ClipboardList size={28} strokeWidth={1.5} className="mb-2 opacity-40" />
              <p className="text-sm">Select a booking to view<br />onboarding details</p>
            </div>
          ) : !submission ? (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {selectedBooking.villa?.name}
              </p>
              <p className="text-sm text-gray-500">No onboarding submission for this booking yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {selectedBooking.villa?.name}
                </p>
                <p className="text-xs text-gray-400">
                  Submitted {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>

              {/* Arrival info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {submission.num_guests && (
                  <div>
                    <span className="text-gray-400">Guests</span>
                    <p className="font-medium text-gray-800">{submission.num_guests}</p>
                  </div>
                )}
                {(submission.arrival_flight || submission.arrival_datetime) && (
                  <div>
                    <span className="text-gray-400">Arrival</span>
                    <p className="font-medium text-gray-800">
                      {submission.arrival_flight}
                      {submission.arrival_datetime && (
                        <span className="block font-normal text-gray-500">
                          {new Date(submission.arrival_datetime).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: 'numeric', minute: '2-digit',
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {(submission.departure_flight || submission.departure_datetime) && (
                  <div>
                    <span className="text-gray-400">Departure</span>
                    <p className="font-medium text-gray-800">
                      {submission.departure_flight}
                      {submission.departure_datetime && (
                        <span className="block font-normal text-gray-500">
                          {new Date(submission.departure_datetime).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: 'numeric', minute: '2-digit',
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Liability waiver</span>
                  <p className={`font-medium ${submission.agreed_to_liability ? 'text-green-700' : 'text-red-600'}`}>
                    {submission.agreed_to_liability ? 'Agreed' : 'Not agreed'}
                  </p>
                </div>
              </div>

              {/* Signed waiver record */}
              {submission.agreed_to_liability && (
                <div className="rounded border border-gray-100 bg-gray-50 p-3 text-xs space-y-2">
                  <p className="font-semibold text-gray-600">Signed Waiver Record</p>
                  <div className="grid grid-cols-2 gap-2">
                    {submission.liability_signed_name && (
                      <div>
                        <span className="text-gray-400">Signed by</span>
                        <p className="font-medium text-gray-800">{submission.liability_signed_name}</p>
                      </div>
                    )}
                    {submission.liability_signed_date && (
                      <div>
                        <span className="text-gray-400">Date signed</span>
                        <p className="font-medium text-gray-800">
                          {new Date(submission.liability_signed_date).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  {submission.liability_signature && (
                    <div>
                      <span className="text-gray-400">Signature</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={submission.liability_signature}
                        alt="Guest signature"
                        className="mt-1 h-14 w-full rounded border border-gray-200 bg-white object-contain"
                      />
                    </div>
                  )}
                  {submission.liability_content_snapshot && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[#1f5772] hover:underline">
                        View waiver text at time of signing
                      </summary>
                      <div className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-gray-200 bg-white p-3 text-gray-600 leading-relaxed">
                        {submission.liability_content_snapshot}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Interests */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">Service Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_LABELS.filter(({ key }) => submission[key]).map(({ label }) => (
                    <span key={label} className="rounded-full bg-[#1f5772]/10 px-2.5 py-0.5 text-xs font-medium text-[#1f5772]">
                      {label}
                    </span>
                  ))}
                  {INTEREST_LABELS.every(({ key }) => !submission[key]) && (
                    <span className="text-xs text-gray-400">None selected</span>
                  )}
                </div>
              </div>

              {/* Selected activities */}
              {selectedActivities.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">Selected Activities</p>
                  <ul className="space-y-2">
                    {selectedActivities.map((act: any, i: number) => (
                      <li key={act.id ?? i} className="rounded border border-gray-100 bg-gray-50 px-3 py-2 text-xs">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-medium text-gray-900">{act.name}</p>
                          <div className="flex shrink-0 items-baseline gap-1.5 text-gray-400">
                            {act.price != null && (
                              <span className="font-medium text-gray-600">${act.price}</span>
                            )}
                            {act.duration && (
                              <span>· {act.duration}</span>
                            )}
                          </div>
                        </div>
                        {act.notes && (
                          <p className="mt-0.5 text-gray-500">{act.notes}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guest notes */}
              {submission.guest_notes && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-500">Guest Notes</p>
                  <p className="whitespace-pre-wrap text-xs text-gray-700">{submission.guest_notes}</p>
                </div>
              )}

              <Link
                href={`/admin/forms/submissions/${submission.id}`}
                className="block text-right text-xs text-[#1f5772] hover:underline"
              >
                Full submission →
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
