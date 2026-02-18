// DIVINIA OS — WhatsApp Webhook (Vercel Serverless Function)
// Receives incoming messages from Meta Cloud API

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'DIVINIA_VERIFY_2026';
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  // Webhook verification (GET) — Meta sends this during setup
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verification failed' });
  }

  // Incoming messages (POST)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Handle messages
      if (value?.messages) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        for (const msg of value.messages) {
          const telefono = msg.from; // e.g. "542665286110"
          const contenido = msg.text?.body || msg.type || '(media)';
          const waId = msg.id;
          const contactName = value.contacts?.[0]?.profile?.name || telefono;

          // Save message
          await supabase.from('mensajes').insert({
            telefono,
            contenido,
            tipo: 'recibido',
            estado: 'recibido',
            wa_message_id: waId
          });

          // Update or create conversation
          const { data: existing } = await supabase
            .from('conversaciones')
            .select('id, unread')
            .eq('telefono', telefono)
            .single();

          if (existing) {
            await supabase.from('conversaciones').update({
              ultimo_mensaje: contenido,
              ultimo_timestamp: new Date().toISOString(),
              unread: (existing.unread || 0) + 1,
              nombre_contacto: contactName
            }).eq('id', existing.id);
          } else {
            await supabase.from('conversaciones').insert({
              telefono,
              nombre_contacto: contactName,
              ultimo_mensaje: contenido,
              ultimo_timestamp: new Date().toISOString(),
              unread: 1
            });
          }

          // Log cerebro event y enrutar con CEO Router
          await supabase.from('eventos_cerebro').insert({
            tipo: 'mensaje_recibido',
            payload: { telefono, contenido, contactName, waId },
            procesado: false
          });

          // Llamar al CEO Router para clasificar el mensaje
          try {
            const routerResponse = await fetch(
              `${process.env.DOMAIN || 'https://api.divinia.ar'}/api/ceo-router`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  mensaje: contenido,
                  telefono: telefono,
                  contexto: 'whatsapp_incoming'
                })
              }
            );
            const routing = await routerResponse.json();
            console.log(`Message routed to ${routing.data?.departamento}:`, contenido);
          } catch (routerError) {
            console.error('CEO Router error:', routerError);
          }

          console.log(`Message from ${telefono}: ${contenido}`);
        }
      }

      // Handle status updates (delivered, read)
      if (value?.statuses) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        for (const status of value.statuses) {
          if (status.status === 'read' || status.status === 'delivered') {
            await supabase.from('mensajes')
              .update({ estado: status.status === 'read' ? 'leido' : 'enviado' })
              .eq('wa_message_id', status.id);
          }
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(200).json({ success: true }); // Always return 200 to Meta
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
