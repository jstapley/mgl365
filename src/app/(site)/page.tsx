import HeroSection from '@/components/sections/HeroSection'
import ImageSlider from '@/components/sections/ImageSlider'
import VillasSection from '@/components/sections/VillasSection'
import AboutSection from '@/components/sections/AboutSection'
import PackagesSection from '@/components/sections/PackagesSection'
import ConciergeSection from '@/components/sections/ConciergeSection'
import FaqSection from '@/components/sections/FaqSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'

export const revalidate = 0

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ImageSlider />
      <VillasSection />
      <AboutSection />
      <ConciergeSection />
      <PackagesSection />
      <FaqSection />
      <TestimonialsSection />
    </>
  )
}
