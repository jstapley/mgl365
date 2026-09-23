import { getServiceSupabase } from '@/lib/supabase'
import { updateContactStatus } from './actions'
import type { ContactSubmission, ContactStatus } from '@/types'

const STATUS_STYLES: Record<ContactStatus, string> = {
  unread:  'bg-blue-100 text-blue-700',
  read:    'bg-gray-100 text-gray-600',
  replied: 'bg-green-100 text-green-700',
}

async function getSubmissions(): Promise<ContactSubmission[]> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export default async function ContactPage() {
  const submissions = await getSubmissions()
  const unread = submissions.filter((s) => s.status === 'unread').length

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Contact Submissions</h1>
        {unread > 0 && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {unread} unread
          </span>
        )}
      </div>

      <div className="space-y-3">
        {submissions.length === 0 && (
          <p className="rounded border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
            No submissions yet.
          </p>
        )}
        {submissions.map((s) => (
          <div
            key={s.id}
            className={`rounded border bg-white p-5 ${s.status === 'unread' ? 'border-blue-200' : 'border-gray-200'}`}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">
                  {s.email}
                  {s.phone && <> · {s.phone}</>}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {new Date(s.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[s.status]}`}>
                  {s.status}
                </span>
                {s.status !== 'replied' && (
                  <form action={updateContactStatus.bind(null, s.id, s.status === 'unread' ? 'read' : 'replied')}>
                    <button type="submit" className="text-xs text-[#1f5772] hover:underline">
                      Mark {s.status === 'unread' ? 'read' : 'replied'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p className="text-sm leading-6 text-gray-700">{s.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
