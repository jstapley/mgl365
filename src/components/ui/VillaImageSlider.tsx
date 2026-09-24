'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function VillaImageSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) return null

  const prev = () => setCurrent(i => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setCurrent(i => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className="mx-auto max-w-[1000px] px-6">
      <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: '16/9' }}>
        {/* Images */}
        {images.map((src, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-500 ${
              idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={src}
              alt={`Gallery image ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 1000px"
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        ))}

        {/* Arrows — only show if more than one image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Counter badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-4 bg-black/50 px-2 py-0.5 text-[11px] text-white">
            {current + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to image ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-6 bg-[#1c4f6a]'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
