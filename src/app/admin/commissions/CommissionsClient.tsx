'use client'

import { useState, useTransition } from 'react'
import { PlusCircle, Trash2, ChevronLeft, Pencil } from 'lucide-react'
import { createEntry, updateEntry, updatePaymentStatus, deleteEntry } from './actions'
import { useRouter } from 'next/navigation'
import type { Provider, Villa, Entry, Client } from './page'

// ── Constants ──────────────────────────────────────────────────────────────────

const VILLA_SHORT: Record<string, string> = {
  'Cool House':      'CH',
  'Water Edge':      'WE',
  'Starfish Lower':  'SFS',
  'Starfish Upper':  'SFH',
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const COLLECTORS = ['Jamie', 'Michel']
const PAYMENT_STATUSES = ['unpaid', 'paid']

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number | null, symbol = '$') {
  if (n == null) return '—'
  return `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function entryMonth(e: Entry) {
  return e.entry_date.slice(0, 7)
}

// ── Entry Form (Add + Edit) ────────────────────────────────────────────────────

function EntryForm({
  providers,
  villas,
  clients,
  defaultProviderId,
  entry,
  onCancel,
}: {
  providers: Provider[]
  villas: Villa[]
  clients: Client[]
  defaultProviderId?: string
  entry?: Entry
  onCancel: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [serviceBooked, setServiceBooked] = useState(
    entry?.service_booked ?? providers.find(p => p.id === defaultProviderId)?.primary_service ?? ''
  )
  const today = new Date().toISOString().slice(0, 10)

  function handleProviderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = providers.find(p => p.id === e.target.value)
    setServiceBooked(p?.primary_service ?? '')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const err = entry ? await updateEntry(entry.id, fd) : await createEntry(fd)
      if (err) { setError(err); return }
      onCancel()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded border border-gray-200 bg-blue-50 p-4 space-y-3">
      {entry && <p className="text-xs font-semibold text-gray-600">Edit Entry</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <datalist id="clients-list">
        {clients.map(c => <option key={c.id} value={c.name} />)}
      </datalist>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
          <input name="entry_date" type="date" required defaultValue={entry?.entry_date ?? today}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Provider *</label>
          <select name="provider_id" required defaultValue={entry?.provider_id ?? defaultProviderId ?? ''}
            onChange={handleProviderChange}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772] bg-white">
            <option value="">— Select —</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Villa</label>
          <select name="villa_id" defaultValue={entry?.villa_id ?? ''}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772] bg-white">
            <option value="">— All —</option>
            {villas.map(v => <option key={v.id} value={v.id}>{VILLA_SHORT[v.name] ?? v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Guest Name</label>
          <input name="guest_name" type="text" placeholder="Guest name…"
            list="clients-list" defaultValue={entry?.guest_name ?? ''}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Service Booked</label>
          <input name="service_booked" type="text" placeholder="e.g. Golf Cart Rental"
            value={serviceBooked} onChange={e => setServiceBooked(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Collected By *</label>
          <select name="collected_by" required defaultValue={entry?.collected_by ?? ''}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772] bg-white">
            <option value="" disabled>— Select —</option>
            {COLLECTORS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Commission USD</label>
          <input name="commission_usd" type="number" step="0.01" min="0" placeholder="0.00"
            defaultValue={entry?.commission_usd ?? ''}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Commission XCD</label>
          <input name="commission_xcd" type="number" step="0.01" min="0" placeholder="0.00"
            defaultValue={entry?.commission_xcd ?? ''}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
          <select name="payment_status" defaultValue={entry?.payment_status ?? 'unpaid'}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772] bg-white">
            {PAYMENT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <input name="notes" type="text" placeholder="Optional notes…"
          defaultValue={entry?.notes ?? ''}
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]" />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={isPending}
          className="rounded bg-[#1f5772] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#174560] disabled:opacity-50">
          {isPending ? 'Saving…' : entry ? 'Save Changes' : 'Add Entry'}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded border border-gray-300 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Provider Detail View ───────────────────────────────────────────────────────

function ProviderDetail({
  provider,
  entries,
  villas,
  providers,
  clients,
  onBack,
}: {
  provider: Provider
  entries: Entry[]
  villas: Villa[]
  providers: Provider[]
  clients: Client[]
  onBack: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const villaById = Object.fromEntries(villas.map(v => [v.id, v]))

  function handleStatusToggle(entry: Entry) {
    const next = entry.payment_status === 'paid' ? 'unpaid' : 'paid'
    startTransition(async () => {
      await updatePaymentStatus(entry.id, next)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    startTransition(async () => {
      await deleteEntry(id)
      router.refresh()
    })
  }

  function handleEditClick(entry: Entry) {
    setEditingEntry(entry)
    setShowAddForm(false)
  }

  const totalUsd = entries.reduce((s, e) => s + (e.commission_usd ?? 0), 0)
  const totalXcd = entries.reduce((s, e) => s + (e.commission_xcd ?? 0), 0)
  const unpaidCount = entries.filter(e => e.payment_status === 'unpaid' && (e.commission_usd || e.commission_xcd)).length

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft size={16} /> Back
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{provider.name}</h2>
          <p className="text-xs text-gray-400">{provider.primary_service}</p>
        </div>
        {unpaidCount > 0 && (
          <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            {unpaidCount} unpaid
          </span>
        )}
      </div>

      {/* Totals */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Total Jobs', value: entries.length },
          { label: 'Total USD', value: fmt(totalUsd || null) },
          { label: 'Total XCD', value: fmt(totalXcd || null, 'EC$') },
        ].map(({ label, value }) => (
          <div key={label} className="rounded border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-lg font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Add / Edit form */}
      {editingEntry ? (
        <div className="mb-4">
          <EntryForm providers={providers} villas={villas} clients={clients}
            entry={editingEntry} onCancel={() => setEditingEntry(null)} />
        </div>
      ) : showAddForm ? (
        <div className="mb-4">
          <EntryForm providers={providers} villas={villas} clients={clients}
            defaultProviderId={provider.id} onCancel={() => setShowAddForm(false)} />
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)}
          className="mb-4 flex items-center gap-1.5 text-xs text-[#1f5772] hover:underline">
          <PlusCircle size={13} /> Add Entry
        </button>
      )}

      {/* Entry table */}
      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        {entries.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400 italic">No entries yet.</p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {['Date','House','Guest','Service','Collected By','USD','XCD','Status','Notes',''].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {entries.map(e => {
                    const villa = e.villa_id ? villaById[e.villa_id] : null
                    const isPaid = e.payment_status === 'paid'
                    const isEditing = editingEntry?.id === e.id
                    return (
                      <tr key={e.id} className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>
                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                          {new Date(e.entry_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-600">
                          {villa ? (VILLA_SHORT[villa.name] ?? villa.name) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-800">{e.guest_name ?? '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600">{e.service_booked ?? '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-600">{e.collected_by}</td>
                        <td className="px-3 py-2.5 text-xs font-medium text-gray-800">{fmt(e.commission_usd)}</td>
                        <td className="px-3 py-2.5 text-xs font-medium text-gray-800">{fmt(e.commission_xcd, 'EC$')}</td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => handleStatusToggle(e)} disabled={isPending}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                              isPaid ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}>
                            {isPaid ? 'Paid' : 'Unpaid'}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[140px] truncate">{e.notes ?? ''}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditClick(e)} disabled={isPending}
                              className="text-gray-300 hover:text-[#1f5772] transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(e.id)} disabled={isPending}
                              className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <ul className="divide-y divide-gray-50 md:hidden">
              {entries.map(e => {
                const villa = e.villa_id ? villaById[e.villa_id] : null
                const isPaid = e.payment_status === 'paid'
                return (
                  <li key={e.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-800">{e.guest_name ?? '—'}</p>
                          {villa && <span className="text-xs text-gray-400">{VILLA_SHORT[villa.name] ?? villa.name}</span>}
                          <button onClick={() => handleStatusToggle(e)} disabled={isPending}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isPaid ? 'Paid' : 'Unpaid'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{e.service_booked ?? e.collected_by}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(e.entry_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {e.commission_usd ? ` · ${fmt(e.commission_usd)}` : ''}
                          {e.commission_xcd ? ` · ${fmt(e.commission_xcd, 'EC$')}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditClick(e)} disabled={isPending}
                          className="shrink-0 text-gray-300 hover:text-[#1f5772] transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(e.id)} disabled={isPending}
                          className="shrink-0 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

