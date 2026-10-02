import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getServiceSupabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, phone, subject, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const MANAGEMENT_EMAIL = 'mgl365management@gmail.com'
  const replySubject = encodeURIComponent(
    subject ? `Re: ${subject} — ${name}` : `Re: Enquiry from ${name}`
  )

  // 1. Save to DB so it appears in admin Contact tab
  const supabase = getServiceSupabase()
  await supabase.from('contact_submissions').insert({
    name,
    email,
    phone: phone || null,
    message,
    status: 'unread',
  })

  // 2. Notify management
  const { error } = await resend.emails.send({
    from: 'MGL 365 Management <info@mgl365antigua.com>',
    to: MANAGEMENT_EMAIL,
    replyTo: email,
    subject: subject ? `[Contact] ${subject} — ${name}` : `[Contact] New enquiry from ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; color: #333;">
        <div style="background: #1c4f6a; padding: 24px 32px; margin-bottom: 24px;">
          <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">MGL 365 Management</p>
          <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">New Contact Form Submission</p>
        </div>
        <div style="padding: 0 32px 32px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; font-size: 12px; color: #888; width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #111;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 12px; color: #888; vertical-align: top;">Email</td>
              <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #1f5772;">${email}</a></td>
            </tr>
            ${phone ? `
            <tr>
              <td style="padding: 8px 0; font-size: 12px; color: #888; vertical-align: top;">Phone</td>
              <td style="padding: 8px 0; font-size: 14px;">${phone}</td>
            </tr>` : ''}
            ${subject ? `
            <tr>
              <td style="padding: 8px 0; font-size: 12px; color: #888; vertical-align: top;">Subject</td>
              <td style="padding: 8px 0; font-size: 14px;">${subject}</td>
            </tr>` : ''}
          </table>
          <div style="border-top: 1px solid #eee; padding-top: 20px;">
            <p style="font-size: 12px; color: #888; margin: 0 0 8px;">Message</p>
            <p style="font-size: 14px; line-height: 1.7; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div style="margin-top: 32px; text-align: center;">
            <a href="mailto:${email}?subject=${replySubject}"
               style="display: inline-block; background: #1f5772; color: white; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 14px; font-weight: 600;">
              Reply to ${name}
            </a>
          </div>
        </div>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
  }

  // 3. Send confirmation copy to the customer
  await resend.emails.send({
    from: 'MGL 365 Management <info@mgl365antigua.com>',
    to: email,
    replyTo: MANAGEMENT_EMAIL,
    subject: `We received your enquiry — MGL 365 Management`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; color: #333;">
        <div style="background: #1c4f6a; padding: 24px 32px; margin-bottom: 24px;">
          <p style="color: white; margin: 0; font-size: 18px; font-weight: 600;">MGL 365 Management</p>
          <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">Enquiry Received</p>
        </div>
        <div style="padding: 0 32px 32px;">
          <p style="font-size: 14px; line-height: 1.8; margin: 0 0 14px 0;">Hi ${name.split(' ')[0]},</p>
          <p style="font-size: 14px; line-height: 1.8; margin: 0 0 14px 0;">Thank you for reaching out! We have received your message and will be in touch with you shortly.</p>
          <p style="font-size: 14px; line-height: 1.8; margin: 0 0 14px 0;">If you have any urgent questions, please don't hesitate to contact us directly at <a href="mailto:${MANAGEMENT_EMAIL}" style="color: #1f5772;">${MANAGEMENT_EMAIL}</a>.</p>
          <p style="font-size: 14px; line-height: 1.8; margin: 0;">Warm regards,<br>Jamie<br>MGL 365 Management</p>
        </div>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}
