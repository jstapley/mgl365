// Base database types — extend as MGL 365 schema is defined

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
