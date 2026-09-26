import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative w-full">
      <div
        className="relative h-[660px] w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      >
        {/* Overlay card — centered in the image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] max-w-[900px] min-w-[340px] shadow-2xl ring-1 ring-white/40 bg-[#1c4f6a]">
          <div className="px-4 sm:px-6 py-5 sm:py-6 text-center text-white">

            <h1 className="font-[var(--font-playfair)] text-[1.3rem] sm:text-[1.65rem] md:text-[1.9rem] font-semibold uppercase tracking-[0.04em] leading-[1.4]">
              Premium Villa Rentals &amp; Property<br />
              Management in Antigua
            </h1>

            {/* Divider */}
            <div className="my-3 flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-white/35" />
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="opacity-50">
                <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
                <circle cx="10" cy="10" r="3" fill="white" />
              </svg>
              <div className="h-px w-10 bg-white/35" />
            </div>

            <p className="mb-3 text-[0.6rem] font-light uppercase tracking-[0.28em] text-white/75">
              Where Homes Are Cared For and Dreams Come True
            </p>

            <Link
              href="/contact"
              className="inline-block border border-white/70 px-8 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-[#1c4f6a]"
            >
              Book Your Luxury Stay
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}
