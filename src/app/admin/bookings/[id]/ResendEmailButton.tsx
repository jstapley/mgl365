'use client'

import { useState, useTransition } from 'react'
import { resendBookingEmail, resendCompletedEmail } from '../actions'
import { Mail } from 'lucide-react'

function EmailButton({ label, action }: { label: string; action: () => Promise<string> }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  function handleClick() {
    setResult(null)
    startTransition(async () => {
      const r = await action()
      setResult(r)
    })
  }

  const isOk = result?.startsWith('OK:')

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-2 rounded border border-[#1f5772] px-3 py-1.5 text-xs font-medium text-[#1f5772] hover:bg-[#1f5772] hover:text-white transition-colors disabled:opacity-50"
      >
        <Mail size={13} />
        {isPending ? 'Sending…' : label}
      </button>
      {result && (
        <span className={`text-xs ${isOk ? 'text-green-600' : 'text-red-500'}`}>
          {isOk ? `Sent (id: ${result.slice(3)})` : result}
        </span>
      )}
    </div>
  )
}

export default function ResendEmailButtons({ bookingId }: { bookingId: string }) {
  return (
    <div className="flex flex-col gap-2">
      <EmailButton label="Send Confirmation Email" action={() => resendBookingEmail(bookingId)} />
      <EmailButton label="Send Thank You Email" action={() => resendCompletedEmail(bookingId)} />
    </div>
  )
}
