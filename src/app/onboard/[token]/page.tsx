import { notFound } from 'next/navigation'
import { getServiceSupabase } from '@/lib/supabase'
import OnboardWizard from './OnboardWizard'

async function getData(token: string) {
  const supabase = getServiceSupabase()

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, check_in, check_out, onboarding_completed_at,
      villas(id, name),
      clients(name, email, phone)
    `)
    .eq('onboarding_token', token)
    .single()

  if (!booking) notFound()

  const villaId = (booking.villas as any)?.id

  const [liabilityRes, activitiesRes] = await Promise.all([
    supabase
      .from('liability_forms')
      .select('content')
      .eq('villa_id', villaId)
      .single(),
    supabase
      .from('activities')
      .select('id, name, description, price, duration, category, villa_id, sort_order')
      .eq('active', true)
      .or(`villa_id.is.null,villa_id.eq.${villaId}`)
      .order('category')
      .order('sort_order'),
  ])

  return {
    booking: booking as any,
    liabilityContent: liabilityRes.data?.content ?? null,
    activities: (activitiesRes.data ?? []) as any[],
  }
}

export default async function OnboardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const { booking, liabilityContent, activities } = await getData(token)

  if (booking.onboarding_completed_at) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center">
        <p className="font-medium text-green-800">You&apos;ve already submitted your onboarding information.</p>
        <p className="mt-1 text-sm text-green-700">
          Contact your property manager if you need to make changes.
        </p>
      </div>
    )
  }

  return (
    <OnboardWizard
      token={token}
      booking={booking}
      liabilityContent={liabilityContent}
      activities={activities}
    />
  )
}
