'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Trash2, ChevronLeft, PlusCircle } from 'lucide-react'
import { saveInspection, deleteInspection } from './actions'
import { getTemplate, InspectionTemplate, FieldDef, Section } from './templates'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Inspection {
  id: string
  inspection_date: string
  checked_by: string
  checked_by_other: string | null
  responses: Record<string, Record<string, unknown>>
  created_at: string
}

type FormValues = Record<string, Record<string, unknown>>

// ── Helpers ────────────────────────────────────────────────────────────────────

function initFormValues(template: InspectionTemplate): FormValues {
  const state: FormValues = {}
  for (const section of template.sections) {
    const sec: Record<string, unknown> = { changes: false, changes_text: '' }
    for (const field of section.fields) {
      if (field.type === 'checkbox') sec[field.id] = false
      else if (field.type === 'checkbox_value') sec[field.id] = { checked: false, value: '' }
      else if (field.type === 'measurement') sec[field.id] = ''
      else if (field.type === 'radio') sec[field.id] = ''
    }
    state[section.id] = sec
  }
  return state
}

// ── Field input components ─────────────────────────────────────────────────────

function FieldInput({
  field,
  sectionId,
  values,
  onChange,
}: {
  field: FieldDef
  sectionId: string
  values: Record<string, unknown>
  onChange: (sectionId: string, fieldId: string, value: unknown) => void
}) {
  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 py-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={!!(values[field.id] as boolean)}
          onChange={e => onChange(sectionId, field.id, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-[#1f5772] shrink-0"
        />
        <span className="text-sm text-gray-700">{field.label}</span>
      </label>
    )
  }

  if (field.type === 'checkbox_value') {
    const cv = (values[field.id] as { checked: boolean; value: string }) ?? {
      checked: false,
      value: '',
    }
    return (
      <div className="flex items-center gap-3 py-2.5">
        <input
          type="checkbox"
          checked={cv.checked}
          onChange={e => onChange(sectionId, field.id, { ...cv, checked: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 accent-[#1f5772] shrink-0 cursor-pointer"
        />
        <span className="text-sm text-gray-700 flex-1">{field.label}</span>
        {cv.checked && (
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type={field.valueType === 'date' ? 'date' : 'number'}
              value={cv.value}
              onChange={e => onChange(sectionId, field.id, { ...cv, value: e.target.value })}
              className="w-28 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-[#1f5772]"
              min={field.valueType === 'number' ? 0 : undefined}
            />
            {field.unit && <span className="text-xs text-gray-400">{field.unit}</span>}
          </div>
        )}
      </div>
    )
  }

  if (field.type === 'measurement') {
    return (
      <div className="flex items-center gap-3 py-2.5">
        <span className="text-sm text-gray-700 flex-1">{field.label}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            value={(values[field.id] as string) ?? ''}
            onChange={e => onChange(sectionId, field.id, e.target.value)}
            className="w-24 rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-[#1f5772]"
            min={0}
          />
          {field.unit && <span className="text-xs text-gray-400">{field.unit}</span>}
        </div>
      </div>
    )
  }

  if (field.type === 'radio') {
    return (
      <div className="py-2.5">
        <p className="text-sm text-gray-700 mb-2">{field.label}</p>
        <div className="flex flex-wrap gap-4">
          {field.options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${sectionId}-${field.id}`}
                value={opt}
                checked={values[field.id] === opt}
                onChange={() => onChange(sectionId, field.id, opt)}
                className="accent-[#1f5772]"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function SectionForm({
  section,
  values,
  onChange,
}: {
  section: Section
  values: Record<string, unknown>
  onChange: (sectionId: string, fieldId: string, value: unknown) => void
}) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{section.title}</p>
      </div>
      <div className="px-4 divide-y divide-gray-50">
        {section.fields.map(field => (
          <FieldInput
            key={field.id}
            field={field}
            sectionId={section.id}
            values={values}
            onChange={onChange}
          />
        ))}
      </div>
      <div className="px-4 pb-3 pt-2 border-t border-gray-50 bg-gray-50/50">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!(values.changes as boolean)}
            onChange={e => onChange(section.id, 'changes', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-[#1f5772]"
          />
          <span className="text-xs text-gray-500">Any changes or notes?</span>
        </label>
        {!!values.changes && (
          <textarea
            value={(values.changes_text as string) ?? ''}
            onChange={e => onChange(section.id, 'changes_text', e.target.value)}
            placeholder="Describe changes…"
            rows={2}
            className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] resize-none"
          />
        )}
      </div>
    </div>
  )
}

// ── Detail view field components ───────────────────────────────────────────────

function FieldDetail({
  field,
  sectionData,
}: {
  field: FieldDef
  sectionData: Record<string, unknown>
}) {
  const val = sectionData[field.id]

  if (field.type === 'checkbox') {
    const checked = !!val
    return (
      <div className="flex items-center gap-2.5 py-2">
        <span className={`text-sm font-medium ${checked ? 'text-green-500' : 'text-gray-300'}`}>
          {checked ? '✓' : '○'}
        </span>
        <span className={`text-sm ${checked ? 'text-gray-800' : 'text-gray-400'}`}>{field.label}</span>
      </div>
    )
  }

  if (field.type === 'checkbox_value') {
    const cv = val as { checked: boolean; value: string } | undefined
    const checked = cv?.checked ?? false
    return (
      <div className="flex items-center gap-2.5 py-2">
        <span className={`text-sm font-medium ${checked ? 'text-green-500' : 'text-gray-300'}`}>
          {checked ? '✓' : '○'}
        </span>
        <span className={`text-sm flex-1 ${checked ? 'text-gray-800' : 'text-gray-400'}`}>
          {field.label}
        </span>
        {checked && cv?.value && (
          <span className="text-sm font-medium text-gray-900 shrink-0">
            {cv.value}
            {field.unit ? ` ${field.unit}` : ''}
          </span>
        )}
      </div>
    )
  }

  if (field.type === 'measurement') {
    const v = val as string | undefined
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-700">{field.label}</span>
        <span className="text-sm font-medium text-gray-900">
          {v ? (
            <>
              {v}
              {field.unit ? ` ${field.unit}` : ''}
            </>
          ) : (
            <span className="text-gray-300 font-normal">—</span>
          )}
        </span>
      </div>
    )
  }

  if (field.type === 'radio') {
    const v = val as string | undefined
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-700">{field.label}</span>
        <span className="text-sm font-medium text-gray-900">
          {v || <span className="text-gray-300 font-normal">—</span>}
        </span>
      </div>
    )
  }

  return null
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ChecklistClient({
  villaId,
  villaName,
  initialInspections,
}: {
  villaId: string
  villaName: string
  initialInspections: Inspection[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [view, setView] = useState<'history' | 'form' | 'detail'>('history')
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)

  // Form header state
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().slice(0, 10))
  const [checkedBy, setCheckedBy] = useState('Jamie')
  const [checkedByOther, setCheckedByOther] = useState('')

  const template = getTemplate(villaName)
  const [formValues, setFormValues] = useState<FormValues>(
    template ? initFormValues(template) : {},
  )

  function handleFieldChange(sectionId: string, fieldId: string, value: unknown) {
    setFormValues(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [fieldId]: value },
    }))
  }

  function handleStartNew() {
    if (template) setFormValues(initFormValues(template))
    setInspectionDate(new Date().toISOString().slice(0, 10))
    setCheckedBy('Jamie')
    setCheckedByOther('')
    setView('form')
  }

  function handleSave() {
    const name = checkedBy === 'Other' ? checkedByOther.trim() || 'Other' : checkedBy
    startTransition(async () => {
      await saveInspection(villaId, {
        inspection_date: inspectionDate,
        checked_by: name,
        checked_by_other: checkedBy === 'Other' ? checkedByOther.trim() || null : null,
        responses: formValues,
      })
      setView('history')
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this inspection?')) return
    startTransition(async () => {
      await deleteInspection(id)
      if (selectedInspection?.id === id) setView('history')
      router.refresh()
    })
  }

  // ── History view ─────────────────────────────────────────────────────────────

  if (view === 'history') {
    return (
      <div>
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Inspection History
          </p>
          {template && (
            <button
              onClick={handleStartNew}
              className="flex items-center gap-1 text-xs text-[#1f5772] hover:underline"
            >
              <PlusCircle size={13} />
              New Inspection
            </button>
          )}
        </div>

        {!template ? (
          <p className="px-4 py-6 text-sm text-gray-400 italic">
            No inspection template configured for this villa.
          </p>
        ) : initialInspections.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 italic">No inspections recorded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {initialInspections.map(insp => (
              <li key={insp.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <button
                  className="flex-1 text-left min-w-0"
                  onClick={() => { setSelectedInspection(insp); setView('detail') }}
                >
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(insp.inspection_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Checked by {insp.checked_by}</p>
                </button>
                <button
                  onClick={() => handleDelete(insp.id)}
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

  if (view === 'form' && template) {
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
            New Inspection
          </span>
        </div>

        {/* Header fields */}
        <div className="flex flex-wrap items-end gap-4 px-4 py-3 border-b border-gray-100">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={inspectionDate}
              onChange={e => setInspectionDate(e.target.value)}
              required
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
              <option>Jamie</option>
              <option>Michel</option>
              <option>Luka</option>
              <option>Jess</option>
              <option>Other</option>
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

        {/* Sections */}
        {template.sections.map(section => (
          <SectionForm
            key={section.id}
            section={section}
            values={formValues[section.id] ?? { changes: false, changes_text: '' }}
            onChange={handleFieldChange}
          />
        ))}

        {/* Save */}
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            disabled={isPending || !inspectionDate}
            className="flex items-center gap-1.5 rounded bg-[#1f5772] px-5 py-2 text-sm font-medium text-white hover:bg-[#174560] disabled:opacity-50 transition-colors"
          >
            <ClipboardList size={14} />
            {isPending ? 'Saving…' : 'Save Inspection'}
          </button>
        </div>
      </div>
    )
  }

  // ── Detail view ───────────────────────────────────────────────────────────────

  if (view === 'detail' && selectedInspection && template) {
    const insp = selectedInspection
    const responses = insp.responses ?? {}

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
              {new Date(insp.inspection_date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <button
            onClick={() => handleDelete(insp.id)}
            disabled={isPending}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Checked by */}
        <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
          Checked by:{' '}
          <span className="font-medium text-gray-800">{insp.checked_by}</span>
        </div>

        {/* Sections */}
        {template.sections.map(section => {
          const secData = (responses[section.id] ?? {}) as Record<string, unknown>
          const hasChanges = !!secData.changes
          const changesText = secData.changes_text as string | undefined
          return (
            <div key={section.id} className="border-b border-gray-100 last:border-b-0">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {section.title}
                </p>
              </div>
              <div className="px-4 divide-y divide-gray-50">
                {section.fields.map(field => (
                  <FieldDetail key={field.id} field={field} sectionData={secData} />
                ))}
              </div>
              {hasChanges && (
                <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Changes / Notes
                  </p>
                  {changesText && (
                    <p className="text-sm text-amber-800 mt-0.5">{changesText}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return null
}
