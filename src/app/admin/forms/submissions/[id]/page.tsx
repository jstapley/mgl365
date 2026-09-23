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
  interest_spa:          'Spa Services',
  interest_tours:        'Barefoot Tours',
  interest_wine:         'Wine List',
  interest_transport:    'Transport',
  interest_chef:         'Private Chef',
  interest_provisioning: 'Provisioning',
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

  const interests = Object.entries(INTEREST_LABELS).filter(
    ([key]) => s[key] === true
  )

  const selectedActivities: { id: string; name: string; notes?: string }[] =
    s.selected_activities ?? []

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
        {/* Guest & booking info */}
        <section className="rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Guest &amp; Booking
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-gray-400">Guest</dt>
              <dd className="font-medium text-gray-900">
                {client?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Villa</dt>
              <dd className="text-gray-700">{villa}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Email</dt>
              <dd className="text-gray-700">{client?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Phone</dt>
              <dd className="text-gray-700">{client?.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Check-in</dt>
              <dd className="text-gray-700">
                {checkIn ? new Date(checkIn).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Check-out</dt>
              <dd className="text-gray-700">
                {checkOut ? new Date(checkOut).toLocaleDateString() : '—'}
              </dd>
            </div>
            {s.num_guests != null && (
              <div>
                <dt className="text-xs text-gray-400">Number of guests</dt>
                <dd className="text-gray-700">{s.num_guests}</dd>
              </div>
            )}
            {s.arrival_flight && (
              <div>
                <dt className="text-xs text-gray-400">Arrival flight</dt>
                <dd className="text-gray-700">{s.arrival_flight}</dd>
              </div>
            )}
            {s.departure_flight && (
              <div>
                <dt className="text-xs text-gray-400">Departure flight</dt>
                <dd className="text-gray-700">{s.departure_flight}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Liability */}
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
        </section>

        {/* Interests */}
        <section className="rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Service Interests
          </h2>
          {interests.length === 0 ? (
            <p className="text-sm text-gray-400">No interests selected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map(([, label]) => (
                <span
                  key={label}
                  className="rounded-full bg-[#1f5772]/10 px-3 py-1 text-xs font-medium text-[#1f5772]"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Activity selections */}
        {selectedActivities.length > 0 && (
          <section className="rounded border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Selected Activities
            </h2>
            <ul className="divide-y divide-gray-100">
              {selectedActivities.map((act) => (
                <li key={act.id} className="py-2 text-sm">
                  <span className="font-medium text-gray-900">{act.name}</span>
                  {act.notes && (
                    <span className="ml-2 text-gray-500">— {act.notes}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Guest notes */}
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
