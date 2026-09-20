'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/our-villas', label: 'Our Villas' },
  { href: '/concierge-services', label: 'Concierge Services' },
  { href: '/about', label: 'About Us' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/contact', label: 'Contact Us' },
]

const PHONE = '+1 268-788-5675'
const PHONE_HREF = 'tel:+12687885675'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="w-full bg-[#1f5772]">
      <div className="mx-auto flex max-w-[1170px] items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="MGL 365 Management"
            width={50}
            height={50}
            className="h-[50px] w-auto"
          />
        </Link>

        {/* Desktop nav — center */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-light text-white transition-colors hover:text-[#C19B77]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Phone — right */}
        <a
          href={PHONE_HREF}
          className="hidden items-center gap-2 text-sm font-light text-white transition-colors hover:text-[#C19B77] lg:flex"
        >
          <Phone size={14} />
          {PHONE}
        </a>

        {/* Mobile toggle */}
        <button
          className="text-white lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col border-t border-white/20 px-6 py-4 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm text-white hover:text-[#C19B77]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={PHONE_HREF}
            className="mt-3 flex items-center gap-2 border-t border-white/20 pt-3 text-sm text-white"
          >
            <Phone size={14} />
            {PHONE}
          </a>
        </nav>
      )}
    </header>
  )
}
