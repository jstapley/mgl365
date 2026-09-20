import Image from 'next/image'
import Link from 'next/link'

const villas = [
  {
    name: 'Cool House',
    slug: 'cool-house',
    image: '/images/villas/cool-house.jpg',
    description:
      'Escape to the ultimate Caribbean getaway at CooL HouSe, a stunning 5-bedroom island retreat that perfectly blends modern elegance with relaxed island living. Every detail has been thoughtfully designed, from premium finishes to expansive living spaces, making it one of the true gems of Antigua\'s beautiful western cape.',
  },
  {
    name: 'Starfish House Lower',
    slug: 'starfish-house-lower',
    image: '/images/villas/starfish-house-lower.jpg',
    description:
      'Your next dream vacation is waiting here at Starfish House, a tranquil seaside retreat on Antigua\'s west coast in Ffryes Estate, St. Mary\'s. Designed for luxurious, relaxed living with breathtaking ocean vistas, this home captures the very essence of island escape. From the entire front façade of the property, you\'re greeted by sweeping, unobstructed views of the Caribbean Sea and Valley Church Beach.',
  },
  {
    name: 'Starfish House Upper',
    slug: 'starfish-house-upper',
    image: '/images/villas/starfish-house-upper.jpg',
    description:
      'Wake up to breathtaking ocean views, sip coffee on your private balcony, and unwind in a breezy island retreat just minutes from Antigua\'s best beaches and Jolly Harbour. Perched on the west coast of Antigua in Ffryes Estate, St. Mary\'s, Starfish House is a private one-bedroom hideaway designed for relaxed island living.',
  },
  {
    name: 'Water Edge',
    slug: 'water-edge',
    image: '/images/villas/water-edge.jpg',
    description:
      'Set directly along the pristine white sands of Jolly Harbour, Villa Water\'s Edge (also known as Marina House) is a coastal gem that combines refined elegance with relaxed seaside living. With four beautifully appointed bedrooms, this villa comfortably hosts up to eight guests — making it ideal for families or groups seeking a peaceful, upscale escape.',
  },
]

export default function VillasSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1170px] px-6">
        <h2 className="mb-12 text-center font-[var(--font-playfair)] text-5xl text-[#000321]">
          Our Villas
        </h2>

        <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2">
          {villas.map((villa) => (
            <div key={villa.slug} className="flex flex-col items-center text-center">
              <h3 className="mb-4 font-[var(--font-playfair)] text-2xl text-[#000321]">
                {villa.name}
              </h3>

              <div className="relative mb-5 h-[300px] w-full overflow-hidden rounded">
                <Image
                  src={villa.image}
                  alt={villa.name}
                  fill
                  className="object-cover"
                />
              </div>

              <p className="mb-6 max-w-prose text-sm leading-7 text-gray-600">
                {villa.description}
              </p>

              <Link
                href={`/our-villas/${villa.slug}`}
                className="inline-block bg-[#1f5772] px-10 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#174560]"
              >
                More Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
