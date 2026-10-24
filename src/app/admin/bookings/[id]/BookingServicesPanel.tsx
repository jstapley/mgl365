'use client'

import { useState, useTransition } from 'react'
import { PlusCircle, Pencil, Trash2, ArrowRightCircle, CheckCircle2, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  createBookingService,
  updateBookingService,
  deleteBookingService,
  bulkDeleteBookingServices,
  pushToCommissions,
  importFromSubmission,
} from './booking-services-actions'
import type { BookingService } from './booking-services-actions'

const inputCls = 'w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-[#1f5772]'

function fmt(date: string | null) {
  if (!date) return null
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtMoney(usd: number | null, xcd: number | null) {
  const parts: string[] = []
  if (usd != null) parts.push(`$${usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  if (xcd != null) parts.push(`EC$${xcd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  return parts.join(' / ') || null
}

// ── Service Form ───────────────────────────────────────────────────────────────

interface Provider { id: string; name: string; primary_service: string | null }

function ServiceForm({
  bookingId,
  service,
  providers,
  onDone,
}: {
  bookingId: string
  service?: BookingService
  providers: Provider[]
  onDone: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Service name — controlled so provider selection can auto-fill it
  const [serviceName, setServiceName] = useState(service?.service_name ?? '')

  // Provider dropdown — match by stored provider name, or auto-match by primary_service
  const existingProvider = service?.provider ?? ''
  const matchedByName = providers.find(p => p.name === existingProvider)
  const matchedByService = !existingProvider && service?.service_name
    ? providers.find(p => p.primary_service?.toLowerCase() === service.service_name.toLowerCase())
    : null
  const matchedProvider = matchedByName ?? matchedByService ?? null
  const [selectedProvider, setSelectedProvider] = useState(
    matchedProvider ? matchedProvider.name : (existingProvider ? '__other__' : '')
  )
  const [otherProvider, setOtherProvider] = useState(
    matchedProvider || !existingProvider ? '' : existingProvider
  )
  const resolvedProvider = selectedProvider === '__other__' ? otherProvider : selectedProvider

  function handleProviderChange(val: string) {
    setSelectedProvider(val)
    // Auto-fill service name from primary_service only when field is empty
    if (!serviceName) {
      const p = providers.find(pr => pr.name === val)
      if (p?.primary_service) setServiceName(p.primary_service)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('provider', resolvedProvider)
    fd.set('service_name', serviceName)
    setError(null)
    startTransition(async () => {
      const err = service
        ? await updateBookingService(service.id, bookingId, fd)
        : await createBookingService(bookingId, fd)
      if (err) { setError(err); return }
      onDone()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded border border-gray-200 bg-blue-50 p-3 space-y-3">
      {service && <p className="text-xs font-semibold text-gray-600">Edit Service</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Service *</label>
          <input name="service_name" required placeholder="e.g. Turtle Tour"
            value={serviceName}
            onChange={e => setServiceName(e.target.value)}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
          <select
            value={selectedProvider}
            onChange={e => handleProviderChange(e.target.value)}
            className={`${inputCls} bg-white`}
          >
            <option value="">— None —</option>
            {providers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            <option value="__other__">Other…</option>
          </select>
          {selectedProvider === '__other__' && (
            <input
              value={otherProvider}
              onChange={e => setOtherProvider(e.target.value)}
              placeholder="Enter provider name"
              className={`${inputCls} mt-1`}
            />
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input name="service_date" type="date"
            defaultValue={service?.service_date ?? ''}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
          <input name="service_time" type="text" placeholder="e.g. 9:00 AM"
            defaultValue={service?.service_time ?? ''}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cost USD</label>
          <input name="cost_usd" type="number" step="0.01" min="0" placeholder="0.00"
            defaultValue={service?.cost_usd ?? ''}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cost XCD</label>
          <input name="cost_xcd" type="number" step="0.01" min="0" placeholder="0.00"
            defaultValue={service?.cost_xcd ?? ''}
            className={inputCls} />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Pickup / Meeting location</label>
          <input name="pickup_location" placeholder="e.g. Villa front gate, 8:45 AM"
            defaultValue={service?.pickup_location ?? ''}
            className={inputCls} />
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea name="notes" rows={2} placeholder="Additional details about this booking…"
            defaultValue={service?.notes ?? ''}
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="rounded bg-[#1f5772] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#174560] disabled:opacity-50">
          {isPending ? 'Saving…' : service ? 'Save Changes' : 'Add Service'}
        </button>
        <button type="button" onClick={onDone}
          className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Service Row ────────────────────────────────────────────────────────────────

function ServiceRow({
  service,
  bookingId,
  villaId,
  checkIn,
  providers,
}: {
  service: BookingService
  bookingId: string
  villaId: string | null
  checkIn: string
  providers: Provider[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)

  function handleDelete() {
    if (!confirm(`Delete "${service.service_name}"?`)) return
    startTransition(async () => {
      await deleteBookingService(service.id, bookingId)
      router.refresh()
    })
  }

  function handlePush() {
    if (!confirm(`Push "${service.service_name}" to Commissions? This will create an unpaid commission entry.`)) return
    setPushError(null)
    startTransition(async () => {
      const err = await pushToCommissions(service.id, bookingId, villaId, checkIn)
      if (err) { setPushError(err); return }
      router.refresh()
    })
  }

  if (editing) {
    return (
      <ServiceForm
        bookingId={bookingId}
        service={service}
        providers={providers}
        onDone={() => setEditing(false)}
      />
    )
  }

  const money = fmtMoney(service.cost_usd, service.cost_xcd)

  return (
    <div className="rounded border border-gray-100 bg-white p-3 text-xs">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{service.service_name}</p>
            {service.provider && (
              <span className="text-gray-400">· {service.provider}</span>
            )}
            {service.pushed_to_commissions && (
              <span className="flex items-center gap-0.5 text-green-600">
                <CheckCircle2 size={11} />
                <span>In commissions</span>
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-gray-500">
            {service.service_date && (
              <span>{fmt(service.service_date)}{service.service_time ? ` · ${service.service_time}` : ''}</span>
            )}
            {money && <span className="font-medium text-gray-700">{money}</span>}
            {service.pickup_location && (
              <span className="text-gray-400">📍 {service.pickup_location}</span>
            )}
          </div>

          {service.notes && (
            <p className="mt-1 text-gray-500 italic">{service.notes}</p>
          )}

          {pushError && <p className="mt-1 text-red-500">{pushError}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!service.pushed_to_commissions && (
            <button
              onClick={handlePush}
              disabled={isPending}
              title="Push to Commission Tracker"
              className="flex items-center gap-1 text-[#1f5772] hover:underline disabled:opacity-50"
            >
              <ArrowRightCircle size={13} />
              <span className="hidden sm:inline">Commissions</span>
            </button>
          )}
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-600">
            <Pencil size={12} />
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Panel ─────────────────────────────────────────────────────────────────

export default function BookingServicesPanel({
  bookingId,
  villaId,
  checkIn,
  initialServices,
  submissionActivityCount,
  providers,
}: {
  bookingId: string
  villaId: string | null
  checkIn: string
  initialServices: BookingService[]
  submissionActivityCount: number
  providers: Provider[]
}) {
  const router = useRouter()
  const [isPendingImport, startImport] = useTransition()
  const [isPendingBulk, startBulk] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [importMsg, setImportMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const totalUsd = initialServices.reduce((s, sv) => s + (sv.cost_usd ?? 0), 0)
  const totalXcd = initialServices.reduce((s, sv) => s + (sv.cost_xcd ?? 0), 0)

  const allSelected = initialServices.length > 0 && selected.size === initialServices.length
  const someSelected = selected.size > 0

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(initialServices.map(s => s.id)))
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} selected service${selected.size !== 1 ? 's' : ''}?`)) return
    const ids = Array.from(selected)
    startBulk(async () => {
      await bulkDeleteBookingServices(ids, bookingId)
      setSelected(new Set())
      router.refresh()
    })
  }

  function handleImport() {
    setImportMsg(null)
    startImport(async () => {
      const result = await importFromSubmission(bookingId)
      if (result.error) {
        setImportMsg({ text: result.error, ok: false })
      } else {
        const parts = []
        if (result.imported > 0) parts.push(`${result.imported} imported`)
        if (result.skipped > 0) parts.push(`${result.skipped} already exist, skipped`)
        setImportMsg({ text: parts.join(' · '), ok: true })
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Confirmed Services
          </p>
          {initialServices.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {initialServices.length} service{initialServices.length !== 1 ? 's' : ''}
              {totalUsd > 0 && ` · $${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`}
              {totalXcd > 0 && ` · EC$${totalXcd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {submissionActivityCount > 0 && (
            <button
              onClick={handleImport}
              disabled={isPendingImport}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1f5772] border border-gray-300 rounded px-2 py-1 hover:border-[#1f5772] transition-colors disabled:opacity-50"
            >
              <Download size={12} />
              {isPendingImport ? 'Importing…' : `Import from submission (${submissionActivityCount})`}
            </button>
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1 text-xs text-[#1f5772] hover:underline"
          >
            <PlusCircle size={13} />
            Add Service
          </button>
        </div>
      </div>

      {importMsg && (
        <p className={`mb-2 text-xs ${importMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
          {importMsg.text}
        </p>
      )}

      {showForm && (
        <div className="mb-3">
          <ServiceForm
            bookingId={bookingId}
            providers={providers}
            onDone={() => setShowForm(false)}
          />
        </div>
      )}

      {initialServices.length === 0 && !showForm ? (
        <p className="py-6 text-center text-xs text-gray-400 italic">
          No confirmed services yet. Add services after finalising with the guest.
        </p>
      ) : (
        <>
          {/* Select-all / bulk delete bar — only when list has items */}
          {initialServices.length > 0 && (
            <div className="mb-2 flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300 accent-[#1f5772]"
                />
                <span className="text-xs text-gray-500">Select all</span>
              </label>
              {someSelected && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isPendingBulk}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete {selected.size} selected
                </button>
              )}
            </div>
          )}

          <div className="space-y-2">
            {initialServices.map(svc => (
              <div key={svc.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(svc.id)}
                  onChange={() => toggleOne(svc.id)}
                  className="mt-3.5 rounded border-gray-300 accent-[#1f5772] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <ServiceRow
                    service={svc}
                    bookingId={bookingId}
                    villaId={villaId}
                    providers={providers}
                    checkIn={checkIn}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
