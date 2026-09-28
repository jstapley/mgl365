import AdminShell from '@/components/admin/AdminShell'

export const revalidate = 0

export const metadata = {
  title: 'MGL 365 Admin',
  manifest: '/admin-manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'MGL 365 Admin',
    statusBarStyle: 'black-translucent' as const,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
