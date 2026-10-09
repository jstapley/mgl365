import { getServiceSupabase } from '@/lib/supabase'
import InventoryClient from './InventoryClient'

const VILLA_ORDER = ['Cool House', 'Water Edge', 'Starfish Lower', 'Starfish Upper']

export interface InventoryItem {
  id: string
  villa_id: string
  category: string
  name: string
  sort_order: number
  active: boolean
}

export interface CheckEntry {
  item_id: string
  quantity: number
  notes: string | null
}

export interface InventoryCheck {
  id: string
  villa_id: string
  check_date: string
  checked_by: string
  created_at: string
  entries: CheckEntry[]
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ villa?: string }>
}) {
  const { villa: activeVillaId } = await searchParams
  const supabase = getServiceSupabase()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 365)

  const [{ data: villas }, { data: items }, { data: checks }] = await Promise.all([
    supabase.from('villas').select('id, name').eq('active', true).order('name'),
    supabase
      .from('inventory_items')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('inventory_checks')
      .select('*, entries:inventory_check_entries(item_id, quantity, notes)')
      .gte('check_date', cutoff.toISOString().slice(0, 10))
      .order('check_date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const villaList = (villas ?? []).sort((a, b) => {
    const ai = VILLA_ORDER.indexOf(a.name)
    const bi = VILLA_ORDER.indexOf(b.name)
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  const currentVillaId =
    activeVillaId && villaList.find(v => v.id === activeVillaId)
      ? activeVillaId
      : villaList[0]?.id

  const currentVilla = villaList.find(v => v.id === currentVillaId) ?? null
  const currentItems = ((items ?? []) as InventoryItem[]).filter(i => i.villa_id === currentVillaId)
  const currentChecks = ((checks ?? []) as InventoryCheck[]).filter(c => c.villa_id === currentVillaId)

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">Inventory</h1>
      </div>

      {villaList.length > 0 && (
        <div className="flex gap-0 overflow-x-auto border-b border-gray-200">
          {villaList.map(v => (
            <a
              key={v.id}
              href={`/admin/inventory?villa=${v.id}`}
              className={`flex shrink-0 items-center border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                v.id === currentVillaId
                  ? 'border-[#1f5772] text-[#1f5772]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {v.name}
            </a>
          ))}
        </div>
      )}

      {currentVilla ? (
        <div className="overflow-hidden rounded-b rounded-tr border border-t-0 border-gray-200 bg-white">
          <InventoryClient
            villaId={currentVilla.id}
            villaName={currentVilla.name}
            initialChecks={currentChecks}
            items={currentItems}
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
