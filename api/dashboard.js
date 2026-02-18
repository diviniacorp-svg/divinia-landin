// DIVINIA OS — Dashboard Data Aggregation
// Todos los metrics en una sola llamada optimizada

import supabase from './_lib/supabase.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

// Obtener fecha de hace N días
function getDateNDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// Manejador GET — Agregación de datos
async function handleGet(req, res) {
  try {
    const hoy = new Date().toISOString().split('T')[0]
    const hace7Dias = getDateNDaysAgo(7)
    const hace30Dias = getDateNDaysAgo(30)

    // Ejecutar queries en paralelo
    const [
      clientesTotales,
      clientesNuevos7d,
      clientesConScore,
      projectosActivos,
      projectosCompletados,
      pagosConfirmados30d,
      pagosPendientes,
      pagosRechazados,
      tareasAgenda,
      agentesActivos,
      leadsPendientes,
      conversacionesAbiertas
    ] = await Promise.all([
      // Total de clientes
      supabase.from('clientes').select('id').then(r => r.data?.length || 0),

      // Clientes nuevos últimos 7 días
      supabase
        .from('clientes')
        .select('id')
        .gte('created_at', `${hace7Dias}T00:00:00`),

      // Clientes con score >= 70
      supabase
        .from('clientes')
        .select('score')
        .gte('score', 70),

      // Proyectos activos
      supabase
        .from('proyectos')
        .select('id, estado, monto')
        .eq('estado', 'en-progreso'),

      // Proyectos completados este mes
      supabase
        .from('proyectos')
        .select('id, monto')
        .eq('estado', 'completado')
        .gte('updated_at', `${hace30Dias}T00:00:00`),

      // Pagos confirmados últimos 30 días
      supabase
        .from('pagos')
        .select('monto, estado')
        .eq('estado', 'confirmado')
        .gte('created_at', `${hace30Dias}T00:00:00`),

      // Pagos pendientes
      supabase
        .from('pagos')
        .select('monto')
        .eq('estado', 'pendiente'),

      // Pagos rechazados
      supabase
        .from('pagos')
        .select('id')
        .eq('estado', 'rechazado'),

      // Tareas agenda de Joaco
      supabase
        .from('agenda_joaco')
        .select('id, prioridad')
        .neq('estado', 'completado'),

      // Agentes activos
      supabase
        .from('agentes')
        .select('id')
        .eq('activo', true),

      // Leads pendientes de seguimiento
      supabase
        .from('clientes')
        .select('id')
        .eq('estado', 'nuevo')
        .lte('score', 70),

      // Conversaciones abiertas WhatsApp
      supabase
        .from('conversaciones')
        .select('id, unread')
        .gt('unread', 0)
    ])

    // Procesar datos
    const totalClientes = clientesTotales
    const clientesNuevos = clientesNuevos7d.data?.length || 0
    const clientesPotenciales = clientesConScore.data?.length || 0

    const proyectosActivosCount = projectosActivos.data?.length || 0
    const proyectosActivosMonto = projectosActivos.data?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0

    const proyectosCompletadosCount = projectosCompletados.data?.length || 0
    const proyectosCompletadosMonto = projectosCompletados.data?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0

    const pagosConfirmadosMonto = pagosConfirmados30d.data?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0
    const pagosPendientesMonto = pagosPendientes.data?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0

    const ingresosMes = pagosConfirmadosMonto
    const promedioCliente = totalClientes > 0 ? Math.round(ingresosMes / totalClientes) : 0

    const tareasUrgentes = tareasAgenda.data?.filter(t => t.prioridad >= 90).length || 0
    const tareasTotales = tareasAgenda.data?.length || 0

    const agentesCount = agentesActivos.data?.length || 0
    const leadsCount = leadsPendientes.data?.length || 0
    const conversacionesAbiertas = conversacionesAbiertas.data?.length || 0
    const mensajesNoLeidos = conversacionesAbiertas.data?.reduce((sum, c) => sum + (c.unread || 0), 0) || 0

    // Calcular tendencias simples
    const tasaConversion = totalClientes > 0 ? ((clientesPotenciales / totalClientes) * 100).toFixed(1) : 0
    const tasaCompletacion = (proyectosActivosCount + proyectosCompletadosCount) > 0
      ? ((proyectosCompletadosCount / (proyectosActivosCount + proyectosCompletadosCount)) * 100).toFixed(1)
      : 0

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({
      success: true,
      data: {
        // Clientes
        clientes: {
          total: totalClientes,
          nuevos_7d: clientesNuevos,
          potenciales_score_70: clientesPotenciales,
          tasa_conversion_pct: parseFloat(tasaConversion)
        },

        // Proyectos
        proyectos: {
          activos: proyectosActivosCount,
          activos_monto: proyectosActivosMonto,
          completados_30d: proyectosCompletadosCount,
          completados_monto_30d: proyectosCompletadosMonto,
          tasa_completacion_pct: parseFloat(tasaCompletacion)
        },

        // Ingresos
        ingresos: {
          mes_30d: ingresosMes,
          pendiente_cobrar: pagosPendientesMonto,
          rechazados_30d: pagosRechazados.data?.length || 0,
          promedio_por_cliente: promedioCliente
        },

        // Operaciones
        operaciones: {
          tareas_agenda_total: tareasTotales,
          tareas_urgentes: tareasUrgentes,
          agentes_activos: agentesCount,
          leads_por_seguimiento: leadsCount
        },

        // Comunicaciones
        comunicaciones: {
          conversaciones_abiertas: conversacionesAbiertas,
          mensajes_no_leidos: mensajesNoLeidos
        },

        // Timestamp
        timestamp: new Date().toISOString(),
        periodo: {
          inicio: hace30Dias,
          fin: hoy
        }
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
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

  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.status(405).json({ error: 'Method not allowed' })
}
