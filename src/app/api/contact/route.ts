import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, phone, subject, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const REPLY_TO = 'jeff@stapleyinc.com'
  const replySubject = encodeURIComponent(
    subject ? `Re: ${subject} — ${name}` : `Re: Enquiry from ${name}`
  )

  const { error } = await resend.emails.send({
    from: 'MGL 365 Management <info@mgl365antigua.com>',
    to: 'info@mgl365antigua.com',
    cc: 'jeff@stapleyinc.com',
    replyTo: REPLY_TO,
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
            <p style="font-size: 14px; line-height: 1.7; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>

          <div style="margin-top: 32px; text-align: center;">
            <a href="mailto:${REPLY_TO}?subject=${replySubject}"
               style="display: inline-block; background: #1f5772; color: white; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 14px; font-weight: 600;">
              Reply to this Enquiry
            </a>
          </div>

          <div style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 4px; font-size: 12px; color: #888; text-align: center;">
            Replies will be sent to ${REPLY_TO}
          </div>
        </div>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
