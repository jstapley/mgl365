'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, ChevronLeft, Trash2 } from 'lucide-react'
import { saveInventoryCheck, deleteInventoryCheck } from './actions'
import type { InventoryCheck } from './page'

const INSPECTORS = ['Jamie', 'Michel', 'Luka', 'Jess', 'Other']

const SECTIONS: { key: keyof Pick<InventoryCheck, 'linens' | 'kitchen' | 'other'>; label: string }[] = [
  { key: 'linens',   label: 'Linens' },
  { key: 'kitchen',  label: 'Kitchen' },
  { key: 'other',    label: 'Other' },
]

function fmt(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function InventoryClient({
  villaId,
  villaName,
  initialChecks,
}: {
  villaId: string
  villaName: string
  initialChecks: InventoryCheck[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [view, setView] = useState<'history' | 'form' | 'detail'>('history')
  const [selected, setSelected] = useState<InventoryCheck | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Form state — pre-fill from most recent check so edits are quick
  const latest = initialChecks[0] ?? null
  const [checkDate, setCheckDate] = useState(new Date().toISOString().slice(0, 10))
  const [checkedBy, setCheckedBy] = useState(INSPECTORS[0])
  const [checkedByOther, setCheckedByOther] = useState('')
  const [linens, setLinens] = useState(latest?.linens ?? '')
  const [kitchen, setKitchen] = useState(latest?.kitchen ?? '')
  const [other, setOther] = useState(latest?.other ?? '')

  function handleStartNew() {
    // Pre-fill from most recent check
    setCheckDate(new Date().toISOString().slice(0, 10))
    setCheckedBy(INSPECTORS[0])
    setCheckedByOther('')
    setLinens(latest?.linens ?? '')
    setKitchen(latest?.kitchen ?? '')
    setOther(latest?.other ?? '')
    setSaveError(null)
    setView('form')
  }

  function handleSave() {
    const name = checkedBy === 'Other' ? checkedByOther.trim() || 'Other' : checkedBy
    setSaveError(null)
    startTransition(async () => {
      const err = await saveInventoryCheck(villaId, {
        check_date: checkDate,
        checked_by: name,
        linens,
        kitchen,
        other,
      })
      if (err) { setSaveError(err); return }
      setView('history')
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this inventory check?')) return
    startTransition(async () => {
      await deleteInventoryCheck(id)
      if (selected?.id === id) setView('history')
      router.refresh()
    })
  }

  // ── History view ──────────────────────────────────────────────────────────────
  if (view === 'history') {
    return (
      <div>
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Inventory History — last 12 weeks
          </p>
          <button
            onClick={handleStartNew}
            className="flex items-center gap-1 text-xs text-[#1f5772] hover:underline"
          >
            <PlusCircle size={13} />
            New Check
          </button>
        </div>

        {initialChecks.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-400 italic text-center">
            No inventory checks recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {initialChecks.map(check => (
              <li key={check.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <button
                  className="flex-1 text-left min-w-0"
                  onClick={() => { setSelected(check); setView('detail') }}
                >
                  <p className="text-sm font-medium text-gray-800">{fmt(check.check_date)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Checked by {check.checked_by}</p>
                </button>
                <button
                  onClick={() => handleDelete(check.id)}
                  disabled={isPending}
                  className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  // ── Form view ─────────────────────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div>
        {/* Toolbar */}
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <button
            onClick={() => setView('history')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            New Inventory Check — {villaName}
          </span>
        </div>

        {/* Header fields */}
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

        <p className="px-4 pt-3 text-xs text-gray-400">
          Pre-filled from previous check — update any quantities or notes that have changed.
        </p>

        {/* Section text areas */}
        {[
          { label: 'Linens', value: linens, set: setLinens },
          { label: 'Kitchen', value: kitchen, set: setKitchen },
          { label: 'Other', value: other, set: setOther },
        ].map(({ label, value, set }) => (
          <div key={label} className="border-t border-gray-100 mt-3">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            </div>
            <div className="px-4 py-3">
              <textarea
                value={value}
                onChange={e => set(e.target.value)}
                rows={10}
                placeholder={`Enter ${label.toLowerCase()} inventory…`}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] resize-y font-mono leading-relaxed"
              />
            </div>
          </div>
        ))}

        {saveError && (
          <p className="px-4 pb-2 text-xs text-red-600">{saveError}</p>
        )}

        {/* Save */}
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            disabled={isPending || !checkDate}
            className="rounded bg-[#1f5772] px-5 py-2 text-sm font-medium text-white hover:bg-[#174560] disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving…' : 'Save Inventory Check'}
          </button>
        </div>
      </div>
    )
  }

  // ── Detail view ───────────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    return (
      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={14} />
              Back
            </button>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {fmt(selected.check_date)}
            </span>
          </div>
          <button
            onClick={() => handleDelete(selected.id)}
            disabled={isPending}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Checked by */}
        <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
          Checked by:{' '}
          <span className="font-medium text-gray-800">{selected.checked_by}</span>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ key, label }) => {
          const content = selected[key]
          return (
            <div key={key} className="border-b border-gray-100 last:border-b-0">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
              </div>
              <div className="px-4 py-3">
                {content ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {content}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-400 italic">No {label.toLowerCase()} data recorded.</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}
