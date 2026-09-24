'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { VillaSection } from '@/types'

type Section = VillaSection & { _id: string }

function uid() { return Math.random().toString(36).slice(2) }

function toEditorSections(raw: VillaSection[]): Section[] {
  return raw.map(s => ({ ...s, _id: uid() }))
}

export default function VillaContentEditor({ initial }: { initial?: VillaSection[] }) {
  const [sections, setSections] = useState<Section[]>(
    initial && initial.length > 0 ? toEditorSections(initial) : []
  )

  const addText = () =>
    setSections(s => [...s, { _id: uid(), type: 'text', heading: '', body: '' }])

  const addBullets = () =>
    setSections(s => [...s, { _id: uid(), type: 'bullets', heading: '', items: [''] }])

  const remove = (id: string) =>
    setSections(s => s.filter(x => x._id !== id))

  const updateHeading = (id: string, heading: string) =>
    setSections(s => s.map(x => x._id === id ? { ...x, heading } : x))

  const updateBody = (id: string, body: string) =>
    setSections(s => s.map(x => x._id === id && x.type === 'text' ? { ...x, body } : x))

  const updateItem = (id: string, idx: number, value: string) =>
    setSections(s => s.map(x => {
      if (x._id !== id || x.type !== 'bullets') return x
      const items = [...x.items]; items[idx] = value
      return { ...x, items }
    }))

  const addItem = (id: string) =>
    setSections(s => s.map(x =>
      x._id === id && x.type === 'bullets' ? { ...x, items: [...x.items, ''] } : x
    ))

  const removeItem = (id: string, idx: number) =>
    setSections(s => s.map(x => {
      if (x._id !== id || x.type !== 'bullets') return x
      return { ...x, items: x.items.filter((_, i) => i !== idx) }
    }))

  // Strip internal _id before serialising
  const serialized = JSON.stringify(
    sections.map(({ _id: _, ...rest }) => rest)
  )

  return (
    <div>
      <input type="hidden" name="content" value={serialized} />

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section._id} className="rounded border border-gray-200 bg-gray-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {section.type === 'text' ? 'Text Block' : 'Bullet List'}
              </span>
              <button
                type="button"
                onClick={() => remove(section._id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Section heading (e.g. Property Details)"
              value={section.heading}
              onChange={e => updateHeading(section._id, e.target.value)}
              className="mb-2 w-full rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#1f5772] focus:ring-1 focus:ring-[#1f5772]"
            />

            {section.type === 'text' ? (
              <textarea
                placeholder="Write the section content here..."
                value={section.body}
                onChange={e => updateBody(section._id, e.target.value)}
                rows={5}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] focus:ring-1 focus:ring-[#1f5772]"
              />
            ) : (
              <div className="space-y-1.5">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="shrink-0 text-[#1f5772]">•</span>
                    <input
                      type="text"
                      placeholder={`Item ${idx + 1}`}
                      value={item}
                      onChange={e => updateItem(section._id, idx, e.target.value)}
                      className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#1f5772] focus:ring-1 focus:ring-[#1f5772]"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(section._id, idx)}
                      className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(section._id)}
                  className="mt-1 flex items-center gap-1 text-xs text-[#1f5772] hover:underline"
                >
                  <Plus size={12} /> Add item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <p className="mb-3 text-xs text-gray-400">
          No sections yet. Add a text block or bullet list below.
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={addText}
          className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Plus size={12} /> Text Block
        </button>
        <button
          type="button"
          onClick={addBullets}
          className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Plus size={12} /> Bullet List
        </button>
      </div>
    </div>
  )
}
