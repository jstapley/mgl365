import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guest Onboarding | MGL 365 Management',
}

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MGL 365 Management" className="h-10 w-auto" />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        MGL 365 Management · Antigua
      </footer>
    </div>
  )
}
