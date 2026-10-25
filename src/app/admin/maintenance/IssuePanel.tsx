'use client'

import { useState, useTransition, useRef } from 'react'
import { PlusCircle, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'
import { createIssue, resolveIssue, deleteIssue } from './actions'

interface Issue {
  id: string
  description: string
  notes: string | null
  created_at: string
  resolved_at: string | null
  image_url: string | null
  scheduled_date: string | null
  assigned_to: string | null
}

const inputCls = 'w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]'

export default function IssuePanel({ villaId, initialIssues }: { villaId: string; initialIssues: Issue[] }) {
  const [showForm, setShowForm] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const imageUrlRef = useRef<HTMLInputElement>(null)

  const open = initialIssues.filter(i => !i.resolved_at)
  const resolved = initialIssues.filter(i => i.resolved_at)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData()
      const renamed = new File([file], `maintenance/${Date.now()}-${file.name}`, { type: file.type })
      fd.append('file', renamed)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url && imageUrlRef.current) imageUrlRef.current.value = json.url
    } finally {
      setUploading(false)
    }
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createIssue(villaId, formData)
      formRef.current?.reset()
      setShowForm(false)
      setPhotoPreview(null)
    })
  }

  function handleResolve(id: string) {
    startTransition(() => resolveIssue(id))
  }

  function handleDelete(id: string) {
    startTransition(() => deleteIssue(id))
  }

  function fmtDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="border-t border-gray-100">
      {/* Section header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Open Issues {open.length > 0 && (
            <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-red-700">{open.length}</span>
          )}
        </p>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 text-xs text-[#1f5772] hover:underline">
          <PlusCircle size={13} />
          Add Issue
        </button>
      </div>

      {/* Add issue form */}
      {showForm && (
        <form ref={formRef} action={handleCreate} className="border-b border-gray-100 bg-blue-50 px-4 py-3 space-y-2">
          <input name="description" required placeholder="Issue description…"
            className={inputCls} autoFocus />
          <input name="notes" placeholder="Notes (optional)" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Scheduled date</label>
              <input name="scheduled_date" type="date" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Assigned to</label>
              <input name="assigned_to" placeholder="e.g. Michel, Contractor" className={inputCls} />
            </div>
          </div>
          {/* Hidden field populated after upload */}
          <input ref={imageUrlRef} type="hidden" name="image_url" />
          <div>
            <input ref={photoInputRef} type="file" accept="image/*" capture="environment"
              className="hidden" onChange={handlePhotoChange} />
            {photoPreview ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded border border-gray-200 object-cover" />
                <div className="text-xs text-gray-500">
                  {uploading ? (
                    <span className="text-amber-600">Uploading…</span>
                  ) : (
                    <span className="text-green-600">Photo ready</span>
                  )}
                  <button type="button"
                    onClick={() => { setPhotoPreview(null); if (imageUrlRef.current) imageUrlRef.current.value = ''; if (photoInputRef.current) photoInputRef.current.value = '' }}
                    className="ml-2 text-gray-400 hover:text-red-500">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:border-[#1f5772] hover:text-[#1f5772] transition-colors">
                <Upload size={12} />
                Add photo (optional)
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending || uploading}
              className="rounded bg-[#1f5772] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#174560] disabled:opacity-50">
              {isPending ? 'Saving…' : uploading ? 'Uploading…' : 'Add Issue'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setPhotoPreview(null) }}
              className="rounded border border-gray-300 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Open issues */}
      {open.length === 0 ? (
        <p className="px-4 py-3 text-xs text-gray-400 italic">No open issues</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {open.map(issue => (
            <div key={issue.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
              <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#1f5772] cursor-pointer"
                onChange={() => handleResolve(issue.id)} disabled={isPending} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{issue.description}</p>
                {issue.notes && <p className="text-xs text-gray-500 mt-0.5">{issue.notes}</p>}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                  <span>Logged {fmtDate(issue.created_at)}</span>
                  {issue.scheduled_date && (
                    <span className="text-amber-600 font-medium">Scheduled {fmtDate(issue.scheduled_date)}</span>
                  )}
                  {issue.assigned_to && (
                    <span>Assigned: {issue.assigned_to}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/admin/maintenance/issues/${issue.id}`}
                  className="text-xs text-[#1f5772] hover:underline">
                  View
                </Link>
                <button onClick={() => handleDelete(issue.id)} disabled={isPending}
                  className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved issues toggle */}
      {resolved.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2">
          <button onClick={() => setShowResolved(v => !v)}
            className="text-xs text-gray-400 hover:text-gray-600">
            {showResolved ? 'Hide' : 'Show'} {resolved.length} resolved issue{resolved.length !== 1 ? 's' : ''}
          </button>
          {showResolved && (
            <div className="mt-2 divide-y divide-gray-50">
              {resolved.map(issue => (
                <div key={issue.id} className="flex items-start gap-3 py-2">
                  <input type="checkbox" checked readOnly className="mt-0.5 h-4 w-4 shrink-0 accent-[#1f5772]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 line-through">{issue.description}</p>
                    {issue.notes && <p className="text-xs text-gray-300 mt-0.5">{issue.notes}</p>}
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-300">
                      <span>Resolved {fmtDate(issue.resolved_at!)}</span>
                      {issue.assigned_to && <span>· {issue.assigned_to}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/admin/maintenance/issues/${issue.id}`}
                      className="text-xs text-gray-400 hover:text-[#1f5772] hover:underline">
                      View
                    </Link>
                    <button onClick={() => handleDelete(issue.id)} disabled={isPending}
                      className="text-gray-200 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
