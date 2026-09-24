import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Phone, Mail, Bed, Users, DollarSign } from 'lucide-react'
import { getServiceSupabase } from '@/lib/supabase'
import { VILLA_FEATURES } from '@/lib/villa-features'
import { CheckCircle2 } from 'lucide-react'
import VillaImageSlider from '@/components/ui/VillaImageSlider'
import type { Villa, VillaSection } from '@/types'
import type { Metadata } from 'next'

async function getVilla(slug: string): Promise<Villa | null> {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('villas')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()
  return data ?? null
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const villa = await getVilla(slug)
  if (!villa) return {}
  return {
    title: `${villa.name} | MGL 365 Management`,
    description: villa.description ?? `Luxury villa rental in Antigua — ${villa.name}`,
  }
}

export default async function VillaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const villa = await getVilla(slug)
  if (!villa) notFound()

  const features: string[] = villa.features ?? []
  const gallery: string[] = (villa.gallery_images ?? []).filter(Boolean)
  const sections: VillaSection[] = (villa.content as VillaSection[]) ?? []
  const teaser = villa.tagline ?? null

  return (
    <div className="bg-white">

      {/* ── Hero + callout ── */}
      <section className="relative w-full">
        <div
          className="relative h-[520px] w-full bg-cover bg-center"
          style={{ backgroundImage: villa.image_url ? `url('${villa.image_url}')` : undefined,
                   backgroundColor: villa.image_url ? undefined : '#1c4f6a' }}
        >
          {/* Callout box — same parameters as homepage hero */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[15%] w-[60%] max-w-[800px] min-w-[320px] bg-[#1c4f6a] shadow-2xl ring-1 ring-white/40">
            <div className="px-6 py-6 text-center text-white sm:px-10 sm:py-8">
              <h1 className="font-[var(--font-playfair)] text-3xl font-semibold uppercase tracking-[0.04em] leading-[1.3] sm:text-4xl">
                {villa.name}
              </h1>

              {/* Divider */}
              <div className="my-4 flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-white/35" />
                <svg width="10" height="10" viewBox="0 0 20 20" fill="none" className="opacity-50">
                  <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="3" fill="white" />
                </svg>
                <div className="h-px w-10 bg-white/35" />
              </div>

              {teaser && (
                <p className="mb-5 text-[0.6rem] font-light uppercase tracking-[0.2em] text-white/75 sm:text-[0.65rem]">
                  {teaser}
                </p>
              )}

              <Link
                href="/contact"
                className="inline-block border border-white/70 px-8 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-[#1c4f6a]"
              >
                Book Today!
              </Link>
            </div>
          </div>
        </div>

        {/* Spacer for overlapping callout */}
        <div className="h-24 bg-white" />
      </section>

      {/* ── Features strip ── */}
      {(features.length > 0 || villa.bedrooms != null) && (
        <section className="border-y border-gray-100 py-10">
          <div className="mx-auto max-w-[1000px] px-6">
            <div className="flex flex-wrap justify-center gap-10">
              {features.map((key) => {
                const feat = VILLA_FEATURES[key]
                if (!feat) return null
                const { Icon, label } = feat
                return (
                  <div key={key} className="flex flex-col items-center gap-2 text-center">
                    <Icon size={40} className="text-[#1c4f6a]" strokeWidth={1.2} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                )
              })}
              {villa.bedrooms != null && (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Bed size={40} className="text-[#1c4f6a]" strokeWidth={1.2} />
                  <span className="text-xs text-gray-600">
                    {villa.bedrooms} Bedroom{villa.bedrooms !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Photo gallery slider ── */}
      {gallery.length > 0 && (
        <section className="py-10">
          <VillaImageSlider images={gallery} />
        </section>
      )}

      {/* ── Body ── */}
      <div className="mx-auto max-w-[1000px] px-6 py-14">
        <Link
          href="/our-villas"
          className="mb-10 inline-flex items-center gap-1 text-sm text-[#1f5772] hover:underline"
        >
          <ChevronLeft size={14} />
          All Villas
        </Link>

        <div className="gap-12 md:grid md:grid-cols-3">
          {/* Content sections */}
          <div className="md:col-span-2">
            {sections.length > 0 ? (
              <div className="space-y-10">
                {sections.map((section, i) => (
                  <div key={i}>
                    <h2 className="mb-4 font-[var(--font-playfair)] text-2xl text-[#000321]">
                      {section.heading}
                    </h2>
                    {section.type === 'text' ? (
                      <p className="whitespace-pre-line text-sm leading-[1.6] text-gray-600">
                        {section.body}
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {section.items.filter(Boolean).map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm leading-[1.5] text-gray-600">
                            <CheckCircle2
                              size={18}
                              className="mt-0.5 shrink-0 text-[#1c4f6a]"
                              strokeWidth={1.8}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : villa.description ? (
              <p className="whitespace-pre-line text-sm leading-[1.6] text-gray-600">
                {villa.description}
              </p>
            ) : (
              <p className="text-sm italic text-gray-400">Description coming soon.</p>
            )}
          </div>

          {/* Sidebar */}
          <div className="mt-10 md:mt-0">
            <div className="sticky top-6 rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 font-[var(--font-playfair)] text-lg text-[#000321]">
                Villa Details
              </h3>

              <div className="mb-6 space-y-3">
                {villa.bedrooms != null && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Bed size={15} className="shrink-0 text-[#1f5772]" />
                    <span>
                      <span className="font-semibold">{villa.bedrooms}</span>{' '}
                      Bedroom{villa.bedrooms !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                {villa.max_guests != null && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Users size={15} className="shrink-0 text-[#1f5772]" />
                    <span>
                      Up to <span className="font-semibold">{villa.max_guests}</span> Guests
                    </span>
                  </div>
                )}
                {villa.price_per_night != null && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <DollarSign size={15} className="shrink-0 text-[#1f5772]" />
                    <span>
                      From{' '}
                      <span className="font-semibold">
                        ${villa.price_per_night.toLocaleString()}
                      </span>{' '}
                      / night
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-5">
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center gap-2 bg-[#1f5772] py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#174560]"
                >
                  <Mail size={13} />
                  Book Your Stay
                </Link>
                <a
                  href="tel:+12687885675"
                  className="flex w-full items-center justify-center gap-2 border border-[#1f5772] py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#1f5772] transition-colors hover:bg-[#1f5772] hover:text-white"
                >
                  <Phone size={13} />
                  +1 268-788-5675
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
