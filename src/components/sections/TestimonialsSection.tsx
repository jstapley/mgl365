const testimonials = [
  {
    name: 'Sue D.',
    quote:
      '"Best family vacation ever. This was our first time to Antigua. The property was beyond our expectations. Jamie was so helpful and responsive to all our needs"',
    rating: 5,
  },
  {
    name: 'France L.',
    quote:
      '"An unforgettable stay! Great hosts. Breathtaking views, well located, close to beautiful beaches, good restaurants and many other activities. I loved it 🏄"',
    rating: 5,
  },
  {
    name: 'Savaly V.',
    quote:
      '"Wow, simply Wow. Our stay was fantastic, with lots of beautiful beaches nearby. You feel at home, the view is breathtaking, even from your bed. It\'s paradise on earth. The hosts are sweethearts. Come and see… an unforgettable vacation :)"',
    rating: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex justify-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-[#C19B77] text-lg">
          ★
        </span>
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-16 bg-[#F6F6FF] py-16">
      <div className="mx-auto max-w-[1170px] px-6">
        <h2 className="mb-12 text-center font-[var(--font-playfair)] text-5xl text-[#000321]">
          Our Clients Say
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col overflow-hidden rounded shadow-sm">
              {/* Quote area — teal */}
              <div className="flex flex-1 flex-col items-center bg-[#1f5772] px-8 py-8 text-center">
                <p className="text-sm leading-7 text-white/90">{t.quote}</p>

                {/* Divider with logo mark */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px w-10 bg-[#C19B77]" />
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="opacity-60">
                    <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.5" />
                    <circle cx="11" cy="11" r="3.5" fill="white" />
                  </svg>
                  <div className="h-px w-10 bg-[#C19B77]" />
                </div>
              </div>

              {/* Name + stars — white */}
              <div className="bg-white px-8 py-5 text-center">
                <p className="mb-1 font-semibold text-[#1f5772]">{t.name}</p>
                <Stars count={t.rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
