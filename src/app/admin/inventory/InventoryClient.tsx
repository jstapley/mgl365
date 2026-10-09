'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusCircle, ChevronLeft, Trash2, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown, TrendingUp, TrendingDown, Pencil,
} from 'lucide-react'
import {
  saveInventoryCheck, updateInventoryCheck, deleteInventoryCheck,
  saveInventoryItem, deleteInventoryItem, moveInventoryItem,
} from './actions'
import type { InventoryItem, CheckEntry, InventoryCheck } from './page'

const INSPECTORS = ['Jamie', 'Michel', 'Luka', 'Jess', 'Other']

function fmt(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function fmtShort(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtTime(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function totalQty(entries: CheckEntry[]) {
  return entries.reduce((sum, e) => sum + e.quantity, 0)
}

function groupByCategory(items: InventoryItem[]): [string, InventoryItem[]][] {
  const map = new Map<string, InventoryItem[]>()
  for (const item of items) {
    if (!map.has(item.category)) map.set(item.category, [])
    map.get(item.category)!.push(item)
  }
  return Array.from(map.entries())
}

function buildEntryMap(entries: CheckEntry[]): Map<string, CheckEntry> {
  return new Map(entries.map(e => [e.item_id, e]))
}

function computeDeltas(current: CheckEntry[], previous: CheckEntry[]): Map<string, number> {
  const prevMap = new Map(previous.map(e => [e.item_id, e.quantity]))
  return new Map(current.map(e => [e.item_id, e.quantity - (prevMap.get(e.item_id) ?? 0)]))
}

// ── CollapsibleSection ─────────────────────────────────────────────────────────

function CollapsibleSection({
  label,
  badge,
  defaultOpen = false,
  children,
}: {
  label: string
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-100">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-2.5 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          {badge}
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && children}
    </div>
  )
}

// ── DeltaBadge ─────────────────────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number | undefined }) {
  if (delta === undefined || delta === 0) return null
  if (delta > 0) return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
      <TrendingUp size={10} />+{delta}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
      <TrendingDown size={10} />{delta}
    </span>
  )
}

// ── SubTabs ────────────────────────────────────────────────────────────────────

