import nodemailer from "nodemailer"

export interface Email {
  to: string
  subject: string
  text: string
}

// Trasporto email pluggable:
// - se SMTP_URL è impostata (produzione) → invio reale via SMTP
// - altrimenti (sviluppo) → log in console, così il flusso è testabile senza
//   provider configurato.
let transporter: nodemailer.Transporter | null = null
function getTransporter() {
  const url = process.env.SMTP_URL
  if (!url) return null
  if (!transporter) transporter = nodemailer.createTransport(url)
  return transporter
}

export async function sendEmail(email: Email): Promise<void> {
  const t = getTransporter()
  if (!t) {
    console.log(
      `[mailer:dev] a:${email.to} | ${email.subject}\n${email.text}\n`,
    )
    return
  }
  await t.sendMail({
    from: process.env.SMTP_FROM ?? "no-reply@rider.app",
    to: email.to,
    subject: email.subject,
    text: email.text,
  })
}
