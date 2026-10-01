'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Client } from '@/types'

export default function ClientsClient({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? clients.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.toLowerCase().includes(query.toLowerCase())
      )
    : clients

  return (
    <>
      <div className="mb-4 relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full rounded border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#1f5772]"
        />
      </div>

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nationality</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Since</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {query ? `No clients matching "${query}".` : 'No clients yet.'}
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c.nationality ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/clients/${c.id}`} className="text-[#1f5772] hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {query && filtered.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">{filtered.length} of {clients.length} clients</p>
      )}
    </>
  )
}
