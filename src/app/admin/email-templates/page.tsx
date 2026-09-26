import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { Mail, CheckCircle, XCircle } from 'lucide-react'

async function getTemplates() {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: true })
  return data ?? []
}

const TRIGGER_LABELS: Record<string, string> = {
  booking_pending:     'New Booking (Pending)',
  onboarding_complete: 'Onboarding Complete',
}

export default async function EmailTemplatesPage() {
  const templates = await getTemplates()

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage automated emails sent to guests when booking events occur.
        </p>
      </div>

      <div className="space-y-3">
        {templates.map((t: any) => (
          <div key={t.id} className="flex items-center justify-between rounded border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 shrink-0 text-[#1f5772]" />
              <div>
                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">
                  Trigger: {TRIGGER_LABELS[t.trigger] ?? t.trigger}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 truncate max-w-md">{t.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {t.active ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle size={12} /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <XCircle size={12} /> Inactive
                </span>
              )}
              <Link
                href={`/admin/email-templates/${t.id}`}
                className="rounded bg-[#1f5772] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#174560]"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">Available template variables</p>
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
          {[
            ['{{guest_name}}', 'Guest full name'],
            ['{{guest_first_name}}', 'Guest first name'],
            ['{{villa_name}}', 'Villa name'],
            ['{{check_in}}', 'Check-in date'],
            ['{{check_out}}', 'Check-out date'],
            ['{{booking_link}}', 'Link to booking/onboarding form'],
          ].map(([variable, desc]) => (
            <div key={variable} className="flex gap-2">
              <code className="font-mono text-[#1f5772]">{variable}</code>
              <span>— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
