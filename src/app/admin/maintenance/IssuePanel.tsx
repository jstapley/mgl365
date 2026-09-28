'use client'

import { useState, useTransition, useRef } from 'react'
import { PlusCircle, Trash2, ImageIcon, Upload, ExternalLink } from 'lucide-react'
import { createIssue, resolveIssue, deleteIssue, updateIssueImage } from './actions'

interface Issue {
  id: string
  description: string
  notes: string | null
  created_at: string
  resolved_at: string | null
  image_url: string | null
}

function UploadCell({ issueId, existingUrl, disabled }: { issueId: string; existingUrl: string | null; disabled: boolean }) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(existingUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      // Upload into a maintenance subfolder
      const renamed = new File([file], `maintenance/${Date.now()}-${file.name}`, { type: file.type })
      fd.append('file', renamed)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.url) {
        setUrl(json.url)
        await updateIssueImage(issueId, json.url)
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#1f5772] hover:underline"
        >
          <ImageIcon size={13} />
          <span className="hidden sm:inline">View</span>
          <ExternalLink size={10} />
        </a>
      ) : (
        <span className="text-xs text-gray-300">—</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
        disabled={disabled || uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        title="Upload photo"
        className="flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:border-[#1f5772] hover:text-[#1f5772] disabled:opacity-40 transition-colors"
      >
        <Upload size={11} />
        <span className="hidden sm:inline">{uploading ? 'Uploading…' : url ? 'Replace' : 'Upload'}</span>
      </button>
    </div>
  )
}

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
      if (json.url && imageUrlRef.current) {
        imageUrlRef.current.value = json.url
      }
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

  return (
    <div className="border-t border-gray-100">
      {/* Section header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Open Issues {open.length > 0 && (
            <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-red-700">{open.length}</span>
          )}
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
            placeholder="Issue name…"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
            autoFocus
          />
          <input
            name="notes"
            placeholder="Notes (optional)"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
          />
          {/* Hidden field populated after upload */}
          <input ref={imageUrlRef} type="hidden" name="image_url" />

          {/* Photo upload */}
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoPreview ? (
              <div className="flex items-center gap-3">
                <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded border border-gray-200 object-cover" />
                <div className="text-xs text-gray-500">
                  {uploading ? (
                    <span className="text-amber-600">Uploading…</span>
                  ) : (
                    <span className="text-green-600">Photo ready</span>
                  )}
                  <button
                    type="button"
                    onClick={() => { setPhotoPreview(null); if (imageUrlRef.current) imageUrlRef.current.value = ''; if (photoInputRef.current) photoInputRef.current.value = '' }}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:border-[#1f5772] hover:text-[#1f5772] transition-colors"
              >
                <Upload size={12} />
                Add photo (optional)
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending || uploading}
              className="rounded bg-[#1f5772] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#174560] disabled:opacity-50"
            >
              {isPending ? 'Saving…' : uploading ? 'Uploading…' : 'Add Issue'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setPhotoPreview(null) }}
              className="rounded border border-gray-300 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Open issues table */}
      {open.length === 0 ? (
        <p className="px-4 py-3 text-xs text-gray-400 italic">No open issues</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="w-8 px-4 py-2" />
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Issue</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Notes</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">Date Logged</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Photo</th>
                  <th className="w-8 px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {open.map(issue => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-[#1f5772] cursor-pointer"
                        onChange={() => handleResolve(issue.id)}
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-900">{issue.description}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{issue.notes ?? '—'}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-3 py-3">
                      <UploadCell issueId={issue.id} existingUrl={issue.image_url} disabled={isPending} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(issue.id)}
                        disabled={isPending}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-gray-50 md:hidden">
            {open.map(issue => (
              <li key={issue.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#1f5772] cursor-pointer"
                    onChange={() => handleResolve(issue.id)}
                    disabled={isPending}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{issue.description}</p>
                    {issue.notes && <p className="text-xs text-gray-400 mt-0.5">{issue.notes}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="mt-2">
                      <UploadCell issueId={issue.id} existingUrl={issue.image_url} disabled={isPending} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(issue.id)}
                    disabled={isPending}
                    className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Resolved issues toggle */}
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
                    {issue.notes && <p className="text-xs text-gray-300 mt-0.5">{issue.notes}</p>}
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
