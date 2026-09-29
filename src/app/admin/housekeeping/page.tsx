import { getServiceSupabase } from '@/lib/supabase'
import HousekeepingClient from './HousekeepingClient'

export interface BookingRow {
  id: string
  villa_name: string
  check_in: string
  check_out: string
  booking_type: 'guest' | 'owner'
  midstay_clean_date: string | null
  status: string
}

export default async function HousekeepingPage() {
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Housekeeping</h1>
      </div>
      <HousekeepingClient bookings={bookings} />
    </div>
  )
}
