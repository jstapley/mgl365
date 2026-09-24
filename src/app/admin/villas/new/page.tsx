import { createVilla } from '../actions'
import { VILLA_FEATURES, FEATURE_KEYS } from '@/lib/villa-features'
import VillaContentEditor from '@/components/admin/VillaContentEditor'
import VillaGalleryEditor from '@/components/admin/VillaGalleryEditor'

export default function NewVillaPage() {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Add Villa</h1>

      <form action={createVilla} className="space-y-4 rounded border border-gray-200 bg-white p-6">
        <Field label="Name" name="name" required />
        <Field label="Slug" name="slug" placeholder="cool-house" required />
        <Field label="Hero Tagline" name="tagline" placeholder="Short phrase shown in the hero callout box (e.g. Breezy island retreat just minutes from Antigua's best beaches)" />
        <Field label="Image URL" name="image_url" placeholder="https://... or /images/villas/..." />
        <Field label="Description" name="description" textarea />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bedrooms" name="bedrooms" type="number" />
          <Field label="Max Guests" name="max_guests" type="number" />
        </div>
        <Field label="Price per Night (USD)" name="price_per_night" type="number" step="0.01" />

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Status</label>
          <select
            name="active"
            defaultValue="true"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772]"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Gallery */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Photo Gallery</label>
          <VillaGalleryEditor />
        </div>

        {/* Content Sections */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Page Content</label>
          <VillaContentEditor />
        </div>

        {/* Features */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Features</label>
          <div className="grid grid-cols-2 gap-2 rounded border border-gray-200 p-3">
            {FEATURE_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="features"
                  value={key}
                  className="h-4 w-4 rounded border-gray-300 text-[#1f5772] accent-[#1f5772]"
                />
                {VILLA_FEATURES[key].label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
          >
            Create Villa
          </button>
          <a href="/admin/villas" className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, required, textarea, type = 'text', placeholder, step }: {
  label: string; name: string; required?: boolean; textarea?: boolean
  type?: string; placeholder?: string; step?: string
}) {
  const base = 'w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] focus:ring-1 focus:ring-[#1f5772]'
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}{required && ' *'}
      </label>
      {textarea ? (
        <textarea name={name} rows={4} placeholder={placeholder} className={base} />
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} step={step} className={base} />
      )}
    </div>
  )
}
