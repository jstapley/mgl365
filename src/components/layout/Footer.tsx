import Link from 'next/link'
import { Phone } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1f5772] text-white">
      <div className="mx-auto max-w-[1170px] px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-[var(--font-playfair)] text-xl font-semibold">MGL 365 Management</p>
            <p className="mt-2 text-sm text-white/70">
              Premium villa rentals &amp; property management in Antigua.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">
              Quick Links
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              {[
                { href: '/our-villas', label: 'Our Villas' },
                { href: '/concierge-services', label: 'Concierge Services' },
                { href: '/about', label: 'About Us' },
                { href: '/faqs', label: 'FAQs' },
                { href: '/testimonials', label: 'Testimonials' },
                { href: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#C19B77] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60">
              Contact
            </p>
            <a
              href="tel:+12687885675"
              className="flex items-center gap-2 text-sm text-white/80 hover:text-[#C19B77] transition-colors"
            >
              <Phone size={14} />
              +1 268-788-5675
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/50">
          &copy; {year} MGL 365 Management. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
