'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, CalendarDays, CalendarRange, ConciergeBell, Compass, Mail, Wrench, ClipboardList, MailOpen } from 'lucide-react'
import { logout } from '@/app/admin/actions'

const links = [
  { href: '/admin',            label: 'Dashboard',          icon: LayoutDashboard, exact: true  },
  { href: '/admin/villas',     label: 'Villas',             icon: Building2,       exact: false },
  { href: '/admin/clients',    label: 'Clients',            icon: Users,           exact: false },
  { href: '/admin/bookings',   label: 'Bookings',           icon: CalendarDays,    exact: false },
  { href: '/admin/calendar',   label: 'Calendar',           icon: CalendarRange,   exact: false },
  { href: '/admin/services',   label: 'Concierge Services', icon: ConciergeBell,   exact: false },
  { href: '/admin/activities',  label: 'Activities',        icon: Compass,         exact: false },
  { href: '/admin/contact',    label: 'Contact',            icon: Mail,            exact: false },
  { href: '/admin/maintenance', label: 'Maintenance',       icon: Wrench,          exact: false },
  { href: '/admin/forms',           label: 'Forms',            icon: ClipboardList, exact: false },
  { href: '/admin/email-templates', label: 'Email Templates',  icon: MailOpen,      exact: false },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col bg-[#1f5772]">
      {/* Logo */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="rounded-lg bg-white px-3 py-2">
          <Image
            src="/logo.png"
            alt="MGL 365 Management"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
            style={{ width: 'auto' }}
            priority
          />
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-white/15 font-medium text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="border-t border-white/10 px-3 py-4">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
