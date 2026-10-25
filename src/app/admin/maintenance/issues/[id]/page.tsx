import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { updateIssue, resolveIssue, unresolveIssue, deleteIssueAndRedirect } from '../../actions'
import IssuePhotoUpload from './IssuePhotoUpload'

async function getIssue(id: string) {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('maintenance_issues')
    .select('*, villa:villas(id, name)')
    .eq('id', id)
    .single()
  if (error || !data) notFound()
  return data
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const issue = await getIssue(id)
  const villaId = (issue as any).villa?.id ?? issue.villa_id ?? ''

  const updateAction  = updateIssue.bind(null, id)
  const resolveAction = resolveIssue.bind(null, id)
  const unresolveAction = unresolveIssue.bind(null, id)
  const deleteAction  = deleteIssueAndRedirect.bind(null, id, villaId)

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <Link href={`/admin/maintenance${villaId ? `?villa=${villaId}` : ''}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Maintenance
        </Link>
        {issue.resolved_at ? (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">Resolved</span>
        ) : (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Open</span>
        )}
      </div>

      <h1 className="mb-1 text-2xl font-semibold text-gray-900">{issue.description}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {(issue as any).villa?.name ?? 'No villa'} · Logged {fmtDate(issue.created_at)}
        {issue.resolved_at ? ` · Resolved ${fmtDate(issue.resolved_at)}` : ''}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Status / Resolve panel */}
        <div className={`rounded border p-5 ${issue.resolved_at ? 'border-gray-200 bg-gray-50' : 'border-green-200 bg-green-50'}`}>
          <p className={`mb-3 text-xs font-semibold uppercase tracking-wide ${issue.resolved_at ? 'text-gray-500' : 'text-green-700'}`}>
            {issue.resolved_at ? 'Status' : 'Resolve Issue'}
          </p>
          {issue.resolved_at ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Resolved on {fmtDate(issue.resolved_at)}</p>
              <form action={unresolveAction}>
                <button type="submit" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                  Reopen Issue
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              {issue.scheduled_date && (
                <p className="text-sm text-amber-700">
                  Scheduled {fmtDate(issue.scheduled_date)}
                  {issue.assigned_to ? ` · ${issue.assigned_to}` : ''}
                </p>
              )}
              <form action={resolveAction}>
                <button type="submit" className="w-full rounded bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">
                  ✓ Mark as Resolved
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Edit form */}
        <form action={updateAction} className="space-y-3 rounded border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Edit Issue</p>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Description *</label>
            <input name="description" required defaultValue={issue.description}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
            <textarea name="notes" rows={3} defaultValue={issue.notes ?? ''}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Scheduled date</label>
              <input name="scheduled_date" type="date" defaultValue={issue.scheduled_date ?? ''}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Assigned to</label>
              <input name="assigned_to" defaultValue={issue.assigned_to ?? ''}
                placeholder="e.g. Michel, Contractor"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]" />
            </div>
          </div>
          <button type="submit" className="w-full rounded bg-[#1f5772] py-2 text-sm font-medium text-white hover:bg-[#174560]">
            Save Changes
          </button>
        </form>
      </div>

      {/* Photo */}
      <div className="mt-6 rounded border border-gray-200 bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Photo</p>
        <IssuePhotoUpload issueId={id} existingUrl={issue.image_url} />
      </div>

      {/* Delete */}
      <div className="mt-6 rounded border border-red-100 bg-white p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">Delete</p>
        <p className="mb-3 text-sm text-gray-500">Permanently removes this issue and cannot be undone.</p>
        <form action={deleteAction}>
          <button type="submit" className="rounded border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            Delete Issue
          </button>
        </form>
      </div>
    </div>
  )
}
