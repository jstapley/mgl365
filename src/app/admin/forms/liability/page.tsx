import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { saveLiabilityForm } from '../actions'

async function getData(villaId: string | undefined) {
  const supabase = getServiceSupabase()

  const { data: villas } = await supabase
    .from('villas')
    .select('id, name')
    .order('name')

  if (!villas || villas.length === 0) notFound()

  const targetVilla = villaId
    ? villas.find((v) => v.id === villaId)
    : villas[0]

  if (!targetVilla) notFound()

  const { data: form } = await supabase
    .from('liability_forms')
    .select('content, updated_at')
    .eq('villa_id', targetVilla.id)
    .single()

  return { villas, targetVilla, form }
}

export default async function LiabilityFormPage({
  searchParams,
}: {
  searchParams: Promise<{ villa?: string }>
}) {
  const { villa: villaId } = await searchParams
  const { villas, targetVilla, form } = await getData(villaId)

  const action = saveLiabilityForm.bind(null, targetVilla.id)

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/forms" className="mb-1 block text-xs text-[#1f5772] hover:underline">
            ← Forms
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Liability Form</h1>
        </div>
      </div>

      {/* Villa selector */}
      <div className="mb-5 flex flex-wrap gap-2">
        {villas.map((v) => (
          <Link
            key={v.id}
            href={`/admin/forms/liability?villa=${v.id}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              v.id === targetVilla.id
                ? 'bg-[#1f5772] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {v.name}
          </Link>
        ))}
      </div>

      <form action={action} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Liability waiver content for <span className="font-semibold">{targetVilla.name}</span>
          </label>
          <p className="mb-3 text-xs text-gray-400">
            This text will appear on the guest onboarding form. Plain text or Markdown is supported.
          </p>
          <textarea
            name="content"
            rows={20}
            defaultValue={form?.content ?? ''}
            placeholder="Enter the liability waiver text here…"
            className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-[#1f5772]"
          />
        </div>

        {form?.updated_at && (
          <p className="text-xs text-gray-400">
            Last saved: {new Date(form.updated_at).toLocaleString()}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
          >
            Save Form
          </button>
          <Link
            href="/admin/forms"
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
