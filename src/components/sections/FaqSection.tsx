'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is the Antigua & Barbuda Tourist Tax?',
    answer:
      'Antigua & Barbuda levies a tourist tax on all accommodation. The rate is typically applied per room per night and is included in your final invoice. Our team will provide you with the exact current rate at the time of booking.',
  },
  {
    question: 'How does the Customs & Immigration process work upon arrival?',
    answer:
      'Upon arrival at V.C. Bird International Airport, you will proceed through customs and immigration. Non-nationals require a valid passport and return ticket. Our concierge team can provide detailed guidance before your trip to make the process as smooth as possible.',
  },
  {
    question: 'How to get from the airport to the property?',
    answer:
      'We offer luxury airport pickup as part of our concierge packages. Our driver will meet you in the arrivals hall with a name sign. If you prefer to arrange your own transport, taxis are readily available outside the terminal.',
  },
  {
    question: 'Who do we contact with any questions or issues?',
    answer:
      'You will have a dedicated point of contact throughout your stay. Jamie is available via phone and WhatsApp to handle any requests, questions, or issues — day or night. You can also reach us at +1 268-788-5675.',
  },
  {
    question: 'How do I book my stay?',
    answer:
      'You can submit an inquiry through our Contact Us page or call us directly at +1 268-788-5675. We will confirm availability, discuss your requirements, and guide you through the booking process.',
  },
  {
    question: 'Do you provide concierge services?',
    answer:
      'Yes — concierge services are a core part of what we do. From private chefs and excursions to spa treatments and event planning, we tailor every detail to your preferences. See our Concierge Services page for the full list.',
  },
  {
    question: 'Are pets allowed?',
    answer:
      'Pet policies vary by property. Please contact us directly to discuss your specific needs and we will confirm whether your chosen villa can accommodate pets.',
  },
  {
    question: "What are the best beaches in Antigua?",
    answer:
      'Antigua is famous for its 365 beaches — one for every day of the year. Top picks include Valley Church Beach (steps from Starfish House), Jolly Harbour Beach, Dickenson Bay, and Darkwood Beach. Our concierge team can recommend the perfect spot based on your preferences.',
  },
]

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[900px] px-6">
        <h2 className="mb-4 text-center font-[var(--font-playfair)] text-5xl text-[#000321]">
          Frequently Asked Questions
        </h2>
        <p className="mb-10 text-center text-sm leading-7 text-gray-500">
          Welcome to our charming villas, where personalized service and cozy comforts await you.
          Nestled in a peaceful setting, our villas offer a unique blend of elegance and homely
          warmth, making each stay feel truly special. Whether you&apos;re here to explore or
          unwind, we&apos;re dedicated to making your experience memorable and restful.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-200"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-[#000321]"
              >
                {faq.question}
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-gray-500 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>

              {open === i && (
                <div className="border-t border-gray-100 px-6 py-4 text-sm leading-7 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
