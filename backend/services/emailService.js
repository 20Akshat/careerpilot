import nodemailer from 'nodemailer'

function getTransporter() {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    // Dev mode: use Ethereal fake SMTP (auto-creates test account)
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  })
}

export async function sendVerificationEmail(toEmail, name, token) {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify?token=${token}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0b0f19; color: #f3f4f6; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: white;">🚀 CareerPilot AI</h1>
        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">AI-Powered Career Discovery</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #f3f4f6; margin: 0 0 12px;">Hey ${name || 'there'}! 👋</h2>
        <p style="color: #94a3b8; line-height: 1.6;">Thanks for signing up for CareerPilot AI. Click the button below to verify your email and start discovering your perfect career opportunities.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${verifyUrl}" style="background: #4f46e5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
            ✉️ Verify My Email
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">This link expires in 30 minutes. If you didn't sign up, ignore this email.</p>
      </div>
    </div>
  `

  const transporter = getTransporter()

  if (!transporter) {
    // Dev mode - create ethereal test account
    const testAccount = await nodemailer.createTestAccount()
    const devTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass }
    })

    const info = await devTransporter.sendMail({
      from: '"CareerPilot AI" <noreply@careerpilot.ai>',
      to: toEmail,
      subject: '🚀 Verify your CareerPilot AI account',
      html
    })

    // In dev mode, print preview URL to console
    const previewUrl = nodemailer.getTestMessageUrl(info)
    console.log('\n📧 [DEV EMAIL PREVIEW] =>', previewUrl)
    console.log(`🔗 Direct Verify Link: ${verifyUrl}\n`)

    // Return verifyUrl so the API can send it back to frontend
    info._devVerifyUrl = verifyUrl
    info._devPreviewUrl = previewUrl
    return info
  }

  return transporter.sendMail({
    from: `"CareerPilot AI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🚀 Verify your CareerPilot AI account',
    html
  })
}
