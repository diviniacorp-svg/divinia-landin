// DIVINIA OS — Configuración del Sistema
// Lectura/escritura de parámetros globales

import supabase from './_lib/supabase.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

// Configuración por defecto
const configDefaults = {
  empresa_nombre: 'DIVINIA OS',
  empresa_email: 'contacto@divinia.ar',
  empresa_telefono: '+54 266 5286110',
  empresa_ubicacion: 'San Luis Capital, Argentina',
  empresa_website: 'https://divinia.ar',

  // Limites y cuotas
  max_leads_diarios: 50,
  max_agentes: 20,
  max_proyectos_simultaneos: 10,

  // Configuración de precios
  precio_base_automatizacion: 120000,
  precio_base_web: 300000,
  precio_base_avatar: 250000,
  descuento_pack: 0.15, // 15% descuento en packs

  // Configuración de pagos
  mercadopago_enabled: true,
  adelanto_porcentaje: 50,

  // Configuración de IA
  modelo_default: 'claude-3-5-haiku-20241022',
  modelo_complejo: 'claude-3-5-sonnet-20241022',
  max_tokens_default: 1000,

  // Configuración WhatsApp
  whatsapp_enabled: true,
  whatsapp_response_delay_ms: 1000,

  // Limites de inbox
  max_conversaciones_abiertas: 100,
  archive_conversaciones_dias: 90,

  // Horarios de atención
  horario_atencion_inicio: '09:00',
  horario_atencion_fin: '18:00',

  // Notificaciones
  notificar_nuevo_lead: true,
  notificar_pago_recibido: true,
  notificar_proyecto_completado: true,

  // Modo mantenimiento
  modo_mantenimiento: false,
  mensaje_mantenimiento: 'Sistema en mantenimiento. Disculpe las molestias.'
}

// Manejador GET — Leer configuración
async function handleGet(req, res) {
  try {
    const { clave, detalle } = req.query

    let query = supabase.from('config_sistema').select('*')

    if (clave) {
      query = query.eq('clave', clave)
    }

    const { data, error } = await query

    if (error) throw error

    if (clave && data?.length === 1) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(200).json({
        success: true,
        data: {
          clave: data[0].clave,
          valor: data[0].valor,
          tipo: data[0].tipo || 'string'
        }
      })
    }

    // Construir objeto con todos los valores
    const config = { ...configDefaults }

    if (data && data.length > 0) {
      data.forEach(item => {
        // Parsear según tipo
        if (item.tipo === 'number') {
          config[item.clave] = parseFloat(item.valor)
        } else if (item.tipo === 'boolean') {
          config[item.clave] = item.valor === 'true' || item.valor === true
        } else if (item.tipo === 'json') {
          try {
            config[item.clave] = JSON.parse(item.valor)
          } catch {
            config[item.clave] = item.valor
          }
        } else {
          config[item.clave] = item.valor
        }
      })
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: config,
      total_keys: Object.keys(config).length
    })
  } catch (error) {
    console.error('Get config error:', error)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Manejador POST — Actualizar configuración
async function handlePost(req, res) {
  try {
    const { clave, valor, tipo } = req.body

    // Validaciones
    if (!clave || valor === undefined) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(400).json({
        error: 'clave y valor son requeridos'
      })
    }

    // Detectar tipo si no se proporciona
    let tipoDetectado = tipo
    if (!tipoDetectado) {
      if (typeof valor === 'number') tipoDetectado = 'number'
      else if (typeof valor === 'boolean') tipoDetectado = 'boolean'
      else if (typeof valor === 'object') tipoDetectado = 'json'
      else tipoDetectado = 'string'
    }

    // Convertir valor a string para almacenamiento
    let valorAlmacenar = valor
    if (tipoDetectado === 'json') {
      valorAlmacenar = JSON.stringify(valor)
    } else if (tipoDetectado === 'boolean') {
      valorAlmacenar = valor ? 'true' : 'false'
    } else {
      valorAlmacenar = String(valor)
    }

    // Verificar si existe
    const { data: existing } = await supabase
      .from('config_sistema')
      .select('id')
      .eq('clave', clave)
      .single()

    let result
    if (existing) {
      // Actualizar
      result = await supabase
        .from('config_sistema')
        .update({
          valor: valorAlmacenar,
          tipo: tipoDetectado,
          updated_at: new Date().toISOString()
        })
        .eq('clave', clave)
        .select()
    } else {
      // Insertar
      result = await supabase
        .from('config_sistema')
        .insert([{
          clave,
          valor: valorAlmacenar,
          tipo: tipoDetectado,
          created_at: new Date().toISOString()
        }])
        .select()
    }

    if (result.error) throw result.error

    // Registrar cambio en timeline
    await supabase.from('timeline').insert({
      evento: 'config_actualizada',
      descripcion: `Configuración actualizada: ${clave}`,
      detalles: {
        clave,
        valor_anterior: existing ? 'existente' : 'nueva',
        valor_nuevo: valorAlmacenar,
        tipo: tipoDetectado
      }
    })

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: {
        clave,
        valor: valor,
        tipo: tipoDetectado,
        mensaje: existing ? 'Configuración actualizada' : 'Configuración creada'
      }
    })
  } catch (error) {
    console.error('Post config error:', error)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({
      success: false,
      error: error.message
    })
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
    return handlePost(req, res)
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.status(405).json({ error: 'Method not allowed' })
}
