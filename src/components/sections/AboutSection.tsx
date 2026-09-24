import Image from 'next/image'

export default function AboutSection() {
  return (
    <section id="about" className="scroll-mt-16 bg-[#F6F6FF] py-16">
      <div className="mx-auto flex max-w-[1170px] flex-col items-center gap-12 px-6 md:flex-row">
        {/* Image */}
        <div className="relative h-[520px] w-full shrink-0 md:w-[450px] bg-[#F6F6FF]">
          <Image
            src="/images/about-team.jpg"
            alt="Michel Glass Lamdan and Jamie Arnan at MGL 365"
            fill
            sizes="(max-width: 768px) 100vw, 450px"
            className="object-contain"
          />
        </div>

        {/* Text */}
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            MGL 365 Management
          </p>
          <h2 className="mb-6 font-[var(--font-playfair)] text-5xl text-[#000321]">About Us</h2>

          <div className="space-y-4 text-sm leading-7 text-gray-700">
            <p>
              At MGL 365 Management, we believe managing a property should feel a little less like a
              headache and a lot more like a vacation. Founded by Michel Glass Lamdan, a Caribbean
              veteran with 17 years of island living under her belt, and powered by Jamie Arnan, the
              detail-obsessed mastermind who makes sure no palm frond is out of place, our team
              takes property management to breezy new heights.
            </p>
            <p>
              Michel brings the big-picture vision (and a knack for solving problems before you even
              know they exist), while Jamie works her magic handling every concierge detail—from
              wrangling last-minute boat charters to finding a private chef who can cook vegan,
              gluten-free, and still make it taste like heaven—without even breaking a sweat (or a
              nail). Together, we keep villas pristine, services seamless, and owners blissfully
              stress-free—whether you&apos;re down the road or across the globe.
            </p>
            <p>
              From maintenance to marketing, guest care to VIP experiences, and everything in
              between, we manage every detail with the same care we&apos;d give our own homes.
              Because at MGL 365, we don&apos;t just manage properties—we manage peace of mind,
              with a dash of island magic.
            </p>
            <p className="font-medium">Relax. We&apos;ve got this.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
