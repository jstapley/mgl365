import { getServiceSupabase } from '@/lib/supabase'
import Link from 'next/link'
import ChecklistClient from './ChecklistClient'

const VILLA_ORDER = ['Cool House', 'Water Edge', 'Starfish Lower', 'Starfish Upper']

interface Inspection {
  id: string
  inspection_date: string
  checked_by: string
  checked_by_other: string | null
  responses: Record<string, Record<string, unknown>>
  created_at: string
}

async function getData(activeVillaId?: string) {
  const supabase = getServiceSupabase()
  const { data: villas } = await supabase.from('villas').select('id, name').eq('active', true)

  const sortedVillas = [...(villas ?? [])].sort((a, b) => {
    const ai = VILLA_ORDER.indexOf(a.name)
    const bi = VILLA_ORDER.indexOf(b.name)
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  const currentId =
    activeVillaId && sortedVillas.find(v => v.id === activeVillaId)
      ? activeVillaId
      : sortedVillas[0]?.id

  let inspections: Inspection[] = []
  if (currentId) {
    const { data } = await supabase
      .from('inspections')
      .select('id, inspection_date, checked_by, checked_by_other, responses, created_at')
      .eq('villa_id', currentId)
      .order('inspection_date', { ascending: false })
      .limit(10)
    inspections = (data ?? []) as Inspection[]
  }

  return { sortedVillas, currentId, inspections }
}

export default async function ChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ villa?: string }>
}) {
  const { villa: activeVillaId } = await searchParams
  const { sortedVillas, currentId, inspections } = await getData(activeVillaId)
  const currentVilla = sortedVillas.find(v => v.id === currentId)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">Inspection Checklist</h1>
      </div>

      {sortedVillas.length > 0 && (
        <div className="mb-0 flex gap-0 overflow-x-auto border-b border-gray-200">
          {sortedVillas.map(villa => {
            const isActive = villa.id === currentId
            return (
              <Link
                key={villa.id}
                href={`/admin/checklist?villa=${villa.id}`}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#1f5772] text-[#1f5772]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {villa.name}
              </Link>
            )
          })}
        </div>
      )}

      {currentVilla ? (
        <div className="overflow-hidden rounded-b rounded-tr border border-t-0 border-gray-200 bg-white">
          <ChecklistClient
            villaId={currentVilla.id}
            villaName={currentVilla.name}
            initialInspections={inspections}
          />
        </div>
      ) : (
        <div className="rounded border border-gray-200 bg-white px-4 py-12 text-center text-gray-400">
          No active villas found.
        </div>
      )}
    </div>
  )
}
