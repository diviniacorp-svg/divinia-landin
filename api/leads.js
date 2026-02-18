// DIVINIA OS — Gestión de Leads (CRM)
// Crear leads desde formularios, listar, asignar scores

import supabase from './_lib/supabase.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

// Calcular lead score basado en servicio y datos
function calculateLeadScore(data) {
  let score = 0

  // Scoring por tipo de servicio
  const serviceScores = {
    'chatbot-whatsapp-pro': 80,
    'chatbot-whatsapp-basico': 60,
    'automatizacion': 70,
    'web-app': 75,
    'avatar-ia': 85,
    'crm': 80,
    'youtube': 50,
    'content-factory': 55,
    'avatar-chatbot': 90
  }

  if (data.servicio) {
    score += serviceScores[data.servicio] || 40
  }

  // Bonus por empresa establecida
  if (data.empresa_empleados && data.empresa_empleados >= 5) {
    score += 15
  }

  // Bonus por teléfono + email
  if (data.telefono && data.email) {
    score += 10
  }

  // Bonus por urgencia
  if (data.urgencia === 'alta' || data.urgencia === 'urgente') {
    score += 20
  }

  // Bonus por región San Luis
  if (data.provincia?.toLowerCase() === 'san luis') {
    score += 10
  }

  return Math.min(score, 100)
}

// Manejador GET — Listar leads
async function handleGet(req, res) {
  try {
    const { estado, score_min, limit = 50 } = req.query

    let query = supabase.from('clientes').select('*')

    if (estado) {
      query = query.eq('estado', estado)
    }

    if (score_min) {
      query = query.gte('score', parseInt(score_min))
    }

    const { data, error } = await query
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: data || [],
      total: data?.length || 0
    })
  } catch (error) {
    console.error('Get leads error:', error)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Manejador POST — Crear nuevo lead
async function handlePost(req, res) {
  try {
    const { nombre, email, telefono, empresa, servicio, mensaje, urgencia, provincia, empleados_empresa } = req.body

    // Validaciones
    if (!nombre || !email) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(400).json({
        error: 'nombre y email son requeridos'
      })
    }

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(409).json({
        success: false,
        error: 'Este email ya existe en nuestro sistema',
        cliente_id: existing.id
      })
    }

    // Calcular score
    const score = calculateLeadScore({
      servicio,
      empresa_empleados: empleados_empresa,
      telefono,
      email,
      urgencia,
      provincia
    })

    // Crear cliente
    const nuevoCliente = {
      nombre,
      email,
      telefono: telefono || null,
      empresa: empresa || null,
      provincia: provincia || null,
      empleados: empleados_empresa || null,
      servicios_interes: servicio ? [servicio] : [],
      score: score,
      estado: score >= 70 ? 'contactado' : 'nuevo',
      fuente: 'landing-page',
      notas: mensaje || null,
      urgencia: urgencia || 'normal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([nuevoCliente])
      .select('id, nombre, email, score, estado')

    if (error) throw error

    const cliente = data?.[0]

    // Registrar en timeline
    await supabase.from('timeline').insert({
      cliente_id: cliente.id,
      evento: 'lead_creado',
      descripcion: `Lead creado desde landing page: ${nombre}`,
      detalles: {
        score: score,
        servicio: servicio,
        telefono: telefono
      }
    })

    // Crear demo automáticamente si score es alto
    if (score >= 80) {
      await supabase.from('demos').insert({
        cliente_id: cliente.id,
        estado: 'pendiente_confirmacion',
        tipo_demo: servicio || 'general',
        notas: `Lead high-score: ${nombre}`
      })
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(201).json({
      success: true,
      data: {
        cliente_id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        score: cliente.score,
        estado: cliente.estado,
        mensaje: `Lead creado exitosamente con score ${cliente.score}/100`
      }
    })
  } catch (error) {
    console.error('Create lead error:', error)
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
