import { Resend } from 'resend';

/**
 * Resend API Provider
 * Limit: 100/day
 */
export async function sendWithResend(emailData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is missing');

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: `KINGTVLAND <no-reply@${process.env.DOMAIN_NAME || 'YOUR_DOMAIN.COM'}>`,
    to: [emailData.to],
    subject: emailData.subject || 'עדכון מחשבון KINGTVLAND',
    html: emailData.html
  });

  if (error) {
    throw new Error(`Resend Error: ${error.message}`);
  }

  return data;
}