// ── Master Summary ─────────────────────────────────────────────────────────────

const VILLA_ORDER = ['Cool House', 'Water Edge', 'Starfish Lower', 'Starfish Upper']

export default function CommissionsClient({
  providers,
  villas,
  entries,
  clients,
}: {
  providers: Provider[]
  villas: Villa[]
  entries: Entry[]
  clients: Client[]
}) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const mk = monthKey(year, month)
  const monthEntries = entries.filter(e => entryMonth(e) === mk)

  const providerById = Object.fromEntries(providers.map(p => [p.id, p]))

  // If a provider is selected, show detail view
  const selectedProvider = selectedProviderId ? providerById[selectedProviderId] : null
  if (selectedProvider) {
    const providerEntries = entries.filter(e => e.provider_id === selectedProviderId)
    return (
      <ProviderDetail
        provider={selectedProvider}
        entries={providerEntries}
        villas={villas}
        providers={providers}
        clients={clients}
        onBack={() => setSelectedProviderId(null)}
      />
    )
  }

  // Provider summary rows for this month
  const providerStats = providers.map(p => {
    const pe = monthEntries.filter(e => e.provider_id === p.id)
    return {
      ...p,
      jobs: pe.length,
      usd: pe.reduce((s, e) => s + (e.commission_usd ?? 0), 0),
      xcd: pe.reduce((s, e) => s + (e.commission_xcd ?? 0), 0),
    }
  })

  // Villa breakdown for this month
  const villaStats = VILLA_ORDER.map(name => {
    const v = villas.find(v => v.name === name)
    if (!v) return null
    const ve = monthEntries.filter(e => e.villa_id === v.id)
    return {
      short: VILLA_SHORT[name] ?? name,
      jobs: ve.length,
      usd: ve.reduce((s, e) => s + (e.commission_usd ?? 0), 0),
      xcd: ve.reduce((s, e) => s + (e.commission_xcd ?? 0), 0),
    }
  }).filter(Boolean) as { short: string; jobs: number; usd: number; xcd: number }[]

  const totalUsd = providerStats.reduce((s, p) => s + p.usd, 0)
  const totalXcd = providerStats.reduce((s, p) => s + p.xcd, 0)
  const totalJobs = providerStats.reduce((s, p) => s + p.jobs, 0)

  return (
    <div className="space-y-5">
      {/* Month selector */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={month} onChange={e => setMonth(Number(e.target.value))}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#1f5772] bg-white">
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#1f5772] bg-white">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y =>
            <option key={y}>{y}</option>)}
        </select>
        <button onClick={() => setShowForm(v => !v)}
          className="ml-auto flex items-center gap-1.5 rounded bg-[#1f5772] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#174560]">
          <PlusCircle size={13} /> Add Entry
        </button>
      </div>

      {showForm && (
        <EntryForm providers={providers} villas={villas} clients={clients} onCancel={() => { setShowForm(false); router.refresh() }} />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Provider summary table */}
        <div className="lg:col-span-2 overflow-hidden rounded border border-gray-200 bg-white">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Provider Summary — {MONTH_NAMES[month - 1]} {year}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Provider</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Service</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Jobs</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">USD</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">XCD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {providerStats.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedProviderId(p.id)}>
                  <td className="px-4 py-2.5 font-medium text-[#1f5772] hover:underline">{p.name}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{p.primary_service}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">{p.jobs || '—'}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-800">{p.usd ? fmt(p.usd) : '—'}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-800">{p.xcd ? fmt(p.xcd, 'EC$') : '—'}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                <td className="px-4 py-2.5 text-xs" colSpan={2}>TOTAL</td>
                <td className="px-4 py-2.5 text-right text-xs">{totalJobs || '—'}</td>
                <td className="px-4 py-2.5 text-right text-xs">{totalUsd ? fmt(totalUsd) : '—'}</td>
                <td className="px-4 py-2.5 text-right text-xs">{totalXcd ? fmt(totalXcd, 'EC$') : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Villa breakdown */}
        <div className="overflow-hidden rounded border border-gray-200 bg-white self-start">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">By Villa</p>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">House</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">USD</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">XCD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {villaStats.map(v => (
                <tr key={v.short}>
                  <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{v.short}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">{v.usd ? fmt(v.usd) : '—'}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">{v.xcd ? fmt(v.xcd, 'EC$') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
