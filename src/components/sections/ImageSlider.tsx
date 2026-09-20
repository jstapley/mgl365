'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Placeholder slides — replace src values with real images
const slides = [
  { src: '/images/slider-1.jpg', alt: 'Antigua sunset over the Caribbean Sea' },
  { src: '/images/slider-2.jpg', alt: 'Luxury villa pool at CooL HouSe' },
  { src: '/images/slider-3.jpg', alt: 'Starfish House ocean view' },
  { src: '/images/slider-4.jpg', alt: 'Water Edge beachfront villa' },
  { src: '/images/slider-5.jpg', alt: 'Antigua beachfront at golden hour' },
]

export default function ImageSlider() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent((i) => (i === 0 ? slides.length - 1 : i - 1))
  const next = () => setCurrent((i) => (i === slides.length - 1 ? 0 : i + 1))

  return (
    <section className="bg-white py-8">
      <div className="relative mx-auto max-w-[1100px]">
        {/* Slide */}
        <div className="relative h-[480px] w-full overflow-hidden">
          <Image
            key={current}
            src={slides[current].src}
            alt={slides[current].alt}
            fill
            className="object-cover"
          />
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 transition hover:text-white"
        >
          <ChevronLeft size={40} />
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 transition hover:text-white"
        >
          <ChevronRight size={40} />
        </button>

        {/* Dot pagination */}
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? 'bg-[#1f5772]' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
