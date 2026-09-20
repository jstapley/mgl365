import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative w-full">
      {/* Background image */}
      <div className="relative h-[600px] w-full">
        <Image
          src="/images/hero-bg.jpg"
          alt="MGL 365 Luxury Villa pool with ocean view"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Teal overlay card — bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-full max-w-2xl bg-[#1f5772]/95 px-10 py-10 text-center text-white">
          <h1 className="font-[var(--font-playfair)] text-3xl font-bold uppercase tracking-widest sm:text-4xl">
            Premium Villa Rentals &amp; Property
            <br />
            Management in Antigua
          </h1>

          {/* Decorative divider */}
          <div className="my-5 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-white/50" />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="opacity-70">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3" fill="white" />
            </svg>
            <div className="h-px w-16 bg-white/50" />
          </div>

          <p className="mb-6 text-xs font-light uppercase tracking-[0.2em] text-white/90">
            Where Homes Are Cared For and Dreams Come True
          </p>

          <Link
            href="/contact"
            className="inline-block border border-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white hover:text-[#1f5772]"
          >
            Book Your Luxury Stay
          </Link>
        </div>
      </div>

      {/* Spacer so the overlay card doesn't clip content below */}
      <div className="h-28 bg-white" />
    </section>
  )
}
