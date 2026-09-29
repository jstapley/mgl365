import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import LiabilityFormClient from './LiabilityFormClient'

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
    .maybeSingle()

  return { villas, targetVilla, form }
}

export default async function LiabilityFormPage({
  searchParams,
}: {
  searchParams: Promise<{ villa?: string }>
}) {
  const { villa: villaId } = await searchParams
  const { villas, targetVilla, form } = await getData(villaId)

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

      <LiabilityFormClient
        villaId={targetVilla.id}
        villaName={targetVilla.name}
        initialContent={form?.content ?? ''}
        updatedAt={form?.updated_at ?? null}
      />
    </div>
  )
}
