// DIVINIA OS CEO Router — Enrutador inteligente de mensajes y tareas
// Clasifica intenciones y enruta a departamentos correctos

import supabase from './_lib/supabase.js'

// Headers CORS estándar
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

// Patrones regex para clasificación rápida (sin IA)
const intentsPatterns = {
  cotizacion: /(?:cotizaci[óo]n|presupuesto|precio|cuanto|cuesta|costo|favor de|valor|me cobr)/i,
  soporte: /(?:ayuda|no funciona|error|problema|bug|falla|roto|borrar|eliminar|cambiar|editar)/i,
  consulta: /(?:c[óo]mo|cual|cuales|que|informaci[óo]n|me explica|tengo una pregunta|quiero saber|interesa)/i,
  queja: /(?:insatisfecho|no me gusta|mal|terrible|horroroso|muy malo|engaño|estafa|reclamo)/i,
  seguimiento: /(?:status|estado|avance|c[óo]mo va|ya est[áa]|cuando entrega|cuando termina)/i,
  nuevo_cliente: /(?:hola|buenos d[íi]as|buenas noches|soy|me presentó|empresa|soy de|trabajo en)/i,
  urgente: /(?:urgente|urgencia|ahora|ya|asap|inmediato|emergencia|cr[íi]tico|no puede esperar)/i
}

// Departamentos y agentes asociados
const departamentos = {
  cotizacion: {
    nombre: 'CLIENTES-SERVICIOS',
    numero: '05',
    agente: 'Vendedor IA',
    director: 'Director Comercial'
  },
  soporte: {
    nombre: 'CLIENTES-SERVICIOS',
    numero: '05',
    agente: 'Soporte Técnico',
    director: 'Director Comercial'
  },
  consulta: {
    nombre: 'IA-AUTOMATIZACIONES',
    numero: '01',
    agente: 'Dev de Agentes',
    director: 'Director de IA'
  },
  queja: {
    nombre: 'CLIENTES-SERVICIOS',
    numero: '05',
    agente: 'Project Delivery',
    director: 'Director Comercial'
  },
  seguimiento: {
    nombre: 'CLIENTES-SERVICIOS',
    numero: '05',
    agente: 'CRM Manager',
    director: 'Director Comercial'
  },
  nuevo_cliente: {
    nombre: 'CLIENTES-SERVICIOS',
    numero: '05',
    agente: 'Vendedor IA',
    director: 'Director Comercial'
  },
  urgente: {
    nombre: 'CLIENTES-SERVICIOS',
    numero: '05',
    agente: 'Project Delivery',
    director: 'Director Comercial'
  }
}

// Función para clasificar intención con regex (rápido, barato)
function classifyWithRegex(mensaje) {
  for (const [intent, pattern] of Object.entries(intentsPatterns)) {
    if (pattern.test(mensaje)) {
      return { intent, confidence: 0.8, method: 'regex' }
    }
  }
  return null
}

// Función para clasificar con Claude Haiku (cuando regex no detecta nada)
async function classifyWithHaiku(mensaje) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || ''
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `Clasifica esta intención en UNA sola categoría. Responde SOLO con la palabra:

Categorías: cotizacion, soporte, consulta, queja, seguimiento, nuevo_cliente, urgente

Mensaje: "${mensaje}"

Responde solo la categoría:`
          }
        ]
      })
    })

    const data = await response.json()
    const intent = data.content?.[0]?.text?.trim().toLowerCase()

    // Validar que sea una intención válida
    if (Object.keys(intentsPatterns).includes(intent)) {
      return { intent, confidence: 0.9, method: 'haiku' }
    }

    return { intent: 'consulta', confidence: 0.5, method: 'default' }
  } catch (error) {
    console.error('Haiku classification error:', error)
    return { intent: 'consulta', confidence: 0.5, method: 'fallback' }
  }
}

// Función principal de clasificación
async function classifyIntent(mensaje) {
  // Intenta primero con regex (rápido y barato)
  const regexResult = classifyWithRegex(mensaje)
  if (regexResult && regexResult.confidence > 0.75) {
    return regexResult
  }

  // Si no confía en regex, usa Haiku
  return await classifyWithHaiku(mensaje)
}

// Generar respuesta sugerida basada en intención
function generateSuggestedResponse(intent, departamento) {
  const respuestas = {
    cotizacion: `¡Hola! Te paso con nuestro equipo comercial para hacer una cotización. Estamos listos para ayudarte. Nos alegra tu interés.`,
    soporte: `Entendemos tu problema. Te estamos conectando con nuestro equipo técnico para resolverlo rápidamente.`,
    consulta: `Buena pregunta. Nuestro equipo de especialistas está viendo tu consulta y te responde pronto.`,
    queja: `Sentimos mucho tu inconveniente. Lo estamos escalando inmediatamente a nuestro director para resolver.`,
    seguimiento: `Perfecto, vamos a revisar el estado de tu proyecto ahora mismo.`,
    nuevo_cliente: `¡Bienvenido a DIVINIA! Somos una empresa digital que automatiza procesos y vende soluciones de IA. ¿En qué te podemos ayudar?`,
    urgente: `Recibimos tu mensaje URGENTE. Lo estamos escalando ahora a nuestro CEO.`
  }
  return respuestas[intent] || respuestas.consulta
}

// Calcular prioridad según intención
function calculatePriority(intent) {
  const priorities = {
    urgente: 100,
    queja: 90,
    soporte: 80,
    cotizacion: 70,
    nuevo_cliente: 60,
    seguimiento: 50,
    consulta: 30
  }
  return priorities[intent] || 30
}

// Manejador principal
export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { mensaje, telefono, cliente_id, contexto } = req.body

    if (!mensaje) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(400).json({ error: 'mensaje es requerido' })
    }

    // Clasificar intención
    const classification = await classifyIntent(mensaje)

    // Obtener información del departamento
    const depto = departamentos[classification.intent]

    // Calcular prioridad
    const prioridad = calculatePriority(classification.intent)

    // Generar respuesta sugerida
    const respuesta_sugerida = generateSuggestedResponse(classification.intent, depto)

    // Registrar en routing_log
    const routingLog = {
      mensaje: mensaje.substring(0, 500),
      intension: classification.intent,
      confianza: classification.confidence,
      metodo_clasificacion: classification.method,
      departamento: depto.numero,
      agente_asignado: depto.agente,
      prioridad: prioridad,
      telefono: telefono || null,
      cliente_id: cliente_id || null,
      contexto_adicional: contexto || null,
      timestamp: new Date().toISOString(),
      procesado: false
    }

    await supabase.from('routing_log').insert(routingLog)

    // Crear tarea en la agenda de Joaco si es urgente o queja
    if (prioridad >= 90) {
      await supabase.from('agenda_joaco').insert({
        titulo: `[${classification.intent.toUpperCase()}] ${mensaje.substring(0, 50)}...`,
        descripcion: mensaje,
        prioridad: prioridad,
        departamento: depto.numero,
        estado: 'pendiente',
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
        requiere_joaco: true
      })
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: {
        intent: classification.intent,
        confidence: classification.confidence,
        departamento: depto.nombre,
        numero_depto: depto.numero,
        director: depto.director,
        agente: depto.agente,
        prioridad: prioridad,
        respuesta_sugerida: respuesta_sugerida,
        routing_id: routingLog.id
      }
    })
  } catch (error) {
    console.error('CEO Router error:', error)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
