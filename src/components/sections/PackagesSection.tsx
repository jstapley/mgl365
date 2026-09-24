import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const packages = [
  {
    name: 'Bronze Package',
    features: [
      'Luxury Airport Pickup',
      'Airport Express Check-in',
      'Chef Prepared Dinner Daily',
      'Provision Stocking for Arrival',
      'Concierge Services (Excursions)',
      'Housekeeping 2-Days Per Stay',
      'Rental Car for Duration of Stay',
    ],
  },
  {
    name: 'Silver Package',
    features: [
      'Includes Everything in BRONZE plus',
      'Chef Prepared Lunch & Dinner',
      'Golf Cart for Local Use',
      'Provision Stocking (arrival + mid-stay)',
      'House Keeping 3-Days per Stay',
      'Private Boat Tour',
      'Yoga/Pilates - 2 Sessions',
      'Mixologist - One Cocktail Evening',
    ],
  },
  {
    name: 'Gold Package',
    features: [
      'Includes Everything in SILVER plus',
      'Chef Prepared All Meals Daily',
      'Rum Tasting Tour/Shirley Heights',
      'In Villa Spa Day',
      'Personal Photographer Session',
      'Yoga/Pilates',
      'Mixologist - Two Cocktail Evenings',
    ],
  },
]

export default function PackagesSection() {
  return (
    <section id="packages" className="scroll-mt-16 bg-[#F6F6FF] py-16">
      <div className="mx-auto max-w-[1170px] px-6">
        <h2 className="mb-2 text-center font-[var(--font-playfair)] text-5xl text-[#000321]">
          Our Packages
        </h2>
        <div className="mx-auto mb-12 h-px w-16 bg-[#1f5772]" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="flex flex-col rounded border border-[#1f5772] bg-white px-8 py-8"
            >
              <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-[0.15em] text-[#1f5772]">
                {pkg.name}
              </h3>

              <ul className="mb-8 flex-1 space-y-3">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-[#1f5772]"
                      strokeWidth={2}
                    />
                    <span className={feature.startsWith('Includes') ? 'font-semibold' : ''}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="block w-full bg-[#1f5772] py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#174560]"
              >
                Tell Me More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
