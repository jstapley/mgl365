import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative w-full">
      {/* Background image — tall enough to show the pool + ocean */}
      <div className="relative h-[680px] w-full">
        <Image
          src="/images/hero-bg.JPG"
          alt="MGL 365 Luxury Villa pool with ocean view"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Teal overlay card — bottom center, half-overlapping next section */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[calc(100%-2rem)] max-w-[680px] bg-[#1f5772]/95 px-12 py-10 text-center text-white shadow-xl">

          <h1 className="font-[var(--font-playfair)] text-2xl font-bold uppercase tracking-[0.18em] sm:text-3xl md:text-[2rem] leading-snug">
            Premium Villa Rentals &amp; Property
            <br />
            Management in Antigua
          </h1>

          {/* Decorative divider */}
          <div className="my-5 flex items-center justify-center gap-3">
            <div className="h-px w-14 bg-white/40" />
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="opacity-60">
              <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="3" fill="white" />
            </svg>
            <div className="h-px w-14 bg-white/40" />
          </div>

          <p className="mb-7 text-[0.65rem] font-light uppercase tracking-[0.28em] text-white/85">
            Where Homes Are Cared For and Dreams Come True
          </p>

          <Link
            href="/contact"
            className="inline-block border border-white px-10 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-[#1f5772]"
          >
            Book Your Luxury Stay
          </Link>
        </div>
      </div>

      {/* Spacer so the overlay card doesn't clip content below */}
      <div className="h-40 bg-white" />
    </section>
  )
}
