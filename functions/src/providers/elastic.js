/**
 * Elastic Email API Provider
 * Limit: 100/day
 */
export async function sendWithElastic(emailData) {
  const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
  if (!apiKey) throw new Error('ELASTIC_EMAIL_API_KEY is missing');

  const url = new URL('https://api.elasticemail.com/v4/emails');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-ElasticEmail-ApiKey': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Recipients: [
        { Email: emailData.to }
      ],
      Content: {
        Body: [
          {
            ContentType: 'HTML',
            Content: emailData.html,
            Charset: 'utf-8'
          }
        ],
        From: `no-reply@${process.env.DOMAIN_NAME || 'YOUR_DOMAIN.COM'}`,
        Subject: emailData.subject || 'עדכון מחשבון KINGTVLAND'
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Elastic Email Error: ${error.message || response.statusText}`);
  }

  return await response.json();
}