function SubTabs({
  tab,
  onChange,
}: {
  tab: 'history' | 'manage'
  onChange: (t: 'history' | 'manage') => void
}) {
  return (
    <div className="flex border-b border-gray-200 bg-white">
      {(['history', 'manage'] as const).map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            tab === t
              ? 'border-b-2 border-[#1f5772] text-[#1f5772]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t === 'history' ? 'Check History' : 'Manage Items'}
        </button>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function InventoryClient({
  villaId,
  villaName,
  initialChecks,
  items,
}: {
  villaId: string
  villaName: string
  initialChecks: InventoryCheck[]
  items: InventoryItem[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [tab, setTab] = useState<'history' | 'manage'>('history')
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list')
  const [selected, setSelected] = useState<InventoryCheck | null>(null)
  const [editTarget, setEditTarget] = useState<InventoryCheck | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Sort newest first — secondary sort by created_at when dates are the same
  const checks = useMemo(
    () => [...initialChecks].sort((a, b) => {
      const dateCmp = b.check_date.localeCompare(a.check_date)
      if (dateCmp !== 0) return dateCmp
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }),
    [initialChecks]
  )

  // Precompute totals + delta vs previous check for the list view
  const checkRows = useMemo(() =>
    checks.map((check, idx) => {
      const previous = idx + 1 < checks.length ? checks[idx + 1] : null
      const current = totalQty(check.entries)
      const prev = previous ? totalQty(previous.entries) : null
      const delta = prev !== null ? current - prev : null
      return { check, current, prev, delta }
    }),
    [checks]
  )

  const latest = checks[0] ?? null
  const [checkDate, setCheckDate] = useState(new Date().toISOString().slice(0, 10))
  const [checkedBy, setCheckedBy] = useState(INSPECTORS[0])
  const [checkedByOther, setCheckedByOther] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Manage items state
  const [newCategory, setNewCategory] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [manageError, setManageError] = useState<string | null>(null)

  const categories = useMemo(() => groupByCategory(items), [items])
  const existingCategories = useMemo(() => categories.map(([cat]) => cat), [categories])

  function handleTabChange(t: 'history' | 'manage') {
    setTab(t)
    setView('list')
  }

  function handleStartNew() {
    setEditTarget(null)
    setCheckDate(new Date().toISOString().slice(0, 10))
    setCheckedBy(INSPECTORS[0])
    setCheckedByOther('')
    setSaveError(null)
    const latestMap = latest ? buildEntryMap(latest.entries) : new Map()
    const initQty: Record<string, number> = {}
    for (const item of items) {
      initQty[item.id] = latestMap.get(item.id)?.quantity ?? 0
    }
    setQuantities(initQty)
    setView('form')
  }

  function handleStartEdit(check: InventoryCheck) {
    setEditTarget(check)
    setCheckDate(check.check_date)
    const inspector = INSPECTORS.includes(check.checked_by) ? check.checked_by : 'Other'
    setCheckedBy(inspector)
    setCheckedByOther(inspector === 'Other' ? check.checked_by : '')
    setSaveError(null)
    const entryMap = buildEntryMap(check.entries)
    const initQty: Record<string, number> = {}
    for (const item of items) {
      initQty[item.id] = entryMap.get(item.id)?.quantity ?? 0
    }
    setQuantities(initQty)
    setView('form')
  }

  function setQty(itemId: string, val: number) {
    setQuantities(q => ({ ...q, [itemId]: Math.max(0, val) }))
  }

  function handleSave() {
    const name = checkedBy === 'Other' ? checkedByOther.trim() || 'Other' : checkedBy
    setSaveError(null)
    const entries = items.map(item => ({ item_id: item.id, quantity: quantities[item.id] ?? 0 }))
    startTransition(async () => {
      const err = editTarget
        ? await updateInventoryCheck(editTarget.id, { check_date: checkDate, checked_by: name, entries })
        : await saveInventoryCheck(villaId, { check_date: checkDate, checked_by: name, entries })
      if (err) { setSaveError(err); return }
      setView('list')
      router.refresh()
    })
  }

  function handleDeleteCheck(id: string) {
    if (!confirm('Delete this inventory check?')) return
    startTransition(async () => {
      await deleteInventoryCheck(id)
      if (selected?.id === id) setView('list')
      router.refresh()
    })
  }

  function handleAddItem() {
    if (!newCategory.trim() || !newItemName.trim()) return
    setManageError(null)
    startTransition(async () => {
      const err = await saveInventoryItem(villaId, {
        category: newCategory.trim(),
        name: newItemName.trim(),
      })
      if (err) { setManageError(err); return }
      setNewItemName('')
      router.refresh()
    })
  }

  function handleDeleteItem(id: string) {
    if (!confirm('Delete this item? All historical quantity data for this item will also be deleted.')) return
    startTransition(async () => {
      await deleteInventoryItem(id)
      router.refresh()
    })
  }

  function handleMoveItem(id: string, direction: 'up' | 'down', category: string) {
    startTransition(async () => {
      await moveInventoryItem(id, direction, villaId, category)
      router.refresh()
    })
  }

  // ── History: list ───────────────────────────────────────────────────────────
  if (tab === 'history' && view === 'list') {
    return (
      <div>
        <SubTabs tab={tab} onChange={handleTabChange} />
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last 12 Months</p>
          <button
            onClick={handleStartNew}
            className="flex items-center gap-1 text-xs text-[#1f5772] hover:underline"
          >
            <PlusCircle size={13} />
            New Check
          </button>
        </div>

        {checkRows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-400 italic text-center">
            No inventory checks recorded yet.
          </p>
        ) : (
          <>
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-1.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <span>Date &amp; Inspector</span>
              <span className="text-right">Previous</span>
              <span className="text-right">Current</span>
              <span className="text-right w-16">Delta</span>
              <span />
            </div>
            <ul className="divide-y divide-gray-100">
              {checkRows.map(({ check, current, prev, delta }) => {
                const hasDelta = delta !== null && delta !== 0
                const rowBg = hasDelta
                  ? delta < 0 ? 'bg-red-50/60' : 'bg-green-50/60'
                  : ''
                return (
                  <li key={check.id} className={`${rowBg} hover:brightness-95 transition-all`}>
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      {/* Clickable main area */}
                      <button
                        className="flex-1 min-w-0 text-left"
                        onClick={() => { setSelected(check); setView('detail') }}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-800">
                            {fmtShort(check.check_date)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {fmtTime(check.created_at)}
                          </span>
                          <span className="text-xs text-gray-400">· {check.checked_by}</span>
                        </div>

                        {/* Mobile: counts on second line */}
                        <div className="flex items-center gap-3 mt-0.5 md:hidden">
                          {prev !== null ? (
                            <span className="text-xs text-gray-500">
                              <span className="text-gray-400">{prev}</span>
                              <span className="mx-1 text-gray-300">→</span>
                              <span className="font-semibold text-gray-700">{current}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">{current} items</span>
                          )}
                          {hasDelta && (
                            <DeltaBadge delta={delta!} />
                          )}
                        </div>
                      </button>

                      {/* Desktop: count columns */}
                      <div className="hidden md:flex items-center gap-4 shrink-0">
                        <span className="text-sm text-gray-400 w-16 text-right font-mono">
                          {prev !== null ? prev : '—'}
                        </span>
                        <span className="text-sm font-semibold text-gray-800 w-16 text-right font-mono">
                          {current}
                        </span>
                        <span className="w-16 text-right">
                          {hasDelta ? <DeltaBadge delta={delta!} /> : <span className="text-xs text-gray-300">—</span>}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteCheck(check.id)}
                        disabled={isPending}
                        className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    )
  }

  // ── History: detail ─────────────────────────────────────────────────────────
  if (tab === 'history' && view === 'detail' && selected) {
    const idx = checks.findIndex(c => c.id === selected.id)
    const previous = idx >= 0 && idx + 1 < checks.length ? checks[idx + 1] : null
    const deltas = previous ? computeDeltas(selected.entries, previous.entries) : new Map<string, number>()
    const entryMap = buildEntryMap(selected.entries)
    const changedCount = Array.from(deltas.values()).filter(d => d !== 0).length

    return (
      <div>
        <SubTabs tab={tab} onChange={handleTabChange} />
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {fmt(selected.check_date)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleStartEdit(selected)}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-[#1f5772] hover:underline"
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              onClick={() => handleDeleteCheck(selected.id)}
              disabled={isPending}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            Checked by: <span className="font-medium text-gray-800">{selected.checked_by}</span>
          </p>
          {previous ? (
            changedCount > 0 ? (
              <span className="text-xs text-amber-600 font-medium">
                {changedCount} change{changedCount !== 1 ? 's' : ''} vs previous
              </span>
            ) : (
              <span className="text-xs text-gray-400">No changes vs previous</span>
            )
          ) : (
            <span className="text-xs text-gray-400 italic">First check — no comparison</span>
          )}
        </div>

        {categories.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 italic text-center">No items in catalog.</p>
        ) : (
          categories.map(([cat, catItems], i) => {
            const catChanges = catItems.filter(item => {
              const d = deltas.get(item.id)
              return d !== undefined && d !== 0
            }).length
            return (
              <CollapsibleSection
                key={cat}
                label={cat}
                defaultOpen={i === 0 || catChanges > 0}
                badge={catChanges > 0 ? (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                    {catChanges} changed
                  </span>
                ) : undefined}
              >
                <table className="w-full text-sm">
                  <tbody>
                    {catItems.map(item => {
                      const entry = entryMap.get(item.id)
                      const qty = entry?.quantity ?? 0
                      const delta = deltas.get(item.id)
                      const hasChange = delta !== undefined && delta !== 0
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-50 ${hasChange ? 'bg-amber-50/50' : ''}`}
                        >
                          <td className="px-4 py-2 text-gray-700">{item.name}</td>
                          <td className="px-4 py-2 text-right font-mono font-semibold text-gray-900 w-16">{qty}</td>
                          <td className="px-4 py-2 text-right w-24">
                            <DeltaBadge delta={delta} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CollapsibleSection>
            )
          })
        )}
      </div>
    )
  }

  // ── History: new check form ─────────────────────────────────────────────────
  if (tab === 'history' && view === 'form') {
    return (
      <div>
        <SubTabs tab={tab} onChange={handleTabChange} />
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {editTarget ? `Edit Check — ${fmt(editTarget.check_date)}` : `New Inventory Check — ${villaName}`}
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-4 px-4 py-3 border-b border-gray-100">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={checkDate}
              onChange={e => setCheckDate(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Checked by</label>
            <select
              value={checkedBy}
              onChange={e => setCheckedBy(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772] bg-white"
            >
              {INSPECTORS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          {checkedBy === 'Other' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={checkedByOther}
                onChange={e => setCheckedByOther(e.target.value)}
                placeholder="Enter name…"
                className="rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]"
              />
            </div>
          )}
        </div>

        {!editTarget && latest && (
          <p className="px-4 pt-3 pb-1 text-xs text-gray-400">
            Pre-filled from {fmt(latest.check_date)} — update quantities as needed.
          </p>
        )}

        {categories.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 italic text-center">
            No items in catalog. Add items in the Manage Items tab first.
          </p>
        ) : (
          categories.map(([cat, catItems], i) => (
            <CollapsibleSection key={cat} label={cat} defaultOpen={i === 0}>
              <table className="w-full text-sm">
                <tbody>
                  {catItems.map(item => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="px-4 py-2.5 text-gray-700">{item.name}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQty(item.id, (quantities[item.id] ?? 0) - 1)}
                            className="h-7 w-7 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-base leading-none"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={quantities[item.id] ?? 0}
                            onChange={e => setQty(item.id, parseInt(e.target.value) || 0)}
                            className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-sm font-mono outline-none focus:border-[#1f5772]"
                          />
                          <button
                            type="button"
                            onClick={() => setQty(item.id, (quantities[item.id] ?? 0) + 1)}
                            className="h-7 w-7 rounded border border-gray-300 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-base leading-none"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CollapsibleSection>
          ))
        )}

        {saveError && <p className="px-4 pb-2 text-xs text-red-600">{saveError}</p>}

        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            disabled={isPending || !checkDate || items.length === 0}
            className="rounded bg-[#1f5772] px-5 py-2 text-sm font-medium text-white hover:bg-[#174560] disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : editTarget ? 'Save Changes' : 'Save Inventory Check'}
          </button>
        </div>
      </div>
    )
  }

  // ── Manage items ────────────────────────────────────────────────────────────
  if (tab === 'manage') {
    return (
      <div>
        <SubTabs tab={tab} onChange={handleTabChange} />

        {/* Add item */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Add Item</p>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <input
                type="text"
                list="inv-category-list"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="e.g. Linens"
                className="rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772] w-36"
              />
              <datalist id="inv-category-list">
                {existingCategories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Item name</label>
              <input
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                placeholder="e.g. Bath Towels"
                className="rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772] w-48"
              />
            </div>
            <button
              onClick={handleAddItem}
              disabled={isPending || !newCategory.trim() || !newItemName.trim()}
              className="flex items-center gap-1 rounded bg-[#1f5772] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#174560] disabled:opacity-50 transition-colors"
            >
              <PlusCircle size={13} />
              Add
            </button>
          </div>
          {manageError && <p className="mt-1 text-xs text-red-600">{manageError}</p>}
        </div>

        {/* Item list */}
        {categories.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-400 italic text-center">
            No items yet. Add your first item above.
          </p>
        ) : (
          categories.map(([cat, catItems]) => (
            <CollapsibleSection key={cat} label={cat} defaultOpen>
              <ul className="divide-y divide-gray-50">
                {catItems.map((item, idx) => (
                  <li key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => handleMoveItem(item.id, 'up', cat)}
                        disabled={isPending || idx === 0}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveItem(item.id, 'down', cat)}
                        disabled={isPending || idx === catItems.length - 1}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                    <p className="flex-1 text-sm text-gray-700">{item.name}</p>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={isPending}
                      className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          ))
        )}
      </div>
    )
  }

  return null
}
