// ─── Form / API types ─────────────────────────────────────────────────────────

export interface ContactForm {
  name: string
  email: string
  phone?: string
  message: string
}

export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
}

// ─── Database types ───────────────────────────────────────────────────────────

export interface Villa {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  bedrooms: number | null
  max_guests: number | null
  price_per_night: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  package: 'bronze' | 'silver' | 'gold' | null
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  nationality: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  id: string
  villa_id: string | null
  client_id: string | null
  check_in: string
  check_out: string
  guests: number | null
  package: string | null
  status: BookingStatus
  total_amount: number | null
  notes: string | null
  created_at: string
  updated_at: string
  villa?: Villa
  client?: Client
}

export type ContactStatus = 'unread' | 'read' | 'replied'

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: ContactStatus
  created_at: string
}
