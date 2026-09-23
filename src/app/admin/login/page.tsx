'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1f5772]">MGL 365</p>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] focus:ring-1 focus:ring-[#1f5772]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1f5772] focus:ring-1 focus:ring-[#1f5772]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#1f5772] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#174560] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
