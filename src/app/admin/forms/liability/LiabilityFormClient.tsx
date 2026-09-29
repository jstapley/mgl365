'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { saveLiabilityForm } from '../actions'

interface Props {
  villaId: string
  villaName: string
  initialContent: string
  updatedAt: string | null
}

export default function LiabilityFormClient({ villaId, villaName, initialContent, updatedAt }: Props) {
  const action = saveLiabilityForm.bind(null, villaId)
  const [error, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4 rounded border border-gray-200 bg-white p-6">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Liability waiver content for <span className="font-semibold">{villaName}</span>
        </label>
        <p className="mb-3 text-xs text-gray-400">
          This text will appear on the guest onboarding form. Plain text or Markdown is supported.
        </p>
        <textarea
          name="content"
          rows={20}
          defaultValue={initialContent}
          placeholder="Enter the liability waiver text here…"
          className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-[#1f5772]"
        />
      </div>

      {updatedAt && (
        <p className="text-xs text-gray-400">
          Last saved: {new Date(updatedAt).toLocaleString()}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560] disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Form'}
        </button>
        <Link
          href="/admin/forms"
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
