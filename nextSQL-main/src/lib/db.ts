import sql from 'mssql'

// Configuraciones alternativas para probar
const configs = [
  // Configuración 1: Servidor remoto con instancia
  {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || '10.0.0.10',
    port: parseInt(process.env.DB_PORT || '1435'),
    database: process.env.DB_NAME || 'ceramica',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: 'sql2008r2'
    }
  },
  // Configuración 2: Servidor remoto sin instancia
  {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || '10.0.0.10',
    port: parseInt(process.env.DB_PORT || '1435'),
    database: process.env.DB_NAME || 'ceramica',
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  // Configuración 3: Localhost
  {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: 'localhost',
    port: parseInt(process.env.DB_PORT || '1435'),
    database: process.env.DB_NAME || 'ceramica',
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  // Configuración 4: Localhost con instancia
  {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: 'localhost',
    port: parseInt(process.env.DB_PORT || '1435'),
    database: process.env.DB_NAME || 'ceramica',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: 'SQLEXPRESS'
    }
  }
]

let currentConfigIndex = 0

let pool: sql.ConnectionPool | null = null

export async function getConnection() {
  if (pool) {
    return pool
  }

  // Probar cada configuración hasta encontrar una que funcione
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i]
    const configName = [
      'Servidor remoto con instancia sql2008r2',
      'Servidor remoto sin instancia',
      'Localhost sin instancia',
      'Localhost con SQLEXPRESS'
    ][i]

    try {
      console.log(`[DB] 🔄 Probando configuración ${i + 1}: ${configName}`)
      console.log(`[DB] 📡 Conectando a: ${config.server}${config.options?.instanceName ? '\\' + config.options.instanceName : ''}:${config.port}`)
      
      pool = await sql.connect(config)
      console.log(`[DB] ✅ Conexión exitosa con configuración ${i + 1}: ${configName}`)
      currentConfigIndex = i
      return pool
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.log(`[DB] ❌ Configuración ${i + 1} falló: ${errorMessage}`)
      pool = null
      
      // Si es el último intento, lanzar el error
      if (i === configs.length - 1) {
        console.error('[DB] ❌ Todas las configuraciones fallaron')
        throw err
      }
    }
  }
}