import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { CheckCircle, XCircle } from 'lucide-react'

async function getSubmission(id: string) {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('onboarding_submissions')
    .select(`
      *,
      bookings(
        check_in, check_out,
        villas(name),
        clients(name, email, phone)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) notFound()
  return data as any
}

const INTEREST_LABELS: Record<string, string> = {
  interest_spa:           'Spa Services',
  interest_tours:         'Barefoot Tours',
  interest_wine:          'Wine List',
  interest_transport:     'Transport',
  interest_chef:          'Private Chef',
  interest_provisioning:  'Provisioning',
  interest_miscellaneous: 'Miscellaneous',
}

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="flex items-center gap-1 text-green-700">
      <CheckCircle size={13} strokeWidth={2} /> Yes
    </span>
  ) : (
    <span className="flex items-center gap-1 text-gray-400">
      <XCircle size={13} strokeWidth={2} /> No
    </span>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-700">{value}</dd>
    </div>
  )
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const s = await getSubmission(id)

  const client = s.bookings?.clients
  const villa = s.bookings?.villas?.name ?? '—'
  const checkIn = s.bookings?.check_in
  const checkOut = s.bookings?.check_out

  const interests = Object.entries(INTEREST_LABELS).filter(([key]) => s[key] === true)

  type Activity = { id: string; name: string; price?: number; duration?: string; notes?: string }
  const selectedActivities: Activity[] = s.selected_activities ?? []

  const fmtDatetime = (val: string | null) =>
    val ? new Date(val).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: 'numeric', minute: '2-digit',
    }) : null

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/forms" className="mb-1 block text-xs text-[#1f5772] hover:underline">
          ← Forms
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Onboarding Submission</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          Submitted {new Date(s.submitted_at).toLocaleString()}
        </p>
      </div>

      <div className="space-y-5">

        {/* ── Guest & Booking ── */}
        <section className="rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Guest &amp; Booking
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Guest" value={<span className="font-medium text-gray-900">{client?.name ?? '—'}</span>} />
            <Field label="Villa" value={villa} />
            <Field label="Email" value={client?.email ?? '—'} />
            <Field label="Phone" value={client?.phone ?? '—'} />
            <Field label="Check-in" value={checkIn ? new Date(checkIn).toLocaleDateString() : '—'} />
            <Field label="Check-out" value={checkOut ? new Date(checkOut).toLocaleDateString() : '—'} />
            {s.num_guests != null && (
              <Field label="Total guests" value={s.num_guests} />
            )}
            {s.num_guests_under_6 != null && (
              <Field label="Guests under age 6" value={s.num_guests_under_6} />
            )}
            {s.arrival_flight && (
              <Field label="Arrival flight" value={s.arrival_flight} />
            )}
            {s.arrival_datetime && (
              <Field label="Arrival date & time" value={fmtDatetime(s.arrival_datetime)} />
            )}
            {s.departure_flight && (
              <Field label="Departure flight" value={s.departure_flight} />
            )}
            {s.departure_datetime && (
              <Field label="Departure date & time" value={fmtDatetime(s.departure_datetime)} />
            )}
          </dl>
        </section>

        {/* ── Liability ── */}
        <section className="rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Liability Waiver
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <BoolBadge value={s.agreed_to_liability} />
            <span className="text-gray-600">
              {s.agreed_to_liability ? 'Guest agreed to liability waiver' : 'Not yet agreed'}
            </span>
          </div>
          {s.liability_signed_name && (
            <p className="mt-2 text-sm text-gray-600">
              Signed by: <span className="font-medium">{s.liability_signed_name}</span>
              {s.liability_signed_date && ` on ${s.liability_signed_date}`}
            </p>
          )}
        </section>

        {/* ── Service Interests ── */}
        <section className="rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Service Interests
          </h2>
          {interests.length === 0 ? (
            <p className="text-sm text-gray-400">No interests selected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map(([, label]) => (
                <span key={label} className="rounded-full bg-[#1f5772]/10 px-3 py-1 text-xs font-medium text-[#1f5772]">
                  {label}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Selected Activities ── */}
        {selectedActivities.length > 0 && (
          <section className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Selected Activities
            </h2>
            <ul className="divide-y divide-gray-100">
              {selectedActivities.map((act) => (
                <li key={act.id} className="py-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium text-gray-900">{act.name}</span>
                    {act.price != null && (
                      <span className="text-xs text-gray-500">${act.price}</span>
                    )}
                    {act.duration && (
                      <span className="text-xs text-gray-400">— {act.duration}</span>
                    )}
                  </div>
                  {act.notes && (
                    <p className="mt-1 text-xs text-gray-500">
                      <span className="font-medium text-gray-600">Requested dates/notes:</span> {act.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Chef Special Event ── */}
        {s.chef_special_event === 'on' && (
          <section className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Chef — Special Event
            </h2>
            <p className="text-sm text-gray-700">
              {s.chef_special_event_desc || 'Guest requested a special event quote (no description provided).'}
            </p>
          </section>
        )}

        {/* ── Transport / Car Insurance ── */}
        {s.car_insurance && (
          <section className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Transport — Car Insurance
            </h2>
            <p className="text-sm text-gray-700">
              Optional car insurance:{' '}
              <span className={`font-semibold ${s.car_insurance === 'yes' ? 'text-green-700' : 'text-gray-500'}`}>
                {s.car_insurance === 'yes' ? 'Yes — quote requested' : 'No'}
              </span>
            </p>
          </section>
        )}

        {/* ── Wine Selection ── */}
        {s.wine_notes && (
          <section className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Wine Selection
            </h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{s.wine_notes}</p>
          </section>
        )}

        {/* ── Provisioning / Groceries ── */}
        {(s.grocery_items || s.grocery_notes) && (
          <section className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Provisioning — Grocery Request
            </h2>
            {s.grocery_items && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-medium text-gray-400">Selected items</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.grocery_items.split(', ').map((item: string) => (
                    <span key={item} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {s.grocery_notes && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-400">Special requests</p>
                <p className="whitespace-pre-wrap text-sm text-gray-700">{s.grocery_notes}</p>
              </div>
            )}
          </section>
        )}

        {/* ── Guest Notes ── */}
        {s.guest_notes && (
          <section className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Guest Notes
            </h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{s.guest_notes}</p>
          </section>
        )}

      </div>
    </div>
  )
}
