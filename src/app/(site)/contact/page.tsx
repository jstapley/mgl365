'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="bg-[#1c4f6a] py-14 text-center text-white">
        <p className="mb-3 text-[0.6rem] font-light uppercase tracking-[0.3em] text-white/60">
          MGL 365 Management
        </p>
        <h1 className="font-[var(--font-playfair)] text-4xl md:text-5xl">Contact Us</h1>
        <p className="mt-3 text-xs font-light uppercase tracking-[0.2em] text-white/70">
          We&apos;d love to hear from you
        </p>
      </div>

      <section className="mx-auto max-w-[1170px] px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">

          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-[var(--font-playfair)] text-2xl text-[#000321]">Get in Touch</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Whether you&apos;re planning a villa stay, have a question about our services, or need assistance with a booking — we&apos;re here to help.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-[#1f5772]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</p>
                  <a href="tel:+12687885675" className="text-sm text-gray-700 hover:text-[#1f5772]">
                    +1 268-788-5675
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-[#1f5772]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
                  <a href="mailto:info@mgl365antigua.com" className="text-sm text-gray-700 hover:text-[#1f5772]">
                    info@mgl365antigua.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#1f5772]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</p>
                  <p className="text-sm text-gray-700">Antigua, West Indies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-2">
            {status === 'sent' ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-green-100 bg-green-50 px-8 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <Send size={22} className="text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Message Sent</h3>
                <p className="text-sm text-gray-500">
                  Thank you for reaching out. We&apos;ll be in touch shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-sm text-[#1f5772] underline hover:no-underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={update}
                      required
                      placeholder="Jane Smith"
                      className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1f5772]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={update}
                      required
                      placeholder="jane@example.com"
                      className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1f5772]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={update}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1f5772]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Subject</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={update}
                      className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1f5772]"
                    >
                      <option value="">Select a subject…</option>
                      <option>Villa Enquiry</option>
                      <option>Booking Question</option>
                      <option>Concierge Services</option>
                      <option>Property Management</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={update}
                    required
                    rows={6}
                    placeholder="Tell us how we can help…"
                    className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#1f5772]"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-500">
                    Something went wrong. Please try again or email us directly at info@mgl365antigua.com.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="flex items-center gap-2 rounded bg-[#1f5772] px-8 py-3 text-sm font-semibold text-white hover:bg-[#174560] disabled:opacity-50"
                >
                  <Send size={14} />
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
