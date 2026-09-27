import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | MGL 365 Management',
  description: 'Get in touch with MGL 365 Management for villa bookings, concierge services, and property management enquiries in Antigua.',
}

export default function ContactPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact MGL 365 Management',
        description: 'Get in touch with MGL 365 Management for villa bookings, concierge services, and property management enquiries in Antigua.',
        url: 'https://www.mgl365antigua.com/contact',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mgl365antigua.com' },
            { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.mgl365antigua.com/contact' },
          ],
        },
        mainEntity: {
          '@type': 'LocalBusiness',
          name: 'MGL 365 Management',
          telephone: '+12687885675',
          email: 'info@mgl365antigua.com',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Antigua',
            addressCountry: 'AG',
          },
        },
      }} />
      <ContactForm />
    </>
  )
}
