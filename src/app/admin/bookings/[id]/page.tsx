import { notFound } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import { updateBookingStatus } from '../actions'
import BookingStatusBadge from '@/components/admin/BookingStatusBadge'
import EditBookingForm from './EditBookingForm'
import ResendEmailButtons from './ResendEmailButton'
import type { Booking, Villa, Client, BookingStatus } from '@/types'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import DeleteBookingButton from './DeleteBookingButton'

async function getBooking(id: string): Promise<Booking> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, villa:villas(id,name), client:clients(id,name)')
    .eq('id', id)
    .single()
  if (error || !data) notFound()
  return data as Booking
}

async function getOptions() {
  const supabase = getServiceSupabase()
  const [{ data: villas }, { data: clients }] = await Promise.all([
    supabase.from('villas').select('id, name').order('name'),
    supabase.from('clients').select('id, name').order('name'),
  ])
  return {
    villas: (villas ?? []) as Pick<Villa, 'id' | 'name'>[],
    clients: (clients ?? []) as Pick<Client, 'id' | 'name'>[],
  }
}

async function getSubmission(bookingId: string) {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('onboarding_submissions')
    .select(`
      id, submitted_at, agreed_to_liability,
      liability_signed_name, liability_signed_date,
      liability_signature, liability_content_snapshot,
      interest_spa, interest_tours, interest_excursions, interest_wine,
      interest_transport, interest_chef, interest_provisioning,
      selected_activities, num_guests, arrival_flight, arrival_datetime,
      departure_flight, departure_datetime, guest_notes
    `)
    .eq('booking_id', bookingId)
    .single()
  return data ?? null
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
  imported:  'bg-blue-100 text-blue-600',
}

const INTEREST_LABELS: { key: string; label: string }[] = [
  { key: 'interest_spa',          label: 'Spa Services' },
  { key: 'interest_tours',        label: 'Barefoot Tours' },
  { key: 'interest_excursions',   label: 'Excursions' },
  { key: 'interest_wine',         label: 'Wine List' },
  { key: 'interest_transport',    label: 'Transport' },
  { key: 'interest_chef',         label: 'Private Chef' },
  { key: 'interest_provisioning', label: 'Provisioning' },
]

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [booking, { villas, clients }, submission] = await Promise.all([
    getBooking(id),
    getOptions(),
    getSubmission(id),
  ])

  const selectedActivities: { id: string; name: string; price?: number; duration?: string; notes?: string }[] =
    (submission as any)?.selected_activities ?? []

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/bookings" className="text-sm text-gray-500 hover:text-gray-700">← Bookings</Link>
        <BookingStatusBadge status={booking.status} />
      </div>

      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Booking — {booking.client?.name ?? 'Unknown'}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">

        {/* Left col — actions + edit form */}
        <div className="space-y-5">
          {/* Email actions */}
          <ResendEmailButtons bookingId={id} />

          {/* Quick status update */}
          <div className="flex flex-wrap gap-2">
            {(['pending', 'confirmed', 'cancelled', 'completed'] as BookingStatus[]).map((s) => (
              <form key={s} action={updateBookingStatus.bind(null, id, s)}>
                <button
                  type="submit"
                  disabled={booking.status === s}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-40 ${STATUS_STYLES[s]} border border-transparent`}
                >
                  Mark {s}
                </button>
              </form>
            ))}
          </div>

          <EditBookingForm booking={booking} villas={villas} clients={clients} />
          <div className="mt-3 flex justify-end">
            <DeleteBookingButton id={id} clientName={booking.client?.name ?? 'this booking'} />
          </div>
        </div>

        {/* Right col — onboarding submission */}
        <div className="rounded border border-gray-200 bg-white p-6">
          {!submission ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center text-gray-400">
              <ClipboardList size={28} strokeWidth={1.5} className="mb-2 opacity-40" />
              <p className="text-sm font-medium text-gray-500">No onboarding submission yet</p>
              <p className="mt-1 text-xs text-gray-400">This will appear once the guest completes the pre-arrival form.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Onboarding Submission
                </p>
                <p className="text-xs text-gray-400">
                  Submitted {new Date((submission as any).submitted_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>

              {/* Arrival info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {(submission as any).num_guests && (
                  <div>
                    <span className="text-gray-400">Guests</span>
                    <p className="font-medium text-gray-800">{(submission as any).num_guests}</p>
                  </div>
                )}
                {((submission as any).arrival_flight || (submission as any).arrival_datetime) && (
                  <div>
                    <span className="text-gray-400">Arrival</span>
                    <p className="font-medium text-gray-800">
                      {(submission as any).arrival_flight}
                      {(submission as any).arrival_datetime && (
                        <span className="block font-normal text-gray-500">
                          {new Date((submission as any).arrival_datetime).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: 'numeric', minute: '2-digit',
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {((submission as any).departure_flight || (submission as any).departure_datetime) && (
                  <div>
                    <span className="text-gray-400">Departure</span>
                    <p className="font-medium text-gray-800">
                      {(submission as any).departure_flight}
                      {(submission as any).departure_datetime && (
                        <span className="block font-normal text-gray-500">
                          {new Date((submission as any).departure_datetime).toLocaleString('en-US', {
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
                  <p className={`font-medium ${(submission as any).agreed_to_liability ? 'text-green-700' : 'text-red-600'}`}>
                    {(submission as any).agreed_to_liability ? 'Agreed' : 'Not agreed'}
                  </p>
                </div>
              </div>

              {/* Signed waiver record */}
              {(submission as any).agreed_to_liability && (
                <div className="rounded border border-gray-100 bg-gray-50 p-3 text-xs space-y-2">
                  <p className="font-semibold text-gray-600">Signed Waiver Record</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(submission as any).liability_signed_name && (
                      <div>
                        <span className="text-gray-400">Signed by</span>
                        <p className="font-medium text-gray-800">{(submission as any).liability_signed_name}</p>
                      </div>
                    )}
                    {(submission as any).liability_signed_date && (
                      <div>
                        <span className="text-gray-400">Date signed</span>
                        <p className="font-medium text-gray-800">
                          {new Date((submission as any).liability_signed_date).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  {(submission as any).liability_signature && (
                    <div>
                      <span className="text-gray-400">Signature</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={(submission as any).liability_signature}
                        alt="Guest signature"
                        className="mt-1 h-14 w-full rounded border border-gray-200 bg-white object-contain"
                      />
                    </div>
                  )}
                  {(submission as any).liability_content_snapshot && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[#1f5772] hover:underline">
                        View waiver text at time of signing
                      </summary>
                      <div className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-gray-200 bg-white p-3 text-gray-600 leading-relaxed">
                        {(submission as any).liability_content_snapshot}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Service interests */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">Service Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_LABELS.filter(({ key }) => (submission as any)[key]).map(({ label }) => (
                    <span key={label} className="rounded-full bg-[#1f5772]/10 px-2.5 py-0.5 text-xs font-medium text-[#1f5772]">
                      {label}
                    </span>
                  ))}
                  {INTEREST_LABELS.every(({ key }) => !(submission as any)[key]) && (
                    <span className="text-xs text-gray-400">None selected</span>
                  )}
                </div>
              </div>

              {/* Selected activities */}
              {selectedActivities.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">Selected Activities</p>
                  <ul className="space-y-2">
                    {selectedActivities.map((act, i) => (
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
              {(submission as any).guest_notes && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-500">Guest Notes</p>
                  <p className="whitespace-pre-wrap text-xs text-gray-700">{(submission as any).guest_notes}</p>
                </div>
              )}

              <Link
                href={`/admin/forms/submissions/${(submission as any).id}`}
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
