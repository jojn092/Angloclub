/**
 * Email Service using Nodemailer
 * Sends confirmation emails to users and notifications to admin
 */

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

interface EmailData {
    to: string
    subject: string
    html: string
}

export async function sendEmail(data: EmailData): Promise<boolean> {
    // Skip if not configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('[Email] SMTP not configured, skipping email')
        return false
    }

    try {
        await transporter.sendMail({
            from: `"AngloClub Astana" <${process.env.SMTP_USER}>`,
            ...data,
        })
        console.log('[Email] Sent successfully to:', data.to)
        return true
    } catch (error) {
        console.error('[Email] Failed to send:', error)
        return false
    }
}

export function getConfirmationEmailTemplate(name: string, course: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AngloClub Astana</h1>
          <p>Ваша заявка принята!</p>
        </div>
        <div class="content">
          <p>Здравствуйте, <strong>${name}</strong>!</p>
          <p>Спасибо за интерес к нашей школе. Мы получили вашу заявку на курс <strong>"${course}"</strong>.</p>
          <p>Наш менеджер свяжется с вами в ближайшее время для уточнения деталей и подбора удобного расписания.</p>
          <p><a href="https://wa.me/77001234567" class="button">Написать в WhatsApp</a></p>
          <p>С уважением,<br>Команда AngloClub Astana</p>
        </div>
        <div class="footer">
          <p>📍 Астана, Бухар Жырау 34/2</p>
          <p>📞 +7 (700) 123-45-67</p>
        </div>
      </div>
    </body>
    </html>
  `
}
