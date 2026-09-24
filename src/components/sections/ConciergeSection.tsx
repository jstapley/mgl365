import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const services = [
  {
    title: 'Private Chef',
    description: 'Customized, gourmet dining experiences prepared in the comfort of your villa.',
  },
  {
    title: 'Car & Golf Cart Rentals',
    description: 'Convenient transportation options for exploring the island with ease.',
  },
  {
    title: 'Excursions & Tours',
    description: "Tailored activities and guided experiences to discover Antigua's best.",
  },
  {
    title: 'Salon & Spa Services',
    description: 'Professional wellness and beauty treatments brought directly to you.',
  },
  {
    title: 'Food & Beverage Provisioning',
    description: 'Curated grocery stocking and provisioning so your villa is ready on arrival.',
  },
  {
    title: 'Event Planning',
    description:
      'Seamless coordination of events, from private dinners to special celebrations.',
  },
]

export default function ConciergeSection() {
  return (
    <section id="concierge" className="scroll-mt-16 bg-[#F6F6FF] py-16">
      <div className="mx-auto max-w-[1170px] px-6">
        <h2 className="mb-12 text-center font-[var(--font-playfair)] text-5xl text-[#000321]">
          Concierge Services
        </h2>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded border border-gray-200 bg-white px-6 py-5"
            >
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="mt-0.5 shrink-0 text-[#1f5772]" strokeWidth={2} />
                <div>
                  <p className="font-semibold text-[#000321]">{service.title}:</p>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/concierge-services"
            className="inline-block bg-[#1f5772] px-10 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#174560]"
          >
            View Our Packages
          </Link>
        </div>
      </div>
    </section>
  )
}
