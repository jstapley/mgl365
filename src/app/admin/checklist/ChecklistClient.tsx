'use client'

import { useState, useTransition, useRef } from 'react'
import { PlusCircle, Trash2, CheckSquare, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react'
import { createItem, deleteItem, updateItemLabel, createSnapshot, deleteSnapshot } from './actions'

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

interface Props {
  villaId: string
  initialItems: ChecklistItem[]
  initialSnapshots: Snapshot[]
}

export default function ChecklistClient({ villaId, initialItems, initialSnapshots }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [checks, setChecks] = useState<Record<string, { checked: boolean; notes: string }>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const addFormRef = useRef<HTMLFormElement>(null)
  const snapshotFormRef = useRef<HTMLFormElement>(null)

  const today = new Date().toISOString().slice(0, 10)

  function toggleCheck(label: string) {
    setChecks(prev => ({
      ...prev,
      [label]: { checked: !prev[label]?.checked, notes: prev[label]?.notes ?? '' },
    }))
  }

  function handleSubmitSnapshot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const items = initialItems.map(item => ({
      label: item.label,
      checked: !!checks[item.label]?.checked,
      notes: checks[item.label]?.notes,
    }))
    startTransition(async () => {
      await createSnapshot(villaId, items, formData)
      setChecks({})
      snapshotFormRef.current?.reset()
    })
  }

  function handleAddItem(formData: FormData) {
    startTransition(async () => {
      await createItem(villaId, formData)
      addFormRef.current?.reset()
      setShowForm(false)
    })
  }

  function handleDeleteItem(id: string) {
    startTransition(() => deleteItem(id))
  }

  function handleSaveLabel(id: string) {
    if (!editValue.trim()) return
    startTransition(async () => {
      await updateItemLabel(id, editValue.trim())
      setEditingId(null)
    })
  }

  function handleDeleteSnapshot(id: string) {
    if (!confirm('Delete this checklist snapshot?')) return
    startTransition(() => deleteSnapshot(id))
  }

  const checkedCount = initialItems.filter(i => checks[i.label]?.checked).length

  return (
    <div>
      {/* Checklist form */}
      <form ref={snapshotFormRef} onSubmit={handleSubmitSnapshot}>
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Pre-Checkin Checklist
            {initialItems.length > 0 && (
              <span className="ml-2 font-normal normal-case text-gray-400">
                {checkedCount}/{initialItems.length} checked
              </span>
            )}
          </p>
        </div>

        {initialItems.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400 italic">No checklist items yet. Add items below.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {initialItems.map(item => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 rounded border-gray-300 accent-[#1f5772] cursor-pointer"
                  checked={!!checks[item.label]?.checked}
                  onChange={() => toggleCheck(item.label)}
                />
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveLabel(item.id); if (e.key === 'Escape') setEditingId(null) }}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-[#1f5772]"
                        autoFocus
                      />
                      <button type="button" onClick={() => handleSaveLabel(item.id)} disabled={isPending} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                    </div>
                  ) : (
                    <span className={`text-sm ${checks[item.label]?.checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  )}
                </div>
                {editingId !== item.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setEditingId(item.id); setEditValue(item.label) }}
                      className="text-gray-300 hover:text-gray-500"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={isPending}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Snapshot metadata + save */}
        {initialItems.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input
                  name="snapshot_date"
                  type="date"
                  defaultValue={today}
                  required
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]"
                />
              </div>
              <div className="flex-1 min-w-40">
                <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                <input
                  name="notes"
                  placeholder="Any notes about this inspection…"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || initialItems.length === 0}
              className="flex items-center gap-1.5 rounded bg-[#1f5772] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#174560] disabled:opacity-50"
            >
              <CheckSquare size={13} />
              {isPending ? 'Saving…' : 'Save Snapshot'}
            </button>
          </div>
        )}
      </form>

      {/* Add item form */}
      <div className="border-t border-gray-100 px-4 py-3">
        {showForm ? (
          <form ref={addFormRef} action={handleAddItem} className="flex items-center gap-2">
            <input
              name="label"
              required
              placeholder="New checklist item…"
              autoFocus
              className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#1f5772]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-[#1f5772] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#174560] disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs text-[#1f5772] hover:underline"
          >
            <PlusCircle size={13} />
            Add Checklist Item
          </button>
        )}
      </div>

      {/* Snapshot history */}
      {initialSnapshots.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={() => setShowHistory(v => !v)}
            className="flex w-full items-center justify-between bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:bg-gray-100"
          >
            <span>History ({initialSnapshots.length} snapshot{initialSnapshots.length !== 1 ? 's' : ''})</span>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHistory && (
            <div className="divide-y divide-gray-100">
              {initialSnapshots.map(snap => {
                const total = snap.checklist_results.length
                const checked = snap.checklist_results.filter(r => r.checked).length
                return (
                  <div key={snap.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{snap.snapshot_date}</p>
                        <p className="text-xs text-gray-400">{checked}/{total} items checked{snap.notes ? ` · ${snap.notes}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          checked === total ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {checked === total ? 'Complete' : 'Partial'}
                        </span>
                        <button
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          disabled={isPending}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {/* Individual results */}
                    <ul className="mt-2 space-y-0.5">
                      {snap.checklist_results.map((r, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={r.checked ? 'text-green-500' : 'text-gray-300'}>
                            {r.checked ? '✓' : '○'}
                          </span>
                          <span className={r.checked ? '' : 'text-gray-400'}>{r.item_label}</span>
                          {r.notes && <span className="text-gray-400">— {r.notes}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
