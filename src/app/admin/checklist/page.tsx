import { getServiceSupabase } from '@/lib/supabase'
import Link from 'next/link'
import ChecklistClient from './ChecklistClient'

const VILLA_ORDER = ['Cool House', 'Water Edge', 'Starfish Lower', 'Starfish Upper']

interface ChecklistItem {
  id: string
  label: string
  sort_order: number
}

interface SnapshotResult {
  item_label: string
  checked: boolean
  notes: string | null
}

interface Snapshot {
  id: string
  snapshot_date: string
  notes: string | null
  booking_id: string | null
  checklist_results: SnapshotResult[]
}

async function getData() {
  const supabase = getServiceSupabase()
  const [{ data: villas }, { data: items }, { data: snapshots }] = await Promise.all([
    supabase.from('villas').select('id, name').eq('active', true).order('name'),
    supabase.from('checklist_items').select('id, villa_id, label, sort_order').eq('active', true).order('sort_order'),
    supabase
      .from('checklist_snapshots')
      .select('id, villa_id, snapshot_date, notes, booking_id, checklist_results(item_label, checked, notes)')
      .order('snapshot_date', { ascending: false }),
  ])
  return {
    villas: (villas ?? []) as { id: string; name: string }[],
    items: (items ?? []) as (ChecklistItem & { villa_id: string })[],
    snapshots: (snapshots ?? []) as (Snapshot & { villa_id: string })[],
  }
}

export default async function ChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ villa?: string }>
}) {
  const { villa: activeVillaId } = await searchParams
  const { villas, items, snapshots } = await getData()

  // Sort villas by defined order
  const sortedVillas = [...villas].sort((a, b) => {
    const ai = VILLA_ORDER.indexOf(a.name)
    const bi = VILLA_ORDER.indexOf(b.name)
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  const currentId = activeVillaId && villas.find(v => v.id === activeVillaId)
    ? activeVillaId
    : sortedVillas[0]?.id

  const currentVilla = sortedVillas.find(v => v.id === currentId)
  const villaItems = items.filter(i => i.villa_id === currentId)
  const villaSnapshots = snapshots.filter(s => s.villa_id === currentId)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">Checklist</h1>
      </div>

      {/* Villa tabs — scrollable on mobile */}
      {sortedVillas.length > 0 && (
        <div className="mb-0 flex gap-0 overflow-x-auto border-b border-gray-200">
          {sortedVillas.map(villa => {
            const isActive = villa.id === currentId
            const openCount = snapshots
              .filter(s => s.villa_id === villa.id)
              .slice(0, 1).length  // just for indicator; could show incomplete etc.
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
            initialItems={villaItems}
            initialSnapshots={villaSnapshots}
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
