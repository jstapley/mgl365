import HeroSection from '@/components/sections/HeroSection'
import ImageSlider from '@/components/sections/ImageSlider'
import VillasSection from '@/components/sections/VillasSection'
import AboutSection from '@/components/sections/AboutSection'
import PackagesSection from '@/components/sections/PackagesSection'
import ConciergeSection from '@/components/sections/ConciergeSection'
import FaqSection from '@/components/sections/FaqSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import JsonLd from '@/components/JsonLd'

export const revalidate = 0

export default function HomePage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        name: 'MGL 365 Management',
        description: 'Premium villa rentals & property management in Antigua. Where homes are cared for and dreams come true.',
        url: 'https://www.mgl365antigua.com',
        logo: 'https://www.mgl365antigua.com/logo.png',
        image: 'https://www.mgl365antigua.com/logo.png',
        telephone: '+12687885675',
        email: 'info@mgl365antigua.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Antigua',
          addressCountry: 'AG',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 17.0747,
          longitude: -61.8175,
        },
        priceRange: '$$$',
        currenciesAccepted: 'USD',
        areaServed: {
          '@type': 'Place',
          name: 'Antigua, West Indies',
        },
      }} />
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
