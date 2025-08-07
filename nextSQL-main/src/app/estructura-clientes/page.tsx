import { getConnection } from '@/lib/db'

export default async function EstructuraClientesPage() {
  let estructura: any[] = []
  let error: string | null = null
  let tablaExiste = false
  let datosEjemplo: any[] = []

  try {
    console.log('[ESTRUCTURA] 🔍 Verificando estructura de CLIE_MAECLIENTES...')
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    // Verificar si la tabla existe
    const checkTable = await pool.request().query(`
      SELECT COUNT(*) as existe 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'CLIE_MAECLIENTES'
    `)
    
    tablaExiste = checkTable.recordset[0].existe > 0
    console.log(`[ESTRUCTURA] 📋 Tabla existe: ${tablaExiste}`)
    
    if (tablaExiste) {
      // Obtener estructura de columnas
      const estructuraResult = await pool.request().query(`
        SELECT 
          COLUMN_NAME as nombre,
          DATA_TYPE as tipo,
          CHARACTER_MAXIMUM_LENGTH as longitud,
          IS_NULLABLE as nulo
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'CLIE_MAECLIENTES'
        ORDER BY ORDINAL_POSITION
      `)
      
      estructura = estructuraResult.recordset
      console.log(`[ESTRUCTURA] ✅ ${estructura.length} columnas encontradas`)
      
      // Obtener algunos datos de ejemplo
      try {
        const ejemploResult = await pool.request().query(`
          SELECT TOP 3 * FROM CLIE_MAECLIENTES
        `)
        datosEjemplo = ejemploResult.recordset
        console.log(`[ESTRUCTURA] 📊 ${datosEjemplo.length} registros de ejemplo`)
      } catch (err: any) {
        console.log(`[ESTRUCTURA] ⚠️ No se pudieron obtener datos de ejemplo: ${err.message}`)
      }
    }
    
  } catch (err: any) {
    error = err.message
    console.error('[ESTRUCTURA] ❌ Error:', error)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Estructura de CLIE_MAECLIENTES</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">📋 Información General</h2>
        <p><strong>Tabla:</strong> CLIE_MAECLIENTES</p>
        <p><strong>Existe:</strong> {tablaExiste ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Columnas encontradas:</strong> {estructura.length}</p>
        <p><strong>Registros de ejemplo:</strong> {datosEjemplo.length}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">❌ Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {estructura.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Estructura de Columnas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1 text-left w-1/4">Nombre</th>
                  <th className="border border-gray-300 px-2 py-1 text-left w-1/4">Tipo</th>
                  <th className="border border-gray-300 px-2 py-1 text-left w-1/4">Longitud</th>
                  <th className="border border-gray-300 px-2 py-1 text-left w-1/4">Permite NULL</th>
                </tr>
              </thead>
              <tbody>
                {estructura.map((col, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-2 py-1 font-mono truncate">{col.nombre}</td>
                    <td className="border border-gray-300 px-2 py-1 truncate">{col.tipo}</td>
                    <td className="border border-gray-300 px-2 py-1 truncate">{col.longitud || 'N/A'}</td>
                    <td className="border border-gray-300 px-2 py-1 truncate">{col.nulo === 'YES' ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {datosEjemplo.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Datos de Ejemplo</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  {Object.keys(datosEjemplo[0] || {}).map((key) => (
                    <th key={key} className="border border-gray-300 px-2 py-1 text-left font-mono truncate">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datosEjemplo.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {Object.values(row).map((value: any, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 px-2 py-1 truncate">
                        {value !== null ? String(value) : '(NULL)'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">🔗 Navegación</h2>
        <div className="space-x-4">
          <a href="/" className="text-blue-600 hover:underline">🏠 Inicio</a>
          <a href="/clientes" className="text-blue-600 hover:underline">👥 Clientes</a>
          <a href="/datos" className="text-blue-600 hover:underline">📊 Datos Entidades</a>
        </div>
      </div>
    </div>
  )
}