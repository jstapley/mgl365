import Link from 'next/link'
import { getServiceSupabase } from '@/lib/supabase'
import { Building2, ConciergeBell, CalendarDays, Mail, Users, Wrench, AlertTriangle, Clock } from 'lucide-react'

async function getStats() {
  const supabase = getServiceSupabase()
  const [villas, services, bookings, contacts, clients] = await Promise.all([
    supabase.from('villas').select('id', { count: 'exact', head: true }),
    supabase.from('services').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
  ])
  return {
    villas: villas.count ?? 0,
    services: services.count ?? 0,
    activeBookings: bookings.count ?? 0,
    unreadContacts: contacts.count ?? 0,
    clients: clients.count ?? 0,
  }
}

interface MaintenanceItem {
  id: string
  name: string
  next_due: string
  villas: { name: string } | null
}

async function getUpcomingMaintenance(): Promise<MaintenanceItem[]> {
  const supabase = getServiceSupabase()
  const today = new Date()
  const in7Days = new Date(today)
  in7Days.setDate(today.getDate() + 7)

  const todayStr = today.toISOString().slice(0, 10)
  const in7DaysStr = in7Days.toISOString().slice(0, 10)

  const { data } = await supabase
    .from('maintenance_schedules')
    .select('id, name, next_due, villas(name)')
    .eq('active', true)
    .lte('next_due', in7DaysStr)
    .order('next_due', { ascending: true })

  return (data ?? []) as MaintenanceItem[]
}

const cards = [
  { label: 'Villas', href: '/admin/villas', icon: Building2, key: 'villas' as const },
  { label: 'Services', href: '/admin/services', icon: ConciergeBell, key: 'services' as const },
  { label: 'Active Bookings', href: '/admin/bookings', icon: CalendarDays, key: 'activeBookings' as const },
  { label: 'Unread Messages', href: '/admin/contact', icon: Mail, key: 'unreadContacts' as const },
  { label: 'Clients', href: '/admin/clients', icon: Users, key: 'clients' as const },
]

export default async function AdminDashboard() {
  const [stats, upcoming] = await Promise.all([getStats(), getUpcomingMaintenance()])
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(({ label, href, icon: Icon, key }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <Icon size={20} className="text-[#1f5772]" strokeWidth={1.8} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats[key]}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Maintenance widget */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-[#1f5772]" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold text-gray-700">Maintenance Due This Week</h2>
          </div>
          <Link href="/admin/maintenance" className="text-xs text-[#1f5772] hover:underline">
            View all
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded border border-gray-200 bg-white px-5 py-6 text-center text-sm text-gray-400">
            No maintenance items due in the next 7 days.
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-gray-200 bg-white divide-y divide-gray-100">
            {upcoming.map((item) => {
              const overdue = item.next_due < today
              const daysAway = Math.round(
                (new Date(item.next_due).getTime() - new Date(today).getTime()) / 86400000
              )
              return (
                <Link
                  key={item.id}
                  href={`/admin/maintenance/${item.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {overdue ? (
                      <AlertTriangle size={15} className="shrink-0 text-red-500" strokeWidth={1.8} />
                    ) : (
                      <Clock size={15} className="shrink-0 text-amber-500" strokeWidth={1.8} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      {item.villas && (
                        <p className="text-xs text-gray-500">{item.villas.name}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    overdue
                      ? 'bg-red-100 text-red-700'
                      : daysAway === 0
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {overdue
                      ? `${Math.abs(daysAway)}d overdue`
                      : daysAway === 0
                      ? 'Due today'
                      : `Due in ${daysAway}d`}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
