import nodemailer from 'nodemailer';

/**
 * Brevo SMTP Provider
 * Limit: 300/day
 */
export async function sendWithBrevo(emailData) {
  const host = process.env.BREVO_SMTP_SERVER || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.BREVO_SMTP_PORT || '587');
  const user = process.env.BREVO_SMTP_LOGIN || '9721d6001@smtp-brevo.com';
  const pass = process.env.BREVO_SMTP_PASSWORD || process.env.BREVO_API_KEY;

  if (!pass) throw new Error('Brevo SMTP Password (or API Key) is missing');

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from: `"KINGTVLAND" <no-reply@${process.env.DOMAIN_NAME || 'YOUR_DOMAIN.COM'}>`,
    to: emailData.to,
    subject: emailData.subject || 'עדכון מחשבון KINGTVLAND',
    html: emailData.html,
  });

  return info;
}
