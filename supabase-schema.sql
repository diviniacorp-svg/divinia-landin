-- DIVINIA OS v3.1 — Supabase Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query

-- CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL,
  empresa TEXT,
  rubro TEXT,
  email TEXT,
  telefono TEXT,
  estado TEXT DEFAULT 'nuevo',
  score INT DEFAULT 50,
  fecha_alta DATE DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROYECTOS
CREATE TABLE IF NOT EXISTS proyectos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  cliente_id BIGINT REFERENCES clientes(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  servicio TEXT,
  precio INT DEFAULT 0,
  estado TEXT DEFAULT 'propuesta',
  progreso INT DEFAULT 0,
  deadline DATE,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAREAS (Agenda de Joaco)
CREATE TABLE IF NOT EXISTS tareas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  texto TEXT NOT NULL,
  prioridad TEXT DEFAULT 'media',
  categoria TEXT DEFAULT 'general',
  fecha DATE DEFAULT CURRENT_DATE,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MOVIMIENTOS FINANCIEROS
CREATE TABLE IF NOT EXISTS movimientos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tipo TEXT NOT NULL, -- 'ingreso' | 'gasto'
  monto DECIMAL(12,2) DEFAULT 0,
  moneda TEXT DEFAULT 'ARS',
  concepto TEXT,
  cliente_id BIGINT REFERENCES clientes(id) ON DELETE SET NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS departamentos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL,
  icono TEXT,
  activo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIMELINE (Activity Log)
CREATE TABLE IF NOT EXISTS timeline (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  texto TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

-- MENSAJES (Chat WhatsApp)
CREATE TABLE IF NOT EXISTS mensajes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  telefono TEXT NOT NULL,
  contenido TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'enviado' | 'recibido'
  estado TEXT DEFAULT 'pendiente', -- 'pendiente' | 'enviado' | 'leido'
  wa_message_id TEXT, -- ID de Meta Cloud API
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSACIONES
CREATE TABLE IF NOT EXISTS conversaciones (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  telefono TEXT NOT NULL UNIQUE,
  nombre_contacto TEXT,
  ultimo_mensaje TEXT,
  ultimo_timestamp TIMESTAMPTZ,
  cliente_id BIGINT REFERENCES clientes(id) ON DELETE SET NULL,
  unread INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTOS CEREBRO (Intelligence Log)
CREATE TABLE IF NOT EXISTS eventos_cerebro (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tipo TEXT NOT NULL, -- 'mensaje_recibido' | 'intent_detectado' | 'tarea_creada'
  payload JSONB,
  procesado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for single-user setup (Joaco only)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_cerebro ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (single user)
CREATE POLICY "Allow all for anon" ON clientes FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON proyectos FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON tareas FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON movimientos FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON departamentos FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON timeline FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON mensajes FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON conversaciones FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON eventos_cerebro FOR ALL USING (true);

-- Enable Realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE conversaciones;
