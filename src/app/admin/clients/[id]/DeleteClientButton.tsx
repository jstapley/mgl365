'use client'

import { useTransition } from 'react'
import { deleteClient } from '../actions'

export default function DeleteClientButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    startTransition(() => deleteClient(id))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="rounded border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? 'Deleting…' : 'Delete Client'}
    </button>
  )
}
