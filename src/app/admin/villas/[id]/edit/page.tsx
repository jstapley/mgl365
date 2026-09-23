import { notFound } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import { updateVilla } from '../../actions'
import type { Villa } from '@/types'

async function getVilla(id: string): Promise<Villa> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase.from('villas').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return data
}

export default async function EditVillaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const villa = await getVilla(id)
  const action = updateVilla.bind(null, id)

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Edit Villa</h1>

      <form action={action} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <Field label="Name" name="name" defaultValue={villa.name} required />
        <Field label="Slug" name="slug" defaultValue={villa.slug} required />
        <Field label="Image URL" name="image_url" defaultValue={villa.image_url ?? ''} />
        <Field label="Description" name="description" defaultValue={villa.description ?? ''} textarea />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bedrooms" name="bedrooms" type="number" defaultValue={villa.bedrooms?.toString() ?? ''} />
          <Field label="Max Guests" name="max_guests" type="number" defaultValue={villa.max_guests?.toString() ?? ''} />
        </div>
        <Field label="Price per Night (USD)" name="price_per_night" type="number" step="0.01" defaultValue={villa.price_per_night?.toString() ?? ''} />

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
          <select
            name="active"
            defaultValue={String(villa.active)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
          >
            Save Changes
          </button>
          <a href="/admin/villas" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, required, textarea, type = 'text', defaultValue, step }: {
  label: string; name: string; required?: boolean; textarea?: boolean
  type?: string; defaultValue?: string; step?: string
}) {
  const base = 'w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] focus:ring-1 focus:ring-[#1f5772]'
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}{required && ' *'}
      </label>
      {textarea ? (
        <textarea name={name} rows={4} defaultValue={defaultValue} className={base} />
      ) : (
        <input name={name} type={type} required={required} defaultValue={defaultValue} step={step} className={base} />
      )}
    </div>
  )
}
