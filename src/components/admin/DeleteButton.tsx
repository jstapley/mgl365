'use client'

interface DeleteButtonProps {
  action: () => Promise<void>
  label?: string
}

export default function DeleteButton({ action, label = 'Delete' }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => { if (!confirm('Are you sure?')) e.preventDefault() }}
      className="inline"
    >
      <button type="submit" className="text-red-500 hover:underline">
        {label}
      </button>
    </form>
  )
}
