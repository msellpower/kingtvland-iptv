import { getTodayQuotas, incrementSent, incrementError, logFailedEmail } from './quotaManager.js';
import { sendWithBrevo } from './providers/brevo.js';
import { sendWithResend } from './providers/resend.js';
import { sendWithElastic } from './providers/elastic.js';

/**
 * Main Email Router
 */
export async function sendEmail(emailData) {
  const quotas = await getTodayQuotas();
  
  // Priority Queue Logic
  const providers = [
    { name: 'brevo', limit: 270, sendFn: sendWithBrevo },
    { name: 'resend', limit: 90, sendFn: sendWithResend },
    { name: 'elastic', limit: 90, sendFn: sendWithElastic }
  ];

  let lastError = null;

  for (const provider of providers) {
    if (quotas[provider.name].sent < provider.limit) {
      try {
        const result = await provider.sendFn(emailData);
        await incrementSent(provider.name);
        return { success: true, provider: provider.name, result };
      } catch (error) {
        console.error(`Error with ${provider.name}:`, error);
        await incrementError(provider.name);
        lastError = error;
        // Continue to next provider
      }
    }
  }

  // If we reach here, either all limits reached or all providers failed
  const error = lastError || new Error('DailyLimitReachedError: All email providers quotas reached.');
  await logFailedEmail(emailData, error);
  throw error;
}

/**
 * Special case for Google Sheets (App Script) - first 50 emails
 * This is usually triggered from the frontend or a specific job
 */
export async function sendWithGoogleSheets(emailData) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) throw new Error('GOOGLE_SCRIPT_URL is missing');

  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    throw new Error('Google Sheets Email Error');
  }

  return await response.json();
}
