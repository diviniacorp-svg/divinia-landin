// DIVINIA OS — Gestión de Agentes (CRUD + Ejecución)
// Listar agentes y ejecutarlos con IA

import supabase from './_lib/supabase.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

// Ejecutar agente con Claude
async function executeAgent(agentConfig, input) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || ''
      },
      body: JSON.stringify({
        model: agentConfig.modelo || 'claude-3-5-haiku-20241022',
        max_tokens: agentConfig.max_tokens || 1000,
        system: agentConfig.prompt_sistema,
        messages: [
          {
            role: 'user',
            content: input
          }
        ]
      })
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return {
      success: true,
      output: data.content?.[0]?.text || '',
      usage: data.usage
    }
  } catch (error) {
    console.error('Agent execution error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Manejador GET — Listar agentes
async function handleGet(req, res) {
  try {
    const { departamento, activo } = req.query

    let query = supabase.from('agentes').select('*')

    if (departamento) {
      query = query.eq('departamento', departamento)
    }

    if (activo !== undefined) {
      query = query.eq('activo', activo === 'true')
    }

    const { data, error } = await query.order('nombre')

    if (error) throw error

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: data || [],
      total: data?.length || 0
    })
  } catch (error) {
    console.error('Get agents error:', error)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Manejador POST — Ejecutar agente
async function handlePost(req, res) {
  try {
    const { agent_id, input, departamento } = req.body

    if (!agent_id && !departamento) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(400).json({
        error: 'Se requiere agent_id o departamento'
      })
    }

    if (!input) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(400).json({
        error: 'input es requerido'
      })
    }

    // Obtener config del agente
    let query = supabase.from('agentes').select('*')

    if (agent_id) {
      query = query.eq('id', agent_id)
    } else if (departamento) {
      query = query.eq('departamento', departamento).eq('activo', true)
    }

    const { data: agents, error: fetchError } = await query.limit(1)

    if (fetchError || !agents || agents.length === 0) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(404).json({
        error: 'Agente no encontrado'
      })
    }

    const agent = agents[0]

    // Ejecutar agente
    const execution = await executeAgent(agent, input)

    // Registrar actividad
    const activity = {
      agent_id: agent.id,
      input: input.substring(0, 1000),
      output: execution.output?.substring(0, 2000) || null,
      exitoso: execution.success,
      error: execution.error || null,
      tokens_usados: execution.usage?.output_tokens || 0,
      timestamp: new Date().toISOString()
    }

    await supabase.from('actividad_agentes').insert(activity)

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: {
        agent_name: agent.nombre,
        departamento: agent.departamento,
        execution: execution,
        activity_logged: true
      }
    })
  } catch (error) {
    console.error('Execute agent error:', error)
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
