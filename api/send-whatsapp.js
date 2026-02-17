// DIVINIA OS — Send WhatsApp Message (Vercel Serverless Function)
// Sends outgoing messages via Meta Cloud API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_TOKEN = process.env.WHATSAPP_API_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!API_TOKEN || !PHONE_ID) {
    return res.status(500).json({ error: 'WhatsApp API not configured' });
  }

  try {
    const { telefono, contenido } = req.body;

    if (!telefono || !contenido) {
      return res.status(400).json({ error: 'telefono and contenido are required' });
    }

    // Send via Meta Cloud API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: telefono,
          type: 'text',
          text: {
            preview_url: false,
            body: contenido
          }
        })
      }
    );

    const data = await response.json();

    if (data.messages && data.messages[0]) {
      return res.status(200).json({
        success: true,
        messageId: data.messages[0].id
      });
    } else {
      console.error('WhatsApp API error:', data);
      return res.status(400).json({
        success: false,
        error: data.error?.message || 'Send failed'
      });
    }
  } catch (error) {
    console.error('Send error:', error);
    return res.status(500).json({ error: error.message });
  }
}
