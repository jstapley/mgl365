'use client'

import { useState, useTransition } from 'react'
import { PlusCircle, Trash2, ChevronLeft, Pencil, ExternalLink, Copy, Check } from 'lucide-react'
import { createLink, updateLink, toggleLink, deleteLink } from './actions'
import { useRouter } from 'next/navigation'

// ── Types & Constants ──────────────────────────────────────────────────────────

interface TrackingLink {
  id: string
  slug: string
  label: string
  destination_url: string
  villa_id: string | null
  channel: string
  active: boolean
  created_at: string
  villas: { name: string } | null
}

interface TrackingClick {
  id: string
  link_id: string
  clicked_at: string
  referrer: string | null
  device_type: string | null
}

interface Villa {
  id: string
  name: string
}

const CHANNELS: Record<string, { label: string; medium: string; color: string }> = {
  instagram: { label: 'Instagram', medium: 'social',   color: 'bg-pink-100 text-pink-700'   },
  facebook:  { label: 'Facebook',  medium: 'social',   color: 'bg-blue-100 text-blue-700'   },
  whatsapp:  { label: 'WhatsApp',  medium: 'social',   color: 'bg-green-100 text-green-700' },
  email:     { label: 'Email',     medium: 'email',    color: 'bg-purple-100 text-purple-700'},
  other:     { label: 'Other',     medium: 'referral', color: 'bg-gray-100 text-gray-600'   },
}

