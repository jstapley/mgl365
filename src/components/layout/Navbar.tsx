'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'

interface VillaLink { name: string; slug: string }

const staticLinks = [
  { href: '/concierge-services', label: 'Concierge Services' },
  { href: '/about', label: 'About Us' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/contact', label: 'Contact Us' },
]

const PHONE = '+1 268-788-5675'
const PHONE_HREF = 'tel:+12687885675'

export default function Navbar({ villas = [] }: { villas?: VillaLink[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [villasOpen, setVillasOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVillasOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
            style={{ width: 'auto' }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/" className="text-sm font-light text-white transition-colors hover:text-[#C19B77]">
            Home
          </Link>

          {/* Our Villas with dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setVillasOpen(o => !o)}
              className="flex items-center gap-1 text-sm font-light text-white transition-colors hover:text-[#C19B77]"
            >
              Our Villas
              <ChevronDown size={13} className={`transition-transform duration-200 ${villasOpen ? 'rotate-180' : ''}`} />
            </button>

            {villasOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-52 border border-white/10 bg-[#1a4a63] shadow-xl">
                <Link
                  href="/our-villas"
                  onClick={() => setVillasOpen(false)}
                  className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white border-b border-white/10"
                >
                  All Villas
                </Link>
                {villas.map(v => (
                  <Link
                    key={v.slug}
                    href={`/our-villas/${v.slug}`}
                    onClick={() => setVillasOpen(false)}
                    className="block px-4 py-2.5 text-sm text-white hover:bg-white/10 hover:text-[#C19B77]"
                  >
                    {v.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {staticLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-light text-white transition-colors hover:text-[#C19B77]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Phone */}
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
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col border-t border-white/20 px-6 py-4 lg:hidden">
          <Link href="/" className="py-2 text-sm text-white hover:text-[#C19B77]" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {/* Mobile villas group */}
          <div>
            <Link
              href="/our-villas"
              className="block py-2 text-sm text-white hover:text-[#C19B77]"
              onClick={() => setMenuOpen(false)}
            >
              Our Villas
            </Link>
            {villas.map(v => (
              <Link
                key={v.slug}
                href={`/our-villas/${v.slug}`}
                className="block py-1.5 pl-4 text-sm text-white/70 hover:text-[#C19B77]"
                onClick={() => setMenuOpen(false)}
              >
                {v.name}
              </Link>
            ))}
          </div>

          {staticLinks.map(link => (
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
