import { notFound } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import Image from 'next/image'
import HousekeeperCalendar from './HousekeeperCalendar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export interface BookingRow {
  id: string
  villa_name: string
  check_in: string
  check_out: string
  booking_type: 'guest' | 'owner'
  midstay_clean_date: string | null
  status: string
}

export default async function HousekeeperPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const expected = process.env.HOUSEKEEPER_TOKEN
  if (!expected || token !== expected) notFound()

  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, booking_type, midstay_clean_date, status, villa:villas(name)')
    .neq('status', 'cancelled')
    .order('check_in')

  const bookings: BookingRow[] = (data ?? [])
    .map((b: any) => ({
      id: b.id,
      villa_name: b.villa?.name ?? '',
      check_in: b.check_in,
      check_out: b.check_out,
      booking_type: b.booking_type ?? 'guest',
      midstay_clean_date: b.midstay_clean_date ?? null,
      status: b.status,
    }))
    .filter((b: BookingRow) => b.villa_name)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1f5772] px-4 py-3 shadow">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="rounded-lg bg-white px-2 py-1.5">
            <Image
              src="/logo.png"
              alt="MGL 365 Management"
              width={100}
              height={30}
              className="h-7 w-auto object-contain"
              style={{ width: 'auto' }}
              priority
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Housekeeping</p>
            <p className="text-xs text-white/60 leading-tight">Schedule</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-3 py-4">
        <HousekeeperCalendar bookings={bookings} />
      </main>
    </div>
  )
}
