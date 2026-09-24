import Image from 'next/image'
import Link from 'next/link'
import { Bed, Users } from 'lucide-react'
import { getServiceSupabase } from '@/lib/supabase'
import type { Villa } from '@/types'

async function getVillas(): Promise<Villa[]> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('villas')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })
  if (error) console.error('Error fetching villas:', error)
  return data ?? []
}

export default async function VillasSection() {
  const villas = await getVillas()

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1170px] px-6">
        <h2 className="mb-2 text-center font-[var(--font-playfair)] text-4xl md:text-5xl text-[#000321]">
          Our Villas
        </h2>
        <div className="mx-auto mb-12 h-px w-16 bg-[#1f5772]" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {villas.map((villa) => (
            <Link
              key={villa.id}
              href={`/our-villas/${villa.slug}`}
              className="group block overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image */}
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

              {/* Content */}
              <div className="flex flex-col p-6">
                <h3 className="mb-2 font-[var(--font-playfair)] text-2xl text-[#000321] transition-colors group-hover:text-[#1f5772]">
                  {villa.name}
                </h3>

                {/* Specs */}
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
      </div>
    </section>
  )
}
