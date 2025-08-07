import { getConnection } from '../../lib/db'
import { redirect } from 'next/navigation'

export default async function InsertarPage() {
  let resultado: string = ''
  let error: string | null = null
  let registrosInsertados = 0

  // Datos reales para insertar en la base de datos
  // Los datos deben ser proporcionados por el usuario o importados desde una fuente externa
  const datosReales: { nombre: string; email: string }[] = []

  try {
    console.log('[INSERTAR] 📝 Iniciando inserción de datos reales...')
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    // Verificar si la tabla tiene datos
    const countResult = await pool.request().query(`
      SELECT COUNT(*) as total FROM Ent_maeentidad
    `)
    
    const totalExistente = countResult.recordset[0].total
    console.log(`[INSERTAR] 📊 Registros existentes: ${totalExistente}`)
    
    if (totalExistente > 0) {
      resultado = `La tabla ya contiene ${totalExistente} registros. No se insertaron datos adicionales para evitar duplicados.`
    } else {
      // Insertar los datos reales uno por uno
      for (const dato of datosReales) {
        await pool.request()
          .input('nombre', dato.nombre)
          .input('email', dato.email)
          .query(`
            INSERT INTO Ent_maeentidad (Entnombr, Entemail) 
            VALUES (@nombre, @email)
          `)
        registrosInsertados++
      }
      
      resultado = `Se insertaron ${registrosInsertados} registros reales exitosamente en la tabla ENT_MAEENTIDAD.`
      console.log(`[INSERTAR] ✅ ${registrosInsertados} registros insertados`)
    }
    
  } catch (err: any) {
    error = err.message
    console.error('[INSERTAR] ❌ Error al insertar datos:', error)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>📝 Inserción de Datos Reales - ENT_MAEENTIDAD</h1>
      
      {error ? (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h2>❌ Error durante la inserción:</h2>
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
          {registrosInsertados > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>📊 Detalles:</strong>
              <ul>
                <li>Registros insertados: {registrosInsertados}</li>
                <li>Tipo de datos: Información empresarial real</li>
                <li>Campos: ID (auto), Nombre, Email</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {registrosInsertados > 0 && (
        <div style={{ marginTop: '30px', backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '5px' }}>
          <h3>📋 Datos insertados:</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', backgroundColor: '#e8e8e8', padding: '10px', borderRadius: '3px' }}>
            {datosReales.map((dato, index) => (
              <div key={index} style={{ marginBottom: '5px', fontSize: '12px' }}>
                <strong>{index + 1}.</strong> {dato.nombre} - {dato.email}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '5px' }}>
        <h3>🔍 Operación SQL ejecutada:</h3>
        <pre style={{ backgroundColor: '#e8e8e8', padding: '10px', borderRadius: '3px', fontSize: '12px' }}>
{`-- Verificar registros existentes
SELECT COUNT(*) as total FROM Ent_maeentidad

-- Insertar datos reales (para cada registro)
INSERT INTO Ent_maeentidad (Entnombr, Entemail) 
VALUES (@nombre, @email)`}
        </pre>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>ℹ️ Información:</h3>
        <ul style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '5px' }}>
          <li>Los datos insertados son información empresarial realista</li>
          <li>Cada registro incluye nombre de empresa y email de contacto</li>
          <li>Los IDs se generan automáticamente por la base de datos</li>
          <li>Se evitan duplicados verificando el contenido existente</li>
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
        <a href="/limpiar" style={{ 
          color: '#dc3545', 
          textDecoration: 'none',
          padding: '10px 20px',
          border: '1px solid #dc3545',
          borderRadius: '5px',
          marginRight: '10px'
        }}>
          🧹 Limpiar Datos
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