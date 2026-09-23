import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { deleteService } from './actions'
import DeleteButton from '@/components/admin/DeleteButton'
import type { Service } from '@/types'

const PACKAGE_STYLES = {
  bronze: { badge: 'bg-amber-100 text-amber-700',  heading: 'text-amber-700',  border: 'border-amber-200' },
  silver: { badge: 'bg-slate-100 text-slate-600',  heading: 'text-slate-600',  border: 'border-slate-200' },
  gold:   { badge: 'bg-yellow-100 text-yellow-700', heading: 'text-yellow-700', border: 'border-yellow-200' },
}

const PACKAGE_LABELS = {
  bronze: 'Bronze Package',
  silver: 'Silver Package',
  gold:   'Gold Package',
}

async function getServices(): Promise<Service[]> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export default async function ServicesPage() {
  const services = await getServices()

  const grouped = {
    bronze: services.filter((s) => s.package === 'bronze'),
    silver: services.filter((s) => s.package === 'silver'),
    gold:   services.filter((s) => s.package === 'gold'),
    none:   services.filter((s) => !s.package),
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Concierge Services</h1>
        <Link
          href="/admin/services/new"
          className="rounded bg-[#1f5772] px-4 py-2 text-sm font-medium text-white hover:bg-[#174560]"
        >
          Add Service
        </Link>
      </div>

      <div className="space-y-6">
        {(['bronze', 'silver', 'gold'] as const).map((tier) => {
          const items = grouped[tier]
          const styles = PACKAGE_STYLES[tier]
          return (
            <div key={tier} className={`overflow-hidden rounded border ${styles.border} bg-white`}>
              <div className={`border-b ${styles.border} px-4 py-3 flex items-center gap-2`}>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${styles.badge}`}>
                  {PACKAGE_LABELS[tier]}
                </span>
                <span className="text-xs text-gray-400">{items.length} services</span>
              </div>

              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">Service</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">Description</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-400 text-xs">
                        No services in this package yet.
                      </td>
                    </tr>
                  )}
                  {items.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{service.name}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-sm truncate">{service.description ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link href={`/admin/services/${service.id}/edit`} className="mr-3 text-[#1f5772] hover:underline">
                          Edit
                        </Link>
                        <DeleteButton action={deleteService.bind(null, service.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}

        {/* Unpackaged services */}
        {grouped.none.length > 0 && (
          <div className="overflow-hidden rounded border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Other Services</span>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {grouped.none.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{service.name}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-sm truncate">{service.description ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${service.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/services/${service.id}/edit`} className="mr-3 text-[#1f5772] hover:underline">Edit</Link>
                      <DeleteButton action={deleteService.bind(null, service.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
