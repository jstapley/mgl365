import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { FileText, ClipboardList, CheckCircle, Clock } from 'lucide-react'

async function getData() {
  const supabase = getServiceSupabase()
  const [villasRes, submissionsRes] = await Promise.all([
    supabase
      .from('liability_forms')
      .select('villa_id, content, updated_at, villas(name)')
      .order('updated_at', { ascending: false }),
    supabase
      .from('onboarding_submissions')
      .select(`
        id, submitted_at, agreed_to_liability,
        interest_spa, interest_tours, interest_wine, interest_transport, interest_chef,
        bookings(check_in, check_out, villas(name), clients(name))
      `)
      .order('submitted_at', { ascending: false })
      .limit(50),
  ])
  return {
    liabilityForms: (villasRes.data ?? []) as any[],
    submissions: (submissionsRes.data ?? []) as any[],
  }
}

export default async function FormsPage() {
  const { liabilityForms, submissions } = await getData()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>

      {/* Liability forms per villa */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <FileText size={16} className="text-[#1f5772]" strokeWidth={1.8} />
          <h2 className="text-sm font-semibold text-gray-700">Liability Forms</h2>
        </div>
        <div className="overflow-hidden rounded border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Villa</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Last Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {liabilityForms.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No villas found. Run the SQL migration first.
                  </td>
                </tr>
              )}
              {liabilityForms.map((lf: any) => {
                const hasContent = lf.content && lf.content.trim().length > 0
                return (
                  <tr key={lf.villa_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {lf.villas?.name ?? 'Unknown Villa'}
                    </td>
                    <td className="px-4 py-3">
                      {hasContent ? (
                        <span className="flex items-center gap-1.5 text-green-700">
                          <CheckCircle size={13} strokeWidth={2} />
                          <span className="text-xs font-medium">Content saved</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <Clock size={13} strokeWidth={2} />
                          <span className="text-xs font-medium">Empty — needs content</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(lf.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/forms/liability?villa=${lf.villa_id}`}
                        className="text-[#1f5772] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Onboarding submissions */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList size={16} className="text-[#1f5772]" strokeWidth={1.8} />
          <h2 className="text-sm font-semibold text-gray-700">Guest Onboarding Submissions</h2>
        </div>
        <div className="overflow-hidden rounded border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Guest</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Villa</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Check-in</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Interests</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No onboarding submissions yet.
                  </td>
                </tr>
              )}
              {submissions.map((s: any) => {
                const interests = [
                  s.interest_spa && 'Spa',
                  s.interest_tours && 'Tours',
                  s.interest_wine && 'Wine',
                  s.interest_transport && 'Transport',
                  s.interest_chef && 'Chef',
                ].filter(Boolean)
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.bookings?.clients?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.bookings?.villas?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.bookings?.check_in
                        ? new Date(s.bookings.check_in).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {interests.length === 0 && <span className="text-gray-400">None</span>}
                        {interests.map((i) => (
                          <span key={i} className="rounded-full bg-[#1f5772]/10 px-2 py-0.5 text-xs font-medium text-[#1f5772]">
                            {i}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(s.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/forms/submissions/${s.id}`} className="text-[#1f5772] hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
