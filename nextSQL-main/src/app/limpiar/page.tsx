import { getConnection } from '../../lib/db'
import { redirect } from 'next/navigation'

export default async function LimpiarPage() {
  let resultado: string = ''
  let error: string | null = null
  let registrosEliminados = 0

  try {
    console.log('[LIMPIAR] 🧹 Iniciando limpieza de datos...')
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    // Primero contar los registros existentes
    const countResult = await pool.request().query(`
      SELECT COUNT(*) as total FROM Ent_maeentidad
    `)
    
    const totalAntes = countResult.recordset[0].total
    console.log(`[LIMPIAR] 📊 Registros encontrados: ${totalAntes}`)
    
    if (totalAntes === 0) {
      resultado = 'La tabla ya está vacía. No hay datos que eliminar.'
    } else {
      // Eliminar todos los registros
      const deleteResult = await pool.request().query(`
        DELETE FROM Ent_maeentidad
      `)
      
      registrosEliminados = deleteResult.rowsAffected[0] || totalAntes
      
      // Reiniciar el contador de identidad
      await pool.request().query(`
        DBCC CHECKIDENT('Ent_maeentidad', RESEED, 0)
      `)
      
      resultado = `Se eliminaron ${registrosEliminados} registros exitosamente. La tabla está ahora vacía y el contador de ID se reinició.`
      console.log(`[LIMPIAR] ✅ ${registrosEliminados} registros eliminados`)
      console.log('[LIMPIAR] 🔄 Contador de identidad reiniciado')
    }
    
  } catch (err: any) {
    error = err.message
    console.error('[LIMPIAR] ❌ Error al limpiar datos:', error)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧹 Limpieza de Datos - ENT_MAEENTIDAD</h1>
      
      {error ? (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h2>❌ Error durante la limpieza:</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ 
          color: 'green', 
          backgroundColor: '#e6ffe6', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h2>✅ Operación completada:</h2>
          <p>{resultado}</p>
          {registrosEliminados > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>📊 Detalles:</strong>
              <ul>
                <li>Registros eliminados: {registrosEliminados}</li>
                <li>Estado de la tabla: Vacía</li>
                <li>Contador de ID: Reiniciado a 0</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '5px' }}>
        <h3>🔍 Operaciones SQL ejecutadas:</h3>
        <pre style={{ backgroundColor: '#e8e8e8', padding: '10px', borderRadius: '3px' }}>
{`-- Contar registros existentes
SELECT COUNT(*) as total FROM Ent_maeentidad

-- Eliminar todos los registros
DELETE FROM Ent_maeentidad

-- Reiniciar contador de identidad
DBCC CHECKIDENT('Ent_maeentidad', RESEED, 0)`}
        </pre>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>⚠️ Información importante:</h3>
        <ul style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px' }}>
          <li>Esta operación elimina <strong>TODOS</strong> los registros de la tabla</li>
          <li>El contador de identidad se reinicia a 0</li>
          <li>Los próximos registros insertados comenzarán con ID = 1</li>
          <li>Esta acción <strong>NO</strong> se puede deshacer</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a href="/datos" style={{ 
          color: '#0070f3', 
          textDecoration: 'none',
          padding: '10px 20px',
          border: '1px solid #0070f3',
          borderRadius: '5px',
          marginRight: '10px'
        }}>
          📋 Ver Datos
        </a>
        <a href="/" style={{ 
          color: '#28a745', 
          textDecoration: 'none',
          padding: '10px 20px',
          border: '1px solid #28a745',
          borderRadius: '5px'
        }}>
          🏠 Dashboard
        </a>
      </div>
    </div>
  )
}