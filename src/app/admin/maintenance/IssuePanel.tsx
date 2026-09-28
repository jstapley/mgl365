'use client'

import { useState, useTransition, useRef } from 'react'
import { PlusCircle, Trash2 } from 'lucide-react'
import { createIssue, resolveIssue, deleteIssue } from './actions'

interface Issue {
  id: string
  description: string
  notes: string | null
  created_at: string
  resolved_at: string | null
}

export default function IssuePanel({ villaId, initialIssues }: { villaId: string; initialIssues: Issue[] }) {
  const [showForm, setShowForm] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const open = initialIssues.filter(i => !i.resolved_at)
  const resolved = initialIssues.filter(i => i.resolved_at)

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createIssue(villaId, formData)
      formRef.current?.reset()
      setShowForm(false)
    })
  }

  function handleResolve(id: string) {
    startTransition(() => resolveIssue(id))
  }

  function handleDelete(id: string) {
    startTransition(() => deleteIssue(id))
  }

  return (
    <div className="border-t border-gray-100">
      {/* Section header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Open Issues {open.length > 0 && <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-red-700">{open.length}</span>}
        </p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 text-xs text-[#1f5772] hover:underline"
        >
          <PlusCircle size={13} />
          Add Issue
        </button>
      </div>

      {/* Add issue form */}
      {showForm && (
        <form ref={formRef} action={handleCreate} className="border-b border-gray-100 bg-blue-50 px-4 py-3 space-y-2">
          <input
            name="description"
            required
            placeholder="Describe the issue…"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
            autoFocus
          />
          <input
            name="notes"
            placeholder="Additional notes (optional)"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-[#1f5772] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#174560] disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Add Issue'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-gray-300 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Open issues list */}
      {open.length === 0 ? (
        <p className="px-4 py-3 text-xs text-gray-400 italic">No open issues</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {open.map(issue => (
            <li key={issue.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#1f5772] cursor-pointer"
                onChange={() => handleResolve(issue.id)}
                disabled={isPending}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{issue.description}</p>
                {issue.notes && <p className="text-xs text-gray-400 mt-0.5">{issue.notes}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  Logged {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(issue.id)}
                disabled={isPending}
                className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Show resolved toggle */}
      {resolved.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2">
          <button
            onClick={() => setShowResolved(v => !v)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {showResolved ? 'Hide' : 'Show'} {resolved.length} resolved issue{resolved.length !== 1 ? 's' : ''}
          </button>
          {showResolved && (
            <ul className="mt-2 divide-y divide-gray-50">
              {resolved.map(issue => (
                <li key={issue.id} className="flex items-start gap-3 py-2">
                  <input type="checkbox" checked readOnly className="mt-0.5 h-4 w-4 shrink-0 accent-[#1f5772]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 line-through">{issue.description}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Resolved {new Date(issue.resolved_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(issue.id)}
                    disabled={isPending}
                    className="shrink-0 text-gray-200 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
