'use client'

import type { BookingStatus } from '@/types'

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
}

const STATUS_INFO: Record<BookingStatus, { title: string; description: string; action: string }> = {
  pending: {
    title: 'Pending',
    description: 'New booking awaiting client action.',
    action: 'An email will be sent to the client asking them to complete the activity request form.',
  },
  confirmed: {
    title: 'Confirmed',
    description: 'Client has completed the activity request form.',
    action: 'Booking is confirmed and all arrangements are in progress.',
  },
  completed: {
    title: 'Completed',
    description: 'Stay has concluded.',
    action: 'An email will be sent to the client requesting feedback and a link to leave a Google Review.',
  },
  cancelled: {
    title: 'Cancelled',
    description: 'This booking has been cancelled.',
    action: 'No further action will be taken.',
  },
}

interface Props {
  status: BookingStatus
}

export default function BookingStatusBadge({ status }: Props) {
  const info = STATUS_INFO[status]

  return (
    <div className="group relative inline-block">
      <span className={`cursor-default rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
        {status}
      </span>

      {/* Tooltip */}
      <div className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 w-56 -translate-x-1/2 scale-95 rounded border border-gray-200 bg-white p-3 shadow-lg opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
        {/* Arrow */}
        <div className="absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-t border-l border-gray-200 bg-white" />

        <p className={`mb-1 text-xs font-semibold ${STATUS_STYLES[status].split(' ')[1]}`}>
          {info.title}
        </p>
        <p className="mb-1.5 text-xs text-gray-600">{info.description}</p>
        <p className="text-[11px] leading-4 text-gray-400">{info.action}</p>
      </div>
    </div>
  )
}
