import Image from 'next/image'
import Link from 'next/link'
import { Bed, Users } from 'lucide-react'
import { getServiceSupabase } from '@/lib/supabase'
import type { Villa } from '@/types'

export const revalidate = 0

export const metadata = {
  title: 'Our Villas | MGL 365 Management',
  description: 'Explore our collection of premium villa rentals in Antigua.',
}

async function getVillas(): Promise<Villa[]> {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('villas')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })
  return data ?? []
}

export default async function OurVillasPage() {
  const villas = await getVillas()

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-[#1c4f6a] py-14 text-center text-white">
        <p className="mb-3 text-[0.6rem] font-light uppercase tracking-[0.3em] text-white/60">
          MGL 365 Management
        </p>
        <h1 className="font-[var(--font-playfair)] text-4xl md:text-5xl">Our Villas</h1>
        <p className="mt-3 text-xs font-light uppercase tracking-[0.2em] text-white/70">
          Premium Caribbean Retreats in Antigua
        </p>
      </div>

      {/* Grid */}
      <section className="mx-auto max-w-[1170px] px-6 py-16">
        {villas.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">No villas available at this time.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {villas.map((villa) => (
              <Link
                key={villa.id}
                href={`/our-villas/${villa.slug}`}
                className="group block overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-[280px] overflow-hidden">
                  <Image
                    src={villa.image_url || '/images/villa-placeholder.jpg'}
                    alt={villa.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1f5772]" />
                </div>

                <div className="flex flex-col p-6">
                  <h2 className="mb-2 font-[var(--font-playfair)] text-2xl text-[#000321] transition-colors group-hover:text-[#1f5772]">
                    {villa.name}
                  </h2>

                  <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-500">
                    {villa.bedrooms != null && (
                      <span className="flex items-center gap-1.5">
                        <Bed size={13} className="text-[#1f5772]" />
                        {villa.bedrooms} bedroom{villa.bedrooms !== 1 ? 's' : ''}
                      </span>
                    )}
                    {villa.max_guests != null && (
                      <span className="flex items-center gap-1.5">
                        <Users size={13} className="text-[#1f5772]" />
                        Up to {villa.max_guests} guests
                      </span>
                    )}
                  </div>

                  {villa.price_per_night != null && (
                    <p className="mb-3 text-lg font-semibold text-[#1f5772]">
                      From ${villa.price_per_night.toLocaleString()}
                      <span className="text-sm font-normal text-gray-400"> / night</span>
                    </p>
                  )}

                  {villa.description && (
                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-500">
                      {villa.description}
                    </p>
                  )}

                  <div className="mt-auto border-t border-gray-100 pt-4">
                    <div className="block w-full bg-[#1f5772] py-3 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors group-hover:bg-[#174560]">
                      More Details
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
