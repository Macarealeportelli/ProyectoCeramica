import sql from 'mssql'

// Configuraciones optimizadas (localhost primero para reducir latencia)
const configs = [
  // Configuración 1: Localhost (más rápido)
  {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: 'localhost',
    port: parseInt(process.env.DB_PORT || '1435'),
    database: process.env.DB_NAME || 'ceramica',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 5000, // 5 segundos en lugar de 15
      requestTimeout: 10000 // 10 segundos para consultas
    }
  },
  // Configuración 2: Localhost con instancia SQLEXPRESS
  {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: 'localhost',
    port: parseInt(process.env.DB_PORT || '1435'),
    database: process.env.DB_NAME || 'ceramica',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: 'SQLEXPRESS',
      connectTimeout: 5000,
      requestTimeout: 10000
    }
  },
  // Configuración 3: Servidor remoto con instancia (como fallback)
  {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || '10.0.0.10',
    port: parseInt(process.env.DB_PORT || '1435'),
    database: process.env.DB_NAME || 'ceramica',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: 'sql2008r2',
      connectTimeout: 5000,
      requestTimeout: 10000
    }
  },
  // Configuración 4: Servidor remoto sin instancia
  {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || '10.0.0.10',
    port: parseInt(process.env.DB_PORT || '1435'),
    database: process.env.DB_NAME || 'ceramica',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 5000,
      requestTimeout: 10000
    }
  }
]

let currentConfigIndex = 0
let pool: sql.ConnectionPool | null = null
let isConnecting = false
let connectionPromise: Promise<sql.ConnectionPool> | null = null

export async function getConnection() {
  // Si ya tenemos una conexión activa, la devolvemos
  if (pool && pool.connected) {
    return pool
  }
  
  // Si ya hay una conexión en progreso, esperamos a que termine
  if (isConnecting && connectionPromise) {
    return connectionPromise
  }

  // Marcar que estamos conectando y crear la promesa
  isConnecting = true
  connectionPromise = connectToDatabase()
  
  try {
    pool = await connectionPromise
    return pool
  } finally {
    isConnecting = false
    connectionPromise = null
  }
}

async function connectToDatabase(): Promise<sql.ConnectionPool> {
  // Probar cada configuración hasta encontrar una que funcione
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i]
    const configName = [
      'Localhost sin instancia',
      'Localhost con SQLEXPRESS',
      'Servidor remoto con instancia sql2008r2',
      'Servidor remoto sin instancia'
    ][i]

    try {
      console.log(`[DB] 🔄 Probando configuración ${i + 1}: ${configName}`)
      console.log(`[DB] 📡 Conectando a: ${config.server}${config.options?.instanceName ? '\\' + config.options.instanceName : ''}:${config.port}`)
      
      const newPool = await sql.connect(config)
      console.log(`[DB] ✅ Conexión exitosa con configuración ${i + 1}: ${configName}`)
      currentConfigIndex = i
      return newPool
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.log(`[DB] ❌ Configuración ${i + 1} falló: ${errorMessage}`)
      
      // Si es el último intento, lanzar el error
      if (i === configs.length - 1) {
        console.error('[DB] ❌ Todas las configuraciones fallaron')
        throw err
      }
    }
  }
  
  throw new Error('No se pudo establecer conexión con ninguna configuración')
}