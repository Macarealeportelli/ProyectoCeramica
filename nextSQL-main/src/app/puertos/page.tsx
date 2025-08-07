export default function PuertosPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px' }}>
      <h1>🌐 Configuración de Puertos para Múltiples Instancias</h1>
      
      <div style={{ 
        backgroundColor: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>📋 Opciones para ejecutar múltiples instancias simultáneas:</h2>
      </div>

      {/* Opción 1: Cambiar puerto en package.json */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h3>🔧 Opción 1: Modificar package.json (Permanente)</h3>
        <p><strong>Archivo:</strong> <code>package.json</code></p>
        <div style={{ backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <strong>Cambiar de:</strong>
          <pre style={{ margin: '5px 0' }}>{`"scripts": {
  "dev": "next dev --turbopack"
}`}</pre>
          <strong>A:</strong>
          <pre style={{ margin: '5px 0' }}>{`"scripts": {
  "dev": "next dev --turbopack -p 3001"
}`}</pre>
        </div>
        <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px' }}>
          <strong>✅ Ventajas:</strong> Configuración permanente, fácil de recordar<br/>
          <strong>❌ Desventajas:</strong> Requiere modificar el archivo, solo un puerto fijo
        </div>
      </div>

      {/* Opción 2: Comando directo */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h3>⚡ Opción 2: Comando directo (Temporal)</h3>
        <p><strong>En terminal:</strong></p>
        <div style={{ backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <pre>{`# Para puerto 3001
npm run dev -- -p 3001

# Para puerto 3002
npm run dev -- -p 3002

# Para puerto 4000
npm run dev -- -p 4000`}</pre>
        </div>
        <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px' }}>
          <strong>✅ Ventajas:</strong> No modifica archivos, flexible, múltiples puertos<br/>
          <strong>❌ Desventajas:</strong> Hay que recordar el comando cada vez
        </div>
      </div>

      {/* Opción 3: Scripts múltiples */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h3>🎯 Opción 3: Scripts múltiples en package.json (Recomendado)</h3>
        <p><strong>Modificar package.json para agregar múltiples scripts:</strong></p>
        <div style={{ backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <pre>{`"scripts": {
  "dev": "next dev --turbopack",
  "dev:3001": "next dev --turbopack -p 3001",
  "dev:3002": "next dev --turbopack -p 3002",
  "dev:4000": "next dev --turbopack -p 4000",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}`}</pre>
        </div>
        <p><strong>Luego ejecutar:</strong></p>
        <div style={{ backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <pre>{`npm run dev        # Puerto 3000 (default)
npm run dev:3001   # Puerto 3001
npm run dev:3002   # Puerto 3002
npm run dev:4000   # Puerto 4000`}</pre>
        </div>
        <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px' }}>
          <strong>✅ Ventajas:</strong> Múltiples opciones predefinidas, fácil de usar, organizado<br/>
          <strong>❌ Desventajas:</strong> Requiere modificar package.json una vez
        </div>
      </div>

      {/* Opción 4: Variables de entorno */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h3>🔐 Opción 4: Variables de entorno</h3>
        <p><strong>Crear archivo .env.local con:</strong></p>
        <div style={{ backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <pre>{`PORT=3001`}</pre>
        </div>
        <p><strong>O ejecutar directamente:</strong></p>
        <div style={{ backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <pre>{`# Windows PowerShell
$env:PORT=3001; npm run dev

# Windows CMD
set PORT=3001 && npm run dev`}</pre>
        </div>
        <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px' }}>
          <strong>✅ Ventajas:</strong> Configuración por entorno<br/>
          <strong>❌ Desventajas:</strong> Más complejo, puede interferir con otras configuraciones
        </div>
      </div>

      {/* Ejemplo práctico */}
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>🚀 Ejemplo práctico para ejecutar 3 instancias simultáneas:</h3>
        <div style={{ backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '5px' }}>
          <pre>{`# Terminal 1 (Puerto 3000 - Instancia principal)
npm run dev

# Terminal 2 (Puerto 3001 - Instancia de pruebas)
npm run dev -- -p 3001

# Terminal 3 (Puerto 3002 - Instancia de desarrollo)
npm run dev -- -p 3002`}</pre>
        </div>
        <p style={{ marginTop: '15px' }}>
          <strong>URLs resultantes:</strong><br/>
          • <a href="http://localhost:3000" target="_blank" style={{ color: '#0070f3' }}>http://localhost:3000</a> - Instancia principal<br/>
          • <a href="http://localhost:3001" target="_blank" style={{ color: '#0070f3' }}>http://localhost:3001</a> - Instancia de pruebas<br/>
          • <a href="http://localhost:3002" target="_blank" style={{ color: '#0070f3' }}>http://localhost:3002</a> - Instancia de desarrollo
        </p>
      </div>

      {/* Consideraciones importantes */}
      <div style={{ 
        backgroundColor: '#f8d7da', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #f5c6cb'
      }}>
        <h3>⚠️ Consideraciones importantes:</h3>
        <ul>
          <li><strong>Base de datos:</strong> Todas las instancias compartirán la misma base de datos SQL Server</li>
          <li><strong>Archivos:</strong> Los cambios en archivos afectarán a todas las instancias (hot reload)</li>
          <li><strong>Memoria:</strong> Cada instancia consume memoria adicional</li>
          <li><strong>Puertos:</strong> Asegúrate de que los puertos no estén en uso por otras aplicaciones</li>
          <li><strong>Variables de entorno:</strong> Todas las instancias usarán el mismo .env.local</li>
        </ul>
      </div>

      {/* Comandos útiles */}
      <div style={{ 
        backgroundColor: '#e2e3e5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>🛠️ Comandos útiles:</h3>
        <div style={{ backgroundColor: '#e8e8e8', padding: '15px', borderRadius: '5px' }}>
          <pre>{`# Verificar qué puertos están en uso
netstat -an | findstr :3000
netstat -an | findstr :3001

# Matar proceso en puerto específico (si es necesario)
# Primero encontrar el PID:
netstat -ano | findstr :3000
# Luego matar el proceso:
taskkill /PID <numero_pid> /F`}</pre>
        </div>
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