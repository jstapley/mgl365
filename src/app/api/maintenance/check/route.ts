import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

// Protect this endpoint with a secret so only your cron job can call it.
// Set CRON_SECRET in .env.local and pass it as ?secret=xxx

export async function GET(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const CRON_SECRET = process.env.CRON_SECRET
  const { searchParams } = new URL(request.url)

  if (CRON_SECRET && searchParams.get('secret') !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Fetch all active schedules with villa name
  const { data: schedules, error } = await supabase
    .from('maintenance_schedules')
    .select('*, villa:villas(id, name)')
    .eq('active', true)
    .not('notify_email', 'is', null)
    .not('next_due', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const sent: string[] = []
  const skipped: string[] = []

  for (const schedule of schedules ?? []) {
    const nextDue = new Date(schedule.next_due + 'T00:00:00')
    const daysUntilDue = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Send if overdue OR within the notify window
    if (daysUntilDue <= schedule.notify_days_before) {
      const isOverdue = daysUntilDue < 0
      const villaName = schedule.villa?.name ?? 'Unknown Villa'

      const subject = isOverdue
        ? `⚠️ OVERDUE: ${schedule.name} — ${villaName}`
        : `🔔 Maintenance Due: ${schedule.name} — ${villaName}`

      const body = isOverdue
        ? `This maintenance task is ${Math.abs(daysUntilDue)} day(s) overdue.\n\nTask: ${schedule.name}\nVilla: ${villaName}\nWas due: ${schedule.next_due}\nFrequency: Every ${schedule.frequency_days} days\n\n${schedule.description ?? ''}`
        : `This maintenance task is due in ${daysUntilDue} day(s).\n\nTask: ${schedule.name}\nVilla: ${villaName}\nDue: ${schedule.next_due}\nFrequency: Every ${schedule.frequency_days} days\n\n${schedule.description ?? ''}`

      await resend.emails.send({
        from: 'MGL 365 Admin <noreply@mgl365.com>',
        to: schedule.notify_email,
        subject,
        text: body,
      })

      sent.push(`${schedule.name} → ${schedule.notify_email}`)
    } else {
      skipped.push(`${schedule.name} (due in ${daysUntilDue} days)`)
    }
  }

  return NextResponse.json({ sent, skipped })
}
