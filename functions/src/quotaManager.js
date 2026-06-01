import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();
const QUOTA_COLLECTION = 'email_quotas';
const FAILED_COLLECTION = 'failed_emails';

/**
 * Get or create the quota document for today
 */
export async function getTodayQuotas() {
  const today = new Date().toISOString().split('T')[0];
  const docRef = db.collection(QUOTA_COLLECTION).doc(today);
  const doc = await docRef.get();

  if (!doc.exists) {
    const initialQuotas = {
      date: today,
      brevo: { sent: 0, limit: 300, errors: 0 },
      resend: { sent: 0, limit: 100, errors: 0 },
      elastic: { sent: 0, limit: 100, errors: 0 }
    };
    await docRef.set(initialQuotas);
    return initialQuotas;
  }

  return doc.data();
}

/**
 * Increment sent count for a provider
 */
export async function incrementSent(provider) {
  const today = new Date().toISOString().split('T')[0];
  const docRef = db.collection(QUOTA_COLLECTION).doc(today);
  
  await docRef.update({
    [`${provider}.sent`]: admin.firestore.FieldValue.increment(1)
  });
}

/**
 * Increment error count for a provider
 */
export async function incrementError(provider) {
  const today = new Date().toISOString().split('T')[0];
  const docRef = db.collection(QUOTA_COLLECTION).doc(today);
  
  await docRef.update({
    [`${provider}.errors`]: admin.firestore.FieldValue.increment(1)
  });
}

/**
 * Log a failed email after all retries
 */
export async function logFailedEmail(emailData, error) {
  await db.collection(FAILED_COLLECTION).add({
    ...emailData,
    error: error.message || String(error),
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}
