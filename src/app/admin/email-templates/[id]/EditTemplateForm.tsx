'use client'

import { useActionState } from 'react'
import { updateEmailTemplate } from '../actions'

export default function EditTemplateForm({ template }: { template: any }) {
  const [error, action, isPending] = useActionState(
    updateEmailTemplate.bind(null, template.id),
    null
  )

  return (
    <form action={action} className="space-y-5">
      <div className="rounded border border-gray-200 bg-white p-5 space-y-4">

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Active</label>
          <input
            type="checkbox"
            name="active"
            defaultChecked={template.active}
            className="h-4 w-4 rounded border-gray-300 accent-[#1f5772]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Template Name</label>
          <input
            name="name"
            defaultValue={template.name}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Subject Line</label>
          <input
            name="subject"
            defaultValue={template.subject}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Email Body</label>
          <p className="mb-1.5 text-xs text-gray-400">
            Use variables like {'{{guest_name}}'}, {'{{villa_name}}'}, {'{{check_in}}'}, {'{{check_out}}'}, {'{{booking_link}}'}.
          </p>
          <textarea
            name="body"
            defaultValue={template.body}
            required
            rows={16}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-[#1f5772]"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-[#1f5772] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#174560] disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save Template'}
      </button>
    </form>
  )
}