const VILLA_UTM: Record<string, string> = {
  'Cool House':           'cool_house',
  'Water Edge':           'water_edge',
  'Starfish House Lower': 'starfish_lower',
  'Starfish House Upper': 'starfish_upper',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function cleanReferrer(ref: string | null): string {
  if (!ref) return 'Direct'
  try { return new URL(ref).hostname.replace(/^www\./, '') } catch { return ref.slice(0, 40) }
}

function buildDestinationUrl(base: string, source: string, medium: string, campaign: string, content: string): string {
  if (!base) return ''
  try {
    const url = new URL(base)
    if (source)   url.searchParams.set('utm_source', source)
    if (medium)   url.searchParams.set('utm_medium', medium)
    if (campaign) url.searchParams.set('utm_campaign', campaign)
    if (content)  url.searchParams.set('utm_content', content)
    return url.toString()
  } catch {
    return base
  }
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// ── Copy Button ────────────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ── Link Form (Create + Edit) ──────────────────────────────────────────────────

function LinkForm({ villas, link, onCancel, onSaved }: {
  villas: Villa[]
  link?: TrackingLink
  onCancel: () => void
  onSaved: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [label, setLabel]           = useState(link?.label ?? '')
  const [slug, setSlug]             = useState(link?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!link)
  const [channel, setChannel]       = useState(link?.channel ?? 'instagram')
  const [villaId, setVillaId]       = useState(link?.villa_id ?? '')

  // Parse existing URL into UTM parts when editing
  const parseUtm = (param: string) => {
    if (!link?.destination_url) return ''
    try { return new URL(link.destination_url).searchParams.get(param) ?? '' } catch { return '' }
  }
  const stripUtm = (url: string) => {
    if (!url) return ''
    try {
      const u = new URL(url)
      ;['utm_source','utm_medium','utm_campaign','utm_content'].forEach(p => u.searchParams.delete(p))
      return u.toString()
    } catch { return url }
  }

  const [baseUrl, setBaseUrl]         = useState(() => stripUtm(link?.destination_url ?? ''))
  const [utmSource, setUtmSource]     = useState(() => parseUtm('utm_source') || 'mgl365')
  const [utmMedium, setUtmMedium]     = useState(() => parseUtm('utm_medium') || CHANNELS[channel]?.medium || 'social')
  const [utmCampaign, setUtmCampaign] = useState(() => parseUtm('utm_campaign'))
  const [utmContent, setUtmContent]   = useState(() => parseUtm('utm_content'))

  const destinationUrl = buildDestinationUrl(baseUrl, utmSource, utmMedium, utmCampaign, utmContent)

  function handleLabelChange(val: string) {
    setLabel(val)
    if (!slugManual) setSlug(slugify(val))
  }

  function handleChannelChange(val: string) {
    setChannel(val)
    setUtmMedium(CHANNELS[val]?.medium ?? 'social')
  }

  function handleVillaChange(val: string) {
    setVillaId(val)
    if (val) {
      const v = villas.find(v => v.id === val)
      if (v) setUtmCampaign(VILLA_UTM[v.name] ?? slugify(v.name))
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!destinationUrl) { setError('Please enter a valid base URL.'); return }
    const fd = new FormData()
    fd.set('slug', slug)
    fd.set('label', label)
    fd.set('destination_url', destinationUrl)
    fd.set('villa_id', villaId)
    fd.set('channel', channel)
    setError(null)
    startTransition(async () => {
      const err = link ? await updateLink(link.id, fd) : await createLink(fd)
      if (err) { setError(err); return }
      onSaved()
      router.refresh()
    })
  }

  const inputCls = 'w-full rounded border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#1f5772]'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded border border-gray-200 bg-blue-50 p-4">
      {link && <p className="text-xs font-semibold text-gray-600">Edit Link</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Label *</label>
          <input required value={label} onChange={e => handleLabelChange(e.target.value)}
            placeholder="e.g. Starfish House — Instagram Bio"
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Slug * <span className="font-normal text-gray-400">(becomes /go/slug)</span>
          </label>
          <input required value={slug}
            onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
            placeholder="e.g. starfish-ig"
            className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Channel *</label>
          <select value={channel} onChange={e => handleChannelChange(e.target.value)} className={`${inputCls} bg-white`}>
            {Object.entries(CHANNELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Villa</label>
          <select value={villaId} onChange={e => handleVillaChange(e.target.value)} className={`${inputCls} bg-white`}>
            <option value="">— All properties —</option>
            {villas.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      {/* UTM Builder */}
      <div className="rounded border border-gray-200 bg-white p-3 space-y-3">
        <p className="text-xs font-semibold text-gray-600">UTM Link Builder</p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Base URL * <span className="font-normal text-gray-400">(listing URL, no UTM params)</span>
          </label>
          <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://www.airbnb.com/h/starfishhouselower"
            className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">utm_source</label>
            <input value={utmSource} onChange={e => setUtmSource(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">utm_medium</label>
            <input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">utm_campaign</label>
            <input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)}
              placeholder="e.g. cool_house" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              utm_content <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input value={utmContent} onChange={e => setUtmContent(e.target.value)}
              placeholder="bio, story, post…" className={inputCls} />
          </div>
        </div>
        {destinationUrl && (
          <div className="rounded bg-gray-50 px-3 py-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Final destination URL:</p>
            <p className="text-xs text-[#1f5772] break-all font-mono">{destinationUrl}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="rounded bg-[#1f5772] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#174560] disabled:opacity-50">
          {isPending ? 'Saving…' : link ? 'Save Changes' : 'Create Link'}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded border border-gray-300 px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Link Detail + Analytics ────────────────────────────────────────────────────

function LinkDetail({ link, clicks, villas, onBack }: {
  link: TrackingLink
  clicks: TrackingClick[]
  villas: Villa[]
  onBack: () => void
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)

  const linkClicks = clicks.filter(c => c.link_id === link.id)
  const last30 = linkClicks.filter(c => new Date(c.clicked_at) >= daysAgo(30))
  const last7  = linkClicks.filter(c => new Date(c.clicked_at) >= daysAgo(7))

  // Daily clicks — last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().slice(0, 10)
  })
  const clicksByDay = last14Days.map(day => ({
    day,
    label: new Date(day + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: linkClicks.filter(c => c.clicked_at.slice(0, 10) === day).length,
  }))
  const maxDayCount = Math.max(...clicksByDay.map(d => d.count), 1)

  // Device breakdown
  const deviceCounts = linkClicks.reduce<Record<string, number>>((acc, c) => {
    const d = c.device_type ?? 'unknown'
    acc[d] = (acc[d] ?? 0) + 1
    return acc
  }, {})

  // Top referrers
  const referrerCounts = linkClicks.reduce<Record<string, number>>((acc, c) => {
    const r = cleanReferrer(c.referrer)
    acc[r] = (acc[r] ?? 0) + 1
    return acc
  }, {})
  const topReferrers = Object.entries(referrerCounts).sort(([, a], [, b]) => b - a).slice(0, 5)

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/go/${link.slug}`
    : `/go/${link.slug}`

  const channelInfo = CHANNELS[link.channel] ?? CHANNELS.other

  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(false)}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft size={16} /> Back to analytics
        </button>
        <LinkForm villas={villas} link={link}
          onCancel={() => setEditing(false)}
          onSaved={() => { setEditing(false); router.refresh() }} />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-start gap-3">
        <button onClick={onBack} className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 shrink-0">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">{link.label}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${channelInfo.color}`}>{channelInfo.label}</span>
            {!link.active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">Inactive</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs text-[#1f5772]">{publicUrl}</code>
            <CopyButton text={publicUrl} />
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <button onClick={() => setEditing(true)}
          className="shrink-0 flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
          <Pencil size={12} /> Edit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Clicks', value: linkClicks.length },
          { label: 'Last 30 Days', value: last30.length },
          { label: 'Last 7 Days',  value: last7.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      <div className="mb-5 rounded border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold text-gray-600 mb-4">Clicks — Last 14 Days</p>
        {linkClicks.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-6">No clicks yet. Share the link to start tracking.</p>
        ) : (
          <div className="flex items-end gap-1 h-24">
            {clicksByDay.map(({ day, label, count }) => (
              <div key={day} className="relative flex-1 flex flex-col items-center group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-1.5 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  {label}: {count}
                </div>
                <div
                  className="w-full bg-[#1f5772] rounded-t hover:bg-[#174560] transition-colors"
                  style={{ height: `${Math.max((count / maxDayCount) * 80, count > 0 ? 4 : 2)}px` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Device + Referrer */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
        <div className="rounded border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-600 mb-3">By Device</p>
          {Object.keys(deviceCounts).length === 0 ? (
            <p className="text-xs text-gray-400 italic">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(deviceCounts).sort(([, a], [, b]) => b - a).map(([device, count]) => (
                <div key={device} className="flex items-center gap-2">
                  <span className="w-16 text-xs capitalize text-gray-600">{device}</span>
                  <div className="flex-1 rounded-full bg-gray-100 h-2">
                    <div className="rounded-full bg-[#1f5772] h-2 transition-all"
                      style={{ width: `${(count / linkClicks.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-600 mb-3">Top Referrers</p>
          {topReferrers.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {topReferrers.map(([ref, count]) => (
                <div key={ref} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 truncate">{ref}</span>
                  <span className="text-xs font-medium text-gray-800 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Destination URL */}
      <div className="rounded border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs font-medium text-gray-500 mb-1">Destination URL</p>
        <p className="text-xs text-gray-700 break-all font-mono">{link.destination_url}</p>
      </div>
    </div>
  )
}

// ── Main List View ─────────────────────────────────────────────────────────────

export default function TrackingClient({ links, clicks, villas }: {
  links: TrackingLink[]
  clicks: TrackingClick[]
  villas: Villa[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedLink, setSelectedLink] = useState<TrackingLink | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  function handleToggle(link: TrackingLink) {
    startTransition(async () => {
      await toggleLink(link.id, !link.active)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this link and all its click data?')) return
    startTransition(async () => {
      await deleteLink(id)
      setSelectedLink(null)
      router.refresh()
    })
  }

  // Show detail view
  if (selectedLink) {
    const current = links.find(l => l.id === selectedLink.id) ?? selectedLink
    return (
      <LinkDetail
        link={current}
        clicks={clicks}
        villas={villas}
        onBack={() => setSelectedLink(null)}
      />
    )
  }

  const totalClicks  = (link: TrackingLink) => clicks.filter(c => c.link_id === link.id).length
  const last30Clicks = (link: TrackingLink) =>
    clicks.filter(c => c.link_id === link.id && new Date(c.clicked_at) >= daysAgo(30)).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{links.length} link{links.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 rounded bg-[#1f5772] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#174560]">
          <PlusCircle size={13} /> New Link
        </button>
      </div>

      {showCreate && (
        <LinkForm
          villas={villas}
          onCancel={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); router.refresh() }}
        />
      )}

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        {links.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-gray-400 italic">
            No links yet. Create your first tracking link.
          </p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {['Link', 'Channel', 'Villa', 'Last 30d', 'Total', 'Active', ''].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {links.map(link => {
                    const ch = CHANNELS[link.channel] ?? CHANNELS.other
                    return (
                      <tr key={link.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedLink(link)} className="text-left">
                            <p className="text-sm font-medium text-[#1f5772] hover:underline">{link.label}</p>
                            <p className="text-xs text-gray-400">/go/{link.slug}</p>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ch.color}`}>{ch.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{link.villas?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">{last30Clicks(link)}</td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-800">{totalClicks(link)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggle(link)} disabled={isPending}
                            className={`text-xs font-medium transition-colors ${link.active ? 'text-green-600 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'}`}>
                            {link.active ? 'On' : 'Off'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedLink(link)}
                              className="text-xs text-[#1f5772] hover:underline">
                              View
                            </button>
                            <button onClick={() => handleDelete(link.id)} disabled={isPending}
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
            <ul className="divide-y divide-gray-100 md:hidden">
              {links.map(link => {
                const ch = CHANNELS[link.channel] ?? CHANNELS.other
                return (
                  <li key={link.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => setSelectedLink(link)} className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1f5772]">{link.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`rounded-full px-1.5 py-0.5 text-xs ${ch.color}`}>{ch.label}</span>
                          <span className="text-xs text-gray-400">{totalClicks(link)} clicks</span>
                        </div>
                      </button>
                      <button onClick={() => handleDelete(link.id)} disabled={isPending}
                        className="shrink-0 text-gray-300 hover:text-red-500">
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
    </div>
  )
}
