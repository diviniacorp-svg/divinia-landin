// DIVINIA OS — Integración MercadoPago
// Generar links de pago, procesar webhooks, listar pagos

import supabase from './_lib/supabase.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

// Generar preference en MercadoPago
async function createMercadoPagoPreference(datos) {
  const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN

  if (!ACCESS_TOKEN) {
    throw new Error('MercadoPago Access Token no configurado')
  }

  const preference = {
    items: [
      {
        title: datos.titulo,
        description: datos.descripcion || '',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: datos.monto
      }
    ],
    payer: {
      name: datos.nombre_cliente,
      email: datos.email_cliente,
      phone: {
        number: datos.telefono_cliente || ''
      }
    },
    external_reference: datos.proyecto_id || datos.cliente_id || '',
    back_urls: {
      success: datos.url_exito || `${process.env.DOMAIN || 'https://divinia.ar'}/pago-exitoso`,
      failure: datos.url_error || `${process.env.DOMAIN || 'https://divinia.ar'}/pago-fallido`,
      pending: datos.url_pendiente || `${process.env.DOMAIN || 'https://divinia.ar'}/pago-pendiente`
    },
    auto_return: 'approved',
    notification_url: `${process.env.DOMAIN || 'https://api.divinia.ar'}/api/pagos-webhook`,
    metadata: {
      cliente_id: datos.cliente_id,
      proyecto_id: datos.proyecto_id,
      tipo: datos.tipo || 'general'
    }
  }

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error creating MercadoPago preference')
    }

    return {
      preference_id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point
    }
  } catch (error) {
    throw error
  }
}

// Obtener detalles de pago desde MercadoPago
async function getMercadoPagoPayment(payment_id) {
  const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN

  if (!ACCESS_TOKEN) {
    throw new Error('MercadoPago Access Token no configurado')
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    })

    return await response.json()
  } catch (error) {
    throw error
  }
}

// Manejador GET — Listar pagos
async function handleGet(req, res) {
  try {
    const { cliente_id, proyecto_id, estado, limit = 50 } = req.query

    let query = supabase.from('pagos').select('*')

    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id)
    }

    if (proyecto_id) {
      query = query.eq('proyecto_id', proyecto_id)
    }

    if (estado) {
      query = query.eq('estado', estado)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    // Resumir montos por estado
    const resume = data?.reduce((acc, pago) => {
      acc[pago.estado] = (acc[pago.estado] || 0) + pago.monto
      return acc
    }, {}) || {}

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: data || [],
      resume: resume,
      total: data?.length || 0
    })
  } catch (error) {
    console.error('Get pagos error:', error)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Manejador POST — Generar link de pago
async function handlePost(req, res) {
  try {
    const {
      cliente_id,
      proyecto_id,
      titulo,
      descripcion,
      monto,
      nombre_cliente,
      email_cliente,
      telefono_cliente,
      tipo,
      url_exito,
      url_error
    } = req.body

    // Validaciones
    if (!cliente_id || !titulo || !monto || !nombre_cliente || !email_cliente) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(400).json({
        error: 'Faltan parámetros requeridos: cliente_id, titulo, monto, nombre_cliente, email_cliente'
      })
    }

    if (monto <= 0) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(400).json({
        error: 'El monto debe ser mayor a 0'
      })
    }

    // Crear preference en MercadoPago
    const mpPref = await createMercadoPagoPreference({
      titulo,
      descripcion,
      monto: Math.round(monto), // MercadoPago requiere enteros
      nombre_cliente,
      email_cliente,
      telefono_cliente,
      cliente_id,
      proyecto_id,
      tipo,
      url_exito,
      url_error
    })

    // Guardar en base de datos
    const pago = {
      cliente_id,
      proyecto_id: proyecto_id || null,
      concepto: titulo,
      monto: Math.round(monto),
      estado: 'pendiente',
      mercadopago_preference_id: mpPref.preference_id,
      mercadopago_init_point: mpPref.init_point,
      tipo: tipo || 'general',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('pagos')
      .insert([pago])
      .select('id, cliente_id, monto, estado, mercadopago_init_point')

    if (error) throw error

    // Registrar en timeline
    await supabase.from('timeline').insert({
      cliente_id: cliente_id,
      evento: 'pago_iniciado',
      descripcion: `Link de pago generado: $${monto} ARS`,
      detalles: {
        concepto: titulo,
        monto: monto,
        tipo: tipo
      }
    })

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: {
        pago_id: data?.[0]?.id,
        cliente_id: data?.[0]?.cliente_id,
        monto: data?.[0]?.monto,
        estado: data?.[0]?.estado,
        link_pago: data?.[0]?.mercadopago_init_point,
        mensaje: 'Link de pago generado. Enviar al cliente para completar el pago.'
      }
    })
  } catch (error) {
    console.error('Create pago error:', error)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Manejador webhook de MercadoPago
async function handleWebhook(req, res) {
  try {
    const { data, type, action } = req.body

    if (type !== 'payment') {
      return res.status(200).json({ received: true })
    }

    // Obtener detalles del pago de MercadoPago
    const mpPayment = await getMercadoPagoPayment(data.id)

    if (!mpPayment) {
      return res.status(200).json({ received: true })
    }

    // Mapear estado de MercadoPago
    const statusMap = {
      'approved': 'confirmado',
      'pending': 'pendiente',
      'authorized': 'pendiente',
      'in_process': 'procesando',
      'rejected': 'rechazado',
      'cancelled': 'cancelado',
      'refunded': 'reembolsado',
      'charged_back': 'rechazado'
    }

    const estado = statusMap[mpPayment.status] || 'desconocido'

    // Actualizar en base de datos
    const { error: updateError } = await supabase
      .from('pagos')
      .update({
        estado: estado,
        mercadopago_payment_id: mpPayment.id,
        mercadopago_status: mpPayment.status,
        updated_at: new Date().toISOString()
      })
      .eq('mercadopago_preference_id', mpPayment.preference_id)

    if (!updateError) {
      // Registrar en timeline si está confirmado
      if (estado === 'confirmado') {
        const { data: pagoDatos } = await supabase
          .from('pagos')
          .select('cliente_id, monto, concepto')
          .eq('mercadopago_preference_id', mpPayment.preference_id)
          .single()

        if (pagoDatos) {
          await supabase.from('timeline').insert({
            cliente_id: pagoDatos.cliente_id,
            evento: 'pago_confirmado',
            descripcion: `Pago confirmado: $${pagoDatos.monto} ARS`,
            detalles: {
              concepto: pagoDatos.concepto,
              monto: pagoDatos.monto,
              mercadopago_id: mpPayment.id
            }
          })
        }
      }
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    // Siempre retornar 200 a MercadoPago
    return res.status(200).json({ received: true })
  }
}

// Manejador principal
export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return handleGet(req, res)
  }

  if (req.method === 'POST') {
    // Detectar si es webhook de MercadoPago
    if (req.body.type && req.body.action) {
      return handleWebhook(req, res)
    }
    return handlePost(req, res)
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.status(405).json({ error: 'Method not allowed' })
}
