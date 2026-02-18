// DIVINIA OS — Catálogo de Servicios
// Endpoint público para landing page

const servicios = [
  {
    id: 'chatbot-whatsapp-basico',
    nombre: 'Chatbot WhatsApp Básico',
    categoria: 'ia-automatizaciones',
    descripcion: 'Chatbot simple para WhatsApp con respuestas automáticas',
    monto: 150000,
    moneda: 'ARS',
    duracion: '48 horas',
    caracteristicas: [
      'Respuestas automáticas',
      'Integraciones básicas',
      'Mensajes de bienvenida',
      'Soporte 7 días'
    ],
    depto: '01-IA-AUTOMATIZACIONES',
    estado: 'activo'
  },
  {
    id: 'chatbot-whatsapp-pro',
    nombre: 'Chatbot WhatsApp Pro',
    categoria: 'ia-automatizaciones',
    descripcion: 'Chatbot avanzado con IA, integración a CRM y análisis de sentimiento',
    monto: 250000,
    moneda: 'ARS',
    duracion: '1 semana',
    caracteristicas: [
      'IA conversacional (Claude)',
      'Integración CRM/Sheets',
      'Análisis de sentimiento',
      'Escalado a humanos',
      'Reportes automáticos',
      'Soporte 14 días'
    ],
    depto: '01-IA-AUTOMATIZACIONES',
    estado: 'activo'
  },
  {
    id: 'automatizacion-1',
    nombre: 'Automatización de Proceso (1)',
    categoria: 'ia-automatizaciones',
    descripcion: 'Automatización de un proceso empresarial específico',
    monto: 120000,
    moneda: 'ARS',
    duracion: '2-3 días',
    caracteristicas: [
      'Análisis del proceso',
      'Automatización con n8n/Make',
      'Integración 2-3 herramientas',
      'Documentación',
      'Training'
    ],
    depto: '01-IA-AUTOMATIZACIONES',
    estado: 'activo'
  },
  {
    id: 'pack-3-automatizaciones',
    nombre: 'Pack 3 Automatizaciones',
    categoria: 'ia-automatizaciones',
    descripcion: 'Descuento para 3 automatizaciones empresariales',
    monto: 300000,
    moneda: 'ARS',
    duracion: '1 semana',
    caracteristicas: [
      '3 procesos automatizados',
      'Integración 6+ herramientas',
      'Documentación completa',
      'Training equipo',
      'Soporte 30 días'
    ],
    depto: '01-IA-AUTOMATIZACIONES',
    estado: 'activo'
  },
  {
    id: 'automatizacion-ventas',
    nombre: 'Automatización de Ventas Completa',
    categoria: 'ia-automatizaciones',
    descripcion: 'Sistema completo: leads → CRM → propuestas → seguimiento',
    monto: 350000,
    moneda: 'ARS',
    duracion: '1-2 semanas',
    caracteristicas: [
      'Captura de leads automática',
      'CRM con IA',
      'Generación de propuestas',
      'Seguimiento automático',
      'Integración MercadoPago',
      'Reportes KPI'
    ],
    depto: '01-IA-AUTOMATIZACIONES',
    estado: 'activo'
  },
  {
    id: 'crm-automatizado',
    nombre: 'CRM Automatizado con IA',
    categoria: 'ia-automatizaciones',
    descripcion: 'CRM completo personalizado con automatizaciones de IA',
    monto: 400000,
    moneda: 'ARS',
    duracion: '2 semanas',
    caracteristicas: [
      'Interfaz personalizada',
      'Pipelines de ventas',
      'Lead scoring automático',
      'Recordatorios IA',
      'Análisis predictivo',
      'Integraciones múltiples'
    ],
    depto: '01-IA-AUTOMATIZACIONES',
    estado: 'activo'
  },
  {
    id: 'sistema-multiagente',
    nombre: 'Sistema Multi-Agente',
    categoria: 'ia-automatizaciones',
    descripcion: 'Arquitectura compleja de agentes autónomos coordinados',
    monto: 800000,
    moneda: 'ARS',
    duracion: '2-4 semanas',
    caracteristicas: [
      '3-5 agentes especializados',
      'Orquestación automática',
      'Aprendizaje continuo',
      'Integración API avanzada',
      'Monitoreo 24/7',
      'Soporte dedicado'
    ],
    depto: '01-IA-AUTOMATIZACIONES',
    estado: 'activo'
  },
  {
    id: 'landing-page',
    nombre: 'Landing Page',
    categoria: 'web-apps',
    descripcion: 'Landing page optimizada para conversión',
    monto: 100000,
    moneda: 'ARS',
    duracion: '24-48 horas',
    caracteristicas: [
      'Diseño responsive',
      'Optimizado SEO',
      'Formulario contacto',
      'Analytics Google',
      'SSL/HTTPS'
    ],
    depto: '02-WEB-APPS',
    estado: 'activo'
  },
  {
    id: 'sitio-web-completo',
    nombre: 'Sitio Web Completo',
    categoria: 'web-apps',
    descripcion: 'Sitio web corporativo multi-página con CMS',
    monto: 400000,
    moneda: 'ARS',
    duracion: '1-2 semanas',
    caracteristicas: [
      'Multi-página responsive',
      'CMS integrado',
      'Blog integrado',
      'Formularios avanzados',
      'SEO optimizado',
      'Certificado SSL',
      'Email profesional'
    ],
    depto: '02-WEB-APPS',
    estado: 'activo'
  },
  {
    id: 'dashboard-admin',
    nombre: 'Dashboard/Panel Admin',
    categoria: 'web-apps',
    descripcion: 'Panel administrativo personalizado con datos en tiempo real',
    monto: 600000,
    moneda: 'ARS',
    duracion: '2-3 semanas',
    caracteristicas: [
      'Interfaz personalizada',
      'Reportes en tiempo real',
      'Gráficos interactivos',
      'Exportación de datos',
      'Multi-usuario',
      'Auditoría de cambios'
    ],
    depto: '02-WEB-APPS',
    estado: 'activo'
  },
  {
    id: 'app-movil',
    nombre: 'App Móvil (iOS + Android)',
    categoria: 'web-apps',
    descripcion: 'Aplicación móvil nativa o cross-platform',
    monto: 600000,
    moneda: 'ARS',
    duracion: '3-4 semanas',
    caracteristicas: [
      'UI/UX profesional',
      'Funcionalidades custom',
      'Notificaciones push',
      'Offline mode',
      'Sincronización cloud',
      'Publicación stores'
    ],
    depto: '02-WEB-APPS',
    estado: 'activo'
  },
  {
    id: 'avatar-corporativo',
    nombre: 'Avatar Corporativo (Portavoz)',
    categoria: 'avatares-ia',
    descripcion: 'Avatar digital profesional para representar tu marca',
    monto: 300000,
    moneda: 'ARS',
    duracion: '1 semana',
    caracteristicas: [
      'Diseño 3D personalizado',
      'Voz clonada (opcional)',
      'Integración web/video',
      'Múltiples escenarios',
      '5 videos demostración'
    ],
    depto: '06-AVATARES-IA',
    estado: 'activo'
  },
  {
    id: 'avatar-atencion-cliente',
    nombre: 'Avatar para Atención al Cliente',
    categoria: 'avatares-ia',
    descripcion: 'Avatar interactivo para responder preguntas frecuentes',
    monto: 250000,
    moneda: 'ARS',
    duracion: '5 días',
    caracteristicas: [
      'Avatar interactivo',
      'Base de conocimiento',
      'Integración WhatsApp/Web',
      'Escalado a humanos',
      'Analytics'
    ],
    depto: '06-AVATARES-IA',
    estado: 'activo'
  },
  {
    id: 'influencer-ia',
    nombre: 'Influencer/Presentador IA',
    categoria: 'avatares-ia',
    descripcion: 'Avatar profesional para contenido de marca y presentaciones',
    monto: 450000,
    moneda: 'ARS',
    duracion: '2 semanas',
    caracteristicas: [
      'Avatar personalizado',
      'Voz profesional',
      '10 videos producidos',
      'Guiones personalizados',
      'Publicación en redes'
    ],
    depto: '06-AVATARES-IA',
    estado: 'activo'
  },
  {
    id: 'pack-videos-avatar',
    nombre: 'Pack 10 Videos con Avatar',
    categoria: 'avatares-ia',
    descripcion: 'Paquete de producción en video con tu avatar',
    monto: 150000,
    moneda: 'ARS',
    duracion: '2 semanas',
    caracteristicas: [
      '10 videos 30-60 seg',
      'Guiones incluidos',
      'Edición profesional',
      'Subtítulos multi-idioma',
      'Optimización redes'
    ],
    depto: '06-AVATARES-IA',
    estado: 'activo'
  },
  {
    id: 'avatar-chatbot',
    nombre: 'Avatar + Chatbot Integrado',
    categoria: 'avatares-ia',
    descripcion: 'Avatar conversacional con IA para atención integral',
    monto: 450000,
    moneda: 'ARS',
    duracion: '2-3 semanas',
    caracteristicas: [
      'Avatar + IA conversacional',
      'Multi-canal (web/app)',
      'Base conocimiento',
      'Análisis conversaciones',
      'Mejora continua IA'
    ],
    depto: '06-AVATARES-IA',
    estado: 'activo'
  },
  {
    id: 'content-30-posts',
    nombre: 'Pack 30 Posts/Mes Redes Sociales',
    categoria: 'content-factory',
    descripcion: 'Producción masiva de 30 posts mensuales para tus redes',
    monto: 80000,
    moneda: 'ARS',
    duracion: 'Mensual',
    caracteristicas: [
      '30 posts diseñados',
      'Calendario publicación',
      'Hashtags optimizados',
      'Variedad de formatos',
      'Adaptación algoritmo'
    ],
    depto: '04-CONTENT-FACTORY',
    estado: 'activo'
  },
  {
    id: 'content-10posts-4videos',
    nombre: 'Pack 10 Posts + 4 Videos',
    categoria: 'content-factory',
    descripcion: 'Contenido mixto: posts + videos cortos optimizados',
    monto: 120000,
    moneda: 'ARS',
    duracion: 'Mensual',
    caracteristicas: [
      '10 posts + fotos',
      '4 videos 15-30 seg',
      'Motion graphics',
      'Subtítulos',
      'Edición profesional'
    ],
    depto: '04-CONTENT-FACTORY',
    estado: 'activo'
  },
  {
    id: 'gestion-completa-redes',
    nombre: 'Gestión Completa Redes Sociales',
    categoria: 'content-factory',
    descripcion: 'Gestión integral: contenido + community management + publicidad',
    monto: 150000,
    moneda: 'ARS',
    duracion: 'Mensual',
    caracteristicas: [
      'Estrategia mensual',
      'Contenido diario',
      'Community management',
      'Respuesta comentarios',
      'Reportes analíticos',
      'Optimización crono'
    ],
    depto: '04-CONTENT-FACTORY',
    estado: 'activo'
  },
  {
    id: 'youtube-1video',
    nombre: 'Guión + Producción 1 Video YouTube',
    categoria: 'youtube-multimedia',
    descripcion: 'Video completo: guión, producción, edición, optimización SEO',
    monto: 50000,
    moneda: 'ARS',
    duracion: '3-5 días',
    caracteristicas: [
      'Guión optimizado',
      'Producción HD',
      'Edición profesional',
      'Intro/outro personalizado',
      'Miniaturas optimizadas',
      'Tags SEO optimizados'
    ],
    depto: '03-YOUTUBE-MULTIMEDIA',
    estado: 'activo'
  },
  {
    id: 'youtube-4videos',
    nombre: 'Pack 4 Videos YouTube/Mes',
    categoria: 'youtube-multimedia',
    descripcion: 'Producción mensual de 4 videos optimizados para YouTube',
    monto: 150000,
    moneda: 'ARS',
    duracion: 'Mensual',
    caracteristicas: [
      '4 videos mes (8-15 min)',
      'Guiones temáticos',
      'Producción calidad 4K',
      'Edición avanzada',
      'SEO YouTube',
      'Adaptación a Shorts/Reels'
    ],
    depto: '03-YOUTUBE-MULTIMEDIA',
    estado: 'activo'
  },
  {
    id: 'youtube-canal-completo',
    nombre: 'Canal YouTube Completo',
    categoria: 'youtube-multimedia',
    descripcion: 'Setup completo del canal + primeros 10 videos',
    monto: 400000,
    moneda: 'ARS',
    duracion: '3-4 semanas',
    caracteristicas: [
      'Branding canal',
      'Banners/thumbnails',
      '10 videos producción',
      'Estrategia de contenido',
      'SEO optimizado',
      'Integración otras redes'
    ],
    depto: '03-YOUTUBE-MULTIMEDIA',
    estado: 'activo'
  },
  {
    id: 'mantenimiento-basico',
    nombre: 'Plan Mantenimiento Básico',
    categoria: 'mantenimiento',
    descripcion: 'Mantenimiento mensual: actualizaciones, bugs, soporte',
    monto: 50000,
    moneda: 'ARS',
    duracion: 'Mensual',
    caracteristicas: [
      'Actualizaciones seguridad',
      'Fix bugs reportados',
      'Backups automáticos',
      'Soporte por email',
      'Uptime 99%'
    ],
    depto: '05-CLIENTES-SERVICIOS',
    estado: 'activo'
  },
  {
    id: 'mantenimiento-pro',
    nombre: 'Plan Mantenimiento Pro',
    categoria: 'mantenimiento',
    descripcion: 'Soporte avanzado: mejoras, optimización, análisis',
    monto: 100000,
    moneda: 'ARS',
    duracion: 'Mensual',
    caracteristicas: [
      'Todo Plan Básico',
      'Mejoras mensuales',
      'Optimización performance',
      'Análisis seguridad',
      'Soporte telefónico',
      'Reporting detallado'
    ],
    depto: '05-CLIENTES-SERVICIOS',
    estado: 'activo'
  },
  {
    id: 'mantenimiento-enterprise',
    nombre: 'Plan Mantenimiento Enterprise',
    categoria: 'mantenimiento',
    descripcion: 'Soporte dedicado 24/7 con equipo asignado',
    monto: 200000,
    moneda: 'ARS',
    duracion: 'Mensual',
    caracteristicas: [
      'Todo Plan Pro',
      'Soporte 24/7',
      'Equipo dedicado',
      'SLA garantizado',
      'Desarrollo custom',
      'Reuniones estratégicas'
    ],
    depto: '05-CLIENTES-SERVICIOS',
    estado: 'activo'
  }
]

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const { categoria, estado } = req.query

      let resultado = servicios

      if (categoria) {
        resultado = resultado.filter(s => s.categoria === categoria)
      }

      if (estado) {
        resultado = resultado.filter(s => s.estado === estado)
      } else {
        // Por defecto, solo servicios activos
        resultado = resultado.filter(s => s.estado === 'activo')
      }

      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Content-Type', 'application/json')
      return res.status(200).json({
        success: true,
        data: resultado,
        total: resultado.length,
        categorias: [...new Set(servicios.map(s => s.categoria))]
      })
    } catch (error) {
      console.error('Error:', error)
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  return res.status(405).json({ error: 'Method not allowed' })
}
